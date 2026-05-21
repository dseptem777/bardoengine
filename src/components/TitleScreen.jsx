import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile, useIsPortrait } from '../hooks/useMediaQuery'
import ImageZoomViewer from './ImageZoomViewer'

/**
 * TitleScreen - Game title screen with background and "Press to start"
 * Configurable background image/video, title animation, and optional music.
 * Set hideTitle=true when the background image already contains the title.
 *
 * Portrait mobile layout: image as top hero band (~55vh, object-contain),
 * text panel below — no overlap. Desktop/landscape: fullscreen overlay (unchanged).
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
    const [zoomOpen, setZoomOpen] = useState(false)

    const isMobile = useIsMobile()
    const isPortrait = useIsPortrait()
    const usePortraitLayout = isMobile && isPortrait && !!backgroundImage

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
            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                handleStart()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleStart])

    if (!isVisible) return null

    // ─── Portrait layout ──────────────────────────────────────────────────────
    if (usePortraitLayout) {
        return (
            <>
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
                        style={{ backgroundColor: 'var(--bardo-bg, #0a0a0a)' }}
                        onClick={handleStart}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isFadingOut ? 0 : 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Hero image band — top ~55vh, object-contain, no crop */}
                        <div
                            className="relative flex-shrink-0 overflow-hidden cursor-pointer"
                            style={{ height: '55vh' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!isFadingOut) setZoomOpen(true)
                            }}
                        >
                            <img
                                src={backgroundImage}
                                alt={gameTitle}
                                className="w-full h-full object-contain"
                                style={{ display: 'block', backgroundColor: 'var(--bardo-bg, #0a0a0a)' }}
                            />
                            {/* Rain overlay */}
                            <div className="absolute inset-0 pointer-events-none z-[5] title-rain" />
                            <div className="absolute inset-0 pointer-events-none z-[5] title-rain title-rain-delay" />
                            {/* Scanlines */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-10"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                                }}
                            />
                            {/* Expand icon */}
                            <button
                                className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/50 rounded text-white/70 hover:text-white hover:bg-black/80 transition-colors"
                                aria-label="Ver imagen completa"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (!isFadingOut) setZoomOpen(true)
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            </button>
                        </div>

                        {/* Text panel — remaining ~45vh */}
                        <div
                            className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-4 relative"
                            style={{ backgroundColor: 'var(--bardo-bg, #0a0a0a)' }}
                        >
                            {/* Top separator line */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-bardo-accent/20" />

                            {!hideTitle && (
                                <motion.h1
                                    className="text-3xl sm:text-5xl font-bold text-bardo-accent text-center leading-tight tracking-tight accent-text-shadow-title"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                >
                                    {gameTitle}
                                </motion.h1>
                            )}

                            {!hideTitle && subtitle && (
                                <motion.p
                                    className="text-base sm:text-lg text-gray-400 text-center tracking-wide"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    {subtitle}
                                </motion.p>
                            )}

                            {showPressToStart && isReady && (
                                <motion.p
                                    className={`mt-4 text-sm tracking-[0.15em] ${hideTitle ? 'text-white/90 bg-black/60 px-4 py-2 rounded' : 'text-bardo-accent/80'}`}
                                    style={{
                                        paddingBottom: 'max(0px, env(safe-area-inset-bottom, 0px))'
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    PRESIONA UNA TECLA PARA CONTINUAR
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <ImageZoomViewer
                    isOpen={zoomOpen}
                    src={backgroundImage}
                    alt={gameTitle}
                    onClose={() => setZoomOpen(false)}
                />
            </>
        )
    }

    // ─── Desktop / landscape layout (original) ────────────────────────────────
    return (
        <>
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

                    {/* Rain overlay */}
                    {backgroundImage && (
                        <>
                            <div className="absolute inset-0 pointer-events-none z-[5] title-rain" />
                            <div className="absolute inset-0 pointer-events-none z-[5] title-rain title-rain-delay" />
                        </>
                    )}

                    {/* Content - Title only */}
                    <div className={`relative z-10 flex flex-col items-center gap-8 ${hideTitle ? 'justify-end h-full pb-32' : backgroundImage ? 'mb-auto mt-[68vh]' : ''}`}>
                        {!hideTitle && (
                            <motion.h1
                                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-bardo-accent text-center leading-tight tracking-tight accent-text-shadow-title"
                                initial={{ opacity: 0, y: -30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            >
                                {gameTitle}
                            </motion.h1>
                        )}

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
                    </div>

                    {/* Press to Start — absolutely positioned */}
                    {showPressToStart && isReady && (
                        <motion.p
                            className={`absolute left-1/2 -translate-x-1/2 z-20 text-lg md:text-xl tracking-[0.15em] ${hideTitle ? 'text-white/90 bg-black/60 px-6 py-3 rounded' : 'text-bardo-accent/80'}`}
                            style={{
                                bottom: 'max(4rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            PRESIONA UNA TECLA PARA CONTINUAR
                        </motion.p>
                    )}

                    {/* Decorative corners — hidden when background image is present */}
                    {!backgroundImage && <>
                        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-bardo-accent/30" />
                        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-bardo-accent/30" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-bardo-accent/30" />
                        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-bardo-accent/30" />
                    </>}

                    {/* Zoom icon on desktop image — bottom-right corner */}
                    {backgroundImage && !backgroundVideo && (
                        <button
                            className="absolute bottom-20 right-4 z-20 w-9 h-9 flex items-center justify-center bg-black/50 rounded text-white/50 hover:text-white hover:bg-black/80 transition-colors"
                            aria-label="Ver imagen completa"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!isFadingOut) setZoomOpen(true)
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                            </svg>
                        </button>
                    )}
                </motion.div>
            </AnimatePresence>

            {backgroundImage && (
                <ImageZoomViewer
                    isOpen={zoomOpen}
                    src={backgroundImage}
                    alt={gameTitle}
                    onClose={() => setZoomOpen(false)}
                />
            )}
        </>
    )
}
