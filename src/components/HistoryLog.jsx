import React, { useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react'
import { useModalA11y } from '../hooks/useModalA11y'

/**
 * HistoryLog - Modal component to display the narrative history (Bitácora)
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the log is visible
 * @param {Array} props.history - Array of narrative strings
 * @param {Function} props.onClose - Function to close the log
 */
const HistoryLog = ({ isOpen, history, onClose }) => {
    const scrollRef = useRef(null);
    const modalRef = useModalA11y(isOpen, onClose);

    // Scroll to ~600px from bottom when opened, so user sees recent entries
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            const el = scrollRef.current
            el.scrollTop = Math.max(0, el.scrollHeight - 600)
        }
    }, [isOpen, history]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label="Bitácora"
                className="w-full max-w-4xl max-h-[80vh] bg-bardo-bg border-[var(--ui-border-width)] border-bardo-accent flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300"
                style={{ borderRadius: 'var(--ui-border-radius)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-bardo-accent font-header text-xl uppercase tracking-widest flex items-center gap-2">
                        <BookOpen size={20} /> Bitácora Narrativa
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-bardo-accent transition-colors p-2 text-2xl"
                        title="Cerrar (Esc)"
                    >
                        ✕
                    </button>
                </div>

                {/* History Content */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-thin scrollbar-thumb-bardo-accent scrollbar-track-transparent"
                >
                    {history.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-white/30 italic font-main">
                            El registro está vacío. Tu historia recién comienza...
                        </div>
                    ) : (
                        history.map((entry, index) => {
                            const isChoice = entry.type === 'choice'
                            const text = typeof entry === 'string' ? entry : entry.text

                            return (
                                <p
                                    key={index}
                                    className={`font-main text-lg leading-relaxed border-l-2 border-bardo-accent/20 pl-4 animate-in slide-in-from-left-4 duration-500 
                                        ${isChoice ? 'text-bardo-accent/60 italic' : 'text-bardo-text'}`}
                                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                                >
                                    {text}
                                </p>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-black/20 flex items-center justify-between border-t border-white/5">
                    <button
                        onClick={() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }}
                        className="text-white/30 hover:text-bardo-accent text-xs font-mono uppercase tracking-tighter transition-colors"
                    >
                        ↑ Inicio
                    </button>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-tighter">
                        — Fin del Registro Actual —
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HistoryLog;
