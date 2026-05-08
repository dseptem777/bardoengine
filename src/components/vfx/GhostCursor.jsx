import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * GhostCursor — React portal ghost cursor that lerps toward the real mouse.
 * Renders only when resistance >= medium. Complements useHeavyCursor's DOM cursor
 * by adding a second, softer ghost ring that lags further behind.
 *
 * Lerp factors by resistance:
 *   medium:  0.08
 *   high:    0.05
 *   extreme: 0.03
 *
 * Hidden on touch devices (pointer type detection via pointermove).
 */

const LERP_FACTORS = {
    medium: 0.08,
    high: 0.05,
    extreme: 0.03,
}

export default function GhostCursor({ resistanceLevel }) {
    const ghostRef = useRef(null)
    const rafRef = useRef(null)
    const realPos = useRef({ x: -200, y: -200 })
    const ghostPos = useRef({ x: -200, y: -200 })
    const isTouchRef = useRef(false)

    const factor = LERP_FACTORS[resistanceLevel] ?? LERP_FACTORS.medium

    useEffect(() => {
        const handlePointerMove = (e) => {
            // Suppress on touch devices
            if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                isTouchRef.current = true
                if (ghostRef.current) ghostRef.current.style.opacity = '0'
                return
            }
            isTouchRef.current = false
            realPos.current = { x: e.clientX, y: e.clientY }
        }

        window.addEventListener('pointermove', handlePointerMove)

        // Initialize ghost at center to avoid jump-in
        ghostPos.current = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        }

        const loop = () => {
            if (!isTouchRef.current && ghostRef.current) {
                ghostPos.current.x += (realPos.current.x - ghostPos.current.x) * factor
                ghostPos.current.y += (realPos.current.y - ghostPos.current.y) * factor

                ghostRef.current.style.transform =
                    `translate(${ghostPos.current.x}px, ${ghostPos.current.y}px)`
                ghostRef.current.style.opacity = '1'
            }
            rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)

        return () => {
            window.removeEventListener('pointermove', handlePointerMove)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [factor])

    return createPortal(
        <div
            ref={ghostRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 28,
                height: 28,
                marginLeft: -14,
                marginTop: -14,
                pointerEvents: 'none',
                zIndex: 9999,
                opacity: 0,
                willChange: 'transform',
                transition: 'opacity 0.2s',
            }}
        >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle
                    cx="14"
                    cy="14"
                    r="12"
                    stroke="rgba(250,204,21,0.35)"
                    strokeWidth="1.5"
                />
                <circle
                    cx="14"
                    cy="14"
                    r="4"
                    fill="rgba(250,204,21,0.2)"
                />
            </svg>
        </div>,
        document.body
    )
}
