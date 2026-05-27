import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../hooks/useSettings'

/**
 * StatsPanel - Displays game stats as an "ID Card" (desktop) or slim bar strip (mobile)
 *
 * Props:
 * - stats: Current stat values
 * - statsConfig: Config with enabled, playerNameVariable, definitions
 * - getAllStatsInfo: Function to get all stat definitions with current values
 * - playerName: The player's name (from story variable)
 * - isMobile: Whether to render in mobile slim-bar mode
 */
export default function StatsPanel({ stats, statsConfig, getAllStatsInfo, playerName, nickname, chapterName, isMobile }) {
    // Don't show if stats not enabled
    if (!statsConfig?.enabled) return null

    // Don't show if player name variable is configured but empty — but still render placeholder
    const requiresName = !!statsConfig.playerNameVariable
    const redacted = requiresName && !playerName

    const allStats = getAllStatsInfo().filter(s => s && s.displayType !== 'relationship')
    const barStats = allStats.filter(s => s.displayType === 'bar')
    const valueStats = allStats.filter(s => s.displayType === 'value')

    // Mobile: slim bar stats only (no ID strip — player name + chapter shown in header)
    if (isMobile) {
        if (barStats.length === 0) return null

        // Find the HP stat (first bar stat, or stat with id 'hp'/'vida')
        const hpStat = barStats.find(s => s.id === 'hp' || s.id === 'vida') || barStats[0]

        return (
            <div className="fixed top-0 left-0 right-0 z-[820] pointer-events-none mobile-slim-bars">
                <div className="flex w-full">
                    {barStats.map((stat) => {
                        const percentage = stat.max ? Math.max(0, Math.min(100, (stats[stat.id] / stat.max) * 100)) : 0
                        const isCritical = percentage <= 10
                        const isHp = stat === hpStat
                        return (
                            <div
                                key={stat.id}
                                data-tutorial={isHp ? 'hp' : undefined}
                                className="flex-1 relative bg-gray-900/80"
                                style={{ height: isHp ? '1.25rem' : '6px' }}
                                title={`${stat.label}: ${stats[stat.id]}/${stat.max}`}
                            >
                                <motion.div
                                    className="absolute inset-0"
                                    style={{ backgroundColor: stat.color || '#facc15', transformOrigin: 'left' }}
                                    initial={{ scaleX: 0 }}
                                    animate={{
                                        scaleX: percentage / 100,
                                        opacity: isCritical ? [1, 0.5, 1] : 1
                                    }}
                                    transition={{
                                        scaleX: { duration: 0.3, ease: 'easeOut' },
                                        opacity: isCritical ? { duration: 0.5, repeat: Infinity } : {}
                                    }}
                                />
                                {/* HP numeric value — always visible on the HP bar */}
                                {isHp && (
                                    <span
                                        className="absolute inset-0 flex items-center px-1.5 text-[10px] font-bold font-mono z-10"
                                        style={{ color: isCritical ? '#ef4444' : '#000', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                                    >
                                        {stats[stat.id]}/{stat.max}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Desktop: full ID card panel (unchanged)
    return (
        <AnimatePresence>
            <motion.div
                className="fixed z-[820] pointer-events-none"
                style={{
                    top: 'var(--stats-top)',
                    left: 'var(--stats-left)',
                }}
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
            >
                <div
                    className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-bardo-accent/50 backdrop-blur-sm overflow-hidden shadow-lg shadow-bardo-accent/20"
                    style={{
                        borderRadius: 'var(--ui-border-radius)',
                        minWidth: '220px',
                        maxWidth: '280px'
                    }}
                >
                    {/* ID Card Header with Name + Chapter indicator — spotlight anchor for desktop */}
                    <div data-tutorial="playercard">
                    <AnimatePresence mode="wait">
                        {playerName ? (
                            <motion.div
                                key="id-header-real"
                                className="bg-bardo-accent/20 border-b border-bardo-accent/30 px-4 py-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {statsConfig?.roleLabel && (
                                    <div className="text-[10px] uppercase tracking-widest text-bardo-accent/70 mb-1">
                                        {statsConfig.roleLabel}
                                    </div>
                                )}
                                <div className="text-lg font-bold text-bardo-accent tracking-wide">
                                    {playerName}
                                </div>
                                {nickname && (
                                    <div className="text-xs text-bardo-accent/60 italic mt-0.5">
                                        "{nickname}"
                                    </div>
                                )}
                            </motion.div>
                        ) : requiresName ? (
                            <motion.div
                                key="id-header-placeholder"
                                data-testid="id-placeholder"
                                className="bg-gray-800/40 border-b border-gray-700/50 px-4 py-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-[10px] uppercase tracking-widest text-red-400/70 font-mono mb-1">
                                    [CLASIFICADO]
                                </div>
                                <motion.div
                                    className="h-5 w-32 bg-black/80 rounded-sm"
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    exit={{ scaleX: 0, originX: 0, transition: { duration: 0.4 } }}
                                />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* Chapter indicator */}
                    {chapterName && (
                        <div className="px-4 py-1.5 border-b border-gray-800 text-[10px] text-gray-500 tracking-wide font-mono">
                            <AnimatePresence mode="wait">
                                {redacted ? (
                                    <div key="chapter-redacted" className="flex flex-col gap-0.5">
                                        <div className="text-[10px] uppercase tracking-widest font-mono text-red-400/70">[LOCACION DESCONOCIDA]</div>
                                        <motion.div
                                            className="h-1.5 w-full bg-black/70 rounded-sm"
                                            animate={{ opacity: [0.6, 1, 0.6] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                                        />
                                    </div>
                                ) : (
                                    <motion.span
                                        key="chapter-real"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {chapterName}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                    </div>

                    {/* Stats Content */}
                    <div className="p-3 space-y-3">
                        {/* Bar Stats (Resources) */}
                        {barStats.length > 0 && (
                            <div className="space-y-2">
                                {barStats.map((stat, index) => {
                                    const isHpStat = stat.id === 'hp' || stat.id === 'vida' || index === 0
                                    return (
                                        <motion.div
                                            key={stat.id}
                                            data-tutorial={isHpStat ? 'hp' : undefined}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            <StatBar stat={stat} value={stats[stat.id]} />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Divider if both types exist */}
                        {barStats.length > 0 && valueStats.length > 0 && (
                            <div className="border-t border-bardo-accent/20" />
                        )}

                        {/* Value Stats (Attributes) */}
                        {valueStats.length > 0 && (
                            redacted ? (
                                <div data-tutorial="stats" className="flex flex-col gap-0.5">
                                    <div className="text-[10px] uppercase tracking-widest font-mono text-red-400/70">[BAJO EVALUACION]</div>
                                    <motion.div
                                        className="h-3 w-full bg-black/70 rounded-sm"
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </div>
                            ) : (
                                <div data-tutorial="stats" className="flex flex-wrap gap-3">
                                    {valueStats.map((stat, index) => (
                                        <motion.div
                                            key={stat.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                        >
                                            <StatValue stat={stat} value={stats[stat.id]} redacted={false} redactDelay={0} />
                                        </motion.div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * HeaderStats - Compact value stats for embedding in the mobile header
 */
export function HeaderStats({ stats, statsConfig, getAllStatsInfo, redacted = false }) {
    if (!statsConfig?.enabled) return null
    const { settings } = useSettings()

    const allStats = getAllStatsInfo().filter(s => s && s.displayType !== 'relationship')
    const valueStats = allStats.filter(s => s.displayType === 'value')

    if (valueStats.length === 0) return null

    if (redacted) {
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest font-mono text-red-400/70">[BAJO EVALUACION]</span>
                <motion.div
                    className="h-3 w-10 bg-black/70 rounded-sm"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-xs font-mono">
            {valueStats.map((stat, index) => {
                const value = stats[stat.id]
                const displayValue = value >= 0 ? `+${value}` : value
                const isKarmaStyle = stat.id === 'karma'
                const karmaPos = settings.colorblindMode ? '#3b82f6' : '#22c55e'
                const karmaNeg = settings.colorblindMode ? '#f97316' : '#ef4444'
                const color = isKarmaStyle
                    ? (value > 0 ? karmaPos : value < 0 ? karmaNeg : '#9ca3af')
                    : (stat.color || '#facc15')

                return (
                    <span key={stat.id} className="flex items-center gap-0.5">
                        {index > 0 && <span className="text-gray-600 mx-0.5">|</span>}
                        <span>{stat.icon}</span>
                        <span className="font-bold" style={{ color }}>
                            {isKarmaStyle && <span className="karma-arrow">{value > 0 ? '↑' : value < 0 ? '↓' : '—'} </span>}
                            {isKarmaStyle ? displayValue : value}
                        </span>
                        {!isKarmaStyle && stat.max != null && (
                            <span className="text-gray-600">/{stat.max}</span>
                        )}
                    </span>
                )
            })}
        </div>
    )
}

/**
 * StatBar - Individual progress bar for resource stats
 */
function StatBar({ stat, value }) {
    const percentage = stat.max ? Math.max(0, Math.min(100, (value / stat.max) * 100)) : 0
    const isLow = percentage <= 25
    const isCritical = percentage <= 10

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                    <span>{stat.icon}</span>
                    <span className="text-gray-400">{stat.label}</span>
                </span>
                <span className="text-gray-300 font-mono">
                    {value}/{stat.max}
                </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.color || '#facc15' }}
                    initial={{ width: 0 }}
                    animate={{
                        width: `${percentage}%`,
                        opacity: isCritical ? [1, 0.5, 1] : 1
                    }}
                    transition={{
                        width: { duration: 0.3, ease: 'easeOut' },
                        opacity: isCritical ? { duration: 0.5, repeat: Infinity } : {}
                    }}
                />
            </div>
            {/* Low warning flash */}
            <AnimatePresence>
                {isLow && !isCritical && (
                    <motion.div
                        className="text-[10px] text-orange-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        ¡Bajo!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * StatValue - Simple value display for attribute stats
 */
function StatValue({ stat, value, redacted = false, redactDelay = 0 }) {
    const displayValue = value >= 0 ? `+${value}` : value
    const isKarmaStyle = stat.id === 'karma'
    const { settings } = useSettings()
    const karmaPos = settings.colorblindMode ? '#3b82f6' : '#22c55e'
    const karmaNeg = settings.colorblindMode ? '#f97316' : '#ef4444'

    if (redacted) {
        return (
            <motion.div
                className="flex items-center gap-1 text-sm"
            >
                <motion.div
                    className="h-4 w-16 bg-black/70 rounded-sm"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: redactDelay }}
                />
            </motion.div>
        )
    }

    return (
        <motion.div
            className="flex items-center gap-1 text-sm"
            whileHover={{ scale: 1.05 }}
        >
            <span>{stat.icon}</span>
            <span className="text-gray-400">{stat.label}:</span>
            <span
                className="font-mono font-bold"
                style={{
                    color: isKarmaStyle
                        ? (value > 0 ? karmaPos : value < 0 ? karmaNeg : '#9ca3af')
                        : (stat.color || '#facc15')
                }}
            >
                {isKarmaStyle && <span className="karma-arrow">{value > 0 ? '↑' : value < 0 ? '↓' : '—'} </span>}
                {isKarmaStyle ? displayValue : value}
            </span>
            {!isKarmaStyle && stat.max != null && (
                <span className="font-mono text-gray-600 text-xs">/{stat.max}</span>
            )}
        </motion.div>
    )
}
