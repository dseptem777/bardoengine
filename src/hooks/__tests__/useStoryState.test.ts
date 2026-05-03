import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStoryState } from '../useStoryState'

// Mock inkjs
const mockContinue = vi.fn()
const mockGetCurrentTags = vi.fn()
const mockCanContinue = vi.fn()
const mockChooseChoiceIndex = vi.fn()

vi.mock('inkjs', () => {
    return {
        Story: class MockStory {
            constructor(data) {}
            Continue = mockContinue
            get currentTags() { return mockGetCurrentTags() }
            get canContinue() { return mockCanContinue() }
            get currentChoices() { return [] }
            get state() { return { LoadJson: vi.fn(), toJson: vi.fn() } }
            variablesState = {}
            ChooseChoiceIndex = mockChooseChoiceIndex
        }
    }
})

describe('useStoryState Optimization Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should correctly process text and tags with loop', () => {
        const { result } = renderHook(() => useStoryState())

        // Setup mock behavior for a loop
        // Iteration 1: Text "Part 1", Tags ["tag1"]
        // Iteration 2: Text "Part 2", Tags ["tag2", "tag3"]
        // Stop

        // Loop check: while(currentStory.canContinue)
        mockCanContinue
            .mockReturnValueOnce(true) // Initial check
            .mockReturnValueOnce(true) // 2nd iteration
            .mockReturnValueOnce(false) // Stop

        mockContinue
            .mockReturnValueOnce("Part 1")
            .mockReturnValueOnce("Part 2")

        mockGetCurrentTags
            .mockReturnValueOnce(["tag1"])
            .mockReturnValueOnce(["tag2", "tag3"])

        act(() => {
            result.current.initStory({})
        })

        let output
        act(() => {
            output = result.current.continueStory()
        })

        expect(output.text).toBe("Part 1\n\nPart 2")
        expect(output.tags).toEqual(["tag1", "tag2", "tag3"])
        expect(result.current.currentTags).toEqual(["tag1", "tag2", "tag3"])
        expect(result.current.text).toBe("Part 1\n\nPart 2")
    })

    it('should build segments array with per-iteration text and tags', () => {
        const { result } = renderHook(() => useStoryState())

        mockCanContinue
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)

        mockContinue
            .mockReturnValueOnce('Caí haciendo un escándalo.')
            .mockReturnValueOnce('Julieta terminó de hablar.')

        mockGetCurrentTags
            .mockReturnValueOnce(['shake', 'play_sfx:aterrizaje'])
            .mockReturnValueOnce(['play_sfx:magia_hex'])

        act(() => {
            result.current.initStory({})
        })

        let output
        act(() => {
            output = result.current.continueStory()
        })

        expect(output.segments).toHaveLength(2)
        expect(output.segments[0].text).toBe('Caí haciendo un escándalo.')
        expect(output.segments[0].tags).toEqual(['shake', 'play_sfx:aterrizaje'])
        expect(output.segments[1].text).toBe('Julieta terminó de hablar.')
        expect(output.segments[1].tags).toEqual(['play_sfx:magia_hex'])

        // Hook state also exposes segments
        expect(result.current.segments).toHaveLength(2)
    })

    it('should handle breaks for pagination', () => {
        const { result } = renderHook(() => useStoryState())

        mockCanContinue.mockReturnValue(true) // Always true if not broken
        mockContinue.mockReturnValue("Some text")

        // Return a tag that causes break
        mockGetCurrentTags.mockReturnValueOnce(["next"])

        act(() => {
            result.current.initStory({})
        })

        let output
        act(() => {
            output = result.current.continueStory()
        })

        // It should have processed one batch and stopped
        expect(output.text).toBe("Some text")
        expect(output.tags).toEqual(["next"])
        expect(mockContinue).toHaveBeenCalledTimes(1)
    })
})
