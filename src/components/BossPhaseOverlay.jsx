import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * BossPhaseOverlay — Renders interactive elements for each boss phase.
 *
 * Phase 1 (Errata Hunt): An infinite-scrolling wall of corridor text. One line
 *   is subtly different — the player must scroll, read, and click it. Sabiduria
 *   affects how visible the difference is. Wrong clicks penalize the timer.
 *   New text continuously generates as you scroll, simulating the infinite corridor.
 * Phase 3 (Viewport Collapse): Viewport shrinks as black walls close in.
 *   Portal nodes spawn periodically — click them to damage the boss.
 *   Boss HP bar is visible. If viewport hits 0, player dies.
 *
 * Phase 2 is handled by ScrollGrabOverlay separately.
 */

// Repeating corridor lines — the "infinite loop" the player is trapped in
const CORRIDOR_LINES = [
    'El corredor se extiende sin fin ante vos.',
    'Las paredes murmuran en lenguas muertas.',
    'El suelo cruje bajo tus pies.',
    'Las sombras se retuercen como serpientes.',
    'El aire huele a tiempo podrido.',
    'Un eco repite tus pasos con delay.',
    'Los cuadros te siguen con la mirada.',
    'La vitrina refleja algo que no sos vos.',
    'El reloj de pared marca siempre las tres.',
    'Las baldosas repiten un patrón imposible.',
    'El techo gotea algo que no es agua.',
    'Una puerta cerrada vibra al pasar.',
    'El pasillo dobla donde no debería.',
    'Las luces parpadean en un código que no entendés.',
    'El mismo cuadro aparece por tercera vez.',
    'Tus pisadas suenan antes de que pises.',
    'Las grietas en la pared forman un rostro.',
    'El aire se vuelve más denso a cada paso.',
    'Una vitrina vacía refleja a alguien atrás tuyo.',
    'El piso se inclina levemente hacia adelante.',
    'Las sombras se mueven independientes de la luz.',
    'El olor a tierra mojada se intensifica.',
    'Los marcos de los cuadros están torcidos.',
    'Una mosca golpea el vidrio desde adentro.',
    'El silencio tiene textura.',
    'El pasillo se repite. Otra vez.',
    'Los mismos azulejos. El mismo orden.',
    'Una mancha en el techo que ya viste antes.',
    'El aire sabe a metal y ceniza.',
    'Algo te observa desde las grietas.',
]

// The errata — the one line that doesn't belong to the loop
const ERRATA_LINE = 'Esta grieta no pertenece al loop.'

// Generate a batch of corridor lines (shuffled with offset for variety)
function generateBatch(batchIndex, batchSize = 30) {
    const lines = []
    for (let i = 0; i < batchSize; i++) {
        lines.push(CORRIDOR_LINES[(i + batchIndex * 11) % CORRIDOR_LINES.length])
    }
    return lines
}

export default function BossPhaseOverlay({
    phase,           // 'phase_1' | 'phase_3' | other (renders nothing)
    sabiduria = 10,  // affects errata visibility
    textReady = false, // true when story text has finished typing
    onPhaseComplete, // (damage: number) => void — called when phase resolves
    onPlayerDeath,   // () => void — called when phase 3 kills the player
    bossHp = 100,    // current boss HP (phase 3 checks for victory)
}) {
    // ==================
    // Phase 1: Errata Hunt (infinite scrollable text)
    // ==================
    const [corridorLines, setCorridorLines] = useState([])
    const [errataIndex, setErrataIndex] = useState(-1)
    const [errataFound, setErrataFound] = useState(false)
    const [errataTimer, setErrataTimer] = useState(100)
    const [wrongClick, setWrongClick] = useState(null)
    const errataTimerRef = useRef(null)
    const scrollRef = useRef(null)
    const batchCountRef = useRef(0)
    const isGeneratingRef = useRef(false)

    useEffect(() => {
        if (phase !== 'phase_1') {
            setCorridorLines([])
            setErrataIndex(-1)
            setErrataFound(false)
            setErrataTimer(100)
            setWrongClick(null)
            batchCountRef.current = 0
            isGeneratingRef.current = false
            if (errataTimerRef.current) clearInterval(errataTimerRef.current)
            return
        }

        // Build initial text: 4 batches (~120 lines) with errata placed randomly
        const initialLines = []
        for (let b = 0; b < 4; b++) {
            initialLines.push(...generateBatch(b))
        }
        batchCountRef.current = 4

        // Place errata at random position (not first 15 or last 15)
        const targetIdx = 15 + Math.floor(Math.random() * (initialLines.length - 30))
        initialLines.splice(targetIdx, 0, ERRATA_LINE)

        setCorridorLines(initialLines)
        setErrataIndex(targetIdx)

        // Timer — 25 seconds to find the errata
        setErrataTimer(100)
        errataTimerRef.current = setInterval(() => {
            setErrataTimer(prev => {
                if (prev <= 0) {
                    clearInterval(errataTimerRef.current)
                    return 0
                }
                return prev - (100 / 250) // 100% over 25 seconds at 100ms intervals
            })
        }, 100)

        return () => {
            if (errataTimerRef.current) clearInterval(errataTimerRef.current)
        }
    }, [phase])

    // Infinite scroll: append more lines when near bottom
    const handleCorridorScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el || isGeneratingRef.current || errataFound) return

        const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        if (scrollBottom < 400) {
            isGeneratingRef.current = true
            const newBatch = generateBatch(batchCountRef.current)
            batchCountRef.current++
            setCorridorLines(prev => [...prev, ...newBatch])
            // Small delay to prevent rapid-fire generation
            setTimeout(() => { isGeneratingRef.current = false }, 100)
        }
    }, [errataFound])

    const handleErrataClick = useCallback((index) => {
        if (errataFound) return
        if (index !== errataIndex) {
            // Wrong! Flash red feedback, reduce timer
            setWrongClick(index)
            setErrataTimer(prev => Math.max(0, prev - 6))
            setTimeout(() => setWrongClick(null), 400)
            return
        }
        setErrataFound(true)
        if (errataTimerRef.current) clearInterval(errataTimerRef.current)
        setTimeout(() => {
            onPhaseComplete?.(15) // Phase 1 does 15 damage (not 30)
        }, 600)
    }, [errataFound, errataIndex, onPhaseComplete])

    // ==================
    // Phase 3: Viewport Collapse + Moving Portals
    // ==================
    const [phase3Ready, setPhase3Ready] = useState(false) // gate: wait for player to start
    const [viewportWidth, setViewportWidth] = useState(100)
    const [portals, setPortals] = useState([])
    const [portalsDamageDealt, setPortalsDamageDealt] = useState(0)
    const viewportTimerRef = useRef(null)
    const portalSpawnTimerRef = useRef(null)
    const portalMoveTimerRef = useRef(null)
    const portalIdRef = useRef(0)
    const [damageFlash, setDamageFlash] = useState(false)
    const [missFlash, setMissFlash] = useState(false)
    const [collapseShake, setCollapseShake] = useState(false)
    const [hitTexts, setHitTexts] = useState([])

    const effectiveBossHp = bossHp - portalsDamageDealt
    const DMG_PER_PORTAL = 8  // need ~9 clicks to beat 70HP boss
    const MISS_PENALTY = 3    // viewport shrinks 3% on miss

    // Reset phase3Ready when phase changes
    useEffect(() => {
        if (phase !== 'phase_3') {
            setPhase3Ready(false)
        }
    }, [phase])

    useEffect(() => {
        if (phase !== 'phase_3') {
            setViewportWidth(100)
            setPortals([])
            setPortalsDamageDealt(0)
            setDamageFlash(false)
            setMissFlash(false)
            setCollapseShake(false)
            setHitTexts([])
            return
        }

        // Don't start timers until player clicks "COMENZAR"
        if (!phase3Ready) return

        // Viewport collapse: 0.15% per 100ms (~1.5%/sec, ~60 sec to die)
        viewportTimerRef.current = setInterval(() => {
            setViewportWidth(prev => {
                const next = prev - 0.15
                if (next <= 10) {
                    clearInterval(viewportTimerRef.current)
                    clearInterval(portalSpawnTimerRef.current)
                    clearInterval(portalMoveTimerRef.current)
                    onPlayerDeath?.()
                    return 10
                }
                if (Math.floor(next) % 15 === 0 && Math.floor(next) !== Math.floor(prev)) {
                    setCollapseShake(true)
                    setTimeout(() => setCollapseShake(false), 300)
                }
                return next
            })
        }, 100)

        // Portal spawning: every 1.5 seconds
        const spawnPortal = () => {
            portalIdRef.current++
            const id = portalIdRef.current
            const portal = {
                id,
                top: 15 + Math.random() * 60,
                left: 10 + Math.random() * 70,
                dx: (Math.random() - 0.5) * 4,  // movement speed
                dy: (Math.random() - 0.5) * 4,
                createdAt: Date.now(),
            }
            setPortals(prev => [...prev, portal])

            // Auto-remove after 3.5 seconds (forces urgency)
            setTimeout(() => {
                setPortals(prev => prev.filter(p => p.id !== id))
            }, 3500)
        }

        setTimeout(spawnPortal, 400)
        portalSpawnTimerRef.current = setInterval(spawnPortal, 1500)

        // Move portals every 80ms (smooth drift)
        portalMoveTimerRef.current = setInterval(() => {
            setPortals(prev => prev.map(p => {
                let newTop = p.top + p.dy
                let newLeft = p.left + p.dx
                let newDx = p.dx
                let newDy = p.dy
                // Bounce off edges
                if (newTop < 10 || newTop > 80) { newDy = -newDy; newTop = Math.max(10, Math.min(80, newTop)) }
                if (newLeft < 5 || newLeft > 85) { newDx = -newDx; newLeft = Math.max(5, Math.min(85, newLeft)) }
                return { ...p, top: newTop, left: newLeft, dx: newDx, dy: newDy }
            }))
        }, 80)

        return () => {
            clearInterval(viewportTimerRef.current)
            clearInterval(portalSpawnTimerRef.current)
            clearInterval(portalMoveTimerRef.current)
        }
    }, [phase, phase3Ready, onPlayerDeath])

    // Victory check
    useEffect(() => {
        if (phase !== 'phase_3') return
        if (effectiveBossHp <= 0) {
            clearInterval(viewportTimerRef.current)
            clearInterval(portalSpawnTimerRef.current)
            clearInterval(portalMoveTimerRef.current)
            setTimeout(() => {
                onPhaseComplete?.(portalsDamageDealt)
            }, 300)
        }
    }, [phase, effectiveBossHp, portalsDamageDealt, onPhaseComplete])

    const handlePortalClick = useCallback((e, portalId, top, left) => {
        e.stopPropagation() // don't trigger miss
        setPortals(prev => prev.filter(p => p.id !== portalId))
        setPortalsDamageDealt(prev => prev + DMG_PER_PORTAL)
        setDamageFlash(true)
        setTimeout(() => setDamageFlash(false), 200)

        const hitId = Date.now()
        setHitTexts(prev => [...prev, { id: hitId, top, left, text: `-${DMG_PER_PORTAL} HP` }])
        setTimeout(() => {
            setHitTexts(prev => prev.filter(h => h.id !== hitId))
        }, 800)
    }, [])

    // Miss penalty: clicking empty space shrinks viewport
    const handleMiss = useCallback(() => {
        setViewportWidth(prev => Math.max(10, prev - MISS_PENALTY))
        setMissFlash(true)
        setCollapseShake(true)
        setTimeout(() => { setMissFlash(false); setCollapseShake(false) }, 300)
    }, [])

    // ==================
    // Render
    // ==================

    if (phase === 'phase_1') {
        return (
            <div className="fixed inset-0 z-[75] bg-black/95 flex flex-col">
                {/* Timer bar at top */}
                {!errataFound && (
                    <div className="w-64 mx-auto pt-4 pb-2 z-10 flex-shrink-0">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-100"
                                style={{
                                    width: `${errataTimer}%`,
                                    background: errataTimer > 40 ? '#a855f7' : errataTimer > 20 ? '#ef4444' : '#dc2626',
                                }}
                            />
                        </div>
                        <p className="font-mono text-xs text-center mt-1 tracking-wider"
                           style={{ color: errataTimer > 40 ? 'rgba(168,85,247,0.6)' : 'rgba(239,68,68,0.8)' }}>
                            {'ENCONTR\u00C1 LA GRIETA EN EL TEXTO'}
                        </p>
                    </div>
                )}

                {/* Scrollable corridor text — infinite */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-6 md:px-12 py-8 max-w-2xl mx-auto w-full"
                    onScroll={handleCorridorScroll}
                >
                    {corridorLines.map((line, i) => {
                        const isTarget = i === errataIndex
                        const isWrong = wrongClick === i

                        let color = 'rgba(120, 120, 130, 0.55)'
                        let textShadow = undefined

                        if (isTarget && !isWrong) {
                            if (sabiduria >= 15) {
                                color = 'rgba(175, 155, 195, 0.7)'
                                textShadow = '0 0 6px rgba(168, 85, 247, 0.12)'
                            } else {
                                color = 'rgba(135, 130, 145, 0.6)'
                            }
                        }

                        if (isWrong) {
                            color = 'rgba(239, 68, 68, 0.7)'
                        }

                        if (isTarget && errataFound) {
                            return (
                                <motion.p
                                    key={`corridor-${i}`}
                                    className="font-serif text-base leading-relaxed mb-3 select-none"
                                    animate={{ color: '#a855f7', textShadow: '0 0 15px rgba(168,85,247,0.5)' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {line}
                                </motion.p>
                            )
                        }

                        return (
                            <motion.p
                                key={`corridor-${i}`}
                                className="font-serif text-base leading-relaxed mb-3 cursor-pointer select-none transition-colors"
                                style={{ color, textShadow }}
                                onClick={() => handleErrataClick(i)}
                                animate={isWrong ? { x: [0, -4, 4, -4, 0] } : {}}
                                transition={isWrong ? { duration: 0.3 } : {}}
                                whileHover={{ opacity: 0.9 }}
                            >
                                {line}
                            </motion.p>
                        )
                    })}
                </div>

                {/* Found feedback */}
                <AnimatePresence>
                    {errataFound && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                        >
                            <p className="font-mono text-purple-400 text-2xl tracking-widest"
                               style={{ textShadow: '0 0 20px rgba(168,85,247,0.6)' }}>
                                {'\u00A1GRIETA ENCONTRADA!'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    if (phase === 'phase_3') {
        // Gate: show "ready" screen before starting mechanics (only after text finishes typing)
        if (!phase3Ready) {
            if (!textReady) return null // text still typing, show nothing yet
            return (
                <div className="fixed inset-0 z-[75] bg-black/90 flex items-center justify-center">
                    <motion.div
                        className="flex flex-col items-center gap-6 max-w-md px-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="font-mono text-purple-400 text-sm tracking-wider"
                           style={{ textShadow: '0 0 15px rgba(168,85,247,0.4)' }}>
                            FASE FINAL
                        </p>
                        <p className="font-serif text-gray-300 text-base leading-relaxed">
                            El viewport se colapsa. Portales dimensionales aparecen brevemente
                            {' \u2014 '} hacé click en ellos para dañar a Amaru.
                            Si errás, el viewport se cierra más rápido.
                        </p>
                        <motion.button
                            className="mt-4 px-8 py-3 font-mono text-lg tracking-widest border-2 border-purple-500 text-purple-300 bg-purple-900/30 rounded cursor-pointer"
                            style={{ textShadow: '0 0 10px rgba(168,85,247,0.5)' }}
                            onClick={() => setPhase3Ready(true)}
                            whileHover={{ scale: 1.05, borderColor: '#a855f7' }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ boxShadow: ['0 0 15px rgba(168,85,247,0.3)', '0 0 30px rgba(168,85,247,0.6)', '0 0 15px rgba(168,85,247,0.3)'] }}
                            transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
                        >
                            COMENZAR
                        </motion.button>
                    </motion.div>
                </div>
            )
        }

        const collapsePercent = (100 - viewportWidth) / 2
        const desaturation = Math.min((100 - viewportWidth) / 100, 0.8)
        const redTint = Math.min((100 - viewportWidth) / 200, 0.3)

        return (
            <>
                {/* Damage flash overlay */}
                {damageFlash && (
                    <div className="fixed inset-0 z-[90] pointer-events-none bg-purple-500/25" />
                )}
                {/* Miss flash (red) */}
                {missFlash && (
                    <div className="fixed inset-0 z-[90] pointer-events-none bg-red-500/20" />
                )}

                {/* Color drain overlay */}
                <div
                    className="fixed inset-0 z-[73] pointer-events-none"
                    style={{
                        backdropFilter: `grayscale(${desaturation}) contrast(${1 + redTint})`,
                        WebkitBackdropFilter: `grayscale(${desaturation}) contrast(${1 + redTint})`,
                        background: `rgba(80, 0, 0, ${redTint * 0.3})`,
                    }}
                />

                {/* Viewport collapse — black walls closing in */}
                <div
                    className="fixed inset-0 z-[74] pointer-events-none transition-all duration-100"
                    style={{
                        borderTop: `${collapsePercent}vh solid #000`,
                        borderBottom: `${collapsePercent}vh solid #000`,
                        borderLeft: `${collapsePercent}vw solid #000`,
                        borderRight: `${collapsePercent}vw solid #000`,
                        boxShadow: `inset 0 0 ${60 + collapsePercent * 2}px rgba(200,0,0,${0.2 + collapsePercent * 0.01})`,
                        transform: collapseShake ? 'translate(2px, -2px)' : 'none',
                    }}
                />

                {/* Instruction */}
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[86] pointer-events-none">
                    <p className="font-mono text-purple-300/80 text-sm text-center animate-pulse"
                       style={{ textShadow: '0 0 10px rgba(168,85,247,0.4)' }}>
                        {'CLICK\u00C1 LOS PORTALES \u2014 CUIDADO CON ERRAR'}
                    </p>
                </div>

                {/* HUD */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[85] pointer-events-none">
                    <div className="bg-black/80 backdrop-blur px-4 py-2 rounded border border-red-900/50">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-red-400 text-xs w-16">VIEWPORT</span>
                            <div className="w-28 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full transition-all duration-100"
                                    style={{ width: `${viewportWidth}%` }}
                                />
                            </div>
                            <span className="font-mono text-red-400/60 text-[10px]">{Math.round(viewportWidth)}%</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="font-mono text-purple-400 text-xs w-16">AMARU</span>
                            <div className="w-28 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all duration-200"
                                    style={{ width: `${Math.max(0, effectiveBossHp)}%` }}
                                />
                            </div>
                            <span className="font-mono text-purple-400/60 text-[10px]">{Math.max(0, Math.round(effectiveBossHp))}HP</span>
                        </div>
                    </div>
                </div>

                {/* Portal area — clicking empty space = miss penalty */}
                <div
                    className="fixed inset-0 z-[75] cursor-crosshair"
                    onClick={handleMiss}
                >
                    <AnimatePresence>
                        {portals.map(portal => (
                            <motion.div
                                key={portal.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0, rotate: 180 }}
                                className="absolute cursor-pointer"
                                style={{
                                    top: `${portal.top}%`,
                                    left: `${portal.left}%`,
                                }}
                                onClick={(e) => handlePortalClick(e, portal.id, portal.top, portal.left)}
                                whileHover={{ scale: 1.3 }}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-purple-500 bg-purple-900/40 flex items-center justify-center animate-pulse">
                                        <div className="w-5 h-5 rounded-full bg-purple-400 animate-ping" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.6)]" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Hit texts */}
                    <AnimatePresence>
                        {hitTexts.map(hit => (
                            <motion.div
                                key={hit.id}
                                className="absolute pointer-events-none font-mono text-sm font-bold text-purple-300"
                                style={{
                                    top: `${hit.top}%`,
                                    left: `${hit.left}%`,
                                    textShadow: '0 0 10px rgba(168,85,247,0.8)',
                                }}
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 0, y: -40 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                            >
                                {hit.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </>
        )
    }

    return null
}
