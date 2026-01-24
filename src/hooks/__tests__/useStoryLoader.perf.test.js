import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStoryLoader } from '../useStoryLoader'

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn()
}))

describe('useStoryLoader Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        delete window.__TAURI_INTERNALS__
    })

    it('should maintain stable reference for the returned object across renders', () => {
        const devStories = {
            'toybox': { inkVersion: 21, root: [] }
        }

        const { result, rerender } = renderHook(() => useStoryLoader({ devStories }))

        const initialResult = result.current

        // Force a re-render with the same props
        rerender({ devStories })

        const nextResult = result.current

        // This expectation is expected to fail before optimization
        expect(nextResult).toBe(initialResult)
    })
})
