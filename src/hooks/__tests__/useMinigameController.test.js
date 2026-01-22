/**
 * Tests for useMinigameController hook
 * Covers state machine, tag parsing, and result handling
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useMinigameController, parseMinigameTag } from '../useMinigameController'

describe('useMinigameController', () => {
    describe('state machine', () => {
        it('should start in idle state', () => {
            const { result } = renderHook(() => useMinigameController(() => { }))

            expect(result.current.state).toBe('idle')
            expect(result.current.isPending).toBe(false)
            expect(result.current.isPlaying).toBe(false)
        })

        it('should transition to pending when queueGame is called', () => {
            const { result } = renderHook(() => useMinigameController(() => { }))

            act(() => {
                result.current.queueGame({ type: 'qte', params: { key: 'SPACE' } })
            })

            expect(result.current.state).toBe('pending')
            expect(result.current.isPending).toBe(true)
            expect(result.current.config).toMatchObject({ type: 'qte' })
        })

        it('should transition to playing when startGame is called from pending', () => {
            const { result } = renderHook(() => useMinigameController(() => { }))

            act(() => {
                result.current.queueGame({ type: 'lockpick', params: {} })
            })

            act(() => {
                result.current.startGame()
            })

            expect(result.current.state).toBe('playing')
            expect(result.current.isPlaying).toBe(true)
        })

        it('should not start if not in pending state', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
            const { result } = renderHook(() => useMinigameController(() => { }))

            act(() => {
                result.current.startGame() // Called from idle
            })

            expect(result.current.state).toBe('idle')
            expect(warnSpy).toHaveBeenCalled()
            warnSpy.mockRestore()
        })

        it('should transition to idle when finishGame is called', () => {
            const onResultCommit = vi.fn()
            const { result } = renderHook(() => useMinigameController(onResultCommit))

            act(() => {
                result.current.queueGame({ type: 'qte', params: {} })
            })

            act(() => {
                result.current.startGame()
            })

            act(() => {
                result.current.finishGame(true)
            })

            expect(result.current.state).toBe('idle')
            expect(result.current.config).toBeNull()
        })
    })

    describe('result handling', () => {
        it('should call onResultCommit with 1 on win', () => {
            const onResultCommit = vi.fn()
            const { result } = renderHook(() => useMinigameController(onResultCommit))

            act(() => {
                result.current.queueGame({ type: 'qte', params: {} })
                result.current.startGame()
                result.current.finishGame(true)
            })

            expect(onResultCommit).toHaveBeenCalledWith(1)
        })

        it('should call onResultCommit with 0 on lose', () => {
            const onResultCommit = vi.fn()
            const { result } = renderHook(() => useMinigameController(onResultCommit))

            act(() => {
                result.current.queueGame({ type: 'qte', params: {} })
                result.current.startGame()
                result.current.finishGame(false)
            })

            expect(onResultCommit).toHaveBeenCalledWith(0)
        })

        it('should call onResultCommit with 1 when passed 1', () => {
            const onResultCommit = vi.fn()
            const { result } = renderHook(() => useMinigameController(onResultCommit))

            act(() => {
                result.current.queueGame({ type: 'qte', params: {} })
                result.current.startGame()
                result.current.finishGame(1)
            })

            expect(onResultCommit).toHaveBeenCalledWith(1)
        })
    })

    describe('cancelGame', () => {
        it('should return to idle without calling onResultCommit', () => {
            const onResultCommit = vi.fn()
            const { result } = renderHook(() => useMinigameController(onResultCommit))

            act(() => {
                result.current.queueGame({ type: 'qte', params: {} })
            })

            act(() => {
                result.current.cancelGame()
            })

            expect(result.current.state).toBe('idle')
            expect(result.current.config).toBeNull()
            expect(onResultCommit).not.toHaveBeenCalled()
        })
    })

    describe('reset', () => {
        it('should reset all state', () => {
            const { result } = renderHook(() => useMinigameController(() => { }))

            act(() => {
                result.current.queueGame({ type: 'qte', params: {} })
                result.current.startGame()
            })

            act(() => {
                result.current.reset()
            })

            expect(result.current.state).toBe('idle')
            expect(result.current.config).toBeNull()
        })
    })
})

describe('parseMinigameTag', () => {
    describe('validation', () => {
        it('should return null for non-minigame tags', () => {
            expect(parseMinigameTag('shake')).toBeNull()
            expect(parseMinigameTag('play_sfx:gunshot')).toBeNull()
            expect(parseMinigameTag('')).toBeNull()
            expect(parseMinigameTag(null)).toBeNull()
        })
    })

    describe('legacy format', () => {
        it('should parse QTE: minigame:qte:KEY:timeout', () => {
            const result = parseMinigameTag('minigame:qte:SPACE:1.5')

            expect(result).toEqual({
                type: 'qte',
                params: { key: 'SPACE', timeout: 1.5 },
                autoStart: true
            })
        })

        it('should parse QTE with defaults', () => {
            const result = parseMinigameTag('minigame:qte')

            expect(result).toEqual({
                type: 'qte',
                params: { key: 'SPACE', timeout: 2.0 },
                autoStart: true
            })
        })

        it('should parse lockpick: minigame:lockpick:zoneSize:speed', () => {
            const result = parseMinigameTag('minigame:lockpick:0.2:2.0')

            expect(result).toEqual({
                type: 'lockpick',
                params: { zoneSize: 0.2, speed: 2.0 },
                autoStart: true
            })
        })

        it('should parse arkanoid with no params', () => {
            const result = parseMinigameTag('minigame:arkanoid')

            expect(result).toEqual({
                type: 'arkanoid',
                params: {},
                autoStart: true
            })
        })
    })

    describe('new format (key=value)', () => {
        it('should parse simple new format', () => {
            const result = parseMinigameTag('minigame: type=qte, key=SPACE, timeout=2.5')

            expect(result).toEqual({
                type: 'qte',
                params: { key: 'SPACE', timeout: 2.5 },
                autoStart: true
            })
        })

        it('should parse autostart=false', () => {
            const result = parseMinigameTag('minigame: type=lockpick, autostart=false')

            expect(result).toMatchObject({
                type: 'lockpick',
                autoStart: false
            })
        })

        it('should parse consequence tags (onFail, onSuccess)', () => {
            const result = parseMinigameTag('minigame: type=qte, onFail=stat:hp:-10, onSuccess=inv:add:llave')

            expect(result.params.onFail).toBe('stat:hp:-10')
            expect(result.params.onSuccess).toBe('inv:add:llave')
        })

        it('should parse consume tag', () => {
            const result = parseMinigameTag('minigame: type=lockpick, consume=ganzua')

            expect(result.params.consumeItem).toBe('ganzua')
        })
    })

    describe('Ink variable resolution', () => {
        it('should resolve Ink variables with storyRef', () => {
            const mockStoryRef = {
                current: {
                    variablesState: {
                        agilidad: 5,
                        dificultad: 1.5
                    }
                }
            }

            const result = parseMinigameTag('minigame: type=lockpick, speed={agilidad}', mockStoryRef)

            expect(result.params.speed).toBe(5)
        })

        it('should keep placeholder when variable not found', () => {
            const mockStoryRef = {
                current: {
                    variablesState: {}
                }
            }

            const result = parseMinigameTag('minigame: type=lockpick, speed={nonexistent}', mockStoryRef)

            expect(result.params.speed).toBe('{nonexistent}')
        })

        it('should work without storyRef (null)', () => {
            const result = parseMinigameTag('minigame: type=qte, timeout={agilidad}', null)

            expect(result.params.timeout).toBe('{agilidad}')
        })
    })
})
