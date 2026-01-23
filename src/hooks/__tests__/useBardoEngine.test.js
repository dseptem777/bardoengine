import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBardoEngine } from '../useBardoEngine'

// Mocking sub-hooks
vi.mock('../useAudio', () => ({
    useAudio: () => ({
        playSfx: vi.fn(),
        playMusic: vi.fn(),
        stopMusic: vi.fn(),
        stopAllAudio: vi.fn()
    })
}))

vi.mock('../useVFX', () => ({
    useVFX: () => ({
        vfxState: null,
        triggerVFX: vi.fn(),
        clearVFX: vi.fn()
    })
}))

vi.mock('../useSaveSystem', () => ({
    useSaveSystem: () => ({
        saves: [],
        hasAnySave: false,
        hasContinue: false,
        saveGame: vi.fn(),
        loadSave: vi.fn(),
        loadLastSave: vi.fn(),
        deleteSave: vi.fn()
    })
}))

vi.mock('../useGameSystems', () => ({
    useGameSystems: vi.fn()
}))

vi.mock('../useAchievements', () => ({
    useAchievements: () => ({
        achievements: [],
        stats: {},
        pendingToast: null,
        clearToast: vi.fn(),
        resetAllAchievements: vi.fn()
    })
}))

vi.mock('../useMinigameController', () => ({
    useMinigameController: () => ({
        isPlaying: false,
        isPending: false,
        config: null,
        startGame: vi.fn(),
        finishGame: vi.fn(),
        cancelGame: vi.fn()
    })
}))

// Mocking external libraries
vi.mock('inkjs', () => ({
    Story: vi.fn()
}))

import { useGameSystems } from '../useGameSystems'

describe('useBardoEngine', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset document element styles
        document.documentElement.style.removeProperty('--bardo-accent')
        document.documentElement.style.removeProperty('--bardo-bg')
    })

    describe('Theme Injection', () => {
        it('should set isThemeReady to true when a theme is successfully injected', async () => {
            // Setup useGameSystems mock with a theme
            useGameSystems.mockReturnValue({
                config: {
                    theme: { primaryColor: '#ff0000', bgColor: '#000000' }
                },
                configLoaded: true,
                stats: {},
                inventory: [],
                resetGameSystems: vi.fn(),
                exportGameSystems: vi.fn()
            })

            const mockProps = {
                storyId: 'test',
                settings: { vfxEnabled: true },
                getTypewriterDelay: vi.fn(),
                getMusicVolume: vi.fn().mockReturnValue(0.5),
                getSfxVolume: vi.fn().mockReturnValue(0.7)
            }

            const { result } = renderHook(() => useBardoEngine(mockProps))

            // Effect should run and set theme ready
            await waitFor(() => {
                expect(result.current.isThemeReady).toBe(true)
            })

            expect(document.documentElement.style.getPropertyValue('--bardo-accent')).toBe('#ff0000')
        })

        it('should set isThemeReady to true even if theme config is missing (Phase B.8 Bug Fix)', async () => {
            // Setup useGameSystems mock WITHOUT a theme
            useGameSystems.mockReturnValue({
                config: {
                    // Title and version only, no theme property
                    title: 'Generic Game',
                    version: '1.0.0'
                },
                configLoaded: true,
                stats: {},
                inventory: [],
                resetGameSystems: vi.fn(),
                exportGameSystems: vi.fn()
            })

            const mockProps = {
                storyId: 'test',
                settings: { vfxEnabled: true },
                getTypewriterDelay: vi.fn(),
                getMusicVolume: vi.fn().mockReturnValue(0.5),
                getSfxVolume: vi.fn().mockReturnValue(0.7)
            }

            const { result } = renderHook(() => useBardoEngine(mockProps))

            // Should be ready despite missing theme
            await waitFor(() => {
                expect(result.current.isThemeReady).toBe(true)
            })

            // Should NOT have set properties (or they should be default/empty)
            expect(document.documentElement.style.getPropertyValue('--bardo-accent')).toBe('')
        })

        it('should update theme when config changes', async () => {
            const mockConfig = {
                config: { theme: { primaryColor: '#111111' } },
                configLoaded: true,
                stats: {},
                inventory: [],
                resetGameSystems: vi.fn(),
                exportGameSystems: vi.fn()
            }
            useGameSystems.mockReturnValue(mockConfig)

            const mockProps = {
                storyId: 'test',
                settings: { vfxEnabled: true },
                getTypewriterDelay: vi.fn(),
                getMusicVolume: vi.fn().mockReturnValue(0.5),
                getSfxVolume: vi.fn().mockReturnValue(0.7)
            }

            const { result, rerender } = renderHook((props) => useBardoEngine(props), {
                initialProps: mockProps
            })

            await waitFor(() => expect(result.current.isThemeReady).toBe(true))
            expect(document.documentElement.style.getPropertyValue('--bardo-accent')).toBe('#111111')

            // Update mock for "next" render
            mockConfig.config = { theme: { primaryColor: '#222222' } }

            // Rerender to trigger effect and see change
            rerender(mockProps)

            await waitFor(() => {
                expect(document.documentElement.style.getPropertyValue('--bardo-accent')).toBe('#222222')
            })
        })
    })
})
