# Genjutsu Vampírico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace V-mashing willpower mechanic with a reading-based genjutsu illusion where the player finds and clicks a narrative contradiction to break the vampire's hold.

**Architecture:** A new `GENJUTSU_BREAK: stat:target_knot` Ink tag marks a paragraph as the break point. The engine stores the break info in `useBardoEngine.ts`, `TextDisplay.jsx` renders the paragraph as clickable (glow scaled by willpower), and `WillpowerMeter.jsx` disables V-mashing while genjutsu is active. On trap choice selection, willpower is debited -15. At willpower 0, the engine auto-selects choice index 0 (surrender). On successful break, the engine diverts to the target knot via `story.ChoosePathString()`. `ForcedClickOverlay` is removed entirely.

**Tech Stack:** React, TypeScript, Vitest, inkjs, Framer Motion, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-24-genjutsu-vampirico-design.md`

**Branch:** Create `feature/genjutsu-vampirico` from `feature/willpower-immersive`

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/utils/getDominantStat.ts` | Pure function: given stats record, return key of highest stat |
| Create | `src/utils/__tests__/getDominantStat.test.ts` | Tests for dominant stat helper |
| Create | `src/hooks/__tests__/useTagProcessor.genjutsu.test.ts` | Tests for GENJUTSU_BREAK tag parsing |
| Create | `src/components/__tests__/TextDisplay.genjutsu.test.jsx` | Tests for clickable paragraph rendering |
| Modify | `src/hooks/useTagProcessor.ts:4-36,175` | Add `onGenjutsuBreak` callback to interface + parse `GENJUTSU_BREAK` tag |
| Modify | `src/hooks/useBardoEngine.ts:393+,560-605,272-287,668-683,744-775` | Genjutsu state, breakGenjutsu action, willpower debit on trap choice, save/load, subsystems |
| Modify | `src/components/TextDisplay.jsx:13-22,77,218-234` | New genjutsu props, clickable paragraph rendering |
| Modify | `src/components/WillpowerMeter.jsx:78-86,144-165,182-197` | `genjutsuActive` prop, guard boost handlers |
| Modify | `src/components/Player.jsx:12-64,412-421` | Thread genjutsu props from App → Player → TextDisplay |
| Modify | `src/App.jsx:155-205,389-406` | Remove ForcedClickOverlay, wire genjutsu props to Player |
| Delete | `src/components/ForcedClickOverlay.jsx` | No longer needed — auto-surrender now in engine |
| Remove usage | `src/App.jsx` ForcedClickOverlay import + state + JSX | No longer needed |

---

### Task 1: getDominantStat Utility

Pure function that returns the stat key with the highest value. Tie-break: first in iteration order.

**Files:**
- Create: `src/utils/getDominantStat.ts`
- Create: `src/utils/__tests__/getDominantStat.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/utils/__tests__/getDominantStat.test.ts
import { describe, it, expect } from 'vitest'
import { getDominantStat } from '../getDominantStat'

describe('getDominantStat', () => {
    it('returns the key with the highest value', () => {
        const stats = { fuerza: 5, magia: 10, conocimiento: 3 }
        expect(getDominantStat(stats)).toBe('magia')
    })

    it('returns first key on tie (insertion order)', () => {
        const stats = { fuerza: 10, magia: 10, conocimiento: 3 }
        expect(getDominantStat(stats)).toBe('fuerza')
    })

    it('handles single stat', () => {
        expect(getDominantStat({ fuerza: 5 })).toBe('fuerza')
    })

    it('returns null for empty stats', () => {
        expect(getDominantStat({})).toBeNull()
    })

    it('handles zero values', () => {
        const stats = { fuerza: 0, magia: 0, conocimiento: 1 }
        expect(getDominantStat(stats)).toBe('conocimiento')
    })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/utils/__tests__/getDominantStat.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement getDominantStat**

```ts
// src/utils/getDominantStat.ts

/**
 * Returns the key of the stat with the highest value.
 * Tie-break: first key in iteration order (Object.entries).
 * Returns null if stats is empty.
 */
export function getDominantStat(stats: Record<string, number>): string | null {
    const entries = Object.entries(stats)
    if (entries.length === 0) return null

    let maxKey = entries[0][0]
    let maxVal = entries[0][1]

    for (let i = 1; i < entries.length; i++) {
        if (entries[i][1] > maxVal) {
            maxKey = entries[i][0]
            maxVal = entries[i][1]
        }
    }

    return maxKey
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/utils/__tests__/getDominantStat.test.ts`
Expected: 5/5 PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/getDominantStat.ts src/utils/__tests__/getDominantStat.test.ts
git commit -m "feat(genjutsu): add getDominantStat utility"
```

---

### Task 2: GENJUTSU_BREAK Tag Parsing

Add the `GENJUTSU_BREAK` tag to the tag processor. The tag format is:
```
GENJUTSU_BREAK: stat:target_knot
```
where `stat` is `fuerza|magia|conocimiento` and `target_knot` is the Ink knot to divert to on break.

**Key context:**
- `useTagProcessor.ts` lines 4-36: `TagProcessorOptions` interface with callback types
- Lines 130-175: `WILLPOWER_START/STOP/CHECK` pattern to follow
- The `processTags` callback iterates each tag string and calls the appropriate handler
- Tags come from `story.currentTags` as strings like `"GENJUTSU_BREAK: conocimiento:cap2b_resistencia"`

**Files:**
- Modify: `src/hooks/useTagProcessor.ts:4-36` (interface) and after line 175 (parser)
- Create: `src/hooks/__tests__/useTagProcessor.genjutsu.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/hooks/__tests__/useTagProcessor.genjutsu.test.ts
import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useTagProcessor } from '../useTagProcessor'

function createMockOptions(overrides = {}) {
    return {
        storyRef: { current: { variablesState: {} } },
        minigameController: { startMinigame: vi.fn() },
        achievementsSystem: { unlock: vi.fn() },
        gameSystems: { processTag: vi.fn() },
        triggerVFX: vi.fn(),
        ...overrides,
    }
}

describe('GENJUTSU_BREAK tag', () => {
    it('calls onGenjutsuBreak with parsed stat and target knot', () => {
        const onGenjutsuBreak = vi.fn()
        const { result } = renderHook(() =>
            useTagProcessor(createMockOptions({ onGenjutsuBreak }))
        )

        result.current.processTags(['GENJUTSU_BREAK: conocimiento:cap2b_resistencia'])
        expect(onGenjutsuBreak).toHaveBeenCalledWith('conocimiento', 'cap2b_resistencia')
    })

    it('trims and lowercases the stat', () => {
        const onGenjutsuBreak = vi.fn()
        const { result } = renderHook(() =>
            useTagProcessor(createMockOptions({ onGenjutsuBreak }))
        )

        result.current.processTags(['GENJUTSU_BREAK:  Fuerza : some_knot '])
        expect(onGenjutsuBreak).toHaveBeenCalledWith('fuerza', 'some_knot')
    })

    it('ignores tag if no onGenjutsuBreak callback', () => {
        const { result } = renderHook(() =>
            useTagProcessor(createMockOptions())
        )
        // Should not throw
        result.current.processTags(['GENJUTSU_BREAK: magia:knot'])
    })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/hooks/__tests__/useTagProcessor.genjutsu.test.ts`
Expected: FAIL — onGenjutsuBreak not called

- [ ] **Step 3: Add onGenjutsuBreak to TagProcessorOptions interface**

In `src/hooks/useTagProcessor.ts`, add at line ~18 (after `getWillpowerValue`):

```ts
    // Genjutsu break callback
    onGenjutsuBreak?: (stat: string, targetKnot: string) => void;
```

- [ ] **Step 4: Add GENJUTSU_BREAK parsing after line 175**

In `src/hooks/useTagProcessor.ts`, after the WILLPOWER_CHECK block (line 175), before the SPIDER section (line 177):

```ts
            // ============================================
            // GENJUTSU BREAK — Vampire illusion break point
            // Format: GENJUTSU_BREAK: stat:target_knot
            // ============================================

            if (tag.toUpperCase().startsWith('GENJUTSU_BREAK:')) {
                const payload = tag.substring('GENJUTSU_BREAK:'.length).trim()
                const [rawStat, rawTarget] = payload.split(':').map(s => s.trim())
                const stat = rawStat?.toLowerCase() || ''
                const targetKnot = rawTarget || ''
                console.log(`[Tags] GENJUTSU_BREAK: stat=${stat}, target=${targetKnot}`)
                if (onGenjutsuBreak) {
                    onGenjutsuBreak(stat, targetKnot)
                }
                return
            }
```

Also destructure `onGenjutsuBreak` from the options in the `useTagProcessor` function body (around line 38-45 where the other callbacks are destructured).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/hooks/__tests__/useTagProcessor.genjutsu.test.ts`
Expected: 3/3 PASS

- [ ] **Step 6: Run full test suite**

Run: `npx vitest run`
Expected: All existing tests still pass

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useTagProcessor.ts src/hooks/__tests__/useTagProcessor.genjutsu.test.ts
git commit -m "feat(genjutsu): add GENJUTSU_BREAK tag parsing to useTagProcessor"
```

---

### Task 3: Genjutsu State & Engine Logic

Add genjutsu state management to `useBardoEngine.ts`. This includes:
- The `genjutsuBreak` state (set by tag handler)
- The `breakGenjutsu()` action (writes Ink vars, diverts to target knot)
- Willpower deduction (-15) when player picks a trap choice during genjutsu
- Auto-surrender at willpower 0 during genjutsu
- Save/load support

**Key context:**
- `storyRef` is declared at line 393: `const storyRef = useRef<any>(null)` — genjutsu handlers that use `storyRef` MUST be placed **after** line 394.
- `setGlobalVariable` from `useStoryState()` (line 60) sets Ink variables.
- `willpowerValueRef.current` (line 198-199) gives the current willpower value.
- `makeChoice` (line 560) is the action that selects a choice — genjutsu willpower deduction hooks in here.
- `story.ChoosePathString(knot)` diverts the Ink story to a specific knot — used by `breakGenjutsu`.
- `continueStoryRef.current()` (line 139) advances the story after diverting.
- `buildParallelSystemsSaveState` (line 273) and `continueGame` (line 662) handle save/load.

**Files:**
- Modify: `src/hooks/useBardoEngine.ts`

- [ ] **Step 1: Add genjutsu state near the top of the hook**

After line 180 (the willpower system section), add the state declarations. These don't depend on `storyRef`:

```ts
    // ==================
    // Genjutsu Vampírico (Illusion Break System)
    // ==================
    const [genjutsuBreak, setGenjutsuBreak] = useState<{
        stat: string
        text: string
        targetKnot: string
    } | null>(null)
    const genjutsuActive = genjutsuBreak !== null
    const genjutsuBreakRef = useRef(genjutsuBreak)
    genjutsuBreakRef.current = genjutsuBreak
```

- [ ] **Step 2: Clear genjutsu on WILLPOWER_STOP**

Modify `handleWillpowerStop` (line 190):

```ts
    const handleWillpowerStop = useCallback(() => {
        willpowerActions.stopWillpower()
        setGenjutsuBreak(null)
    }, [willpowerActions])
```

- [ ] **Step 3: Add handleGenjutsuBreak callback (after storyRef, line 394+)**

This is called by the tag processor. It captures the paragraph text from the current story text. Place this AFTER line 394 (`storyRef.current = story`):

```ts
    // ── Genjutsu: tag handler ───────────────────────────────────────────────
    const handleGenjutsuBreak = useCallback((stat: string, targetKnot: string) => {
        // story.currentText has the text from the last Continue(),
        // which is the paragraph this tag belongs to.
        // TextDisplay splits on '\n', so we match against the trimmed text.
        const rawText = story?.currentText?.trim() || ''
        console.log(`[Genjutsu] BREAK point: stat=${stat}, target=${targetKnot}, text="${rawText.substring(0, 50)}..."`)
        setGenjutsuBreak({ stat, text: rawText, targetKnot })
    }, [story])
```

**Note:** We use `story` (from `useStoryState`) rather than `storyRef` because `story.currentText` holds the text from the most recent `Continue()` call. The tag processor fires synchronously during `processTags(tags)`, which happens right after `continueStory()` or `makeChoiceState()`, so `story.currentText` is still fresh.

- [ ] **Step 4: Add breakGenjutsu action (after storyRef, line 394+)**

```ts
    // ── Genjutsu: break action ──────────────────────────────────────────────
    const breakGenjutsu = useCallback(() => {
        const gb = genjutsuBreakRef.current
        if (!gb || !storyRef.current) return

        // Write result variables to Ink
        try {
            setGlobalVariable('genjutsu_stat_used', gb.stat)
            setGlobalVariable('genjutsu_willpower', Math.round(willpowerValueRef.current))
            console.log(`[Genjutsu] Broke illusion: stat=${gb.stat}, wp=${Math.round(willpowerValueRef.current)}`)
        } catch (e) {
            console.warn('[Genjutsu] Could not set Ink variables:', e)
        }

        // Clear genjutsu state
        setGenjutsuBreak(null)

        // Stop willpower system — the genjutsu is broken
        willpowerActions.stopWillpower()

        // Divert to the target knot and continue the story
        try {
            storyRef.current.ChoosePathString(gb.targetKnot)
            if (continueStoryRef.current) {
                continueStoryRef.current()
            }
        } catch (e) {
            console.warn('[Genjutsu] Could not divert to target knot:', e)
        }
    }, [willpowerActions, setGlobalVariable])
```

- [ ] **Step 5: Wire handleGenjutsuBreak to tag processor**

In the `useTagProcessor` options (around line 404), add:

```ts
        onGenjutsuBreak: handleGenjutsuBreak,
```

Add `handleGenjutsuBreak` to the deps if needed.

- [ ] **Step 6: Add willpower deduction on trap choice during genjutsu**

In the `makeChoice` function (line 560), add a willpower deduction at the top, before `clearVFX()`:

```ts
    const makeChoice = useCallback((index: number) => {
        if (typeof index !== 'number' || isNaN(index)) {
            console.error("[BardoEngine] Invalid choice index:", index)
            return
        }

        // Genjutsu: trap choice costs willpower
        if (genjutsuBreakRef.current) {
            const GENJUTSU_TRAP_COST = 15
            willpowerActions.boostValue(-GENJUTSU_TRAP_COST)
            console.log(`[Genjutsu] Trap choice selected — willpower -${GENJUTSU_TRAP_COST}`)
        }

        clearVFX()
        // ... rest unchanged
```

Add `willpowerActions` to the `makeChoice` dependency array (line 605) if not already there.

- [ ] **Step 7: Add auto-surrender at willpower 0 during genjutsu**

Add a `useEffect` after the genjutsu handlers:

```ts
    // Genjutsu: auto-surrender when willpower reaches 0
    useEffect(() => {
        if (!genjutsuActive) return
        if (willpowerState.value > 0) return
        if (!willpowerState.active) return
        if (choices.length === 0) return

        console.log('[Genjutsu] Willpower 0 — auto-surrendering (choice 0)')
        // Clear ref BEFORE makeChoice to prevent trap-cost guard from firing
        genjutsuBreakRef.current = null
        setGenjutsuBreak(null)
        // Select first choice (surrender) — uses makeChoiceRef to get latest makeChoice
        if (makeChoiceRef.current) {
            makeChoiceRef.current(0)
        }
    }, [genjutsuActive, willpowerState.value, willpowerState.active, choices.length])
```

**Note:** `makeChoiceRef` already exists at line 608 and tracks the latest `makeChoice`. Using it avoids a circular dependency.

- [ ] **Step 8: Expose genjutsu in subsystems object**

In the subsystems `useMemo` (around line 752), add after the `willpower` entry:

```ts
        genjutsu: {
            break: genjutsuBreak,
            active: genjutsuActive,
            breakGenjutsu,
        },
```

Add `genjutsuBreak, genjutsuActive, breakGenjutsu` to the useMemo dependency array.

- [ ] **Step 9: Add genjutsu to save/load**

In `buildParallelSystemsSaveState` (line 273), add:

```ts
        const genjutsu = genjutsuBreak ? {
            stat: genjutsuBreak.stat,
            text: genjutsuBreak.text,
            targetKnot: genjutsuBreak.targetKnot,
        } : null
```

Update the return and null-check:
```ts
        if (!spider && !willpower && !arrebatados && !genjutsu) return null
        return { spider, willpower, arrebatados, genjutsu }
```

In `continueGame` (line 662), after willpower restoration (line 674), add:

```ts
            if (ps?.genjutsu) {
                setGenjutsuBreak(ps.genjutsu)
            }
```

Do the same in `loadSave` (line 685) — find the equivalent parallel systems restoration block.

- [ ] **Step 10: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 11: Commit**

```bash
git add src/hooks/useBardoEngine.ts
git commit -m "feat(genjutsu): add genjutsu state, break action, trap cost, auto-surrender"
```

---

### Task 4: Clickable Paragraph in TextDisplay

When genjutsu is active and a paragraph matches the break text and the player's dominant stat matches, that paragraph becomes clickable with a visual glow that scales inversely with willpower.

**Key context:**
- `TextDisplay.jsx` splits text on `'\n'` at line 77: `displayedText.split('\n').filter(p => p.trim().length > 0 || p.length > 0)`
- Each element in the `paragraphs` array is a single line from the Ink output
- `genjutsuBreak.text` is `story.currentText.trim()` — a single line from one `Continue()` call
- Ink's `Continue()` returns one line at a time, so `genjutsuBreak.text` should match exactly one element in `paragraphs`
- Match using `para.trim() === genjutsuBreak.text.trim()` — both are trimmed single lines
- Paragraphs render at lines 218-234 with `data-paragraph-index` attributes

**Files:**
- Modify: `src/components/TextDisplay.jsx:13-22,218-234`
- Create: `src/components/__tests__/TextDisplay.genjutsu.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// src/components/__tests__/TextDisplay.genjutsu.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TextDisplay from '../TextDisplay'

describe('TextDisplay genjutsu', () => {
    // Simulate what Ink produces: lines separated by \n
    const baseProps = {
        text: 'First paragraph.\nEl vampiro sonríe. "Este lugar siempre fue tuyo."\nThird paragraph.',
        isTyping: false,
        typewriterDelay: 0,
    }

    it('renders clickable paragraph when genjutsu break matches', () => {
        const onBreakGenjutsu = vi.fn()
        render(
            <TextDisplay
                {...baseProps}
                genjutsuBreak={{ stat: 'conocimiento', text: 'El vampiro sonríe. "Este lugar siempre fue tuyo."' }}
                dominantStat="conocimiento"
                willpowerValue={50}
                onBreakGenjutsu={onBreakGenjutsu}
            />
        )

        const clickable = screen.getByTestId('genjutsu-break')
        expect(clickable).toBeTruthy()
        fireEvent.click(clickable)
        expect(onBreakGenjutsu).toHaveBeenCalled()
    })

    it('does not render clickable when stat does not match dominant', () => {
        render(
            <TextDisplay
                {...baseProps}
                genjutsuBreak={{ stat: 'fuerza', text: 'El vampiro sonríe. "Este lugar siempre fue tuyo."' }}
                dominantStat="conocimiento"
                willpowerValue={50}
                onBreakGenjutsu={vi.fn()}
            />
        )

        expect(screen.queryByTestId('genjutsu-break')).toBeNull()
    })

    it('does not render clickable when no genjutsuBreak', () => {
        render(<TextDisplay {...baseProps} />)
        expect(screen.queryByTestId('genjutsu-break')).toBeNull()
    })

    it('scales opacity inversely with willpower', () => {
        const props = {
            ...baseProps,
            genjutsuBreak: { stat: 'conocimiento', text: 'El vampiro sonríe. "Este lugar siempre fue tuyo."' },
            dominantStat: 'conocimiento',
            onBreakGenjutsu: vi.fn(),
        }

        const { rerender } = render(
            <TextDisplay {...props} willpowerValue={80} />
        )

        const el80 = screen.getByTestId('genjutsu-break')
        const opacity80 = parseFloat(el80.style.opacity)
        expect(opacity80).toBeLessThan(0.3)

        rerender(<TextDisplay {...props} willpowerValue={10} />)

        const el10 = screen.getByTestId('genjutsu-break')
        const opacity10 = parseFloat(el10.style.opacity)
        expect(opacity10).toBeGreaterThan(0.5)
    })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/__tests__/TextDisplay.genjutsu.test.jsx`
Expected: FAIL — props not recognized, no genjutsu-break test ID

- [ ] **Step 3: Add genjutsu props to TextDisplay**

In `TextDisplay.jsx` line 13, add optional props:

```jsx
export default function TextDisplay({
    text,
    isTyping,
    fastForward = false,
    onComplete,
    typewriterDelay = 30,
    fontSize = 'normal',
    seekString = null,
    onStringFound = null,
    // Genjutsu system
    genjutsuBreak = null,      // { stat: string, text: string } | null
    dominantStat = null,       // string | null
    willpowerValue = 100,      // 0-100
    onBreakGenjutsu = null,    // () => void
}) {
```

- [ ] **Step 4: Add genjutsu opacity helper**

Add above the component function:

```jsx
function getGenjutsuOpacity(wp) {
    if (wp > 70) return 0.15
    if (wp > 30) return 0.15 + (70 - wp) / 40 * 0.25  // 0.15 → 0.40
    return 0.40 + (30 - wp) / 30 * 0.30  // 0.40 → 0.70
}
```

- [ ] **Step 5: Modify paragraph rendering**

Replace the paragraph map (lines 219-234) with:

```jsx
{paragraphs.map((para, i) => {
    const isGenjutsuTarget =
        genjutsuBreak &&
        dominantStat &&
        onBreakGenjutsu &&
        dominantStat === genjutsuBreak.stat &&
        para.trim() === genjutsuBreak.text.trim()

    const genjutsuStyle = isGenjutsuTarget ? {
        textDecoration: 'underline dotted',
        textUnderlineOffset: '4px',
        opacity: getGenjutsuOpacity(willpowerValue),
        filter: `drop-shadow(0 0 ${8 - willpowerValue / 100 * 6}px rgba(220, 38, 38, ${getGenjutsuOpacity(willpowerValue)}))`,
        transition: 'opacity 500ms ease, filter 500ms ease',
    } : undefined

    return (
        <p
            key={i}
            data-paragraph-index={i}
            data-testid={isGenjutsuTarget ? 'genjutsu-break' : undefined}
            className={`font-narrative ${fontSizeClass} leading-relaxed text-bardo-text ${
                isGenjutsuTarget ? 'cursor-pointer' : ''
            }`}
            onClick={isGenjutsuTarget ? onBreakGenjutsu : undefined}
            style={genjutsuStyle}
        >
            {para}
            {isTyping &&
                typewriterDelay > 0 &&
                i === paragraphs.length - 1 &&
                displayedText.length < text.length && (
                    <span className="inline-block w-2 h-6 bg-bardo-accent ml-1 animate-pulse" />
                )}
        </p>
    )
})}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/components/__tests__/TextDisplay.genjutsu.test.jsx`
Expected: 4/4 PASS

- [ ] **Step 7: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add src/components/TextDisplay.jsx src/components/__tests__/TextDisplay.genjutsu.test.jsx
git commit -m "feat(genjutsu): add clickable break paragraph to TextDisplay"
```

---

### Task 5: WillpowerMeter Genjutsu Guard

Disable V-mashing and touch boosting while genjutsu is active. The eye SVG continues showing willpower state. The V key prompt is hidden during genjutsu.

**Key context:**
- `WillpowerMeter.jsx` lines 78-86: current props
- Lines 144-165: `useEffect` with `handleKeyDown` that calls `boostValue(boost)` — add guard
- Lines 182-197: `handleTouch` callback that calls `boostValue(boost)` — add guard
- Lines 330-340: V key prompt rendering — hide during genjutsu

**Files:**
- Modify: `src/components/WillpowerMeter.jsx:78-86,147-151,183-187,330`

- [ ] **Step 1: Add genjutsuActive prop**

In the component props (line 78):

```jsx
export default function WillpowerMeter({
    active,
    value = 100,
    decayRate = 'normal',
    targetKey = 'V',
    boostValue,
    volumeMultiplier = 1,
    genjutsuActive = false,
}) {
```

- [ ] **Step 2: Add guard to keydown handler**

In the `handleKeyDown` function inside the `useEffect` (line 147), after `e.preventDefault()`:

```js
            if (genjutsuActive) return
```

Add `genjutsuActive` to the `useEffect` dependency array (line 165).

- [ ] **Step 3: Add guard to touch handler**

In `handleTouch` (line 183), after `if (!active) return`:

```js
        if (genjutsuActive) return
```

Add `genjutsuActive` to the `useCallback` dependency array (line 197).

- [ ] **Step 4: Hide key prompt during genjutsu**

In the key prompt section (line 330):

```jsx
{!isTouchDevice && !genjutsuActive && (
    <div className={`w-8 h-8 rounded border ...`}>
        {targetKey}
    </div>
)}
```

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/WillpowerMeter.jsx
git commit -m "feat(genjutsu): add genjutsuActive guard to WillpowerMeter"
```

---

### Task 6: App.jsx & Player.jsx Integration

Wire genjutsu state from the engine to Player → TextDisplay and to WillpowerMeter. Remove ForcedClickOverlay entirely — the engine now handles willpower-0 auto-surrender via `makeChoice(0)` in the `useEffect` from Task 3.

**Key context:**
- `App.jsx` line 160: subsystems destructured from engine
- Lines 167-205: ForcedClickOverlay state management (hasAutoSubmitted, showForcedClick, etc.) — **all removed**
- Lines 389-406: WillpowerMeter and ForcedClickOverlay JSX rendering
- `Player.jsx` lines 12-64: Player props signature
- `Player.jsx` lines 412-421: `<TextDisplay>` rendered inside Player
- Props thread: `App.jsx` → `Player.jsx` → `TextDisplay.jsx`

**Important behavioral change:** ForcedClickOverlay previously selected the LAST choice at willpower 0. The new engine logic selects choice index 0. All existing WILLPOWER_START scenes in Centinelas (`centinelas.ink` lines 2806, 2840, 2954, 3148) are vampire encounters that will be migrated to use `GENJUTSU_BREAK`. There are no non-genjutsu willpower scenes. The `vampiro.ink` test file mirrors the same structure. Therefore, removing ForcedClickOverlay globally is safe — every willpower scene will have genjutsu and its auto-surrender at index 0.

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Player.jsx:12-64,412-421`

- [ ] **Step 1: Import getDominantStat in App.jsx**

```js
import { getDominantStat } from './utils/getDominantStat'
```

- [ ] **Step 2: Add genjutsu to subsystems destructuring**

In App.jsx line 160:

```js
const { audio, vfx, saveSystem, gameSystems, achievementsSystem, minigameController, willpower, spiderInfestation, scrollFriction, bossController, visualDamage, scrollContainerRef, genjutsu } = subsystems
```

- [ ] **Step 3: Remove ForcedClickOverlay state and logic**

Remove these from App.jsx (lines 167-205):
- `const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)` — delete
- `const [showForcedClick, setShowForcedClick] = useState(false)` — delete
- The `useEffect` that resets `hasAutoSubmitted` and `showForcedClick` — remove `setHasAutoSubmitted(false)` and `setShowForcedClick(false)` from the reset effect (line 172-177). Keep the effect but only reset `setChoicesVisible(false)`.
- The `useEffect` for willpower-reaches-0 auto-submit (lines 188-197) — delete entirely
- `handleForcedClickComplete` callback (lines 200-205) — delete

- [ ] **Step 4: Remove ForcedClickOverlay JSX, import, and file**

Remove the `<ForcedClickOverlay>` component (lines 399-406) from the JSX.
Remove the `ForcedClickOverlay` import from the top of the file.
Delete the component file:
```bash
git rm src/components/ForcedClickOverlay.jsx
```

- [ ] **Step 4b: Fix heavy cursor activation (line 226)**

Line 226 references the now-deleted `showForcedClick` variable:
```js
const shouldActivateHeavyCursor = (willpowerActive && (meterRevealed || showForcedClick)) || ...
```

Replace with:
```js
const shouldActivateHeavyCursor = (willpowerActive && meterRevealed) || ...
```

(Remove `|| showForcedClick` entirely — the heavy cursor activates when willpower meter is revealed.)

- [ ] **Step 5: Pass genjutsuActive to WillpowerMeter**

Update WillpowerMeter props:

```jsx
<WillpowerMeter
    active={willpower?.state?.active && meterRevealed && !minigameController.isPlaying}
    value={willpower?.state?.value ?? 100}
    decayRate={willpower?.state?.decayRate || 'normal'}
    targetKey={willpower?.state?.targetKey || 'V'}
    boostValue={willpower?.boostValue}
    volumeMultiplier={getMusicVolume()}
    genjutsuActive={genjutsu?.active ?? false}
/>
```

- [ ] **Step 6: Add genjutsu props to Player.jsx signature**

In `Player.jsx` line 12, add after `onWillpowerHintVisible` (line 45):

```jsx
    // Genjutsu props
    genjutsuBreak = null,
    dominantStat = null,
    willpowerValue = 100,
    onBreakGenjutsu = null,
```

- [ ] **Step 7: Thread genjutsu props to TextDisplay in Player.jsx**

At the `<TextDisplay>` (line 412), add:

```jsx
<TextDisplay
    text={text}
    isTyping={isTyping}
    fastForward={fastForward}
    onComplete={handleTypingComplete}
    typewriterDelay={typewriterDelay}
    fontSize={fontSize}
    seekString={willpowerActive ? '[PRESIONÁ' : null}
    onStringFound={onWillpowerHintVisible}
    genjutsuBreak={genjutsuBreak}
    dominantStat={dominantStat}
    willpowerValue={willpowerValue}
    onBreakGenjutsu={onBreakGenjutsu}
/>
```

- [ ] **Step 8: Pass genjutsu props from App.jsx to Player**

Find where `<Player>` is rendered in App.jsx and add:

```jsx
<Player
    {/* ...existing props... */}
    genjutsuBreak={genjutsu?.break ?? null}
    dominantStat={getDominantStat(gameSystems.stats || {})}
    willpowerValue={willpower?.state?.value ?? 100}
    onBreakGenjutsu={genjutsu?.breakGenjutsu}
/>
```

- [ ] **Step 9: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass. If any tests reference ForcedClickOverlay, update or remove them.

- [ ] **Step 10: Verify ForcedClickOverlay is fully removed**

Run these commands — all should return no matches:
```bash
grep -rn 'ForcedClickOverlay' src/
grep -rn 'hasAutoSubmitted' src/
grep -rn 'showForcedClick' src/
```

- [ ] **Step 11: Commit**

```bash
git add src/App.jsx src/components/Player.jsx
git commit -m "feat(genjutsu): wire genjutsu props, remove ForcedClickOverlay"
```

---

### Task 7: Integration Verification

Ensure everything compiles, tests pass, and no broken references remain.

**Files:** None — verification only

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Check TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Start dev server**

Run: `npm run dev`
Open browser, verify no crash on load. Check console for errors.

- [ ] **Step 4: Verify no dead references**

```bash
grep -rn 'ForcedClickOverlay' src/
grep -rn 'hasAutoSubmitted' src/
grep -rn 'showForcedClick' src/
```

Expected: No matches in any source file.

- [ ] **Step 5: Commit any cleanup**

```bash
git add -A
git commit -m "chore(genjutsu): integration verification and cleanup"
```

---

## Execution Order & Dependencies

```
Task 1 (getDominantStat) ───┐
                             ├── Task 4 (TextDisplay) ──┐
Task 2 (tag parsing) ───────┤                           ├── Task 6 (App+Player) ── Task 7 (verify)
                             ├── Task 3 (engine state) ──┘
Task 5 (meter guard) ───────┘
```

- **Tasks 1, 2, 5** are independent — can run in parallel
- **Task 3** depends on Task 2 (uses the callback it defines)
- **Task 4** depends on Task 1 (uses getDominantStat)
- **Task 6** depends on Tasks 3, 4, 5 (integrates all pieces)
- **Task 7** depends on Task 6

---

## Ink Authoring Guide (for content update)

Once the engine is implemented, update Centinelas cap2B Ink to use the new tags:

```ink
= ilusion_1
El vampiro sonríe. "Este lugar siempre fue tuyo, lo sabés." # GENJUTSU_BREAK: conocimiento:cap2b_resistencia

* [Me rindo, tenés razón]
    -> ilusion_2
* [Quizás solo necesito descansar]
    -> ilusion_2

= ilusion_2
"El Faro lleva siglos en ruinas. Ya nadie te espera." # GENJUTSU_BREAK: conocimiento:cap2b_resistencia

* [Nadie me espera...]
    -> ilusion_3
* [Quizás tiene razón]
    -> ilusion_3

= cap2b_resistencia
~ temp wp = genjutsu_willpower
{ wp > 60:
    Rompiste la ilusión casi sin esfuerzo. El vampiro retrocede.
- else:
    Apenas lograste ver la grieta. Te costó todo.
}
-> cap2b_continua
```

**Convention:** First choice (index 0) is always the surrender option. `genjutsu_stat_used` and `genjutsu_willpower` Ink variables must be declared in the story's global variables section.
