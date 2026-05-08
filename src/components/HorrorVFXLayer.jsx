import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

/**
 * HorrorVFXLayer - Extended VFX for Horror/Meta-Horror Effects
 * 
 * Complements the main VFXLayer with specialized horror effects:
 * - blur_vignette: Tunnel vision (vampire domination)
 * - cold_blue: Cold atmosphere (supernatural presence)
 * - blood_pulse: Red pulsing overlay (danger/damage)
 * - static_mind: Mental interference static
 * - submission_fade: Progressive darkening (losing willpower)
 * 
 * These effects can stack and have configurable intensity.
 */

// Predefined horror palettes
const HORROR_PALETTES = {
    vampire: {
        primary: 'rgba(139, 0, 0, 0.7)',      // Dark crimson
        secondary: 'rgba(75, 0, 130, 0.3)',   // Indigo
        accent: 'rgba(220, 38, 38, 0.8)'      // Bright red
    },
    cold: {
        primary: 'rgba(59, 130, 246, 0.15)',  // Cold blue
        secondary: 'rgba(147, 197, 253, 0.1)', // Ice
        accent: 'rgba(96, 165, 250, 0.3)'     // Light blue
    },
    mental: {
        primary: 'rgba(128, 0, 128, 0.2)',    // Purple
        secondary: 'rgba(255, 255, 255, 0.05)', // White static
        accent: 'rgba(192, 132, 252, 0.4)'    // Light purple
    }
}

export default function HorrorVFXLayer({
    effect,
    intensity = 1,
    sometimiento = 0,
    willpower = 100
}) {
    const [staticSeed, setStaticSeed] = useState(0)

    // Generate new static pattern periodically for mental effects
    useEffect(() => {
        if (effect === 'static_mind' || effect === 'submission_fade') {
            const interval = setInterval(() => {
                setStaticSeed(Date.now())
            }, 100)
            return () => clearInterval(interval)
        }
    }, [effect])

    // Calculate derived intensities
    const submissionFactor = sometimiento / 100
    const willpowerFactor = willpower / 100

    if (!effect) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
            <AnimatePresence mode="wait">

                {/* Blur Vignette - Tunnel Vision */}
                {effect === 'blur_vignette' && (
                    <motion.div
                        key="blur_vignette"
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: intensity }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Outer darkness */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `radial-gradient(ellipse at center, 
                                    transparent ${25 - submissionFactor * 15}%, 
                                    rgba(0, 0, 0, ${0.4 + submissionFactor * 0.4}) ${50 - submissionFactor * 10}%, 
                                    rgba(0, 0, 0, ${0.85 + submissionFactor * 0.1}) 100%)`
                            }}
                        />

                        {/* Pulsing inner ring */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.02, 1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2 + (1 - submissionFactor) * 2
                            }}
                            style={{
                                background: `radial-gradient(ellipse at center, 
                                    transparent 30%, 
                                    ${HORROR_PALETTES.vampire.primary} 100%)`
                            }}
                        />

                        {/* Blur edge effect */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backdropFilter: `blur(${2 + submissionFactor * 4}px)`,
                                WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 40%, black 100%)',
                                maskImage: 'radial-gradient(ellipse at center, transparent 40%, black 100%)'
                            }}
                        />
                    </motion.div>
                )}

                {/* Cold Blue Atmosphere */}
                {effect === 'cold_blue' && (
                    <motion.div
                        key="cold_blue"
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: intensity * 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2 }}
                    >
                        {/* Top gradient */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(180deg, 
                                    ${HORROR_PALETTES.cold.primary} 0%, 
                                    transparent 40%,
                                    transparent 60%,
                                    ${HORROR_PALETTES.cold.secondary} 100%)`
                            }}
                        />

                        {/* Frost particles effect */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 100%']
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 20,
                                ease: 'linear'
                            }}
                            style={{
                                backgroundImage: `radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.3), transparent),
                                                  radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.2), transparent),
                                                  radial-gradient(1px 1px at 50px 160px, rgba(255,255,255,0.3), transparent),
                                                  radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.2), transparent)`,
                                backgroundSize: '200px 200px'
                            }}
                        />

                        {/* Color overlay */}
                        <div
                            className="absolute inset-0 mix-blend-color"
                            style={{
                                backgroundColor: HORROR_PALETTES.cold.accent
                            }}
                        />
                    </motion.div>
                )}

                {/* Blood Pulse - Damage/Danger */}
                {effect === 'blood_pulse' && (
                    <motion.div
                        key="blood_pulse"
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Pulsing red overlay */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                opacity: [0.15 * intensity, 0.35 * intensity, 0.15 * intensity],
                                scale: [1, 1.02, 1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                ease: 'easeInOut'
                            }}
                            style={{
                                backgroundColor: HORROR_PALETTES.vampire.accent
                            }}
                        />

                        {/* Edge darkening */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `radial-gradient(ellipse at center, 
                                    transparent 50%, 
                                    rgba(139, 0, 0, ${0.3 * intensity}) 100%)`
                            }}
                        />

                        {/* Heartbeat vignette */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                boxShadow: [
                                    `inset 0 0 100px rgba(220, 38, 38, ${0.2 * intensity})`,
                                    `inset 0 0 150px rgba(220, 38, 38, ${0.4 * intensity})`,
                                    `inset 0 0 100px rgba(220, 38, 38, ${0.2 * intensity})`
                                ]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.8
                            }}
                        />
                    </motion.div>
                )}

                {/* Mental Static - Mind Control Interference */}
                {effect === 'static_mind' && (
                    <motion.div
                        key="static_mind"
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: intensity * 0.4 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Noise overlay */}
                        <div
                            className="absolute inset-0 mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='${staticSeed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                opacity: 0.5
                            }}
                        />

                        {/* Purple/mental color tint */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.15
                            }}
                            style={{
                                backgroundColor: HORROR_PALETTES.mental.primary
                            }}
                        />

                        {/* Scan lines */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                backgroundPosition: ['0 0', '0 4px']
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.1
                            }}
                            style={{
                                background: `repeating-linear-gradient(
                                    0deg,
                                    rgba(0, 0, 0, 0.1) 0px,
                                    rgba(0, 0, 0, 0.1) 1px,
                                    transparent 1px,
                                    transparent 2px
                                )`
                            }}
                        />
                    </motion.div>
                )}

                {/* Submission Fade - Progressive Loss */}
                {effect === 'submission_fade' && (
                    <motion.div
                        key="submission_fade"
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: Math.min(1, submissionFactor * 1.5) * intensity
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Progressive darkness */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(
                                    0deg,
                                    rgba(0, 0, 0, ${submissionFactor * 0.8}) 0%,
                                    rgba(0, 0, 0, ${submissionFactor * 0.4}) 50%,
                                    rgba(0, 0, 0, ${submissionFactor * 0.6}) 100%
                                )`
                            }}
                        />

                        {/* Creeping red from edges */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                opacity: [submissionFactor * 0.3, submissionFactor * 0.5, submissionFactor * 0.3]
                            }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            style={{
                                background: `radial-gradient(ellipse at center,
                                    transparent 20%,
                                    rgba(139, 0, 0, ${submissionFactor * 0.5}) 100%)`
                            }}
                        />

                        {/* Pleasure waves (when submission is high) */}
                        {submissionFactor > 0.5 && (
                            <motion.div
                                className="absolute inset-0"
                                animate={{
                                    opacity: [0, 0.2, 0],
                                    scale: [0.8, 1.2, 0.8]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: 'easeInOut'
                                }}
                                style={{
                                    background: 'radial-gradient(ellipse at center, rgba(75, 0, 130, 0.3) 0%, transparent 70%)'
                                }}
                            />
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    )
}
