import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBardoEngine } from '../useBardoEngine'
import { useSettings } from '../useSettings'
import { Story } from 'inkjs'

// Mock dependencies
vi.mock('inkjs', () => {
    return {
        Story: class MockStory {
            constructor(content) {
                this.content = content
                this.canContinue = true
                this.currentChoices = []
                this.currentTags = []
                this.variablesState = {}
                this.state = { toJson: () => ({}) }
            }
            Continue() {
                this.canContinue = false
                return 'Story text'
            }
            ChooseChoiceIndex() {}
        }
    }
})

// Mock useSettings
vi.mock('../useSettings', () => ({
    useSettings: () => ({
        settings: { vfxEnabled: true },
        getTypewriterDelay: () => 30,
        getMusicVolume: () => 0.5,
        getSfxVolume: () => 0.7
    })
}))

// Mock config loader
vi.mock('../../config/loadGameConfig', () => ({
    loadGameConfig: vi.fn().mockResolvedValue({
        stats: { enabled: false, definitions: [] },
        inventory: { enabled: false },
        achievements: []
    }),
    DEFAULT_CONFIG: {
        stats: { enabled: false, definitions: [] },
        inventory: { enabled: false }
    }
}))

describe('useBardoEngine Stability', () => {
    const mockStoryData = { inkVersion: 21, root: [["^Content", "\n", ["done"]]] }
    const getTypewriterDelay = () => 30
    const getMusicVolume = () => 0.5
    const getSfxVolume = () => 0.7
    const settings = { vfxEnabled: true }

    it('should maintain referential equality of actions when VFX is triggered', async () => {
        const { result } = renderHook(() => useBardoEngine({
            storyId: 'test_story',
            storyData: mockStoryData,
            settings,
            getTypewriterDelay,
            getMusicVolume,
            getSfxVolume
        }))

        // Initialize story
        act(() => {
            result.current.actions.initStory(mockStoryData)
        })

        const initialActions = result.current.actions
        const initialContinueStory = result.current.actions.continueStory

        // Trigger a VFX
        act(() => {
            result.current.subsystems.vfx.triggerVFX('shake')
        })

        // Verify vfxState changed (forcing a re-render)
        expect(result.current.subsystems.vfx.vfxState.shake).toBe(true)

        // Verify actions referential equality
        expect(result.current.actions).toBe(initialActions)
        expect(result.current.actions.continueStory).toBe(initialContinueStory)
    })
})
