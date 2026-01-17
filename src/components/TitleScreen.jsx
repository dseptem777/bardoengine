import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * TitleScreen - Game title screen with background and "Press to start"
 * Configurable background image/video, title animation, and optional music
 * Set hideTitle=true when the background image already contains the title
 */
export default function TitleScreen({
    gameTitle = 'BardoEngine',
    subtitle = null,
    backgroundImage = null,
    backgroundVideo = null,
    hideTitle = false,
    onStart,
    showPressToStart = true
}) {
    const [isVisible, setIsVisible] = useState(true)
    const [isFadingOut, setIsFadingOut] = useState(false)
    const [isReady, setIsReady] = useState(false)

    // Delay before showing "press to start"
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    // Handle start
    const handleStart = useCallback(() => {
        if (!isReady || isFadingOut) return
        setIsFadingOut(true)
    }, [isReady, isFadingOut])

    // Complete after fade out
    useEffect(() => {
        if (isFadingOut) {
            const fadeTimer = setTimeout(() => {
                setIsVisible(false)
                onStart?.()
            }, 500)

            return () => clearTimeout(fadeTimer)
        }
    }, [isFadingOut, onStart])

    // Keyboard handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Any key starts (except modifier keys)
            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                handleStart()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleStart])

    if (!isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 bg-bardo-bg flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                onClick={handleStart}
                initial={{ opacity: 0 }}
                animate={{ opacity: isFadingOut ? 0 : 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Background Video */}
                {backgroundVideo && (
                    <video
                        src={backgroundVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                )}

                {/* Background Image */}
                {backgroundImage && !backgroundVideo && (
                    <div
                        className={`absolute inset-0 bg-cover bg-center ${hideTitle ? 'opacity-100' : 'opacity-30'}`}
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                )}

                {/* Default gradient background if no custom bg */}
                {!backgroundImage && !backgroundVideo && (
                    <div className="absolute inset-0 bg-gradient-radial from-bardo-accent/10 via-transparent to-transparent" />
                )}

                {/* Scanlines overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                    }}
                />

                {/* CRT vignette */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.5) 100%)'
                    }}
                />

                {/* Content */}
                <div className={`relative z-10 flex flex-col items-center gap-8 ${hideTitle ? 'justify-end h-full pb-16' : ''}`}>
                    {/* Game Title - hidden when background has title */}
                    {!hideTitle && (
                        <motion.h1
                            className="text-5xl md:text-7xl lg:text-8xl font-bold text-bardo-accent text-center tracking-wider"
                            style={{
                                textShadow: '0 0 40px rgba(250, 204, 21, 0.6), 0 0 80px rgba(250, 204, 21, 0.3)'
                            }}
                            initial={{ opacity: 0, y: -30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {gameTitle}
                        </motion.h1>
                    )}

                    {/* Subtitle - hidden when hideTitle is true */}
                    {!hideTitle && subtitle && (
                        <motion.p
                            className="text-xl md:text-2xl text-gray-400 text-center tracking-wide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    {/* Press to Start */}
                    {showPressToStart && isReady && (
                        <motion.p
                            className={`text-lg md:text-xl tracking-[0.15em] ${hideTitle ? 'text-white/90 bg-black/60 px-6 py-3 rounded' : 'text-bardo-accent/80 mt-12'}`}
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
                </div>

                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-bardo-accent/30" />
                <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-bardo-accent/30" />
                <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-bardo-accent/30" />
                <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-bardo-accent/30" />
            </motion.div>
        </AnimatePresence>
    )
}
