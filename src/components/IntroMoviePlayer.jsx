import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * IntroMoviePlayer - Full-screen video player for intro movies
 * Supports .mp4/.webm, can be skipped with click/key
 * If no video provided or video fails to load, auto-completes immediately
 */
export default function IntroMoviePlayer({
    videoSrc = null,
    onComplete,
    skipEnabled = true
}) {
    const videoRef = useRef(null)
    const [isVisible, setIsVisible] = useState(true)
    const [isFadingOut, setIsFadingOut] = useState(false)
    const [showSkipHint, setShowSkipHint] = useState(false)

    // If no video source, complete immediately
    useEffect(() => {
        if (!videoSrc) {
            onComplete?.()
        }
    }, [videoSrc, onComplete])

    // Show skip hint after a brief delay
    useEffect(() => {
        if (!videoSrc) return

        const timer = setTimeout(() => {
            setShowSkipHint(true)
        }, 1500)

        return () => clearTimeout(timer)
    }, [videoSrc])

    // Handle skip
    const handleSkip = useCallback(() => {
        if (!skipEnabled || isFadingOut) return
        setIsFadingOut(true)
    }, [skipEnabled, isFadingOut])

    // Handle video end
    const handleVideoEnd = useCallback(() => {
        setIsFadingOut(true)
    }, [])

    // Handle video error (skip to next screen)
    const handleVideoError = useCallback(() => {
        console.warn('IntroMoviePlayer: Video failed to load, skipping...')
        onComplete?.()
    }, [onComplete])

    // Complete after fade out
    useEffect(() => {
        if (isFadingOut) {
            const fadeTimer = setTimeout(() => {
                setIsVisible(false)
                onComplete?.()
            }, 500)

            return () => clearTimeout(fadeTimer)
        }
    }, [isFadingOut, onComplete])

    // Keyboard skip
    useEffect(() => {
        if (!videoSrc) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                handleSkip()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [videoSrc, handleSkip])

    // Don't render if no video
    if (!videoSrc || !isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
                onClick={handleSkip}
                initial={{ opacity: 0 }}
                animate={{ opacity: isFadingOut ? 0 : 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Video */}
                <video
                    ref={videoRef}
                    src={videoSrc}
                    autoPlay
                    playsInline
                    muted={false}
                    onEnded={handleVideoEnd}
                    onError={handleVideoError}
                    className="w-full h-full object-contain"
                />

                {/* Skip hint */}
                {skipEnabled && showSkipHint && (
                    <motion.div
                        className="absolute bottom-8 right-8 bg-black/50 px-4 py-2 rounded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-white text-sm tracking-wider">
                            Click o ESC para saltar
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
