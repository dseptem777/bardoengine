import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * useWillpowerSystem - Parallel Willpower State Management
 * 
 * Manages the willpower mechanic that runs in parallel with the story.
 * The willpower bar decays over time and the player must mash a key to maintain it.
 * At certain story points, the current willpower value determines outcomes.
 */

export interface WillpowerState {
    active: boolean
    value: number           // 0-100
    decayRate: string      // 'slow' | 'normal' | 'fast' | 'extreme'
    targetKey: string       // Which key to mash
    threshold: number       // Success threshold for checks
}

export interface WillpowerActions {
    startWillpower: (config?: Partial<Omit<WillpowerState, 'active'>>) => void
    stopWillpower: () => void
    updateValue: (value: number) => void
    checkWillpower: (threshold: number) => boolean
}

const DEFAULT_STATE: WillpowerState = {
    active: false,
    value: 100,
    decayRate: 'normal',
    targetKey: 'V',
    threshold: 50
}

export function useWillpowerSystem(
    onPassCheck?: (passed: boolean) => void
): [WillpowerState, WillpowerActions] {
    const [state, setState] = useState<WillpowerState>(DEFAULT_STATE)
    const valueRef = useRef(100)

    // Keep ref in sync for real-time checks
    useEffect(() => {
        valueRef.current = state.value
    }, [state.value])

    const startWillpower = useCallback((config?: Partial<Omit<WillpowerState, 'active'>>) => {
        console.log('[WillpowerSystem] Starting with config:', config)
        setState(prev => ({
            ...prev,
            ...config,
            active: true,
            value: config?.value ?? 100
        }))
        valueRef.current = config?.value ?? 100
    }, [])

    const stopWillpower = useCallback(() => {
        console.log('[WillpowerSystem] Stopping')
        setState(prev => ({
            ...prev,
            active: false
        }))
    }, [])

    const updateValue = useCallback((value: number) => {
        const clampedValue = Math.max(0, Math.min(100, value))
        setState(prev => ({
            ...prev,
            value: clampedValue
        }))
        valueRef.current = clampedValue
    }, [])

    const checkWillpower = useCallback((threshold: number): boolean => {
        const currentValue = valueRef.current
        const passed = currentValue >= threshold
        console.log(`[WillpowerSystem] Check at ${threshold}: value=${currentValue}, passed=${passed}`)

        if (onPassCheck) {
            onPassCheck(passed)
        }

        return passed
    }, [onPassCheck])

    return [
        state,
        {
            startWillpower,
            stopWillpower,
            updateValue,
            checkWillpower
        }
    ]
}
