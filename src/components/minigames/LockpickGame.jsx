import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function LockpickGame({ params = [], onFinish }) {
    const difficulty = parseFloat(params[0]) || 0.2
    const speed = parseFloat(params[1]) || 1.1

    const [position, setPosition] = useState(0) // 0 to 100
    const [gameState, setGameState] = useState('playing')

    // Stable zone calculation
    const { zoneSize, zoneStart } = useMemo(() => {
        const size = Math.max(15, 50 * (1 - difficulty))
        const start = 20 + (Math.random() * (70 - size))
        return { zoneSize: size, zoneStart: start }
    }, [difficulty])

    const requestRef = useRef()
    const startTimeRef = useRef()

    const animate = useCallback(time => {
        if (gameState !== 'playing') return
        if (!startTimeRef.current) startTimeRef.current = time

        const progress = (time - startTimeRef.current) / 1000
        const newPos = (Math.sin(progress * speed) + 1) * 50 // Oscilla between 0 and 100

        setPosition(newPos)
        requestRef.current = requestAnimationFrame(animate)
    }, [gameState, speed])

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(requestRef.current)
    }, [animate])

    const handleAction = useCallback(() => {
        if (gameState !== 'playing') return

        const isSuccess = position >= zoneStart && position <= (zoneStart + zoneSize)
        setGameState(isSuccess ? 'win' : 'lose')

        onFinish(isSuccess ? 1 : 0)
    }, [gameState, position, zoneStart, zoneSize, onFinish])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                handleAction()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleAction])

    return (
        <div className="bg-zinc-900 border-2 border-bardo-accent p-12 flex flex-col items-center justify-center gap-10 shadow-2xl" onClick={handleAction}>
            <h2 className="text-3xl font-bold text-bardo-accent tracking-widest uppercase">Precision Unlock</h2>

            <div className="relative w-full h-12 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                {/* Sweet Spot */}
                <div
                    className="absolute h-full bg-bardo-accent/40"
                    style={{
                        left: `${zoneStart}%`,
                        width: `${zoneSize}%`,
                        boxShadow: '0 0 20px color-mix(in srgb, var(--bardo-accent) 40%, transparent)'
                    }}
                />

                {/* Needle */}
                <motion.div
                    className="absolute top-0 bottom-0 w-1 bg-bardo-accent z-20"
                    animate={{ left: `${position}%` }}
                    transition={{ type: 'tween', ease: 'linear', duration: 0 }}
                />
            </div>

            <div className="flex flex-col items-center gap-2">
                <p className="text-gray-400 font-mono text-center">
                    {gameState === 'playing' ? (
                        <>CLICK or <span className="text-bardo-accent">SPACE</span> when needle enters zone</>
                    ) : gameState === 'win' ? (
                        <span className="text-green-500 font-bold text-2xl">✓ UNLOCKED</span>
                    ) : (
                        <span className="text-red-500 font-bold text-2xl animate-pulse">FAILED</span>
                    )}
                </p>

                <div className="w-full flex justify-between px-2 text-[10px] text-zinc-600 font-mono">
                    <span>LOCKED</span>
                    <span>ENGAGED</span>
                </div>
            </div>
        </div>
    )
}
