import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * CrawlGame — Hold/Release Stamina Minigame
 *
 * The player must hold V to drag themselves across the floor while wounded.
 * Holding drains stamina; releasing allows recovery. If stamina hits 0,
 * the arm gives out (forced release). Time runs out as they bleed.
 *
 * Immersion model: identical to ApneaGame — full-screen, accumulating
 * text log, reactive text pools, text degradation, audio, blood overlay.
 */

// --- Balance constants ---

const STAMINA_DRAIN = 14      // %/s while holding
const STAMINA_RECOVER = 16    // %/s while not holding
const RECOVER_DELAY_MS = 350  // ms before stamina starts recovering after release
const PROGRESS_RATE = 4.5     // %/s while holding with stamina > 0
const TIME_LIMIT = 45         // seconds before bleeding out
const FORCED_RELEASE_BLOCK_MS = 500 // ms of input block after forced release
const SCARE_INTERVAL_MIN = 8000  // ms minimum between scare events
const SCARE_INTERVAL_MAX = 14000 // ms maximum between scare events

// --- Blood stains — pre-defined irregular blobs, revealed as progress grows ---
// Each stain: position, size, shape, rotation, progress threshold to appear
const BLOOD_STAINS = [
    { left: 48, bottom: 12, w: 38, h: 28, br: '60% 40% 55% 45% / 50% 60% 40% 55%', rot: 12,  threshold: 8  },
    { left: 42, bottom: 9,  w: 22, h: 18, br: '40% 60% 45% 55% / 60% 40% 55% 45%', rot: -8,  threshold: 15 },
    { left: 55, bottom: 14, w: 44, h: 20, br: '55% 45% 60% 40% / 45% 55% 40% 60%', rot: 5,   threshold: 22 },
    { left: 38, bottom: 8,  w: 18, h: 24, br: '45% 55% 40% 60% / 55% 45% 60% 40%', rot: -15, threshold: 30 },
    { left: 62, bottom: 11, w: 52, h: 22, br: '60% 40% 50% 50% / 40% 60% 50% 50%', rot: 3,   threshold: 38 },
    { left: 32, bottom: 16, w: 28, h: 16, br: '50% 50% 45% 55% / 60% 40% 55% 45%', rot: -20, threshold: 46 },
    { left: 50, bottom: 18, w: 36, h: 30, br: '55% 45% 60% 40% / 50% 50% 45% 55%', rot: 10,  threshold: 54 },
    { left: 44, bottom: 7,  w: 16, h: 20, br: '40% 60% 55% 45% / 45% 55% 40% 60%', rot: 25,  threshold: 62 },
    { left: 58, bottom: 20, w: 48, h: 18, br: '60% 40% 45% 55% / 55% 45% 60% 40%', rot: -6,  threshold: 70 },
    { left: 36, bottom: 13, w: 30, h: 26, br: '45% 55% 50% 50% / 60% 40% 50% 50%', rot: 18,  threshold: 78 },
    { left: 52, bottom: 10, w: 60, h: 24, br: '55% 45% 40% 60% / 45% 55% 60% 40%', rot: -4,  threshold: 86 },
    { left: 46, bottom: 22, w: 26, h: 32, br: '40% 60% 60% 40% / 55% 45% 45% 55%', rot: 30,  threshold: 93 },
]

// --- Shake levels ---
const SHAKE_LEVELS = {
    none: { x: 0 },
    low: { x: [0, -1, 1, 0], duration: 0.25 },
    medium: { x: [0, -2, 2, -1, 1, 0], duration: 0.2 },
    scare: { x: [0, -4, 3, -2, 4, -3, 1, 0], duration: 0.15 },
}

// --- Reactive text pools ---

const TEXT_HOLD = [
    "Aferrás los dedos al piso. Empujás.",
    "Un centímetro más. Las uñas rascan las baldosas.",
    "El brazo tiembla pero aguanta.",
    "La sangre mancha el piso delante tuyo. Seguís igual.",
    "Empujás. Empujás. Empujás.",
]

const TEXT_RELEASE = [
    "Reposás un segundo. Solo un segundo.",
    "El brazo te tiembla. Lo dejás descansar.",
    "Respirás con dificultad. Luego seguís.",
    "Un momento. Después de esto, seguís.",
]

const TEXT_STAMINA_LOW = [
    "El brazo ya no responde bien.",
    "Los dedos te fallan.",
    "Todo pesa el doble.",
    "El músculo quema.",
]

const TEXT_FORCED_RELEASE = [
    "El brazo te falla solo. La cara vuelve al piso.",
    "No podés más con este brazo.",
]

const TEXT_TIME_LOW = [
    "La vista se te nubla.",
    "El frío llega hasta el pecho.",
    "El mundo se pone lejos.",
]

const TEXT_PROGRESS = [
    "Cinco metros. El pasillo se estira.",
    "Diez metros. La puerta ya no es una ilusión.",
    "Quince metros. Cada metro es tuyo.",
    "Veinte metros. Ya casi.",
]

// Scare events — fake threat, nothing happens
const TEXT_SCARE = [
    "Un ruido al final del pasillo. Nada. Solo el silencio.",
    "Por un segundo... una silueta. Solo la oscuridad jugándote una mala pasada.",
    "Escuchás pasos. Se detienen. Silencio.",
    "La luz del pasillo parpadea y volvés a ver esa boca... No. No hay nadie.",
    "Un sonido sordo. Lejos. No te detenés.",
    "Por un momento te parece ver algo moverse al fondo. Seguís.",
    "Un crujido en el techo. El edificio. Solo el edificio.",
]

const TEXT_SUCCESS = "Llegaste."
const TEXT_FAILURE = "Tus brazos dejan de responder. Tu cara encuentra el piso frío y ya no te molesta. El techo se vuelve borroso, después gris, después nada."

// --- Audio helpers ---

function createAudioLoop(src) {
    try {
        const audio = new Audio(src)
        audio.loop = true
        audio.volume = 0
        audio.preload = 'auto'
        audio.addEventListener('error', () => { audio._failed = true })
        return audio
    } catch { return null }
}

function createAudioOneShot(src) {
    try {
        const audio = new Audio(src)
        audio.loop = false
        audio.volume = 0
        audio.preload = 'auto'
        audio.addEventListener('error', () => { audio._failed = true })
        return audio
    } catch { return null }
}

function safePlay(audio) {
    if (!audio || audio._failed) return
    if (audio.paused) audio.play().catch(() => {})
}

function safeStop(audio) {
    if (!audio) return
    if (!audio.paused) audio.pause()
    audio.currentTime = 0
}

// --- Web Audio sharp groan player ---
// Loads groan_sharp.mp3 once into an AudioBuffer, then spawns a fresh
// AudioBufferSourceNode each playback — lets us vary pitch (detune, in cents)
// independently from speed (playbackRate), giving genuinely different sounds.

async function loadAudioBuffer(ctx, src) {
    try {
        const res = await fetch(src)
        const arr = await res.arrayBuffer()
        return await ctx.decodeAudioData(arr)
    } catch { return null }
}

function createSharpGroanPlayer() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        let buffer = null
        loadAudioBuffer(ctx, '/sounds/groan_sharp.mp3').then(b => { buffer = b })

        return {
            play(volume = 0.5) {
                if (!buffer) return
                if (ctx.state === 'suspended') ctx.resume()
                const src = ctx.createBufferSource()
                src.buffer = buffer
                // playbackRate: speed (0.7 = 30% slower, 1.1 = 10% faster)
                src.playbackRate.value = 0.88 + Math.random() * 0.20
                // detune: pitch in cents, ±100 cents = ±1 semitone (independent of speed)
                src.detune.value = (Math.random() * 200) - 100
                const gain = ctx.createGain()
                gain.gain.value = volume * (0.8 + Math.random() * 0.4)
                src.connect(gain)
                gain.connect(ctx.destination)
                src.start(0)
            },
            destroy() {
                try { ctx.close() } catch {}
            }
        }
    } catch { return null }
}

// --- Text picker (avoids consecutive repeats) ---
function pickRandom(pool, lastRef) {
    if (pool.length <= 1) return pool[0]
    let pick
    do { pick = pool[Math.floor(Math.random() * pool.length)] } while (pick === lastRef.current && pool.length > 1)
    lastRef.current = pick
    return pick
}

// --- Component ---

export default function CrawlGame({ params = {}, onFinish }) {
    // Game state
    const [gameState, setGameState] = useState('intro') // 'intro' | 'playing' | 'success' | 'failure'
    const [stamina, setStamina] = useState(100)
    const [progress, setProgress] = useState(0)
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
    const [isHolding, setIsHolding] = useState(false)
    const [darkFlash, setDarkFlash] = useState(false)
    const [scareFlash, setScareFlash] = useState(false)

    // Accumulating text log
    const [textLog, setTextLog] = useState([])

    // Refs (for game loop — no re-render lag)
    const gameLoopRef = useRef(null)
    const lastTimeRef = useRef(0)
    const finishedRef = useRef(false)
    const isHoldingRef = useRef(false)
    const forcedReleaseRef = useRef(false)
    const staminaRef = useRef(100)
    const progressRef = useRef(0)
    const timeLeftRef = useRef(TIME_LIMIT)
    const releaseTimeRef = useRef(0)
    const scrollRef = useRef(null)
    const heartbeatRef = useRef(null)
    const groanLongRef = useRef(null)
    const sharpPlayerRef = useRef(null)  // Web Audio: pitch+speed independent
    const groanGaspRef = useRef(null)
    const groanCooldownRef = useRef(0)
    const scareTimerRef = useRef(null)

    // Text dedup refs
    const lastHoldTextRef = useRef('')
    const lastReleaseTextRef = useRef('')
    const lastStaminaTextRef = useRef('')
    const lastTimeTextRef = useRef('')
    const lastScareTextRef = useRef('')

    // Throttle refs
    const lastStaminaLineTimeRef = useRef(0)
    const lastTimeLineTimeRef = useRef(0)

    // Progress milestone tracking
    const lastProgressMilestoneRef = useRef(-1)

    // --- Append text ---
    const appendText = useCallback((text, style = 'normal') => {
        setTextLog(prev => [...prev, { text, style, id: Date.now() + Math.random() }])
    }, [])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [textLog])

    // --- Finish ---
    const finish = useCallback((success) => {
        if (finishedRef.current) return
        finishedRef.current = true
        setGameState(success ? 'success' : 'failure')
        cancelAnimationFrame(gameLoopRef.current)
        if (scareTimerRef.current) clearTimeout(scareTimerRef.current)
        safeStop(heartbeatRef.current)
        safeStop(groanLongRef.current)
        safeStop(groanGaspRef.current)
        if (sharpPlayerRef.current) sharpPlayerRef.current.destroy()

        if (success) {
            appendText(TEXT_SUCCESS)
            setTimeout(() => onFinish(1), 1500)
        } else {
            appendText(TEXT_FAILURE, 'danger')
            setTimeout(() => onFinish(0), 3000)
        }
    }, [onFinish, appendText])

    // --- Audio init ---
    useEffect(() => {
        heartbeatRef.current = createAudioLoop('/sounds/heartbeat_loop.mp3')
        groanLongRef.current = createAudioOneShot('/sounds/groan_long.mp3')
        groanGaspRef.current = createAudioOneShot('/sounds/groan_gasp.mp3')
        sharpPlayerRef.current = createSharpGroanPlayer()
        return () => {
            safeStop(heartbeatRef.current)
            safeStop(groanLongRef.current)
            safeStop(groanGaspRef.current)
            if (sharpPlayerRef.current) sharpPlayerRef.current.destroy()
        }
    }, [])

    // --- Play a one-shot groan ---
    const playOneShot = useCallback((ref, rateMin, rateMax) => {
        const audio = ref.current
        if (!audio || audio._failed) return
        safeStop(audio)
        audio.playbackRate = rateMin + Math.random() * (rateMax - rateMin)
        audio.volume = 0.45 + Math.random() * 0.2
        audio.play().catch(() => {})
    }, [])

    // --- Trigger groan on hold start (context-aware) ---
    const triggerGroan = useCallback((currentStamina) => {
        const now = performance.now()
        if (now - groanCooldownRef.current < 3000) return
        groanCooldownRef.current = now
        if (currentStamina > 15) {
            playOneShot(groanLongRef, 0.78, 1.05)
        } else {
            sharpPlayerRef.current?.play(0.5)  // pitch + speed independientes via Web Audio
        }
    }, [playOneShot])

    // --- Intro text ---
    useEffect(() => {
        appendText("Solo las baldosas frías debajo tuyo.")
        const t = setTimeout(() => appendText("Y la puerta al final del pasillo."), 1500)
        return () => clearTimeout(t)
    }, [appendText])

    // --- Scare events ---
    const scheduleScare = useCallback(() => {
        if (finishedRef.current) return
        const delay = SCARE_INTERVAL_MIN + Math.random() * (SCARE_INTERVAL_MAX - SCARE_INTERVAL_MIN)
        scareTimerRef.current = setTimeout(() => {
            if (finishedRef.current) return
            // Flash + gasp + scare text
            setScareFlash(true)
            setTimeout(() => setScareFlash(false), 120)
            playOneShot(groanGaspRef, 0.85, 1.05)
            appendText(pickRandom(TEXT_SCARE, lastScareTextRef), 'danger')
            scheduleScare() // schedule next
        }, delay)
    }, [appendText])

    // --- Game loop ---
    useEffect(() => {
        if (gameState !== 'playing') return

        safePlay(heartbeatRef.current)
        lastTimeRef.current = performance.now()
        scheduleScare()

        const loop = (currentTime) => {
            const deltaTime = (currentTime - lastTimeRef.current) / 1000
            lastTimeRef.current = currentTime

            const holding = isHoldingRef.current
            const forced = forcedReleaseRef.current
            const now = currentTime

            // --- Time (bleed out) ---
            const newTime = Math.max(0, timeLeftRef.current - deltaTime)
            timeLeftRef.current = newTime
            setTimeLeft(newTime)

            if (newTime <= 0) {
                finish(false)
                return
            }

            // --- Stamina ---
            let newStamina = staminaRef.current
            if (holding && !forced) {
                newStamina -= STAMINA_DRAIN * deltaTime
                if (newStamina <= 0) {
                    newStamina = 0
                    // Forced release
                    isHoldingRef.current = false
                    forcedReleaseRef.current = true
                    releaseTimeRef.current = now
                    setIsHolding(false)
                    setDarkFlash(true)
                    setTimeout(() => setDarkFlash(false), 300)
                    sharpPlayerRef.current?.play(0.55)
                    appendText(pickRandom(TEXT_FORCED_RELEASE, lastReleaseTextRef), 'danger')
                    setTimeout(() => {
                        forcedReleaseRef.current = false
                    }, FORCED_RELEASE_BLOCK_MS)
                }
            } else {
                const timeSinceRelease = now - releaseTimeRef.current
                if (timeSinceRelease > RECOVER_DELAY_MS) {
                    newStamina += STAMINA_RECOVER * deltaTime
                }
            }
            newStamina = Math.max(0, Math.min(100, newStamina))
            staminaRef.current = newStamina
            setStamina(newStamina)

            // --- Progress ---
            if (holding && !forced && newStamina > 0) {
                const newProgress = Math.min(100, progressRef.current + PROGRESS_RATE * deltaTime)
                progressRef.current = newProgress
                setProgress(newProgress)

                // Check milestones (20%, 40%, 60%, 80%)
                const milestoneIdx = Math.floor(newProgress / 20) - 1
                if (milestoneIdx >= 0 && milestoneIdx <= 3 && milestoneIdx > lastProgressMilestoneRef.current) {
                    lastProgressMilestoneRef.current = milestoneIdx
                    appendText(TEXT_PROGRESS[milestoneIdx])
                }

                if (newProgress >= 100) {
                    finish(true)
                    return
                }
            }

            // --- Reactive text ---

            // Stamina low text (throttle 2.5s)
            if (newStamina < 30 && holding) {
                if (now - lastStaminaLineTimeRef.current > 2500) {
                    lastStaminaLineTimeRef.current = now
                    appendText(pickRandom(TEXT_STAMINA_LOW, lastStaminaTextRef), 'warning')
                }
            }

            // Time low text (throttle 3s)
            if (newTime < 10) {
                if (now - lastTimeLineTimeRef.current > 3000) {
                    lastTimeLineTimeRef.current = now
                    appendText(pickRandom(TEXT_TIME_LOW, lastTimeTextRef), 'warning')
                }
            }

            // --- Audio ---
            const heartbeat = heartbeatRef.current
            if (heartbeat && !heartbeat._failed) {
                const staminaFactor = newStamina / 100
                heartbeat.playbackRate = 0.5 + staminaFactor * 0.7
                heartbeat.volume = Math.min(0.7, 0.2 + (1 - staminaFactor) * 0.5)
            }


            gameLoopRef.current = requestAnimationFrame(loop)
        }

        gameLoopRef.current = requestAnimationFrame(loop)
        return () => {
            cancelAnimationFrame(gameLoopRef.current)
            if (scareTimerRef.current) clearTimeout(scareTimerRef.current)
        }
    }, [gameState, finish, appendText, scheduleScare, playOneShot])

    // --- Input: hold/release ---
    useEffect(() => {
        if (gameState === 'intro') {
            const handleStart = (e) => {
                if (e.code === 'KeyV') {
                    e.preventDefault()
                    setGameState('playing')
                    isHoldingRef.current = true
                    setIsHolding(true)
                    releaseTimeRef.current = 0
                    appendText(pickRandom(TEXT_HOLD, lastHoldTextRef))
                    triggerGroan(staminaRef.current)
                }
            }
            window.addEventListener('keydown', handleStart)
            return () => window.removeEventListener('keydown', handleStart)
        }

        if (gameState !== 'playing') return

        const handleKeyDown = (e) => {
            if (e.code === 'KeyV') {
                e.preventDefault()
                if (e.repeat || forcedReleaseRef.current || isHoldingRef.current) return
                isHoldingRef.current = true
                setIsHolding(true)
                appendText(pickRandom(TEXT_HOLD, lastHoldTextRef))
                triggerGroan()
            }
        }

        const handleKeyUp = (e) => {
            if (e.code === 'KeyV') {
                e.preventDefault()
                if (!isHoldingRef.current) return
                isHoldingRef.current = false
                forcedReleaseRef.current = false
                releaseTimeRef.current = performance.now()
                setIsHolding(false)
                appendText(pickRandom(TEXT_RELEASE, lastReleaseTextRef))
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [gameState, appendText, triggerGroan])

    // --- Touch support ---
    useEffect(() => {
        if (gameState === 'intro') {
            const handleStart = (e) => {
                e.preventDefault()
                setGameState('playing')
                isHoldingRef.current = true
                setIsHolding(true)
                releaseTimeRef.current = 0
                appendText(pickRandom(TEXT_HOLD, lastHoldTextRef))
                triggerGroan()
            }
            window.addEventListener('touchstart', handleStart, { passive: false })
            return () => window.removeEventListener('touchstart', handleStart)
        }

        if (gameState !== 'playing') return

        const handleTouchStart = (e) => {
            e.preventDefault()
            if (forcedReleaseRef.current || isHoldingRef.current) return
            isHoldingRef.current = true
            setIsHolding(true)
            appendText(pickRandom(TEXT_HOLD, lastHoldTextRef))
            triggerGroan()
        }

        const handleTouchEnd = (e) => {
            e.preventDefault()
            if (!isHoldingRef.current) return
            isHoldingRef.current = false
            forcedReleaseRef.current = false
            releaseTimeRef.current = performance.now()
            setIsHolding(false)
            appendText(pickRandom(TEXT_RELEASE, lastReleaseTextRef))
        }

        window.addEventListener('touchstart', handleTouchStart, { passive: false })
        window.addEventListener('touchend', handleTouchEnd, { passive: false })
        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [gameState, appendText, triggerGroan])

    // --- Derived visual state ---
    const staminaDanger = (1 - stamina / 100) * 0.5
    const timeDanger = (1 - timeLeft / TIME_LIMIT) * 0.4
    const vignetteOpacity = Math.min(0.85, staminaDanger + timeDanger)

    // Blood stains — which ones are visible based on progress
    const visibleStains = BLOOD_STAINS.filter(s => progress >= s.threshold)

    const getTextDegradation = () => {
        if (stamina < 15 || timeLeft < 6) return { opacity: 0.4, filter: 'blur(2px)' }
        if (stamina < 30 || timeLeft < 12) return { opacity: 0.6, filter: 'blur(1px)' }
        if (stamina < 50 || timeLeft < 20) return { opacity: 0.8, filter: 'blur(0.5px)' }
        return { opacity: 1, filter: 'none' }
    }

    const getShakeLevel = () => {
        if (scareFlash) return 'scare'
        if (!isHolding) return 'none'
        if (stamina < 30) return 'medium'
        return 'low'
    }

    const shakeLevel = getShakeLevel()
    const shakeConfig = SHAKE_LEVELS[shakeLevel]

    const textStyleForLine = (style) => {
        switch (style) {
            case 'danger': return 'text-red-400/90'
            case 'warning': return 'text-amber-400/80'
            default: return 'text-bardo-text'
        }
    }

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden select-none">

            {/* VFX Layer 1: Red/dark vignette — bleeding out + exhaustion */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 20%, rgba(60, 0, 0, 0.95) 100%)'
                }}
                animate={{ opacity: vignetteOpacity }}
                transition={{ duration: 0.5 }}
            />

            {/* VFX Layer 2: Blood stains — irregular blobs revealed as progress grows */}
            <div className="absolute inset-0 pointer-events-none z-20">
                <AnimatePresence>
                    {visibleStains.map((stain, i) => (
                        <motion.div
                            key={stain.threshold}
                            className="absolute"
                            style={{
                                left: `${stain.left}%`,
                                bottom: `${stain.bottom}%`,
                                width: `${stain.w}px`,
                                height: `${stain.h}px`,
                                borderRadius: stain.br,
                                backgroundColor: `rgba(90, 0, 0, 0.55)`,
                                transform: `rotate(${stain.rot}deg) translate(-50%, 50%)`,
                                boxShadow: `0 0 8px 2px rgba(60, 0, 0, 0.3)`,
                            }}
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* VFX Layer 3: Dark flash on forced release */}
            <AnimatePresence>
                {darkFlash && (
                    <motion.div
                        className="absolute inset-0 bg-black pointer-events-none z-40"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </AnimatePresence>

            {/* VFX Layer 4: Scare flash — brief red/white flicker */}
            <AnimatePresence>
                {scareFlash && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-40"
                        style={{ backgroundColor: 'rgba(180, 0, 0, 0.25)' }}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                    />
                )}
            </AnimatePresence>

            {/* Content: matches Apnea/Player layout */}
            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
            >
                <motion.div
                    className="mx-auto w-full px-4 sm:px-6 md:px-12 pt-[10vh] sm:pt-[15vh] pb-[20vh]"
                    style={{ maxWidth: 'var(--player-max-width, 48rem)' }}
                    animate={
                        shakeLevel !== 'none'
                            ? { x: shakeConfig.x }
                            : { x: 0 }
                    }
                    transition={
                        shakeLevel !== 'none'
                            ? { repeat: Infinity, duration: shakeConfig.duration, ease: 'linear' }
                            : { duration: 0.1 }
                    }
                >
                    {/* Intro instruction */}
                    <AnimatePresence>
                        {gameState === 'intro' && (
                            <motion.div
                                className="mb-8"
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-bardo-accent/70 animate-pulse mt-6 font-mono text-sm">
                                    [ Mantené V para arrastrarte ]
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Accumulating text log */}
                    <motion.div
                        className="space-y-3"
                        animate={getTextDegradation()}
                        transition={{ duration: 0.5 }}
                    >
                        {textLog.map((entry) => (
                            <motion.p
                                key={entry.id}
                                className={`font-narrative text-xl md:text-2xl leading-relaxed ${textStyleForLine(entry.style)}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {entry.text}
                            </motion.p>
                        ))}
                    </motion.div>
                </motion.div>
            </main>

            {/* Bottom HUD — minimal, like Apnea */}
            {(gameState === 'playing' || gameState === 'intro') && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
                    {/* Key indicator */}
                    <motion.div
                        className="w-10 h-10 border flex items-center justify-center text-base font-black"
                        animate={{
                            borderColor: isHolding ? 'rgba(220,38,38,0.8)' : 'rgba(63,63,70,0.6)',
                            color: isHolding ? '#ef4444' : '#71717a',
                            scale: isHolding ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        V
                    </motion.div>

                    {/* Bleed timer — subtle line, no number */}
                    <div className="w-24 h-0.5 bg-zinc-900/50 overflow-hidden rounded-full">
                        <motion.div
                            className="h-full"
                            animate={{
                                width: `${(timeLeft / TIME_LIMIT) * 100}%`,
                                backgroundColor: timeLeft < 10 ? '#ef4444' : '#7f1d1d'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
