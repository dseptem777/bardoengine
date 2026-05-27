import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ImageZoomViewer — Fullscreen pinch-to-zoom / pan modal for landscape hero images.
 * Opens via tap/click on image in TitleScreen or ChapterBreakOverlay.
 * Supports: pinch-to-zoom (touch), scroll-wheel + drag (desktop).
 * Closes on backdrop tap or X button.
 */
export default function ImageZoomViewer({ isOpen, src, alt = '', onClose }) {
    // Lock body scroll while open
    useEffect(() => {
        if (!isOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [isOpen])

    // Close on Escape
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose?.()
    }, [onClose])

    useEffect(() => {
        if (!isOpen) return
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[1000] flex items-center justify-center"
                    style={{
                        paddingTop: 'env(safe-area-inset-top, 0px)',
                        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                        paddingLeft: 'env(safe-area-inset-left, 0px)',
                        paddingRight: 'env(safe-area-inset-right, 0px)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/95"
                        onClick={onClose}
                    />

                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white bg-black/60 rounded-full transition-colors"
                        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
                        onClick={onClose}
                        aria-label="Cerrar visor"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Zoom container */}
                    <div className="relative z-[1] w-full h-full flex items-center justify-center">
                        <TransformWrapper
                            initialScale={1}
                            minScale={0.5}
                            maxScale={8}
                            centerOnInit
                            wheel={{ step: 0.1 }}
                            pinch={{ step: 5 }}
                        >
                            <TransformComponent
                                wrapperStyle={{ width: '100%', height: '100%' }}
                                contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <img
                                    src={src}
                                    alt={alt}
                                    style={{
                                        maxWidth: '100vw',
                                        maxHeight: '100vh',
                                        objectFit: 'contain',
                                        display: 'block',
                                        userSelect: 'none',
                                        WebkitUserDrag: 'none',
                                    }}
                                    draggable={false}
                                />
                            </TransformComponent>
                        </TransformWrapper>
                    </div>

                    {/* Hint */}
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/30 text-xs tracking-widest pointer-events-none"
                        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
                        PINCH / SCROLL PARA ZOOM · TAP FUERA PARA CERRAR
                    </p>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}
