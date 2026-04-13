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
    const positionRef = useRef(0)

    const animate = useCallback(time => {
        if (gameState !== 'playing') return
        if (!startTimeRef.current) startTimeRef.current = time

        const progress = (time - startTimeRef.current) / 1000
        const newPos = (Math.sin(progress * speed) + 1) * 50 // Oscilla between 0 and 100

        positionRef.current = newPos
        setPosition(newPos)
        requestRef.current = requestAnimationFrame(animate)
    }, [gameState, speed])

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(requestRef.current)
    }, [animate])

    const handleAction = useCallback(() => {
        if (gameState !== 'playing') return

        const currentPos = positionRef.current
        const isSuccess = currentPos >= zoneStart && currentPos <= (zoneStart + zoneSize)
        setGameState(isSuccess ? 'win' : 'lose')

        onFinish(isSuccess ? 1 : 0)
    }, [gameState, zoneStart, zoneSize, onFinish])

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
            <h2 className="text-3xl font-bold text-bardo-accent tracking-widest uppercase">GANZÚA DE PRECISIÓN</h2>

            <div className="relative w-full h-12 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                {/* Sweet Spot */}
                <div
                    className="absolute h-full bg-bardo-accent/40 accent-box-shadow-40"
                    style={{
                        left: `${zoneStart}%`,
                        width: `${zoneSize}%`,
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
                        <>CLICK o <span className="text-bardo-accent">ESPACIO</span> cuando la aguja entre en la zona</>
                    ) : gameState === 'win' ? (
                        <span className="text-green-500 font-bold text-2xl">✓ ¡DESBLOQUEADO!</span>
                    ) : (
                        <span className="text-red-500 font-bold text-2xl animate-pulse"><span className="lockpick-fail-icon">✗ </span>FALLIDO</span>
                    )}
                </p>

                <div className="w-full flex justify-between px-2 text-[10px] text-zinc-600 font-mono">
                    <span>CERRADO</span>
                    <span>TRABADO</span>
                </div>
            </div>
        </div>
    )
}
