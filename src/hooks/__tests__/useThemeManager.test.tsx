import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useThemeManager } from '../useThemeManager'

describe('useThemeManager', () => {
    // Save original styles to restore after tests
    const originalStyles = {}

    beforeEach(() => {
        vi.useFakeTimers()

        // Mock get/setProperty to track calls if needed, or just check documentElement
        // jsdom implements style, so we can check it directly
    })

    afterEach(() => {
        vi.useRealTimers()
        document.documentElement.removeAttribute('style')
    })

    it('should stay not ready if config is not loaded', () => {
        const { result } = renderHook(() =>
            useThemeManager(null, 'test-story', false)
        )

        expect(result.current).toBe(false)

        // Advance time to check it doesn't default to true
        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(result.current).toBe(false)
    })

    it('should apply theme and become ready when config loads', async () => {
        const themeConfig = {
            theme: {
                primaryColor: '#ff0000',
                bgColor: '#000000',
                textColor: '#ffffff'
            }
        }

        const { result, rerender } = renderHook(
            ({ config, loaded }) => useThemeManager(config, 'test-story', loaded),
            {
                initialProps: { config: null, loaded: false }
            }
        )

        expect(result.current).toBe(false)

        // Simulate config load
        rerender({ config: themeConfig, loaded: true })

        // Should still be false initially (blocking UI)
        expect(result.current).toBe(false)

        // Check style application (should happen immediately in effect)
        expect(document.documentElement.style.getPropertyValue('--bardo-accent')).toBe('#ff0000')
        expect(document.documentElement.style.getPropertyValue('--bardo-bg')).toBe('#000000')

        // Fast forward buffer time (250ms)
        act(() => {
            vi.advanceTimersByTime(250)
        })

        expect(result.current).toBe(true)
    })

    it('should handle default theme (no theme in config) correctly', () => {
        const defaultConfig = {} // No theme property

        const { result } = renderHook(() =>
            useThemeManager(defaultConfig, 'test-story', true)
        )

        expect(result.current).toBe(false)

        // Fast forward default buffer time (200ms)
        act(() => {
            vi.advanceTimersByTime(200)
        })

        expect(result.current).toBe(true)
    })

    it('should update styles when theme changes', () => {
        const themeA = { theme: { primaryColor: 'blue' } }
        const themeB = { theme: { primaryColor: 'red' } }

        const { result, rerender } = renderHook(
            ({ config }) => useThemeManager(config, 'test-story', true),
            {
                initialProps: { config: themeA }
            }
        )

        // Advance to ready
        act(() => {
            vi.advanceTimersByTime(250)
        })
        expect(result.current).toBe(true)
        expect(document.documentElement.style.getPropertyValue('--bardo-accent')).toBe('blue')

        // Update theme
        rerender({ config: themeB })

        // Should go false briefly
        expect(result.current).toBe(false)
        expect(document.documentElement.style.getPropertyValue('--bardo-accent')).toBe('red')

        // Advance to ready
        act(() => {
            vi.advanceTimersByTime(250)
        })
        expect(result.current).toBe(true)
    })
})
