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
