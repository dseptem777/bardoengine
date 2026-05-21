import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile, useIsPortrait } from '../hooks/useMediaQuery'
import ImageZoomViewer from './ImageZoomViewer'

/**
 * ChapterBreakOverlay - Fullscreen chapter title card shown between story chapters.
 * Triggered by CHAPTER_BREAK Ink tag. Displays image, title, subtitle.
 * Dismissed by click or keypress (with 1200ms anti-skip delay).
 *
 * Portrait mobile layout: image as top banner (~45vh, object-contain),
 * text/quote in bottom panel — no crop, no overlap.
 */
export default function ChapterBreakOverlay({
    isOpen = false,
    title = '',
    subtitle = null,
    image = null,
    onDismiss
}) {
    const [isFadingOut, setIsFadingOut] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [zoomOpen, setZoomOpen] = useState(false)

    const isMobile = useIsMobile()
    const isPortrait = useIsPortrait()
    const usePortraitLayout = isMobile && isPortrait && !!image

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
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chapter-break"
                        className={`fixed inset-0 z-[900] bg-bardo-bg overflow-hidden ${isFadingOut ? 'pointer-events-none' : 'cursor-pointer'}`}
                        onClick={usePortraitLayout ? undefined : handleDismiss}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0 } }}
                    >
                        {/* Content wrapper — only this fades on dismiss */}
                        <motion.div
                            className={`absolute inset-0 ${usePortraitLayout ? 'flex flex-col' : 'flex flex-col items-center justify-center'}`}
                            animate={{ opacity: isFadingOut ? 0 : 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* ── Portrait layout ── */}
                            {usePortraitLayout ? (
                                <>
                                    {/* Image banner — top ~45vh, object-contain */}
                                    <div
                                        className="relative flex-shrink-0 overflow-hidden"
                                        style={{ height: '45vh', backgroundColor: 'var(--bardo-bg, #0a0a0a)' }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (!isFadingOut) setZoomOpen(true)
                                        }}
                                    >
                                        <img
                                            src={image}
                                            alt={title}
                                            className="w-full h-full object-contain"
                                            style={{ display: 'block' }}
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

                                    {/* Text panel */}
                                    <div
                                        className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-6 relative"
                                        style={{ backgroundColor: 'var(--bardo-bg, #0a0a0a)' }}
                                        onClick={handleDismiss}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-px bg-bardo-accent/20" />

                                        {subtitle && (
                                            <motion.p
                                                className="text-xs uppercase tracking-[0.2em] text-gray-300"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3, duration: 0.5 }}
                                            >
                                                {subtitle}
                                            </motion.p>
                                        )}

                                        <motion.h1
                                            className="text-3xl sm:text-4xl font-bold text-bardo-accent text-center leading-tight tracking-tight accent-text-shadow-title"
                                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                                        >
                                            {title}
                                        </motion.h1>

                                        <motion.div
                                            className="w-24 h-[2px] bg-bardo-accent/40"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.8, duration: 0.6 }}
                                        />

                                        {isReady && (
                                            <motion.p
                                                className="mt-2 text-sm tracking-[0.15em] text-white/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
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
                                </>
                            ) : (
                                /* ── Desktop / landscape layout (original) ── */
                                <>
                                    {/* Background Image */}
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

                                    {/* Text backdrop */}
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

                                        <motion.h1
                                            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-bardo-accent text-center tracking-wider accent-text-shadow-title"
                                            initial={{ opacity: 0, y: -30, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                                        >
                                            {title}
                                        </motion.h1>

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
                                            className="absolute left-1/2 -translate-x-1/2 z-20 text-lg md:text-xl tracking-[0.15em] text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                                            style={{
                                                bottom: 'max(3rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))'
                                            }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            PRESIONA UNA TECLA PARA CONTINUAR
                                        </motion.p>
                                    )}

                                    {/* Decorative corners */}
                                    {!image && <>
                                        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-bardo-accent/30" />
                                        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-bardo-accent/30" />
                                        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-bardo-accent/30" />
                                        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-bardo-accent/30" />
                                    </>}

                                    {/* Zoom icon on desktop */}
                                    {image && (
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
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {image && (
                <ImageZoomViewer
                    isOpen={zoomOpen}
                    src={image}
                    alt={title}
                    onClose={() => setZoomOpen(false)}
                />
            )}
        </>
    )
}
