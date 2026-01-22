/**
 * Tests for useGameSystems hook
 * Covers tag parsing, stats/inventory orchestration, and config loading
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGameSystems } from '../useGameSystems'

// Mock loadGameConfig
vi.mock('../../config/loadGameConfig', () => ({
    DEFAULT_CONFIG: {
        title: 'Test Game',
        version: '0.1.0',
        stats: {
            enabled: true,
            definitions: [
                { id: 'hp', name: 'HP', displayType: 'bar', initial: 100, min: 0, max: 100 },
                { id: 'karma', name: 'Karma', displayType: 'value', initial: 0 }
            ],
            onZero: {}
        },
        inventory: {
            enabled: true,
            maxSlots: 10,
            categories: ['items']
        },
        items: {
            'llave': { id: 'llave', name: 'Llave', stackable: false },
            'pocion': { id: 'pocion', name: 'Poción', stackable: true }
        }
    },
    loadGameConfig: vi.fn().mockImplementation(async (storyId) => {
        if (storyId === 'custom_story') {
            return {
                title: 'Custom',
                stats: {
                    enabled: true,
                    definitions: [{ id: 'cordura', name: 'Cordura', initial: 50, min: 0, max: 100 }],
                    onZero: {}
                },
                inventory: { enabled: true, maxSlots: 5 },
                items: {}
            }
        }
        // Return default
        return {
            title: 'Test Game',
            stats: {
                enabled: true,
                definitions: [
                    { id: 'hp', name: 'HP', displayType: 'bar', initial: 100, min: 0, max: 100 },
                    { id: 'karma', name: 'Karma', displayType: 'value', initial: 0 }
                ],
                onZero: {}
            },
            inventory: { enabled: true, maxSlots: 10 },
            items: {
                'llave': { id: 'llave', name: 'Llave', stackable: false },
                'pocion': { id: 'pocion', name: 'Poción', stackable: true }
            }
        }
    }),
    getItemDefinition: vi.fn().mockImplementation((config, itemId) => {
        return config?.items?.[itemId] || { id: itemId, name: itemId, stackable: false }
    })
}))

describe('useGameSystems', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('config loading', () => {
        it('should load config asynchronously', async () => {
            const { result } = renderHook(() => useGameSystems('test_story'))

            // Initially not loaded
            expect(result.current.configLoaded).toBe(false)

            // Wait for async load
            await waitFor(() => {
                expect(result.current.configLoaded).toBe(true)
            })

            expect(result.current.config.title).toBe('Test Game')
        })

        it('should use default config when no storyId', async () => {
            const { result } = renderHook(() => useGameSystems(null))

            await waitFor(() => {
                expect(result.current.configLoaded).toBe(true)
            })

            expect(result.current.statsEnabled).toBe(true)
        })
    })

    describe('processGameTag - stats', () => {
        it('should modify stat with delta: stat:hp:-10', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.processGameTag('stat:hp:-10')
            })

            expect(result.current.stats.hp).toBe(90)
        })

        it('should modify stat with positive delta: stat:karma:+25', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.processGameTag('stat:karma:+25')
            })

            expect(result.current.stats.karma).toBe(25)
        })

        it('should set absolute value: stat:hp:50', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.processGameTag('stat:hp:50')
            })

            expect(result.current.stats.hp).toBe(50)
        })
    })

    describe('processGameTag - inventory', () => {
        it('should add item: inv:add:llave', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.processGameTag('inv:add:llave')
            })

            expect(result.current.hasItem('llave')).toBe(true)
        })

        it('should add item with quantity: inv:add:pocion:5', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.processGameTag('inv:add:pocion:5')
            })

            expect(result.current.getItemCount('pocion')).toBe(5)
        })

        it('should remove item: inv:remove:llave', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.addItem('llave')
            })

            act(() => {
                result.current.processGameTag('inv:remove:llave')
            })

            expect(result.current.hasItem('llave')).toBe(false)
        })

        it('should remove partial quantity: inv:remove:pocion:2', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.addItem('pocion', 5)
            })

            act(() => {
                result.current.processGameTag('inv:remove:pocion:2')
            })

            expect(result.current.getItemCount('pocion')).toBe(3)
        })

        it('should clear inventory: inv:clear', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.addItem('llave')
                result.current.addItem('pocion', 3)
            })

            act(() => {
                result.current.processGameTag('inv:clear')
            })

            expect(result.current.items).toHaveLength(0)
        })
    })

    describe('processGameTags (batch)', () => {
        it('should process multiple tags', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.processGameTags([
                    'stat:hp:-25',
                    'inv:add:llave',
                    'stat:karma:+10'
                ])
            })

            expect(result.current.stats.hp).toBe(75)
            expect(result.current.stats.karma).toBe(10)
            expect(result.current.hasItem('llave')).toBe(true)
        })
    })

    describe('resetGameSystems', () => {
        it('should reset stats and clear inventory', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.modifyStat('hp', -50)
                result.current.addItem('llave')
            })

            expect(result.current.stats.hp).toBe(50)

            act(() => {
                result.current.resetGameSystems()
            })

            expect(result.current.stats.hp).toBe(100)
            expect(result.current.items).toHaveLength(0)
        })
    })

    describe('export/load', () => {
        it('should export stats and inventory', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.modifyStat('hp', -20)
                result.current.addItem('llave')
            })

            const exported = result.current.exportGameSystems()

            expect(exported.stats.hp).toBe(80)
            expect(exported.inventory).toEqual([{ id: 'llave', qty: 1 }])
        })

        it('should load stats and inventory', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            act(() => {
                result.current.loadGameSystems({
                    stats: { hp: 30, karma: 50 },
                    inventory: [{ id: 'pocion', qty: 3 }]
                })
            })

            expect(result.current.stats.hp).toBe(30)
            expect(result.current.stats.karma).toBe(50)
            expect(result.current.getItemCount('pocion')).toBe(3)
        })
    })

    describe('minigame tag detection', () => {
        it('should return minigame object for minigame tags', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            let tagResult
            act(() => {
                tagResult = result.current.processGameTag('minigame:qte:SPACE:2')
            })

            expect(tagResult).toMatchObject({
                type: 'minigame',
                name: 'qte',
                params: ['SPACE', '2']
            })
        })
    })

    describe('unknown tags', () => {
        it('should return false for unknown tags', async () => {
            const { result } = renderHook(() => useGameSystems('test'))

            await waitFor(() => expect(result.current.configLoaded).toBe(true))

            let tagResult
            act(() => {
                tagResult = result.current.processGameTag('unknown:tag')
            })

            expect(tagResult).toBe(false)
        })
    })
})
