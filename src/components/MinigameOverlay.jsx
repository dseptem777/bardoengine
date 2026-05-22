import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMinigameComponent } from '../config/minigameRegistry'

// Minigame types that render immersively (no backdrop, no frame, no result screen)
const IMMERSIVE_TYPES = new Set(['apnea'])

/**
 * MinigameOverlay - Renders the active minigame
 *
 * Props:
 * - isPlaying: boolean - Whether a game is active
 * - config: { type, params } - Game configuration
 * - onFinish: (result) => void - Called when game ends
 * - onCancel: () => void - Called when game is cancelled
 * - showResultScreen: boolean - Whether to show victory/defeat screen
 */
export default function MinigameOverlay({
    isPlaying,
    config,
    onFinish,
    onCancel,
    showResultScreen = true
}) {
    const [result, setResult] = useState(null)
    const [showingResult, setShowingResult] = useState(false)
    const resultTimeoutRef = useRef(null)
    const hasCommittedRef = useRef(false)

    const isImmersive = config && IMMERSIVE_TYPES.has(config.type?.toLowerCase())

    // Allow any key press to dismiss result screen
    const commitResultRef = useRef(null)
    useEffect(() => {
        if (!showingResult) return
        const handleKey = () => { if (commitResultRef.current) commitResultRef.current(result) }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [showingResult, result])

    // Reset result state when a new game starts
    useEffect(() => {
        if (isPlaying) {
            setResult(null)
            setShowingResult(false)
            hasCommittedRef.current = false
            if (resultTimeoutRef.current) {
                clearTimeout(resultTimeoutRef.current)
                resultTimeoutRef.current = null
            }
        }
    }, [isPlaying])

    if (!isPlaying && !showingResult) return null

    const commitResult = (finalResult) => {
        if (hasCommittedRef.current) return
        hasCommittedRef.current = true
        if (resultTimeoutRef.current) {
            clearTimeout(resultTimeoutRef.current)
            resultTimeoutRef.current = null
        }
        setShowingResult(false)
        setResult(null)
        onFinish(finalResult)
    }
    commitResultRef.current = commitResult

    const handleGameFinish = (outcome) => {
        const numericResult = (outcome === true || outcome === 1) ? 1 : 0

        if (isImmersive) {
            onFinish(numericResult)
            return
        }

        if (showResultScreen) {
            setResult(numericResult)
            setShowingResult(true)
            hasCommittedRef.current = false

            resultTimeoutRef.current = setTimeout(() => {
                commitResult(numericResult)
            }, 1500)
        } else {
            onFinish(numericResult)
        }
    }

    const renderGame = () => {
        if (showingResult || !config) return null

        const { type, params } = config
        const GameComponent = getMinigameComponent(type)

        if (GameComponent) {
            return <GameComponent params={params} onFinish={handleGameFinish} />
        }

        return (
            <div className="text-white p-8 bg-black/80 border-2 border-red-500 text-center">
                <p className="text-xl mb-4">Minigame "{type}" not implemented.</p>
                <button
                    onClick={onCancel}
                    className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-colors"
                >
                    Close
                </button>
            </div>
        )
    }

    // Immersive mode: no backdrop, no frame, no spring animation, no result screen.
    // The game component renders inside the content flow and Player's header stays visible.
    if (isImmersive) {
        return (
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        className="fixed inset-0 z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderGame()}
                    </motion.div>
                )}
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence>
            {(isPlaying || showingResult) && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Decorative frame */}
                    <div className="absolute inset-0 border-[16px] border-bardo-accent/5 pointer-events-none" />

                    <motion.div
                        className="relative max-w-full sm:max-w-4xl w-full mx-4"
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25 }}
                    >
                        {renderGame()}

                        {/* Result Screen */}
                        {showingResult && (
                            <motion.div
                                className="flex flex-col items-center justify-center py-16 bg-bardo-bg/95 border-[var(--ui-border-width)] border-bardo-accent/50 shadow-2xl shadow-bardo-accent/20 cursor-pointer"
                                style={{ borderRadius: 'var(--ui-border-radius)' }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => commitResult(result)}
                            >
                                <motion.h2
                                    className={`text-5xl font-black tracking-tight mb-2 ${result === 1 ? 'text-bardo-accent' : 'text-red-500'
                                        }`}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    {result === 1 ? '¡ÉXITO!' : 'FALLO'}
                                </motion.h2>
                                <div className="h-0.5 w-32 bg-bardo-accent/40 mb-4" />
                                <p className="text-gray-500 font-mono text-sm animate-pulse">
                                    Tocá o presioná una tecla...
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
