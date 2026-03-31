/**
 * Tests for useAudio hook
 * Covers SFX playback, music control, and volume management
 * 
 * Note: These tests verify the hook API works correctly with mocked Howler.
 * The actual audio playback is mocked in the test setup.
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to mock howler at the module level for this specific test file
// to ensure the constructor works properly
vi.mock('howler', () => {
    // Must use regular function (not arrow) so it can be called with `new`
    const MockHowl = vi.fn(function () {
        this.play = vi.fn()
        this.pause = vi.fn()
        this.stop = vi.fn()
        this.fade = vi.fn()
        this.volume = vi.fn().mockReturnValue(0.5)
        this.unload = vi.fn()
        this.on = vi.fn()
        this.playing = vi.fn().mockReturnValue(false)
    })

    return {
        Howl: MockHowl,
        Howler: {
            volume: vi.fn()
        }
    }
})

// Import after mock
import { Howl } from 'howler'
import { useAudio } from '../useAudio'

describe('useAudio', () => {
    beforeEach(() => {
        // Only clear call history, NOT implementations — clearAllMocks wipes mockImplementation
        // which breaks the Howl constructor mock
        Howl.mockClear()
    })

    describe('initialization', () => {
        it('should return all expected functions', () => {
            const { result } = renderHook(() => useAudio())

            expect(result.current.playSfx).toBeInstanceOf(Function)
            expect(result.current.stopAllSfx).toBeInstanceOf(Function)
            expect(result.current.playMusic).toBeInstanceOf(Function)
            expect(result.current.stopMusic).toBeInstanceOf(Function)
            expect(result.current.setMusicVolume).toBeInstanceOf(Function)
            expect(result.current.stopAll).toBeInstanceOf(Function)
            expect(result.current.setMasterVolume).toBeInstanceOf(Function)
        })

        it('should accept custom volumes', () => {
            const { result } = renderHook(() => useAudio({
                sfxVolume: 0.5,
                musicVolume: 0.3
            }))

            expect(result.current.playSfx).toBeDefined()
        })
    })

    describe('playSfx', () => {
        it('should create Howl instance for any SFX id (dynamic path resolution)', () => {
            const { result } = renderHook(() => useAudio())

            act(() => {
                result.current.playSfx('any_sound')
            })

            // Dynamic resolution: any ID maps to /sounds/{id}.mp3
            // Howl's onloaderror handles missing files gracefully
            expect(Howl).toHaveBeenCalledWith(
                expect.objectContaining({ src: ['/sounds/any_sound.mp3'] })
            )
        })
        // Manual testing confirms playSfx works correctly with real audio files.
    })

    describe('playMusic', () => {
        it('should use dynamic fallback path for tracks not in registry', () => {
            const { result } = renderHook(() => useAudio())

            act(() => {
                result.current.playMusic('nonexistent_track')
            })

            // Code falls back to /music/{id}.mp3 for unknown tracks
            expect(Howl).toHaveBeenCalledWith(
                expect.objectContaining({ src: ['/music/nonexistent_track.mp3'] })
            )
        })
    })

    describe('stopMusic', () => {
        it('should not throw when no music is playing', () => {
            const { result } = renderHook(() => useAudio())

            expect(() => {
                act(() => {
                    result.current.stopMusic()
                })
            }).not.toThrow()
        })
    })

    describe('stopAllSfx', () => {
        it('should not throw', () => {
            const { result } = renderHook(() => useAudio())

            expect(() => {
                act(() => {
                    result.current.stopAllSfx()
                })
            }).not.toThrow()
        })
    })

    describe('stopAll', () => {
        it('should not throw', () => {
            const { result } = renderHook(() => useAudio())

            expect(() => {
                act(() => {
                    result.current.stopAll()
                })
            }).not.toThrow()
        })
    })

    describe('volume controls', () => {
        it('should allow setting music volume', () => {
            const { result } = renderHook(() => useAudio())

            expect(() => {
                act(() => {
                    result.current.setMusicVolume(0.5)
                })
            }).not.toThrow()
        })

        it('should allow setting master volume', () => {
            const { result } = renderHook(() => useAudio())

            expect(() => {
                act(() => {
                    result.current.setMasterVolume(0.8)
                })
            }).not.toThrow()
        })
    })
})
