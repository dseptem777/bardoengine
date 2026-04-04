import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useTagProcessor } from '../useTagProcessor'

function createMockOptions(overrides = {}) {
    return {
        storyRef: { current: { variablesState: {} } },
        minigameController: { startMinigame: vi.fn() },
        achievementsSystem: { unlock: vi.fn() },
        gameSystems: { processTag: vi.fn(), processGameTag: vi.fn(() => false) },
        triggerVFX: vi.fn(),
        ...overrides,
    }
}

describe('GENJUTSU_BREAK tag', () => {
    it('calls onGenjutsuBreak with parsed stat and target knot', () => {
        const onGenjutsuBreak = vi.fn()
        const { result } = renderHook(() =>
            useTagProcessor(createMockOptions({ onGenjutsuBreak }))
        )

        result.current.processTags(['GENJUTSU_BREAK: conocimiento:cap2b_resistencia'])
        expect(onGenjutsuBreak).toHaveBeenCalledWith('conocimiento', 'cap2b_resistencia', '')
    })

    it('trims and lowercases the stat', () => {
        const onGenjutsuBreak = vi.fn()
        const { result } = renderHook(() =>
            useTagProcessor(createMockOptions({ onGenjutsuBreak }))
        )

        result.current.processTags(['GENJUTSU_BREAK:  Fuerza : some_knot '])
        expect(onGenjutsuBreak).toHaveBeenCalledWith('fuerza', 'some_knot', '')
    })

    it('ignores tag if no onGenjutsuBreak callback', () => {
        const { result } = renderHook(() =>
            useTagProcessor(createMockOptions())
        )
        // Should not throw
        result.current.processTags(['GENJUTSU_BREAK: magia:knot'])
    })
})
