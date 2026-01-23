import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AchievementsPage from './extras/AchievementsPage'
import GalleryPage from './extras/GalleryPage'
import JukeboxPage from './extras/JukeboxPage'

/**
 * ExtrasMenu - Main menu for extras (Achievements, Gallery, Jukebox)
 * Accessible from StartScreen
 */
export default function ExtrasMenu({
    isOpen,
    onClose,
    achievements = [],
    achievementStats = { total: 0, unlocked: 0, percentage: 0 },
    unlockedAchievementIds = [],
    onResetAchievements,
    gallery = [],
    jukebox = [],
    playMusic,
    stopMusic,
    currentTrack
}) {
    const [currentPage, setCurrentPage] = useState('menu') // menu | achievements | gallery | jukebox

    // Calculate extras availability
    const hasAchievements = achievements.length > 0
    const hasGallery = gallery.length > 0
    const hasJukebox = jukebox.length > 0
    const hasAnyExtras = hasAchievements || hasGallery || hasJukebox

    const menuItems = [
        { id: 'achievements', label: 'LOGROS', icon: '🏆', enabled: hasAchievements, count: achievementStats.unlocked },
        { id: 'gallery', label: 'GALERÍA', icon: '🖼️', enabled: hasGallery },
        { id: 'jukebox', label: 'JUKEBOX', icon: '🎵', enabled: hasJukebox },
    ]

    const handleBack = () => {
        setCurrentPage('menu')
    }

    const handleClose = () => {
        setCurrentPage('menu')
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="w-full max-w-2xl h-[80vh] mx-4 p-6 rounded-lg border-2 border-bardo-accent/40
                               bg-gradient-to-b from-neutral-950 to-neutral-900 overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    {/* Page Content */}
                    <AnimatePresence mode="wait">
                        {currentPage === 'menu' && (
                            <motion.div
                                key="menu"
                                className="h-full flex flex-col"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <h1 className="text-3xl font-bold text-bardo-accent">EXTRAS</h1>
                                    <button
                                        className="text-neutral-400 hover:text-neutral-200 text-2xl"
                                        onClick={handleClose}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Menu Items */}
                                {!hasAnyExtras ? (
                                    <div className="flex-1 flex items-center justify-center text-neutral-500">
                                        Este juego no tiene extras configurados.
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col gap-4">
                                        {menuItems.map((item) => (
                                            <motion.button
                                                key={item.id}
                                                className={`flex items-center gap-4 p-5 rounded-lg border-2 transition-colors
                                                    ${item.enabled
                                                        ? 'bg-neutral-900/50 border-neutral-700/50 hover:border-bardo-accent/60'
                                                        : 'bg-neutral-900/20 border-neutral-800/30 cursor-not-allowed opacity-40'
                                                    }`}
                                                onClick={() => item.enabled && setCurrentPage(item.id)}
                                                whileHover={item.enabled ? { x: 10 } : {}}
                                                disabled={!item.enabled}
                                            >
                                                <span className="text-3xl">{item.icon}</span>
                                                <span className={`text-xl font-semibold
                                                    ${item.enabled ? 'text-bardo-accent' : 'text-neutral-600'}`}>
                                                    {item.label}
                                                </span>
                                                {item.count !== undefined && item.enabled && (
                                                    <span className="ml-auto text-bardo-accent/70">
                                                        {item.count}/{achievementStats.total}
                                                    </span>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Close Button */}
                                <div className="mt-6 pt-4 border-t border-neutral-800">
                                    <button
                                        className="text-neutral-400 hover:text-neutral-200 transition-colors"
                                        onClick={handleClose}
                                    >
                                        ← Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {currentPage === 'achievements' && (
                            <motion.div
                                key="achievements"
                                className="h-full"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <AchievementsPage
                                    achievements={achievements}
                                    stats={achievementStats}
                                    onResetAll={onResetAchievements}
                                    onBack={handleBack}
                                />
                            </motion.div>
                        )}

                        {currentPage === 'gallery' && (
                            <motion.div
                                key="gallery"
                                className="h-full"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <GalleryPage
                                    items={gallery}
                                    unlockedAchievements={unlockedAchievementIds}
                                    onBack={handleBack}
                                />
                            </motion.div>
                        )}

                        {currentPage === 'jukebox' && (
                            <motion.div
                                key="jukebox"
                                className="h-full"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <JukeboxPage
                                    tracks={jukebox}
                                    unlockedAchievements={unlockedAchievementIds}
                                    playMusic={playMusic}
                                    stopMusic={stopMusic}
                                    currentTrack={currentTrack}
                                    onBack={handleBack}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
