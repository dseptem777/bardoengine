/**
 * Tests for useSaveSystem hook
 * Covers save operations, localStorage persistence, and multi-story isolation
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSaveSystem } from '../useSaveSystem'

describe('useSaveSystem', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('initialization', () => {
        it('should start with empty saves', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            expect(result.current.saves).toEqual([])
            expect(result.current.hasAnySave).toBe(false)
            expect(result.current.hasContinue).toBe(false)
        })

        it('should load existing saves from localStorage', () => {
            // Pre-populate localStorage
            localStorage.setItem('bardo_saves', JSON.stringify({
                saves: [
                    { id: 'save_1', storyId: 'test_story', name: 'Test Save', timestamp: 1000 }
                ]
            }))

            const { result } = renderHook(() => useSaveSystem('test_story'))

            expect(result.current.saves).toHaveLength(1)
            expect(result.current.hasAnySave).toBe(true)
        })

        it('should filter saves by storyId', () => {
            localStorage.setItem('bardo_saves', JSON.stringify({
                saves: [
                    { id: 'save_1', storyId: 'story_a', name: 'Save A' },
                    { id: 'save_2', storyId: 'story_b', name: 'Save B' }
                ]
            }))

            const { result } = renderHook(() => useSaveSystem('story_a'))

            expect(result.current.saves).toHaveLength(1)
            expect(result.current.saves[0].name).toBe('Save A')
        })
    })

    describe('saveGame', () => {
        it('should create new save with generated id', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            act(() => {
                result.current.saveGame('My Save', '{"state":"data"}', 'Current text')
            })

            expect(result.current.saves).toHaveLength(1)
            expect(result.current.saves[0].name).toBe('My Save')
            expect(result.current.saves[0].state).toBe('{"state":"data"}')
            expect(result.current.saves[0].text).toBe('Current text')
        })

        it('should include gameSystems data if provided', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))
            const gameSystems = { stats: { hp: 80 }, inventory: [] }

            act(() => {
                result.current.saveGame('Save with Systems', '{}', '', gameSystems)
            })

            expect(result.current.saves[0].gameSystems).toEqual(gameSystems)
        })

        it('should overwrite existing save when overwriteId provided', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            act(() => {
                result.current.saveGame('Original', '{"v":1}')
            })

            const originalId = result.current.saves[0].id

            act(() => {
                result.current.saveGame('Updated', '{"v":2}', '', null, originalId)
            })

            expect(result.current.saves).toHaveLength(1)
            expect(result.current.saves[0].name).toBe('Updated')
            expect(result.current.saves[0].state).toBe('{"v":2}')
        })

        it('should respect MAX_SAVES limit (10)', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            act(() => {
                for (let i = 0; i < 12; i++) {
                    result.current.saveGame(`Save ${i}`, '{}')
                }
            })

            expect(result.current.saves.length).toBeLessThanOrEqual(10)
        })
    })

    describe('autoSave', () => {
        it('should create autosave slot', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            act(() => {
                result.current.autoSave('{"autosave":"data"}', 'Auto text')
            })

            const autosave = result.current.saves.find(s => s.isAutosave)
            expect(autosave).toBeDefined()
            expect(autosave.name).toBe('⚡ Autosave')
        })

        it('should overwrite existing autosave', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            act(() => {
                result.current.autoSave('{"v":1}')
            })

            act(() => {
                result.current.autoSave('{"v":2}')
            })

            const autosaves = result.current.saves.filter(s => s.isAutosave)
            expect(autosaves).toHaveLength(1)
            expect(autosaves[0].state).toBe('{"v":2}')
        })
    })

    describe('loadSave', () => {
        it('should return save data by id', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            act(() => {
                result.current.saveGame('Test', '{"state":"test"}', 'Test text', { stats: { hp: 50 } })
            })

            const saveId = result.current.saves[0].id
            const loaded = result.current.loadSave(saveId)

            expect(loaded).toEqual({
                state: '{"state":"test"}',
                text: 'Test text',
                gameSystems: { stats: { hp: 50 } }
            })
        })

        it('should return null for non-existent id', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            const loaded = result.current.loadSave('nonexistent_id')

            expect(loaded).toBeNull()
        })
    })

    describe('loadLastSave', () => {
        it('should return most recent save', () => {
            localStorage.setItem('bardo_saves', JSON.stringify({
                saves: [
                    { id: 'old', storyId: 'test', name: 'Old', timestamp: 1000, state: '1' },
                    { id: 'new', storyId: 'test', name: 'New', timestamp: 2000, state: '2' }
                ]
            }))

            const { result } = renderHook(() => useSaveSystem('test'))

            expect(result.current.hasContinue).toBe(true)
            const loaded = result.current.loadLastSave()
            expect(loaded.state).toBe('2')
        })

        it('should return null when no saves exist', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            expect(result.current.loadLastSave()).toBeNull()
        })
    })

    describe('deleteSave', () => {
        it('should remove save from storage', () => {
            const { result } = renderHook(() => useSaveSystem('test_story'))

            act(() => {
                result.current.saveGame('To Delete', '{}')
            })

            const saveId = result.current.saves[0].id

            act(() => {
                result.current.deleteSave(saveId)
            })

            expect(result.current.saves).toHaveLength(0)
        })
    })

    describe('clearAllSaves', () => {
        it('should remove all saves for current story', () => {
            const { result } = renderHook(() => useSaveSystem('story_a'))

            act(() => {
                result.current.saveGame('Save 1', '{}')
                result.current.saveGame('Save 2', '{}')
            })

            act(() => {
                result.current.clearAllSaves()
            })

            expect(result.current.saves).toHaveLength(0)
            expect(result.current.hasContinue).toBe(false)
        })

        it('should not affect other stories', () => {
            // Save to story_a
            localStorage.setItem('bardo_saves', JSON.stringify({
                saves: [
                    { id: 's1', storyId: 'story_a', name: 'A' },
                    { id: 's2', storyId: 'story_b', name: 'B' }
                ]
            }))

            const { result } = renderHook(() => useSaveSystem('story_a'))

            act(() => {
                result.current.clearAllSaves()
            })

            // Check story_b save is preserved
            const stored = JSON.parse(localStorage.getItem('bardo_saves'))
            expect(stored.saves).toHaveLength(1)
            expect(stored.saves[0].storyId).toBe('story_b')
        })
    })

    describe('multi-story isolation', () => {
        it('should keep saves isolated between stories', () => {
            // Create save for story_a
            const { result: hookA } = renderHook(() => useSaveSystem('story_a'))
            act(() => {
                hookA.current.saveGame('Save A', '{"story":"a"}')
            })

            // Create save for story_b
            const { result: hookB } = renderHook(() => useSaveSystem('story_b'))
            act(() => {
                hookB.current.saveGame('Save B', '{"story":"b"}')
            })

            // Verify isolation
            expect(hookA.current.saves).toHaveLength(1)
            expect(hookA.current.saves[0].name).toBe('Save A')

            expect(hookB.current.saves).toHaveLength(1)
            expect(hookB.current.saves[0].name).toBe('Save B')
        })
    })
})
