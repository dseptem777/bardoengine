/**
 * Tests for useStats hook
 * Covers stat initialization, modification, bounds, and persistence
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useStats } from '../useStats'

// Sample config for testing
const mockConfig = {
    stats: {
        enabled: true,
        definitions: [
            { id: 'hp', name: 'Vida', displayType: 'bar', initial: 100, min: 0, max: 100 },
            { id: 'mp', name: 'Maná', displayType: 'bar', initial: 50, min: 0, max: 100 },
            { id: 'karma', name: 'Karma', displayType: 'value', initial: 0, min: -100, max: 100 },
            { id: 'strength', name: 'Fuerza', displayType: 'value', initial: 10 }
        ],
        onZero: {
            hp: { action: 'gameOver', message: 'Has muerto' }
        }
    }
}

const disabledConfig = {
    stats: { enabled: false, definitions: [] }
}

describe('useStats', () => {
    describe('initialization', () => {
        it('should initialize stats from config definitions', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            expect(result.current.stats).toEqual({
                hp: 100,
                mp: 50,
                karma: 0,
                strength: 10
            })
        })

        it('should return empty stats when disabled', () => {
            const { result } = renderHook(() => useStats(disabledConfig))

            expect(result.current.stats).toEqual({})
            expect(result.current.isEnabled).toBe(false)
        })

        it('should handle null/undefined config gracefully', () => {
            const { result } = renderHook(() => useStats(null))

            expect(result.current.stats).toEqual({})
            expect(result.current.isEnabled).toBe(false)
        })
    })

    describe('modifyStat', () => {
        it('should add positive delta to stat', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('karma', 25)
            })

            expect(result.current.stats.karma).toBe(25)
        })

        it('should subtract negative delta from stat', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('hp', -30)
            })

            expect(result.current.stats.hp).toBe(70)
        })

        it('should clamp value to minimum bound', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('hp', -150) // Would go to -50
            })

            expect(result.current.stats.hp).toBe(0)
        })

        it('should clamp value to maximum bound', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('mp', 100) // Would go to 150
            })

            expect(result.current.stats.mp).toBe(100)
        })

        it('should warn and do nothing for unknown stat', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('nonexistent', 10)
            })

            expect(warnSpy).toHaveBeenCalledWith('Stat "nonexistent" not found in config')
            warnSpy.mockRestore()
        })
    })

    describe('setStat', () => {
        it('should set stat to absolute value', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.setStat('hp', 42)
            })

            expect(result.current.stats.hp).toBe(42)
        })

        it('should respect bounds when setting absolute value', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.setStat('karma', 200)
            })

            expect(result.current.stats.karma).toBe(100) // Clamped to max
        })
    })

    describe('getStatInfo', () => {
        it('should return full stat information', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            const hpInfo = result.current.getStatInfo('hp')

            expect(hpInfo).toMatchObject({
                id: 'hp',
                name: 'Vida',
                displayType: 'bar',
                current: 100,
                max: 100,
                percentage: 100
            })
        })

        it('should calculate percentage correctly', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('hp', -25)
            })

            const hpInfo = result.current.getStatInfo('hp')
            expect(hpInfo.percentage).toBe(75)
        })

        it('should return null for unknown stat', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            expect(result.current.getStatInfo('nonexistent')).toBeNull()
        })
    })

    describe('getAllStatsInfo', () => {
        it('should return info for all stats', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            const allStats = result.current.getAllStatsInfo()

            expect(allStats).toHaveLength(4)
            expect(allStats.map(s => s.id)).toEqual(['hp', 'mp', 'karma', 'strength'])
        })
    })

    describe('checkZeroStats', () => {
        it('should return empty array when no bar stats are zero', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            expect(result.current.checkZeroStats()).toEqual([])
        })

        it('should return stat with onZero action when bar hits zero', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.setStat('hp', 0)
            })

            const zeroStats = result.current.checkZeroStats()
            expect(zeroStats).toHaveLength(1)
            expect(zeroStats[0]).toMatchObject({
                statId: 'hp',
                action: 'gameOver',
                message: 'Has muerto'
            })
        })
    })

    describe('resetStats', () => {
        it('should restore all stats to initial values', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('hp', -50)
                result.current.modifyStat('karma', 30)
            })

            expect(result.current.stats.hp).toBe(50)
            expect(result.current.stats.karma).toBe(30)

            act(() => {
                result.current.resetStats()
            })

            expect(result.current.stats.hp).toBe(100)
            expect(result.current.stats.karma).toBe(0)
        })
    })

    describe('export/load', () => {
        it('should export stats as serializable object', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.modifyStat('hp', -20)
            })

            const exported = result.current.exportStats()

            expect(exported).toEqual({
                hp: 80,
                mp: 50,
                karma: 0,
                strength: 10
            })
        })

        it('should load stats from saved data', () => {
            const { result } = renderHook(() => useStats(mockConfig))

            act(() => {
                result.current.loadStats({ hp: 25, mp: 10, karma: 50, strength: 15 })
            })

            expect(result.current.stats).toEqual({
                hp: 25,
                mp: 10,
                karma: 50,
                strength: 15
            })
        })
    })

    describe('configuration changes', () => {
        it('should reset stats when configuration changes', () => {
            const configA = {
                stats: {
                    enabled: true,
                    definitions: [
                        { id: 'hp', initial: 100 }
                    ]
                }
            }

            const configB = {
                stats: {
                    enabled: true,
                    definitions: [
                        { id: 'mp', initial: 50 }
                    ]
                }
            }

            const { result, rerender } = renderHook(({ config }) => useStats(config), {
                initialProps: { config: configA }
            })

            // Check initial state from Config A
            expect(result.current.stats).toEqual({ hp: 100 })

            // Change to Config B
            rerender({ config: configB })

            // Check state from Config B
            expect(result.current.stats).toEqual({ mp: 50 })

            // Ensure old stats are gone
            expect(result.current.stats.hp).toBeUndefined()
        })
    })
})
