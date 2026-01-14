import { useCallback } from 'react'

const STORAGE_PREFIX = 'bardo_'

export function useSaveSystem() {
    /**
     * Save game state including Ink state, text, and game systems (stats/inventory)
     */
    const saveGame = useCallback((storyId, stateJson, currentText = '', gameSystems = null) => {
        try {
            const saveData = {
                state: stateJson,
                text: currentText,
                timestamp: Date.now(),
                // Game systems (stats and inventory)
                ...(gameSystems && {
                    stats: gameSystems.stats,
                    inventory: gameSystems.inventory
                })
            }
            localStorage.setItem(`${STORAGE_PREFIX}${storyId}`, JSON.stringify(saveData))
        } catch (e) {
            console.error('Failed to save game:', e)
        }
    }, [])

    /**
     * Load game state including game systems
     */
    const loadGame = useCallback((storyId) => {
        try {
            const saveData = localStorage.getItem(`${STORAGE_PREFIX}${storyId}`)
            if (saveData) {
                const parsed = JSON.parse(saveData)
                return {
                    state: parsed.state,
                    text: parsed.text || '',
                    // Game systems
                    gameSystems: {
                        stats: parsed.stats || null,
                        inventory: parsed.inventory || null
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load game:', e)
        }
        return null
    }, [])

    const clearSave = useCallback((storyId) => {
        localStorage.removeItem(`${STORAGE_PREFIX}${storyId}`)
    }, [])

    const hasSave = useCallback((storyId) => {
        return localStorage.getItem(`${STORAGE_PREFIX}${storyId}`) !== null
    }, [])

    return { saveGame, loadGame, clearSave, hasSave }
}

