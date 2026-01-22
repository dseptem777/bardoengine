import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QTEGame from './minigames/QTEGame'
import LockpickGame from './minigames/LockpickGame'
import ArkanoidGame from './minigames/ArkanoidGame'
import ApneaGame from './minigames/ApneaGame'

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

    // Reset result state when a new game starts
    useEffect(() => {
        if (isPlaying) {
            setResult(null)
            setShowingResult(false)
        }
    }, [isPlaying])

    if (!isPlaying && !showingResult) return null

    const handleGameFinish = (outcome) => {
        const numericResult = (outcome === true || outcome === 1) ? 1 : 0

        if (showResultScreen) {
            setResult(numericResult)
            setShowingResult(true)

            // Brief result display, then commit
            setTimeout(() => {
                setShowingResult(false)
                setResult(null)
                onFinish(numericResult)
            }, 800)
        } else {
            // Immediate commit, no result screen
            onFinish(numericResult)
        }
    }

    const renderGame = () => {
        if (showingResult || !config) return null

        const { type, params } = config

        switch (type) {
            case 'qte':
                return <QTEGame params={params} onFinish={handleGameFinish} />
            case 'lockpick':
                return <LockpickGame params={params} onFinish={handleGameFinish} />
            case 'arkanoid':
                return <ArkanoidGame params={params} onFinish={handleGameFinish} />
            case 'apnea':
                return <ApneaGame params={params} onFinish={handleGameFinish} />
            default:
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
                        className="relative max-w-4xl w-full mx-4"
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25 }}
                    >
                        {renderGame()}

                        {/* Result Screen */}
                        {showingResult && (
                            <motion.div
                                className="flex flex-col items-center justify-center py-16 bg-zinc-900/95 border-2 border-bardo-accent shadow-2xl shadow-bardo-accent/20"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
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
                                    Continuando...
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
