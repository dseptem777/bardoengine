import { useState, useCallback, useMemo } from 'react'

export interface StatDefinition {
    id: string;
    name?: string;
    initial?: number;
    min?: number;
    max?: number;
    displayType?: 'bar' | 'value';
    color?: string;
    icon?: string;
}

export interface StatsConfig {
    enabled: boolean;
    definitions: StatDefinition[];
    onZero?: Record<string, { action: string; [key: string]: any }>;
}

export interface GameConfigWithStats {
    stats?: StatsConfig;
    [key: string]: any;
}

export interface StatInfo extends StatDefinition {
    current: number;
    percentage: number | null;
}

/**
 * useStats - Hook for managing game stats (HP, MP, Cordura, Karma, etc.)
 * Supports both 'bar' type (resources) and 'value' type (attributes)
 * 
 * @param {Object} config - Game configuration object (from loadGameConfig)
 */
export function useStats(config: GameConfigWithStats | null) {
    const statsConfig = useMemo<StatsConfig>(() => {
        return config?.stats || { enabled: false, definitions: [], onZero: {} }
    }, [config])

    // Initialize stats from config
    const getInitialStats = useCallback(() => {
        if (!statsConfig.enabled) return {}

        const initial: Record<string, number> = {}
        statsConfig.definitions.forEach(def => {
            initial[def.id] = def.initial ?? 0
        })
        return initial
    }, [statsConfig])

    const [stats, setStats] = useState<Record<string, number>>(getInitialStats)

    // Reset stats when config changes
    useMemo(() => {
        setStats(getInitialStats())
    }, [getInitialStats])

    /**
     * Modify a stat by delta (add or subtract)
     * Respects min/max bounds if defined
     */
    const modifyStat = useCallback((statId: string, delta: number) => {
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
    const setStat = useCallback((statId: string, value: number) => {
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
    const getStatInfo = useCallback((statId: string): StatInfo | null => {
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
    const getAllStatsInfo = useCallback((): (StatInfo | null)[] => {
        return statsConfig.definitions.map(def => getStatInfo(def.id))
    }, [statsConfig, getStatInfo])

    /**
     * Check if any stat has reached zero (for game over conditions)
     */
    const checkZeroStats = useCallback(() => {
        const zeroStats: any[] = []
        statsConfig.definitions.forEach(def => {
            if (def.displayType === 'bar' && (stats[def.id] ?? 0) <= 0) {
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
    const loadStats = useCallback((savedStats: Record<string, number>) => {
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

    return {
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
    }
}
