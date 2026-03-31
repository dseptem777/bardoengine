import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Balance constants ---

const O2_DRAIN_TABLE = [7, 9, 10, 12] // %/s per wave
const O2_RECOVER = 12         // %/s while not holding
const RECOVERY_DELAY_MS = 300 // ms before O2 starts recovering

const AWARENESS_INCREASE = 20 // %/s when not holding during shadow
const AWARENESS_DECREASE = 30 // %/s when holding
const AWARENESS_SPIKE = 10    // instant % on hold→release
const AWARENESS_DECAY_DELAY_MS = 600

const WIN_DELAY_MS = 1500

// Shake quantization
const SHAKE_LEVELS = {
    none: { x: 0 },
    low: { x: [0, -1, 1, 0], duration: 0.2 },
    medium: { x: [0, -2, 2, -1, 1, 0], duration: 0.15 },
    high: { x: [0, -4, 4, -3, 3, -2, 2, 0], duration: 0.1 },
}

// --- Reactive text pools ---

const TEXT_HOLD_START = [
    "Aguantás la respiración.",
    "Cerrás los ojos y apretás los dientes.",
    "Contenés el aire. Ni un ruido.",
    "Te mordés el labio. Silencio.",
    "Tragás saliva y dejás de respirar.",
]

const TEXT_HOLD_LOW_O2 = [
    "El pecho te arde.",
    "Sentís que te vas a desmayar.",
    "Los oídos te zumban.",
    "La visión se nubla.",
    "No vas a poder mucho más.",
    "Las sienes te laten con fuerza.",
]

const TEXT_RELEASE = [
    "Soltás un suspiro tembloroso.",
    "El aire sale de golpe.",
    "Respirás. El sonido te delata.",
    "Jadeás, sin poder evitarlo.",
    "Inspirás con un quejido ahogado.",
]

const TEXT_SHADOW_APPROACH = [
    "Algo se mueve afuera.",
    "Pasos pesados. Cada vez más cerca.",
    "Una sombra se desliza por debajo de la puerta.",
    "El aire se pone pesado.",
    "Lo sentís. Está ahí.",
]

const TEXT_SHADOW_CLOSE = [
    "Está justo afuera.",
    "¿Te escuchó?",
    "Un gruñido sordo. Muy cerca.",
    "Algo raspa la pared.",
    "Se detuvo.",
]

const TEXT_SHADOW_PASS = [
    "Los pasos se alejan...",
    "Silencio. Se fue. Por ahora.",
    "El aire vuelve a circular.",
    "¿Se fue?",
]

const TEXT_WAVE_START = [
    "Vuelve. Más lento esta vez.",
    "Otra vez. Está buscando.",
    "No se rinde. Vuelve.",
]

const TEXT_WIN = [
    "Silencio total. Se fue.",
    "Te salvaste.",
]

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

function safePlay(audio) {
    if (!audio || audio._failed) return
    if (audio.paused) audio.play().catch(() => {})
}

function safePause(audio) {
    if (!audio || audio._failed) return
    if (!audio.paused) audio.pause()
}

function safeStop(audio) {
    if (!audio) return
    safePause(audio)
    audio.currentTime = 0
}

function createRumbleSynth() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const gainNode = ctx.createGain()
        gainNode.gain.value = 0
        gainNode.connect(ctx.destination)

        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = 45
        const oscGain = ctx.createGain()
        oscGain.gain.value = 0.6
        osc.connect(oscGain)
        oscGain.connect(gainNode)

        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.value = 48
        const osc2Gain = ctx.createGain()
        osc2Gain.gain.value = 0.3
        osc2.connect(osc2Gain)
        osc2Gain.connect(gainNode)

        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = noiseBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
        const noise = ctx.createBufferSource()
        noise.buffer = noiseBuffer
        noise.loop = true
        const noiseFilter = ctx.createBiquadFilter()
        noiseFilter.type = 'lowpass'
        noiseFilter.frequency.value = 120
        noiseFilter.Q.value = 1
        const noiseGain = ctx.createGain()
        noiseGain.gain.value = 0.15
        noise.connect(noiseFilter)
        noiseFilter.connect(noiseGain)
        noiseGain.connect(gainNode)

        let started = false
        return {
            start() {
                if (started) return
                started = true
                if (ctx.state === 'suspended') ctx.resume()
                osc.start()
                osc2.start()
                noise.start()
            },
            setVolume(v) {
                gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.05)
            },
            stop() {
                gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
                setTimeout(() => { try { ctx.close() } catch {} }, 200)
            },
        }
    } catch { return null }
}

// --- Wave timeline generation ---

function getShadowDuration(waveIndex) {
    if (waveIndex === 0) return 3
    if (waveIndex === 1) return 5
    return 5 + (waveIndex - 1) * 3
}

function generateTimeline(waveCount) {
    const entries = []
    let t = 0

    // Intro
    entries.push({ time: t, type: 'intro' })
    t += 3

    for (let i = 0; i < waveCount; i++) {
        const dur = getShadowDuration(i)
        entries.push({ time: t, type: 'shadow_start', wave: i + 1 })
        t += dur
        entries.push({ time: t, type: 'shadow_end', wave: i + 1 })

        if (i < waveCount - 1) {
            t += 5 // recovery between waves
            entries.push({ time: t, type: 'wave_gap' })
        }
    }

    entries.push({ time: t + 1, type: 'win' })
    return entries
}

// --- Text picker (avoids immediate repeats) ---
function pickRandom(pool, lastRef) {
    if (pool.length <= 1) return pool[0]
    let pick
    do { pick = pool[Math.floor(Math.random() * pool.length)] } while (pick === lastRef.current && pool.length > 1)
    lastRef.current = pick
    return pick
}

// --- Component ---

export default function ApneaGame({ params = {}, onFinish }) {
    const waves = params.waves || 3

    // Game state
    const [gameState, setGameState] = useState('intro')
    const [oxygen, setOxygen] = useState(100)
    const [awareness, setAwareness] = useState(0)
    const [isHolding, setIsHolding] = useState(false)
    const [shadowActive, setShadowActive] = useState(false)
    const [currentWave, setCurrentWave] = useState(0)
    const [noiseFlash, setNoiseFlash] = useState(false)

    // Accumulating text log — the virtual knot
    const [textLog, setTextLog] = useState([])

    // Refs
    const gameLoopRef = useRef(null)
    const lastTimeRef = useRef(0)
    const finishedRef = useRef(false)
    const isHoldingRef = useRef(false)
    const shadowActiveRef = useRef(false)
    const oxygenRef = useRef(100)
    const awarenessRef = useRef(0)
    const currentWaveRef = useRef(0)
    const releaseTimeRef = useRef(0)
    const lastSpikeTimeRef = useRef(0)
    const winTimerRef = useRef(null)
    const scrollRef = useRef(null)
    const timeElapsedRef = useRef(0)
    const lastTimelineIdxRef = useRef(-1)

    // Text dedup refs (avoid consecutive identical lines)
    const lastHoldTextRef = useRef('')
    const lastReleaseTextRef = useRef('')
    const lastLowO2TextRef = useRef('')
    const lastShadowTextRef = useRef('')

    // Throttle refs for reactive text
    const lastHoldLineTimeRef = useRef(0)
    const lastLowO2LineTimeRef = useRef(0)
    const lastAwarenessLineTimeRef = useRef(0)
    const holdStartedAtRef = useRef(0)

    // Audio refs
    const breathingRef = useRef(null)
    const heartbeatRef = useRef(null)
    const rumbleSynthRef = useRef(null)

    const timeline = useMemo(() => generateTimeline(waves), [waves])

    // --- Append text ---
    const appendText = useCallback((text, style = 'normal') => {
        setTextLog(prev => [...prev, { text, style, id: Date.now() + Math.random() }])
    }, [])

    // Auto-scroll to bottom when text accumulates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [textLog])

    // --- Finish ---
    const finish = useCallback((success) => {
        if (finishedRef.current) return
        finishedRef.current = true
        setGameState(success ? 'win' : 'lose')
        cancelAnimationFrame(gameLoopRef.current)
        if (winTimerRef.current) clearTimeout(winTimerRef.current)

        safeStop(breathingRef.current)
        safeStop(heartbeatRef.current)
        if (rumbleSynthRef.current) rumbleSynthRef.current.stop()

        if (success) {
            winTimerRef.current = setTimeout(() => onFinish(1), WIN_DELAY_MS)
        } else {
            onFinish(0)
        }
    }, [onFinish])

    // --- Audio init ---
    useEffect(() => {
        breathingRef.current = createAudioLoop('/sounds/breathing_loop.mp3')
        heartbeatRef.current = createAudioLoop('/sounds/heartbeat_loop.mp3')
        rumbleSynthRef.current = createRumbleSynth()
        return () => {
            safeStop(breathingRef.current)
            safeStop(heartbeatRef.current)
            if (rumbleSynthRef.current) rumbleSynthRef.current.stop()
        }
    }, [])

    // --- Noise spike ---
    const applyNoiseSpike = useCallback(() => {
        releaseTimeRef.current = performance.now()
        lastSpikeTimeRef.current = performance.now()

        setAwareness(prev => {
            const newVal = Math.min(100, prev + AWARENESS_SPIKE)
            awarenessRef.current = newVal
            if (newVal >= 100) finish(false)
            return newVal
        })

        setNoiseFlash(true)
        setTimeout(() => setNoiseFlash(false), 200)
    }, [finish])

    // --- Game loop ---
    useEffect(() => {
        if (gameState !== 'playing') return

        lastTimeRef.current = performance.now()
        safePlay(heartbeatRef.current)

        const loop = (currentTime) => {
            const deltaTime = (currentTime - lastTimeRef.current) / 1000
            lastTimeRef.current = currentTime
            timeElapsedRef.current += deltaTime

            const holding = isHoldingRef.current
            const shadow = shadowActiveRef.current
            const elapsed = timeElapsedRef.current

            // --- Timeline events ---
            for (let i = lastTimelineIdxRef.current + 1; i < timeline.length; i++) {
                const ev = timeline[i]
                if (ev.time > elapsed) break
                lastTimelineIdxRef.current = i

                switch (ev.type) {
                    case 'intro':
                        appendText("Oscuridad. Silencio.")
                        setTimeout(() => appendText("Afuera, pasos pesados..."), 1500)
                        break
                    case 'shadow_start':
                        setShadowActive(true)
                        shadowActiveRef.current = true
                        setCurrentWave(ev.wave)
                        currentWaveRef.current = ev.wave
                        if (ev.wave === 1) {
                            appendText(pickRandom(TEXT_SHADOW_APPROACH, lastShadowTextRef), 'danger')
                        } else {
                            appendText(pickRandom(TEXT_WAVE_START, lastShadowTextRef), 'danger')
                        }
                        break
                    case 'shadow_end':
                        setShadowActive(false)
                        shadowActiveRef.current = false
                        appendText(pickRandom(TEXT_SHADOW_PASS, lastShadowTextRef))
                        break
                    case 'win':
                        TEXT_WIN.forEach((line, i) => {
                            setTimeout(() => appendText(line), i * 800)
                        })
                        finish(true)
                        return
                }
            }

            // --- Reactive text based on player input ---
            const now = currentTime

            // When holding + in shadow + awareness climbing: creature awareness text
            if (shadow && !holding && awarenessRef.current > 40) {
                if (now - lastAwarenessLineTimeRef.current > 3000) {
                    lastAwarenessLineTimeRef.current = now
                    appendText(pickRandom(TEXT_SHADOW_CLOSE, lastShadowTextRef), 'danger')
                }
            }

            // Low O2 text (while holding)
            if (holding && oxygenRef.current < 35) {
                if (now - lastLowO2LineTimeRef.current > 2500) {
                    lastLowO2LineTimeRef.current = now
                    appendText(pickRandom(TEXT_HOLD_LOW_O2, lastLowO2TextRef), 'warning')
                }
            }

            // --- O2 ---
            const wave = currentWaveRef.current || 1
            const drainRate = O2_DRAIN_TABLE[Math.min(wave - 1, O2_DRAIN_TABLE.length - 1)]

            setOxygen(prev => {
                let newO2 = prev
                if (holding) {
                    newO2 -= drainRate * deltaTime
                } else {
                    const timeSinceRelease = currentTime - releaseTimeRef.current
                    if (timeSinceRelease > RECOVERY_DELAY_MS) {
                        newO2 += O2_RECOVER * deltaTime
                    }
                }
                newO2 = Math.max(0, Math.min(100, newO2))
                oxygenRef.current = newO2
                if (newO2 <= 0) finish(false)
                return newO2
            })

            // --- Awareness ---
            setAwareness(prev => {
                let newAw = prev
                if (holding) {
                    const timeSinceSpike = currentTime - lastSpikeTimeRef.current
                    if (timeSinceSpike > AWARENESS_DECAY_DELAY_MS) {
                        newAw -= AWARENESS_DECREASE * deltaTime
                    }
                } else if (shadow) {
                    newAw += AWARENESS_INCREASE * deltaTime
                }
                newAw = Math.max(0, Math.min(100, newAw))
                awarenessRef.current = newAw
                if (newAw >= 100) finish(false)
                return newAw
            })

            // --- Audio ---
            const o2 = oxygenRef.current
            const aw = awarenessRef.current
            const breathing = breathingRef.current
            const heartbeat = heartbeatRef.current
            const rumble = rumbleSynthRef.current

            if (breathing && !breathing._failed) {
                if (!holding) {
                    safePlay(breathing)
                    breathing.volume = Math.min(0.9, 0.2 + (1 - o2 / 100) * 0.7)
                } else {
                    safePause(breathing)
                }
            }

            if (heartbeat && !heartbeat._failed) {
                const o2Clamped = Math.max(20, o2)
                heartbeat.playbackRate = 0.6 + (1 - (o2Clamped - 20) / 80) * 0.9
                heartbeat.volume = Math.min(0.7, 0.15 + (1 - o2 / 100) * 0.55)
            }

            if (rumble) {
                rumble.start()
                rumble.setVolume(shadow ? 0.1 + (aw / 100) * 0.5 : 0)
            }

            gameLoopRef.current = requestAnimationFrame(loop)
        }

        gameLoopRef.current = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(gameLoopRef.current)
    }, [gameState, finish, timeline, appendText])

    // --- Input: hold/release ---
    useEffect(() => {
        if (gameState === 'intro') {
            const handleStart = (e) => {
                if (e.code === 'Space') {
                    e.preventDefault()
                    setGameState('playing')
                    // First hold text
                    setIsHolding(true)
                    isHoldingRef.current = true
                    holdStartedAtRef.current = performance.now()
                    lastHoldLineTimeRef.current = performance.now()
                    appendText(pickRandom(TEXT_HOLD_START, lastHoldTextRef))
                }
            }
            window.addEventListener('keydown', handleStart)
            return () => window.removeEventListener('keydown', handleStart)
        }

        if (gameState !== 'playing') return

        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault()
                if (e.repeat) return
                setIsHolding(true)
                isHoldingRef.current = true
                holdStartedAtRef.current = performance.now()
                lastHoldLineTimeRef.current = performance.now()
                appendText(pickRandom(TEXT_HOLD_START, lastHoldTextRef))
            }
        }

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                e.preventDefault()
                if (!isHoldingRef.current) return
                applyNoiseSpike()
                setIsHolding(false)
                isHoldingRef.current = false
                appendText(pickRandom(TEXT_RELEASE, lastReleaseTextRef), shadowActiveRef.current ? 'danger' : 'normal')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [gameState, applyNoiseSpike, appendText])

    // --- Touch support ---
    useEffect(() => {
        if (gameState === 'intro') {
            const handleStart = (e) => {
                e.preventDefault()
                setGameState('playing')
                setIsHolding(true)
                isHoldingRef.current = true
                holdStartedAtRef.current = performance.now()
                lastHoldLineTimeRef.current = performance.now()
                appendText(pickRandom(TEXT_HOLD_START, lastHoldTextRef))
            }
            window.addEventListener('touchstart', handleStart, { passive: false })
            return () => window.removeEventListener('touchstart', handleStart)
        }

        if (gameState !== 'playing') return

        const handleTouchStart = (e) => {
            e.preventDefault()
            setIsHolding(true)
            isHoldingRef.current = true
            holdStartedAtRef.current = performance.now()
            lastHoldLineTimeRef.current = performance.now()
            appendText(pickRandom(TEXT_HOLD_START, lastHoldTextRef))
        }
        const handleTouchEnd = (e) => {
            e.preventDefault()
            if (!isHoldingRef.current) return
            applyNoiseSpike()
            setIsHolding(false)
            isHoldingRef.current = false
            appendText(pickRandom(TEXT_RELEASE, lastReleaseTextRef), shadowActiveRef.current ? 'danger' : 'normal')
        }

        window.addEventListener('touchstart', handleTouchStart, { passive: false })
        window.addEventListener('touchend', handleTouchEnd, { passive: false })
        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [gameState, applyNoiseSpike, appendText])

    // --- Derived visual state ---
    const blueTintOpacity = (1 - oxygen / 100) * 0.8
    const vignetteOpacity = awareness / 100

    const getTextDegradation = () => {
        if (oxygen < 20) return { opacity: 0.4, filter: 'blur(2px)' }
        if (oxygen < 40) return { opacity: 0.6, filter: 'blur(1px)' }
        if (oxygen < 60) return { opacity: 0.8, filter: 'blur(0.5px)' }
        return { opacity: 1, filter: 'none' }
    }

    const getShakeLevel = () => {
        if (noiseFlash) return 'high'
        if (!shadowActive) return 'none'
        if (awareness > 75) return 'high'
        if (awareness > 50) return 'medium'
        if (awareness > 25) return 'low'
        return 'none'
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

            {/* VFX Layer 1: Blue O2 tint */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-30"
                style={{ backgroundColor: 'rgb(30, 58, 138)' }}
                animate={{ opacity: blueTintOpacity }}
                transition={{ duration: 0.3 }}
            />

            {/* VFX Layer 2: Creature vignette */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.95) 100%)'
                }}
                animate={{ opacity: vignetteOpacity }}
                transition={{ duration: 0.4 }}
            />

            {/* VFX Layer 3: Dark flash */}
            <AnimatePresence>
                {noiseFlash && (
                    <motion.div
                        className="absolute inset-0 bg-black pointer-events-none z-40"
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>

            {/* Content: matches Player.jsx layout exactly */}
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
                                <p className="font-narrative text-xl md:text-2xl leading-relaxed text-bardo-text mb-4">
                                    Mantenné presionado <span className="text-bardo-accent font-bold">[ESPACIO]</span> para aguantar la respiración.
                                </p>
                                <p className="font-narrative text-lg md:text-xl leading-relaxed text-bardo-text/50">
                                    Si no aguantás cuando la sombra pasa, te encuentra.
                                </p>
                                <p className="text-bardo-accent/70 animate-pulse mt-6 font-mono text-sm">
                                    [ ESPACIO para empezar ]
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Accumulating text — the virtual knot */}
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
        </div>
    )
}
