import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

/**
 * useBossController - State machine for multi-phase boss fights.
 *
 * Manages boss HP, phase transitions, and defeat/death states.
 * Follows the same pattern as useWillpowerSystem (useState, useCallback, useRef, useMemo).
 * This hook is purely a state machine — actual phase behaviors (VFX, minigames, etc.)
 * are handled by other components/hooks.
 */

export type BossPhase = 'idle' | 'active' | 'phase_1' | 'phase_2' | 'phase_3' | 'defeated' | 'player_dead'

export interface BossState {
    isActive: boolean
    phase: BossPhase
    bossHp: number
    bossMaxHp: number
    bossName: string
}

export interface BossActions {
    startBoss: (config: { name: string; hp: number }) => void
    stopBoss: () => void
    setPhase: (n: number) => void
    damage: (amount: number) => void
    checkBoss: () => boolean
    playerDied: () => void
}

const DEFAULT_STATE: BossState = {
    isActive: false,
    phase: 'idle',
    bossHp: 0,
    bossMaxHp: 0,
    bossName: ''
}

const PHASE_MAP: Record<number, BossPhase> = {
    1: 'phase_1',
    2: 'phase_2',
    3: 'phase_3'
}

export function useBossController(): { state: BossState; actions: BossActions } {
    const [state, setState] = useState<BossState>(DEFAULT_STATE)
    const hpRef = useRef(0)

    // Keep ref in sync for real-time checks
    useEffect(() => {
        hpRef.current = state.bossHp
    }, [state.bossHp])

    const startBoss = useCallback((config: { name: string; hp: number }) => {
        console.log('[BossController] Starting boss:', config.name, 'HP:', config.hp)
        setState({
            isActive: true,
            phase: 'active',
            bossHp: config.hp,
            bossMaxHp: config.hp,
            bossName: config.name
        })
        hpRef.current = config.hp
    }, [])

    const stopBoss = useCallback(() => {
        console.log('[BossController] Stopping boss')
        setState(DEFAULT_STATE)
        hpRef.current = 0
    }, [])

    const setPhase = useCallback((n: number) => {
        const phase = PHASE_MAP[n]
        if (phase) {
            console.log(`[BossController] Transitioning to ${phase}`)
            setState(prev => ({
                ...prev,
                phase
            }))
        }
    }, [])

    const damage = useCallback((amount: number) => {
        setState(prev => {
            const newHp = Math.max(0, prev.bossHp - amount)
            const newPhase = newHp <= 0 ? 'defeated' as BossPhase : prev.phase
            console.log(`[BossController] Damage ${amount}: ${prev.bossHp} -> ${newHp}`)
            hpRef.current = newHp
            return {
                ...prev,
                bossHp: newHp,
                phase: newPhase
            }
        })
    }, [])

    const checkBoss = useCallback((): boolean => {
        const defeated = hpRef.current <= 0
        console.log(`[BossController] Check: HP=${hpRef.current}, defeated=${defeated}`)
        return defeated
    }, [])

    const playerDied = useCallback(() => {
        console.log('[BossController] Player died')
        setState(prev => ({
            ...prev,
            phase: 'player_dead'
        }))
    }, [])

    const actions = useMemo(() => ({
        startBoss,
        stopBoss,
        setPhase,
        damage,
        checkBoss,
        playerDied
    }), [startBoss, stopBoss, setPhase, damage, checkBoss, playerDied])

    return { state, actions }
}
