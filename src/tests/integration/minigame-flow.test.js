/**
 * Integration test: Minigame Flow
 * Tests the complete flow from tag parsing to game completion
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useMinigameController, parseMinigameTag } from '../../hooks/useMinigameController'

describe('Minigame Flow Integration', () => {
    it('should complete full minigame flow: parse → queue → start → finish → commit', () => {
        const onResultCommit = vi.fn()
        const { result } = renderHook(() => useMinigameController(onResultCommit))

        // Step 1: Parse tag (simulating what App.jsx does)
        const tag = 'minigame: type=qte, key=SPACE, timeout=2.5'
        const config = parseMinigameTag(tag)

        expect(config).toMatchObject({
            type: 'qte',
            params: { key: 'SPACE', timeout: 2.5 },
            autoStart: true
        })

        // Step 2: Queue the game
        act(() => {
            result.current.queueGame(config)
        })

        expect(result.current.state).toBe('pending')
        expect(result.current.isPending).toBe(true)

        // Step 3: Start the game (could be auto or manual)
        act(() => {
            result.current.startGame()
        })

        expect(result.current.state).toBe('playing')
        expect(result.current.isPlaying).toBe(true)
        expect(result.current.config.type).toBe('qte')

        // Step 4: Complete with success
        act(() => {
            result.current.finishGame(true)
        })

        // Step 5: Verify result was committed
        expect(result.current.state).toBe('idle')
        expect(onResultCommit).toHaveBeenCalledWith(1)
    })

    it('should handle failure flow correctly', () => {
        const onResultCommit = vi.fn()
        const { result } = renderHook(() => useMinigameController(onResultCommit))

        const config = parseMinigameTag('minigame:lockpick:0.15:1.5')

        act(() => {
            result.current.queueGame(config)
            result.current.startGame()
            result.current.finishGame(false) // Player loses
        })

        expect(onResultCommit).toHaveBeenCalledWith(0)
    })

    it('should handle cancellation flow', () => {
        const onResultCommit = vi.fn()
        const { result } = renderHook(() => useMinigameController(onResultCommit))

        const config = parseMinigameTag('minigame: type=arkanoid')

        act(() => {
            result.current.queueGame(config)
        })

        // User cancels before starting
        act(() => {
            result.current.cancelGame()
        })

        expect(result.current.state).toBe('idle')
        expect(onResultCommit).not.toHaveBeenCalled()
    })

    it('should resolve Ink variables in minigame params', () => {
        const mockStoryRef = {
            current: {
                variablesState: {
                    player_agility: 8,
                    difficulty: 2.0
                }
            }
        }

        const tag = 'minigame: type=lockpick, speed={player_agility}, zoneSize=0.1'
        const config = parseMinigameTag(tag, mockStoryRef)

        expect(config.params.speed).toBe(8)
        expect(config.params.zoneSize).toBe(0.1)
    })

    it('should handle consequence tags (onFail/onSuccess)', () => {
        const tag = 'minigame: type=qte, key=E, timeout=1.5, onFail=stat:hp:-20, onSuccess=inv:add:llave'
        const config = parseMinigameTag(tag)

        expect(config.params.onFail).toBe('stat:hp:-20')
        expect(config.params.onSuccess).toBe('inv:add:llave')

        // These would be processed by useGameSystems after the minigame completes
    })
})
