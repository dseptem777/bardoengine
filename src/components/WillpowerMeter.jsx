import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * WillpowerMeter - Non-blocking Willpower UI (LEFT SIDE VERTICAL)
 *
 * Pure display component. The decay loop lives in useWillpowerSystem (rAF-based).
 * This component only handles:
 *   - Rendering the current `value` prop
 *   - Keydown boost: calls updateValue with a clamped increment
 */

// Boost amount per keypress — per-difficulty tuning (decay rates live in the hook)
const BOOST_AMOUNTS = {
    slow: 8,       // Generous
    normal: 6,     // Standard
    fast: 4,       // Tighter
    extreme: 2.5   // Very tight
}

export default function WillpowerMeter({
    active,
    value = 100,          // canonical value from hook state
    decayRate = 'normal',
    targetKey = 'V',
    boostValue,           // hook action: boostValue(delta) — reads valueRef to avoid stale captures
    position = 'left'
}) {
    const [isStraining, setIsStraining] = useState(false)
    const [pulseKey, setPulseKey] = useState(0)
    const [mashCount, setMashCount] = useState(0)

    // Reset mash counter when becoming active
    useEffect(() => {
        if (active) setMashCount(0)
    }, [active])

    const boost = BOOST_AMOUNTS[decayRate] ?? BOOST_AMOUNTS.normal

    // Key handler — boosts willpower; hook's rAF loop handles decay
    useEffect(() => {
        if (!active) return

        const handleKeyDown = (e) => {
            if (e.key.toUpperCase() === targetKey.toUpperCase()) {
                e.preventDefault()

                if (boostValue) {
                    boostValue(boost)
                }

                setMashCount(prev => prev + 1)
                setPulseKey(prev => prev + 1)
                setIsStraining(true)
                setTimeout(() => setIsStraining(false), 100)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [active, targetKey, boost, boostValue])

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
                        <span className={`text-[10px] font-mono uppercase ${decayRate === 'extreme' ? 'text-red-500' :
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
