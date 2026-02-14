import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './spider-overlay.css'

/**
 * SpiderOverlay — Renders the continuous spider infestation UI
 * 
 * Shows: spiders, webs (spit on text), kill counter, result flash
 * No timer bar — infestation runs continuously across story beats
 */
export default function SpiderOverlay({ state, actions }) {
    const { active, infesting, spiders, webs, killCount, threshold,
        phaseResult, showingResult, stats } = state

    // Web position cache
    const [webPositions, setWebPositions] = useState({})
    const positionIntervalRef = useRef(null)

    // Update web positions from DOM
    useEffect(() => {
        if (!active) {
            setWebPositions({})
            if (positionIntervalRef.current) clearInterval(positionIntervalRef.current)
            return
        }

        const updatePositions = () => {
            const positions = {}
            webs.forEach(web => {
                const elem = document.querySelector(`[data-paragraph-index="${web.targetIndex}"]`)
                if (elem) {
                    const rect = elem.getBoundingClientRect()
                    positions[web.id] = {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                    }
                }
            })
            setWebPositions(positions)
        }

        updatePositions()
        positionIntervalRef.current = setInterval(updatePositions, 500)
        return () => clearInterval(positionIntervalRef.current)
    }, [active, webs])

    if (!active) return null

    const hitboxBonus = stats?.fuerza >= 25

    return (
        <div className="spider-overlay" data-magic-aura={stats?.magia >= 20 ? 'true' : undefined}>
            {/* Kill Counter — always visible during infestation */}
            <div className={`spider-kill-counter ${threshold > 0 && killCount >= threshold ? 'threshold-met' : ''}`}>
                <span>💀 {killCount}{threshold > 0 ? `/${threshold}` : ''}</span>
            </div>

            {/* Web overlays on paragraphs */}
            <AnimatePresence>
                {webs.map(web => {
                    const pos = webPositions[web.id]
                    if (!pos) return null
                    return (
                        <motion.div
                            key={web.id}
                            className="spider-web-overlay"
                            style={{
                                position: 'fixed',
                                top: pos.top,
                                left: pos.left,
                                width: pos.width,
                                height: pos.height,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.3 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                actions.clearWeb(web.id)
                            }}
                        >
                            🕸️
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {/* Spiders */}
            <AnimatePresence>
                {spiders.map(spider => (
                    <motion.div
                        key={spider.id}
                        className={`spider-entity ${spider.size} ${spider.dying ? 'squashed' : ''} ${hitboxBonus ? 'big-hitbox' : ''}`}
                        style={{
                            position: 'fixed',
                            left: spider.x,
                            top: spider.y,
                            pointerEvents: spider.alive ? 'auto' : 'none',
                        }}
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{
                            opacity: spider.alive ? 1 : 0,
                            scale: spider.dying ? 1.5 : 1,
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (spider.alive) actions.squashSpider(spider.id)
                        }}
                    >
                        {spider.dying ? '💥' : '🕷️'}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Result Flash */}
            <AnimatePresence>
                {showingResult && phaseResult && (
                    <motion.div
                        className={`spider-phase-result ${phaseResult}`}
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <div className="result-icon">
                            {phaseResult === 'survived' ? '🔥' : '🕸️'}
                        </div>
                        <div className="result-text">
                            {phaseResult === 'survived' ? 'SOBREVIVISTE' : 'CAÍSTE'}
                        </div>
                        <div className="result-subtext">
                            💀 {killCount}/{threshold}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
