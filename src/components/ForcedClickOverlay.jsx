import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ForcedClickOverlay - Animates cursor towards a target and clicks it
 * 
 * Used when the player loses all willpower - the "vampire" takes control
 * of the cursor and forces a choice.
 */
export default function ForcedClickOverlay({
    active,
    targetSelector,
    choicesVisible,
    onComplete,
    message = "Ya no tenés control..."
}) {
    const [phase, setPhase] = useState('idle')
    const [targetPosition, setTargetPosition] = useState({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    })
    const hasCompletedRef = useRef(false)
    const [hasFoundTarget, setHasFoundTarget] = useState(false)
    const hasClickedRef = useRef(false)
    const onCompleteRef = useRef(onComplete)

    // Keep ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    // Cleanup and Init
    useEffect(() => {
        if (active) {
            console.log('[ForcedClick] Overlay activated')
            hasCompletedRef.current = false
            setHasFoundTarget(false)
            hasClickedRef.current = false
            setPhase('takeover')
            setTargetPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

            // Hide real cursor
            const style = document.createElement('style')
            style.id = 'force-hide-cursor'
            style.innerHTML = '*{ cursor: none !important; }'
            document.head.appendChild(style)
            document.body.classList.add('horror-cursor-active')

            // Hide heavy cursor visuals
            const horrorCursor = document.getElementById('horror-virtual-cursor')
            if (horrorCursor) horrorCursor.style.opacity = '0'
            const trails = document.querySelectorAll('.horror-cursor-trail')
            trails.forEach(t => t.style.opacity = '0')

            return () => {
                const s = document.getElementById('force-hide-cursor')
                if (s) s.remove()
                document.body.classList.remove('horror-cursor-active')
                if (horrorCursor) horrorCursor.style.opacity = '1'
                trails.forEach(t => t.style.opacity = '')
                const targetEl = document.querySelector(targetSelector)
                if (targetEl) targetEl.classList.remove('forced-target-lock')
            }
        } else {
            setPhase('idle')
        }
    }, [active, targetSelector])

    // Targeting Logic
    useEffect(() => {
        if (!active || phase === 'idle' || phase === 'done') return

        // 1. Phase advancement to 'moving'
        let moveTimeout = null
        if (phase === 'takeover') {
            moveTimeout = setTimeout(() => setPhase('moving'), 1200)
        }

        // 2. Continuous seeking
        const ticker = setInterval(() => {
            const targetEl = document.querySelector(targetSelector)

            if (targetEl) {
                const rect = targetEl.getBoundingClientRect()
                if (rect.width > 0 && rect.height > 0) {
                    setTargetPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    })

                    if (!hasFoundTarget) {
                        setHasFoundTarget(true)
                        targetEl.classList.add('forced-target-lock')
                        console.log('[ForcedClick] Specific button locked')
                    }
                    return
                }
            }

            // Fallback while waiting: Move towards the general choice area
            const container = document.querySelector('.choice-container')
            if (container && phase === 'moving' && !hasFoundTarget) {
                const rect = container.getBoundingClientRect()
                setTargetPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2 + 50 // Slightly below to look intentional
                })
            } else if (phase === 'moving' && !hasFoundTarget) {
                // Last resort fallback
                setTargetPosition({ x: window.innerWidth / 2, y: window.innerHeight * 0.85 })
            }
        }, 50)

        return () => {
            if (moveTimeout) clearTimeout(moveTimeout)
            clearInterval(ticker)
        }
    }, [active, phase, targetSelector])

    // Click timeout ref to prevent cleanup cancellation
    const clickTimeoutRef = useRef(null)
    const travelTimeoutRef = useRef(null)

    // Click logic (Now properly depends on phase)
    useEffect(() => {
        // Only trigger when all conditions are met
        if (active && choicesVisible && phase === 'moving' && hasFoundTarget && !hasClickedRef.current) {
            console.log('[ForcedClick] Ready to strike - cursor traveling to target')
            hasClickedRef.current = true

            // Wait for cursor to reach target (1.8s travel time), then click
            travelTimeoutRef.current = setTimeout(() => {
                console.log('[ForcedClick] Cursor arrived - clicking')
                setPhase('clicking')

                // After click animation (800ms), complete
                clickTimeoutRef.current = setTimeout(() => {
                    console.log('[ForcedClick] Executing forced choice')
                    setPhase('done')
                    if (!hasCompletedRef.current && onCompleteRef.current) {
                        hasCompletedRef.current = true
                        onCompleteRef.current()
                    }
                }, 800)
            }, 1800)  // Match the cursor travel duration
        }
    }, [active, choicesVisible, phase, hasFoundTarget])

    // Cleanup timeouts on unmount only
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
            if (travelTimeoutRef.current) clearTimeout(travelTimeoutRef.current)
        }
    }, [])

    if (!active || phase === 'idle') return null

    const startX = window.innerWidth / 2
    const startY = window.innerHeight / 2

    return (
        <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
            <motion.div
                className="absolute inset-0 bg-black/40 pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />

            <AnimatePresence>
                {(phase === 'takeover' || phase === 'moving') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 text-red-500 font-mono text-3xl font-bold tracking-tighter"
                        style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Vampire Cursor */}
            <motion.div
                className="absolute"
                style={{ left: 0, top: 0, zIndex: 10000 }}
                initial={{ x: startX, y: startY }}
                animate={{
                    x: (phase === 'moving' || phase === 'clicking' || phase === 'done') ? targetPosition.x : startX,
                    y: (phase === 'moving' || phase === 'clicking' || phase === 'done') ? targetPosition.y : startY
                }}
                transition={{
                    duration: phase === 'moving' ? 1.8 : 0.2, // Smoother travel
                    ease: "anticipate"
                }}
            >
                <motion.div
                    className="relative"
                    style={{ transform: 'translate(-50%, -50%)' }}
                    animate={phase === 'clicking' ? { scale: [1, 0.6, 1.2, 1], rotate: [0, 15, -15, 0] } : {}}
                >
                    {/* Main visual */}
                    <div
                        className="w-12 h-12 rounded-full border-4 border-red-600 flex items-center justify-center"
                        style={{
                            background: 'radial-gradient(circle, rgba(153, 27, 27, 0.9) 0%, rgba(69, 10, 10, 0.8) 70%)',
                            boxShadow: '0 0 40px rgba(220, 38, 38, 0.6), inset 0 0 10px black'
                        }}
                    >
                        <div className="w-4 h-4 rounded-full bg-red-400 animate-pulse" />
                    </div>

                    {/* Feedback ripples on click */}
                    {phase === 'clicking' && (
                        <motion.div
                            className="absolute inset-0 border-4 border-red-500 rounded-full"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 4, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    )}
                </motion.div>
            </motion.div>

            {/* Block interactions */}
            <div className="absolute inset-0 pointer-events-auto" style={{ cursor: 'none' }} />
        </div>
    )
}
