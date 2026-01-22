import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AchievementsPage - Gallery of achievements with unlock status
 * Shows progress bar and grid of locked/unlocked achievements
 */
export default function AchievementsPage({
    achievements = [],
    stats = { total: 0, unlocked: 0, percentage: 0 },
    onResetAll,
    onBack
}) {
    const [selectedAchievement, setSelectedAchievement] = useState(null)
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    return (
        <div className="flex flex-col h-full">
            {/* Header with Progress */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">LOGROS</h2>
                <div className="flex items-center gap-4">
                    <span className="text-yellow-200/70">
                        {stats.unlocked}/{stats.total}
                    </span>
                    <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.percentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <span className="text-yellow-400 font-bold">{stats.percentage}%</span>
                </div>
            </div>

            {/* Achievement Grid */}
            <div className="flex-1 overflow-y-auto">
                {achievements.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-neutral-500">
                        Este juego no tiene logros definidos.
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {achievements.map((achievement) => (
                            <motion.button
                                key={achievement.id}
                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors
                                    ${achievement.unlocked
                                        ? 'bg-yellow-900/30 border-yellow-500/50 hover:border-yellow-400'
                                        : 'bg-neutral-900/50 border-neutral-700/50 hover:border-neutral-600'
                                    }`}
                                onClick={() => setSelectedAchievement(achievement)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className={`text-3xl mb-2 ${!achievement.unlocked && 'grayscale opacity-40'}`}>
                                    {achievement.icon || '🏆'}
                                </span>
                                <span className={`text-xs text-center truncate w-full
                                    ${achievement.unlocked ? 'text-yellow-200' : 'text-neutral-500'}`}>
                                    {achievement.displayTitle}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-800">
                <button
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                    onClick={onBack}
                >
                    ← Volver
                </button>

                {stats.unlocked > 0 && (
                    <button
                        className="text-red-400/70 hover:text-red-400 text-sm transition-colors"
                        onClick={() => setShowResetConfirm(true)}
                    >
                        Borrar todos los logros
                    </button>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedAchievement && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAchievement(null)}
                    >
                        <motion.div
                            className={`p-6 rounded-lg border-2 max-w-sm mx-4
                                ${selectedAchievement.unlocked
                                    ? 'bg-yellow-950/90 border-yellow-500/60'
                                    : 'bg-neutral-900/90 border-neutral-700'
                                }`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`text-5xl ${!selectedAchievement.unlocked && 'grayscale opacity-40'}`}>
                                    {selectedAchievement.icon || '🏆'}
                                </span>
                                <div>
                                    <h3 className={`text-xl font-bold 
                                        ${selectedAchievement.unlocked ? 'text-yellow-300' : 'text-neutral-400'}`}>
                                        {selectedAchievement.displayTitle}
                                    </h3>
                                    <span className={`text-sm 
                                        ${selectedAchievement.unlocked ? 'text-green-400' : 'text-neutral-500'}`}>
                                        {selectedAchievement.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
                                    </span>
                                </div>
                            </div>
                            <p className={`${selectedAchievement.unlocked ? 'text-yellow-100/80' : 'text-neutral-500'}`}>
                                {selectedAchievement.displayDescription}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetConfirm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowResetConfirm(false)}
                    >
                        <motion.div
                            className="p-6 rounded-lg border-2 border-red-500/60 bg-neutral-900/95 max-w-sm mx-4"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-red-400 mb-3">
                                ⚠️ ¿Borrar todos los logros?
                            </h3>
                            <p className="text-neutral-300 mb-6">
                                Esta acción es <strong className="text-red-400">irreversible</strong>.
                                Perderás todos los logros desbloqueados de este juego.
                            </p>
                            <div className="flex gap-4 justify-end">
                                <button
                                    className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
                                    onClick={() => setShowResetConfirm(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                                    onClick={() => {
                                        onResetAll()
                                        setShowResetConfirm(false)
                                    }}
                                >
                                    Sí, borrar todo
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
