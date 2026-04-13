import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWillpowerAudio } from '../hooks/useWillpowerAudio'
import { useWillpowerCorruption } from '../hooks/useWillpowerCorruption'

/**
 * WillpowerMeter — Immersive atmospheric overlay (rewrite from HUD bar).
 *
 * Replaces the vertical bar meter with:
 *   - An SVG eye that closes as willpower drops (fixed bottom-left)
 *   - Vampire whisper texts appearing at screen edges
 *   - Procedural audio via useWillpowerAudio
 *   - Text corruption via useWillpowerCorruption
 *
 * The component stays at the same path so no App.jsx import changes are needed.
 * The `position` prop is accepted but ignored (kept for back-compat with App.jsx).
 */

// ─── Boost amounts (unchanged from original) ─────────────────────────────────
const BOOST_AMOUNTS = {
    slow: 8,
    normal: 6,
    fast: 4,
    extreme: 2.5,
}

// ─── Whisper text pools ───────────────────────────────────────────────────────
const WHISPER_SUBTLE = [
    'Dejate llevar...',
    'No tiene sentido resistir.',
    'Sería más fácil si cedés.',
    '¿Por qué luchás?',
    'Relajate.',
]

const WHISPER_PRESSURE = [
    'Ya casi no quedás vos.',
    'Tu voluntad se agrieta.',
    'No podés mantener esto mucho más.',
    'Cada segundo es más difícil.',
    '¿Quién sos? ¿Importa?',
]

const WHISPER_CRITICAL = [
    'CEDÉ.',
    'Ya no sos vos.',
    'El control nunca fue tuyo.',
    'Dejalo ir.',
    'Rendite. Es inevitable.',
]

// ─── Whisper positions (% of viewport) ───────────────────────────────────────
const WHISPER_POSITIONS = [
    { x: 5,  y: 15 },  // top-left
    { x: 70, y: 10 },  // top-right
    { x: 5,  y: 80 },  // bottom-left
    { x: 65, y: 85 },  // bottom-right
    { x: 40, y: 5  },  // top-center
    { x: 40, y: 90 },  // bottom-center
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickPool(value) {
    if (value > 60) return WHISPER_SUBTLE
    if (value > 30) return WHISPER_PRESSURE
    return WHISPER_CRITICAL
}

function pickInterval(value) {
    if (value > 60) return 4000 + Math.random() * 4000   // 4000–8000 ms
    if (value > 30) return 2000 + Math.random() * 2000   // 2000–4000 ms
    return 1000 + Math.random() * 1000                    // 1000–2000 ms
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WillpowerMeter({
    active,
    value = 100,
    decayRate = 'normal',
    targetKey = 'V',
    boostValue,
    volumeMultiplier = 1,
    genjutsuActive = false,
    // position is intentionally ignored — everything is fixed
}) {
    const boost = BOOST_AMOUNTS[decayRate] ?? BOOST_AMOUNTS.normal

    // Eye "fight" open pulse when V is pressed
    const [boostPulse, setBoostPulse] = useState(0)
    const boostPulseTimerRef = useRef(null)

    // Straining state for key prompt styling
    const [isStraining, setIsStraining] = useState(false)

    // Touch device detection (primary touch — no hover, coarse pointer)
    const [isTouchDevice] = useState(() =>
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
    )

    // Touch hint visibility
    const [showTouchHint, setShowTouchHint] = useState(false)

    // Active whisper: { id, text, x, y } | null
    const [whisper, setWhisper] = useState(null)
    const lastWhisperRef = useRef(null)
    const whisperTimerRef = useRef(null)
    const whisperIdRef = useRef(0)

    // ── handleStaticBurst — sync whisper with audio static ───────────────────
    const handleStaticBurst = useCallback(() => {
        const pool = pickPool(value)
        // Avoid consecutive repeat
        const candidates = pool.filter(t => t !== lastWhisperRef.current)
        const text = candidates[Math.floor(Math.random() * candidates.length)]
        lastWhisperRef.current = text
        const pos = WHISPER_POSITIONS[Math.floor(Math.random() * WHISPER_POSITIONS.length)]
        whisperIdRef.current += 1
        setWhisper({ id: whisperIdRef.current, text, x: pos.x, y: pos.y })
    }, [value])

    // ── Audio ─────────────────────────────────────────────────────────────────
    const audio = useWillpowerAudio(handleStaticBurst, volumeMultiplier)

    useEffect(() => {
        if (active) {
            audio.start()
        } else {
            audio.stop()
        }
        return () => audio.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    useEffect(() => {
        audio.setIntensity(1 - value / 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    // ── Corruption ────────────────────────────────────────────────────────────
    useWillpowerCorruption(active, value)

    // ── Key handler ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!active) return

        const handleKeyDown = (e) => {
            if (e.key.toUpperCase() !== targetKey.toUpperCase()) return
            e.preventDefault()
            if (genjutsuActive) return

            if (boostValue) boostValue(boost)

            // Trigger eye open pulse
            setBoostPulse(0.15)
            if (boostPulseTimerRef.current) clearTimeout(boostPulseTimerRef.current)
            boostPulseTimerRef.current = setTimeout(() => setBoostPulse(0), 200)

            // Straining flash for key prompt
            setIsStraining(true)
            setTimeout(() => setIsStraining(false), 100)
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [active, targetKey, boost, boostValue, genjutsuActive])

    // ── Touch hint: show on first activation on touch devices ────────────────
    useEffect(() => {
        if (active && isTouchDevice) {
            setShowTouchHint(true)
        }
        if (!active) setShowTouchHint(false)
    }, [active, isTouchDevice])

    // Auto-hide touch hint after 5 seconds
    useEffect(() => {
        if (!showTouchHint) return
        const timer = setTimeout(() => setShowTouchHint(false), 5000)
        return () => clearTimeout(timer)
    }, [showTouchHint])

    // ── Touch handler for the eye area ────────────────────────────────────────
    const handleTouch = useCallback((e) => {
        if (!active) return
        if (genjutsuActive) return
        e.preventDefault()

        if (boostValue) boostValue(boost)

        setBoostPulse(0.15)
        if (boostPulseTimerRef.current) clearTimeout(boostPulseTimerRef.current)
        boostPulseTimerRef.current = setTimeout(() => setBoostPulse(0), 200)

        setIsStraining(true)
        setTimeout(() => setIsStraining(false), 100)

        setShowTouchHint(false)
    }, [active, boost, boostValue, genjutsuActive])

    // ── Whisper scheduler ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!active) {
            clearTimeout(whisperTimerRef.current)
            setWhisper(null)
            return
        }

        function scheduleNext() {
            const pool = pickPool(value)
            const candidates = pool.filter(t => t !== lastWhisperRef.current)
            const text = candidates[Math.floor(Math.random() * candidates.length)]
            lastWhisperRef.current = text
            const pos = WHISPER_POSITIONS[Math.floor(Math.random() * WHISPER_POSITIONS.length)]
            whisperIdRef.current += 1
            setWhisper({ id: whisperIdRef.current, text, x: pos.x, y: pos.y })

            // Schedule fade-out then next whisper
            whisperTimerRef.current = setTimeout(() => {
                setWhisper(null)
                whisperTimerRef.current = setTimeout(scheduleNext, pickInterval(value))
            }, 3000 + Math.random() * 1000)  // show for 3–4 s
        }

        scheduleNext()

        return () => clearTimeout(whisperTimerRef.current)
    // Intentionally re-run when value crosses pool boundaries
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, value > 60, value > 30])

    // ── Computed eye values ───────────────────────────────────────────────────
    const openness = Math.min(1, Math.max(0, value / 100 + boostPulse))
    const isCritical = value < 15

    const lidY = 25 - openness * 20   // 25 (center) to 5 (above eye)
    const upperLidPath = `M 5 25 Q 40 ${lidY} 75 25 L 75 0 L 5 0 Z`

    const irisRadius = 6 + openness * 4   // 6–10
    const pupilRadius = 3 + (1 - openness) * 4   // 3–7

    const eyeColor =
        value > 60 ? '#e2e8f0' :
        value > 30 ? '#f59e0b' :
        value > 15 ? '#dc2626' :
                     '#991b1b'

    const whisperColor =
        value > 60 ? 'text-red-300/40' :
        value > 30 ? 'text-red-400/60' :
                     'text-red-200/80'

    if (!active) return null

    return (
        <>
            {/* Eye meter + key prompt — fixed bottom-left */}
            <motion.div
                className="fixed bottom-6 left-6 z-[60] flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
            >
                {/* Porcentaje numérico — visible en modo daltónico */}
                <div
                    className="wp-colorblind-pct font-mono text-xs mb-1 text-center"
                    style={{ color: eyeColor }}
                    aria-hidden="true"
                >
                    {Math.round(value)}%
                </div>

                {/* SVG Eye — also responds to touch */}
                <motion.div
                    animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
                    transition={isCritical
                        ? { repeat: Infinity, duration: 0.5, ease: 'easeInOut' }
                        : {}
                    }
                    onTouchStart={handleTouch}
                    style={{ touchAction: 'none' }}
                    data-testid="eye-touch-zone"
                >
                    <svg
                        width="80"
                        height="50"
                        viewBox="0 0 80 50"
                        aria-label={`Willpower: ${Math.round(value)}%`}
                        data-testid="willpower-eye"
                    >
                        <defs>
                            <filter id="wp-glow">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Eye outline */}
                        <ellipse
                            cx="40" cy="25" rx="35" ry="18"
                            fill="none"
                            stroke={eyeColor}
                            strokeWidth="1.5"
                            filter="url(#wp-glow)"
                        />

                        {/* Upper eyelid — closes as willpower drops */}
                        <path d={upperLidPath} fill={eyeColor} opacity="0.9" data-testid="upper-lid" />

                        {/* Iris */}
                        <circle
                            cx="40" cy="25"
                            r={irisRadius}
                            fill={eyeColor}
                            opacity="0.6"
                        />

                        {/* Pupil */}
                        <circle
                            cx="40" cy="25"
                            r={pupilRadius}
                            fill="black"
                        />

                        {/* Shine */}
                        <circle
                            cx="45" cy="20"
                            r="2"
                            fill="white"
                            opacity={value > 20 ? 0.6 : 0}
                        />
                    </svg>
                </motion.div>

                {/* Key / touch prompt */}
                <div className="mt-2 flex flex-col items-center gap-1">
                    {/* Keyboard hint — hidden on pure touch devices and during genjutsu */}
                    {!isTouchDevice && !genjutsuActive && (
                        <div
                            className={`w-8 h-8 rounded border flex items-center justify-center text-sm font-bold ${
                                isStraining
                                    ? 'border-white text-white bg-red-900/30'
                                    : 'border-red-900/40 text-red-600/60'
                            }`}
                        >
                            {targetKey}
                        </div>
                    )}

                    {/* Touch hint — only on touch devices, fades after first use or 5 s */}
                    <AnimatePresence>
                        {isTouchDevice && showTouchHint && (
                            <motion.span
                                className="text-red-500/60 text-xs italic animate-pulse"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                data-testid="touch-hint"
                            >
                                TOCA
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Whisper texts — fixed at various screen positions */}
            <AnimatePresence>
                {whisper && (
                    <motion.div
                        key={whisper.id}
                        className="fixed z-[59] pointer-events-none select-none"
                        style={{ left: `${whisper.x}%`, top: `${whisper.y}%` }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 1 }}
                        data-testid="whisper-text"
                    >
                        <span className={`italic text-sm ${whisperColor}`}>
                            {whisper.text}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
