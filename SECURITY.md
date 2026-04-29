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

### Generating secrets

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# or
openssl rand -hex 32
```

### Rotating secrets

1. Generate three new values.
2. Update your `.env` (not committed) and any CI secrets.
3. Run `npm run encrypt-story <story-id>` to produce a new `.enc`.
4. Run `cargo build --release` (or `npm run tauri:build`) to embed the new secrets.
5. Distribute the new binary. Old binaries with old secrets will not decrypt the new `.enc`.

### Legacy `BARDO_ENCRYPTION_KEY`

The v1 single-key pipeline has been removed. Any `.enc` files produced by the old pipeline are
incompatible with the v2 Rust decoder. Re-encrypt all stories before shipping.

---

## Responsible disclosure

This project is a creative tool for interactive fiction, not a financial or safety-critical system.
Security issues can be reported to the maintainer directly. There is no bug bounty program.
