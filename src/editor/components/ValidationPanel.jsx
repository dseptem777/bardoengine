import React, { useState, useMemo } from 'react';

const SEVERITY_CONFIG = {
    error:   { icon: 'error',   color: 'text-red-400',    bg: 'bg-red-500/20',    label: 'Errors' },
    warning: { icon: 'warning', color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Warnings' },
    info:    { icon: 'info',    color: 'text-blue-400',   bg: 'bg-blue-500/20',   label: 'Info' },
};

/**
 * ValidationPanel — Shows graph validation warnings with severity filtering.
 *
 * Props:
 *   warnings   — Array of { type, nodeId, message }
 *   onClose    — () => void
 *   onJumpTo   — (nodeId) => void
 */
export default function ValidationPanel({ warnings, onClose, onJumpTo }) {
    const [filter, setFilter] = useState('all'); // 'all' | 'error' | 'warning' | 'info'

    const counts = useMemo(() => {
        const c = { error: 0, warning: 0, info: 0 };
        warnings.forEach(w => { if (c[w.type] !== undefined) c[w.type]++; });
        return c;
    }, [warnings]);

    const filtered = useMemo(() => {
        if (filter === 'all') return warnings;
        return warnings.filter(w => w.type === filter);
    }, [warnings, filter]);

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[520px]">
            <div className="bg-[#101622] border border-[#282e39] rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#282e39]">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#2b6cee] text-sm">checklist</span>
                        <span className="text-white text-sm font-bold">Validation</span>
                        <span className="text-[#4b5563] text-xs">({warnings.length} total)</span>
                    </div>
                    <button onClick={onClose} className="text-[#9da6b9] hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                {/* Severity filter tabs */}
                <div className="flex items-center gap-1 px-4 py-2 border-b border-[#282e39]">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                            filter === 'all' ? 'bg-[#2b6cee]/20 text-[#2b6cee]' : 'text-[#4b5563] hover:text-[#9da6b9]'
                        }`}
                    >
                        All ({warnings.length})
                    </button>
                    {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${
                                filter === key ? `${cfg.bg} ${cfg.color}` : 'text-[#4b5563] hover:text-[#9da6b9]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
                            {counts[key]}
                        </button>
                    ))}
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto">
                    {filtered.length === 0 && (
                        <p className="px-4 py-6 text-[#4b5563] text-xs text-center">
                            {warnings.length === 0 ? 'No issues found!' : 'No issues match the selected filter'}
                        </p>
                    )}
                    {filtered.map((w, i) => {
                        const cfg = SEVERITY_CONFIG[w.type] || SEVERITY_CONFIG.info;
                        return (
                            <button
                                key={i}
                                onClick={() => { if (w.nodeId) onJumpTo(w.nodeId); }}
                                disabled={!w.nodeId}
                                className="w-full px-4 py-2.5 text-left hover:bg-[#1c1f27] transition-colors flex items-start gap-3 border-b border-[#282e39]/50 last:border-b-0 disabled:opacity-60 disabled:cursor-default"
                            >
                                <span className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${cfg.color}`}>
                                    {cfg.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs">{w.message}</p>
                                    {w.nodeId && <p className="text-[#4b5563] text-[10px] font-mono mt-0.5">{w.nodeId}</p>}
                                </div>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${cfg.bg} ${cfg.color}`}>
                                    {w.type}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
