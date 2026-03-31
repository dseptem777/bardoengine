/**
 * Tests for useWillpowerAudio hook
 *
 * The hook synthesizes audio via the Web Audio API.
 * We mock AudioContext at the global level to avoid real audio in tests.
 *
 * Coverage:
 *   - start() creates AudioContext and all nodes
 *   - start() is idempotent (calling twice is a no-op)
 *   - setIntensity() clamps to 0–1 and updates drone gain
 *   - stop() clears timeouts and closes context
 *   - onStaticBurst callback fires when intensity > 0.6
 *   - No errors when AudioContext is unavailable
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWillpowerAudio } from '../useWillpowerAudio'

// ─────────────────────────────────────────────────────────────────────────────
// Web Audio API mock
// ─────────────────────────────────────────────────────────────────────────────

function makeMockGainNode() {
    return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        gain: {
            value: 1,
            setTargetAtTime: vi.fn(),
            setValueAtTime: vi.fn(),
            cancelScheduledValues: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
        },
    }
}

function makeMockOscillator() {
    return {
        connect: vi.fn(),
        type: 'sine',
        frequency: { value: 440, setValueAtTime: vi.fn() },
        start: vi.fn(),
        stop: vi.fn(),
    }
}

function makeMockFilter() {
    return {
        connect: vi.fn(),
        type: 'lowpass',
        frequency: { value: 350 },
        Q: { value: 1 },
    }
}

function makeMockBufferSource() {
    return {
        connect: vi.fn(),
        buffer: null as unknown,
        loop: false,
        start: vi.fn(),
        stop: vi.fn(),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a single context factory used across all tests in the file
// ─────────────────────────────────────────────────────────────────────────────

let mockCtxInstance: ReturnType<typeof makeCtxInstance>

function makeCtxInstance() {
    return {
        state: 'running' as string,
        currentTime: 0,
        sampleRate: 44100,
        destination: { connect: vi.fn() },
        resume: vi.fn(),
        close: vi.fn(),
        createGain: vi.fn(makeMockGainNode),
        createOscillator: vi.fn(makeMockOscillator),
        createBiquadFilter: vi.fn(makeMockFilter),
        createBuffer: vi.fn((_channels: number, length: number, _sampleRate: number) => ({
            getChannelData: vi.fn(() => new Float32Array(length)),
        })),
        createBufferSource: vi.fn(makeMockBufferSource),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup / teardown
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
    mockCtxInstance = makeCtxInstance()

    // Must use regular function so `new MockAudioContext()` works correctly
    // (arrow functions cannot be constructors)
    const ctxRef = { instance: mockCtxInstance }
    function MockAudioContext(this: unknown) {
        return ctxRef.instance
    }

    vi.stubGlobal('AudioContext', MockAudioContext)
    vi.stubGlobal('webkitAudioContext', MockAudioContext)

    vi.useFakeTimers()
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('useWillpowerAudio', () => {
    // ── Initialization ──────────────────────────────────────────────────────

    describe('initialization', () => {
        it('returns the three expected functions', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            expect(typeof result.current.start).toBe('function')
            expect(typeof result.current.setIntensity).toBe('function')
            expect(typeof result.current.stop).toBe('function')
        })
    })

    // ── start() ─────────────────────────────────────────────────────────────

    describe('start()', () => {
        it('creates gain nodes', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            // masterGain + hbGain + droneGain + droneNoiseGain = at least 4
            expect(mockCtxInstance.createGain.mock.calls.length).toBeGreaterThanOrEqual(4)
        })

        it('creates four oscillators', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            expect(mockCtxInstance.createOscillator).toHaveBeenCalledTimes(4)
        })

        it('creates a biquad filter for noise', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            expect(mockCtxInstance.createBiquadFilter).toHaveBeenCalledTimes(1)
        })

        it('starts all four oscillators', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            const oscNodes = mockCtxInstance.createOscillator.mock.results.map(
                (r: { value: ReturnType<typeof makeMockOscillator> }) => r.value
            )
            oscNodes.forEach((osc: ReturnType<typeof makeMockOscillator>) => {
                expect(osc.start).toHaveBeenCalled()
            })
        })

        it('resumes context when state is suspended', () => {
            mockCtxInstance.state = 'suspended'
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            expect(mockCtxInstance.resume).toHaveBeenCalled()
        })

        it('does NOT resume context when state is running', () => {
            mockCtxInstance.state = 'running'
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            expect(mockCtxInstance.resume).not.toHaveBeenCalled()
        })

        it('is idempotent — calling twice does not create a second context or extra nodes', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            const gainCallsAfterFirst = mockCtxInstance.createGain.mock.calls.length

            act(() => { result.current.start() })
            // No extra nodes should be created on the second call
            expect(mockCtxInstance.createGain.mock.calls.length).toBe(gainCallsAfterFirst)
        })
    })

    // ── setIntensity() ──────────────────────────────────────────────────────

    describe('setIntensity()', () => {
        it('does not throw when called before start()', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            expect(() => { result.current.setIntensity(0.5) }).not.toThrow()
        })

        it('calls setTargetAtTime on drone gain node after start()', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            act(() => { result.current.setIntensity(0.5) })

            // At least one gain node must have received a setTargetAtTime call
            const gainNodes = mockCtxInstance.createGain.mock.results.map(
                (r: { value: ReturnType<typeof makeMockGainNode> }) => r.value
            )
            const anyTargetAtTime = gainNodes.some(
                (node: ReturnType<typeof makeMockGainNode>) =>
                    node.gain.setTargetAtTime.mock.calls.length > 0
            )
            expect(anyTargetAtTime).toBe(true)
        })

        it('clamps values below 0 without throwing', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            expect(() => { result.current.setIntensity(-5) }).not.toThrow()
        })

        it('clamps values above 1 without throwing', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })
            expect(() => { result.current.setIntensity(99) }).not.toThrow()
        })
    })

    // ── stop() ──────────────────────────────────────────────────────────────

    describe('stop()', () => {
        it('does not throw when called before start()', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            expect(() => { result.current.stop() }).not.toThrow()
        })

        it('closes the context after the 600 ms fade', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })

            act(() => {
                result.current.stop()
                vi.advanceTimersByTime(700)
            })

            expect(mockCtxInstance.close).toHaveBeenCalled()
        })

        it('fades master gain to 0 via setTargetAtTime', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })

            // masterGain is the first gain node created
            const masterGainNode = mockCtxInstance.createGain.mock.results[0].value

            act(() => { result.current.stop() })

            expect(masterGainNode.gain.setTargetAtTime).toHaveBeenCalledWith(
                0,
                expect.any(Number),
                expect.any(Number)
            )
        })

        it('prevents further static burst timeouts after stop()', () => {
            const burst = vi.fn()
            const { result } = renderHook(() => useWillpowerAudio(burst))

            act(() => {
                result.current.start()
                result.current.setIntensity(0.9)
            })

            // Allow one burst cycle to possibly fire
            act(() => { vi.advanceTimersByTime(200) })

            const burstsBefore = burst.mock.calls.length

            act(() => {
                result.current.stop()
                // Advance well past any burst interval
                vi.advanceTimersByTime(20000)
            })

            // Should not accumulate many more bursts after stop
            expect(burst.mock.calls.length - burstsBefore).toBeLessThan(2)
        })
    })

    // ── onStaticBurst callback ───────────────────────────────────────────────

    describe('onStaticBurst callback', () => {
        it('is NOT called when intensity is 0 (willpower 100)', () => {
            const burst = vi.fn()
            const { result } = renderHook(() => useWillpowerAudio(burst))

            act(() => {
                result.current.start()
                result.current.setIntensity(0)
                vi.advanceTimersByTime(10000)
            })

            expect(burst).not.toHaveBeenCalled()
        })

        it('is NOT called when intensity is 0.6 (boundary)', () => {
            const burst = vi.fn()
            const { result } = renderHook(() => useWillpowerAudio(burst))

            act(() => {
                result.current.start()
                result.current.setIntensity(0.6)
                vi.advanceTimersByTime(10000)
            })

            expect(burst).not.toHaveBeenCalled()
        })

        it('IS called when intensity > 0.6 and enough time passes', () => {
            const burst = vi.fn()
            const { result } = renderHook(() => useWillpowerAudio(burst))

            act(() => {
                result.current.start()
                result.current.setIntensity(0.9)
                // Max possible interval at intensity 0.9: 2000 + (0.1)*6000 = 2600 ms
                // Advance well beyond that
                vi.advanceTimersByTime(15000)
            })

            expect(burst).toHaveBeenCalled()
        })
    })

    // ── Heartbeat scheduler ─────────────────────────────────────────────────

    describe('heartbeat scheduler', () => {
        it('schedules gain envelope changes on hb gain node after start()', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })

            // hbGain is the second gain node (index 1, after masterGain)
            const hbGainNode = mockCtxInstance.createGain.mock.results[1].value
            // cancelScheduledValues + setValueAtTime + linearRampToValueAtTime called
            expect(hbGainNode.gain.cancelScheduledValues).toHaveBeenCalled()
            expect(hbGainNode.gain.linearRampToValueAtTime).toHaveBeenCalled()
        })

        it('re-schedules itself over time (multiple envelope cycles)', () => {
            const { result } = renderHook(() => useWillpowerAudio())
            act(() => { result.current.start() })

            const hbGainNode = mockCtxInstance.createGain.mock.results[1].value
            const callsBefore = hbGainNode.gain.cancelScheduledValues.mock.calls.length

            act(() => {
                // At 60 BPM each beat is 1000 ms; advance 3 beats
                vi.advanceTimersByTime(3100)
            })

            expect(hbGainNode.gain.cancelScheduledValues.mock.calls.length).toBeGreaterThan(callsBefore)
        })
    })

    // ── Error resilience ─────────────────────────────────────────────────────

    describe('error resilience', () => {
        it('does not throw when AudioContext constructor throws', () => {
            function BrokenAudioContext(this: unknown) { throw new Error('No audio') }
            vi.stubGlobal('AudioContext', BrokenAudioContext)
            vi.stubGlobal('webkitAudioContext', BrokenAudioContext)

            const { result } = renderHook(() => useWillpowerAudio())
            expect(() => { result.current.start() }).not.toThrow()
        })

        it('does not throw when AudioContext is undefined', () => {
            vi.stubGlobal('AudioContext', undefined)
            vi.stubGlobal('webkitAudioContext', undefined)

            const { result } = renderHook(() => useWillpowerAudio())
            expect(() => { result.current.start() }).not.toThrow()
        })
    })
})
