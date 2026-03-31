import { motion, AnimatePresence } from 'framer-motion'

const PHASE_LABELS = {
    active: 'CONFRONTACIÓN',
    phase_1: 'FASE I: PASILLO INFINITO',
    phase_2: 'FASE II: MANOS DE SOMBRA',
    phase_3: 'FASE III: COLAPSO',
    defeated: 'DERROTADO',
    player_dead: 'CAÍDO',
}

/**
 * BossHPIndicator - Fixed overlay showing boss name, HP bar, and current phase.
 *
 * Props:
 * - bossName: string - Display name of the boss
 * - bossHp: number - Current hit points
 * - bossMaxHp: number - Maximum hit points
 * - phase: string - Current phase key (matches PHASE_LABELS)
 * - isActive: boolean - Whether the indicator is visible
 */
export default function BossHPIndicator({
    bossName,
    bossHp,
    bossMaxHp,
    phase,
    isActive,
}) {
    if (!isActive) return null

    const hpPercent = bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0
    const isDefeated = phase === 'defeated'
    const phaseLabel = PHASE_LABELS[phase] || phase

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="fixed top-0 left-1/2 -translate-x-1/2 z-[90] pointer-events-none w-full max-w-md px-4"
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                >
                    <div className="bg-black/80 backdrop-blur border border-red-900 rounded-b-lg px-4 py-3">
                        {/* Boss name + phase label */}
                        <div className="flex items-baseline justify-between mb-2">
                            <span
                                className="font-mono text-red-400 tracking-widest uppercase text-sm"
                                style={{ fontFamily: 'var(--bardo-font-mono)' }}
                            >
                                {bossName}
                            </span>
                            <span
                                className="text-red-400/60 text-xs font-mono"
                                style={{ fontFamily: 'var(--bardo-font-mono)' }}
                            >
                                {phaseLabel}
                            </span>
                        </div>

                        {/* HP bar */}
                        <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${
                                    isDefeated
                                        ? 'bg-gray-600'
                                        : 'bg-gradient-to-r from-red-700 to-red-500'
                                }`}
                                initial={{ width: '100%' }}
                                animate={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>

                        {/* HP text */}
                        <div className="text-right mt-1">
                            <span
                                className="text-red-400/40 text-[10px] font-mono"
                                style={{ fontFamily: 'var(--bardo-font-mono)' }}
                            >
                                {bossHp} / {bossMaxHp}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
