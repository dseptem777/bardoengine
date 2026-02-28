import { useCallback, useState, useEffect, useRef, useMemo } from 'react'

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
    const savesRef = useRef(saves)
    savesRef.current = saves

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

    // Load saves from localStorage when storyId changes
    useEffect(() => {
        loadSavesFromStorage()
    }, [storyId, loadSavesFromStorage])

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

        const currentSaves = savesRef.current
        let newSaves
        if (overwriteId) {
            newSaves = currentSaves.map(s => s.id === overwriteId ? saveData : s)
        } else {
            newSaves = [saveData, ...currentSaves].slice(0, MAX_SAVES)
        }

        saveSavesToStorage(newSaves, saveData.id)
        console.log(`[Save] Saved: ${name}`)
        return saveData.id
    }, [storyId, saveSavesToStorage])

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

        const currentSaves = savesRef.current
        const existingIndex = currentSaves.findIndex(s => s.id === autosaveId)
        let newSaves
        if (existingIndex >= 0) {
            newSaves = currentSaves.map(s => s.id === autosaveId ? autosaveData : s)
        } else {
            newSaves = [autosaveData, ...currentSaves]
        }

        saveSavesToStorage(newSaves, autosaveId)
    }, [storyId, saveSavesToStorage])

    /**
     * Load a specific save
     */
    const loadSave = useCallback((saveId) => {
        const save = savesRef.current.find(s => s.id === saveId)
        if (save) {
            return {
                state: save.state,
                text: save.text || '',
                gameSystems: save.gameSystems || null
            }
        }
        return null
    }, [])

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
        const newSaves = savesRef.current.filter(s => s.id !== saveId)
        saveSavesToStorage(newSaves)
    }, [saveSavesToStorage])

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

    return useMemo(() => ({
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
    }), [
        saveGame,
        autoSave,
        loadSave,
        loadLastSave,
        deleteSave,
        clearAllSaves,
        saves,
        lastSaveId,
        hasAnySave,
        hasContinue
    ])
}
