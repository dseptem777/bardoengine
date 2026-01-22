/**
 * Tests for useMinigames hook
 * Covers minigame lifecycle: start, finish, cancel
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useMinigames } from '../useMinigames'

describe('useMinigames', () => {
    describe('initialization', () => {
        it('should start with no active minigame', () => {
            const { result } = renderHook(() => useMinigames())

            expect(result.current.activeMinigame).toBeNull()
            expect(result.current.lastResult).toBeNull()
        })
    })

    describe('startMinigame', () => {
        it('should set active minigame with name and params', () => {
            const { result } = renderHook(() => useMinigames())

            act(() => {
                result.current.startMinigame('qte', { key: 'SPACE', timeout: 2 })
            })

            expect(result.current.activeMinigame).toEqual({
                name: 'qte',
                params: { key: 'SPACE', timeout: 2 }
            })
        })

        it('should use empty params if none provided', () => {
            const { result } = renderHook(() => useMinigames())

            act(() => {
                result.current.startMinigame('lockpick')
            })

            expect(result.current.activeMinigame).toEqual({
                name: 'lockpick',
                params: {}
            })
        })

        it('should clear lastResult when starting new game', () => {
            const { result } = renderHook(() => useMinigames())

            act(() => {
                result.current.startMinigame('qte')
                result.current.finishMinigame(true)
            })

            expect(result.current.lastResult).toBe(true)

            act(() => {
                result.current.startMinigame('lockpick')
            })

            expect(result.current.lastResult).toBeNull()
        })
    })

    describe('finishMinigame', () => {
        it('should set lastResult and clear active minigame', () => {
            const { result } = renderHook(() => useMinigames())

            act(() => {
                result.current.startMinigame('arkanoid')
            })

            act(() => {
                result.current.finishMinigame(true)
            })

            expect(result.current.activeMinigame).toBeNull()
            expect(result.current.lastResult).toBe(true)
        })

        it('should call onFinishCallback with result', () => {
            const onFinish = vi.fn()
            const { result } = renderHook(() => useMinigames(onFinish))

            act(() => {
                result.current.startMinigame('qte')
                result.current.finishMinigame(false)
            })

            expect(onFinish).toHaveBeenCalledWith(false)
        })

        it('should handle numeric results', () => {
            const onFinish = vi.fn()
            const { result } = renderHook(() => useMinigames(onFinish))

            act(() => {
                result.current.startMinigame('arkanoid')
                result.current.finishMinigame(1500) // Score
            })

            expect(result.current.lastResult).toBe(1500)
            expect(onFinish).toHaveBeenCalledWith(1500)
        })
    })

    describe('cancelMinigame', () => {
        it('should clear active minigame without setting result', () => {
            const onFinish = vi.fn()
            const { result } = renderHook(() => useMinigames(onFinish))

            act(() => {
                result.current.startMinigame('qte')
            })

            act(() => {
                result.current.cancelMinigame()
            })

            expect(result.current.activeMinigame).toBeNull()
            expect(result.current.lastResult).toBeNull()
            expect(onFinish).not.toHaveBeenCalled()
        })
    })
})
