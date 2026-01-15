import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../hooks/useSettings'

/**
 * OptionsModal - Settings modal with retro-futuristic styling
 * Accessible from Start Screen and during gameplay
 */
export default function OptionsModal({ isOpen, onClose }) {
    const {
        settings,
        updateSetting,
        isFullscreen,
        toggleFullscreen,
        resetSettings,
    } = useSettings()

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
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
                        className="relative bg-bardo-bg border-2 border-bardo-accent p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{
                            boxShadow: '0 0 30px rgba(250, 204, 21, 0.3)',
                        }}
                    >
                        {/* Header */}
                        <h2 className="text-2xl font-bold text-bardo-accent text-center mb-6 tracking-wider">
                            ⚙️ OPCIONES
                        </h2>

                        {/* Audio Section */}
                        <SettingsSection title="🎵 Audio">
                            <SliderSetting
                                label="Volumen Música"
                                value={settings.musicVolume}
                                onChange={(v) => updateSetting('musicVolume', v)}
                                min={0}
                                max={100}
                            />
                            <SliderSetting
                                label="Volumen SFX"
                                value={settings.sfxVolume}
                                onChange={(v) => updateSetting('sfxVolume', v)}
                                min={0}
                                max={100}
                            />
                        </SettingsSection>

                        {/* Text Section */}
                        <SettingsSection title="⌨️ Texto">
                            <SliderSetting
                                label="Velocidad"
                                value={settings.typewriterSpeed}
                                onChange={(v) => updateSetting('typewriterSpeed', v)}
                                min={0}
                                max={5}
                                labels={['Instantáneo', '', '', '', '', 'Muy Rápido']}
                            />
                            <ToggleSetting
                                label="Auto-avance"
                                value={settings.autoAdvance}
                                onChange={(v) => updateSetting('autoAdvance', v)}
                            />
                            {settings.autoAdvance && (
                                <SliderSetting
                                    label="Delay (segundos)"
                                    value={settings.autoAdvanceDelay}
                                    onChange={(v) => updateSetting('autoAdvanceDelay', v)}
                                    min={2}
                                    max={10}
                                    showValue
                                />
                            )}
                        </SettingsSection>

                        {/* Accessibility Section */}
                        <SettingsSection title="♿ Accesibilidad">
                            <ToggleSetting
                                label="Efectos Visuales (shake/flash)"
                                value={settings.vfxEnabled}
                                onChange={(v) => updateSetting('vfxEnabled', v)}
                            />
                            <FontSizeSetting
                                value={settings.fontSize}
                                onChange={(v) => updateSetting('fontSize', v)}
                            />
                        </SettingsSection>

                        {/* Display Section */}
                        <SettingsSection title="📺 Pantalla">
                            <ToggleSetting
                                label="Pantalla Completa"
                                value={isFullscreen}
                                onChange={toggleFullscreen}
                            />
                        </SettingsSection>

                        {/* Actions */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={resetSettings}
                                className="flex-1 py-3 px-4 border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors font-bold tracking-wider"
                            >
                                RESET
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 border-2 border-bardo-accent text-bardo-accent hover:bg-bardo-accent hover:text-black transition-colors font-bold tracking-wider"
                            >
                                CERRAR
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SettingsSection({ title, children }) {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 mb-3 border-b border-gray-800 pb-1">
                {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}

function SliderSetting({ label, value, onChange, min, max, labels, showValue }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <label className="text-gray-300 text-sm">{label}</label>
                {showValue && (
                    <span className="text-bardo-accent font-mono text-sm">{value}</span>
                )}
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-bardo-accent"
            />
            {labels && (
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{labels[0]}</span>
                    <span>{labels[labels.length - 1]}</span>
                </div>
            )}
        </div>
    )
}

function ToggleSetting({ label, value, onChange }) {
    return (
        <div className="flex justify-between items-center">
            <label className="text-gray-300 text-sm">{label}</label>
            <button
                onClick={() => onChange(!value)}
                className={`
                    w-12 h-6 rounded-full relative transition-colors
                    ${value ? 'bg-bardo-accent' : 'bg-gray-700'}
                `}
            >
                <span
                    className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${value ? 'left-7' : 'left-1'}
                    `}
                />
            </button>
        </div>
    )
}

function FontSizeSetting({ value, onChange }) {
    const sizes = [
        { id: 'small', label: 'A', size: 'text-sm' },
        { id: 'normal', label: 'A', size: 'text-base' },
        { id: 'large', label: 'A', size: 'text-xl' },
    ]

    return (
        <div className="flex justify-between items-center">
            <label className="text-gray-300 text-sm">Tamaño de Fuente</label>
            <div className="flex gap-2">
                {sizes.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onChange(s.id)}
                        className={`
                            w-8 h-8 flex items-center justify-center border transition-colors
                            ${value === s.id
                                ? 'border-bardo-accent text-bardo-accent'
                                : 'border-gray-600 text-gray-400 hover:border-gray-400'
                            }
                        `}
                    >
                        <span className={s.size}>{s.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
