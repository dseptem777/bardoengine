import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image } from 'lucide-react'

/**
 * GalleryPage - Grid of unlockable artwork/images
 * Click on unlocked images to view them in a fullscreen modal
 */
export default function GalleryPage({
    items = [],
    unlockedAchievements = [],
    onBack
}) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [errorIds, setErrorIds] = useState(new Set())

    // Determine which items are unlocked
    const galleryItems = items.map(item => ({
        ...item,
        unlocked: !item.unlockedBy || unlockedAchievements.includes(item.unlockedBy)
    }))

    const unlockedCount = galleryItems.filter(i => i.unlocked).length

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-bardo-accent">GALERÍA</h2>
                <span className="text-bardo-accent/70">
                    {unlockedCount}/{items.length} desbloqueados
                </span>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-neutral-500">
                        Este juego no tiene galería de arte.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryItems.map((item) => (
                            <motion.button
                                key={item.id}
                                className={`aspect-video rounded-lg border-2 overflow-hidden
                                    ${item.unlocked
                                        ? 'border-bardo-accent/50 cursor-pointer hover:border-bardo-accent'
                                        : 'border-neutral-700/50 cursor-not-allowed'
                                    }`}
                                onClick={() => item.unlocked && setSelectedImage(item)}
                                whileHover={item.unlocked ? { scale: 1.03 } : {}}
                                whileTap={item.unlocked ? { scale: 0.98 } : {}}
                                disabled={!item.unlocked}
                            >
                                {item.unlocked ? (
                                    <div className="w-full h-full bg-neutral-900 flex flex-col">
                                        <div className="flex-1 flex items-center justify-center bg-neutral-800 overflow-hidden">
                                            {/* Show actual image if path exists, otherwise placeholder */}
                                            {item.image && !errorIds.has(item.id) ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    onError={() => setErrorIds(prev => new Set([...prev, item.id]))}
                                                />
                                            ) : (
                                                <Image size={36} className="text-neutral-500" />
                                            )}
                                        </div>
                                        <div className="p-2 text-center bg-neutral-900">
                                            <span className="text-sm text-bardo-accent">{item.title}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center">
                                        <span className="text-3xl opacity-40">🔒</span>
                                        <span className="text-xs text-neutral-500 mt-2">Bloqueado</span>
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Back Button */}
            <div className="mt-6 pt-4 border-t border-neutral-800">
                <button
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                    onClick={onBack}
                >
                    ← Volver
                </button>
            </div>

            {/* Fullscreen Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            className="relative max-w-4xl max-h-[80vh] flex flex-col items-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                className="absolute -top-10 right-0 text-2xl text-neutral-400 hover:text-white transition-colors"
                                onClick={() => setSelectedImage(null)}
                            >
                                ✕
                            </button>

                            {/* Image */}
                            <div className="rounded-lg overflow-hidden border-2 border-bardo-accent/50 bg-neutral-900">
                                {selectedImage.image && !errorIds.has(selectedImage.id) ? (
                                    <img
                                        src={selectedImage.image}
                                        alt={selectedImage.title}
                                        className="max-w-full max-h-[70vh] object-contain"
                                        onError={() => setErrorIds(prev => new Set([...prev, selectedImage.id]))}
                                    />
                                ) : (
                                    <div className="p-20 flex items-center justify-center">
                                        <Image size={64} className="text-neutral-500" />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="mt-4 text-xl font-bold text-bardo-accent">
                                {selectedImage.title}
                            </h3>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
