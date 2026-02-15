import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useBossController } from '../useBossController'

describe('useBossController', () => {
    describe('initial state', () => {
        it('should start in idle state', () => {
            const { result } = renderHook(() => useBossController())

            expect(result.current.state.isActive).toBe(false)
            expect(result.current.state.phase).toBe('idle')
            expect(result.current.state.bossHp).toBe(0)
            expect(result.current.state.bossMaxHp).toBe(0)
            expect(result.current.state.bossName).toBe('')
        })
    })

    describe('startBoss', () => {
        it('should activate boss with correct HP and name', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })

            expect(result.current.state.isActive).toBe(true)
            expect(result.current.state.phase).toBe('active')
            expect(result.current.state.bossHp).toBe(100)
            expect(result.current.state.bossMaxHp).toBe(100)
            expect(result.current.state.bossName).toBe('Amaru')
        })
    })

    describe('setPhase', () => {
        it('should transition to phase_1', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.setPhase(1)
            })

            expect(result.current.state.phase).toBe('phase_1')
        })

        it('should transition to phase_2', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.setPhase(2)
            })

            expect(result.current.state.phase).toBe('phase_2')
        })

        it('should transition to phase_3', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.setPhase(3)
            })

            expect(result.current.state.phase).toBe('phase_3')
        })
    })

    describe('damage', () => {
        it('should reduce HP by the given amount', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.damage(30)
            })

            expect(result.current.state.bossHp).toBe(70)
        })

        it('should clamp HP at 0 and auto-transition to defeated', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 50 })
            })
            act(() => {
                result.current.actions.damage(999)
            })

            expect(result.current.state.bossHp).toBe(0)
            expect(result.current.state.phase).toBe('defeated')
        })

        it('should transition to defeated when HP reaches exactly 0', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.damage(100)
            })

            expect(result.current.state.bossHp).toBe(0)
            expect(result.current.state.phase).toBe('defeated')
        })
    })

    describe('checkBoss', () => {
        it('should return false when boss is alive', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })

            let check: boolean = false
            act(() => {
                check = result.current.actions.checkBoss()
            })

            expect(check).toBe(false)
        })

        it('should return true when boss is defeated', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.damage(100)
            })

            let check: boolean = false
            act(() => {
                check = result.current.actions.checkBoss()
            })

            expect(check).toBe(true)
        })
    })

    describe('playerDied', () => {
        it('should set phase to player_dead', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.playerDied()
            })

            expect(result.current.state.phase).toBe('player_dead')
        })
    })

    describe('stopBoss', () => {
        it('should reset everything to default state', () => {
            const { result } = renderHook(() => useBossController())

            act(() => {
                result.current.actions.startBoss({ name: 'Amaru', hp: 100 })
            })
            act(() => {
                result.current.actions.setPhase(2)
            })
            act(() => {
                result.current.actions.damage(30)
            })
            act(() => {
                result.current.actions.stopBoss()
            })

            expect(result.current.state.isActive).toBe(false)
            expect(result.current.state.phase).toBe('idle')
            expect(result.current.state.bossHp).toBe(0)
            expect(result.current.state.bossMaxHp).toBe(0)
            expect(result.current.state.bossName).toBe('')
        })
    })
})
