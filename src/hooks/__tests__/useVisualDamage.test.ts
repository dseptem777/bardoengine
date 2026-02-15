import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useVisualDamage } from '../useVisualDamage'

describe('useVisualDamage', () => {
    const storyId = 'test_story'
    const storageKey = `bardoengine_visual_damage_${storyId}`

    beforeEach(() => {
        localStorage.clear()
        document.documentElement.style.filter = ''
    })

    afterEach(() => {
        document.documentElement.style.filter = ''
    })

    describe('initialization', () => {
        it('should start with 0 deaths and no grayscale', () => {
            const { result } = renderHook(() => useVisualDamage(storyId))

            expect(result.current.deathCount).toBe(0)
            expect(result.current.currentGrayscale).toBe(0)
            expect(document.documentElement.style.filter).toBe('')
        })

        it('should load persisted deaths from localStorage', () => {
            localStorage.setItem(storageKey, '3')

            const { result } = renderHook(() => useVisualDamage(storyId))

            expect(result.current.deathCount).toBe(3)
            expect(result.current.currentGrayscale).toBe(0.45)
            expect(document.documentElement.style.filter).toBe('grayscale(0.45)')
        })
    })

    describe('recordDeath', () => {
        it('should increment death count and apply grayscale', () => {
            const { result } = renderHook(() => useVisualDamage(storyId))

            act(() => {
                result.current.recordDeath()
            })

            expect(result.current.deathCount).toBe(1)
            expect(result.current.currentGrayscale).toBe(0.15)
            expect(document.documentElement.style.filter).toBe('grayscale(0.15)')
            expect(localStorage.getItem(storageKey)).toBe('1')
        })

        it('should increment multiple times', () => {
            const { result } = renderHook(() => useVisualDamage(storyId))

            act(() => {
                result.current.recordDeath()
            })
            act(() => {
                result.current.recordDeath()
            })

            expect(result.current.deathCount).toBe(2)
            expect(result.current.currentGrayscale).toBe(0.3)
            expect(localStorage.getItem(storageKey)).toBe('2')
        })

        it('should cap grayscale at 0.6', () => {
            localStorage.setItem(storageKey, '3')

            const { result } = renderHook(() => useVisualDamage(storyId))

            act(() => {
                result.current.recordDeath()
            })

            expect(result.current.deathCount).toBe(4)
            expect(result.current.currentGrayscale).toBe(0.6)
            expect(document.documentElement.style.filter).toBe('grayscale(0.6)')

            // One more death should still cap at 0.6
            act(() => {
                result.current.recordDeath()
            })

            expect(result.current.deathCount).toBe(5)
            expect(result.current.currentGrayscale).toBe(0.6)
            expect(document.documentElement.style.filter).toBe('grayscale(0.6)')
        })
    })

    describe('resetDamage', () => {
        it('should clear everything on resetDamage', () => {
            localStorage.setItem(storageKey, '3')

            const { result } = renderHook(() => useVisualDamage(storyId))

            expect(result.current.deathCount).toBe(3)

            act(() => {
                result.current.resetDamage()
            })

            expect(result.current.deathCount).toBe(0)
            expect(result.current.currentGrayscale).toBe(0)
            expect(document.documentElement.style.filter).toBe('')
            expect(localStorage.getItem(storageKey)).toBeNull()
        })
    })

    describe('persistence across re-renders', () => {
        it('should persist state across re-renders', () => {
            const { result, rerender } = renderHook(() => useVisualDamage(storyId))

            act(() => {
                result.current.recordDeath()
            })

            rerender()

            expect(result.current.deathCount).toBe(1)
            expect(result.current.currentGrayscale).toBe(0.15)
        })
    })

    describe('cleanup', () => {
        it('should remove filter on unmount', () => {
            const { result, unmount } = renderHook(() => useVisualDamage(storyId))

            act(() => {
                result.current.recordDeath()
            })

            expect(document.documentElement.style.filter).toBe('grayscale(0.15)')

            unmount()

            expect(document.documentElement.style.filter).toBe('')
        })
    })
})
