import React, { useState, useEffect, useRef } from 'react'

export default function InputOverlay({
    isOpen,
    placeholder,
    onCommit,
    onCancel
}) {
    const [value, setValue] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setValue('')
            // Auto-focus after a short delay to ensure modal is open
            const timer = setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        if (value.trim()) {
            onCommit(value.trim())
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onCancel()
        }
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-bardo-bg border border-bardo-accent/30 rounded-lg shadow-2xl p-8 transform animate-in slide-in-from-bottom-8 duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block font-mono text-bardo-accent text-xs tracking-widest uppercase opacity-70">
                            Registro de Identidad
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full bg-white/5 border-b border-bardo-accent/40 py-4 px-2 text-xl text-white font-mono focus:outline-none focus:border-bardo-accent transition-colors placeholder:text-white/20"
                            maxLength={24}
                        />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <p className="text-[10px] font-mono text-white/40 italic uppercase tracking-tighter">
                            Presioná ENTER para confirmar
                        </p>
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="px-6 py-2 bg-bardo-accent text-bardo-bg font-mono font-bold text-sm tracking-widest uppercase hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ACEPTAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
