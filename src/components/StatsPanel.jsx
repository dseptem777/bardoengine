import { motion, AnimatePresence } from 'framer-motion'

/**
 * StatsPanel - Displays game stats as an "ID Card"
 * Only shows when player has entered their name (discovery moment)
 * 
 * Props:
 * - stats: Current stat values
 * - statsConfig: Config with enabled, playerNameVariable, definitions
 * - getAllStatsInfo: Function to get all stat definitions with current values
 * - playerName: The player's name (from story variable)
 */
export default function StatsPanel({ stats, statsConfig, getAllStatsInfo, playerName }) {
    // Don't show if stats not enabled
    if (!statsConfig?.enabled) return null

    // Don't show if player name variable is configured but empty
    const requiresName = !!statsConfig.playerNameVariable
    if (requiresName && !playerName) return null

    const allStats = getAllStatsInfo()
    const barStats = allStats.filter(s => s.displayType === 'bar')
    const valueStats = allStats.filter(s => s.displayType === 'value')

    return (
        <AnimatePresence>
            <motion.div
                className="fixed z-40 pointer-events-none"
                style={{
                    top: 'var(--stats-top)',
                    left: 'var(--stats-left)'
                }}
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
            >
                <div
                    className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-bardo-accent/50 backdrop-blur-sm overflow-hidden shadow-lg shadow-bardo-accent/20"
                    style={{
                        borderRadius: 'var(--ui-border-radius)',
                        minWidth: '220px'
                    }}
                >
                    {/* ID Card Header with Name */}
                    {playerName && (
                        <motion.div
                            className="bg-bardo-accent/20 border-b border-bardo-accent/30 px-4 py-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="text-[10px] uppercase tracking-widest text-bardo-accent/70 mb-1">
                                Agente
                            </div>
                            <div className="text-lg font-bold text-bardo-accent tracking-wide">
                                {playerName}
                            </div>
                        </motion.div>
                    )}

                    {/* Stats Content */}
                    <div className="p-3 space-y-3">
                        {/* Bar Stats (Resources) */}
                        {barStats.length > 0 && (
                            <div className="space-y-2">
                                {barStats.map((stat, index) => (
                                    <motion.div
                                        key={stat.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        <StatBar stat={stat} value={stats[stat.id]} />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Divider if both types exist */}
                        {barStats.length > 0 && valueStats.length > 0 && (
                            <div className="border-t border-bardo-accent/20" />
                        )}

                        {/* Value Stats (Attributes) */}
                        {valueStats.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {valueStats.map((stat, index) => (
                                    <motion.div
                                        key={stat.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    >
                                        <StatValue stat={stat} value={stats[stat.id]} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
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
