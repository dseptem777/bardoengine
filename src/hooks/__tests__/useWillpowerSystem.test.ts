/**
 * Tests for useWillpowerSystem hook
 *
 * Covers: initialization, startWillpower, stopWillpower, updateValue,
 * checkWillpower, rAF-based decay loop, and onValueChange callback.
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWillpowerSystem } from '../useWillpowerSystem'

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

/** Advance animation by `count` frames, each `deltaMs` milliseconds apart. */
function advanceFrames(count: number, deltaMs = 16.67, startTimestamp = 0) {
    let timestamp = startTimestamp
    for (let i = 0; i < count; i++) {
        timestamp += deltaMs
        // Copy current callbacks — the callback may re-register itself
        const cbs = [...rafCallbacks.entries()]
        for (const [id, cb] of cbs) {
            rafCallbacks.delete(id)
            cb(timestamp)
        }
    }
    return timestamp
}

// ─────────────────────────────────────────────────────────────────────────────

describe('useWillpowerSystem', () => {
    beforeEach(() => {
        setupRafMock()
    })

    afterEach(() => {
        teardownRafMock()
    })

    // ── Initialization ─────────────────────────────────────────────────────

    describe('initialization', () => {
        it('returns default state', () => {
            const { result } = renderHook(() => useWillpowerSystem())
            const [state] = result.current
            expect(state.active).toBe(false)
            expect(state.value).toBe(100)
            expect(state.decayRate).toBe('normal')
            expect(state.targetKey).toBe('V')
            expect(state.threshold).toBe(50)
        })

        it('exposes the four actions', () => {
            const { result } = renderHook(() => useWillpowerSystem())
            const [, actions] = result.current
            expect(typeof actions.startWillpower).toBe('function')
            expect(typeof actions.stopWillpower).toBe('function')
            expect(typeof actions.updateValue).toBe('function')
            expect(typeof actions.checkWillpower).toBe('function')
        })
    })

    // ── startWillpower ─────────────────────────────────────────────────────

    describe('startWillpower', () => {
        it('sets active=true and defaults to value=100 / decayRate=normal', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => {
                result.current[1].startWillpower()
            })

            const [state] = result.current
            expect(state.active).toBe(true)
            expect(state.value).toBe(100)
            expect(state.decayRate).toBe('normal')
        })

        it('applies custom config', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => {
                result.current[1].startWillpower({ decayRate: 'fast', targetKey: 'X', value: 80, threshold: 40 })
            })

            const [state] = result.current
            expect(state.active).toBe(true)
            expect(state.decayRate).toBe('fast')
            expect(state.targetKey).toBe('X')
            expect(state.value).toBe(80)
            expect(state.threshold).toBe(40)
        })

        it('schedules a rAF callback', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => {
                result.current[1].startWillpower()
            })

            expect(rafCallbacks.size).toBeGreaterThan(0)
        })
    })

    // ── stopWillpower ──────────────────────────────────────────────────────

    describe('stopWillpower', () => {
        it('sets active=false', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].startWillpower() })
            act(() => { result.current[1].stopWillpower() })

            expect(result.current[0].active).toBe(false)
        })

        it('cancels the rAF loop', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].startWillpower() })
            expect(rafCallbacks.size).toBe(1)

            act(() => { result.current[1].stopWillpower() })
            expect(rafCallbacks.size).toBe(0)
        })
    })

    // ── updateValue ────────────────────────────────────────────────────────

    describe('updateValue', () => {
        it('clamps to 0–100', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].updateValue(150) })
            expect(result.current[0].value).toBe(100)

            act(() => { result.current[1].updateValue(-10) })
            expect(result.current[0].value).toBe(0)
        })

        it('sets an intermediate value', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].updateValue(65) })
            expect(result.current[0].value).toBe(65)
        })
    })

    // ── checkWillpower ─────────────────────────────────────────────────────

    describe('checkWillpower', () => {
        it('returns true when value >= threshold', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].updateValue(70) })

            let passed: boolean
            act(() => {
                passed = result.current[1].checkWillpower(50)
            })

            expect(passed!).toBe(true)
        })

        it('returns false when value < threshold', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].updateValue(30) })

            let passed: boolean
            act(() => {
                passed = result.current[1].checkWillpower(50)
            })

            expect(passed!).toBe(false)
        })

        it('calls onPassCheck with result', () => {
            const onPassCheck = vi.fn()
            const { result } = renderHook(() => useWillpowerSystem(onPassCheck))

            act(() => { result.current[1].updateValue(60) })
            act(() => { result.current[1].checkWillpower(50) })

            expect(onPassCheck).toHaveBeenCalledWith(true)
        })

        it('uses current valueRef instantly (not stale state)', () => {
            // updateValue syncs both state and valueRef; check should read ref
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => {
                result.current[1].updateValue(10)
            })

            let passed: boolean
            act(() => {
                passed = result.current[1].checkWillpower(50)
            })

            expect(passed!).toBe(false)
        })
    })

    // ── rAF decay loop ─────────────────────────────────────────────────────

    describe('decay loop', () => {
        it('decays value over time at the normal rate', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].startWillpower({ decayRate: 'normal' }) })

            // Advance 10 frames @ 16.67ms → ~0.167s
            // Normal decay = 4.5/s → expected decay ≈ 0.75%
            // First frame has dt=0, so real decay is over 9 frames
            act(() => { advanceFrames(10) })

            const { value } = result.current[0]
            // Should be less than 100 but not yet near 0
            expect(value).toBeLessThan(100)
            expect(value).toBeGreaterThan(98)
        })

        it('decays faster with extreme rate', () => {
            const normalHook = renderHook(() => useWillpowerSystem())
            const extremeHook = renderHook(() => useWillpowerSystem())

            act(() => {
                normalHook.result.current[1].startWillpower({ decayRate: 'normal' })
                extremeHook.result.current[1].startWillpower({ decayRate: 'extreme' })
            })

            act(() => { advanceFrames(30) }) // ~0.5s

            const normalValue = normalHook.result.current[0].value
            const extremeValue = extremeHook.result.current[0].value

            expect(extremeValue).toBeLessThan(normalValue)
        })

        it('never decays below 0', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].startWillpower({ decayRate: 'extreme', value: 1 }) })

            // Many frames at 16.67ms each — far more than needed to drain 1%
            act(() => { advanceFrames(60) })

            expect(result.current[0].value).toBeGreaterThanOrEqual(0)
        })

        it('stops decaying after stopWillpower', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].startWillpower({ decayRate: 'extreme' }) })
            act(() => { advanceFrames(10) })

            const valueAtStop = result.current[0].value
            act(() => { result.current[1].stopWillpower() })

            // Advance more frames — rAF is cancelled so no new callbacks
            act(() => { advanceFrames(20) })

            expect(result.current[0].value).toBe(valueAtStop)
        })

        it('calls onValueChange each frame', () => {
            const onValueChange = vi.fn()
            const { result } = renderHook(() => useWillpowerSystem(undefined, onValueChange))

            act(() => { result.current[1].startWillpower() })
            act(() => { advanceFrames(5) })

            // onValueChange called once per frame (5 frames)
            expect(onValueChange).toHaveBeenCalledTimes(5)
        })

        it('does not call onValueChange after stop', () => {
            const onValueChange = vi.fn()
            const { result } = renderHook(() => useWillpowerSystem(undefined, onValueChange))

            act(() => { result.current[1].startWillpower() })
            act(() => { advanceFrames(3) })

            const callsAtStop = onValueChange.mock.calls.length

            act(() => { result.current[1].stopWillpower() })
            act(() => { advanceFrames(5) })

            expect(onValueChange).toHaveBeenCalledTimes(callsAtStop)
        })

        it('caps deltaTime to 0.1s to prevent large jumps after tab switch', () => {
            const { result } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].startWillpower({ decayRate: 'extreme', value: 50 }) })

            // Fire one huge frame (5s gap) — dt should be capped at 0.1s
            // extreme rate = 14/s × 0.1s = 1.4 reduction max (first frame is dt=0)
            act(() => { advanceFrames(1, 0) })       // first frame, dt=0
            act(() => { advanceFrames(1, 5000) })    // 5-second gap frame

            const { value } = result.current[0]
            // With dt capped at 0.1: 50 - (14 * 0.1) = 50 - 1.4 = 48.6
            // Without cap: 50 - (14 * 5) = -20 (clamped to 0)
            expect(value).toBeGreaterThan(45)
        })
    })

    // ── Cleanup ────────────────────────────────────────────────────────────

    describe('cleanup', () => {
        it('cancels rAF on unmount', () => {
            const { result, unmount } = renderHook(() => useWillpowerSystem())

            act(() => { result.current[1].startWillpower() })
            expect(rafCallbacks.size).toBe(1)

            unmount()
            expect(rafCallbacks.size).toBe(0)
        })
    })
})
