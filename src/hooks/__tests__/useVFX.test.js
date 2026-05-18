/**
 * Tests for useVFX hook
 * Covers VFX triggering, audio callbacks, and state management
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useVFX } from '../useVFX'

describe('useVFX', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('initialization', () => {
        it('should start with default VFX state', () => {
            const { result } = renderHook(() => useVFX())

            expect(result.current.vfxState).toEqual({
                shake: false,
                flash: null,
                background: null,
                horrorEffect: null,
                horrorIntensity: 1.0
            })
        })
    })

    describe('shake effect', () => {
        it('should trigger shake and clear after 500ms', () => {
            const { result } = renderHook(() => useVFX())

            act(() => {
                result.current.triggerVFX('shake')
            })

            expect(result.current.vfxState.shake).toBe(true)

            act(() => {
                vi.advanceTimersByTime(500)
            })

            expect(result.current.vfxState.shake).toBe(false)
        })
    })

    describe('flash effect', () => {
        it('should trigger flash_red and clear after 400ms', () => {
            const { result } = renderHook(() => useVFX())

            act(() => {
                result.current.triggerVFX('flash_red')
            })

            expect(result.current.vfxState.flash).toBe('red')

            act(() => {
                vi.advanceTimersByTime(400)
            })

            expect(result.current.vfxState.flash).toBeNull()
        })

        it('should trigger flash_white', () => {
            const { result } = renderHook(() => useVFX())

            act(() => {
                result.current.triggerVFX('flash_white')
            })

            expect(result.current.vfxState.flash).toBe('white')
        })

        it('should cycle colors on flash_multi', () => {
            const { result } = renderHook(() => useVFX())

            act(() => {
                result.current.triggerVFX('flash_multi')
            })

            // The tag flash_multi first matches flash_, setting flash to 'multi'
            // Then the setInterval in flash_multi handler starts cycling
            // After a few intervals the colors change

            // Fast forward through all intervals to completion (5 x 100ms = 500ms)
            act(() => {
                vi.advanceTimersByTime(600)
            })

            // At the end, flash should be null (cleared after cycling)
            expect(result.current.vfxState.flash).toBeNull()
        })
    })

    describe('background', () => {
        it('should set background from bg: tag', () => {
            const { result } = renderHook(() => useVFX())

            act(() => {
                result.current.triggerVFX('bg:forest.jpg')
            })

            expect(result.current.vfxState.background).toBe('forest.jpg')
        })

        it('should work even when vfxEnabled is false', () => {
            const { result } = renderHook(() => useVFX({}, false))

            act(() => {
                result.current.triggerVFX('bg:city.png')
            })

            expect(result.current.vfxState.background).toBe('city.png')
        })
    })

    describe('SFX callbacks', () => {
        it('should call playSfx with correct id', () => {
            const playSfx = vi.fn()
            const { result } = renderHook(() => useVFX({ playSfx }))

            act(() => {
                result.current.triggerVFX('play_sfx:gunshot')
            })

            expect(playSfx).toHaveBeenCalledWith('gunshot')
        })

        it('should not crash when playSfx is not provided', () => {
            const { result } = renderHook(() => useVFX())

            expect(() => {
                act(() => {
                    result.current.triggerVFX('play_sfx:test')
                })
            }).not.toThrow()
        })
    })

    describe('music callbacks', () => {
        it('should call playMusic with track id', () => {
            const playMusic = vi.fn()
            const { result } = renderHook(() => useVFX({ playMusic }))

            act(() => {
                result.current.triggerVFX('music:ambient_forest')
            })

            expect(playMusic).toHaveBeenCalledWith('ambient_forest')
        })

        it('should call stopMusic on music:stop', () => {
            const stopMusic = vi.fn()
            const { result } = renderHook(() => useVFX({ stopMusic }))

            act(() => {
                result.current.triggerVFX('music:stop')
            })

            expect(stopMusic).toHaveBeenCalled()
        })
    })

    describe('vfxEnabled toggle', () => {
        it('should not trigger shake when vfxEnabled is false', () => {
            const { result } = renderHook(() => useVFX({}, false))

            act(() => {
                result.current.triggerVFX('shake')
            })

            expect(result.current.vfxState.shake).toBe(false)
        })

        it('should not trigger flash when vfxEnabled is false', () => {
            const { result } = renderHook(() => useVFX({}, false))

            act(() => {
                result.current.triggerVFX('flash_red')
            })

            expect(result.current.vfxState.flash).toBeNull()
        })

        it('should still call SFX when vfxEnabled is false', () => {
            const playSfx = vi.fn()
            const { result } = renderHook(() => useVFX({ playSfx }, false))

            act(() => {
                result.current.triggerVFX('play_sfx:sound')
            })

            expect(playSfx).toHaveBeenCalled()
        })
    })

    describe('clearVFX', () => {
        it('should clear shake and flash', () => {
            const { result } = renderHook(() => useVFX())

            act(() => {
                result.current.triggerVFX('shake')
                result.current.triggerVFX('flash_blue')
            })

            expect(result.current.vfxState.shake).toBe(true)
            expect(result.current.vfxState.flash).toBe('blue')

            act(() => {
                result.current.clearVFX()
            })

            expect(result.current.vfxState.shake).toBe(false)
            expect(result.current.vfxState.flash).toBeNull()
        })

        it('should not clear background', () => {
            const { result } = renderHook(() => useVFX())

            act(() => {
                result.current.triggerVFX('bg:test.jpg')
            })

            act(() => {
                result.current.clearVFX()
            })

            expect(result.current.vfxState.background).toBe('test.jpg')
        })
    })
})
