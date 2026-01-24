import { useState, useCallback, useMemo } from 'react'

/**
 * useStats - Hook for managing game stats (HP, MP, Cordura, Karma, etc.)
 * Supports both 'bar' type (resources) and 'value' type (attributes)
 * 
 * @param {Object} config - Game configuration object (from loadGameConfig)
 */
export function useStats(config) {
    const statsConfig = useMemo(() => {
        return config?.stats || { enabled: false, definitions: [], onZero: {} }
    }, [config])

    // Initialize stats from config
    const getInitialStats = useCallback(() => {
        if (!statsConfig.enabled) return {}

        const initial = {}
        statsConfig.definitions.forEach(def => {
            initial[def.id] = def.initial ?? 0
        })
        return initial
    }, [statsConfig])

    const [stats, setStats] = useState(getInitialStats)

    // Reset stats when config changes
    useMemo(() => {
        setStats(getInitialStats())
    }, [getInitialStats])

    /**
     * Modify a stat by delta (add or subtract)
     * Respects min/max bounds if defined
     */
    const modifyStat = useCallback((statId, delta) => {
        const def = statsConfig.definitions.find(d => d.id === statId)
        if (!def) {
            console.warn(`Stat "${statId}" not found in config`)
            return
        }

        setStats(prev => {
            let newValue = (prev[statId] ?? def.initial ?? 0) + delta

            // Clamp to bounds if defined
            if (def.min !== undefined) newValue = Math.max(def.min, newValue)
            if (def.max !== undefined) newValue = Math.min(def.max, newValue)

            return { ...prev, [statId]: newValue }
        })
    }, [statsConfig])

    /**
     * Set a stat to an absolute value
     */
    const setStat = useCallback((statId, value) => {
        const def = statsConfig.definitions.find(d => d.id === statId)
        if (!def) {
            console.warn(`Stat "${statId}" not found in config`)
            return
        }

        let newValue = value
        if (def.min !== undefined) newValue = Math.max(def.min, newValue)
        if (def.max !== undefined) newValue = Math.min(def.max, newValue)

        setStats(prev => ({ ...prev, [statId]: newValue }))
    }, [statsConfig])

    /**
     * Get detailed info about a stat
     */
    const getStatInfo = useCallback((statId) => {
        const def = statsConfig.definitions.find(d => d.id === statId)
        if (!def) return null

        const current = stats[statId] ?? def.initial ?? 0
        const percentage = def.max ? Math.round((current / def.max) * 100) : null

        return {
            ...def,
            current,
            percentage
        }
    }, [stats, statsConfig])

    /**
     * Get all stats with their full info
     */
    const getAllStatsInfo = useCallback(() => {
        return statsConfig.definitions.map(def => getStatInfo(def.id))
    }, [statsConfig, getStatInfo])

    /**
     * Check if any stat has reached zero (for game over conditions)
     */
    const checkZeroStats = useCallback(() => {
        const zeroStats = []
        statsConfig.definitions.forEach(def => {
            if (def.displayType === 'bar' && stats[def.id] <= 0) {
                const zeroAction = statsConfig.onZero?.[def.id]
                if (zeroAction) {
                    zeroStats.push({ statId: def.id, ...zeroAction })
                }
            }
        })
        return zeroStats
    }, [stats, statsConfig])

    /**
     * Reset all stats to initial values
     */
    const resetStats = useCallback(() => {
        setStats(getInitialStats())
    }, [getInitialStats])

    /**
     * Load stats from saved data
     */
    const loadStats = useCallback((savedStats) => {
        if (savedStats && typeof savedStats === 'object') {
            setStats(savedStats)
        }
    }, [])

    /**
     * Export stats for saving
     */
    const exportStats = useCallback(() => {
        return { ...stats }
    }, [stats])

    return useMemo(() => ({
        stats,
        statsConfig,
        isEnabled: statsConfig.enabled,
        modifyStat,
        setStat,
        getStatInfo,
        getAllStatsInfo,
        checkZeroStats,
        resetStats,
        loadStats,
        exportStats
    }), [
        stats,
        statsConfig,
        modifyStat,
        setStat,
        getStatInfo,
        getAllStatsInfo,
        checkZeroStats,
        resetStats,
        loadStats,
        exportStats
    ])
}

