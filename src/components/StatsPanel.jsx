import { motion, AnimatePresence } from 'framer-motion'

/**
 * StatsPanel - Displays game stats (HP bars, attribute values)
 * Supports two display types:
 * - 'bar': Progress bar for resources (HP, MP, Stamina)
 * - 'value': Simple numeric display for attributes (STR, INT)
 */
export default function StatsPanel({ stats, statsConfig, getAllStatsInfo }) {
    if (!statsConfig?.enabled) return null

    const allStats = getAllStatsInfo()
    const barStats = allStats.filter(s => s.displayType === 'bar')
    const valueStats = allStats.filter(s => s.displayType === 'value')

    return (
        <motion.div
            className="fixed z-40 pointer-events-none"
            style={{
                top: 'var(--stats-top)',
                left: 'var(--stats-left)'
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div
                className="bg-black/80 border border-bardo-accent/30 p-3 backdrop-blur-sm min-w-[200px]"
                style={{ borderRadius: 'var(--ui-border-radius)' }}
            >
                {/* Bar Stats (Resources) */}
                {barStats.length > 0 && (
                    <div className="space-y-2">
                        {barStats.map(stat => (
                            <StatBar key={stat.id} stat={stat} value={stats[stat.id]} />
                        ))}
                    </div>
                )}

                {/* Divider if both types exist */}
                {barStats.length > 0 && valueStats.length > 0 && (
                    <div className="border-t border-bardo-accent/20 my-2" />
                )}

                {/* Value Stats (Attributes) */}
                {valueStats.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {valueStats.map(stat => (
                            <StatValue key={stat.id} stat={stat} value={stats[stat.id]} />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
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
function StatValue({ stat, value }) {
    const displayValue = value >= 0 ? `+${value}` : value
    const isKarmaStyle = stat.id === 'karma'

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
                        ? (value > 0 ? '#22c55e' : value < 0 ? '#ef4444' : '#9ca3af')
                        : (stat.color || '#facc15')
                }}
            >
                {isKarmaStyle ? displayValue : value}
            </span>
        </motion.div>
    )
}
