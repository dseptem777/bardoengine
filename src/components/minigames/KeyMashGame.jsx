import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * KeyMashGame - Willpower Resistance Minigame
 * 
 * The player must mash a key (default: V) to resist the vampire's
 * mind control. Visual feedback shows the struggle:
 * - Willpower bar that fills with each press
 * - Mental static effect while resisting
 * - Pulsing red vignette on failure
 * - Escalating text: "FIGHT..." → "RESIST..." → "FREE!"
 * 
 * Narrative mechanic: Dialog choices are DISABLED until the player
 * completes the mashing. They must FIGHT to even have the option to choose.
 */

const STRUGGLE_TEXTS = [
    '¡LUCHA!',
    '¡RESISTE!',
    '¡NO CEDAS!',
    '¡MÁS FUERTE!',
    '¡CASI..!'
]

export default function KeyMashGame({ params = {}, onFinish }) {
    const targetKey = (params.key || 'V').toUpperCase()
    const targetCount = params.count || 30
    const timeLimit = params.timeLimit || 15

    const [currentCount, setCurrentCount] = useState(0)
    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [gameState, setGameState] = useState('intro') // 'intro' | 'playing' | 'success' | 'failure'
    const [lastHitTime, setLastHitTime] = useState(0)
    const [shakeIntensity, setShakeIntensity] = useState(0)
    const [currentText, setCurrentText] = useState(STRUGGLE_TEXTS[0])

    const introTimerRef = useRef(null)
    const gameTimerRef = useRef(null)
    const textIndexRef = useRef(0)

    const progress = currentCount / targetCount

    // Finish handler
    const finish = useCallback((success) => {
        setGameState(success ? 'success' : 'failure')

        // Brief result display, then callback
        setTimeout(() => {
            onFinish(success ? 1 : 0)
        }, 1200)
    }, [onFinish])

    // Intro countdown
    useEffect(() => {
        introTimerRef.current = setTimeout(() => {
            setGameState('playing')
        }, 1500)

        return () => {
            if (introTimerRef.current) clearTimeout(introTimerRef.current)
        }
    }, [])

    // Game timer
    useEffect(() => {
        if (gameState !== 'playing') return

        gameTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    clearInterval(gameTimerRef.current)
                    finish(false)
                    return 0
                }
                return prev - 0.1
            })
        }, 100)

        return () => {
            if (gameTimerRef.current) clearInterval(gameTimerRef.current)
        }
    }, [gameState, finish])

    // Key handler
    useEffect(() => {
        if (gameState !== 'playing') return

        const handleKeyDown = (e) => {
            const pressed = e.key.toUpperCase()

            if (pressed === targetKey) {
                e.preventDefault()

                // Update count
                setCurrentCount(prev => {
                    const newCount = prev + 1

                    // Check for win
                    if (newCount >= targetCount) {
                        if (gameTimerRef.current) clearInterval(gameTimerRef.current)
                        finish(true)
                    }

                    return newCount
                })

                // Visual feedback
                setLastHitTime(Date.now())
                setShakeIntensity(prev => Math.min(prev + 0.3, 1))

                // Update struggle text at milestones
                const progressPercent = (currentCount + 1) / targetCount
                const newIndex = Math.min(
                    Math.floor(progressPercent * STRUGGLE_TEXTS.length),
                    STRUGGLE_TEXTS.length - 1
                )
                if (newIndex !== textIndexRef.current) {
                    textIndexRef.current = newIndex
                    setCurrentText(STRUGGLE_TEXTS[newIndex])
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState, targetKey, targetCount, currentCount, finish])

    // Decay shake intensity
    useEffect(() => {
        const decay = setInterval(() => {
            setShakeIntensity(prev => Math.max(0, prev - 0.05))
        }, 50)
        return () => clearInterval(decay)
    }, [])

    // Calculate visual effects
    const timePressure = 1 - (timeLeft / timeLimit)
    const vignetteIntensity = timePressure * 0.5 + (1 - progress) * 0.3

    return (
        <motion.div
            className="relative bg-black border-2 border-red-900/50 p-8 md:p-12 flex flex-col items-center justify-center gap-6 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: shakeIntensity * (Math.random() - 0.5) * 10
            }}
            style={{
                boxShadow: `
                    0 0 ${30 + shakeIntensity * 50}px rgba(220, 38, 38, ${0.3 + shakeIntensity * 0.4}),
                    inset 0 0 100px rgba(0, 0, 0, ${vignetteIntensity})
                `
            }}
        >
            {/* Mental static overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    animation: gameState === 'playing' ? 'static-flicker 0.1s infinite' : 'none'
                }}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, transparent ${30 + progress * 40}%, rgba(139, 0, 0, ${vignetteIntensity}) 100%)`
                }}
            />

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-black text-red-500 tracking-[0.3em] uppercase z-10"
                style={{
                    textShadow: `0 0 ${10 + shakeIntensity * 20}px rgba(220, 38, 38, 0.8)`,
                    animation: gameState === 'playing' ? 'text-pulse 0.5s infinite' : 'none'
                }}
            >
                VOLUNTAD
            </h2>

            {/* Progress Bar */}
            <div className="w-full max-w-md h-8 bg-zinc-900 border-2 border-red-900/50 relative overflow-hidden z-10">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-800 via-red-600 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{
                        boxShadow: `0 0 20px rgba(220, 38, 38, ${0.5 + progress * 0.5})`
                    }}
                />

                {/* Progress markers */}
                <div className="absolute inset-0 flex">
                    {[0.25, 0.5, 0.75].map(mark => (
                        <div
                            key={mark}
                            className="h-full w-0.5 bg-red-900/50"
                            style={{ marginLeft: `${mark * 100}%` }}
                        />
                    ))}
                </div>

                {/* Count display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-lg text-white/80 font-bold tracking-wider">
                        {currentCount} / {targetCount}
                    </span>
                </div>
            </div>

            {/* Key Display */}
            <div className="relative z-10">
                {gameState === 'intro' && (
                    <motion.div
                        className="text-4xl text-red-500 font-black"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                        PREPÁRATE...
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-red-600 flex items-center justify-center text-5xl font-black text-red-500"
                            animate={lastHitTime ? {
                                scale: [1.2, 1],
                                borderColor: ['#fff', '#dc2626']
                            } : {}}
                            transition={{ duration: 0.15 }}
                            key={lastHitTime}
                            style={{
                                boxShadow: `
                                    0 0 ${20 + shakeIntensity * 40}px rgba(220, 38, 38, 0.6),
                                    inset 0 0 20px rgba(0, 0, 0, 0.5)
                                `
                            }}
                        >
                            {targetKey}
                        </motion.div>

                        <motion.p
                            className="text-2xl font-bold text-red-400 tracking-wider"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                        >
                            {currentText}
                        </motion.p>
                    </div>
                )}

                {gameState === 'success' && (
                    <motion.div
                        className="text-5xl font-black text-green-500"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        style={{ textShadow: '0 0 30px rgba(34, 197, 94, 0.8)' }}
                    >
                        ¡LIBRE!
                    </motion.div>
                )}

                {gameState === 'failure' && (
                    <motion.div
                        className="text-5xl font-black text-red-600"
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ textShadow: '0 0 30px rgba(220, 38, 38, 0.8)' }}
                    >
                        SOMETIDO
                    </motion.div>
                )}
            </div>

            {/* Timer */}
            {gameState === 'playing' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    <div className="w-32 h-2 bg-zinc-900 border border-red-900/50 overflow-hidden">
                        <motion.div
                            className="h-full bg-red-600"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                            style={{
                                backgroundColor: timeLeft < 3 ? '#ef4444' : '#dc2626'
                            }}
                        />
                    </div>
                    <span className={`font-mono text-sm ${timeLeft < 3 ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`}>
                        {timeLeft.toFixed(1)}s
                    </span>
                </div>
            )}

            {/* CSS for animations */}
            <style>{`
                @keyframes static-flicker {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.4; }
                }
                
                @keyframes text-pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
            `}</style>
        </motion.div>
    )
}
