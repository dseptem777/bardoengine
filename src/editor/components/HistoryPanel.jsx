import React from 'react';

/**
 * HistoryPanel — Sidebar timeline showing undo/redo history.
 *
 * Props:
 *   history     — { entries: [{ index, label, timestamp, isCurrent }], currentIndex }
 *   onJumpTo    — (index) => void
 *   onClose     — () => void
 *   canUndo     — boolean
 *   canRedo     — boolean
 *   undo        — () => void
 *   redo        — () => void
 */
export default function HistoryPanel({ history, onJumpTo, onClose, canUndo, canRedo, undo, redo }) {
    const entries = history?.entries || [];

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="absolute top-6 right-6 bottom-20 w-72 bg-[#101622]/90 backdrop-blur-xl border border-[#282e39] rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#282e39]">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2b6cee] text-sm">history</span>
                    History
                </h4>
                <div className="flex items-center gap-1">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${canUndo ? 'text-[#9da6b9] hover:text-white hover:bg-[#282e39]' : 'text-[#282e39] cursor-not-allowed'}`}
                        title="Undo"
                    >
                        <span className="material-symbols-outlined text-sm">undo</span>
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${canRedo ? 'text-[#9da6b9] hover:text-white hover:bg-[#282e39]' : 'text-[#282e39] cursor-not-allowed'}`}
                        title="Redo"
                    >
                        <span className="material-symbols-outlined text-sm">redo</span>
                    </button>
                    <button onClick={onClose} className="text-[#9da6b9] hover:text-white transition-colors ml-1">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto">
                {entries.length === 0 && (
                    <p className="px-4 py-6 text-[#4b5563] text-xs text-center">No history yet</p>
                )}
                {entries.slice().reverse().map((entry) => (
                    <button
                        key={entry.index}
                        onClick={() => onJumpTo(entry.index)}
                        className={`w-full px-4 py-2.5 text-left transition-colors flex items-start gap-3 border-b border-[#282e39]/50 last:border-b-0 ${
                            entry.isCurrent ? 'bg-[#2b6cee]/10 border-l-2 border-l-[#2b6cee]' : 'hover:bg-[#1c1f27]'
                        }`}
                    >
                        {/* Timeline dot */}
                        <div className="mt-1.5 shrink-0">
                            <div className={`w-2 h-2 rounded-full ${entry.isCurrent ? 'bg-[#2b6cee]' : 'bg-[#282e39]'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${entry.isCurrent ? 'text-white' : 'text-[#9da6b9]'}`}>
                                {entry.label}
                            </p>
                            <p className="text-[10px] text-[#4b5563] font-mono mt-0.5">
                                {formatTime(entry.timestamp)}
                            </p>
                        </div>
                        {entry.isCurrent && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2b6cee]/20 text-[#2b6cee]">
                                Current
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
