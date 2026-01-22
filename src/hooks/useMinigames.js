import { useState, useCallback } from 'react'

/**
 * useMinigames - Manager for interactive minigames
 */
export function useMinigames(onFinishCallback) {
    const [activeMinigame, setActiveMinigame] = useState(null)
    const [lastResult, setLastResult] = useState(null)

    /**
     * Start a new minigame
     * @param {string} name - Component name (qte, lockpick, arkanoid)
     * @param {object} params - Game-specific configuration
     */
    const startMinigame = useCallback((name, params = {}) => {
        console.log(`[Minigame] Starting: ${name}`, params)
        setActiveMinigame({ name, params })
        setLastResult(null)
    }, [])

    /**
     * Complete the current minigame
     * @param {any} result - Output of the game (usually boolean or number)
     */
    const finishMinigame = useCallback((result) => {
        console.log(`[Minigame] Finished with result:`, result)
        setLastResult(result)
        setActiveMinigame(null)

        if (onFinishCallback) {
            onFinishCallback(result)
        }
    }, [onFinishCallback])

    /**
     * Cancel/Close without result
     */
    const cancelMinigame = useCallback(() => {
        setActiveMinigame(null)
    }, [])

    return {
        activeMinigame,
        lastResult,
        startMinigame,
        finishMinigame,
        cancelMinigame
    }
}
