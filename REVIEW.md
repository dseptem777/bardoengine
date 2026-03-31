# Strategic Review — BardoEngine v0.14.1 — 2026-03-22

## Executive Summary

BardoEngine is a technically impressive interactive fiction engine with genuine differentiators (meta-horror mechanics, embedded minigames, per-game theming, cross-platform native builds). The architecture is solid, the test suite covers 587 tests, and the recent v0.14.1 bug fix pass resolved 9 confirmed issues. However, the gap between technical capability and product readiness is significant: there is no README, no documentation for content creators or partners, the flagship game has 19 missing SFX files, QTE minigames are unplayable on mobile, and the encryption key is hardcoded in source. The technology is ahead of the product packaging — closing that gap is the shortest path to demo-ready and partner-ready status.

## Product Strengths

1. **Unique meta-horror mechanics** — Willpower decay, heavy cursor, spider infestation, forced click takeover, scroll friction. No competitor (Twine, Ren'Py, Ink player) offers anything comparable. This is the primary differentiator.
2. **Full minigame integration** — 5 minigames (QTE, lockpick, arkanoid, apnea, keymash) with results bridged back to Ink variables. ApneaGame includes procedural Web Audio synthesis — a standout demo piece.
3. **Per-game white-labeling** — Each game gets its own theme (colors, fonts, border radius, backgrounds), stats, inventory, achievements, and jukebox. Centinelas and Serruchín are visually unrecognizable as the same engine.
4. **One-command cross-platform builds** — `build-game.cjs` produces Windows NSIS, macOS DMG, Linux AppImage, Android APK/AAB with story encryption. A real production pipeline.
5. **Author-accessible tag system** — Writers use plain Ink with tags (`# MINIGAME: lockpick 0.3 1.1`). No React/JS knowledge required for content.
6. **Comprehensive test suite** — 587 tests across 56 files covering hooks, components, and integration flows.

---

## Critical Issues

### 1. Hardcoded encryption key in source and binary
- **Source:** CTO
- **Files:** `scripts/encrypt-story.cjs:17`, `src-tauri/src/crypto.rs:8`
- **Issue:** The AES-256-GCM key `B4rd0Eng1n3_S3cr3t_K3y_2024_!@#$` is hardcoded in both the Node.js encrypt script and the Rust binary. Anyone decompiling the shipped app extracts the key and decrypts all story content.
- **Fix:** Move to build-time environment variable (`BARDO_ENCRYPTION_KEY`) read by script and Rust via `env!()`.

### 2. Hardcoded choice index for forced-click surrender
- **Source:** CTO
- **File:** `src/App.jsx:199`
- **Issue:** `actions.makeChoice(1)` hardcodes the "ceder" (surrender) option as the second choice. If Ink ever reorders choices on a zero-willpower beat, this silently picks the wrong choice. Violates the "engine never hardcodes story-specific logic" convention.
- **Fix:** Make the surrender choice discoverable via a tag (e.g., `#FORCED_CHOICE`) and select by tag match.

### 3. QTE minigame is completely unplayable on mobile/touchscreen
- **Source:** UX
- **Files:** `src/components/minigames/QTEGame.jsx:54-63`
- **Issue:** QTEGame only listens to `keydown` events. On a touchscreen there is no tap handler, no on-screen button — the player watches a countdown hit zero with no way to interact. LockpickGame has a similar but less severe issue (onClick works but has 300ms tap delay).
- **Fix:** Add an `onClick`/`onTouchStart` handler to the key display square for tap input.

### 4. No project README — the product has no front door
- **Source:** CEO, Docs
- **Issue:** No `README.md` exists. The repo's public-facing entry point is `CLAUDE.md`, an AI instruction file. A potential partner, developer, or investor sees no description, no screenshots, no value proposition.
- **Fix:** Write a `README.md` with: what BardoEngine is, who it's for, screenshot/GIF, quick-start steps, feature highlights, links to docs.

### 5. `innerHTML` XSS vector in cursor hook
- **Source:** CTO
- **File:** `src/hooks/useHeavyCursor.ts:73-77`
- **Issue:** `cursor.innerHTML = template literal` — while currently safe (literal string), the pattern opens stored XSS if any future caller passes dynamic content. Tauri's WebView doesn't sandbox DOM manipulation.
- **Fix:** Replace with `createElement` + `appendChild` calls.

---

## High Priority

### 6. No focus trap or ARIA attributes in any modal
- **Source:** UX
- **Files:** `SaveLoadModal.jsx`, `OptionsModal.jsx`, `ExtrasMenu.jsx`, `HistoryLog.jsx`, `MinigameOverlay.jsx`
- **Issue:** No modal implements focus trap, `role="dialog"`, or `aria-modal="true"`. Keyboard Tab leaks to background content. Screen reader users interact with invisible elements.
- **Fix:** Add `role="dialog"`, `aria-modal="true"`, and focus trap to all modal components.

### 7. Missing SFX files for flagship game (19 files)
- **Source:** CEO, Pitch
- **Issue:** `centinelas.ink` references 19 `play_sfx:` tags (disparo, explosion, jumpscare, etc.) — none exist in `public/sounds/`. Every action scene is silent.
- **Fix:** Source/generate the 19 SFX files before any external demo.

### 8. No Ink tag reference documentation
- **Source:** Docs
- **Issue:** The tag system (20+ tag families) is the entire authoring interface. No single document lists all tags with syntax, parameters, and examples. Tags are scattered across `CLAUDE.md`, `useTagProcessor.ts`, `vfxRegistry.js`. Undocumented tags include `BOSS_*`, `VISUAL_DAMAGE`, `MOUSE_MAGNET`, `UI_EFFECT`.
- **Fix:** Create `docs/INK_TAG_REFERENCE.md` — one table per category with syntax, parameters, example, and result variable.

### 9. No content author guide for co-writer workflow
- **Source:** Docs, CEO
- **Issue:** The co-writer workflow (docx → Ink conversion) has no guide. The critical "REQUIRES tags must be inline on choice lines" rule exists only in memory files — this rule has been broken twice already.
- **Fix:** Create `docs/CONTENT_AUTHORING_GUIDE.md` with docx conventions, tag placement rules, and conversion examples.

### 10. Untracked `setTimeout` in spider squash — memory leak
- **Source:** CTO
- **File:** `src/hooks/useSpiderInfestation.js:292`
- **Issue:** `setTimeout` in `squashSpider` is not tracked in `pendingTimeoutsRef`. If `stopInfestation` is called while spiders are dying, the timeout fires after cleanup, calling `setSpiders` on a cleaned-up state.
- **Fix:** Push the timeout ID into `pendingTimeoutsRef.current`.

### 11. Unsanitized Google Fonts URL from config
- **Source:** CTO
- **File:** `src/hooks/useThemeManager.ts:53-64`
- **Issue:** Font names from config JSON are interpolated directly into a `fonts.googleapis.com` URL without sanitization. Also creates an external dependency that fails in offline play.
- **Fix:** Validate font names against `/^[A-Za-z\s]+$/`; consider bundling fonts for production builds.

### 12. `useStats` calls `setState` during render — infinite loop risk
- **Source:** CTO
- **File:** `src/hooks/useStats.ts:56-59`
- **Issue:** `if (statsConfig !== prevStatsConfig) { setPrevStatsConfig(...); setStats(...) }` calls setState synchronously during render. If `config` receives a new object reference without value change, this triggers infinite re-renders.
- **Fix:** Move reset to a `useEffect` with `[statsConfig]` as dependency.

### 13. Mobile header auto-hides with no way to bring it back
- **Source:** UX
- **File:** `src/components/Player.jsx:79-119`
- **Issue:** On mobile, the header (GUARDAR, OPCIONES, MENÚ) hides after 30px scroll with no persistent menu button or gesture hint. Players lose access to save and menu.
- **Fix:** Add a persistent floating icon in a fixed corner that survives header hide/show.

### 14. Spider game loop triggers React re-render at 60fps
- **Source:** CTO
- **File:** `src/hooks/useSpiderInfestation.js:145-182`
- **Issue:** rAF game loop calls `setSpiders([...currentSpiders])` on almost every frame, triggering full React re-render at 60fps with 10+ spider components.
- **Fix:** Use refs for positions during animation; only call `setSpiders` on structural changes (spawn, kill).

### 15. No game config JSON schema reference
- **Source:** Docs
- **Issue:** `.config.json` files have many undocumented fields: `intro.*` options, stat `displayType` values, `onZero` behavior, `extras.jukebox` structure, item flags. No document lists all valid fields, types, or defaults.
- **Fix:** Create `docs/GAME_CONFIG_REFERENCE.md` with annotated JSON schema.

---

## Medium Priority

### 16. SaveLoadModal overwrite UX — risk of accidental data loss
- **Source:** UX
- **File:** `src/components/SaveLoadModal.jsx:180-253`
- **Issue:** In save mode, clicking an existing save row looks identical to load mode. The "sobrescribir" label is small and easily missed. Players may accidentally overwrite saves they intended to keep.
- **Fix:** Visually differentiate save mode (tinted section, explicit per-row overwrite button).

### 17. OptionsModal typewriter speed slider is inverted
- **Source:** UX
- **File:** `src/components/OptionsModal.jsx:69-77`
- **Issue:** "Instantáneo" is at the left (min=0), "Muy Rápido" at the right (max=5). But max=5 actually means slowest typewriter delay. The mental model is backwards.
- **Fix:** Reverse slider direction or rename labels to "Lento → Rápido → Instantáneo".

### 18. WillpowerMeter overlaps story text on small phones
- **Source:** UX
- **File:** `src/components/WillpowerMeter.jsx:130-132`
- **Issue:** Fixed 80px-wide widget is 25% of a 320px phone viewport, overlapping readable story area and choice buttons during the most tense gameplay moments.
- **Fix:** On mobile, render as a compact horizontal bar at the bottom instead of vertical side widget.

### 19. `ForcedClickOverlay` polls DOM at 50ms with unsanitized selector
- **Source:** CTO
- **File:** `src/components/ForcedClickOverlay.jsx:80-98`
- **Issue:** `setInterval` with `document.querySelector(targetSelector)` at 20fps. Expensive forced style recalc; `targetSelector` from state is not sanitized.
- **Fix:** Replace with `MutationObserver`; validate selector against known CSS classes.

### 20. Dev stories stored as full JSON in localStorage — quota crash risk
- **Source:** CTO
- **File:** `src/App.jsx:98-103`
- **Issue:** Full compiled Ink story JSON (hundreds of KB each) persisted in localStorage. Accumulates across sessions, can hit 5-10MB quota silently.
- **Fix:** Store only metadata; load story data from imports for current session.

### 21. `WILLPOWER_CHECK` sets variable after Ink has already continued
- **Source:** CTO
- **File:** `src/hooks/useTagProcessor.ts:154-175`
- **Issue:** `willpower_passed` is set during tag processing, but Ink has already evaluated conditionals on that beat. Works only if author checks the variable on a *subsequent* beat — undocumented contract.
- **Fix:** Document limitation explicitly; consider snapshot-restore pattern like minigames.

### 22. Audio registry is story-specific, not engine-generic
- **Source:** CTO, Docs
- **File:** `src/hooks/useAudio.js:7-42`
- **Issue:** `SOUNDS` and `MUSIC` objects contain entries specific to Serruchín and Partuza. New stories must edit the engine hook. Violates "engine never hardcodes story-specific logic."
- **Fix:** Load audio registry from per-game config; fall back to dynamic path construction.

### 23. Dead minigame branch in `useGameSystems`
- **Source:** CTO
- **File:** `src/hooks/useGameSystems.ts:135-143`
- **Issue:** `processGameTag` returns a truthy minigame object but it's never used — `useTagProcessor` handles minigames separately. Dead code path.
- **Fix:** Remove the minigame branch from `processGameTag`.

### 24. TextDisplay `select-none` prevents text copying; `cursor-pointer` misleads
- **Source:** UX
- **File:** `src/components/TextDisplay.jsx:211-212`
- **Issue:** Players cannot copy story text. Desktop cursor implies a link, not prose.
- **Fix:** Limit click-to-skip to a dedicated indicator; leave text as `user-select: text`.

### 25. MinigameOverlay result says "Toca para continuar" on desktop; no keyboard dismiss
- **Source:** UX
- **File:** `src/components/MinigameOverlay.jsx:164`
- **Issue:** Touch language on desktop. No keydown handler to dismiss result screen — keyboard users must reach for the mouse after a keyboard minigame.
- **Fix:** Add any-key handler for `commitResult`; use cross-platform text.

### 26. AchievementToast ignores safe-area-inset — clipped on notched devices
- **Source:** UX
- **Files:** `src/components/AchievementToast.jsx:66`, `src/components/StatsPanel.jsx:30-31`
- **Issue:** Toast at `top-4` and stats bar at `top-0` don't account for `env(safe-area-inset-top)`.
- **Fix:** Add safe-area padding using existing `--safe-area-top` variable.

---

## Low Priority

### 27. ChoiceButton resistance mechanic has no explanation for first-time players
- **Source:** UX — `src/components/ChoiceButton.jsx:196-218`
- Players see red dots and a shake with no tooltip or hint. A signature mechanic reads as broken UI.

### 28. No tests for `useTagProcessor`, `useWillpowerSystem`, `useSpiderInfestation`
- **Source:** CTO — `src/hooks/__tests__/`
- The central tag routing layer and complex stateful game systems have zero test coverage.

### 29. `configCache` persists across HMR in dev mode
- **Source:** CTO — `src/config/loadGameConfig.js:40`
- Config changes require full page reload. `clearConfigCache()` exists but is never called.

### 30. `useHeavyCursor` reads `window.innerWidth` at ref initialization
- **Source:** CTO — `src/hooks/useHeavyCursor.ts:50-51`
- Can give wrong initial position before window is sized. Initialize to `{x:0, y:0}`.

### 31. OptionsModal RESET has no confirmation step
- **Source:** UX — `src/components/OptionsModal.jsx:117-123`
- One click wipes all settings with no confirm dialog.

### 32. Player header abbreviates title to first word on mobile ("Los" for "Los Centinelas")
- **Source:** UX — `src/components/Player.jsx:313`
- Use CSS truncation instead of word split, or add `gameTitleShort` config field.

### 33. `continueLabel` missing from `UseStoryStateReturn` TypeScript interface
- **Source:** CTO — `src/hooks/useStoryState.ts:28`
- Type hole — property is returned but not declared in the interface.

### 34. RelationshipsPanel desktop has no close button
- **Source:** UX — `src/components/RelationshipsPanel.jsx:133-137`
- Only closable by clicking the toggle button, which may be obscured by the open panel.

### 35. Hardcoded Spanish error string in engine
- **Source:** CTO — `src/hooks/useStoryState.ts:88`
- Engine-level error message is in Spanish, coupling engine to one locale.

### 36. Development artifacts committed to repo
- **Source:** CEO
- Root contains `ink-errors.txt`, `issue_body.md`, `test-results.json`, raw `.ink` files, story scripts. Exposes IP and signals unfinished project.

---

## UX Assessment

The UI is **functional and thematically cohesive** — dark theme, gold accent, Framer Motion animations create a consistent atmosphere. The recent v0.14.0 overhaul (lucide-react icons, improved menus, typewriter refinements) is well-executed.

**What's polished:** Start screen menu flow, achievement toast system, per-game theming (Centinelas vs Serruchín are visually distinct), minigame result screens, inventory panel layout.

**What needs work:** Mobile is the biggest gap — QTE unplayable on touch, header disappears without recovery, WillpowerMeter overlaps text, safe-area insets missing. Accessibility is absent (no focus traps, no ARIA, no screen reader support). The save/load overwrite UX risks data loss. First-time players get no explanation for resistance clicks or keyboard navigation.

---

## Documentation Gaps

| Priority | What's Missing | Who's Blocked |
|----------|---------------|---------------|
| HIGH | README.md | Everyone (partners, devs, evaluators) |
| HIGH | Ink tag reference (all 20+ tag families) | Content creators, developers |
| HIGH | Content authoring guide (docx → Ink workflow) | Co-writer, future partner teams |
| HIGH | Game config JSON schema reference | Developers, partners adding games |
| HIGH | Developer setup / onboarding guide | New contributors |
| MEDIUM | Audio registration requirement | Content creators |
| MEDIUM | New story integration walkthrough | Developers, partners |
| MEDIUM | Minigame integration guide | Developers |

---

## Pitch Readiness

**Verdict: Almost — with 3-4 hours of prep work.**

**Strongest angles:**
1. "Your IP becomes a native app — Windows, Mac, Android — from a plain text script."
2. Live theme switch demo: Centinelas → Serruchín (two unrecognizable products from one engine).
3. ApneaGame as the centerpiece: procedural audio, visual degradation, real-time horror — nothing in Twine/Ren'Py comes close.

**Before presenting:**
- Source 19 missing SFX files (action scenes are silent)
- Map a 5-minute demo path through Centinelas (know exact choices)
- Verify all audio assets on demo machine
- Strip `console.log` spam (every subsystem logs debug output)
- Prepare answer for "show me a finished game" (define Chapters 0–2B as a complete short game)

**What to avoid showing:**
- Dev mode story selector (raw IDs visible)
- Mobile gameplay (QTE broken, header disappears)
- Save/load flow (overwrite confusion)
- Opening DevTools (console spam)

**Unanswered partner questions:**
- "Can I see a finished, shipped game?" — Not yet
- "How long from manuscript to playable game?" — No documented estimate
- "What's the revenue model / pricing?" — Undefined
- "What about iOS?" — Not in build pipeline yet
- "Can players mod or translate?" — Story encrypted, no localization system

---

## Release Readiness

**Not ready for public release or partner demo without the following:**

1. Fix QTE mobile playability (#3) — ~30 min
2. Source 19 SFX files (#7) — ~2 hours
3. Write README.md (#4) — ~1 hour
4. Fix encryption key hardcoding (#1) — ~30 min
5. Fix forced-choice index hardcoding (#2) — ~15 min

**Shortest path to demo-ready:** Items 2 + 3 + map a demo path. Technical bugs can be worked around in a controlled demo.

**Shortest path to partner-ready:** All 5 above + tag reference doc (#8) + content author guide (#9) + one-page pitch document.

---

## Strategic Recommendations

### 1. Ship Centinelas as a vertical slice (Chapters 0–2B)
Define current content as a complete short game. Source SFX, fix remaining bugs, publish on itch.io. This becomes the proof of concept and sales tool. **Who benefits:** Every future partner conversation. **Complexity:** Medium (content complete, needs polish pass).

### 2. Write the three core docs: README, tag reference, authoring guide
These three documents unlock the entire business model. Without them, every partner conversation requires you as translator. **Who benefits:** Co-writer, partners, new developers. **Complexity:** Low-medium (information exists, needs organizing).

### 3. Fix mobile playability (QTE touch, header recovery, WillpowerMeter)
Mobile is a target platform but several features are broken on touch. QTE is completely unplayable. **Who benefits:** 50%+ of potential players. **Complexity:** Low (add touch handlers, floating menu button).

### 4. Move encryption key to build-time env var
Current approach provides zero protection. A build-time variable is simple and actually works. **Who benefits:** IP owners whose content is "encrypted." **Complexity:** Low.

### 5. Make audio registry config-driven instead of hardcoded
Move `SOUNDS`/`MUSIC` from engine code to per-game config. Eliminates the #1 source of "missing audio" bugs and lets content creators add sounds without touching code. **Who benefits:** Every future game. **Complexity:** Low-medium.

### 6. Add focus traps and basic ARIA to all modals
Accessibility baseline. Required for any professional release. **Who benefits:** Keyboard and screen reader users. **Complexity:** Low (add react-focus-trap + attributes).

### 7. Create a one-page partner pitch document
Articulate the value proposition, feature comparison vs competitors, and business model. Even a rough internal version makes partner conversations productive. **Who benefits:** Business development. **Complexity:** Low (information exists, needs formatting).

---

## Review Metadata
- Reviewed by: CEO, CTO, UX Designer, Documentation Reviewer, Pitch Analyst
- Date: 2026-03-22
- Files analyzed: 70+ source files across hooks, components, config, scripts, docs
- Issues found: 5 Critical, 10 High, 11 Medium, 10 Low
