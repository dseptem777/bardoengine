/**
 * Integration test: Save/Load Cycle
 * Tests the complete save-load cycle with game systems state
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSaveSystem } from '../../hooks/useSaveSystem'
import { useStats } from '../../hooks/useStats'
import { useInventory } from '../../hooks/useInventory'

// Mock config for useInventory
vi.mock('../../config/loadGameConfig', () => ({
    getItemDefinition: (config, itemId) => ({
        id: itemId,
        name: itemId,
        stackable: itemId.includes('pocion')
    })
}))

const mockConfig = {
    stats: {
        enabled: true,
        definitions: [
            { id: 'hp', name: 'HP', initial: 100, min: 0, max: 100 },
            { id: 'karma', name: 'Karma', initial: 0, min: -100, max: 100 }
        ],
        onZero: {}
    },
    inventory: {
        enabled: true,
        maxSlots: 10
    },
    items: {}
}

describe('Save/Load Cycle Integration', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('should preserve stats and inventory through save/load cycle', () => {
        // Setup hooks
        const { result: saveSystem } = renderHook(() => useSaveSystem('integration_test'))
        const { result: stats } = renderHook(() => useStats(mockConfig))
        const { result: inventory } = renderHook(() => useInventory(mockConfig))

        // Step 1: Modify game state
        act(() => {
            stats.current.modifyStat('hp', -35)
            stats.current.modifyStat('karma', 25)
            inventory.current.addItem('llave_maestra')
            inventory.current.addItem('pocion_hp', 3)
        })

        expect(stats.current.stats.hp).toBe(65)
        expect(stats.current.stats.karma).toBe(25)
        expect(inventory.current.items).toHaveLength(2)

        // Step 2: Export game systems state
        const gameSystemsData = {
            stats: stats.current.exportStats(),
            inventory: inventory.current.exportInventory()
        }

        // Step 3: Create save
        act(() => {
            saveSystem.current.saveGame(
                'Test Save',
                '{"inkState":"mockState"}',
                'You are in a dark room...',
                gameSystemsData
            )
        })

        const saveId = saveSystem.current.saves[0].id

        // Step 4: Reset game state (simulate new game)
        act(() => {
            stats.current.resetStats()
            inventory.current.clearInventory()
        })

        expect(stats.current.stats.hp).toBe(100)
        expect(inventory.current.items).toHaveLength(0)

        // Step 5: Load save
        const loadedSave = saveSystem.current.loadSave(saveId)

        // Step 6: Restore game systems
        act(() => {
            stats.current.loadStats(loadedSave.gameSystems.stats)
            inventory.current.loadInventory(loadedSave.gameSystems.inventory)
        })

        // Step 7: Verify restored state
        expect(stats.current.stats.hp).toBe(65)
        expect(stats.current.stats.karma).toBe(25)
        expect(inventory.current.items).toHaveLength(2)
        expect(inventory.current.hasItem('llave_maestra')).toBe(true)
        expect(inventory.current.getItemCount('pocion_hp')).toBe(3)
    })

    it('should handle autosave with game systems', () => {
        const { result: saveSystem } = renderHook(() => useSaveSystem('autosave_test'))
        const { result: stats } = renderHook(() => useStats(mockConfig))

        // Modify state
        act(() => {
            stats.current.modifyStat('hp', -50)
        })

        // Autosave
        act(() => {
            saveSystem.current.autoSave(
                '{"ink":"state"}',
                'Current text',
                { stats: stats.current.exportStats(), inventory: [] }
            )
        })

        // Verify autosave exists
        const autosave = saveSystem.current.saves.find(s => s.isAutosave)
        expect(autosave).toBeDefined()
        expect(autosave.gameSystems.stats.hp).toBe(50)
    })

    it('should handle loadLastSave for continue functionality', () => {
        const { result: saveSystem } = renderHook(() => useSaveSystem('continue_test'))

        // Create a few saves with different timestamps
        act(() => {
            saveSystem.current.saveGame('Old Save', '{}', '', { stats: { hp: 30 } })
        })

        // Wait a bit and create another
        act(() => {
            saveSystem.current.saveGame('New Save', '{}', '', { stats: { hp: 80 } })
        })

        // loadLastSave should return the most recent
        const lastSave = saveSystem.current.loadLastSave()
        expect(lastSave.gameSystems.stats.hp).toBe(80)
    })

    it('should clear saves without affecting achievements', () => {
        // Setup saves
        const { result: saveSystem } = renderHook(() => useSaveSystem('clear_test'))

        act(() => {
            saveSystem.current.saveGame('Will be deleted', '{}')
        })

        expect(saveSystem.current.hasAnySave).toBe(true)

        // Simulate having achievements (separate storage)
        localStorage.setItem('bardo_achievements_clear_test', JSON.stringify({
            unlockedIds: ['achievement_1']
        }))

        // Clear saves
        act(() => {
            saveSystem.current.clearAllSaves()
        })

        // Saves should be gone
        expect(saveSystem.current.hasAnySave).toBe(false)

        // Achievements should remain
        const achievements = JSON.parse(localStorage.getItem('bardo_achievements_clear_test'))
        expect(achievements.unlockedIds).toContain('achievement_1')
    })

    it('should handle corrupted save data gracefully', () => {
        // Corrupt localStorage
        localStorage.setItem('bardo_saves', 'not valid json{{{')

        // Should not throw
        expect(() => {
            renderHook(() => useSaveSystem('corrupt_test'))
        }).not.toThrow()
    })
})
