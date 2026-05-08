import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ChapterBreakOverlay - Fullscreen chapter title card shown between story chapters.
 * Triggered by CHAPTER_BREAK Ink tag. Displays image, title, subtitle.
 * Dismissed by click or keypress (with 1200ms anti-skip delay).
 */
export default function ChapterBreakOverlay({
    isOpen = false,
    title = '',
    subtitle = null,
    image = null,
    onDismiss,
}) {
    const [isFadingOut, setIsFadingOut] = useState(false)
    const [isReady, setIsReady] = useState(false)

    // 1200ms delay before accepting input (prevent accidental skip)
    useEffect(() => {
        if (!isOpen) {
            setIsReady(false)
            setIsFadingOut(false)
            return
        }
        const timer = setTimeout(() => setIsReady(true), 1200)
        return () => clearTimeout(timer)
    }, [isOpen])

    const handleDismiss = useCallback(() => {
        if (!isReady || isFadingOut) return
        setIsFadingOut(true)
    }, [isReady, isFadingOut])

    // Complete after content fade out
    useEffect(() => {
        if (isFadingOut) {
            const fadeTimer = setTimeout(() => {
                onDismiss?.()
            }, 500)
            return () => clearTimeout(fadeTimer)
        }
    }, [isFadingOut, onDismiss])

    // Keyboard handler — ignore held keys (e.repeat) to prevent skip-through
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.repeat) return
            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                handleDismiss()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleDismiss])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="chapter-break"
                    className={`fixed inset-0 z-[900] bardo-overlay-bg flex flex-col items-center justify-center overflow-hidden ${isFadingOut ? 'pointer-events-none' : 'cursor-pointer'}`}
                    onClick={handleDismiss}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                >
                    {/* Content wrapper — only this fades on dismiss, bg stays solid */}
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        animate={{ opacity: isFadingOut ? 0 : 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Background Image — full opacity, image is the star */}
                        {image && (
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${image})` }}
                            />
                        )}

                        {/* Default gradient background if no image */}
                        {!image && (
                            <div className="absolute inset-0 bg-gradient-radial from-bardo-accent/10 via-transparent to-transparent" />
                        )}

                        {/* Subtle vignette on edges only */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.6) 100%)'
                            }}
                        />

                        {/* Text backdrop — localized gradient behind text for readability */}
                        {image && (
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.7) 55%, transparent 80%)'
                                }}
                            />
                        )}

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            {/* Subtitle (above title) */}
                            {subtitle && (
                                <motion.p
                                    className="text-sm md:text-base uppercase tracking-[0.2em] text-gray-300"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    {subtitle}
                                </motion.p>
                            )}

                            {/* Title */}
                            <motion.h1
                                className="text-4xl md:text-6xl lg:text-7xl font-bold text-bardo-accent text-center tracking-wider accent-text-shadow-title"
                                initial={{ opacity: 0, y: -30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {title}
                            </motion.h1>

                            {/* Decorative line under title */}
                            <motion.div
                                className="w-32 h-[2px] bg-bardo-accent/40"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            />
                        </div>

                        {/* Press to continue */}
                        {isReady && (
                            <motion.p
                                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-lg md:text-xl tracking-[0.15em] text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                PRESIONA UNA TECLA PARA CONTINUAR
                            </motion.p>
                        )}

                        {/* Decorative corners — hidden when background image is present */}
                        {!image && <>
                            <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-bardo-accent/30" />
                            <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-bardo-accent/30" />
                            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-bardo-accent/30" />
                            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-bardo-accent/30" />
                        </>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
