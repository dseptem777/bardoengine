import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * RelationshipsPanel - Displays relationship stats with NPCs
 * Desktop: Floating toggle button (heart) + dropdown panel
 * Mobile: Toggle in header (rendered by Player), bottom sheet panel
 *
 * Relationship stats are identified by displayType === 'relationship' in config.
 */
export default function RelationshipsPanel({
    stats,
    relationshipDefs,
    isOpen: controlledIsOpen,
    onToggle,
    isMobile,
    hideToggle
}) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)

    const isControlled = onToggle !== undefined
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen

    const handleToggle = () => {
        if (isControlled) {
            onToggle()
        } else {
            setInternalIsOpen(prev => !prev)
        }
    }

    if (!relationshipDefs || relationshipDefs.length === 0) return null

    // Only show relationships the player has interacted with (value > 0)
    const visibleDefs = relationshipDefs.filter(r => (stats[r.id] ?? 0) > 0)
    const activeCount = visibleDefs.length

    if (visibleDefs.length === 0) return null

    // Mobile bottom sheet
    if (isMobile) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleToggle}
                        />
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 border-t border-bardo-accent/30
                                       backdrop-blur-md max-h-[50vh] overflow-hidden pointer-events-auto"
                            style={{ borderRadius: 'var(--ui-border-radius) var(--ui-border-radius) 0 0' }}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="flex justify-center pt-2 pb-1">
                                <div className="w-10 h-1 bg-gray-600 rounded-full" />
                            </div>

                            <div className="flex items-center justify-between px-4 py-2 border-b border-bardo-accent/20">
                                <h3 className="text-bardo-accent font-bold flex items-center gap-2">
                                    <span>❤️</span> RELACIONES
                                </h3>
                                <button
                                    onClick={handleToggle}
                                    className="text-gray-400 hover:text-white text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-3 max-h-[calc(50vh-80px)] overflow-y-auto space-y-3">
                                {visibleDefs.map(def => (
                                    <RelationshipRow key={def.id} def={def} value={stats[def.id] ?? 0} />
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    // Desktop: floating toggle + dropdown
    return (
        <>
            {!hideToggle && (
                <motion.button
                    className="fixed z-50 bg-black/80 border border-bardo-accent/30 p-3
                               hover:border-bardo-accent/60 transition-colors backdrop-blur-sm pointer-events-auto"
                    style={{
                        top: 'var(--inventory-top)',
                        right: 'calc(var(--inventory-right) + 4.5rem)',
                        borderRadius: 'var(--ui-border-radius)'
                    }}
                    onClick={handleToggle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">❤️</span>
                        {activeCount > 0 && (
                            <span className="bg-bardo-accent text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {activeCount}
                            </span>
                        )}
                    </div>
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed z-40 bg-black/90 border border-bardo-accent/30
                                   backdrop-blur-sm w-72 max-h-[60vh] overflow-hidden pointer-events-auto"
                        style={{
                            top: 'calc(var(--inventory-top) + 4rem)',
                            right: 'calc(var(--inventory-right) + 4.5rem)',
                            borderRadius: 'var(--ui-border-radius)'
                        }}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center justify-between p-3 border-b border-bardo-accent/20">
                            <h3 className="text-bardo-accent font-bold flex items-center gap-2">
                                <span>❤️</span> RELACIONES
                            </h3>
                        </div>

                        <div className="p-3 max-h-[calc(60vh-60px)] overflow-y-auto space-y-3">
                            {relationshipDefs.map(def => (
                                <RelationshipRow key={def.id} def={def} value={stats[def.id] ?? 0} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

/**
 * RelationshipRow - Single relationship display with icon, name, and pip bar
 */
function RelationshipRow({ def, value }) {
    const pips = []
    for (let i = 0; i < def.max; i++) {
        pips.push(i < value)
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">{def.icon}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{def.label}</span>
                    <span className="text-xs text-gray-500 font-mono">{value}/{def.max}</span>
                </div>
                <div className="flex gap-1">
                    {pips.map((filled, i) => (
                        <motion.div
                            key={i}
                            className="h-2 flex-1 rounded-sm"
                            style={{
                                backgroundColor: filled ? (def.color || '#f59e0b') : 'rgba(255,255,255,0.1)'
                            }}
                            initial={filled ? { scale: 0.8, opacity: 0 } : false}
                            animate={filled ? { scale: 1, opacity: 1 } : {}}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
