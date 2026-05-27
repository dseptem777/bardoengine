# BardoEngine — Security & Encryption Threat Model

## What this is

BardoEngine ships compiled Ink stories (`.enc` files) encrypted inside the Tauri binary bundle.
The encryption pipeline is **obfuscation-grade hardening**, not DRM.

Its goal is to raise the cost of casual story extraction from ~30 seconds (`strings | grep`) to
several hours of active reverse engineering. It is not designed to stop a determined attacker with
a debugger and unlimited time.

---

## Hardening layers (v2 pipeline, as of 2026-04-29)

| Layer | Mechanism | Benefit |
|-------|-----------|---------|
| 1 | Key material split across `BARDO_SECRET_A` + `BARDO_SECRET_B`, each XOR'd with a distinct compile-time mask | No single 32-byte blob appears in `.text` or `.rdata`; `strings \| grep` finds nothing useful |
| 2 | HKDF-SHA256 derivation (salt + `bardoengine/centinelas/v1` info string) | The raw env-var bytes are never the AES key; attacker must reproduce the full KDF |
| 4 | Pre-AES ChaCha20 keystream XOR over the ciphertext blob, keyed by `BARDO_OBFUSCATION_SEED` | A tool that cracks Layer 1+2 and tries AES-GCM directly still gets garbage; needs a third secret |
| 5 | `zeroize` crate clears key material and plaintext buffers in Rust after use | Reduces plaintext exposure in memory dumps taken during decryption |

### Layer 3 status: deliberately omitted

Self-binary hashing (PE section hash as a KDF input) was evaluated and skipped. The operational
complexity of a two-pass build pipeline (cargo build → extract section hash → re-encrypt → tauri
bundle) introduces more risk of build errors than security benefit over Layers 1+2+4.
The 80% of value is in Layers 1+2+4. Layer 3 can be revisited if the threat model escalates.

---

## Blob format

```
base64( IV[12] | AuthTag[16] | ChaCha20_XOR( AES-GCM-ciphertext ) )
```

The blob is stored in `src-tauri/resources/<story-id>.enc`.

---

## What this protects against

- **Casual extraction**: `strings game.exe | grep -aE '.{32}'` — finds no AES key literals.
- **Script-kiddie AES brute attempts**: there is no raw key in the binary to feed into a naive
  decryption script.
- **Single-secret exposure**: compromising only `BARDO_SECRET_A` or only `BARDO_SECRET_B` is not
  sufficient to derive the AES key (HKDF requires both).
- **AES-only tools**: even with the correct AES key, the ciphertext blob is pre-XOR'd with a
  ChaCha20 keystream — the AES decryption will produce garbage without `BARDO_OBFUSCATION_SEED`.

---

## What this does NOT protect against

- **Determined reverse engineers**: a debugger breakpoint on `decrypt_story_content` return value
  recovers the plaintext JSON in memory regardless of how many layers protect the key.
- **Runtime memory dumps**: the `zeroize` layer reduces the window, but a dump taken during or just
  after decryption may still contain the story text in JS heap (React holds it in component state).
- **Source repo access**: the repo is private; if it becomes public, the `.ink` source is exposed
  directly and encryption is moot.
- **Build environment compromise**: an attacker with access to the CI/build machine that has the
  three env vars can reproduce the entire pipeline offline.
- **Side-channel or static binary analysis by experts**: given enough time and tooling (Ghidra,
  Binary Ninja, custom scripts), a skilled reverse engineer can reconstruct the KDF and recover
  all key material from the binary.

---

## Operational notes

### Required env vars

| Variable | Size | Role |
|----------|------|------|
| `BARDO_SECRET_A` | 64 hex chars (32 bytes) | Primary key half |
| `BARDO_SECRET_B` | 64 hex chars (32 bytes) | Secondary key half |
| `BARDO_OBFUSCATION_SEED` | 64 hex chars (32 bytes) | ChaCha20 obfuscation layer |

All three must be present **both** at `cargo build` time (baked into the binary via `env!()`)
**and** at `npm run encrypt-story` time (used by the Node.js encrypt script).

**Single source of truth:** place them in `.env` at the repo root. `build.rs` loads `.env`
automatically via the `dotenvy` crate, so `cargo build`, `npm run tauri:build`,
`npm run tauri:dev`, and `npm run build-game` all work without any shell exports.
CI environments can still inject them as real env vars — `.env` loading is silent/optional.

### Secret origin: HKDF-from-master model

Since the DRM v3 pipeline, the three env vars are **not stored directly**. Instead they are
derived deterministically via HKDF-SHA256 from a single master secret stored in `.env.master`:

```
BARDO_MASTER_SECRET=<64 hex chars>   # 32 random bytes, kept in your secrets vault
```

Derivation sketch (executed by `scripts/build-game.cjs`):
- `BARDO_SECRET_A`         = HKDF(master, salt="bardo/secret-a",    info=minorTag, len=32)
- `BARDO_SECRET_B`         = HKDF(master, salt="bardo/secret-b",    info=minorTag, len=32)
- `BARDO_OBFUSCATION_SEED` = HKDF(master, salt="bardo/obfuscation", info=minorTag, len=32)

where `minorTag` = `"X.Y.0"` (e.g. `"0.27.0"` for any `0.27.x` release).

**Key properties:**
- Any machine with `.env.master` can rebuild any version — no per-minor files to lose.
- Bumping the minor version changes `minorTag` → all three secrets rotate automatically.
- `.env.master` is gitignored. Back it up in a personal secrets vault.

### Bootstrapping

```bash
npm run drm:init        # writes .env.master (fails if already exists)
```

### Rotating secrets

To rotate to a new master (e.g. after vault compromise):
1. `rm .env.master` then `npm run drm:init` to generate a new master.
2. Bump the minor version (`0.27.x` → `0.28.0`) so the new master + new minorTag together
   produce fresh secrets that differ from any prior binary.
3. Re-encrypt: `npm run encrypt-story <story-id>`.
4. Rebuild: `npm run tauri:build`.
5. Distribute new binary. Old binaries will not decrypt the new `.enc`.

### Legacy `BARDO_ENCRYPTION_KEY`

The v1 single-key pipeline has been removed. Any `.enc` files produced by the old pipeline are
incompatible with the v2 Rust decoder. Re-encrypt all stories before shipping.

---

## Responsible disclosure

This project is a creative tool for interactive fiction, not a financial or safety-critical system.
Security issues can be reported to the maintainer directly. There is no bug bounty program.
