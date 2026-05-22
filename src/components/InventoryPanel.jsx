import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Backpack } from 'lucide-react'

/**
 * InventoryPanel - Displays player inventory
 * Desktop: Toggle button in corner, expands to show items as dropdown
 * Mobile: Toggle in header (rendered by Player), expands as bottom sheet
 *
 * Props:
 * - items, inventoryConfig, getItemsWithInfo: inventory data
 * - isOpen/onToggle: controlled open state
 * - isMobile: mobile layout mode
 * - hideToggle: hide the floating toggle button (used when toggle is in header)
 */
export default function InventoryPanel({
    items,
    inventoryConfig,
    getItemsWithInfo,
    isOpen: controlledIsOpen,
    onToggle,
    isMobile,
    hideToggle
}) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)

    // Use controlled mode if onToggle is provided
    const isControlled = onToggle !== undefined
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen

    const handleToggle = () => {
        if (isControlled) {
            onToggle()
        } else {
            setInternalIsOpen(prev => !prev)
        }
    }

    if (!inventoryConfig?.enabled) return null

    const itemsWithInfo = getItemsWithInfo()
    const itemCount = itemsWithInfo.length

    // Mobile bottom sheet
    if (isMobile) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleToggle}
                        />
                        {/* Bottom sheet */}
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 border-t border-bardo-accent/30
                                       backdrop-blur-md max-h-[50vh] overflow-hidden pointer-events-auto"
                            style={{ borderRadius: 'var(--ui-border-radius) var(--ui-border-radius) 0 0' }}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Drag handle */}
                            <div className="flex justify-center pt-2 pb-1">
                                <div className="w-10 h-1 bg-gray-600 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-bardo-accent/20">
                                <h3 className="text-bardo-accent font-bold flex items-center gap-2">
                                    <Backpack size={16} /> INVENTARIO
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">
                                        {itemCount}/{inventoryConfig.maxSlots}
                                    </span>
                                    <button
                                        onClick={handleToggle}
                                        className="text-gray-400 hover:text-white text-lg"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="p-3 max-h-[calc(50vh-80px)] overflow-y-auto">
                                {itemsWithInfo.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8 text-sm">
                                        Inventario vacío
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {itemsWithInfo.map((item, index) => (
                                            <InventoryItem key={`${item.id}-${index}`} item={item} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    // Desktop: floating toggle + dropdown (unchanged)
    return (
        <>
            {/* Toggle Button */}
            {!hideToggle && (
                <motion.button
                    className="fixed z-50 bg-black/80 border border-bardo-accent/30 p-3
                               hover:border-bardo-accent/60 transition-colors backdrop-blur-sm pointer-events-auto"
                    style={{
                        top: 'var(--inventory-top)',
                        right: 'var(--inventory-right)',
                        borderRadius: 'var(--ui-border-radius)'
                    }}
                    onClick={handleToggle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Inventario"
                >
                    <div className="flex items-center gap-2">
                        <Backpack size={18} />
                        {itemCount > 0 && (
                            <span className="bg-bardo-accent text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {itemCount}
                            </span>
                        )}
                    </div>
                </motion.button>
            )}

            {/* Inventory Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed z-40 bg-black/90 border border-bardo-accent/30
                                   backdrop-blur-sm w-full max-w-xs sm:w-72 max-h-[60vh] overflow-hidden pointer-events-auto"
                        style={{
                            top: 'calc(var(--inventory-top) + 4rem)',
                            right: 'var(--inventory-right)',
                            borderRadius: 'var(--ui-border-radius)'
                        }}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-bardo-accent/20">
                            <h3 className="text-bardo-accent font-bold flex items-center gap-2">
                                <Backpack size={16} /> INVENTARIO
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                    {itemCount}/{inventoryConfig.maxSlots}
                                </span>
                                <button
                                    onClick={handleToggle}
                                    className="text-gray-400 hover:text-white text-lg leading-none"
                                    aria-label="Cerrar inventario"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="p-2 max-h-[calc(60vh-60px)] overflow-y-auto">
                            {itemsWithInfo.length === 0 ? (
                                <div className="text-center text-gray-500 py-8 text-sm">
                                    Inventario vacío
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {itemsWithInfo.map((item, index) => (
                                        <InventoryItem key={`${item.id}-${index}`} item={item} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

/**
 * InventoryItem - Single item in the inventory
 */
function InventoryItem({ item }) {
    const [tooltipPos, setTooltipPos] = useState(null)
    const itemRef = useRef(null)

    const handleMouseEnter = () => {
        if (!item.description || !itemRef.current) return
        const rect = itemRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const placement = spaceBelow >= rect.top ? 'bottom' : 'top'
        setTooltipPos({ left: rect.left, width: rect.width, top: rect.top, bottom: rect.bottom, placement })
    }

    const handleMouseLeave = () => setTooltipPos(null)

    useEffect(() => {
        if (!tooltipPos) return
        const dismiss = () => setTooltipPos(null)
        window.addEventListener('scroll', dismiss, true)
        window.addEventListener('resize', dismiss)
        return () => {
            window.removeEventListener('scroll', dismiss, true)
            window.removeEventListener('resize', dismiss)
        }
    }, [tooltipPos])

    return (
        <motion.div
            ref={itemRef}
            className="relative flex items-center gap-3 p-2 rounded bg-gray-900/50 hover:bg-gray-800/50
                       border border-transparent hover:border-bardo-accent/20 transition-colors cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Icon - supports emoji or image */}
            <ItemIcon icon={item.icon} iconType={item.iconType} name={item.name} />

            {/* Name and quantity */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-gray-200 text-sm truncate">{item.name}</span>
                    {item.qty > 1 && (
                        <span className="text-xs text-bardo-accent font-mono">x{item.qty}</span>
                    )}
                </div>
                <span className="text-xs text-gray-500 capitalize">{item.category}</span>
            </div>

            {/* Tooltip — portal to body to escape backdrop-filter/overflow clipping */}
            {tooltipPos && item.description && createPortal(
                <div
                    className="fixed p-2 bg-gray-900 border border-bardo-accent/30 rounded text-xs text-gray-300 z-[9999] pointer-events-none shadow-lg"
                    style={{
                        left: tooltipPos.left,
                        width: tooltipPos.width,
                        ...(tooltipPos.placement === 'bottom'
                            ? { top: tooltipPos.bottom + 6 }
                            : { bottom: window.innerHeight - tooltipPos.top + 6 })
                    }}
                >
                    {item.description}
                </div>,
                document.body
            )}
        </motion.div>
    )
}

/**
 * ItemIcon - Renders icon as emoji or image based on iconType
 */
function ItemIcon({ icon, iconType, name }) {
    // Default to emoji if not specified
    const type = iconType || 'emoji'

    if (type === 'image') {
        return (
            <img
                src={icon}
                alt={name}
                className="w-8 h-8 object-contain"
            // For offline: images in public/ folder get bundled
            />
        )
    }

    // Default: emoji
    return <span className="text-2xl">{icon}</span>
}
