import { useCallback, useState, useEffect } from 'react'

const STORAGE_KEY = 'bardo_saves'
const MAX_SAVES = 10

/**
 * useSaveSystem - Multi-slot save system for BardoEngine
 * 
 * Features:
 * - Multiple named save slots
 * - Autosave on every decision
 * - Last save tracking for "Continue"
 */
export function useSaveSystem(storyId) {
    const [saves, setSaves] = useState([])
    const [lastSaveId, setLastSaveId] = useState(null)

    // Load saves from localStorage on mount
    useEffect(() => {
        loadSavesFromStorage()
    }, [storyId])

    const loadSavesFromStorage = useCallback(() => {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (data) {
                const parsed = JSON.parse(data)
                // Filter saves for current story
                const storySaves = parsed.saves?.filter(s => s.storyId === storyId) || []
                setSaves(storySaves)

                // Find last save for this story
                const lastForStory = storySaves.reduce((latest, save) => {
                    if (!latest || save.timestamp > latest.timestamp) return save
                    return latest
                }, null)
                setLastSaveId(lastForStory?.id || null)
            }
        } catch (e) {
            console.error('Failed to load saves:', e)
        }
    }, [storyId])

    const saveSavesToStorage = useCallback((newSaves, newLastId = null) => {
        try {
            // Get all saves from storage
            const data = localStorage.getItem(STORAGE_KEY)
            const parsed = data ? JSON.parse(data) : { saves: [] }

            // Replace saves for current story, keep others
            const otherSaves = parsed.saves?.filter(s => s.storyId !== storyId) || []
            const allSaves = [...otherSaves, ...newSaves]

            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                saves: allSaves,
                lastSaveId: newLastId || parsed.lastSaveId
            }))

            setSaves(newSaves)
            if (newLastId) setLastSaveId(newLastId)
        } catch (e) {
            console.error('Failed to save:', e)
        }
    }, [storyId])

    /**
     * Create a new save or overwrite existing
     */
    const saveGame = useCallback((name, stateJson, currentText = '', gameSystems = null, overwriteId = null) => {
        const saveData = {
            id: overwriteId || `save_${Date.now()}`,
            name: name,
            storyId: storyId,
            timestamp: Date.now(),
            state: stateJson,
            text: currentText,
            gameSystems: gameSystems
        }

        let newSaves
        if (overwriteId) {
            // Overwrite existing
            newSaves = saves.map(s => s.id === overwriteId ? saveData : s)
        } else {
            // Add new (respect max limit)
            newSaves = [saveData, ...saves].slice(0, MAX_SAVES)
        }

        saveSavesToStorage(newSaves, saveData.id)
        console.log(`[Save] Saved: ${name}`)
        return saveData.id
    }, [storyId, saves, saveSavesToStorage])

    /**
     * Quick autosave (overwrites autosave slot)
     */
    const autoSave = useCallback((stateJson, currentText = '', gameSystems = null) => {
        const autosaveId = `autosave_${storyId}`
        const autosaveData = {
            id: autosaveId,
            name: '⚡ Autosave',
            storyId: storyId,
            timestamp: Date.now(),
            state: stateJson,
            text: currentText,
            gameSystems: gameSystems,
            isAutosave: true
        }

        // Find and replace autosave, or add it
        const existingIndex = saves.findIndex(s => s.id === autosaveId)
        let newSaves
        if (existingIndex >= 0) {
            newSaves = saves.map(s => s.id === autosaveId ? autosaveData : s)
        } else {
            newSaves = [autosaveData, ...saves]
        }

        saveSavesToStorage(newSaves, autosaveId)
    }, [storyId, saves, saveSavesToStorage])

    /**
     * Load a specific save
     */
    const loadSave = useCallback((saveId) => {
        const save = saves.find(s => s.id === saveId)
        if (save) {
            return {
                state: save.state,
                text: save.text || '',
                gameSystems: save.gameSystems || null
            }
        }
        return null
    }, [saves])

    /**
     * Load the most recent save (for "Continue" button)
     */
    const loadLastSave = useCallback(() => {
        if (!lastSaveId) return null
        return loadSave(lastSaveId)
    }, [lastSaveId, loadSave])

    /**
     * Delete a save
     */
    const deleteSave = useCallback((saveId) => {
        const newSaves = saves.filter(s => s.id !== saveId)
        saveSavesToStorage(newSaves)
    }, [saves, saveSavesToStorage])

    /**
     * Clear all saves for this story (used on "Finish Game")
     */
    const clearAllSaves = useCallback(() => {
        saveSavesToStorage([])
        setLastSaveId(null)
    }, [saveSavesToStorage])

    /**
     * Check if there are any saves
     */
    const hasAnySave = saves.length > 0
    const hasContinue = lastSaveId !== null

    return {
        // Save operations
        saveGame,
        autoSave,
        loadSave,
        loadLastSave,
        deleteSave,
        clearAllSaves,
        // State
        saves,
        lastSaveId,
        hasAnySave,
        hasContinue
    }
}
