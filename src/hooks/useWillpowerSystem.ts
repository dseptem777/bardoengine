import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

/**
 * useWillpowerSystem - Parallel Willpower State Management
 *
 * Manages the willpower mechanic that runs in parallel with the story.
 * The willpower bar decays over time (via internal rAF loop) and the player
 * must mash a key to maintain it. At certain story points, the current
 * willpower value determines outcomes.
 *
 * The decay loop lives entirely in this hook. WillpowerMeter.jsx is a pure
 * display component that only handles keypress boosts.
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
    boostValue: (delta: number) => void
    checkWillpower: (threshold: number) => boolean
}

const DEFAULT_STATE: WillpowerState = {
    active: false,
    value: 100,
    decayRate: 'normal',
    targetKey: 'V',
    threshold: 50
}

// Decay rates in units per second (matching WillpowerMeter's DECAY_RATES)
const DECAY_RATES: Record<string, number> = {
    slow: 2,
    normal: 4.5,
    fast: 8,
    extreme: 14
}

export function useWillpowerSystem(
    onPassCheck?: (passed: boolean) => void,
    onValueChange?: (value: number) => void
): [WillpowerState, WillpowerActions] {
    const [state, setState] = useState<WillpowerState>(DEFAULT_STATE)

    // valueRef: canonical source for instant reads (checkWillpower, rAF loop)
    const valueRef = useRef(100)
    // decayRateRef: read by rAF loop without stale closure issues
    const decayRateRef = useRef<string>('normal')
    // activeRef: lets the rAF loop self-terminate without a closure dependency
    const activeRef = useRef(false)

    // Callback refs — avoids stale closures in the rAF loop
    const onValueChangeRef = useRef(onValueChange)
    useEffect(() => { onValueChangeRef.current = onValueChange }, [onValueChange])

    const onPassCheckRef = useRef(onPassCheck)
    useEffect(() => { onPassCheckRef.current = onPassCheck }, [onPassCheck])

    // rAF handles
    const rafRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number>(0)

    // ─── rAF decay loop ──────────────────────────────────────────────────────
    const tick = useCallback((timestamp: number) => {
        if (!activeRef.current) return

        // Skip deltaTime computation on the very first frame to avoid a large jump
        const dt = lastTimeRef.current === 0
            ? 0
            : Math.min((timestamp - lastTimeRef.current) / 1000, 0.1) // cap at 100ms
        lastTimeRef.current = timestamp

        const ratePerSecond = DECAY_RATES[decayRateRef.current] ?? DECAY_RATES.normal
        const newValue = Math.max(0, valueRef.current - ratePerSecond * dt)

        valueRef.current = newValue
        setState(prev => ({ ...prev, value: newValue }))
        if (onValueChangeRef.current) onValueChangeRef.current(newValue)

        rafRef.current = requestAnimationFrame(tick)
    }, []) // stable — all dependencies are refs

    // ─── Actions ─────────────────────────────────────────────────────────────
    const startWillpower = useCallback((config?: Partial<Omit<WillpowerState, 'active'>>) => {
        const initialValue = config?.value ?? 100
        const rate = config?.decayRate ?? 'normal'

        valueRef.current = initialValue
        decayRateRef.current = rate
        activeRef.current = true
        lastTimeRef.current = 0 // reset so first frame gets dt=0

        setState(prev => ({
            ...prev,
            ...config,
            active: true,
            value: initialValue
        }))

        // Cancel any existing loop before starting a fresh one
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(tick)
    }, [tick])

    const stopWillpower = useCallback(() => {
        activeRef.current = false
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        lastTimeRef.current = 0
        setState(prev => ({ ...prev, active: false }))
    }, [])

    const updateValue = useCallback((value: number) => {
        const clampedValue = Math.max(0, Math.min(100, value))
        valueRef.current = clampedValue
        setState(prev => ({ ...prev, value: clampedValue }))
        if (onValueChangeRef.current) onValueChangeRef.current(clampedValue)
    }, [])

    const boostValue = useCallback((delta: number) => {
        const next = Math.max(0, Math.min(100, valueRef.current + delta))
        valueRef.current = next
        setState(prev => ({ ...prev, value: next }))
        if (onValueChangeRef.current) onValueChangeRef.current(next)
    }, [])

    const checkWillpower = useCallback((threshold: number): boolean => {
        const currentValue = valueRef.current
        const passed = currentValue >= threshold
        console.log(`[WillpowerSystem] Check at ${threshold}: value=${currentValue}, passed=${passed}`)

        if (onPassCheckRef.current) onPassCheckRef.current(passed)

        return passed
    }, []) // stable — uses only refs

    // ─── Cleanup on unmount ───────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            activeRef.current = false
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    const actions = useMemo(() => ({
        startWillpower,
        stopWillpower,
        updateValue,
        boostValue,
        checkWillpower
    }), [startWillpower, stopWillpower, updateValue, boostValue, checkWillpower])

    return [state, actions]
}
