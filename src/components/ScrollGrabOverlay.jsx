import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ScrollGrabOverlay — Shadow hands GRAB the player 3 times.
 *
 * Phase 2 boss mechanic:
 * 1. Wait for story text to finish typing (textReady)
 * 2. Player clicks PREPARARSE to begin
 * 3. Hands slam in — player must forcejear (struggle) with rapid mouse/touch
 * 4. While grabbed: HP drains, screen shakes, vignette tightens, colors drain
 * 5. Escape progress builds with movement, decays when idle
 * 6. Break free 3 times = phase complete. Too slow on any grab = death.
 *
 * Each successive grab is HARDER (more escape needed, faster decay).
 */

const GRAB_COUNT = 3
const BASE_ESCAPE_REQUIRED = 180  // grab 1
const ESCAPE_SCALING = 1.35       // each grab needs 35% more struggle
const BASE_DECAY = 1.2            // escape decay per tick when idle (grab 1)
const DECAY_SCALING = 1.25        // decay gets worse each grab
const STRUGGLE_THRESHOLD = 25     // activity needed to count as struggling
const HP_DRAIN_RATE = 3           // HP lost per 400ms while grabbed
const GRAB_TIMEOUT = 12000        // ms before a grab kills you
const BETWEEN_GRAB_DELAY = 1800   // breathing room between grabs

const GRAB_MESSAGES = [
    'NO TE VAS A IR...',
    'QUEDATE CON NOSOTROS...',
    'TU CARNE ES NUESTRA...',
    'SENTÍ NUESTRAS MANOS...',
    'NO HAY SALIDA...',
    'EL MUSEO TE RECLAMA...',
    'SOS PARTE DE LA COLECCIÓN...',
    'NADIE ESCUCHA TUS GRITOS...',
    'TU PIEL SE ENFRÍA...',
    'YA CASI SOS NUESTRO...',
]

export default function ScrollGrabOverlay({
    active,
    textReady = false,
    onScrollLock,
    onScrollUnlock,
    onPhaseComplete,
    onPhaseFail,
    onDrainHp,
}) {
    // === Visual state (drives render) ===
    const [playerReady, setPlayerReady] = useState(false)
    const [grabIndex, setGrabIndex] = useState(0)
    const [isGrabbed, setIsGrabbed] = useState(false)
    const [escapeProgress, setEscapeProgress] = useState(0)
    const [grabTimer, setGrabTimer] = useState(0)
    const [betweenGrabs, setBetweenGrabs] = useState(false)
    const [flashMessage, setFlashMessage] = useState('')
    const [hpLost, setHpLost] = useState(0)
    const [escapeFlash, setEscapeFlash] = useState(false)
    const [struggleIntensity, setStruggleIntensity] = useState(0) // 0-1, how hard they're fighting right now
    const [phaseEnded, setPhaseEnded] = useState(false)

    // === All game logic via refs (no useEffect dependency issues) ===
    const activityRef = useRef(0)
    const escapeAccumRef = useRef(0)
    const grabIndexRef = useRef(0)
    const grabStartRef = useRef(null)
    const isGrabbedRef = useRef(false)
    const phaseEndedRef = useRef(false)
    const animFrameRef = useRef(null)
    const hpDrainTimerRef = useRef(null)
    const messageTimerRef = useRef(null)
    const betweenGrabTimerRef = useRef(null)
    const introTimerRef = useRef(null)

    // Input tracking
    const lastMouseXRef = useRef(0)
    const lastMouseYRef = useRef(0)
    const lastMouseTimeRef = useRef(0)
    const lastTouchXRef = useRef(0)
    const lastTouchYRef = useRef(0)
    const lastTouchTimeRef = useRef(0)

    // Callback refs
    const onScrollLockRef = useRef(onScrollLock)
    const onScrollUnlockRef = useRef(onScrollUnlock)
    const onPhaseCompleteRef = useRef(onPhaseComplete)
    const onPhaseFailRef = useRef(onPhaseFail)
    const onDrainHpRef = useRef(onDrainHp)
    useEffect(() => { onScrollLockRef.current = onScrollLock }, [onScrollLock])
    useEffect(() => { onScrollUnlockRef.current = onScrollUnlock }, [onScrollUnlock])
    useEffect(() => { onPhaseCompleteRef.current = onPhaseComplete }, [onPhaseComplete])
    useEffect(() => { onPhaseFailRef.current = onPhaseFail }, [onPhaseFail])
    useEffect(() => { onDrainHpRef.current = onDrainHp }, [onDrainHp])

    // === Input handlers ===
    const handleMouseMove = useCallback((e) => {
        const now = performance.now()
        const dt = now - lastMouseTimeRef.current
        if (dt > 0 && lastMouseTimeRef.current > 0) {
            const dx = e.clientX - lastMouseXRef.current
            const dy = e.clientY - lastMouseYRef.current
            const dist = Math.sqrt(dx * dx + dy * dy)
            const vel = (dist / dt) * 1000
            if (vel > 60) {
                activityRef.current += vel / 20
            }
        }
        lastMouseXRef.current = e.clientX
        lastMouseYRef.current = e.clientY
        lastMouseTimeRef.current = now
    }, [])

    const handleTouchMove = useCallback((e) => {
        const touch = e.touches[0]
        if (!touch) return
        const now = performance.now()
        const dt = now - lastTouchTimeRef.current
        if (dt > 0 && lastTouchTimeRef.current > 0) {
            const dx = touch.clientX - lastTouchXRef.current
            const dy = touch.clientY - lastTouchYRef.current
            const dist = Math.sqrt(dx * dx + dy * dy)
            const vel = (dist / dt) * 1000
            if (vel > 30) {
                activityRef.current += vel / 15
            }
        }
        lastTouchXRef.current = touch.clientX
        lastTouchYRef.current = touch.clientY
        lastTouchTimeRef.current = now
    }, [])

    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0]
        if (!touch) return
        lastTouchXRef.current = touch.clientX
        lastTouchYRef.current = touch.clientY
        lastTouchTimeRef.current = performance.now()
        activityRef.current += 15
    }, [])

    // === Cleanup helper ===
    const clearAllTimers = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        if (hpDrainTimerRef.current) clearInterval(hpDrainTimerRef.current)
        if (messageTimerRef.current) clearInterval(messageTimerRef.current)
        if (betweenGrabTimerRef.current) clearTimeout(betweenGrabTimerRef.current)
        if (introTimerRef.current) clearTimeout(introTimerRef.current)
        animFrameRef.current = null
        hpDrainTimerRef.current = null
        messageTimerRef.current = null
        betweenGrabTimerRef.current = null
        introTimerRef.current = null
    }, [])

    // === Start a grab (imperative, no state deps) ===
    const startGrab = useCallback((index) => {
        grabIndexRef.current = index
        isGrabbedRef.current = true
        escapeAccumRef.current = 0
        grabStartRef.current = performance.now()
        activityRef.current = 0

        setGrabIndex(index)
        setIsGrabbed(true)
        setBetweenGrabs(false)
        setEscapeProgress(0)
        setGrabTimer(0)
        setStruggleIntensity(0)

        onScrollLockRef.current?.()

        // HP drain
        if (hpDrainTimerRef.current) clearInterval(hpDrainTimerRef.current)
        hpDrainTimerRef.current = setInterval(() => {
            setHpLost(prev => prev + HP_DRAIN_RATE)
            onDrainHpRef.current?.(HP_DRAIN_RATE)
        }, 400)

        // Creepy messages
        if (messageTimerRef.current) clearInterval(messageTimerRef.current)
        const pickMessage = () => {
            setFlashMessage(GRAB_MESSAGES[Math.floor(Math.random() * GRAB_MESSAGES.length)])
        }
        pickMessage()
        messageTimerRef.current = setInterval(pickMessage, 900)
    }, [])

    // === Escape from current grab (imperative) ===
    const escapeGrab = useCallback(() => {
        isGrabbedRef.current = false
        grabStartRef.current = null

        setIsGrabbed(false)
        setEscapeFlash(true)
        setStruggleIntensity(0)
        setFlashMessage('')
        setTimeout(() => setEscapeFlash(false), 500)

        if (hpDrainTimerRef.current) clearInterval(hpDrainTimerRef.current)
        if (messageTimerRef.current) clearInterval(messageTimerRef.current)

        onScrollUnlockRef.current?.()

        const nextIndex = grabIndexRef.current + 1
        if (nextIndex >= GRAB_COUNT) {
            // All grabs escaped!
            phaseEndedRef.current = true
            setPhaseEnded(true)
            setTimeout(() => {
                onPhaseCompleteRef.current?.(15)
            }, 600)
        } else {
            // Breathing room, then next grab
            setBetweenGrabs(true)
            betweenGrabTimerRef.current = setTimeout(() => {
                startGrab(nextIndex)
            }, BETWEEN_GRAB_DELAY)
        }
    }, [startGrab])

    // === Reset on deactivate ===
    useEffect(() => {
        if (!active) {
            setPlayerReady(false)
            setPhaseEnded(false)
            phaseEndedRef.current = false
        }
    }, [active])

    // === Main game loop — only depends on active + playerReady ===
    useEffect(() => {
        if (!active || !playerReady) {
            // Full reset
            setGrabIndex(0)
            setIsGrabbed(false)
            setEscapeProgress(0)
            setGrabTimer(0)
            setBetweenGrabs(false)
            setFlashMessage('')
            setHpLost(0)
            setEscapeFlash(false)
            setStruggleIntensity(0)
            grabIndexRef.current = 0
            isGrabbedRef.current = false
            escapeAccumRef.current = 0
            grabStartRef.current = null
            activityRef.current = 0
            lastMouseTimeRef.current = 0
            lastTouchTimeRef.current = 0
            clearAllTimers()
            return
        }

        // Start first grab after brief dramatic pause
        introTimerRef.current = setTimeout(() => {
            startGrab(0)
        }, 1000)

        // Register input listeners
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('touchstart', handleTouchStart, { passive: true })
        window.addEventListener('touchmove', handleTouchMove, { passive: true })

        // Game tick
        const tick = () => {
            if (phaseEndedRef.current) return

            if (!grabStartRef.current || !isGrabbedRef.current) {
                animFrameRef.current = requestAnimationFrame(tick)
                return
            }

            const now = performance.now()
            const activity = activityRef.current
            const grabElapsed = now - grabStartRef.current
            const currentGrab = grabIndexRef.current

            // Difficulty scaling per grab
            const escapeNeeded = BASE_ESCAPE_REQUIRED * Math.pow(ESCAPE_SCALING, currentGrab)
            const decayRate = BASE_DECAY * Math.pow(DECAY_SCALING, currentGrab)

            // Death timer
            const timerProgress = Math.min(grabElapsed / GRAB_TIMEOUT, 1)
            setGrabTimer(timerProgress)

            if (grabElapsed >= GRAB_TIMEOUT) {
                clearAllTimers()
                phaseEndedRef.current = true
                setPhaseEnded(true)
                onPhaseFailRef.current?.()
                return
            }

            // Struggle check
            const isStruggling = activity >= STRUGGLE_THRESHOLD
            const normalizedActivity = Math.min(activity / 80, 1) // 0-1 how hard they're moving
            setStruggleIntensity(normalizedActivity)

            if (isStruggling) {
                escapeAccumRef.current += activity * 0.12
            } else {
                escapeAccumRef.current = Math.max(0, escapeAccumRef.current - decayRate)
            }

            const progress = Math.min(escapeAccumRef.current / escapeNeeded, 1)
            setEscapeProgress(progress)

            // Decay activity
            activityRef.current *= 0.82

            // Escaped!
            if (progress >= 1) {
                escapeGrab()
                animFrameRef.current = requestAnimationFrame(tick)
                return
            }

            animFrameRef.current = requestAnimationFrame(tick)
        }

        animFrameRef.current = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
            clearAllTimers()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, playerReady])

    // === Render ===
    if (!active) return null

    // Gate: nothing until text finishes
    if (!playerReady) {
        if (!textReady) return null
        return (
            <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center pointer-events-auto">
                <motion.div
                    className="flex flex-col items-center gap-5 max-w-sm px-8 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <p className="font-mono text-red-500 text-sm tracking-wider uppercase"
                       style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
                        Las sombras se acercan
                    </p>
                    <p className="font-serif text-gray-300 text-sm leading-relaxed">
                        Las manos del museo van a agarrarte {GRAB_COUNT} veces.
                        {' '}Forcejeá moviendo el mouse rápido (o tocando la pantalla en mobile)
                        para liberarte antes de que te arrastren.
                    </p>
                    <p className="font-mono text-red-400/60 text-xs">
                        Cada agarre es más difícil que el anterior.
                    </p>
                    <motion.button
                        className="mt-3 px-10 py-3 font-mono text-lg tracking-widest border-2 border-red-600 text-red-300 bg-red-950/40 rounded cursor-pointer uppercase"
                        style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}
                        onClick={() => setPlayerReady(true)}
                        whileHover={{ scale: 1.05, borderColor: '#ef4444', background: 'rgba(127,29,29,0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ boxShadow: ['0 0 15px rgba(239,68,68,0.2)', '0 0 35px rgba(239,68,68,0.6)', '0 0 15px rgba(239,68,68,0.2)'] }}
                        transition={{ boxShadow: { repeat: Infinity, duration: 1.5 } }}
                    >
                        Prepararse
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    // === Grabbed state visuals ===
    const gripIntensity = isGrabbed ? 0.5 + grabTimer * 0.5 : 0
    // Hands advance further when not struggling, pull back when struggling
    const struggleRecoil = struggleIntensity * 40
    const handAdvance = isGrabbed ? (80 + grabTimer * 80 - struggleRecoil) : 0
    const vignetteIntensity = isGrabbed ? 0.3 + grabTimer * 0.6 : 0

    // Shake — constant while grabbed, intensity based on grab timer, reduced when struggling
    const shakeBase = isGrabbed ? (0.3 + grabTimer * 0.7) * (1 - struggleIntensity * 0.5) : 0
    const shakeX = shakeBase > 0 ? (Math.random() - 0.5) * shakeBase * 16 : 0
    const shakeY = shakeBase > 0 ? (Math.random() - 0.5) * shakeBase * 10 : 0

    return (
        <div
            className="fixed inset-0 z-[80]"
            style={{
                transform: isGrabbed ? `translate(${shakeX}px, ${shakeY}px)` : 'none',
                pointerEvents: isGrabbed ? 'auto' : 'none',
            }}
        >
            {/* Dark vignette — tightens as death approaches */}
            <div
                className="absolute inset-0 pointer-events-none transition-all duration-200"
                style={{
                    background: `radial-gradient(ellipse at center,
                        transparent ${Math.max(5, 30 - grabTimer * 25)}%,
                        rgba(40,0,20,${vignetteIntensity}) ${50 - grabTimer * 15}%,
                        rgba(60,0,10,${Math.min(vignetteIntensity + 0.3, 0.95)}) 100%)`,
                }}
            />

            {/* Red heartbeat pulse — faster as death approaches */}
            {isGrabbed && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0.05 + grabTimer * 0.1, 0.15 + grabTimer * 0.2, 0.05 + grabTimer * 0.1] }}
                    transition={{ repeat: Infinity, duration: Math.max(0.25, 0.8 - grabTimer * 0.6), ease: 'easeInOut' }}
                    style={{ background: 'rgba(180, 0, 0, 1)' }}
                />
            )}

            {/* Color drain + contrast crunch */}
            {isGrabbed && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backdropFilter: `grayscale(${grabTimer * 0.7}) contrast(${1 + grabTimer * 0.4}) brightness(${1 - grabTimer * 0.4})`,
                        WebkitBackdropFilter: `grayscale(${grabTimer * 0.7}) contrast(${1 + grabTimer * 0.4}) brightness(${1 - grabTimer * 0.4})`,
                    }}
                />
            )}

            {/* Escape flash (green burst) */}
            <AnimatePresence>
                {escapeFlash && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-[95]"
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ background: 'rgba(74, 222, 128, 0.3)' }}
                    />
                )}
            </AnimatePresence>

            {/* LEFT HAND — recoils when player struggles, clamps when idle */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-64 pointer-events-none"
                style={{
                    background: `linear-gradient(to right,
                        rgba(30,0,50,${0.92 + gripIntensity * 0.08}),
                        rgba(20,0,40,${0.5 + gripIntensity * 0.4}),
                        transparent)`,
                }}
                animate={{
                    x: isGrabbed ? Math.max(0, handAdvance) : betweenGrabs ? -30 : -80,
                    opacity: isGrabbed || betweenGrabs ? 1 : 0,
                }}
                transition={{
                    duration: isGrabbed ? 0.15 : 0.4,
                    ease: isGrabbed ? 'linear' : 'easeOut',
                }}
            >
                {/* Fingers at 20% */}
                <div className="absolute right-0 top-[15%] translate-x-1/2">
                    {[
                        { w: 7, h: 32, rot: -15, top: 0, left: 0 },
                        { w: 7, h: 38, rot: -8, top: -10, left: 22 },
                        { w: 7, h: 42, rot: 0, top: -16, left: 44 },
                        { w: 7, h: 34, rot: 8, top: -8, left: 66 },
                        { w: 6, h: 26, rot: 15, top: 4, left: 84 },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="rounded-full absolute"
                            style={{
                                width: f.w, height: f.h,
                                top: f.top, left: f.left,
                                transform: `rotate(${f.rot + (isGrabbed ? (struggleIntensity * (i % 2 ? 8 : -8)) : 0)}deg)`,
                                background: `rgba(${70 + i * 5},${15 + i * 3},${100 + i * 8},${0.85 + gripIntensity * 0.1})`,
                                boxShadow: `0 0 ${15 + gripIntensity * 25}px rgba(${120 + i * 10},40,170,${0.6 + gripIntensity * 0.3})`,
                                transition: 'transform 0.1s',
                            }}
                        />
                    ))}
                </div>
                {/* Fingers at 58% */}
                <div className="absolute right-0 top-[55%] translate-x-1/2">
                    {[
                        { w: 7, h: 28, rot: -18, top: 0, left: 0 },
                        { w: 7, h: 34, rot: -5, top: -8, left: 22 },
                        { w: 7, h: 36, rot: 4, top: -12, left: 44 },
                        { w: 7, h: 30, rot: 10, top: -4, left: 66 },
                        { w: 6, h: 22, rot: 20, top: 6, left: 84 },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="rounded-full absolute"
                            style={{
                                width: f.w, height: f.h,
                                top: f.top, left: f.left,
                                transform: `rotate(${f.rot + (isGrabbed ? (struggleIntensity * (i % 2 ? -6 : 6)) : 0)}deg)`,
                                background: `rgba(${65 + i * 5},${12 + i * 3},${95 + i * 8},${0.8 + gripIntensity * 0.15})`,
                                boxShadow: `0 0 ${12 + gripIntensity * 20}px rgba(${100 + i * 10},30,150,${0.5 + gripIntensity * 0.3})`,
                                transition: 'transform 0.1s',
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* RIGHT HAND */}
            <motion.div
                className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none"
                style={{
                    background: `linear-gradient(to left,
                        rgba(30,0,50,${0.92 + gripIntensity * 0.08}),
                        rgba(20,0,40,${0.5 + gripIntensity * 0.4}),
                        transparent)`,
                }}
                animate={{
                    x: isGrabbed ? -Math.max(0, handAdvance) : betweenGrabs ? 30 : 80,
                    opacity: isGrabbed || betweenGrabs ? 1 : 0,
                }}
                transition={{
                    duration: isGrabbed ? 0.15 : 0.4,
                    ease: isGrabbed ? 'linear' : 'easeOut',
                }}
            >
                <div className="absolute left-0 top-[20%] -translate-x-1/2">
                    {[
                        { w: 7, h: 32, rot: 15, top: 0, right: 0 },
                        { w: 7, h: 38, rot: 8, top: -10, right: 22 },
                        { w: 7, h: 42, rot: 0, top: -16, right: 44 },
                        { w: 7, h: 34, rot: -8, top: -8, right: 66 },
                        { w: 6, h: 26, rot: -15, top: 4, right: 84 },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="rounded-full absolute"
                            style={{
                                width: f.w, height: f.h,
                                top: f.top, right: f.right,
                                transform: `rotate(${f.rot + (isGrabbed ? (struggleIntensity * (i % 2 ? -8 : 8)) : 0)}deg)`,
                                background: `rgba(${70 + i * 5},${15 + i * 3},${100 + i * 8},${0.85 + gripIntensity * 0.1})`,
                                boxShadow: `0 0 ${15 + gripIntensity * 25}px rgba(${120 + i * 10},40,170,${0.6 + gripIntensity * 0.3})`,
                                transition: 'transform 0.1s',
                            }}
                        />
                    ))}
                </div>
                <div className="absolute left-0 top-[60%] -translate-x-1/2">
                    {[
                        { w: 7, h: 28, rot: 18, top: 0, right: 0 },
                        { w: 7, h: 34, rot: 5, top: -8, right: 22 },
                        { w: 7, h: 36, rot: -4, top: -12, right: 44 },
                        { w: 7, h: 30, rot: -10, top: -4, right: 66 },
                        { w: 6, h: 22, rot: -20, top: 6, right: 84 },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="rounded-full absolute"
                            style={{
                                width: f.w, height: f.h,
                                top: f.top, right: f.right,
                                transform: `rotate(${f.rot + (isGrabbed ? (struggleIntensity * (i % 2 ? 6 : -6)) : 0)}deg)`,
                                background: `rgba(${65 + i * 5},${12 + i * 3},${95 + i * 8},${0.8 + gripIntensity * 0.15})`,
                                boxShadow: `0 0 ${12 + gripIntensity * 20}px rgba(${100 + i * 10},30,150,${0.5 + gripIntensity * 0.3})`,
                                transition: 'transform 0.1s',
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* CENTER HUD */}
            <AnimatePresence mode="wait">
                {isGrabbed ? (
                    <motion.div
                        key={`grab-${grabIndex}`}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
                        initial={{ opacity: 0, scale: 1.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* Grab counter dots */}
                        <div className="flex gap-3 mb-1">
                            {Array.from({ length: GRAB_COUNT }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                                        i < grabIndex ? 'bg-green-500 border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' :
                                        i === grabIndex ? 'bg-red-600 border-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]' :
                                        'bg-gray-800 border-gray-600'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Creepy message — larger, more aggressive */}
                        <motion.p
                            key={flashMessage}
                            className="font-mono text-2xl md:text-3xl font-black text-red-500 text-center px-4 tracking-tight uppercase"
                            style={{
                                textShadow: `0 0 ${25 + grabTimer * 40}px rgba(239, 68, 68, ${0.6 + grabTimer * 0.4}), 0 0 ${50 + grabTimer * 60}px rgba(180, 0, 0, ${grabTimer * 0.4})`,
                            }}
                            initial={{ opacity: 0, scale: 0.8, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {flashMessage}
                        </motion.p>

                        {/* Instruction — big and clear */}
                        <motion.p
                            className="font-mono text-base md:text-lg text-yellow-300 tracking-wider font-bold"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}
                        >
                            {'\u00A1\u00A1\u00A1 FORCEJEÁ !!! \u2014 MOV\u00C9 R\u00C1PIDO'}
                        </motion.p>

                        {/* Escape progress bar — LARGE */}
                        <div className="w-64 md:w-80 mt-2">
                            <div className="h-5 bg-gray-900/90 rounded-full overflow-hidden border-2 border-gray-600 relative">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${escapeProgress * 100}%`,
                                        background: escapeProgress > 0.7
                                            ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                                            : escapeProgress > 0.3
                                            ? 'linear-gradient(90deg, #ca8a04, #facc15)'
                                            : 'linear-gradient(90deg, #dc2626, #f87171)',
                                        boxShadow: escapeProgress > 0.7
                                            ? '0 0 15px rgba(74,222,128,0.6)'
                                            : escapeProgress > 0.3
                                            ? '0 0 10px rgba(250,204,21,0.4)'
                                            : '0 0 8px rgba(248,113,113,0.4)',
                                    }}
                                    transition={{ duration: 0.05 }}
                                />
                                {/* Percentage text inside bar */}
                                <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-white/90 drop-shadow-lg">
                                    {Math.round(escapeProgress * 100)}% — LIBERARSE
                                </span>
                            </div>
                        </div>

                        {/* Death countdown */}
                        <div className="w-52 mt-3">
                            <div className="h-2 bg-black rounded-full overflow-hidden border border-red-900/50">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${grabTimer * 100}%`,
                                        background: grabTimer > 0.7
                                            ? 'linear-gradient(90deg, #dc2626, #ff0000)'
                                            : 'linear-gradient(90deg, #7f1d1d, #dc2626)',
                                        boxShadow: grabTimer > 0.7 ? '0 0 10px rgba(255,0,0,0.6)' : 'none',
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <p className={`font-mono text-center mt-1 tracking-widest ${
                                grabTimer > 0.7 ? 'text-red-400 text-xs font-bold animate-pulse' : 'text-red-500/40 text-[9px]'
                            }`}>
                                {grabTimer > 0.7 ? '\u00A1TE ARRASTRAN!' : 'TE ARRASTRAN AL UKU PACHA...'}
                            </p>
                        </div>

                        {/* HP lost */}
                        {hpLost > 0 && (
                            <motion.p
                                className="font-mono text-base font-bold text-red-400"
                                style={{ textShadow: '0 0 12px rgba(239,68,68,0.6)' }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                            >
                                -{hpLost} HP
                            </motion.p>
                        )}

                        {/* Grab difficulty indicator */}
                        <p className="font-mono text-[10px] text-purple-400/40 mt-1">
                            AGARRE {grabIndex + 1}/{GRAB_COUNT}
                            {grabIndex > 0 && ' — MÁS FUERTE'}
                        </p>
                    </motion.div>
                ) : betweenGrabs ? (
                    <motion.div
                        key="breathing"
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex gap-3 mb-4">
                            {Array.from({ length: GRAB_COUNT }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full border-2 ${
                                        i <= grabIndex ? 'bg-green-500 border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' :
                                        'bg-gray-800 border-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                        <motion.p
                            className="font-mono text-green-400 text-xl tracking-wider font-bold"
                            style={{ textShadow: '0 0 20px rgba(74,222,128,0.6)' }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            {'\u00A1TE LIBERASTE!'}
                        </motion.p>
                        <p className="font-mono text-red-400/60 text-sm mt-3 animate-pulse">
                            PREPARATE... VIENEN DE NUEVO
                        </p>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
