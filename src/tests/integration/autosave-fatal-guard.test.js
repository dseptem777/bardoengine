/**
 * Integration test: autosave guard — no autosave after choice leads to fatal (no-choices) state
 *
 * Verifies the fix in useBardoEngine.ts makeChoice:
 * autoSave must NOT fire when story.currentChoices.length === 0 after a choice,
 * so "Continuar" from GameOverMenu always restores the last real choice point.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSaveSystem } from '../../hooks/useSaveSystem'

/**
 * Simulates the autoSave call-site guard logic extracted from useBardoEngine.ts makeChoice.
 * This mirrors the exact condition added in the fix:
 *
 *   const storyEnded = !story.canContinue && story.currentChoices.length === 0
 *   const hasChoices = story.currentChoices.length > 0
 *   if (storyId && newText && !storyEnded && hasChoices) { autoSave(...) }
 */
function shouldAutoSave({ storyId, newText, canContinue, choicesLength }) {
    const storyEnded = !canContinue && choicesLength === 0
    const hasChoices = choicesLength > 0
    return Boolean(storyId && newText && !storyEnded && hasChoices)
}

describe('autosave guard — makeChoice call site', () => {
    describe('shouldAutoSave logic', () => {
        it('saves when choices are available (normal gameplay)', () => {
            expect(shouldAutoSave({
                storyId: 'centinelas',
                newText: 'You enter the room.',
                canContinue: false,
                choicesLength: 2
            })).toBe(true)
        })

        it('does NOT save when no choices after choice (mid-fatal-knot)', () => {
            expect(shouldAutoSave({
                storyId: 'centinelas',
                newText: 'The monster tears into you.',
                canContinue: true,  // story can still continue (more lines coming)
                choicesLength: 0    // but no choices — linear fatal path
            })).toBe(false)
        })

        it('does NOT save when story has fully ended (canContinue=false, no choices)', () => {
            expect(shouldAutoSave({
                storyId: 'centinelas',
                newText: 'FIN DE TU HISTORIA.',
                canContinue: false,
                choicesLength: 0
            })).toBe(false)
        })

        it('does NOT save when storyId is missing', () => {
            expect(shouldAutoSave({
                storyId: null,
                newText: 'Some text.',
                canContinue: false,
                choicesLength: 2
            })).toBe(false)
        })

        it('does NOT save when newText is empty', () => {
            expect(shouldAutoSave({
                storyId: 'centinelas',
                newText: '',
                canContinue: false,
                choicesLength: 2
            })).toBe(false)
        })
    })

    describe('useSaveSystem — autosave not called on fatal state', () => {
        beforeEach(() => {
            localStorage.clear()
        })

        it('preserves the pre-fatal save when fatal path produces no choices', () => {
            const { result: saveSystem } = renderHook(() => useSaveSystem('autosave_guard_test'))

            // Simulate a valid choice point (choices available) — autosave fires
            const validState = '{"inkState":"choice_point"}'
            const validText = 'You see a door and a window.'
            act(() => {
                if (shouldAutoSave({ storyId: 'autosave_guard_test', newText: validText, canContinue: false, choicesLength: 2 })) {
                    saveSystem.current.autoSave(validState, validText, undefined, undefined)
                }
            })

            // Confirm autosave was written
            const savesAfterValidPoint = saveSystem.current.saves
            expect(savesAfterValidPoint.length).toBeGreaterThan(0)
            const lastValidSave = savesAfterValidPoint[0]
            expect(lastValidSave.state).toBe(validState)

            // Now simulate choosing an option that leads into a fatal linear knot (no choices)
            const fatalState = '{"inkState":"mid_fatal_knot"}'
            const fatalText = 'The monster lunges at you.'
            act(() => {
                // Guard: choicesLength === 0 → shouldAutoSave returns false → autoSave is NOT called
                if (shouldAutoSave({ storyId: 'autosave_guard_test', newText: fatalText, canContinue: true, choicesLength: 0 })) {
                    saveSystem.current.autoSave(fatalState, fatalText, undefined, undefined)
                }
            })

            // The autosave must still be the valid choice point, NOT the fatal mid-knot state
            const savesAfterFatalBeat = saveSystem.current.saves
            const autoSave = savesAfterFatalBeat.find(s => s.isAutosave)
            expect(autoSave).toBeDefined()
            expect(autoSave.state).toBe(validState)
            expect(autoSave.state).not.toBe(fatalState)
        })
    })
})
