import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Generate a default save name with current date/time
 */
function getDefaultSaveName() {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `Partida ${day}/${month} ${hours}:${minutes}`
}

/**
 * SaveLoadModal - Modal for saving and loading game states
 * 
 * Now includes internal tabs to switch between save and load modes
 */
export default function SaveLoadModal({
    isOpen,
    mode: initialMode = 'save', // Initial mode when opening
    saves = [],
    onSave,
    onLoad,
    onDelete,
    onClose
}) {
    const [saveName, setSaveName] = useState('')
    const [selectedSave, setSelectedSave] = useState(null)
    const [activeTab, setActiveTab] = useState(initialMode) // Internal tab state
    const inputRef = useRef(null)

    // Sync internal tab with prop when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialMode)
        }
    }, [isOpen, initialMode])

    // Set default save name when modal opens in save mode
    useEffect(() => {
        if (isOpen && activeTab === 'save') {
            setSaveName(getDefaultSaveName())
            setSelectedSave(null)
            // Select text after state update
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus()
                    inputRef.current.select()
                }
            }, 50)
        }
    }, [isOpen, activeTab])

    if (!isOpen) return null

    const handleSave = () => {
        if (!saveName.trim()) return
        onSave(saveName.trim())
        setSaveName('')
        onClose()
    }

    const handleLoad = (save) => {
        onLoad(save.id)
        onClose()
    }

    const handleDelete = (save, e) => {
        e.stopPropagation()
        if (confirm(`¿Eliminar "${save.name}"?`)) {
            onDelete(save.id)
        }
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-gray-900 border-2 border-bardo-accent/50 rounded-lg w-full max-w-md mx-4 overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between p-4 border-b border-bardo-accent/30">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('save')}
                                className={`text-lg font-bold transition-colors ${activeTab === 'save'
                                    ? 'text-bardo-accent'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                💾 GUARDAR
                            </button>
                            <button
                                onClick={() => setActiveTab('load')}
                                className={`text-lg font-bold transition-colors ${activeTab === 'load'
                                    ? 'text-bardo-accent'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                📂 CARGAR
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        {/* Save Mode: Name Input */}
                        {activeTab === 'save' && (
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">
                                    Nombre del guardado:
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={saveName}
                                    onChange={e => setSaveName(e.target.value)}
                                    placeholder="Ej: Antes del jefe final"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 
                                               text-white placeholder-gray-500 focus:border-bardo-accent 
                                               focus:outline-none"
                                    maxLength={30}
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={!saveName.trim()}
                                    className="w-full mt-3 py-2 bg-bardo-accent text-black font-bold 
                                               hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
                                               transition-all"
                                >
                                    GUARDAR
                                </button>
                            </div>
                        )}

                        {/* Saves List */}
                        {saves.length > 0 ? (
                            <div className="space-y-2">
                                {activeTab === 'save' && saves.length > 0 && (
                                    <p className="text-gray-500 text-sm mb-2">O sobrescribir:</p>
                                )}
                                {saves.map(save => (
                                    <motion.div
                                        key={save.id}
                                        className={`
                                            flex items-center justify-between p-3 rounded
                                            border cursor-pointer transition-colors
                                            ${save.isAutosave
                                                ? 'border-yellow-600/50 bg-yellow-900/10 hover:border-yellow-500'
                                                : 'border-gray-700 hover:border-bardo-accent/50'}
                                            ${selectedSave?.id === save.id ? 'border-bardo-accent bg-bardo-accent/10' : ''}
                                        `}
                                        onClick={() => activeTab === 'load' ? handleLoad(save) : setSelectedSave(save)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium truncate ${save.isAutosave ? 'text-yellow-400' : 'text-white'}`}>
                                                {save.name}
                                                {save.isAutosave && <span className="text-xs ml-2 text-yellow-600">(usado por Continuar)</span>}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {formatDate(save.timestamp)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(save, e)}
                                            className="ml-2 text-gray-600 hover:text-red-500 text-lg"
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                {activeTab === 'load' ? 'No hay partidas guardadas' : ''}
                            </div>
                        )}

                        {/* Overwrite selected */}
                        {activeTab === 'save' && selectedSave && (
                            <button
                                onClick={() => {
                                    onSave(selectedSave.name, selectedSave.id)
                                    onClose()
                                }}
                                className="w-full mt-3 py-2 border border-orange-500 text-orange-500 
                                           font-bold hover:bg-orange-500 hover:text-black transition-colors"
                            >
                                SOBRESCRIBIR "{selectedSave.name}"
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
