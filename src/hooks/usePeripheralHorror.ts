import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

/**
 * usePeripheralHorror - Central Orchestrator for Meta-Horror Systems
 * 
 * This hook coordinates all peripheral manipulation mechanics:
 * - Mouse resistance (heavy cursor)
 * - Cursor magnet (attraction to specific elements)
 * - UI horror effects (vignette, cold blue, blood pulse)
 * 
 * The system creates "embodied narrative" - the player FEELS the vampire's
 * control through their own body/peripherals.
 */

export type ResistanceLevel = 'none' | 'low' | 'medium' | 'high' | 'extreme'

export interface CursorMagnetConfig {
    targetId: string
    strength: number // 0-1
    pulsing: boolean
}

export interface PeripheralHorrorState {
    // Mouse manipulation
    mouseResistance: ResistanceLevel
    cursorMagnet: CursorMagnetConfig | null

    // Visual horror effects
    uiEffect: string | null
    uiEffectIntensity: number // 0-1

    // Accessibility
    accessibilityMode: boolean

    // Mobile detection
    isMobile: boolean
}

export interface PeripheralHorrorActions {
    // Mouse control
    setMouseResistance: (level: ResistanceLevel) => void
    activateCursorMagnet: (targetId: string, strength?: number) => void
    deactivateCursorMagnet: () => void

    // UI Effects
    triggerUIEffect: (effect: string, intensity?: number) => void
    clearUIEffect: () => void

    // System control
    clearAll: () => void
    setAccessibilityMode: (enabled: boolean) => void
}

// Resistance factors - how much the cursor movement is dampened
const RESISTANCE_FACTORS: Record<ResistanceLevel, number> = {
    none: 1.0,
    low: 0.65,
    medium: 0.35,
    high: 0.15,
    extreme: 0.05
}

// Mobile detection
const checkIsMobile = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    ) || window.innerWidth < 768
}

export function usePeripheralHorror() {
    // State
    const [state, setState] = useState<PeripheralHorrorState>({
        mouseResistance: 'none',
        cursorMagnet: null,
        uiEffect: null,
        uiEffectIntensity: 1.0,
        accessibilityMode: false,
        isMobile: checkIsMobile()
    })

    // Track real cursor position (for magnet calculations)
    const realCursorRef = useRef({ x: 0, y: 0 })
    const virtualCursorRef = useRef({ x: 0, y: 0 })

    // Animation frame ref for smooth updates
    const animFrameRef = useRef<number | null>(null)

    // Detect mobile on mount
    useEffect(() => {
        const handleResize = () => {
            setState(prev => ({ ...prev, isMobile: checkIsMobile() }))
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // === Mouse Resistance System ===

    const setMouseResistance = useCallback((level: ResistanceLevel) => {
        console.log(`[PeripheralHorror] Setting mouse resistance: ${level}`)
        setState(prev => ({ ...prev, mouseResistance: level }))

        // Apply CSS cursor style based on resistance
        if (level !== 'none') {
            document.body.style.cursor = 'none'
            document.body.classList.add('horror-cursor-active')
        } else {
            document.body.style.cursor = ''
            document.body.classList.remove('horror-cursor-active')
        }
    }, [])

    // === Cursor Magnet System ===

    const activateCursorMagnet = useCallback((targetId: string, strength: number = 0.7) => {
        console.log(`[PeripheralHorror] Activating cursor magnet: ${targetId} @ ${strength}`)
        setState(prev => ({
            ...prev,
            cursorMagnet: { targetId, strength, pulsing: true }
        }))
    }, [])

    const deactivateCursorMagnet = useCallback(() => {
        console.log('[PeripheralHorror] Deactivating cursor magnet')
        setState(prev => ({ ...prev, cursorMagnet: null }))
    }, [])

    // === UI Horror Effects ===

    const triggerUIEffect = useCallback((effect: string, intensity: number = 1.0) => {
        console.log(`[PeripheralHorror] Triggering UI effect: ${effect} @ ${intensity}`)
        setState(prev => ({
            ...prev,
            uiEffect: effect,
            uiEffectIntensity: intensity
        }))
    }, [])

    const clearUIEffect = useCallback(() => {
        console.log('[PeripheralHorror] Clearing UI effect')
        setState(prev => ({ ...prev, uiEffect: null, uiEffectIntensity: 1.0 }))
    }, [])

    // === System Control ===

    const clearAll = useCallback(() => {
        console.log('[PeripheralHorror] Clearing all horror effects')
        document.body.style.cursor = ''
        document.body.classList.remove('horror-cursor-active')
        setState(prev => ({
            ...prev,
            mouseResistance: 'none',
            cursorMagnet: null,
            uiEffect: null,
            uiEffectIntensity: 1.0
        }))
    }, [])

    const setAccessibilityMode = useCallback((enabled: boolean) => {
        console.log(`[PeripheralHorror] Accessibility mode: ${enabled}`)
        setState(prev => ({ ...prev, accessibilityMode: enabled }))
        if (enabled) {
            clearAll()
        }
    }, [clearAll])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.cursor = ''
            document.body.classList.remove('horror-cursor-active')
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current)
            }
        }
    }, [])

    // Derived values
    const resistanceFactor = useMemo(() => {
        if (state.accessibilityMode) return 1.0
        return RESISTANCE_FACTORS[state.mouseResistance]
    }, [state.mouseResistance, state.accessibilityMode])

    // Public API
    const actions: PeripheralHorrorActions = useMemo(() => ({
        setMouseResistance,
        activateCursorMagnet,
        deactivateCursorMagnet,
        triggerUIEffect,
        clearUIEffect,
        clearAll,
        setAccessibilityMode
    }), [
        setMouseResistance,
        activateCursorMagnet,
        deactivateCursorMagnet,
        triggerUIEffect,
        clearUIEffect,
        clearAll,
        setAccessibilityMode
    ])

    return {
        state,
        actions,
        resistanceFactor,
        realCursorRef,
        virtualCursorRef
    }
}

export type UsePeripheralHorrorReturn = ReturnType<typeof usePeripheralHorror>
