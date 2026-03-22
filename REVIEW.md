# Project Review — BardoEngine v0.14.0 — 2026-03-22

## Executive Summary

BardoEngine is a well-architected interactive fiction engine with solid separation of concerns and a comprehensive test suite (587 tests). The v0.14.0 UI/UX overhaul (Stages 2–7) is clean and well-executed. However, several state management bugs exist in the minigame/audio subsystems that can cause story freezes, double-advances, and music interruptions during gameplay. The Centinelas flagship story is missing all 19 referenced SFX files, which will cause silent failures during playback. These are the primary risks for a demo or release.

## Critical Issues

1. **MinigameOverlay double `onFinish` — click-to-dismiss races with auto-dismiss timeout**
   - `src/components/MinigameOverlay.jsx:54-58,137-142`
   - The result screen has both a 1500ms `setTimeout` calling `onFinish(numericResult)` and an `onClick` handler calling `onFinish(result)`. If the user clicks before 1500ms elapses, `onFinish` fires twice — advancing the story by two beats and potentially corrupting game state.
   - Fix: Clear the timeout when the click handler fires, or use a `hasCommitted` ref guard.

2. **`cancelGame()` deadlocks the story permanently**
   - `src/hooks/useMinigameController.js:66-70`
   - `cancelGame()` resets minigame state to idle but never calls `onResultCommit` or `continueStory`. The Ink story remains frozen with no way forward. Triggered when an unrecognized minigame type renders ("not implemented" screen → Close button).
   - Fix: `cancelGame` should set `minigame_result = 0` and call `onResultCommit` to resume the story.

3. **`stopMusic` fade-out race condition — new track gets killed**
   - `src/hooks/useAudio.js:214-232`
   - `stopMusic(fadeOut=true)` schedules a `setTimeout` that reads `musicRef.current` after 1000ms. If `playMusic('new_track')` is called within that window, the timeout stops and unloads the *new* track. Sequence: `stopMusic()` → `playMusic()` < 1s → new music dies.
   - Fix: Capture `const currentMusic = musicRef.current` before the setTimeout closure, or clear the timeout on new `playMusic`.

4. **ExtrasMenu.handleClose stops game music even if Jukebox was never opened**
   - `src/components/ExtrasMenu.jsx:43-47`
   - `handleClose` unconditionally calls `stopMusic()`. If a player opens Extras mid-game (from Start Screen or future in-game access) and closes without touching Jukebox, the background game music stops and never resumes.
   - Fix: Only call `stopMusic()` if the Jukebox was actually used (track `playingTrack` state, or move stop logic to JukeboxPage cleanup).

## High Priority

5. **QTEGame calls `finish()` inside React state updater — unsafe in StrictMode/concurrent mode**
   - `src/components/minigames/QTEGame.jsx:44-48`
   - `finish(false)` is called inside `setTimeLeft(prev => { ...; finish(false); return 0 })`. State updaters must be pure functions — side effects here can cause double `onFinish` calls in React StrictMode.
   - Fix: Use a `useEffect` watching `timeLeft <= 0` to trigger `finish`, or set a ref flag.

6. **Spider `gameLoop` mutates objects in-place before `setSpiders`**
   - `src/hooks/useSpiderInfestation.js:148-182`
   - Spider objects are mutated directly (`spider.x += ...`) then spread into a new array. Since the object references are the same, React may skip re-renders, causing spiders to visually freeze.
   - Fix: Create new spider objects in the loop: `{ ...spider, x: spider.x + dx }`.

7. **`SPIDER_CHECK` auto-choice timeout fires after story reset**
   - `src/hooks/useBardoEngine.ts:229-236`
   - `handleSpiderCheck` sets a 2-second `setTimeout` that calls `makeChoiceRef.current(0)`. If the player navigates to menu within 2 seconds, the timer fires against the wrong story state.
   - Fix: Check `activeRef.current` inside the timeout callback before making the choice, or clear pending timers in `backToStart`.

8. **`KeyMashGame` re-registers key handler on every keypress**
   - `src/components/minigames/KeyMashGame.jsx:86-127`
   - `useEffect` dependency on `currentCount` means the event listener is torn down and re-added on every key press. Fast typing can miss key events in the gap.
   - Fix: Use a ref for `currentCount` in the handler, remove `currentCount` from the dependency array.

9. **19 missing SFX files for Centinelas** (Release Manager)
   - `centinelas.ink` references 19 `play_sfx:` tags (aterrizaje, caja_fuerte, clic_arma, crasheo, disparo, disparos_escopeta, explosion, explosion_magica, golpe, jumpscare, magia_hex, magia_oscura, pasos_monstruo, puerta, puerta_destruida, puerta_secreta, rugido_monstruo, tension, vidrio_roto) — none exist in `public/sounds/`.
   - Impact: All sound effects in the story are silently missing. No crash, but significant demo impact.
   - Fix: Source or generate the 19 SFX files and place in `public/sounds/`.

## Medium Priority

10. **`useThemeManager` cleanup causes loading flash on story switch**
    - `src/hooks/useThemeManager.ts:92-97`
    - Cleanup sets `isThemeReady=false`, causing a brief "Cargando..." flash when returning to story selector. Purely visual, ~200ms.
    - Fix: Skip `setIsThemeReady(false)` in cleanup, or only show loading on initial mount.

11. **`processStoryLoop` catch block continues with partial state**
    - `src/hooks/useStoryState.ts:85-88`
    - When Ink throws mid-loop, the error is appended to text, but `choices` and `canContinue` may be in invalid states. Subsequent interaction could crash.
    - Fix: In the catch block, also set `isEnded=true` and clear `choices` to prevent further interaction.

12. **`InputOverlay` has no cancellation path — mid-input quit + restart can create dead-end**
    - `src/components/InputOverlay.jsx:33-36`
    - If the app is force-quit while InputOverlay is open, and autosave captured a post-tag state, the restored story may be stuck with `canContinue=false` and no choices.
    - Fix: Either save before the input tag (not after), or provide a fallback value on restore.

13. **`SaveLoadModal` allows saving during active minigame**
    - `src/App.jsx:553`
    - Saving mid-minigame captures pre-minigame Ink state. Loading this save re-triggers the minigame but `minigameStateSnapshotRef` (memory-only) is null, potentially causing wrong story branch.
    - Fix: Disable save button while `minigameController.state !== 'idle'`.

14. **`App.jsx` double `useStoryLoader`**
    - `src/App.jsx:115,685`
    - `useStoryLoader` is called in both `App` and `AppContent`. In production mode, this invokes `decrypt_story` twice.
    - Fix: Remove the `useStoryLoader` call from the outer `App` component or pass results via props.

15. **`loadGameConfig` cache never invalidates in dev mode**
    - `src/config/loadGameConfig.js:40-43`
    - Module-level `configCache` persists across HMR. Config changes require full page reload.
    - Fix: Add `clearConfigCache()` call on HMR or story switch.

## Low Priority

16. **`useKeyboardNavigation` always ignores 'V' key regardless of willpower state**
    - `src/hooks/useKeyboardNavigation.js:37-44`
    - Stories without willpower can't use V for typewriter skip.
    - Fix: Only ignore V when willpower system is active.

17. **`useHeavyCursor` initializes with `window.innerWidth/Height` outside effect**
    - `src/hooks/useHeavyCursor.ts:50-51`
    - Can give wrong initial position on Tauri WebView before window is sized. Breaks in SSR/jsdom.
    - Fix: Initialize to `{ x: 0, y: 0 }`, set on first mousemove.

18. **`ApneaGame` raw AudioContext not managed by Howler**
    - `src/components/minigames/ApneaGame.jsx:115-173`
    - Separate AudioContext may be suspended on mobile focus loss without recovery.
    - Fix: Use Howler for the rumble synth, or add visibility change listener.

19. **`ErrorBoundary.handleGoToMenu` clears wrong localStorage key**
    - `src/components/ErrorBoundary.jsx:52-56`
    - Tries to clear `bardo_current_state` but saves are under `bardo_saves`. Error recovery doesn't clear problematic state.
    - Fix: Clear `bardo_saves` for the current story, or at minimum `bardo_autosave_*`.

20. **`useAchievements` calls `loadUnlocked()` twice on init**
    - `src/hooks/useAchievements.js:42-43`
    - Two `useState` initialisers both parse localStorage. Harmless but wasteful.
    - Fix: Cache the result in a local variable.

## Release Readiness

**Not ready for public release, but close.** The MinigameOverlay double-fire bug (#1) is a regression from Stage 5 that should be fixed immediately. The missing SFX files (#9) will be noticeable in any demo. The `stopMusic` race (#3) and ExtrasMenu music stop (#4) will annoy players.

**Shortest path to demo-ready:**
1. Fix #1 (MinigameOverlay timeout guard) — 5 min
2. Fix #4 (ExtrasMenu conditional stopMusic) — 5 min
3. Source/generate SFX files (#9) — 1-2 hours
4. Fix #3 (stopMusic fade race) — 10 min

## Top Recommendations

1. **Fix MinigameOverlay double-fire (Critical, ~5 min)** — Add a `hasCommittedRef` guard. This is a regression introduced in Stage 5 that affects every non-immersive minigame.

2. **Fix ExtrasMenu unconditional stopMusic (Critical, ~5 min)** — Only stop music when JukeboxPage was actually used. Currently breaks game music on any Extras menu visit.

3. **Source 19 missing SFX files (High, ~1-2 hours)** — Use AI SFX tools or free libraries. Every action scene in Centinelas is currently silent.

4. **Fix stopMusic fade race (High, ~10 min)** — Capture `musicRef.current` before the setTimeout. Prevents new tracks from being killed during transitions.

5. **Disable save during minigames (Medium, ~5 min)** — Guard the save button with `minigameController.state === 'idle'`. Prevents corrupt save states.

## Review Metadata
- Reviewed by: CTO, QA/Playtester, Release Manager agents (QA completed fully; CTO and Release Manager hit rate limits after thorough codebase analysis)
- Date: 2026-03-22
- Files analyzed: ~60+ source files across hooks, components, config, scripts
- Issues found: 4 Critical, 5 High, 6 Medium, 5 Low
