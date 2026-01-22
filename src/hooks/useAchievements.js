import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * useAchievements - Hook for managing game achievements with separate persistence
 * Achievements persist across save deletions - stored independently from game saves
 * 
 * @param {string} gameId - Unique game identifier
 * @param {Array} achievementDefinitions - Array of achievement definitions from config
 */
export function useAchievements(gameId, achievementDefinitions = []) {
    const storageKey = gameId ? `bardo_achievements_${gameId}` : null
    const prevStorageKey = useRef(null)

    // Load unlocked achievements from localStorage
    const loadUnlocked = useCallback(() => {
        if (!storageKey) {
            console.log('[Achievements] No gameId, returning empty')
            return { unlockedIds: [], hasCompletedGame: false }
        }
        try {
            const stored = localStorage.getItem(storageKey)
            console.log('[Achievements] Loading from', storageKey, ':', stored)
            if (stored) {
                const data = JSON.parse(stored)
                return {
                    unlockedIds: data.unlockedIds || [],
                    hasCompletedGame: data.hasCompletedGame || false
                }
            }
        } catch (e) {
            console.warn('[Achievements] Failed to load:', e)
        }
        return { unlockedIds: [], hasCompletedGame: false }
    }, [storageKey])

    const [unlockedIds, setUnlockedIds] = useState(() => loadUnlocked().unlockedIds)
    const [hasCompletedGame, setHasCompletedGame] = useState(() => loadUnlocked().hasCompletedGame)
    const [pendingToast, setPendingToast] = useState(null)

    // Reload when storageKey changes (game switch)
    useEffect(() => {
        if (storageKey && storageKey !== prevStorageKey.current) {
            console.log('[Achievements] Storage key changed, reloading:', storageKey)
            const loaded = loadUnlocked()
            setUnlockedIds(loaded.unlockedIds)
            setHasCompletedGame(loaded.hasCompletedGame)
            prevStorageKey.current = storageKey
        }
    }, [storageKey, loadUnlocked])

    // Save to localStorage whenever unlocked changes
    useEffect(() => {
        if (!storageKey) return

        try {
            const data = {
                unlockedIds,
                hasCompletedGame,
                lastUpdated: new Date().toISOString()
            }
            console.log('[Achievements] Saving to', storageKey, ':', { unlockedIds, hasCompletedGame })
            localStorage.setItem(storageKey, JSON.stringify(data))
        } catch (e) {
            console.warn('[Achievements] Failed to save:', e)
        }
    }, [unlockedIds, hasCompletedGame, storageKey])

    /**
     * Check if an achievement is unlocked
     */
    const isUnlocked = useCallback((achievementId) => {
        return unlockedIds.includes(achievementId)
    }, [unlockedIds])

    /**
     * Unlock an achievement by ID
     * Triggers toast if newly unlocked
     */
    const unlockAchievement = useCallback((achievementId) => {
        if (unlockedIds.includes(achievementId)) {
            console.log(`[Achievements] "${achievementId}" already unlocked`)
            return false
        }

        const definition = achievementDefinitions.find(a => a.id === achievementId)
        if (!definition) {
            console.warn(`[Achievements] Unknown achievement: "${achievementId}"`)
            return false
        }

        console.log(`[Achievements] Unlocking: "${achievementId}"`)
        setUnlockedIds(prev => [...prev, achievementId])

        // Trigger toast notification
        setPendingToast({
            id: achievementId,
            ...definition,
            unlockedAt: new Date().toISOString()
        })

        return true
    }, [unlockedIds, achievementDefinitions])

    /**
     * Clear the pending toast (called after toast animation)
     */
    const clearToast = useCallback(() => {
        setPendingToast(null)
    }, [])

    /**
     * Reset all achievements (with confirmation required externally)
     * WARNING: This action is irreversible
     */
    const resetAllAchievements = useCallback(() => {
        if (!storageKey) return
        console.log('[Achievements] Resetting all achievements for:', gameId)
        setUnlockedIds([])
        setHasCompletedGame(false)
        localStorage.removeItem(storageKey)
    }, [gameId, storageKey])

    /**
     * Mark game as completed (enables New Game+ flag)
     * Called when player reaches an ending
     */
    const markGameComplete = useCallback(() => {
        if (hasCompletedGame) {
            console.log('[NG+] Game already marked as completed')
            return false
        }
        console.log('[NG+] Marking game as completed for:', gameId)
        setHasCompletedGame(true)
        return true
    }, [gameId, hasCompletedGame])

    /**
     * Get combined achievements with unlock status
     */
    const achievements = achievementDefinitions.map(def => ({
        ...def,
        unlocked: unlockedIds.includes(def.id),
        // Hide title/description for hidden achievements that aren't unlocked
        displayTitle: (def.hidden && !unlockedIds.includes(def.id)) ? '???' : def.title,
        displayDescription: (def.hidden && !unlockedIds.includes(def.id)) ? 'Logro secreto' : def.description
    }))

    /**
     * Stats for progress display
     */
    const stats = {
        total: achievementDefinitions.length,
        unlocked: unlockedIds.length,
        percentage: achievementDefinitions.length > 0
            ? Math.round((unlockedIds.length / achievementDefinitions.length) * 100)
            : 0
    }

    return {
        achievements,
        unlockAchievement,
        isUnlocked,
        resetAllAchievements,
        clearToast,
        pendingToast,
        stats,
        // New Game+ support
        hasCompletedGame,
        markGameComplete
    }
}
