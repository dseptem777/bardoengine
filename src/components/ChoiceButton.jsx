import { motion, useAnimation } from 'framer-motion'
import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle, useRef } from 'react'

/**
 * ChoiceButton - Interactive story choice with resistance mechanic
 * 
 * Supports both mouse clicks and keyboard resistance (via simulateClick).
 */

// Resistance ranges by difficulty level
const RESISTANCE_RANGES = {
    slow: { min: 3, max: 5 },
    normal: { min: 5, max: 8 },
    fast: { min: 7, max: 12 },
    extreme: { min: 10, max: 18 }
}

const ChoiceButton = forwardRef(function ChoiceButton({
    text,
    index,
    onClick,
    disabled = false,
    resistanceLevel = 'none',
    onResistanceClick
}, ref) {
    const [isReady, setIsReady] = useState(false)
    const [clicksRemaining, setClicksRemaining] = useState(0)
    const [totalClicks, setTotalClicks] = useState(0)
    const [isStruggling, setIsStruggling] = useState(false)
    const clicksRemainingRef = useRef(0)
    const choiceProcessedRef = useRef(false) // Prevent double submit

    const controls = useAnimation()

    // Calculate random resistance on mount
    const initialResistance = useMemo(() => {
        if (resistanceLevel === 'none' || !resistanceLevel) return 0
        const range = RESISTANCE_RANGES[resistanceLevel] || RESISTANCE_RANGES.normal
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    }, [resistanceLevel])

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 150)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        setClicksRemaining(initialResistance)
        setTotalClicks(initialResistance)
        clicksRemainingRef.current = initialResistance
        choiceProcessedRef.current = false
    }, [initialResistance])

    // Struggle animation
    const triggerStruggle = useCallback(() => {
        setIsStruggling(true)

        const intensity = Math.max(3, 8 - (clicksRemaining * 0.5))
        controls.start({
            x: [0, -intensity, intensity, -intensity / 2, intensity / 2, 0],
            transition: { duration: 0.2 }
        })

        setTimeout(() => setIsStruggling(false), 200)
    }, [controls, clicksRemaining])

    // Core click handler
    const processClick = useCallback(() => {
        if (!isReady || disabled || choiceProcessedRef.current) return false

        if (clicksRemainingRef.current > 0) {
            clicksRemainingRef.current -= 1
            setClicksRemaining(clicksRemainingRef.current)

            triggerStruggle()

            if (onResistanceClick) {
                onResistanceClick(clicksRemainingRef.current)
            }

            if (clicksRemainingRef.current === 0) {
                choiceProcessedRef.current = true
                console.log('[ChoiceButton] Resistance broken - selecting')
                // Small delay so user sees the 0 / final snap
                setTimeout(() => onClick(), 50)
            }
            return true  // Click was processed but not yet complete
        }

        // Already 0 resistance
        choiceProcessedRef.current = true
        onClick()
        return true  // Click complete
    }, [isReady, disabled, triggerStruggle, onResistanceClick, onClick])

    // Expose simulateClick for keyboard navigation
    useImperativeHandle(ref, () => ({
        simulateClick: () => {
            return processClick()
        },
        getClicksRemaining: () => clicksRemaining
    }), [processClick, clicksRemaining])

    const handleClick = () => {
        processClick()
    }

    const hasResistance = initialResistance > 0 && clicksRemaining > 0
    const resistanceProgress = totalClicks > 0 ? 1 - (clicksRemaining / totalClicks) : 1
    const isAlmostDone = clicksRemaining <= 2 && hasResistance

    return (
        <motion.button
            data-choice-index={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{
                opacity: 1,
                x: 0,
                scale: isStruggling ? 0.97 : 1,
            }}
            transition={{ delay: index * 0.1 }}
            onClick={handleClick}
            disabled={disabled}
            className={`choice-button w-full text-left p-4 md:p-5 relative overflow-hidden
                 rounded-lg border-2 transition-all duration-200
                 ${disabled
                    ? 'bg-gray-900/50 border-gray-700 cursor-not-allowed opacity-50 grayscale'
                    : hasResistance
                        ? `bg-bardo-bg cursor-pointer group ${isAlmostDone
                            ? 'border-orange-500/60'
                            : 'border-red-700/40'
                        }`
                        : 'bg-bardo-bg border-bardo-accent/40 hover:border-bardo-accent hover:bg-bardo-accent/10 active:scale-[0.98] group glow-hover'
                }
                 ${!isReady ? 'pointer-events-none' : ''}`}
            style={hasResistance ? {
                boxShadow: isStruggling
                    ? '0 0 20px rgba(239, 68, 68, 0.4)'
                    : 'none'
            } : undefined}
        >
            {hasResistance && (
                <motion.div
                    className={`absolute inset-0 pointer-events-none ${isAlmostDone ? 'bg-orange-900/30' : 'bg-red-900/20'
                        }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: resistanceProgress }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ type: 'spring', damping: 15 }}
                />
            )}

            {isStruggling && (
                <motion.div
                    className="absolute inset-0 bg-red-500/30 pointer-events-none"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />
            )}

            <motion.div animate={controls} className="relative z-10 flex items-center">
                <span className={`font-mono mr-3 opacity-60 ${disabled
                    ? 'text-gray-500'
                    : hasResistance
                        ? 'text-red-400 group-hover:opacity-100'
                        : 'text-bardo-accent group-hover:opacity-100'
                    }`}>
                    [{index + 1}]
                </span>
                <span className={`font-narrative text-lg flex-1 ${disabled
                    ? 'text-gray-500 line-through decoration-gray-600'
                    : hasResistance
                        ? 'text-bardo-text/80'
                        : 'text-bardo-text group-hover:text-bardo-accent'
                    } transition-colors`}>
                    {text}
                </span>

                {hasResistance && (
                    <div className="ml-3 flex items-center gap-1">
                        <div className="flex gap-0.5">
                            {Array.from({ length: Math.min(totalClicks, 8) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i < (totalClicks - clicksRemaining)
                                        ? 'bg-red-500'
                                        : 'bg-red-900/50'
                                        }`}
                                />
                            ))}
                            {totalClicks > 8 && (
                                <span className="text-red-400/50 text-xs ml-1">+{totalClicks - 8}</span>
                            )}
                        </div>
                        <span className={`font-mono text-sm ml-2 ${isAlmostDone ? 'text-orange-400' : 'text-red-400/60'
                            }`}>
                            {clicksRemaining}
                        </span>
                    </div>
                )}
            </motion.div>
        </motion.button>
    )
})

export default ChoiceButton
