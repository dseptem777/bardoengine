import React, { useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './spider-overlay.css'

/**
 * SpiderOverlay — Torch & Corruption visual layer
 *
 * Corruption is applied directly as CSS filter on the text elements
 * (no rectangular overlay divs). Web strands drawn on a full-screen SVG.
 */
export default function SpiderOverlay({ state, actions }) {
    const {
        active, spiders, torchPosition, torchRadius,
        corruptionMap, overallCorruption, paused,
        phaseResult, showingResult, stats,
    } = state

    // Cleanup filters on stop
    useEffect(() => {
        if (!active) {
            document.querySelectorAll('[data-paragraph-index]').forEach(elem => {
                elem.style.filter = ''
            })
        }
    }, [active])

    // Hard cleanup on unmount
    useEffect(() => {
        return () => {
            document.querySelectorAll('[data-paragraph-index]').forEach(elem => {
                elem.style.filter = ''
            })
        }
    }, [])

    if (!active) return null

    const torchOn = !paused && torchPosition.x > -999

    const maskGradient = torchOn
        ? `radial-gradient(circle ${torchRadius}px at ${torchPosition.x}px ${torchPosition.y}px,
            transparent 0%, transparent 48%, rgba(0,0,0,0.6) 70%, black 100%)`
        : 'black'

    const glowStyle = torchOn ? {
        background: `radial-gradient(circle ${torchRadius * 0.9}px at ${torchPosition.x}px ${torchPosition.y}px,
            rgba(255, 200, 90, 0.08) 0%, rgba(255, 160, 50, 0.04) 55%, transparent 100%)`,
    } : {}

    const cleanPct = 100 - overallCorruption

    return (
        <>
            <div className="spider-overlay" data-magic-aura={stats?.magia >= 20 ? 'true' : undefined}>

                {/* Full-screen web strand SVG — organic, not tied to paragraph rects */}
                <FullScreenWebs corruptionMap={corruptionMap} />

                {/* Darkness with torch hole — hidden when paused so menus/UI are fully accessible */}
                {!paused && (
                    <>
                        <div
                            className="spider-darkness"
                            style={{ maskImage: maskGradient, WebkitMaskImage: maskGradient }}
                        />
                        <div className="spider-torch" style={glowStyle} />
                    </>
                )}

                {/* Spider silhouettes — above darkness */}
                {spiders.map(spider => (
                    <div
                        key={spider.id}
                        className={`spider-silhouette ${spider.size}`}
                        style={{
                            left: spider.x,
                            top: spider.y,
                            transform: `translate(-50%, -50%) rotate(${Math.sin(spider.wobblePhase) * 8}deg)`,
                        }}
                    >
                        <SpiderSVG />
                    </div>
                ))}

                {/* Result flash */}
                <AnimatePresence>
                    {showingResult && phaseResult && (
                        <motion.div
                            className={`spider-phase-result ${phaseResult}`}
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <div className="result-icon">{phaseResult === 'survived' ? '🔥' : '🕸️'}</div>
                            <div className="result-text">{phaseResult === 'survived' ? 'SOBREVIVISTE' : 'CORRUPTO'}</div>
                            <div className="result-subtext">📖 {cleanPct}% integridad</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}

/**
 * Full-screen SVG with proper spider web geometry: radial spokes + concentric rings.
 * One web per corrupted paragraph, geometry is stable (seed = idx only),
 * opacity and ring count grow with corruption level.
 */
function FullScreenWebs({ corruptionMap }) {
    const paths = useMemo(() => {
        if (corruptionMap.size === 0) return []

        const result = []

        corruptionMap.forEach((level, idx) => {
            if (level < 0.02) return
            const elem = document.querySelector(`[data-paragraph-index="${idx}"]`)
            if (!elem) return

            const rect = elem.getBoundingClientRect()
            const rng = seededRand(idx * 137)

            // Hub slightly off-center for organic feel
            const hubX = rect.left + rect.width * (0.3 + rng() * 0.4)
            const hubY = rect.top  + rect.height * (0.2 + rng() * 0.6)

            const spokeCount = 6 + Math.floor(rng() * 3)  // 6–8 spokes
            const maxRadius = Math.max(rect.width, rect.height) * (0.6 + level * 0.8)

            // Spoke end-points: fixed angles + small jitter
            const spokeEnds = Array.from({ length: spokeCount }, (_, i) => {
                const angle = (i / spokeCount) * Math.PI * 2 + (rng() - 0.5) * 0.35
                const r = maxRadius * (0.65 + rng() * 0.35)
                return { x: hubX + Math.cos(angle) * r, y: hubY + Math.sin(angle) * r }
            })

            const baseOpacity = 0.12 + level * 0.38
            const strokeBase = 0.35 + rng() * 0.4

            // Radial spokes
            spokeEnds.forEach(end => {
                const cpx = (hubX + end.x) / 2 + (rng() - 0.5) * 18
                const cpy = (hubY + end.y) / 2 + (rng() - 0.5) * 18
                result.push({
                    d: `M ${hubX.toFixed(1)} ${hubY.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
                    opacity: baseOpacity * Math.sqrt(level),
                    width: strokeBase,
                })
            })

            // Concentric rings connecting adjacent spokes
            const ringCount = Math.floor(2 + level * 4)  // 2–6 rings
            for (let ring = 1; ring <= ringCount; ring++) {
                const t = (ring / (ringCount + 1)) * (0.55 + rng() * 0.45)
                for (let i = 0; i < spokeCount; i++) {
                    const next = (i + 1) % spokeCount
                    const p1x = hubX + (spokeEnds[i].x    - hubX) * t
                    const p1y = hubY + (spokeEnds[i].y    - hubY) * t
                    const p2x = hubX + (spokeEnds[next].x - hubX) * t
                    const p2y = hubY + (spokeEnds[next].y - hubY) * t
                    const cpx = (p1x + p2x) / 2 + (rng() - 0.5) * 12
                    const cpy = (p1y + p2y) / 2 + (rng() - 0.5) * 12
                    result.push({
                        d: `M ${p1x.toFixed(1)} ${p1y.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`,
                        opacity: baseOpacity * 0.65 * Math.sqrt(level),
                        width: strokeBase * 0.55,
                    })
                }
            }
        })

        return result
    }, [corruptionMap])

    if (paths.length === 0) return null

    return (
        <svg
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 801,
                overflow: 'visible',
            }}
        >
            {paths.map((s, i) => (
                <path
                    key={i}
                    d={s.d}
                    stroke={`rgba(190, 165, 220, ${s.opacity.toFixed(2)})`}
                    strokeWidth={s.width}
                    fill="none"
                    strokeLinecap="round"
                />
            ))}
        </svg>
    )
}

function seededRand(seed) {
    let s = seed
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff
        return (s >>> 0) / 0xffffffff
    }
}

function SpiderSVG() {
    return (
        <svg viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
            <ellipse cx="12" cy="13" rx="3" ry="4" fill="rgba(210, 195, 230, 0.9)" />
            <circle cx="12" cy="8" r="2.5" fill="rgba(210, 195, 230, 0.9)" />
            <circle cx="10.8" cy="7.5" r="0.5" fill="rgba(180, 40, 40, 0.9)" />
            <circle cx="13.2" cy="7.5" r="0.5" fill="rgba(180, 40, 40, 0.9)" />
            {[
                ["9","10","3","7"], ["9","12","2","12"], ["9","14","3","17"], ["9","16","4","20"],
                ["15","10","21","7"], ["15","12","22","12"], ["15","14","21","17"], ["15","16","20","20"],
            ].map(([x1,y1,x2,y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(190, 175, 210, 0.8)" strokeWidth="1.1" strokeLinecap="round" />
            ))}
        </svg>
    )
}
