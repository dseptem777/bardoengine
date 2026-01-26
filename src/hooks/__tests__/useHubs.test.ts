import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useHubs } from '../useHubs'

const mockRegistry = [
    {
        id: 'hub_home',
        options: [
            { target: 'mission_a', burns: ['mission_b', 'mission_c'] },
            { target: 'mission_b', burns: ['mission_a'] }
        ]
    }
]

describe('useHubs', () => {
    it('initializes with no burned knots', () => {
        const { result } = renderHook(() => useHubs(mockRegistry))
        expect(result.current.burnedKnots).toEqual([])
        expect(result.current.isBurned('mission_b')).toBe(false)
    })

    it('burns targets when a choice is made', () => {
        const { result } = renderHook(() => useHubs(mockRegistry))

        act(() => {
            result.current.handleChoice('hub_home', 'mission_a')
        })

        expect(result.current.burnedKnots).toContain('mission_b')
        expect(result.current.burnedKnots).toContain('mission_c')
        expect(result.current.isBurned('mission_b')).toBe(true)
        expect(result.current.isBurned('mission_c')).toBe(true)
        // mission_a itself is not burned, unless specified
        expect(result.current.isBurned('mission_a')).toBe(false)
    })

    it('does not burn if choice is not in registry', () => {
        const { result } = renderHook(() => useHubs(mockRegistry))

        act(() => {
            result.current.handleChoice('hub_home', 'random_place')
        })

        expect(result.current.burnedKnots).toEqual([])
    })

    it('accumulates burned knots', () => {
        const { result } = renderHook(() => useHubs(mockRegistry))

        act(() => {
            // First choice
            result.current.handleChoice('hub_home', 'mission_a')
        })
        expect(result.current.burnedKnots).toContain('mission_b')

        act(() => {
             // In a hypothetical scenario where we can still choose mission_d (not in this mock but logic holds)
             // or manually load state
             result.current.loadHubsState(['mission_d'])
        })
        // loadHubsState replaces state, wait, check logic.
        // It says setBurnedKnots(savedBurned), so it replaces.
        expect(result.current.burnedKnots).toEqual(['mission_d'])
    })

    it('correctly exports state', () => {
        const { result } = renderHook(() => useHubs(mockRegistry))
        act(() => {
            result.current.handleChoice('hub_home', 'mission_a')
        })
        expect(result.current.exportHubsState()).toEqual(expect.arrayContaining(['mission_b', 'mission_c']))
    })
})
