import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AchievementToast - Animated notification for unlocked achievements
 * Slides in from top, auto-dismisses after 4 seconds
 * 
 * FIX: Uses key-based remounting to ensure each new achievement triggers animation
 */
export default function AchievementToast({ achievement, onDismiss, playSound }) {
    const [isVisible, setIsVisible] = useState(false)
    const [displayedAchievement, setDisplayedAchievement] = useState(null)
    const timerRef = useRef(null)

    // Handle new achievement arriving
    useEffect(() => {
        if (!achievement) {
            // No achievement pending
            return
        }

        // New achievement arrived - show it!
        console.log('[AchievementToast] New achievement:', achievement.id)

        // Clear any existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        // Set the achievement to display and make visible
        setDisplayedAchievement(achievement)
        setIsVisible(true)

        // Play unlock sound
        if (playSound) {
            playSound('achievement_unlock')
        }

        // Auto-dismiss after 4 seconds
        timerRef.current = setTimeout(() => {
            setIsVisible(false)
        }, 4000)

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [achievement?.id, playSound]) // Key change: depend on achievement.id, not achievement object

    // Call onDismiss after exit animation completes
    const handleExitComplete = () => {
        console.log('[AchievementToast] Exit complete, clearing toast')
        setDisplayedAchievement(null)
        if (onDismiss) onDismiss()
    }

    // Don't render if no achievement to display
    if (!displayedAchievement) return null

    return (
        <AnimatePresence onExitComplete={handleExitComplete}>
            {isVisible && (
                <motion.div
                    key={displayedAchievement.id} // Force remount for each unique achievement
                    className="fixed top-4 left-1/2 z-[9999] pointer-events-auto"
                    initial={{ opacity: 0, y: -100, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    <div
                        className="flex items-center gap-4 px-6 py-4 rounded-lg border-2 border-bardo-accent/60
                                   bg-bardo-accent/20 backdrop-blur-sm
                                   shadow-lg cursor-pointer"
                        onClick={() => setIsVisible(false)}
                    >
                        {/* Achievement Icon */}
                        <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center
                                        bg-bardo-accent/20 rounded-full border border-bardo-accent/40">
                            <span className="text-3xl">{displayedAchievement.icon || '🏆'}</span>
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col">
                            <span className="text-xs text-bardo-accent font-semibold uppercase tracking-wider">
                                ¡Logro Desbloqueado!
                            </span>
                            <span className="text-lg text-bardo-text font-bold">
                                {displayedAchievement.title}
                            </span>
                            <span className="text-sm text-bardo-text/70">
                                {displayedAchievement.description}
                            </span>
                        </div>

                        {/* Glow effect */}
                        <motion.div
                            className="absolute inset-0 rounded-lg bg-bardo-accent/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: 1.5, repeat: 2 }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
