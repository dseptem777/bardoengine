# Project Review — BardoEngine — 2026-04-29

## Executive Summary
BardoEngine is feature-rich and largely production-quality, but **not shippable today**. Two blockers dominate: ~28 audio assets referenced in `centinelas.ink` are missing from `public/sounds/` and `public/music/`, and the version metadata is split three ways (engine `0.23.0`, Tauri `0.18.2`, story config `0.18.2`). Beyond the blockers, several CRITICAL functional bugs in `centinelas.ink` (cap3 keymash format wrong, hub-choice softlock at `misiones_completadas >= 2`, crawl/apnea result-knot race) will surface in real playtests, and the Tauri WebView ships with `csp: null` plus a compile-time encryption key. Engine architecture is solid; the last-mile gaps are content/release-hygiene and a handful of high-impact bugs.

## Critical Issues

1. **~28 audio assets referenced in `centinelas.ink` are missing from `public/`**
   - Missing SFX (in `public/sounds/`): `tension`, `golpe`, `explosion_magica`, `pasos_monstruo`, `rugido_monstruo`, `vidrio_roto`, `disparo`, `aterrizaje`, `magia_hex`, `caja_fuerte`, `puerta`, `puerta_secreta`, `magia_oscura`, `crasheo`, `disparos_escopeta`, `puerta_destruida`, `jumpscare`, `clic_arma`, `explosion`, `boladefuego`, `sal_romperse`, `trueno_lejano`, `trueno_cercano`, `susurro_multiple`, `canto_gutural`
   - Missing music (in `public/music/`): `campo_ambient`, `boveda_ambient`, `rave_electronic`
   - Howler will silently fail; multiple horror beats lose their audio cue.
   - **Fix:** Generate via the prompts in `memory/sfx-prompts.md` / `memory/music-prompts.md` and commit before tag.

2. **Version split — installer will ship as `0.18.2` while engine is `0.23.0`** *(Release Manager + CTO)*
   - `package.json:4` → `0.23.0`; `src-tauri/tauri.conf.json` → `0.18.2`; `src/stories/centinelas.config.json:8` → `0.18.2`; `CHANGELOG.md` latest entry is `0.22.x`.
   - Players will see no version change after update; no release notes for `0.23.0`.
   - **Fix:** Pick canonical (engine `0.23.0`, Centinelas `0.19.0`), bump `tauri.conf.json` + config, add `## v0.23.0` to engine `CHANGELOG.md` and Centinelas changelog.

3. **Cap3 `keymash` MINIGAME tags use legacy format — minigames never start, result branch always loses**
   - `centinelas.ink:4840, 4859, 4879, 4943` → `# MINIGAME: keymash key=space duration=6000 threshold=18`
   - `parseMinigameTag` routes to `parseNewFormat` (because of `=`), but no `type=` key → `config.type = null` → returns null → tag falls through to `triggerVFX`. Minigame never spawns; the next-line `{ minigame_result == 1 }` reads stale `-1`, sending players straight to the damage branch every time.
   - **Fix:** Convert to `# MINIGAME: type=keymash, key=SPACE, timeLimit=6, count=18, autostart=true, result=<result_knot>` and add result knots.

4. **Hub choices softlock when `misiones_completadas >= 2`**
   - `centinelas.ink:536-552` — choices `inter_tarot` and `inter_jesus` gate with `# REQUIRES: misiones_completadas >= 1`, but the inner conditional only branches `== 1`. After completing 2+ missions the choice is still selectable; selecting it produces no text and no choices — soft-lock.
   - **Fix:** Add `else` branches or change condition to `== 1`.

5. **Tauri `security.csp: null` — WebView runs unrestricted**
   - `src-tauri/tauri.conf.json` → `"csp": null`. Any XSS via story text could reach `invoke()` and cross into Rust commands.
   - **Fix:** Set `"csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src 'self' data: blob:"`.

6. **AES-256-GCM key embedded as compile-time string in the binary**
   - `src-tauri/src/crypto.rs:7` — `env!("BARDO_ENCRYPTION_KEY", ...).as_bytes()`.
   - `strings binary.exe | grep -aE '.{32}'` recovers the key; entire story-encryption model defeated offline.
   - **Fix:** Either derive per-install (machine secret + KDF) or document the threat model and stop pretending the encryption is anti-piracy.

## High Priority

7. **Save/load mid-genjutsu leaves typing state inert → permanent softlock**
   - `useBardoEngine.ts:~1004` — `loadSave` restores `genjutsuBreak` but never re-fires `onGenjutsuTypingComplete`, so `genjutsuTextReady` stays false. Player loads into a visible fisura that doesn't tick down and isn't clickable.
   - **Fix:** Replay the typing-complete signal on restore.

8. **`makeChoice` autosaves past pending minigame tags**
   - `useBardoEngine.ts:886-891` — autosaves whenever `newText && !storyEnded`, but doesn't check whether the just-emitted tags include a `MINIGAME` (unlike `continueStory:693`). Loading that save skips the minigame entirely.
   - **Fix:** Mirror the minigame-pending guard from `continueStory`.

9. **Crawl/Apnea result knot races with inline divert**
   - `centinelas.ink:1065-1072` — tag has `result=keymash_arrastre_resultado` AND the next line is `-> keymash_arrastre_resultado`. `ChoosePathString` plus inkjs's own pointer advance can run the result knot twice or read stale `minigame_result`.
   - **Fix:** Remove the explicit divert when `result=` is present.

10. **`useBardoEngine.ts` is a 1153-line god hook**
    - 57 `useEffect`/`useCallback`/`useMemo` calls; one invalidated dep cascades through audio, persistence, minigame, and tag routing.
    - **Fix:** Extract `useAudioWiring`, `useMinigameLifecycle`, `usePersistence`; the orchestrator should compose, not own.

11. **3 high-severity npm vulnerabilities**
    - `npm audit` → high: 3, moderate: 4. Tauri ships a WebView; bundled JS is the attack surface.
    - **Fix:** `npm audit fix`, review remaining, pin/replace before tag.

12. **Engine branding + version leak into shipped Centinelas builds**
    - `Player.jsx:326-329` falls back to `BARDO ENGINE v0.23.0`; `StartScreen.jsx:128` shows "Powered by BardoEngine".
    - **Fix:** Hide `<h1>` when `gameTitle` is unset; gate "Powered by" behind dev flag.

13. **`SPIDER_DIFFICULTY` tag is unhandled**
    - `centinelas.ink:2089` emits `# SPIDER_DIFFICULTY: fast`; no matching handler in `useTagProcessor.ts` / `useSpiderInfestation`.
    - **Fix:** Implement the handler or remove the tag (Engine ↔ Ink completeness rule).

14. **`localStorage.setItem` failures swallowed in `useSaveSystem`**
    - Quota exhaustion silently logs and returns; UI shows nothing. With ten Ink-snapshot slots, hitting 5 MB is plausible.
    - **Fix:** Surface a toast; consider IndexedDB.

15. **Ink compiler dynamically imported on UI thread per `.ink` drop**
    - `App.jsx` `handleImportInk` — ~2 MB module parsed on the main thread; freezes the window for large stories.
    - **Fix:** Web Worker or Tauri sidecar.

## Medium Priority

16. **`SPIDER_CHECK` 2 s auto-choice timer fires regardless of current choice set**
    - `useBardoEngine.ts:348-353` — `makeChoiceRef.current(0)` after 2000 ms with no `choices.length` re-check. Player who advances within the window gets a wrong-branch click.
    - **Fix:** Re-validate choices at fire time.

17. **`CHAPTER_BREAK` image breaks if entered before `apodo_personaje` set**
    - `centinelas.ink:503` — `image={habitacion_img}.jpg` resolves to `/games/centinelas/.jpg` when debug-spawning to `intermision`.
    - **Fix:** Add a default `habitacion_img` value.

18. **Double `inputReplayingRef` between `useStoryState` and `useBardoEngine`**
    - Rapid double-`commitInput` can leave storyState's ref stuck `true`, causing the next `continueStory` to skip the input break and render raw `{variable}` placeholder.

19. **`useAudio` SFX cache grows unbounded**
    - `Howl` instances cached per-id, never evicted. Long sessions accumulate decoded buffers.
    - **Fix:** LRU cap (~20) with `sound.unload()` on eviction.

20. **`MOUSE_RESISTANCE: extreme` not implemented**
    - `centinelas.ink:3440-3442` — `useHeavyCursor` only knows `low/medium/high/none`; the hardest WP challenge silently has no resistance.

21. **`# stop_music` (lowercase) likely unrecognized by `vfxRegistry`**
    - `centinelas.ink:3278, 4820` — verify or replace with the canonical `music:stop` form.

22. **`CrawlGame.jsx` exists but isn't in `minigameRegistry.js`**
    - Either register `crawl` or delete the dead component.

23. **100 `console.log` calls in production source**
    - Story content + audio paths leak to DevTools.
    - **Fix:** Route through `src/utils/logger.js`; add `esbuild.drop: ['console']` to `vite.config`.

24. **`fs:allow-write-text-file` Tauri capability appears unused**
    - Saves use `localStorage`. Audit Rust `invoke` handlers and revoke if no writes happen.

25. **No integration test for `invoke('decrypt_story')` round-trip**
    - All 61 tests run in jsdom; the production decryption path isn't exercised by CI.

## Low Priority

26. **Bundle ~835 kB unminified / 258 kB gz, no code splitting**
    - Hurts Android cold-start. `manualChunks` for inkjs + editor + minigames.

27. **Cap3 willpower `WILLPOWER_START` at knot-level vs choice-line**
    - Behavior is correct (start is global), but document it so future authors don't mistake it for a REQUIRES violation.

28. **Double `# next` on `centinelas.ink:516-517`**
    - Produces an empty continue prompt — minor UX jank.

## Release Readiness
**Not shipping today.** Two true blockers: missing audio assets (#1) and the three-way version mismatch (#2). After those, fix the cap3 keymash format (#3) and the hub softlock (#4) before any external playtest — these are first-hour bugs anyone will hit. Set the CSP (#5) and decide the encryption-key story (#6) before public release. Shortest path to ship: 1-day content sprint (audio + version bump + CHANGELOG + four ink fixes + CSP), then re-run `npm run build`, `npm run test:run`, `node compile-ink.cjs centinelas.ink src/stories/centinelas.json`, and a full Centinelas playthrough.

## Top Recommendations
1. **Generate and commit the missing 25 SFX + 3 music files** — unblocks shipping; ~half-day with the existing prompt sheets. (impact: high / complexity: low–medium)
2. **Bump versions in lockstep and write the `0.23.0` CHANGELOG entries** — required for any tagged release. (high / trivial)
3. **Fix the four `centinelas.ink` bugs (#3, #4, #9, #13)** — first-hour player-blocking issues; one focused authoring pass. (high / low)
4. **Set Tauri CSP and audit the encryption-key threat model** — the only remotely exploitable engine issues. (high / low)
5. **Refactor `useBardoEngine.ts` into composed sub-hooks** — pays back every future bugfix and unblocks the autosave/genjutsu-restore fixes (#7, #8). (high / medium)

## Review Metadata
- Reviewed by: CTO, QA/Playtester, Release Manager agents (Sonnet) + Opus synthesis
- Date: 2026-04-29
- Files analyzed: ~140 source files + `centinelas.ink` (~5 k lines) + Tauri config + package manifests
- Issues found: 6 critical, 9 high, 10 medium, 3 low
