import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ApneaGame - Breath-holding survival minigame
 * 
 * Mechanic: Hold SPACE to stay silent, release to breathe.
 * During shadow phases, releasing makes noise and increases visibility.
 * Running out of oxygen = death. 100% visibility = detected.
 * 
 * Params:
 * - waves: number of shadow waves (default: 3)
 * - duration: total game duration in seconds (default: 30)
 */
export default function ApneaGame({ params = {}, onFinish }) {
    const waves = params.waves || 3
    const gameDuration = params.duration || 35

    // Game state
    const [oxygen, setOxygen] = useState(100)
    const [visibility, setVisibility] = useState(0)
    const [isHolding, setIsHolding] = useState(false)
    const [shadowActive, setShadowActive] = useState(false)
    const [gameState, setGameState] = useState('intro') // intro, playing, win, lose
    const [currentWave, setCurrentWave] = useState(0)
    const [narrativeText, setNarrativeText] = useState('')
    const [timeElapsed, setTimeElapsed] = useState(0)

    const gameLoopRef = useRef(null)
    const lastTimeRef = useRef(0)

    // Balance constants
    const O2_DRAIN = 14      // % per second while holding
    const O2_RECOVER = 8     // % per second while not holding
    const VIS_INCREASE = 30  // % per second (not holding during shadow)
    const VIS_DECREASE = 25  // % per second while holding
    const PANIC_THRESHOLD = 30

    // Narrative sequence with wave markers
    const narrative = [
        { time: 0, text: "Estás escondido en el armario.", shadow: false },
        { time: 2, text: "Afuera, pasos pesados...", shadow: false },
        { time: 4, text: "💀 LA SOMBRA ESTÁ CERCA", shadow: true, wave: 1 },
        { time: 7, text: "Los pasos se alejan...", shadow: false },
        { time: 10, text: "¿Se fue?", shadow: false },
        { time: 12, text: "Vuelven. Más lentos.", shadow: false },
        { time: 14, text: "💀 ESTÁ JUSTO AFUERA", shadow: true, wave: 2 },
        { time: 19, text: "Silencio...", shadow: false },
        { time: 22, text: "La puerta cruje.", shadow: false },
        { time: 24, text: "💀 ESTÁ ABRIENDO LA PUERTA", shadow: true, wave: 3 },
        { time: 32, text: "Se va. Te salvaste.", shadow: false, end: true },
    ]

    const finish = useCallback((success) => {
        setGameState(success ? 'win' : 'lose')
        cancelAnimationFrame(gameLoopRef.current)
        onFinish(success ? 1 : 0)
    }, [onFinish])

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return

        lastTimeRef.current = performance.now()

        const loop = (currentTime) => {
            const deltaTime = (currentTime - lastTimeRef.current) / 1000
            lastTimeRef.current = currentTime

            // Update time
            setTimeElapsed(prev => {
                const newTime = prev + deltaTime

                // Find current narrative point
                const currentNarrative = narrative.filter(n => n.time <= newTime).pop()
                if (currentNarrative) {
                    setNarrativeText(currentNarrative.text)
                    setShadowActive(currentNarrative.shadow)
                    if (currentNarrative.wave) setCurrentWave(currentNarrative.wave)

                    // Check for win condition
                    if (currentNarrative.end) {
                        finish(true)
                        return newTime
                    }
                }

                return newTime
            })

            // Update oxygen
            setOxygen(prev => {
                let newO2 = prev
                if (isHolding) {
                    newO2 -= O2_DRAIN * deltaTime
                } else {
                    newO2 += O2_RECOVER * deltaTime
                }
                newO2 = Math.max(0, Math.min(100, newO2))

                if (newO2 <= 0) {
                    finish(false)
                }
                return newO2
            })

            // Update visibility
            setVisibility(prev => {
                let newVis = prev
                if (isHolding) {
                    newVis -= VIS_DECREASE * deltaTime
                } else if (shadowActive) {
                    newVis += VIS_INCREASE * deltaTime
                }
                newVis = Math.max(0, Math.min(100, newVis))

                if (newVis >= 100) {
                    finish(false)
                }
                return newVis
            })

            gameLoopRef.current = requestAnimationFrame(loop)
        }

        gameLoopRef.current = requestAnimationFrame(loop)

        return () => cancelAnimationFrame(gameLoopRef.current)
    }, [gameState, isHolding, shadowActive, finish])

    // Input handling
    useEffect(() => {
        if (gameState === 'intro') {
            // Start on any key
            const handleStart = (e) => {
                if (e.code === 'Space') {
                    e.preventDefault()
                    setGameState('playing')
                }
            }
            window.addEventListener('keydown', handleStart)
            return () => window.removeEventListener('keydown', handleStart)
        }

        if (gameState !== 'playing') return

        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault()
                setIsHolding(true)
            }
        }

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                e.preventDefault()
                setIsHolding(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [gameState])

    // Touch support
    useEffect(() => {
        if (gameState !== 'playing') return

        const handleTouchStart = () => setIsHolding(true)
        const handleTouchEnd = () => setIsHolding(false)

        window.addEventListener('touchstart', handleTouchStart)
        window.addEventListener('touchend', handleTouchEnd)

        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [gameState])

    const panicLevel = oxygen < PANIC_THRESHOLD ? (PANIC_THRESHOLD - oxygen) / PANIC_THRESHOLD : 0

    return (
        <div className="relative bg-zinc-900 border-2 border-bardo-accent p-8 flex flex-col items-center justify-center gap-6 shadow-2xl min-h-[400px] overflow-hidden">
            {/* Danger overlays */}
            <motion.div
                className="absolute inset-0 bg-red-900/50 pointer-events-none"
                animate={{ opacity: panicLevel * 0.7 }}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 50%, rgba(0,0,0,0.8) 100%)'
                }}
                animate={{ opacity: shadowActive ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Title */}
            <h2 className="text-2xl font-bold text-bardo-accent tracking-widest z-10">APNEA</h2>

            {/* Intro screen */}
            <AnimatePresence>
                {gameState === 'intro' && (
                    <motion.div
                        className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center gap-4 z-20"
                        exit={{ opacity: 0 }}
                    >
                        <h2 className="text-3xl font-bold text-bardo-accent">APNEA</h2>
                        <p className="text-gray-400 text-center max-w-md px-4">
                            Mantenné presionado <span className="text-bardo-accent font-bold">[ESPACIO]</span> para aguantar la respiración.
                            <br /><br />
                            Si no aguantás cuando la sombra pasa, te encuentra.
                            <br />
                            Si aguantás demasiado, te asfixiás.
                        </p>
                        <p className="text-bardo-accent animate-pulse mt-4">
                            [ PRESIONÁ ESPACIO ]
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD */}
            {gameState === 'playing' && (
                <div className="flex gap-8 z-10">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Oxígeno</span>
                        <div className="w-32 h-3 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-bardo-accent"
                                style={{ boxShadow: '0 0 10px var(--bardo-accent)' }}
                                animate={{ width: `${oxygen}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Ruido</span>
                        <div className="w-32 h-3 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-red-500"
                                style={{ boxShadow: '0 0 10px #ef4444' }}
                                animate={{ width: `${visibility}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Narrative text */}
            {gameState === 'playing' && (
                <motion.p
                    className={`text-xl text-center z-10 min-h-[60px] flex items-center ${shadowActive ? 'text-red-400 font-bold' : 'text-gray-300'
                        } ${panicLevel > 0.3 ? 'blur-[1px]' : ''}`}
                    animate={panicLevel > 0.3 ? { x: [0, -2, 2, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                >
                    {narrativeText}
                </motion.p>
            )}

            {/* Breath indicator */}
            {gameState === 'playing' && (
                <motion.div
                    className={`font-mono text-sm uppercase tracking-widest z-10 ${isHolding ? 'text-bardo-accent' : 'text-gray-500'
                        } ${oxygen < PANIC_THRESHOLD ? 'text-red-500 animate-pulse' : ''}`}
                >
                    {isHolding ? '[ AGUANTANDO... ]' : '[ ESPACIO ] AGUANTAR'}
                </motion.div>
            )}

            {/* Wave indicator */}
            {gameState === 'playing' && currentWave > 0 && (
                <div className="absolute top-4 right-4 text-xs text-gray-600 font-mono z-10">
                    OLA {currentWave}/{waves}
                </div>
            )}
        </div>
    )
}
