import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * RcpGame — Rhythm CPR Minigame
 *
 * The player performs CPR compressions on Juan at ~100-110 bpm.
 * Tapping Space / clicking / touchstart on each beat raises Juan's life.
 * Missing beats or tapping out of rhythm has no gain / slight loss.
 * Periodic "insuflación" (breath) phases pause compressions briefly.
 *
 * Stat bonuses (threshold = 20, all checked in component):
 *   fuerza  ≥ 20 → each correct beat heals Juan ~30% more
 *   conocimiento ≥ 20 → wider timing window (accessibility)
 *   magia   ≥ 20 → "segundo aliento": Juan's life refills once when it hits 0
 *   hp (no gate) → initial fatigue color indicator only
 *
 * Audio: pure Web Audio API synth (no .mp3 assets).
 * Contract: function RcpGame({ params = {}, onFinish })
 *   onFinish(1) = Juan saved, onFinish(0) = Juan lost
 */

// --- Balance constants ---

const BPM = 104                      // ~100-110 bpm
const BEAT_INTERVAL_MS = (60 / BPM) * 1000   // ~577ms per beat
const BASE_WINDOW_MS = 180           // half-window around beat for a "hit"
const CONOCIMIENTO_WINDOW_BONUS = 80 // extra ms each side if conocimiento >= 20
const TIME_LIMIT_S = 55              // seconds total
const JUAN_TARGET = 100              // juan life needed to win
const JUAN_DECAY = 0.8               // juan life lost per second passively
const BASE_HEAL_PER_HIT = 7          // juan life gained per correct compression
const FUERZA_HEAL_BONUS = 0.30       // 30% more if fuerza >= 20
const SPAM_PENALTY = 3               // juan life lost for off-beat spam
const FATIGUE_DRAIN = 8              // fatigue gained per compression
const FATIGUE_RECOVER = 12           // fatigue recovered per second when resting
const FATIGUE_REST_THRESHOLD = 90    // forced rest when fatigue hits this
const FATIGUE_RESUME_THRESHOLD = 30  // can compress again after fatigue drops here
const INSUF_EVERY_N_BEATS = 15       // insuflación every N compression beats
const INSUF_DURATION_MS = 2200       // pause duration for insuflación phase

// Autofail mode (winnable = false): Juan's life is hard-capped here and decays
// faster, making it impossible to win no matter how well you play.
const AUTOFAIL_CAP = 62              // Juan can't rise above this — always below JUAN_TARGET
const AUTOFAIL_EXTRA_DECAY = 1.8     // extra decay/s on top of JUAN_DECAY in autofail mode
const TEXT_AUTOFAIL_CLOSE = "Si hubieras llegado antes, tal vez habrías tenido el tiempo que te faltó…"

// --- Shake levels ---
const SHAKE_LEVELS = {
    none: { x: 0 },
    low: { x: [0, -1, 1, 0], duration: 0.25 },
    medium: { x: [0, -2, 2, -1, 1, 0], duration: 0.18 },
}

// --- Reactive text pools ---

const TEXT_INTRO = [
    "Solo existen vos y este niño.",
    "Tus manos sobre su pecho.",
    "Al ritmo.",
]

const TEXT_HIT = [
    "Bien. Seguí.",
    "Ahí va.",
    "Con ritmo.",
    "Eso es.",
    "No pares.",
    "Al pulso.",
]

const TEXT_HIT_FUERZA = [
    "Fondo completo. Le llega.",
    "Con toda la fuerza. Sentís la respuesta.",
    "Profundo. Como debe ser.",
]

const TEXT_MISS = [
    "Fuera de ritmo.",
    "Perdiste el compás.",
    "Desincronizaste.",
]

const TEXT_SPAM = [
    "Muy rápido. Te vas a cansar.",
    "Espaciá los golpes.",
    "Perdé el apuro, encontrá el ritmo.",
]

const TEXT_JUAN_LOW = [
    "El corazón de Juan no responde.",
    "Se te escapa entre los dedos.",
    "Más. Más fuerte.",
    "No te rindas todavía.",
]

const TEXT_JUAN_RISING = [
    "Algo se mueve en su pecho.",
    "Hay algo ahí.",
    "Sentís resistencia. Eso es bueno.",
]

const TEXT_FATIGUE = [
    "Los brazos te pesan.",
    "Necesitás un segundo.",
    "Descansá. Rápido.",
]

const TEXT_INSUF = [
    "Dos insuflaciones. Al ritmo.",
    "Aire. Dale aire.",
    "Insuflación. Controlada.",
]

const TEXT_SEGUNDO_ALIENTO = [
    "Algo cambia. Una chispa.",
    "La magia te guía la mano. Segundo aliento.",
    "No era su momento.",
]

const TEXT_SUCCESS = "Juan tose. El mundo vuelve a existir."
const TEXT_FAILURE = "No hubo forma. Llegaste, pero no fue suficiente. La oscuridad de la cueva te pesa más que nunca."

// --- Audio: pure Web Audio synth ---

function createRcpSynth() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()

        function playClick(freq = 220, vol = 0.18, dur = 0.04) {
            if (ctx.state === 'suspended') ctx.resume()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = freq
            gain.gain.setValueAtTime(vol, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(ctx.currentTime)
            osc.stop(ctx.currentTime + dur + 0.01)
        }

        function playBeat() {
            // Deep thud — metronome beat
            playClick(90, 0.22, 0.06)
        }

        function playHit() {
            // Successful compression: two quick clicks like a heartbeat
            playClick(140, 0.15, 0.035)
            setTimeout(() => playClick(110, 0.10, 0.03), 60)
        }

        function playMiss() {
            // Soft low thud indicating miss
            playClick(70, 0.10, 0.05)
        }

        function playInsuf() {
            // Breath-like rising tone
            playClick(180, 0.12, 0.12)
            setTimeout(() => playClick(200, 0.09, 0.10), 200)
        }

        function playSegundoAliento() {
            // Magic chime
            playClick(440, 0.12, 0.08)
            setTimeout(() => playClick(550, 0.09, 0.07), 120)
            setTimeout(() => playClick(660, 0.07, 0.06), 240)
        }

        return { playBeat, playHit, playMiss, playInsuf, playSegundoAliento, destroy() { try { ctx.close() } catch {} } }
    } catch {
        return { playBeat() {}, playHit() {}, playMiss() {}, playInsuf() {}, playSegundoAliento() {}, destroy() {} }
    }
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

export default function RcpGame({ params = {}, onFinish }) {
    // Parse stat params (all come as strings from ink tag parser)
    const fuerza = parseInt(params.fuerza ?? 0, 10)
    const magia = parseInt(params.magia ?? 0, 10)
    const conocimiento = parseInt(params.conocimiento ?? 0, 10)
    const hp = parseInt(params.hp ?? 100, 10)
    const winnable = params.winnable === 'true' || params.winnable === true

    // Stat bonus flags (threshold = 20, single source of truth)
    const bonusFuerza = fuerza >= 20
    const bonusMagia = magia >= 20
    const bonusConocimiento = conocimiento >= 20

    // Derived constants using stat bonuses
    const TIMING_WINDOW = BASE_WINDOW_MS + (bonusConocimiento ? CONOCIMIENTO_WINDOW_BONUS : 0)
    const HEAL_PER_HIT = BASE_HEAL_PER_HIT * (bonusFuerza ? (1 + FUERZA_HEAL_BONUS) : 1)

    // Initial Juan life: winnable gives a head start
    const JUAN_INITIAL = winnable ? 28 : 12

    // hp affects fatigue color threshold (cosmetic only)
    const fatigueColorShift = hp < 50 ? 15 : 0  // low hp = fatigue bar goes red earlier

    // Game state
    const [gameState, setGameState] = useState('intro')  // 'intro' | 'playing' | 'insuf' | 'resting' | 'done'
    const [juanLife, setJuanLife] = useState(JUAN_INITIAL)
    const [fatigue, setFatigue] = useState(0)
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S)
    const [beatFlash, setBeatFlash] = useState(false)
    const [hitFlash, setHitFlash] = useState(false)
    const [textLog, setTextLog] = useState([])

    // Refs (stable across re-renders, used in loops/callbacks)
    const gameLoopRef = useRef(null)
    const beatTimerRef = useRef(null)
    const lastTimeRef = useRef(0)
    const finishedRef = useRef(false)
    const gameStateRef = useRef('intro')
    const juanLifeRef = useRef(JUAN_INITIAL)
    const fatigueRef = useRef(0)
    const timeLeftRef = useRef(TIME_LIMIT_S)
    const nextBeatRef = useRef(0)       // timestamp of next expected beat
    const beatCountRef = useRef(0)      // total compression beats done
    const lastInputRef = useRef(0)      // timestamp of last player input
    const insufTimerRef = useRef(null)
    const scrollRef = useRef(null)
    const synthRef = useRef(null)
    const segundoAlientoUsedRef = useRef(false)

    // Text dedup refs
    const lastHitTextRef = useRef('')
    const lastMissTextRef = useRef('')
    const lastJuanTextRef = useRef('')
    const lastFatigueTextRef = useRef('')

    // Throttle refs
    const lastJuanLineTimeRef = useRef(0)
    const lastFatigueLineTimeRef = useRef(0)

    // Sync gameState to ref so game loop can read it without stale closure
    useEffect(() => { gameStateRef.current = gameState }, [gameState])

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
        gameStateRef.current = 'done'
        setGameState('done')
        cancelAnimationFrame(gameLoopRef.current)
        clearTimeout(beatTimerRef.current)
        clearTimeout(insufTimerRef.current)

        if (success) {
            appendText(TEXT_SUCCESS, 'success')
            setTimeout(() => onFinish(1), 1800)
        } else {
            appendText(TEXT_FAILURE, 'danger')
            setTimeout(() => onFinish(0), 3000)
        }
    }, [onFinish, appendText])

    // --- Schedule metronome beat ---
    const scheduleBeat = useCallback(() => {
        if (finishedRef.current) return
        const now = performance.now()
        const target = nextBeatRef.current
        const delay = Math.max(0, target - now)

        beatTimerRef.current = setTimeout(() => {
            if (finishedRef.current || gameStateRef.current === 'insuf' || gameStateRef.current === 'resting') {
                // Still tick the beat ref forward so timing stays consistent on resume
                nextBeatRef.current += BEAT_INTERVAL_MS
                scheduleBeat()
                return
            }

            // Advance beat
            nextBeatRef.current += BEAT_INTERVAL_MS
            beatCountRef.current += 1

            synthRef.current?.playBeat()
            setBeatFlash(true)
            setTimeout(() => setBeatFlash(false), 80)

            // Check if it's time for insuflación
            if (beatCountRef.current % INSUF_EVERY_N_BEATS === 0) {
                triggerInsuf()
                return  // don't schedule next beat — triggerInsuf will resume
            }

            scheduleBeat()
        }, delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // --- Insuflación phase ---
    const triggerInsuf = useCallback(() => {
        if (finishedRef.current) return
        gameStateRef.current = 'insuf'
        setGameState('insuf')
        synthRef.current?.playInsuf()
        appendText(pickRandom(TEXT_INSUF, lastFatigueTextRef))

        insufTimerRef.current = setTimeout(() => {
            if (finishedRef.current) return
            gameStateRef.current = 'playing'
            setGameState('playing')
            nextBeatRef.current = performance.now() + BEAT_INTERVAL_MS
            scheduleBeat()
        }, INSUF_DURATION_MS)
    }, [appendText, scheduleBeat])

    // --- Audio init ---
    useEffect(() => {
        synthRef.current = createRcpSynth()
        return () => { synthRef.current?.destroy() }
    }, [])

    // --- Intro text ---
    useEffect(() => {
        TEXT_INTRO.forEach((line, i) => {
            setTimeout(() => appendText(line), i * 900)
        })
        // Stat hints
        if (bonusFuerza) setTimeout(() => appendText("Tus brazos son fuertes. Cada compresión va a fondo.", 'hint'), 2800)
        if (bonusConocimiento) setTimeout(() => appendText("Conocés la técnica. Tenés más margen.", 'hint'), 3200)
        if (bonusMagia) setTimeout(() => appendText("Sentís algo en tus manos. Una reserva.", 'hint'), 3600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // --- Main game loop (timer + juan decay) ---
    useEffect(() => {
        if (gameState !== 'playing' && gameState !== 'insuf' && gameState !== 'resting') return

        lastTimeRef.current = performance.now()

        const loop = (currentTime) => {
            const deltaTime = (currentTime - lastTimeRef.current) / 1000
            lastTimeRef.current = currentTime
            const state = gameStateRef.current

            // Time
            const newTime = Math.max(0, timeLeftRef.current - deltaTime)
            timeLeftRef.current = newTime
            setTimeLeft(newTime)

            if (newTime <= 0 && !finishedRef.current) {
                const won = juanLifeRef.current >= JUAN_TARGET
                if (!won && !winnable) {
                    // Autofail timeout: show special closing line before onFinish(0)
                    finishedRef.current = true
                    gameStateRef.current = 'done'
                    setGameState('done')
                    cancelAnimationFrame(gameLoopRef.current)
                    clearTimeout(beatTimerRef.current)
                    clearTimeout(insufTimerRef.current)
                    appendText(TEXT_AUTOFAIL_CLOSE, 'warning')
                    setTimeout(() => onFinish(0), 2800)
                } else {
                    finish(won)
                }
                return
            }

            // Juan passive decay (always, even during insuf)
            // Autofail mode adds extra decay so the cap is never escapable
            const totalDecay = JUAN_DECAY + (winnable ? 0 : AUTOFAIL_EXTRA_DECAY)
            let newJuan = Math.max(0, juanLifeRef.current - totalDecay * deltaTime)

            // Autofail cap: Juan can never reach JUAN_TARGET when winnable is false
            if (!winnable) {
                newJuan = Math.min(newJuan, AUTOFAIL_CAP)
            }

            juanLifeRef.current = newJuan
            setJuanLife(newJuan)

            // Magia segundo aliento: refill Juan once when he hits 0
            // In autofail mode, magia still triggers (player feels the stat) but
            // the cap still applies so they can't win — adds to the illusion of chance
            if (newJuan <= 0 && bonusMagia && !segundoAlientoUsedRef.current && !finishedRef.current) {
                segundoAlientoUsedRef.current = true
                const refillVal = winnable ? 35 : Math.min(35, AUTOFAIL_CAP)
                juanLifeRef.current = refillVal
                setJuanLife(refillVal)
                synthRef.current?.playSegundoAliento()
                appendText(pickRandom(TEXT_SEGUNDO_ALIENTO, lastJuanTextRef), 'magic')
            } else if (newJuan <= 0 && !bonusMagia && !finishedRef.current) {
                // Juan dies — in autofail show special closing line
                if (!winnable) {
                    appendText(TEXT_AUTOFAIL_CLOSE, 'warning')
                    setTimeout(() => onFinish(0), 2800)
                    finishedRef.current = true
                    gameStateRef.current = 'done'
                    setGameState('done')
                    cancelAnimationFrame(gameLoopRef.current)
                    clearTimeout(beatTimerRef.current)
                    clearTimeout(insufTimerRef.current)
                } else {
                    finish(false)
                }
                return
            }

            if (newJuan >= JUAN_TARGET && !finishedRef.current) {
                finish(true)
                return
            }

            // Juan low text (throttle 3s)
            const now = currentTime
            if (newJuan < 25 && newJuan > 0) {
                if (now - lastJuanLineTimeRef.current > 3000) {
                    lastJuanLineTimeRef.current = now
                    appendText(pickRandom(TEXT_JUAN_LOW, lastJuanTextRef), 'warning')
                }
            } else if (newJuan > 55 && newJuan < 75) {
                if (now - lastJuanLineTimeRef.current > 4000) {
                    lastJuanLineTimeRef.current = now
                    appendText(pickRandom(TEXT_JUAN_RISING, lastJuanTextRef))
                }
            }

            // Fatigue recovery when resting
            if (state === 'resting') {
                const newFatigue = Math.max(0, fatigueRef.current - FATIGUE_RECOVER * deltaTime)
                fatigueRef.current = newFatigue
                setFatigue(newFatigue)
                if (newFatigue <= FATIGUE_RESUME_THRESHOLD) {
                    gameStateRef.current = 'playing'
                    setGameState('playing')
                }
            }

            gameLoopRef.current = requestAnimationFrame(loop)
        }

        gameLoopRef.current = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(gameLoopRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState])

    // --- Player compression input ---
    const handleCompression = useCallback(() => {
        const state = gameStateRef.current
        if (state === 'done' || state === 'intro' || state === 'insuf') return

        if (state === 'resting') {
            // Can't compress while force-resting
            return
        }

        const now = performance.now()

        // Spam detection: too fast (< half beat interval)
        const timeSinceLast = now - lastInputRef.current
        if (lastInputRef.current > 0 && timeSinceLast < BEAT_INTERVAL_MS * 0.45) {
            lastInputRef.current = now
            synthRef.current?.playMiss()
            appendText(pickRandom(TEXT_SPAM, lastMissTextRef), 'warning')
            const newJuan = Math.max(0, juanLifeRef.current - SPAM_PENALTY)
            juanLifeRef.current = newJuan
            setJuanLife(newJuan)
            return
        }

        lastInputRef.current = now

        // Check timing vs next beat
        const distToNextBeat = Math.abs(now - nextBeatRef.current)
        const distToPrevBeat = Math.abs(now - (nextBeatRef.current - BEAT_INTERVAL_MS))
        const onBeat = Math.min(distToNextBeat, distToPrevBeat) <= TIMING_WINDOW

        if (onBeat) {
            // Good compression
            synthRef.current?.playHit()
            setHitFlash(true)
            setTimeout(() => setHitFlash(false), 100)

            const newJuan = Math.min(JUAN_TARGET, juanLifeRef.current + HEAL_PER_HIT)
            juanLifeRef.current = newJuan
            setJuanLife(newJuan)

            // Win the instant Juan reaches the target. The game-loop's win check runs
            // AFTER passive decay, and hits cap Juan at exactly JUAN_TARGET, so decay would
            // nudge him to 99.98 before the loop ever sees >= 100 — making winnable mode
            // literally unwinnable. Check here, on the hit, before decay can steal it.
            if (winnable && newJuan >= JUAN_TARGET) {
                finish(true)
                return
            }

            const textPool = bonusFuerza ? TEXT_HIT_FUERZA : TEXT_HIT
            // Only log hit text every few hits to avoid flooding
            if (Math.random() < 0.35) {
                appendText(pickRandom(textPool, lastHitTextRef))
            }
        } else {
            // Off-beat
            synthRef.current?.playMiss()
            if (Math.random() < 0.5) {
                appendText(pickRandom(TEXT_MISS, lastMissTextRef), 'warning')
            }
        }

        // Fatigue
        const newFatigue = Math.min(100, fatigueRef.current + FATIGUE_DRAIN)
        fatigueRef.current = newFatigue
        setFatigue(newFatigue)

        if (newFatigue >= FATIGUE_REST_THRESHOLD) {
            gameStateRef.current = 'resting'
            setGameState('resting')
            appendText(pickRandom(TEXT_FATIGUE, lastFatigueTextRef), 'warning')
        }
    }, [appendText, bonusFuerza, TIMING_WINDOW, HEAL_PER_HIT, winnable, finish])

    // --- Start game ---
    const startGame = useCallback(() => {
        gameStateRef.current = 'playing'
        setGameState('playing')
        nextBeatRef.current = performance.now() + BEAT_INTERVAL_MS
        scheduleBeat()
        appendText("Uno. Dos. Tres. Cuatro.")
    }, [scheduleBeat, appendText])

    // --- Keyboard input ---
    useEffect(() => {
        if (gameState === 'intro') {
            const handle = (e) => {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault()
                    startGame()
                }
            }
            window.addEventListener('keydown', handle)
            return () => window.removeEventListener('keydown', handle)
        }

        if (gameState === 'done') return

        const handle = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault()
                if (e.repeat) return
                handleCompression()
            }
        }
        window.addEventListener('keydown', handle)
        return () => window.removeEventListener('keydown', handle)
    }, [gameState, startGame, handleCompression])

    // --- Mouse input ---
    useEffect(() => {
        if (gameState === 'intro') {
            const handle = () => startGame()
            window.addEventListener('mousedown', handle)
            return () => window.removeEventListener('mousedown', handle)
        }
        if (gameState === 'done') return
        const handle = () => handleCompression()
        window.addEventListener('mousedown', handle)
        return () => window.removeEventListener('mousedown', handle)
    }, [gameState, startGame, handleCompression])

    // --- Touch input ---
    useEffect(() => {
        if (gameState === 'intro') {
            const handle = (e) => { e.preventDefault(); startGame() }
            window.addEventListener('touchstart', handle, { passive: false })
            return () => window.removeEventListener('touchstart', handle)
        }
        if (gameState === 'done') return
        const handle = (e) => { e.preventDefault(); handleCompression() }
        window.addEventListener('touchstart', handle, { passive: false })
        return () => window.removeEventListener('touchstart', handle)
    }, [gameState, startGame, handleCompression])

    // --- Derived visual state ---
    const juanPct = Math.min(100, (juanLife / JUAN_TARGET) * 100)
    const fatiguePct = fatigue
    const timePct = (timeLeft / TIME_LIMIT_S) * 100

    const juanColor = juanPct < 25 ? '#ef4444' : juanPct < 55 ? '#f59e0b' : '#4ade80'
    const fatigueWarning = fatiguePct > (70 - fatigueColorShift)

    const vignetteOpacity = Math.min(0.7, (1 - juanPct / 100) * 0.6 + (1 - timeLeft / TIME_LIMIT_S) * 0.2)

    const getTextDegradation = () => {
        if (juanLife < 15 || timeLeft < 8) return { opacity: 0.45, filter: 'blur(1.5px)' }
        if (juanLife < 30 || timeLeft < 15) return { opacity: 0.65, filter: 'blur(0.5px)' }
        return { opacity: 1, filter: 'none' }
    }

    const getShakeLevel = () => {
        if (gameState === 'resting') return 'none'
        if (juanLife < 20) return 'medium'
        if (juanLife < 40) return 'low'
        return 'none'
    }

    const shakeLevel = getShakeLevel()
    const shakeConfig = SHAKE_LEVELS[shakeLevel]

    const textStyleForLine = (style) => {
        switch (style) {
            case 'danger': return 'text-red-400/90'
            case 'warning': return 'text-amber-400/80'
            case 'magic': return 'text-purple-400/90'
            case 'hint': return 'text-bardo-accent/60'
            case 'success': return 'text-green-400/90'
            default: return 'text-bardo-text'
        }
    }

    const isInsuf = gameState === 'insuf'
    const isResting = gameState === 'resting'

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden select-none">

            {/* VFX: red vignette as Juan's life drops */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 20%, rgba(60, 0, 0, 0.95) 100%)'
                }}
                animate={{ opacity: vignetteOpacity }}
                transition={{ duration: 0.5 }}
            />

            {/* VFX: beat flash — subtle white pulse */}
            <AnimatePresence>
                {beatFlash && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-40"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.08 }}
                    />
                )}
            </AnimatePresence>

            {/* VFX: hit flash — green pulse on correct compression */}
            <AnimatePresence>
                {hitFlash && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-40"
                        style={{ backgroundColor: 'rgba(74, 222, 128, 0.06)' }}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.10 }}
                    />
                )}
            </AnimatePresence>

            {/* Content */}
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
                                <p className="font-narrative text-xl md:text-2xl leading-relaxed text-bardo-text mb-3">
                                    Presioná al ritmo del pulso guía para darle RCP a Juan.
                                </p>
                                <p className="font-narrative text-lg leading-relaxed text-bardo-text/50 mb-2">
                                    <span className="text-bardo-accent font-bold">[ESPACIO]</span> / click / tap — al ritmo.
                                </p>
                                <p className="text-bardo-accent/70 animate-pulse mt-6 font-mono text-sm">
                                    [ Empezá ]
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Insuflación banner */}
                    <AnimatePresence>
                        {isInsuf && (
                            <motion.div
                                className="mb-6"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <p className="text-bardo-accent/80 font-mono text-sm animate-pulse">
                                    [ insuflación — esperá ]
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Rest banner */}
                    <AnimatePresence>
                        {isResting && (
                            <motion.div
                                className="mb-6"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <p className="text-amber-400/80 font-mono text-sm animate-pulse">
                                    [ descansá un segundo ]
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

            {/* Bottom HUD */}
            {gameState !== 'intro' && gameState !== 'done' && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 w-48">

                    {/* Beat ring — pulses on each beat */}
                    <motion.div
                        className="w-8 h-8 rounded-full border-2 mb-1"
                        animate={{
                            borderColor: beatFlash ? 'rgba(250,204,21,0.9)' : 'rgba(63,63,70,0.4)',
                            scale: beatFlash ? 1.25 : 1,
                        }}
                        transition={{ duration: 0.08 }}
                    />

                    {/* Juan's life bar */}
                    <div className="w-full">
                        <p className="text-xs font-mono text-zinc-500 mb-0.5">Juan</p>
                        <div className="w-full h-1.5 bg-zinc-900/60 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                animate={{
                                    width: `${juanPct}%`,
                                    backgroundColor: juanColor,
                                }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>
                    </div>

                    {/* Fatigue bar */}
                    <div className="w-full">
                        <p className="text-xs font-mono text-zinc-500 mb-0.5">Fatiga</p>
                        <div className="w-full h-1 bg-zinc-900/60 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                animate={{
                                    width: `${fatiguePct}%`,
                                    backgroundColor: fatigueWarning ? '#f59e0b' : '#52525b',
                                }}
                                transition={{ duration: 0.15 }}
                            />
                        </div>
                    </div>

                    {/* Time bar */}
                    <div className="w-full h-0.5 bg-zinc-900/50 overflow-hidden rounded-full">
                        <motion.div
                            className="h-full"
                            animate={{
                                width: `${timePct}%`,
                                backgroundColor: timeLeft < 12 ? '#ef4444' : '#3f3f46'
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
