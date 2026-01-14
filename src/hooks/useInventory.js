import { useState, useCallback, useMemo } from 'react'
import { getGameConfig, getItemDefinition } from '../config/gameConfig'

/**
 * useInventory - Hook for managing game inventory
 * Supports stackable and non-stackable items with categories
 */
export function useInventory(storyId) {
    const config = useMemo(() => getGameConfig(storyId), [storyId])
    const inventoryConfig = config?.inventory || { enabled: false, maxSlots: 10 }

    // Items stored as array of { id, qty }
    const [items, setItems] = useState([])

    /**
     * Add an item to inventory
     * @param {string} itemId - Item identifier
     * @param {number} qty - Quantity to add (default 1)
     */
    const addItem = useCallback((itemId, qty = 1) => {
        const itemDef = getItemDefinition(itemId)

        setItems(prev => {
            // Check if item already exists and is stackable
            const existingIndex = prev.findIndex(i => i.id === itemId)

            if (existingIndex >= 0 && itemDef.stackable) {
                // Stack onto existing
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    qty: updated[existingIndex].qty + qty
                }
                return updated
            }

            // Check max slots
            if (prev.length >= inventoryConfig.maxSlots) {
                console.warn('Inventory full!')
                return prev
            }

            // Add new item
            return [...prev, { id: itemId, qty }]
        })
    }, [inventoryConfig])

    /**
     * Remove an item from inventory
     * @param {string} itemId - Item identifier
     * @param {number} qty - Quantity to remove (default: all)
     */
    const removeItem = useCallback((itemId, qty = null) => {
        setItems(prev => {
            const existingIndex = prev.findIndex(i => i.id === itemId)
            if (existingIndex < 0) return prev

            const existing = prev[existingIndex]

            // Remove completely or reduce quantity
            if (qty === null || existing.qty <= qty) {
                return prev.filter((_, i) => i !== existingIndex)
            }

            const updated = [...prev]
            updated[existingIndex] = {
                ...existing,
                qty: existing.qty - qty
            }
            return updated
        })
    }, [])

    /**
     * Check if player has an item
     */
    const hasItem = useCallback((itemId) => {
        return items.some(i => i.id === itemId && i.qty > 0)
    }, [items])

    /**
     * Get quantity of an item
     */
    const getItemCount = useCallback((itemId) => {
        const item = items.find(i => i.id === itemId)
        return item?.qty || 0
    }, [items])

    /**
     * Get all items with their full definitions
     */
    const getItemsWithInfo = useCallback(() => {
        return items.map(item => ({
            ...item,
            ...getItemDefinition(item.id)
        }))
    }, [items])

    /**
     * Get items by category
     */
    const getItemsByCategory = useCallback((category) => {
        return getItemsWithInfo().filter(item => item.category === category)
    }, [getItemsWithInfo])

    /**
     * Clear all items
     */
    const clearInventory = useCallback(() => {
        setItems([])
    }, [])

    /**
     * Load inventory from saved data
     */
    const loadInventory = useCallback((savedItems) => {
        if (Array.isArray(savedItems)) {
            setItems(savedItems)
        }
    }, [])

    /**
     * Export inventory for saving
     */
    const exportInventory = useCallback(() => {
        return [...items]
    }, [items])

    return {
        items,
        inventoryConfig,
        isEnabled: inventoryConfig.enabled,
        addItem,
        removeItem,
        hasItem,
        getItemCount,
        getItemsWithInfo,
        getItemsByCategory,
        clearInventory,
        loadInventory,
        exportInventory
    }
}
