/**
 * Tests for useStoryLoader hook
 * Covers development mode story loading and environment detection
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStoryLoader } from '../useStoryLoader'

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn()
}))

describe('useStoryLoader', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Ensure we're not in Tauri mode
        delete window.__TAURI_INTERNALS__
    })

    describe('development mode', () => {
        it('should return dev stories when not in Tauri', async () => {
            const devStories = {
                'toybox': { inkVersion: 21, root: [] },
                'partuza': { inkVersion: 21, root: [] }
            }

            const { result } = renderHook(() => useStoryLoader({ devStories }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.stories).toHaveLength(2)
            expect(result.current.stories[0].id).toBe('toybox')
            expect(result.current.stories[1].id).toBe('partuza')
            expect(result.current.isProductionMode).toBe(false)
        })

        it('should format story titles as uppercase', async () => {
            const devStories = {
                'centinelas': { inkVersion: 21, root: [] }
            }

            const { result } = renderHook(() => useStoryLoader({ devStories }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.stories[0].title).toBe('CENTINELAS')
        })

        it('should return empty array when no dev stories provided', async () => {
            const { result } = renderHook(() => useStoryLoader({ devStories: {} }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.stories).toHaveLength(0)
        })

        it('should have no error in dev mode', async () => {
            const { result } = renderHook(() => useStoryLoader({ devStories: {} }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.error).toBeNull()
        })

        it('should report isTauri as false in browser', async () => {
            const { result } = renderHook(() => useStoryLoader({ devStories: {} }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.isTauri).toBe(false)
        })
    })

    describe('production mode detection', () => {
        it('should detect Tauri environment when __TAURI_INTERNALS__ exists', async () => {
            // Simulate Tauri environment
            window.__TAURI_INTERNALS__ = {}

            const { invoke } = await import('@tauri-apps/api/core')
            invoke.mockResolvedValueOnce([]) // list_available_stories returns empty

            const { result } = renderHook(() => useStoryLoader({ devStories: {} }))

            expect(result.current.isProductionMode).toBe(true)
            expect(result.current.isTauri).toBe(true)

            // Cleanup
            delete window.__TAURI_INTERNALS__
        })
    })

    describe('story data structure', () => {
        it('should include id, title, and data for each story', async () => {
            const storyData = { inkVersion: 21, root: ['hello', 'world'] }
            const devStories = { 'test': storyData }

            const { result } = renderHook(() => useStoryLoader({ devStories }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.stories[0]).toEqual({
                id: 'test',
                title: 'TEST',
                data: storyData
            })
        })
    })
})
