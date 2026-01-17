import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BardoEngineLogo from './BardoEngineLogo'

/**
 * EngineLogoScreen - "Powered by BardoEngine" splash screen
 * Shows for ~3 seconds, can be skipped with click/key
 */
export default function EngineLogoScreen({
    duration = 3000,
    onComplete,
    skipEnabled = true
}) {
    const [isVisible, setIsVisible] = useState(true)
    const [isFadingOut, setIsFadingOut] = useState(false)

    // Handle skip (click or key)
    const handleSkip = useCallback(() => {
        if (!skipEnabled || isFadingOut) return
        setIsFadingOut(true)
    }, [skipEnabled, isFadingOut])

    // Auto-advance after duration
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFadingOut(true)
        }, duration)

        return () => clearTimeout(timer)
    }, [duration])

    // Call onComplete after fade out
    useEffect(() => {
        if (isFadingOut) {
            const fadeTimer = setTimeout(() => {
                setIsVisible(false)
                onComplete?.()
            }, 500) // Fade out duration

            return () => clearTimeout(fadeTimer)
        }
    }, [isFadingOut, onComplete])

    // Keyboard skip
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                handleSkip()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleSkip])

    if (!isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 bg-bardo-bg flex flex-col items-center justify-center cursor-pointer"
                onClick={handleSkip}
                initial={{ opacity: 0 }}
                animate={{ opacity: isFadingOut ? 0 : 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Scanlines overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                    }}
                />

                {/* CRT vignette effect */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%)'
                    }}
                />

                {/* Logo */}
                <BardoEngineLogo
                    size={180}
                    animated={true}
                    showText={true}
                />

                {/* "Impulsado por" text */}
                <motion.p
                    className="text-gray-500 text-sm mt-8 tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                >
                    Motor de narrativa interactiva
                </motion.p>

                {/* Skip hint */}
                {skipEnabled && (
                    <motion.p
                        className="absolute bottom-8 text-gray-600 text-xs tracking-wider"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                    >
                        Click o presiona cualquier tecla para continuar
                    </motion.p>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
