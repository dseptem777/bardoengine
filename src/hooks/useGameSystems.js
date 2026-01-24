import { useCallback, useState, useEffect, useMemo } from 'react'
import { useStats } from './useStats'
import { useInventory } from './useInventory'
import { loadGameConfig, DEFAULT_CONFIG } from '../config/loadGameConfig'

/**
 * useGameSystems - Orchestrator hook that combines Stats + Inventory
 * and provides a unified interface for processing game tags
 * 
 * Loads config asynchronously from {storyId}.config.json
 * 
 * Supported tags:
 * - #stat:statId:+/-value  (e.g., #stat:hp:-10, #stat:karma:+5)
 * - #inv:add:itemId[:qty]  (e.g., #inv:add:llave_dorada, #inv:add:balas:5)
 * - #inv:remove:itemId[:qty]
 * - #inv:clear
 */
export function useGameSystems(storyId) {
    const [config, setConfig] = useState(DEFAULT_CONFIG)
    const [configLoaded, setConfigLoaded] = useState(false)

    // Load config when storyId changes
    useEffect(() => {
        let cancelled = false

        async function loadConfig() {
            if (!storyId) {
                setConfig(DEFAULT_CONFIG)
                setConfigLoaded(true)
                return
            }

            const loaded = await loadGameConfig(storyId)
            if (!cancelled) {
                setConfig(loaded)
                setConfigLoaded(true)
            }
        }

        setConfigLoaded(false)
        loadConfig()

        return () => { cancelled = true }
    }, [storyId])

    // Pass config to child hooks
    const statsHook = useStats(config)
    const inventoryHook = useInventory(config)

    /**
     * Parse and process a single game system tag
     * Returns true if tag was handled, false otherwise
     */
    const processGameTag = useCallback((tag) => {
        const trimmedTag = tag.trim()

        // Handle stat tags: #stat:statId:value
        if (trimmedTag.startsWith('stat:')) {
            const parts = trimmedTag.split(':')
            if (parts.length >= 3) {
                const statId = parts[1]
                const valueStr = parts[2]
                const value = parseInt(valueStr, 10)

                if (!isNaN(value)) {
                    // If starts with + or -, it's a delta
                    if (valueStr.startsWith('+') || valueStr.startsWith('-')) {
                        statsHook.modifyStat(statId, value)
                    } else {
                        // Absolute value
                        statsHook.setStat(statId, value)
                    }
                    return true
                }
            }
        }

        // Handle inventory tags: #inv:action:itemId[:qty]
        if (trimmedTag.startsWith('inv:')) {
            const parts = trimmedTag.split(':')
            const action = parts[1]

            // Handle clear action (only needs 2 parts)
            if (action === 'clear') {
                inventoryHook.clearInventory()
                return true
            }

            // Other actions require at least 3 parts
            if (parts.length >= 3) {
                const itemId = parts[2]
                const qty = parts[3] ? parseInt(parts[3], 10) : 1

                switch (action) {
                    case 'add':
                        inventoryHook.addItem(itemId, isNaN(qty) ? 1 : qty)
                        return true
                    case 'remove':
                        inventoryHook.removeItem(itemId, isNaN(qty) ? null : qty)
                        return true
                    default:
                        console.warn(`Unknown inventory action: ${action}`)
                }
            }
        }

        // Handle minigame tags: #minigame:name:param1:param2
        if (trimmedTag.startsWith('minigame:')) {
            const parts = trimmedTag.split(':')
            if (parts.length >= 2) {
                const name = parts[1]
                const params = parts.slice(2)

                // Return a special object that the caller (App.jsx) should handle
                return { type: 'minigame', name, params }
            }
        }

        return false
    }, [statsHook, inventoryHook])

    /**
     * Process multiple tags at once
     */
    const processGameTags = useCallback((tags) => {
        const tagArray = Array.isArray(tags) ? tags : [tags]
        tagArray.forEach(tag => processGameTag(tag))
    }, [processGameTag])

    /**
     * Reset all game systems to initial state
     */
    const resetGameSystems = useCallback(() => {
        statsHook.resetStats()
        inventoryHook.clearInventory()
    }, [statsHook, inventoryHook])

    /**
     * Load game systems from saved data
     */
    const loadGameSystems = useCallback((savedData) => {
        if (savedData?.stats) {
            statsHook.loadStats(savedData.stats)
        }
        if (savedData?.inventory) {
            inventoryHook.loadInventory(savedData.inventory)
        }
    }, [statsHook, inventoryHook])

    /**
     * Export game systems for saving
     */
    const exportGameSystems = useCallback(() => {
        return {
            stats: statsHook.exportStats(),
            inventory: inventoryHook.exportInventory()
        }
    }, [statsHook, inventoryHook])

    return useMemo(() => ({
        // Config
        config,
        configLoaded,

        // Stats
        stats: statsHook.stats,
        statsConfig: statsHook.statsConfig,
        statsEnabled: statsHook.isEnabled,
        modifyStat: statsHook.modifyStat,
        setStat: statsHook.setStat,
        getStatInfo: statsHook.getStatInfo,
        getAllStatsInfo: statsHook.getAllStatsInfo,
        checkZeroStats: statsHook.checkZeroStats,

        // Inventory
        items: inventoryHook.items,
        inventoryConfig: inventoryHook.inventoryConfig,
        inventoryEnabled: inventoryHook.isEnabled,
        addItem: inventoryHook.addItem,
        removeItem: inventoryHook.removeItem,
        hasItem: inventoryHook.hasItem,
        getItemCount: inventoryHook.getItemCount,
        getItemsWithInfo: inventoryHook.getItemsWithInfo,
        getItemsByCategory: inventoryHook.getItemsByCategory,

        // Combined operations
        processGameTag,
        processGameTags,
        resetGameSystems,
        loadGameSystems,
        exportGameSystems
    }), [
        config,
        configLoaded,
        statsHook,
        inventoryHook,
        processGameTag,
        processGameTags,
        resetGameSystems,
        loadGameSystems,
        exportGameSystems
    ])
}

