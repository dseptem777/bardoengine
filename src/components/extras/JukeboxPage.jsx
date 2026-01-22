import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * JukeboxPage - Music player for unlocked tracks
 * Only one track plays at a time. Icon changes between play/stop.
 */
export default function JukeboxPage({
    tracks = [],
    unlockedAchievements = [],
    playMusic,
    stopMusic,
    currentTrack,
    onBack
}) {
    const [playingTrack, setPlayingTrack] = useState(null)

    // Determine which tracks are unlocked
    const jukeboxTracks = tracks.map(track => ({
        ...track,
        unlocked: !track.unlockedBy || unlockedAchievements.includes(track.unlockedBy)
    }))

    const unlockedCount = jukeboxTracks.filter(t => t.unlocked).length

    const handlePlayTrack = (track) => {
        if (!track.unlocked) return

        if (playingTrack === track.id) {
            // Stop current track
            if (stopMusic) stopMusic()
            setPlayingTrack(null)
        } else {
            // Stop any playing track and start new one
            if (stopMusic) stopMusic()
            if (playMusic) playMusic(track.id)
            setPlayingTrack(track.id)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">JUKEBOX</h2>
                <span className="text-yellow-200/70">
                    {unlockedCount}/{tracks.length} desbloqueados
                </span>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto">
                {tracks.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-neutral-500">
                        Este juego no tiene jukebox.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {jukeboxTracks.map((track) => {
                            const isPlaying = playingTrack === track.id

                            return (
                                <motion.button
                                    key={track.id}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                                        ${track.unlocked
                                            ? isPlaying
                                                ? 'bg-yellow-900/40 border-yellow-400'
                                                : 'bg-neutral-900/50 border-neutral-700/50 hover:border-yellow-500/50 hover:bg-neutral-800/50'
                                            : 'bg-neutral-900/30 border-neutral-800 cursor-not-allowed opacity-60'
                                        }`}
                                    onClick={() => handlePlayTrack(track)}
                                    whileTap={track.unlocked ? { scale: 0.98 } : {}}
                                    disabled={!track.unlocked}
                                >
                                    {/* Play/Stop Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                                        ${track.unlocked
                                            ? isPlaying
                                                ? 'bg-red-500/30 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-neutral-800 text-neutral-600'
                                        }`}>
                                        {!track.unlocked ? '🔒' : isPlaying ? '⏹️' : '▶️'}
                                    </div>

                                    {/* Track Info */}
                                    <div className="flex-1 text-left">
                                        <span className={`block font-semibold
                                            ${track.unlocked ? 'text-yellow-200' : 'text-neutral-500'}`}>
                                            {track.unlocked ? track.title : '???'}
                                        </span>
                                    </div>

                                    {/* Currently Playing Indicator */}
                                    <AnimatePresence>
                                        {isPlaying && (
                                            <motion.div
                                                className="flex gap-1 items-end h-4"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                            >
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-1 bg-yellow-400 rounded-full"
                                                        animate={{ height: [4, 16, 4] }}
                                                        transition={{
                                                            duration: 0.4,
                                                            repeat: Infinity,
                                                            delay: i * 0.1
                                                        }}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Back Button */}
            <div className="mt-6 pt-4 border-t border-neutral-800">
                <button
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                    onClick={() => {
                        // Stop music when leaving jukebox
                        if (stopMusic) stopMusic()
                        setPlayingTrack(null)
                        onBack()
                    }}
                >
                    ← Volver
                </button>
            </div>
        </div>
    )
}
