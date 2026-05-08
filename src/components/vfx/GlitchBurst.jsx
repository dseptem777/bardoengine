import { useEffect, useRef } from 'react'

/**
 * GlitchBurst — Timed full-screen glitch overlay using #bardo-glitch SVG filter.
 *
 * Props:
 *   active   boolean  — When it transitions to true, plays the burst once then auto-clears.
 *   duration number   — How long (ms) the glitch stays visible. Default 800.
 *   onDone   fn       — Optional callback when burst finishes.
 */
export default function GlitchBurst({ active, duration = 800, onDone }) {
    const timerRef = useRef(null)
    const overlayRef = useRef(null)

    useEffect(() => {
        if (!active) return

        // Show the overlay
        if (overlayRef.current) {
            overlayRef.current.style.opacity = '1'
        }

        // Clear any prior timer
        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
            if (overlayRef.current) {
                overlayRef.current.style.opacity = '0'
            }
            onDone?.()
        }, duration)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [active, duration, onDone])

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 200,
                filter: 'url(#bardo-glitch)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                mixBlendMode: 'screen',
                opacity: 0,
                transition: `opacity ${Math.min(80, duration * 0.1)}ms ease-out`,
            }}
            aria-hidden="true"
        />
    )
}
