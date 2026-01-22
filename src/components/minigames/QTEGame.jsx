import { useState, useEffect, useCallback } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function QTEGame({ params = [], onFinish }) {
    const targetKey = (params[0] || 'SPACE').toUpperCase()
    const duration = parseFloat(params[1]) || 2.0

    const [timeLeft, setTimeLeft] = useState(duration)
    const [gameState, setGameState] = useState('ready') // ready, playing, win, lose
    const [readyCountdown, setReadyCountdown] = useState(2)

    const finish = useCallback((success) => {
        setGameState(success ? 'win' : 'lose')
        onFinish(success ? 1 : 0)
    }, [onFinish])

    useEffect(() => {
        if (gameState === 'ready') {
            const timer = setInterval(() => {
                setReadyCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setGameState('playing')
                        return 0
                    }
                    return prev - 1
                })
            }, 600)
            return () => clearInterval(timer)
        }

        if (gameState !== 'playing') return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.05) {
                    clearInterval(timer)
                    finish(false)
                    return 0
                }
                return prev - 0.05
            })
        }, 50)

        const handleKeyDown = (e) => {
            const pressed = e.code === 'Space' ? 'SPACE' : e.key.toUpperCase()
            if (pressed === targetKey) {
                clearInterval(timer)
                finish(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            clearInterval(timer)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [gameState, targetKey, finish])

    const progress = (timeLeft / duration) * 100

    return (
        <div className="bg-zinc-900 border-2 border-bardo-accent p-12 flex flex-col items-center justify-center gap-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-bardo-accent tracking-widest">RAPID REACTION</h2>

            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Timer Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="transparent"
                        stroke="#222"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="transparent"
                        stroke="var(--bardo-accent)"
                        strokeWidth="8"
                        strokeDasharray="502.6"
                        animate={{ strokeDashoffset: 502.6 * (1 - timeLeft / duration) }}
                        transition={{ duration: 0.05, ease: "linear" }}
                        style={{ filter: 'drop-shadow(0 0 5px var(--bardo-accent))' }}
                    />
                </svg>

                <div className="z-10 bg-bardo-accent text-zinc-900 text-5xl font-black w-24 h-24 flex items-center justify-center rounded-lg shadow-lg">
                    {targetKey === 'SPACE' ? '⎵' : targetKey}
                </div>
            </div>

            <p className="text-gray-400 font-mono text-center">
                {gameState === 'ready' ? (
                    <span className="text-bardo-accent text-3xl font-black animate-ping">READY? {readyCountdown}</span>
                ) : gameState === 'playing' ? (
                    <>PRESS <span className="text-bardo-accent font-bold">[{targetKey}]</span> NOW!</>
                ) : gameState === 'win' ? (
                    <span className="text-green-500 font-bold scale-125 inline-block transition-transform">✓ SUCCESS</span>
                ) : (
                    <span className="text-red-500 font-bold animate-pulse">FAILED</span>
                )}
            </p>
        </div>
    )
}
