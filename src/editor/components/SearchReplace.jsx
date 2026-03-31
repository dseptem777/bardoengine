import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * SearchReplace — Find & Replace across all node content.
 *
 * Props:
 *   nodes       — ReactFlow nodes array
 *   onClose     — () => void
 *   onJumpTo    — (nodeId) => void
 *   onReplace   — (nodeId, find, replace, caseSensitive) => void — replaces one occurrence in a node
 *   onReplaceAll — (find, replace, caseSensitive) => number — replaces all, returns count
 */
export default function SearchReplace({ nodes, onClose, onJumpTo, onReplace, onReplaceAll }) {
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [replaceFeedback, setReplaceFeedback] = useState('');
    const findRef = useRef(null);

    useEffect(() => {
        findRef.current?.focus();
    }, []);

    // Search results
    const results = useMemo(() => {
        if (!findText) return [];
        const query = caseSensitive ? findText : findText.toLowerCase();
        const matches = [];

        for (const node of nodes) {
            const content = node.data?.content || node.data?.text || '';
            const searchContent = caseSensitive ? content : content.toLowerCase();
            const label = node.data?.label || node.id;

            if (searchContent.includes(query)) {
                // Find match context
                const idx = searchContent.indexOf(query);
                const start = Math.max(0, idx - 30);
                const end = Math.min(content.length, idx + findText.length + 30);
                const context = content.slice(start, end);

                matches.push({
                    nodeId: node.id,
                    label,
                    context,
                    matchIndex: idx,
                    nodeType: node.data?.type || 'knot',
                });
            }
        }

        return matches;
    }, [nodes, findText, caseSensitive]);

    const handleReplace = useCallback((nodeId) => {
        onReplace(nodeId, findText, replaceText, caseSensitive);
        setReplaceFeedback(`Replaced in ${nodeId}`);
        setTimeout(() => setReplaceFeedback(''), 2000);
    }, [findText, replaceText, caseSensitive, onReplace]);

    const handleReplaceAll = useCallback(() => {
        const count = onReplaceAll(findText, replaceText, caseSensitive);
        setReplaceFeedback(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
        setTimeout(() => setReplaceFeedback(''), 2000);
    }, [findText, replaceText, caseSensitive, onReplaceAll]);

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[520px]" onKeyDown={(e) => e.stopPropagation()}>
            <div className="bg-[#101622] border border-[#2b6cee]/50 rounded-xl shadow-2xl shadow-[#2b6cee]/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#282e39]">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#2b6cee] text-sm">find_replace</span>
                        <span className="text-white text-sm font-bold">Search & Replace</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCaseSensitive(!caseSensitive)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                caseSensitive
                                    ? 'bg-[#2b6cee]/20 border-[#2b6cee] text-[#2b6cee]'
                                    : 'border-[#282e39] text-[#4b5563] hover:text-[#9da6b9]'
                            }`}
                            title="Case sensitive"
                        >
                            Aa
                        </button>
                        <button onClick={onClose} className="text-[#9da6b9] hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </div>

                {/* Find / Replace inputs */}
                <div className="px-4 py-3 space-y-2 border-b border-[#282e39]">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#4b5563] uppercase font-bold w-14 shrink-0">Find</span>
                        <input
                            ref={findRef}
                            className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2b6cee] transition-colors"
                            value={findText}
                            onChange={(e) => setFindText(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Escape') onClose();
                            }}
                            placeholder="Search text..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#4b5563] uppercase font-bold w-14 shrink-0">Replace</span>
                        <input
                            className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2b6cee] transition-colors"
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Escape') onClose();
                            }}
                            placeholder="Replace with..."
                        />
                        <button
                            onClick={handleReplaceAll}
                            disabled={!findText || results.length === 0}
                            className="px-3 py-1.5 bg-[#2b6cee] hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                            Replace All
                        </button>
                    </div>
                    {replaceFeedback && (
                        <p className="text-[10px] text-green-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px]">check</span>
                            {replaceFeedback}
                        </p>
                    )}
                </div>

                {/* Results */}
                <div className="max-h-64 overflow-y-auto">
                    {findText && results.length === 0 && (
                        <p className="px-4 py-4 text-[#4b5563] text-xs text-center">No matches found</p>
                    )}
                    {!findText && (
                        <p className="px-4 py-4 text-[#4b5563] text-xs text-center">Type to search across all nodes</p>
                    )}
                    {results.map((r, i) => (
                        <div
                            key={`${r.nodeId}-${i}`}
                            className="px-4 py-2.5 hover:bg-[#1c1f27] transition-colors flex items-start gap-3 border-b border-[#282e39]/50 last:border-b-0"
                        >
                            <span className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${r.nodeType === 'hub' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                {r.nodeType === 'hub' ? 'castle' : 'radio_button_checked'}
                            </span>
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onJumpTo(r.nodeId)}>
                                <p className="text-white text-xs font-bold truncate">{r.label}</p>
                                <p className="text-[#9da6b9] text-[10px] font-mono mt-0.5 truncate">...{r.context}...</p>
                            </div>
                            <button
                                onClick={() => handleReplace(r.nodeId)}
                                disabled={!replaceText && replaceText !== ''}
                                className="shrink-0 px-2 py-1 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded hover:bg-amber-500/30 transition-colors"
                                title="Replace in this node"
                            >
                                Replace
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-[#282e39] text-[9px] text-[#4b5563] flex items-center gap-3">
                    <span>{results.length} match{results.length !== 1 ? 'es' : ''}</span>
                    <span>Ctrl+H to toggle</span>
                    <span>Esc to close</span>
                </div>
            </div>
        </div>
    );
}
