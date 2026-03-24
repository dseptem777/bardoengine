/**
 * Tests for useWillpowerCorruption hook
 *
 * Covers:
 * - Filter is applied proportional to willpower drop
 * - Filter clears when willpower is near 100 (level < 0.02)
 * - Hue-rotate is added below willpower 20
 * - Filter clears when active=false
 * - Cleanup on unmount
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWillpowerCorruption } from '../useWillpowerCorruption'

// ── rAF mock helpers ──────────────────────────────────────────────────────────

let rafCallbacks: Map<number, FrameRequestCallback> = new Map()
let rafId = 0

function setupRafMock() {
    rafCallbacks = new Map()
    rafId = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        const id = ++rafId
        rafCallbacks.set(id, cb)
        return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
        rafCallbacks.delete(id)
    })
}

function teardownRafMock() {
    vi.unstubAllGlobals()
    rafCallbacks.clear()
}

/** Fire all pending rAF callbacks once. Returns number of callbacks fired. */
function flushRaf(timestamp = 16.67): number {
    const cbs = [...rafCallbacks.entries()]
    for (const [id, cb] of cbs) {
        rafCallbacks.delete(id)
        cb(timestamp)
    }
    return cbs.length
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function createParagraphElements(count: number): HTMLElement[] {
    const elems: HTMLElement[] = []
    for (let i = 0; i < count; i++) {
        const p = document.createElement('p')
        p.setAttribute('data-paragraph-index', String(i))
        document.body.appendChild(p)
        elems.push(p)
    }
    return elems
}

function removeElements(elems: HTMLElement[]) {
    elems.forEach(el => el.parentNode?.removeChild(el))
}

// ─────────────────────────────────────────────────────────────────────────────

describe('useWillpowerCorruption', () => {
    let paragraphs: HTMLElement[]

    beforeEach(() => {
        setupRafMock()
        paragraphs = createParagraphElements(3)
    })

    afterEach(() => {
        removeElements(paragraphs)
        teardownRafMock()
    })

    // ── Loop scheduling ───────────────────────────────────────────────────────

    describe('rAF loop', () => {
        it('schedules a rAF callback when active=true', () => {
            renderHook(() => useWillpowerCorruption(true, 50))
            expect(rafCallbacks.size).toBe(1)
        })

        it('does not schedule a rAF callback when active=false', () => {
            renderHook(() => useWillpowerCorruption(false, 50))
            expect(rafCallbacks.size).toBe(0)
        })

        it('re-schedules itself after each frame while active', () => {
            renderHook(() => useWillpowerCorruption(true, 50))
            act(() => { flushRaf() })
            // Loop should have re-queued itself
            expect(rafCallbacks.size).toBe(1)
        })
    })

    // ── Filter application ────────────────────────────────────────────────────

    describe('filter proportional to willpower', () => {
        it('applies a filter to all [data-paragraph-index] elements at low willpower', () => {
            renderHook(() => useWillpowerCorruption(true, 30))
            act(() => { flushRaf() })

            for (const p of paragraphs) {
                expect(p.style.filter).not.toBe('')
                expect(p.style.filter).toContain('blur')
                expect(p.style.filter).toContain('brightness')
                expect(p.style.filter).toContain('contrast')
                expect(p.style.filter).toContain('saturate')
            }
        })

        it('filter at willpower=30 has more blur than at willpower=70', () => {
            // willpower=70: level = (1 - 0.7)^1.5 ≈ 0.164, blur ≈ 0.11px
            // willpower=30: level = (1 - 0.3)^1.5 ≈ 0.586, blur ≈ 1.37px
            let wp = 70
            const { rerender } = renderHook(() => useWillpowerCorruption(true, wp))
            act(() => { flushRaf() })
            const filterAt70 = paragraphs[0].style.filter

            wp = 30
            rerender()
            act(() => { flushRaf() })
            const filterAt30 = paragraphs[0].style.filter

            // Extract blur value from filter string "blur(Xpx) ..."
            const blurAt70 = parseFloat(filterAt70.match(/blur\(([^p]+)px\)/)?.[1] ?? '0')
            const blurAt30 = parseFloat(filterAt30.match(/blur\(([^p]+)px\)/)?.[1] ?? '0')

            expect(blurAt30).toBeGreaterThan(blurAt70)
        })

        it('brightness decreases as willpower drops', () => {
            let wp = 70
            const { rerender } = renderHook(() => useWillpowerCorruption(true, wp))
            act(() => { flushRaf() })
            const brightnessAt70 = parseFloat(
                paragraphs[0].style.filter.match(/brightness\(([^)]+)\)/)?.[1] ?? '1'
            )

            wp = 30
            rerender()
            act(() => { flushRaf() })
            const brightnessAt30 = parseFloat(
                paragraphs[0].style.filter.match(/brightness\(([^)]+)\)/)?.[1] ?? '1'
            )

            expect(brightnessAt30).toBeLessThan(brightnessAt70)
        })
    })

    // ── Near-full willpower: no filter ────────────────────────────────────────

    describe('filter cleared when willpower near 100', () => {
        it('clears filter when willpower=100 (level=0)', () => {
            renderHook(() => useWillpowerCorruption(true, 100))
            act(() => { flushRaf() })

            for (const p of paragraphs) {
                expect(p.style.filter).toBe('')
            }
        })

        it('clears filter when willpower=98 (level < 0.02)', () => {
            // level = (1 - 0.98)^1.5 = 0.02^1.5 ≈ 0.00283 < 0.02
            renderHook(() => useWillpowerCorruption(true, 98))
            act(() => { flushRaf() })

            for (const p of paragraphs) {
                expect(p.style.filter).toBe('')
            }
        })

        it('applies filter just below the threshold (willpower=90, level≈0.032)', () => {
            // level = (1 - 0.9)^1.5 = 0.1^1.5 ≈ 0.0316 > 0.02 → filter applied
            renderHook(() => useWillpowerCorruption(true, 90))
            act(() => { flushRaf() })

            for (const p of paragraphs) {
                expect(p.style.filter).not.toBe('')
            }
        })
    })

    // ── Hue-rotate below willpower 20 ─────────────────────────────────────────

    describe('hue-rotate shift at willpower < 20', () => {
        it('adds hue-rotate to filter when willpower < 20', () => {
            renderHook(() => useWillpowerCorruption(true, 10))
            act(() => { flushRaf() })

            for (const p of paragraphs) {
                expect(p.style.filter).toContain('hue-rotate')
            }
        })

        it('does NOT add hue-rotate when willpower >= 20', () => {
            renderHook(() => useWillpowerCorruption(true, 20))
            act(() => { flushRaf() })

            for (const p of paragraphs) {
                expect(p.style.filter).not.toContain('hue-rotate')
            }
        })

        it('does NOT add hue-rotate when willpower=25', () => {
            renderHook(() => useWillpowerCorruption(true, 25))
            act(() => { flushRaf() })

            for (const p of paragraphs) {
                expect(p.style.filter).not.toContain('hue-rotate')
            }
        })
    })

    // ── Deactivation ──────────────────────────────────────────────────────────

    describe('active=false clears filters', () => {
        it('clears all filters when active transitions to false', () => {
            // First apply some filters
            let active = true
            const { rerender } = renderHook(() => useWillpowerCorruption(active, 20))
            act(() => { flushRaf() })

            // Verify filters were applied
            expect(paragraphs[0].style.filter).not.toBe('')

            // Now deactivate
            active = false
            rerender()

            // Filters should be cleared immediately (in effect cleanup / new effect run)
            for (const p of paragraphs) {
                expect(p.style.filter).toBe('')
            }
        })

        it('cancels the rAF loop when active becomes false', () => {
            let active = true
            const { rerender } = renderHook(() => useWillpowerCorruption(active, 30))
            expect(rafCallbacks.size).toBe(1)

            active = false
            rerender()

            expect(rafCallbacks.size).toBe(0)
        })

        it('loop stops itself mid-frame if active is false via ref', () => {
            // active starts true, we flip activeRef mid-loop by rerendering
            let active = true
            const { rerender } = renderHook(() => useWillpowerCorruption(active, 30))

            // Flip active before flushing rAF — the loop callback reads activeRef
            active = false
            rerender()

            // Now flush: the loop should clear filters and not re-queue
            act(() => { flushRaf() })

            expect(rafCallbacks.size).toBe(0)
            for (const p of paragraphs) {
                expect(p.style.filter).toBe('')
            }
        })
    })

    // ── Cleanup on unmount ────────────────────────────────────────────────────

    describe('cleanup on unmount', () => {
        it('cancels rAF on unmount', () => {
            const { unmount } = renderHook(() => useWillpowerCorruption(true, 30))
            expect(rafCallbacks.size).toBe(1)

            unmount()
            expect(rafCallbacks.size).toBe(0)
        })

        it('clears all paragraph filters on unmount', () => {
            const { unmount } = renderHook(() => useWillpowerCorruption(true, 30))
            act(() => { flushRaf() })

            // Confirm filters are set
            expect(paragraphs[0].style.filter).not.toBe('')

            unmount()

            for (const p of paragraphs) {
                expect(p.style.filter).toBe('')
            }
        })

        it('does not throw if no paragraphs exist when unmounting', () => {
            removeElements(paragraphs)
            paragraphs = []

            const { unmount } = renderHook(() => useWillpowerCorruption(true, 30))
            expect(() => unmount()).not.toThrow()

            // Re-create for afterEach cleanup (noop since empty)
        })
    })

    // ── No paragraphs in DOM ──────────────────────────────────────────────────

    describe('handles empty DOM gracefully', () => {
        it('does not throw when no [data-paragraph-index] elements exist', () => {
            removeElements(paragraphs)
            paragraphs = []

            const hook = renderHook(() => useWillpowerCorruption(true, 30))
            expect(() => act(() => { flushRaf() })).not.toThrow()
            hook.unmount()
        })
    })
})
