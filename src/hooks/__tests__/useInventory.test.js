/**
 * Tests for useInventory hook
 * Covers item management, stacking, and persistence
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useInventory } from '../useInventory'

// Mock the config loader
vi.mock('../../config/loadGameConfig', () => ({
    getItemDefinition: (config, itemId) => {
        const items = config?.items || {}
        return items[itemId] || {
            id: itemId,
            name: itemId,
            icon: '📦',
            description: 'Item desconocido.',
            category: 'items',
            stackable: false
        }
    }
}))

// Sample config for testing
const mockConfig = {
    inventory: {
        enabled: true,
        maxSlots: 5,
        categories: ['armas', 'consumibles', 'llaves']
    },
    items: {
        'llave_dorada': {
            id: 'llave_dorada',
            name: 'Llave Dorada',
            icon: '🔑',
            description: 'Una llave brillante',
            category: 'llaves',
            stackable: false
        },
        'pocion_hp': {
            id: 'pocion_hp',
            name: 'Poción de Vida',
            icon: '🧪',
            description: 'Restaura HP',
            category: 'consumibles',
            stackable: true
        },
        'balas': {
            id: 'balas',
            name: 'Balas',
            icon: '🔫',
            description: 'Munición',
            category: 'armas',
            stackable: true
        }
    }
}

const disabledConfig = {
    inventory: { enabled: false, maxSlots: 10 }
}

describe('useInventory', () => {
    describe('initialization', () => {
        it('should start with empty inventory', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            expect(result.current.items).toEqual([])
        })

        it('should respect isEnabled from config', () => {
            const { result } = renderHook(() => useInventory(disabledConfig))

            expect(result.current.isEnabled).toBe(false)
        })

        it('should handle null config gracefully', () => {
            const { result } = renderHook(() => useInventory(null))

            expect(result.current.items).toEqual([])
            expect(result.current.isEnabled).toBe(false)
        })
    })

    describe('addItem', () => {
        it('should add new item with qty=1 by default', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
            })

            expect(result.current.items).toHaveLength(1)
            expect(result.current.items[0]).toEqual({ id: 'llave_dorada', qty: 1 })
        })

        it('should add item with specified quantity', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('balas', 10)
            })

            expect(result.current.items[0]).toEqual({ id: 'balas', qty: 10 })
        })

        it('should stack on existing stackable items', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('pocion_hp', 2)
            })

            act(() => {
                result.current.addItem('pocion_hp', 3)
            })

            expect(result.current.items).toHaveLength(1)
            expect(result.current.items[0].qty).toBe(5)
        })

        it('should not stack non-stackable items', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
            })

            act(() => {
                result.current.addItem('llave_dorada')
            })

            expect(result.current.items).toHaveLength(2)
        })

        it('should respect maxSlots limit', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
            const { result } = renderHook(() => useInventory(mockConfig))

            // Fill 5 slots (maxSlots)
            act(() => {
                for (let i = 0; i < 5; i++) {
                    result.current.addItem(`item_${i}`)
                }
            })

            expect(result.current.items).toHaveLength(5)

            // Try to add 6th item
            act(() => {
                result.current.addItem('overflow_item')
            })

            expect(result.current.items).toHaveLength(5)
            expect(warnSpy).toHaveBeenCalledWith('Inventory full!')
            warnSpy.mockRestore()
        })
    })

    describe('removeItem', () => {
        it('should remove item completely when no qty specified', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
            })

            act(() => {
                result.current.removeItem('llave_dorada')
            })

            expect(result.current.items).toHaveLength(0)
        })

        it('should reduce quantity when qty specified', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('balas', 10)
            })

            act(() => {
                result.current.removeItem('balas', 3)
            })

            expect(result.current.items[0].qty).toBe(7)
        })

        it('should remove item when qty exceeds amount', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('balas', 5)
            })

            act(() => {
                result.current.removeItem('balas', 10)
            })

            expect(result.current.items).toHaveLength(0)
        })

        it('should do nothing for non-existent item', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
            })

            act(() => {
                result.current.removeItem('nonexistent')
            })

            expect(result.current.items).toHaveLength(1)
        })
    })

    describe('hasItem', () => {
        it('should return true when item exists', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
            })

            expect(result.current.hasItem('llave_dorada')).toBe(true)
        })

        it('should return false when item does not exist', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            expect(result.current.hasItem('llave_dorada')).toBe(false)
        })
    })

    describe('getItemCount', () => {
        it('should return correct quantity', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('balas', 25)
            })

            expect(result.current.getItemCount('balas')).toBe(25)
        })

        it('should return 0 for non-existent item', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            expect(result.current.getItemCount('nonexistent')).toBe(0)
        })
    })

    describe('getItemsWithInfo', () => {
        it('should merge item definitions with inventory state', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('pocion_hp', 3)
            })

            const itemsWithInfo = result.current.getItemsWithInfo()

            expect(itemsWithInfo[0]).toMatchObject({
                id: 'pocion_hp',
                qty: 3,
                name: 'Poción de Vida',
                icon: '🧪'
            })
        })
    })

    describe('getItemsByCategory', () => {
        it('should filter items by category', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
                result.current.addItem('pocion_hp', 2)
                result.current.addItem('balas', 10)
            })

            const consumibles = result.current.getItemsByCategory('consumibles')
            expect(consumibles).toHaveLength(1)
            expect(consumibles[0].id).toBe('pocion_hp')
        })
    })

    describe('clearInventory', () => {
        it('should remove all items', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
                result.current.addItem('balas', 10)
            })

            act(() => {
                result.current.clearInventory()
            })

            expect(result.current.items).toHaveLength(0)
        })
    })

    describe('export/load', () => {
        it('should export inventory as array', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.addItem('llave_dorada')
                result.current.addItem('balas', 5)
            })

            const exported = result.current.exportInventory()

            expect(exported).toEqual([
                { id: 'llave_dorada', qty: 1 },
                { id: 'balas', qty: 5 }
            ])
        })

        it('should load inventory from saved data', () => {
            const { result } = renderHook(() => useInventory(mockConfig))

            act(() => {
                result.current.loadInventory([
                    { id: 'pocion_hp', qty: 3 },
                    { id: 'llave_dorada', qty: 1 }
                ])
            })

            expect(result.current.items).toHaveLength(2)
            expect(result.current.getItemCount('pocion_hp')).toBe(3)
        })
    })
})
