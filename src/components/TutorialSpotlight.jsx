import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * TutorialSpotlight — overlay que oscurece la pantalla e ilumina un elemento real
 * identificado por data-tutorial="<anchor>".
 *
 * Props:
 *   steps[]      — [{ anchor, title, body, placementHint? }]
 *   speaker      — { name, color? }  (ej. { name: 'ENRÍQUEZ' } o { name: 'EL PROFESOR' })
 *   onDone       — () => void  — llamado al terminar o saltar
 */
export default function TutorialSpotlight({ steps = [], speaker, onDone }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [spotlightRect, setSpotlightRect] = useState(null)
    const [tooltipSide, setTooltipSide] = useState('bottom')
    const overlayRef = useRef(null)

    // Encuentra el primer elemento con data-tutorial="name" que sea visible (tiene tamaño > 0).
    // En jsdom todos los rects son 0×0, así que si ninguno pasa el filtro de visibilidad pero
    // existe al menos un match, devolvemos el primero (fallback para tests).
    const findAnchor = (name) => {
        const all = Array.from(document.querySelectorAll(`[data-tutorial="${name}"]`))
        if (all.length === 0) return null
        const visible = all.find(el => {
            if (el.offsetParent === null) return false
            const r = el.getBoundingClientRect()
            return r.width > 0 && r.height > 0
        })
        // Fallback: si ninguno pasa (ej. jsdom donde todos son 0×0), usar el primero disponible
        return visible || all[0]
    }

    // Filtra steps cuyo anchor no exista en el DOM.
    // Se guarda en estado para poder re-evaluar cuando el DOM cambie (anclas montadas tarde).
    const computeVisible = () => steps.filter(s => {
        if (!s.anchor) return true
        return !!findAnchor(s.anchor)
    })
    const [visibleSteps, setVisibleSteps] = useState(() => computeVisible())

    // Reevalúa visibleSteps hasta 1.5 s para capturar anclas que montan un frame tarde.
    useEffect(() => {
        // Si ya tenemos todos los steps, no hay nada que esperar.
        if (visibleSteps.length === steps.length) return

        const INTERVAL = 150
        const MAX_ATTEMPTS = 10 // 10 × 150 ms = 1 500 ms
        let attempts = 0

        const id = setInterval(() => {
            attempts++
            const fresh = computeVisible()
            if (fresh.length !== visibleSteps.length) {
                setVisibleSteps(fresh)
                // Asegurarse de que currentIndex siga siendo válido
                setCurrentIndex(i => Math.min(i, Math.max(0, fresh.length - 1)))
            }
            if (fresh.length === steps.length || attempts >= MAX_ATTEMPTS) {
                clearInterval(id)
            }
        }, INTERVAL)

        return () => clearInterval(id)
    }, [steps]) // eslint-disable-line react-hooks/exhaustive-deps

    const total = visibleSteps.length
    const step = visibleSteps[currentIndex] || null

    const calcRect = useCallback(() => {
        if (!step?.anchor) {
            setSpotlightRect(null)
            return
        }
        const el = findAnchor(step.anchor)
        if (!el) {
            setSpotlightRect(null)
            return
        }
        const r = el.getBoundingClientRect()
        setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height })

        // Determina lado del tooltip (abajo por defecto, arriba si el elemento está en la mitad inferior)
        const midY = window.innerHeight / 2
        setTooltipSide(r.top + r.height / 2 > midY ? 'top' : 'bottom')
    }, [step])

    useEffect(() => {
        calcRect()
        const handleResize = () => calcRect()
        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleResize)
        }
    }, [calcRect])

    const handleNext = useCallback(() => {
        if (currentIndex < total - 1) {
            setCurrentIndex(i => i + 1)
        } else {
            handleFinish()
        }
    }, [currentIndex, total])

    const handlePrev = useCallback(() => {
        setCurrentIndex(i => Math.max(0, i - 1))
    }, [])

    const handleFinish = useCallback(() => {
        if (onDone) onDone()
    }, [onDone])

    const handleSkip = useCallback(() => {
        if (onDone) onDone()
    }, [onDone])

    if (total === 0) return null

    const PADDING = 8
    const hasRect = !!spotlightRect

    // Posición del spotlight con padding
    const spotTop = hasRect ? spotlightRect.top - PADDING : 0
    const spotLeft = hasRect ? spotlightRect.left - PADDING : 0
    const spotW = hasRect ? spotlightRect.width + PADDING * 2 : 0
    const spotH = hasRect ? spotlightRect.height + PADDING * 2 : 0

    // Color del speaker (por defecto accent purple)
    const speakerColor = speaker?.color || 'var(--bardo-accent, #8b5cf6)'

    return (
        <AnimatePresence>
            <motion.div
                ref={overlayRef}
                className="fixed inset-0 z-[850]"
                style={{ pointerEvents: 'all' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                aria-modal="true"
                role="dialog"
                aria-label="Tutorial"
            >
                {/* Máscara oscura con agujero recortado sobre el elemento */}
                {hasRect ? (
                    <svg
                        className="absolute inset-0 w-full h-full"
                        style={{ pointerEvents: 'none' }}
                    >
                        <defs>
                            <mask id="spotlight-mask">
                                <rect width="100%" height="100%" fill="white" />
                                <rect
                                    x={spotLeft}
                                    y={spotTop}
                                    width={spotW}
                                    height={spotH}
                                    rx={6}
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect
                            width="100%"
                            height="100%"
                            fill="rgba(0,0,0,0.82)"
                            mask="url(#spotlight-mask)"
                        />
                        {/* Borde luminoso alrededor del elemento */}
                        <rect
                            x={spotLeft}
                            y={spotTop}
                            width={spotW}
                            height={spotH}
                            rx={6}
                            fill="none"
                            stroke={speakerColor}
                            strokeWidth="2"
                            strokeOpacity="0.8"
                        />
                    </svg>
                ) : (
                    /* Sin anchor: fondo oscuro completo */
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.82)' }} />
                )}

                {/* Clic en el overlay cierra (pero no en la card) */}
                <div
                    className="absolute inset-0"
                    onClick={handleSkip}
                    style={{ pointerEvents: 'all' }}
                />

                {/* Tooltip card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className="absolute z-10 w-[min(340px,90vw)]"
                        style={getTooltipPosition(spotlightRect, tooltipSide, hasRect)}
                        initial={{ opacity: 0, y: tooltipSide === 'bottom' ? -8 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: tooltipSide === 'bottom' ? -8 : 8 }}
                        transition={{ duration: 0.2 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className="rounded-lg border p-4 shadow-2xl"
                            style={{
                                background: 'rgba(10,10,18,0.97)',
                                borderColor: speakerColor,
                                boxShadow: `0 0 24px ${speakerColor}33`,
                            }}
                        >
                            {/* Speaker name */}
                            {speaker?.name && (
                                <div
                                    className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2"
                                    style={{
                                        fontFamily: 'var(--bardo-font-display, Orbitron, sans-serif)',
                                        color: speakerColor,
                                    }}
                                >
                                    {speaker.name}
                                </div>
                            )}

                            {/* Title */}
                            {step?.title && (
                                <div
                                    className="text-sm font-bold text-white mb-1.5"
                                    style={{ fontFamily: 'var(--bardo-font-display, Orbitron, sans-serif)' }}
                                >
                                    {step.title}
                                </div>
                            )}

                            {/* Body */}
                            <p
                                className="text-[13px] text-gray-300 leading-relaxed"
                                style={{ fontFamily: 'var(--bardo-font-mono, JetBrains Mono, monospace)' }}
                            >
                                {step?.body}
                            </p>

                            {/* Progress dots */}
                            {total > 1 && (
                                <div className="flex justify-center gap-1.5 mt-3">
                                    {visibleSteps.map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-full transition-all duration-200"
                                            style={{
                                                width: i === currentIndex ? 16 : 6,
                                                height: 6,
                                                background: i === currentIndex ? speakerColor : 'rgba(255,255,255,0.25)',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex items-center gap-2 mt-3">
                                {currentIndex > 0 && (
                                    <button
                                        onClick={handlePrev}
                                        className="px-3 py-1.5 text-xs font-mono border rounded transition-colors"
                                        style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#9ca3af' }}
                                    >
                                        ← Atrás
                                    </button>
                                )}
                                <div className="flex-1" />
                                <button
                                    onClick={handleSkip}
                                    className="px-3 py-1.5 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    Saltar
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-1.5 text-xs font-mono font-bold rounded transition-colors"
                                    style={{
                                        background: speakerColor,
                                        color: '#000',
                                    }}
                                >
                                    {currentIndex < total - 1 ? 'Siguiente →' : 'Entendido'}
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * Calcula la posición CSS de la card de tooltip relativa al rect del elemento.
 */
function getTooltipPosition(rect, side, hasRect) {
    const CARD_OFFSET = 16
    const PADDING = 8

    if (!hasRect) {
        // Sin anchor: centrado en pantalla
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }
    }

    const spotTop = rect.top - PADDING
    const spotLeft = rect.left - PADDING
    const spotW = rect.width + PADDING * 2
    const spotH = rect.height + PADDING * 2

    // Centro horizontal del elemento, clamp para no salir de pantalla
    const centerX = spotLeft + spotW / 2
    const leftPos = Math.max(8, Math.min(centerX - 170, window.innerWidth - 356))

    if (side === 'top') {
        return {
            top: spotTop - CARD_OFFSET,
            left: leftPos,
            transform: 'translateY(-100%)',
        }
    }
    // bottom
    return {
        top: spotTop + spotH + CARD_OFFSET,
        left: leftPos,
    }
}
