# Bug Fix Prompt: Minigame death → CONTINUAR → SIGUIENTE shows death instead of replaying minigame

## Your Task
Fix a bug in BardoEngine (React + inkjs interactive fiction engine). After dying in a minigame and clicking CONTINUAR (load last save), clicking SIGUIENTE shows death text instead of replaying the minigame.

## Steps to reproduce
1. Run `npm run dev`, open browser
2. Use debug panel to jump to `final_morgue_escape` with `fuerza=10`
3. Click SIGUIENTE through all pagination pages
4. Minigame appears (crawl/keymash) — **lose on purpose**
5. Death screen shows "MORISTE. FIN DEL JUEGO." → click CONTINUAR
6. Last pagination text is shown → click SIGUIENTE
7. **BUG**: Death text appears instead of the minigame

## Project structure (only relevant files)

```
src/hooks/useBardoEngine.ts    — Central orchestrator, wraps all hooks
src/hooks/useStoryState.ts     — Manages inkjs Story: Continue(), choices, processStoryLoop
src/hooks/useMinigameController.js — State machine: idle → pending → playing → idle
src/hooks/useTagProcessor.ts   — Parses Ink tags, routes to subsystems
src/hooks/useSaveSystem.js     — localStorage save/load with auto-save
src/components/Player.jsx      — Main gameplay view, typewriter, choices, minigame auto-start
src/components/MinigameOverlay.jsx — Renders active minigame (only when isPlaying=true)
centinelas.ink                 — Story source (compiled to src/stories/centinelas.json)
```

## How the minigame system works

### Ink story structure
```ink
VAR minigame_result = -1  // line 50

=== keymash_arrastre ===
# MINIGAME: type=crawl, autostart=true, result=keymash_arrastre_resultado
-> keymash_arrastre_resultado

=== keymash_arrastre_resultado ===
{ minigame_result:
    - 1: -> keymash_arrastre_exito
    - else: -> keymash_arrastre_fallo
}

=== keymash_arrastre_fallo ===
# flash_red
MORISTE. FIN DEL JUEGO.
-> END
```

### Critical inkjs behavior
A SINGLE `story.Continue()` call processes: keymash_arrastre (MINIGAME tag) → divert → resultado conditional (minigame_result=-1 → else) → fallo → "MORISTE." → -> END. The MINIGAME tag and death text arrive in the SAME Continue() output.

### Engine flow (working, first time)
1. `processStoryLoop` (useStoryState.ts ~line 56) calls Continue() in a while loop
2. Detects MINIGAME tag → sets `brokeForMinigame=true` → breaks loop
3. Forces `canContinue=false, isEnded=false` (prevents death screen while minigame pending)
4. Text includes death text but overlay will cover it
5. Back in `continueStory` (useBardoEngine.ts ~line 627): `processTags(tags)` processes MINIGAME → calls `minigameController.queueGame(config)` → state='pending'
6. **Player.jsx line 263**: `handleTypingComplete` fires when typewriter finishes → checks `hasPendingMinigame && minigameAutoStart` → calls `onMinigameReady()` → `handleMinigameStart()` → `minigameController.startGame()` → state='playing'
7. MinigameOverlay renders (only shows when isPlaying=true)
8. Player loses → `finishGame(0)` → `handleMinigameResult(0)`:
   - Sets `minigame_result=0` on the Story
   - `ChoosePathString("keymash_arrastre_resultado")` — jumps to result knot
   - `pendingMinigameResultRef.current = true`
9. useEffect (line 258): when `!isPlaying && pendingMinigameResult` → calls `continueStory()` → processes death → isEnded=true
10. Death screen shows

### Auto-save system
Auto-save happens at the END of `continueStory` (useBardoEngine.ts ~line 690):
```typescript
const storyEnded = !story.canContinue && story.currentChoices.length === 0
if (storyId && newText && !storyEnded) {
    saveSystem.autoSave(story.state.toJson(), newText, ...)
}
```

### CONTINUAR flow
`continueGame()` (useBardoEngine.ts:981) → `loadLastSave()` → `initStory(data, savedState, savedText)` → creates new Story, loads saved state. Does NOT reset minigameController.

## Most likely root cause: Auto-save overwrite

After `processStoryLoop` breaks on MINIGAME tag, the auto-save at the end of `continueStory` checks `story.canContinue`. If inkjs hasn't fully registered `-> END` yet (canContinue is still true), `storyEnded=false` and the auto-save **OVERWRITES the pre-minigame pagination save** with the post-death story state.

Then CONTINUAR loads this overwritten save → story is past the minigame → SIGUIENTE continues to END → death.

## How to verify the root cause

Write a test or add a console.log in `continueStory` after `processStoryLoop` returns:
```typescript
const { text: newText, tags } = continueStoryState()
const hasMinigame = tags.some(t => t.trim().toLowerCase().startsWith('minigame:'))
if (hasMinigame) {
    console.log('[DEBUG] After MINIGAME break — story.canContinue:', story.canContinue)
}
```

If `story.canContinue` is `true` after the MINIGAME break, auto-save overwrites and this IS the bug.

## The fix

### Fix 1 (PRIMARY): Skip auto-save when MINIGAME tag detected
In `useBardoEngine.ts`, the auto-save section (~line 690):

```typescript
// BEFORE (buggy):
const storyEnded = !story.canContinue && story.currentChoices.length === 0
if (storyId && newText && !storyEnded) {
    saveSystem.autoSave(...)
}

// AFTER (fixed):
const storyEnded = !story.canContinue && story.currentChoices.length === 0
const hasMinigameTag = tags.some((t: string) => t.trim().toLowerCase().startsWith('minigame:'))
if (storyId && newText && !storyEnded && !hasMinigameTag) {
    saveSystem.autoSave(...)
}
```

### Fix 2 (SAFETY NET): Reset minigame controller on save load
In `useBardoEngine.ts`, in `continueGame()` (~line 985) and `loadSave()` (~line 1010), after `initStory(...)`:

```typescript
initStory(storyData, saveData.state, saveData.text, saveData.gameSystems)
minigameController.reset()  // Clear stale minigame state from previous attempt
```

### Fix 2b: Also add minigameController.reset to loadSave function
Same pattern — after initStory in the loadSave callback.

## Secondary root cause (if auto-save is NOT the issue)

If `story.canContinue` IS false after the MINIGAME break (auto-save is correctly skipped), the bug is likely a React timing/stale-closure issue in the typewriter auto-start:

**Player.jsx line 263** — `handleTypingComplete`:
```jsx
if (hasPendingMinigame && minigameAutoStart && onMinigameReady) {
    onMinigameReady()
}
```

This fires when the typewriter finishes. If `hasPendingMinigame` is false in the closure when the typewriter completes (stale value from a previous render), the minigame never starts.

**Fix for this**: In Player.jsx, use a ref to track the latest value:
```jsx
const pendingMinigameRef = useRef(false)
pendingMinigameRef.current = hasPendingMinigame

// In handleTypingComplete:
if (pendingMinigameRef.current && minigameAutoStart && onMinigameReady) {
    onMinigameReady()
}
```

## Commands
- `npm run dev` — dev server
- `npm run test:run` — run all tests (must pass)
- `node compile-ink.cjs centinelas.ink src/stories/centinelas.json` — compile Ink (if editing .ink)

## Rules
- Branch: `fix/intermision-playa-siguiente` (already exists, already checked out)
- Bug fix = patch version bump
- Run tests before committing
- Don't add unnecessary abstractions
