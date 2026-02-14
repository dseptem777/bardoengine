import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * WillpowerMeter - Non-blocking Willpower UI (LEFT SIDE VERTICAL)
 * 
 * REBALANCED for human playability:
 * - Decay is slower
 * - Boost per press is more generous
 * - Still challenging but winnable
 */

// Decay rates per second - REDUCED for playability
const DECAY_RATES = {
    slow: 2,       // 2% per second
    normal: 4.5,   // 4.5% per second (slightly harder than original 4)
    fast: 8,       // 8% per second (harder than original 7)
    extreme: 14    // 14% per second (very hard)
}

// Boost amount per keypress - BALANCED for challenge
const BOOST_AMOUNTS = {
    slow: 8,       // Generous
    normal: 6,     // Original standard
    fast: 4,       // Original standard
    extreme: 2.5   // Tighter than original
}

export default function WillpowerMeter({
    active,
    initialValue = 100,
    decayRate = 'normal',
    targetKey = 'V',
    onValueChange,
    position = 'left'
}) {
    const [value, setValue] = useState(initialValue)
    const [isStraining, setIsStraining] = useState(false)
    const [pulseKey, setPulseKey] = useState(0)
    const [mashCount, setMashCount] = useState(0)
    const intervalRef = useRef(null)

    // Get difficulty-scaled values
    const rate = typeof decayRate === 'number' ? decayRate : DECAY_RATES[decayRate] || DECAY_RATES.normal
    const boost = BOOST_AMOUNTS[decayRate] || BOOST_AMOUNTS.normal

    // Reset value when becoming active
    useEffect(() => {
        if (active) {
            setValue(initialValue)
            setMashCount(0)
        }
    }, [active, initialValue])

    // Decay timer - runs every 100ms
    useEffect(() => {
        if (!active) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return
        }

        intervalRef.current = setInterval(() => {
            setValue(prev => {
                const newVal = Math.max(0, prev - (rate / 10))  // /10 because we run every 100ms
                if (onValueChange) onValueChange(newVal)
                return newVal
            })
        }, 100)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [active, rate, onValueChange])

    // Key handler
    useEffect(() => {
        if (!active) return

        const handleKeyDown = (e) => {
            if (e.key.toUpperCase() === targetKey.toUpperCase()) {
                e.preventDefault()

                // Boost willpower
                setValue(prev => {
                    const newVal = Math.min(100, prev + boost)
                    if (onValueChange) onValueChange(newVal)
                    return newVal
                })

                setMashCount(prev => prev + 1)
                setPulseKey(prev => prev + 1)
                setIsStraining(true)
                setTimeout(() => setIsStraining(false), 100)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [active, targetKey, boost, onValueChange])

    if (!active) return null

    const isLow = value < 30
    const isCritical = value < 15
    const barColor = isCritical
        ? 'bg-red-600'
        : isLow
            ? 'bg-orange-500'
            : 'bg-emerald-500'

    const glowColor = isCritical
        ? 'rgba(220, 38, 38, 0.6)'
        : isLow
            ? 'rgba(249, 115, 22, 0.4)'
            : 'rgba(16, 185, 129, 0.3)'

    const difficultyLabel = {
        slow: 'FÁCIL',
        normal: 'NORMAL',
        fast: 'INTENSO',
        extreme: 'DIFÍCIL'
    }[decayRate] || ''

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: position === 'left' ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: position === 'left' ? -100 : 100 }}
                className={`fixed top-1/2 -translate-y-1/2 z-[60] ${position === 'left' ? 'left-4' : 'right-4'
                    }`}
            >
                <div
                    className="bg-black/90 backdrop-blur-md border border-red-900/50 rounded-lg p-3 flex flex-col items-center gap-2"
                    style={{
                        boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.5)`,
                        width: '80px'
                    }}
                >
                    <span className={`font-mono text-[10px] uppercase tracking-wider text-center ${isCritical ? 'text-red-400 animate-pulse' : 'text-red-300'
                        }`}>
                        {isCritical ? '¡CEDÉS!' : isLow ? '¡LUCHÁ!' : 'VOLUNTAD'}
                    </span>

                    <div
                        className="w-8 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700 relative"
                        style={{ height: '180px' }}
                    >
                        <motion.div
                            className={`absolute bottom-0 left-0 right-0 ${barColor} transition-colors duration-300`}
                            initial={{ height: '100%' }}
                            animate={{
                                height: `${value}%`,
                                boxShadow: isStraining
                                    ? `0 0 20px ${glowColor}`
                                    : `0 0 10px ${glowColor}`
                            }}
                            transition={{ type: 'tween', duration: 0.05 }}
                        />
                    </div>

                    <span className={`font-mono text-lg font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-white'
                        }`}>
                        {Math.round(value)}%
                    </span>

                    <motion.div
                        key={pulseKey}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold text-xl ${isStraining
                            ? 'bg-red-600 border-red-400 text-white scale-110'
                            : 'bg-zinc-800 border-red-900/50 text-red-400'
                            }`}
                        animate={isStraining ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.1 }}
                    >
                        {targetKey}
                    </motion.div>

                    <span className="text-zinc-600 text-[10px] font-mono">
                        ×{mashCount}
                    </span>

                    {difficultyLabel && (
                        <span className={`text-[8px] font-mono uppercase ${decayRate === 'extreme' ? 'text-red-500' :
                            decayRate === 'fast' ? 'text-orange-500' :
                                decayRate === 'normal' ? 'text-yellow-500' :
                                    'text-green-500'
                            }`}>
                            {difficultyLabel}
                        </span>
                    )}

                    {isCritical && (
                        <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-red-500 pointer-events-none"
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        />
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
