/**
 * Tests for useSettings hook and SettingsProvider
 * Covers settings persistence, updates, and volume/speed conversions
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettingsProvider, useSettings } from '../useSettings'

// Wrapper component for testing context hook
const wrapper = ({ children }) => (
    <SettingsProvider storyId="test_story">
        {children}
    </SettingsProvider>
)

describe('useSettings', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('initialization', () => {
        it('should provide default settings', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            expect(result.current.settings).toMatchObject({
                musicVolume: 40,
                sfxVolume: 70,
                typewriterSpeed: 3,
                autoAdvance: false,
                vfxEnabled: true,
                fontSize: 'normal'
            })
        })

        it('should load saved settings from localStorage', () => {
            localStorage.setItem('bardoengine_settings_test_story', JSON.stringify({
                musicVolume: 80,
                sfxVolume: 50
            }))

            const { result } = renderHook(() => useSettings(), { wrapper })

            expect(result.current.settings.musicVolume).toBe(80)
            expect(result.current.settings.sfxVolume).toBe(50)
            // Should merge with defaults
            expect(result.current.settings.vfxEnabled).toBe(true)
        })

        it('should throw error when used outside provider', () => {
            expect(() => {
                renderHook(() => useSettings())
            }).toThrow('useSettings must be used within a SettingsProvider')
        })
    })

    describe('updateSetting', () => {
        it('should update a single setting', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            act(() => {
                result.current.updateSetting('musicVolume', 60)
            })

            expect(result.current.settings.musicVolume).toBe(60)
        })

        it('should persist to localStorage', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            act(() => {
                result.current.updateSetting('sfxVolume', 30)
            })

            const saved = JSON.parse(localStorage.getItem('bardoengine_settings_test_story'))
            expect(saved.sfxVolume).toBe(30)
        })
    })

    describe('resetSettings', () => {
        it('should reset all settings to defaults', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            act(() => {
                result.current.updateSetting('musicVolume', 100)
                result.current.updateSetting('vfxEnabled', false)
            })

            expect(result.current.settings.musicVolume).toBe(100)
            expect(result.current.settings.vfxEnabled).toBe(false)

            act(() => {
                result.current.resetSettings()
            })

            expect(result.current.settings.musicVolume).toBe(40)
            expect(result.current.settings.vfxEnabled).toBe(true)
        })
    })

    describe('volume conversions', () => {
        it('should convert music volume 0-100 to 0-1', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            // Default is 40
            expect(result.current.getMusicVolume()).toBe(0.4)

            act(() => {
                result.current.updateSetting('musicVolume', 100)
            })

            expect(result.current.getMusicVolume()).toBe(1)
        })

        it('should convert SFX volume 0-100 to 0-1', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            // Default is 70
            expect(result.current.getSfxVolume()).toBe(0.7)

            act(() => {
                result.current.updateSetting('sfxVolume', 0)
            })

            expect(result.current.getSfxVolume()).toBe(0)
        })
    })

    describe('typewriter delay', () => {
        it('should return correct delay for speed settings', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            // Default speed 3 = 30ms
            expect(result.current.getTypewriterDelay()).toBe(30)

            act(() => {
                result.current.updateSetting('typewriterSpeed', 0)
            })
            expect(result.current.getTypewriterDelay()).toBe(0) // Instant

            act(() => {
                result.current.updateSetting('typewriterSpeed', 5)
            })
            expect(result.current.getTypewriterDelay()).toBe(10) // Very fast
        })
    })

    describe('fullscreen', () => {
        it('should have isFullscreen state', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            expect(result.current.isFullscreen).toBe(false)
        })

        it('should have toggleFullscreen function', () => {
            const { result } = renderHook(() => useSettings(), { wrapper })

            expect(result.current.toggleFullscreen).toBeInstanceOf(Function)
        })
    })
})

describe('SettingsProvider story switching', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('should isolate settings per story', () => {
        // Save settings for story_a
        localStorage.setItem('bardoengine_settings_story_a', JSON.stringify({
            musicVolume: 90
        }))

        // Save settings for story_b
        localStorage.setItem('bardoengine_settings_story_b', JSON.stringify({
            musicVolume: 10
        }))

        // Render with story_a
        const wrapperA = ({ children }) => (
            <SettingsProvider storyId="story_a">{children}</SettingsProvider>
        )
        const { result: resultA } = renderHook(() => useSettings(), { wrapper: wrapperA })
        expect(resultA.current.settings.musicVolume).toBe(90)

        // Render with story_b
        const wrapperB = ({ children }) => (
            <SettingsProvider storyId="story_b">{children}</SettingsProvider>
        )
        const { result: resultB } = renderHook(() => useSettings(), { wrapper: wrapperB })
        expect(resultB.current.settings.musicVolume).toBe(10)
    })
})
