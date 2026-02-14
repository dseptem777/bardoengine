import { useEffect, useRef, useCallback, useState } from 'react'
import type { ResistanceLevel } from './usePeripheralHorror'

/**
 * useHeavyCursor - Heavy/Resistant Cursor Implementation
 * 
 * Creates a "virtual cursor" that responds sluggishly to mouse movement,
 * simulating the feeling of fighting against mind control.
 * 
 * The real cursor is hidden and replaced with a custom div that:
 * 1. Moves slower than the real cursor (based on resistance level)
 * 2. Has visual "weight" indicators (trailing, trembling)
 * 3. Shows strain effects when fighting the resistance
 */

interface HeavyCursorConfig {
    resistanceLevel: ResistanceLevel
    enabled: boolean
    showTrail: boolean
    magnetTarget: { x: number; y: number } | null
    magnetStrength: number
}

// How much the cursor moves relative to real mouse (lower = heavier)
const RESISTANCE_FACTORS: Record<ResistanceLevel, number> = {
    none: 1.0,     // Normal cursor
    low: 0.5,      // Slightly sluggish
    medium: 0.3,   // Noticeably heavy
    high: 0.15,    // Very heavy, fighting to move
    extreme: 0.08  // Barely responds, constant struggle
}

// Inertia/smoothing factor - lower = more sluggish response
const INERTIA_FACTORS: Record<ResistanceLevel, number> = {
    none: 0.4,
    low: 0.2,
    medium: 0.1,
    high: 0.05,
    extreme: 0.025
}

export function useHeavyCursor(config: HeavyCursorConfig) {
    const { resistanceLevel, enabled, showTrail, magnetTarget, magnetStrength } = config

    // Cursor element refs
    const cursorRef = useRef<HTMLDivElement | null>(null)
    const trailRefs = useRef<HTMLDivElement[]>([])

    // Position tracking
    const realPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const virtualPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const velocity = useRef({ x: 0, y: 0 })

    // Animation state
    const animFrameRef = useRef<number | null>(null)
    const [isStraining, setIsStraining] = useState(false)

    // Create cursor element on mount
    useEffect(() => {
        if (!enabled) {
            // Cleanup if disabled
            document.body.classList.remove('horror-cursor-active')
            return
        }

        console.log('[HeavyCursor] Enabled! Creating virtual cursor')

        // Create main cursor
        const cursor = document.createElement('div')
        cursor.id = 'horror-virtual-cursor'
        cursor.className = 'horror-cursor'
        cursor.innerHTML = `
            <div class="horror-cursor-core"></div>
            <div class="horror-cursor-ring"></div>
            <div class="horror-cursor-strain"></div>
        `
        document.body.appendChild(cursor)
        cursorRef.current = cursor

        // Create trail elements
        if (showTrail) {
            for (let i = 0; i < 5; i++) {
                const trail = document.createElement('div')
                trail.className = 'horror-cursor-trail'
                trail.style.opacity = String(0.6 - i * 0.1)
                trail.style.transform = 'scale(' + (1 - i * 0.15) + ')'
                document.body.appendChild(trail)
                trailRefs.current.push(trail)
            }
        }

        // Hide real cursor using CSS class (more reliable)
        document.body.classList.add('horror-cursor-active')
        console.log('[HeavyCursor] Added horror-cursor-active class to body')

        return () => {
            console.log('[HeavyCursor] Cleanup - removing cursor elements')
            if (cursorRef.current && cursorRef.current.parentNode) {
                document.body.removeChild(cursorRef.current)
            }
            trailRefs.current.forEach(trail => {
                if (trail.parentNode) document.body.removeChild(trail)
            })
            trailRefs.current = []
            cursorRef.current = null
            document.body.classList.remove('horror-cursor-active')
        }
    }, [enabled, showTrail])

    // Mouse movement handler
    const handleMouseMove = useCallback((e: MouseEvent) => {
        realPos.current = { x: e.clientX, y: e.clientY }
    }, [])

    // Animation loop
    useEffect(() => {
        if (!enabled) return

        window.addEventListener('mousemove', handleMouseMove)

        const animate = () => {
            const factor = RESISTANCE_FACTORS[resistanceLevel]
            const inertia = INERTIA_FACTORS[resistanceLevel]

            // Calculate target position (with optional magnet influence)
            let targetX = realPos.current.x
            let targetY = realPos.current.y

            if (magnetTarget && magnetStrength > 0) {
                // Pull cursor toward magnet target
                const pullX = (magnetTarget.x - virtualPos.current.x) * magnetStrength * 0.1
                const pullY = (magnetTarget.y - virtualPos.current.y) * magnetStrength * 0.1
                targetX += pullX
                targetY += pullY
            }

            // Apply resistance - cursor moves slower toward target
            const deltaX = (targetX - virtualPos.current.x) * factor
            const deltaY = (targetY - virtualPos.current.y) * factor

            // Smooth with inertia
            velocity.current.x += (deltaX - velocity.current.x) * inertia
            velocity.current.y += (deltaY - velocity.current.y) * inertia

            virtualPos.current.x += velocity.current.x
            virtualPos.current.y += velocity.current.y

            // Detect straining (player fighting the resistance)
            const strainMagnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
            const newIsStraining = strainMagnitude > 50 && resistanceLevel !== 'none'
            if (newIsStraining !== isStraining) {
                setIsStraining(newIsStraining)
            }

            // Update cursor position
            if (cursorRef.current) {
                cursorRef.current.style.transform =
                    `translate(${virtualPos.current.x}px, ${virtualPos.current.y}px)`

                // Add strain visual
                if (newIsStraining) {
                    cursorRef.current.classList.add('straining')
                    // Add trembling
                    const tremble = Math.sin(Date.now() * 0.05) * (strainMagnitude * 0.05)
                    cursorRef.current.style.transform =
                        `translate(${virtualPos.current.x + tremble}px, ${virtualPos.current.y + tremble}px)`
                } else {
                    cursorRef.current.classList.remove('straining')
                }
            }

            // Update trail positions (delayed follow)
            trailRefs.current.forEach((trail, i) => {
                const delay = (i + 1) * 0.15
                const trailX = virtualPos.current.x - velocity.current.x * delay * 10
                const trailY = virtualPos.current.y - velocity.current.y * delay * 10
                trail.style.transform =
                    `translate(${trailX}px, ${trailY}px) scale(${1 - i * 0.15})`
            })

            animFrameRef.current = requestAnimationFrame(animate)
        }

        animFrameRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current)
            }
        }
    }, [enabled, resistanceLevel, magnetTarget, magnetStrength, handleMouseMove, isStraining])

    return {
        virtualPos,
        isStraining,
        cursorRef
    }
}
