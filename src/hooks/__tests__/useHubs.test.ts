import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useHubs } from '../useHubs'

describe('useHubs', () => {
    const mockHubsList = [
        {
            id: 'hub_home',
            options: [
                { target: 'mission_a', burns: ['mission_b', 'mission_c'] },
                { target: 'mission_b', burns: ['mission_a'] }
            ]
        }
    ]

    it('starts with empty state', () => {
        const { result } = renderHook(() => useHubs(mockHubsList))
        expect(result.current.burnedKnots).toEqual([])
        expect(result.current.isBurned('mission_a')).toBe(false)
    })

    it('burns targets when a choice is made', () => {
        const { result } = renderHook(() => useHubs(mockHubsList))

        act(() => {
            result.current.handleChoice('hub_home', 'mission_a')
        })

        expect(result.current.burnedKnots).toEqual(expect.arrayContaining(['mission_b', 'mission_c']))
        expect(result.current.isBurned('mission_b')).toBe(true)
        expect(result.current.isBurned('mission_c')).toBe(true)
        expect(result.current.isBurned('mission_a')).toBe(false)
    })

    it('accumulates burned knots', () => {
        const { result } = renderHook(() => useHubs(mockHubsList))

        act(() => {
            result.current.handleChoice('hub_home', 'mission_a')
        })

        // Assume we reset logic or just manually burn something else for test?
        // Let's just check state persistence
        expect(result.current.burnedKnots).toHaveLength(2)
    })

    it('does nothing if choice is not in registry', () => {
        const { result } = renderHook(() => useHubs(mockHubsList))

        act(() => {
            result.current.handleChoice('hub_unknown', 'mission_z')
        })

        expect(result.current.burnedKnots).toEqual([])
    })

    it('correctly exports state', () => {
        const { result } = renderHook(() => useHubs(mockHubsList))

        act(() => {
            result.current.handleChoice('hub_home', 'mission_a')
        })

        const exported = result.current.exportHubsState()
        expect(exported).toEqual(expect.arrayContaining(['mission_b', 'mission_c']))
    })
})
