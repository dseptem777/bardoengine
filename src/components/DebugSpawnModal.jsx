import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * DebugSpawnModal - Debug panel for jumping to any knot with custom variables
 */
export default function DebugSpawnModal({
    isOpen,
    onClose,
    knots = [],
    variables = {},
    onSpawn,
    onSaveVariables
}) {
    const [search, setSearch] = useState('')
    const [selectedKnot, setSelectedKnot] = useState('')
    const [editedVars, setEditedVars] = useState({})

    // Sync variables when modal opens
    useEffect(() => {
        if (isOpen) {
            setEditedVars(variables)
            setSearch('')
            setSelectedKnot('')
        }
    }, [isOpen, variables])

    // Filter knots by search
    const filteredKnots = useMemo(() => {
        if (!search) return knots
        const lower = search.toLowerCase()
        return knots.filter(k => k.toLowerCase().includes(lower))
    }, [knots, search])

    const handleVarChange = (key, rawValue) => {
        const original = variables[key]
        let parsed = rawValue

        // Auto-detect type from original value
        if (typeof original === 'number') {
            const num = Number(rawValue)
            parsed = isNaN(num) ? rawValue : num
        } else if (typeof original === 'boolean') {
            parsed = rawValue === 'true' || rawValue === '1'
        }

        setEditedVars(prev => ({ ...prev, [key]: parsed }))
    }

    const getChangedVars = () => {
        const changedVars = {}
        for (const [key, val] of Object.entries(editedVars)) {
            if (val !== variables[key]) {
                changedVars[key] = val
            }
        }
        return changedVars
    }

    const hasChangedVars = Object.keys(getChangedVars()).length > 0

    const handleSpawn = () => {
        if (!selectedKnot) return
        onSpawn(selectedKnot, getChangedVars())
        onClose()
    }

    const handleSaveVars = () => {
        const changed = getChangedVars()
        if (Object.keys(changed).length === 0) return
        onSaveVariables?.(changed)
        onClose()
    }

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    const varEntries = Object.entries(editedVars).sort(([a], [b]) => a.localeCompare(b))

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative z-10 bg-gray-950 border border-bardo-accent/30 rounded-lg w-[700px] max-w-[95vw] max-h-[85vh] flex flex-col shadow-2xl"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h2 className="text-bardo-accent font-mono text-lg tracking-wider">
                                DEBUG SPAWN
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Left: Knot selector */}
                            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col">
                                <div className="p-3">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar knot..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-bardo-accent focus:outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0 max-h-[30vh] md:max-h-none">
                                    {filteredKnots.length === 0 ? (
                                        <p className="text-gray-600 text-sm font-mono p-2">No knots found</p>
                                    ) : (
                                        filteredKnots.map(knot => (
                                            <button
                                                key={knot}
                                                onClick={() => setSelectedKnot(knot)}
                                                className={`
                                                    w-full text-left px-3 py-1.5 text-sm font-mono rounded transition-colors
                                                    ${selectedKnot === knot
                                                        ? 'bg-bardo-accent/20 text-bardo-accent'
                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                    }
                                                `}
                                            >
                                                {knot}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right: Variable editor */}
                            <div className="w-full md:w-1/2 flex flex-col">
                                <div className="p-3 border-b border-gray-800">
                                    <h3 className="text-gray-400 font-mono text-xs uppercase tracking-wider">
                                        Variables ({varEntries.length})
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 min-h-0 max-h-[25vh] md:max-h-none">
                                    {varEntries.length === 0 ? (
                                        <p className="text-gray-600 text-sm font-mono">No variables</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {varEntries.map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-2">
                                                    <label className="text-gray-500 text-xs font-mono w-1/2 truncate shrink-0" title={key}>
                                                        {key}
                                                    </label>
                                                    {typeof variables[key] === 'boolean' ? (
                                                        <button
                                                            onClick={() => handleVarChange(key, val ? 'false' : 'true')}
                                                            className={`
                                                                flex-1 px-2 py-1 text-xs font-mono rounded border transition-colors
                                                                ${val
                                                                    ? 'bg-green-900/30 border-green-700 text-green-400'
                                                                    : 'bg-gray-900 border-gray-700 text-gray-500'
                                                                }
                                                            `}
                                                        >
                                                            {String(val)}
                                                        </button>
                                                    ) : (
                                                        <input
                                                            type={typeof variables[key] === 'number' ? 'number' : 'text'}
                                                            value={val ?? ''}
                                                            onChange={(e) => handleVarChange(key, e.target.value)}
                                                            className={`
                                                                flex-1 bg-gray-900 border rounded px-2 py-1 text-xs font-mono text-white
                                                                focus:border-bardo-accent focus:outline-none min-w-0
                                                                ${val !== variables[key] ? 'border-bardo-accent/50' : 'border-gray-700'}
                                                            `}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                            <span className="text-gray-600 text-xs font-mono truncate mr-4">
                                {selectedKnot ? `→ ${selectedKnot}` : 'Seleccioná un knot'}
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-mono text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveVars}
                                    disabled={!hasChangedVars}
                                    className={`
                                        px-5 py-2 text-sm font-mono font-bold tracking-wider border-2 rounded transition-all
                                        ${hasChangedVars
                                            ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                                            : 'border-gray-700 text-gray-600 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    GUARDAR
                                </button>
                                <button
                                    onClick={handleSpawn}
                                    disabled={!selectedKnot}
                                    className={`
                                        px-6 py-2 text-sm font-mono font-bold tracking-wider border-2 rounded transition-all
                                        ${selectedKnot
                                            ? 'border-bardo-accent text-bardo-accent hover:bg-bardo-accent hover:text-black'
                                            : 'border-gray-700 text-gray-600 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    SPAWN
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
