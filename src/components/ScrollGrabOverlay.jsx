import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ScrollGrabOverlay — Shadow hands that grab the scroll from screen edges
 *
 * Phase 2 boss mechanic. Shadow hands emerge from left/right screen edges
 * and try to "grab" the scroll. The player must shake the mouse rapidly
 * on the X axis to fight them off.
 *
 * - If the player stops shaking for lockDelay ms, the scroll locks.
 * - If the player shakes while locked, the scroll unlocks.
 * - If the player sustains shaking for winDuration ms, the phase completes.
 */
export default function ScrollGrabOverlay({
    active,
    onScrollLock,
    onScrollUnlock,
    onPhaseComplete,
    shakeThreshold = 200,
    lockDelay = 3000,
    winDuration = 5000,
}) {
    const [isLocked, setIsLocked] = useState(false)
    const [shakeProgress, setShakeProgress] = useState(0)

    // Refs for tracking mouse velocity and timing
    const lastXRef = useRef(0)
    const lastTimeRef = useRef(0)
    const velocityRef = useRef(0)
    const calmStartRef = useRef(null)
    const shakeStartRef = useRef(null)
    const animFrameRef = useRef(null)

    // Stable callback refs to avoid stale closures
    const onScrollLockRef = useRef(onScrollLock)
    const onScrollUnlockRef = useRef(onScrollUnlock)
    const onPhaseCompleteRef = useRef(onPhaseComplete)

    useEffect(() => { onScrollLockRef.current = onScrollLock }, [onScrollLock])
    useEffect(() => { onScrollUnlockRef.current = onScrollUnlock }, [onScrollUnlock])
    useEffect(() => { onPhaseCompleteRef.current = onPhaseComplete }, [onPhaseComplete])

    // Track mouse X velocity
    const handleMouseMove = useCallback((e) => {
        const now = performance.now()
        const dt = now - lastTimeRef.current

        if (dt > 0 && lastTimeRef.current > 0) {
            const dx = Math.abs(e.clientX - lastXRef.current)
            const instantVelocity = (dx / dt) * 1000 // px/s
            // Blend with existing velocity for smoothing
            velocityRef.current = Math.max(velocityRef.current, instantVelocity)
        }

        lastXRef.current = e.clientX
        lastTimeRef.current = now
    }, [])

    useEffect(() => {
        if (!active) {
            // Reset state when deactivated
            setIsLocked(false)
            setShakeProgress(0)
            velocityRef.current = 0
            calmStartRef.current = null
            shakeStartRef.current = null
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current)
                animFrameRef.current = null
            }
            return
        }

        // Initialize timing
        lastXRef.current = 0
        lastTimeRef.current = 0
        velocityRef.current = 0
        calmStartRef.current = performance.now()
        shakeStartRef.current = null

        window.addEventListener('mousemove', handleMouseMove)

        let locked = false

        const tick = () => {
            const now = performance.now()
            const vel = velocityRef.current
            const isShaking = vel >= shakeThreshold

            // Decay velocity each frame
            velocityRef.current *= 0.95

            if (isShaking) {
                // Player is shaking — reset calm timer
                calmStartRef.current = null

                if (locked) {
                    // Unlock
                    locked = false
                    setIsLocked(false)
                    onScrollUnlockRef.current?.()
                }

                // Track sustained shaking
                if (!shakeStartRef.current) {
                    shakeStartRef.current = now
                }

                const elapsed = now - shakeStartRef.current
                const progress = Math.min(elapsed / winDuration, 1)
                setShakeProgress(progress)

                if (progress >= 1) {
                    // Win condition met
                    onPhaseCompleteRef.current?.()
                    return // Stop the loop
                }
            } else {
                // Player is calm — reset shake progress
                shakeStartRef.current = null
                setShakeProgress(0)

                if (!calmStartRef.current) {
                    calmStartRef.current = now
                }

                if (!locked) {
                    const calmElapsed = now - calmStartRef.current
                    if (calmElapsed >= lockDelay) {
                        locked = true
                        setIsLocked(true)
                        onScrollLockRef.current?.()
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(tick)
        }

        animFrameRef.current = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current)
                animFrameRef.current = null
            }
        }
    }, [active, shakeThreshold, lockDelay, winDuration, handleMouseMove])

    if (!active) return null

    return (
        <div className="fixed inset-0 z-[80] pointer-events-none">
            {/* Left shadow hand */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-32"
                style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)',
                }}
                animate={{
                    x: isLocked ? 40 : 0,
                    opacity: isLocked ? 1 : 0.7,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
                {/* Finger silhouettes — left hand reaching right */}
                <div className="absolute right-0 top-[20%] translate-x-1/2">
                    <div className="w-3 h-16 bg-gray-900 rounded-full absolute -rotate-12" style={{ top: 0, left: 0 }} />
                    <div className="w-3 h-20 bg-gray-900 rounded-full absolute -rotate-6" style={{ top: -8, left: 14 }} />
                    <div className="w-3.5 h-22 bg-gray-900 rounded-full absolute rotate-0" style={{ top: -12, left: 28 }} />
                    <div className="w-3 h-18 bg-gray-900 rounded-full absolute rotate-6" style={{ top: -6, left: 42 }} />
                    <div className="w-2.5 h-14 bg-gray-900 rounded-full absolute rotate-12" style={{ top: 4, left: 54 }} />
                </div>
                <div className="absolute right-0 top-[55%] translate-x-1/2">
                    <div className="w-3 h-14 bg-gray-900 rounded-full absolute -rotate-12" style={{ top: 0, left: 0 }} />
                    <div className="w-3 h-18 bg-gray-900 rounded-full absolute -rotate-3" style={{ top: -6, left: 14 }} />
                    <div className="w-3.5 h-20 bg-gray-900 rounded-full absolute rotate-3" style={{ top: -10, left: 28 }} />
                    <div className="w-3 h-16 bg-gray-900 rounded-full absolute rotate-8" style={{ top: -2, left: 42 }} />
                    <div className="w-2.5 h-12 bg-gray-900 rounded-full absolute rotate-15" style={{ top: 6, left: 54 }} />
                </div>
            </motion.div>

            {/* Right shadow hand */}
            <motion.div
                className="absolute right-0 top-0 bottom-0 w-32"
                style={{
                    background: 'linear-gradient(to left, rgba(0,0,0,0.8), transparent)',
                }}
                animate={{
                    x: isLocked ? -40 : 0,
                    opacity: isLocked ? 1 : 0.7,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
                {/* Finger silhouettes — right hand reaching left */}
                <div className="absolute left-0 top-[25%] -translate-x-1/2">
                    <div className="w-3 h-16 bg-gray-900 rounded-full absolute rotate-12" style={{ top: 0, right: 0 }} />
                    <div className="w-3 h-20 bg-gray-900 rounded-full absolute rotate-6" style={{ top: -8, right: 14 }} />
                    <div className="w-3.5 h-22 bg-gray-900 rounded-full absolute rotate-0" style={{ top: -12, right: 28 }} />
                    <div className="w-3 h-18 bg-gray-900 rounded-full absolute rotate-[-6deg]" style={{ top: -6, right: 42 }} />
                    <div className="w-2.5 h-14 bg-gray-900 rounded-full absolute rotate-[-12deg]" style={{ top: 4, right: 54 }} />
                </div>
                <div className="absolute left-0 top-[60%] -translate-x-1/2">
                    <div className="w-3 h-14 bg-gray-900 rounded-full absolute rotate-12" style={{ top: 0, right: 0 }} />
                    <div className="w-3 h-18 bg-gray-900 rounded-full absolute rotate-3" style={{ top: -6, right: 14 }} />
                    <div className="w-3.5 h-20 bg-gray-900 rounded-full absolute rotate-[-3deg]" style={{ top: -10, right: 28 }} />
                    <div className="w-3 h-16 bg-gray-900 rounded-full absolute rotate-[-8deg]" style={{ top: -2, right: 42 }} />
                    <div className="w-2.5 h-12 bg-gray-900 rounded-full absolute rotate-[-15deg]" style={{ top: 6, right: 54 }} />
                </div>
            </motion.div>

            {/* Locked message */}
            <AnimatePresence>
                {isLocked && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span
                            className="text-red-500 font-mono text-2xl md:text-3xl font-bold tracking-tight animate-pulse text-center px-4"
                            style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
                        >
                            {'\u00A1SACUD\u00CD EL MOUSE PARA LIBERARTE!'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shake progress bar */}
            <AnimatePresence>
                {shakeProgress > 0 && !isLocked && (
                    <motion.div
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${shakeProgress * 100}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                        <p
                            className="text-green-400 font-mono text-xs text-center mt-1 tracking-wider"
                            style={{ textShadow: '0 0 8px rgba(74, 222, 128, 0.4)' }}
                        >
                            RESISTIENDO...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
