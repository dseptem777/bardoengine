import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import SlashCommandPalette from './SlashCommandPalette';
import { getSlashQuery, insertTag, filterCommands } from '../utils/slashCommands';
import { parseContent, TAG_ICONS } from '../nodes/PassageNode';

/**
 * NodeEditOverlay — Full-screen editing experience for a passage node.
 * Replaces the old inline editing that was cramped at 520px.
 *
 * Props:
 *   node        — the ReactFlow node being edited
 *   config      — project config (for slash command context)
 *   onClose     — () => void, saves & closes
 *   onContentChange — (nodeId, content) => void
 *   onChoicesChange — (nodeId, choices) => void
 *   onNodeDataChange — (nodeId, key, value) => void
 */
export default function NodeEditOverlay({ node, config, onClose, onContentChange, onChoicesChange, onNodeDataChange }) {
    const [editContent, setEditContent] = useState(node.data.content || node.data.text || '');
    const [editChoices, setEditChoices] = useState((node.data.choices || []).map(c => ({ ...c })));
    const [editLabel, setEditLabel] = useState(node.data.label || '');
    const [slashQuery, setSlashQuery] = useState(null);
    const [slashActiveIdx, setSlashActiveIdx] = useState(0);

    const filteredCommands = useMemo(() => filterCommands(slashQuery, config), [slashQuery, config]);
    const textareaRef = useRef(null);

    // Parse content for live tag summary
    const { tags } = parseContent(editContent);

    // Focus textarea on mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, []);

    // Save and close
    const handleDone = useCallback(() => {
        onContentChange(node.id, editContent);
        const validChoices = editChoices.filter(c => c.text.trim());
        onChoicesChange(node.id, validChoices);
        if (editLabel !== (node.data.label || '')) {
            onNodeDataChange(node.id, 'label', editLabel);
        }
        onClose();
    }, [node.id, editContent, editChoices, editLabel, onContentChange, onChoicesChange, onNodeDataChange, onClose]);

    // Slash command selection
    const handleSlashSelect = useCallback((command) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const cursor = textarea.selectionStart;
        const newContent = insertTag(editContent, cursor, slashQuery, command.tag);
        setEditContent(newContent);
        setSlashQuery(null);
        setSlashActiveIdx(0);
        requestAnimationFrame(() => {
            const newCursor = cursor - slashQuery.length - 1 + command.tag.length;
            textarea.setSelectionRange(newCursor, newCursor);
            textarea.focus();
        });
    }, [editContent, slashQuery]);

    // Keyboard in textarea
    const handleKeyDown = useCallback((e) => {
        e.stopPropagation();
        if (slashQuery !== null && filteredCommands.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSlashActiveIdx(i => Math.min(i + 1, filteredCommands.length - 1));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSlashActiveIdx(i => Math.max(i - 1, 0));
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                handleSlashSelect(filteredCommands[slashActiveIdx]);
                return;
            }
            if (e.key === 'Escape') {
                setSlashQuery(null);
                return;
            }
        }
        if (e.key === 'Escape') {
            handleDone();
        }
    }, [slashQuery, filteredCommands, slashActiveIdx, handleSlashSelect, handleDone]);

    // Textarea change + slash detection
    const handleTextareaChange = useCallback((e) => {
        const val = e.target.value;
        const cursor = e.target.selectionStart;
        setEditContent(val);
        const query = getSlashQuery(val, cursor);
        setSlashQuery(query);
        setSlashActiveIdx(0);
    }, []);

    // Choice editing helpers
    const addChoice = useCallback(() => {
        setEditChoices(prev => [...prev, { text: '' }]);
    }, []);

    const removeChoice = useCallback((index) => {
        setEditChoices(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateChoiceText = useCallback((index, text) => {
        setEditChoices(prev => prev.map((c, i) => i === index ? { ...c, text } : c));
    }, []);

    const toggleChoiceSticky = useCallback((index) => {
        setEditChoices(prev => prev.map((c, i) => {
            if (i !== index) return c;
            return { ...c, sticky: c.sticky === false ? true : false };
        }));
    }, []);

    const updateChoiceCondition = useCallback((index, condition) => {
        setEditChoices(prev => prev.map((c, i) => i === index ? { ...c, condition } : c));
    }, []);

    const nodeType = node.data.type || 'knot';

    return (
        <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-sm flex items-stretch justify-center" onClick={handleDone}>
            <div
                className="w-full max-w-6xl m-6 bg-[#101622] border border-[#282e39] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#282e39] bg-[#101622]/90">
                    <div className="flex items-center gap-4 flex-1">
                        <span className="material-symbols-outlined text-[#2b6cee] text-xl">edit_note</span>
                        <input
                            className="bg-transparent text-white text-lg font-bold focus:outline-none border-b-2 border-transparent focus:border-[#2b6cee] transition-colors px-1 flex-1 max-w-md"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            placeholder="Node label..."
                        />
                        <span className="text-[10px] text-[#4b5563] font-mono">{node.id}</span>
                    </div>
                    <button
                        onClick={handleDone}
                        className="px-5 py-2 bg-[#2b6cee] hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Done
                    </button>
                </div>

                {/* Main content area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Editor */}
                    <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
                        {/* Textarea with slash palette */}
                        <div className="flex-1 relative flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-[#9da6b9] tracking-wider mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs">description</span>
                                Content
                                <span className="text-[#4b5563] normal-case font-normal">— Type / for tags</span>
                            </label>
                            <div className="relative flex-1">
                                <textarea
                                    ref={textareaRef}
                                    className="w-full h-full bg-[#0b0c10] border border-[#282e39] rounded-xl p-4 text-sm text-white/90 focus:outline-none focus:border-[#2b6cee] transition-colors resize-none font-mono leading-relaxed placeholder-[#4b5563]"
                                    value={editContent}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Write your story here...&#10;&#10;Type / to insert tags (e.g. /shake, /music)&#10;Lines starting with # are engine tags.&#10;Everything else is narrative text."
                                />
                                {slashQuery !== null && filteredCommands.length > 0 && (
                                    <div className="absolute bottom-0 left-0 right-0">
                                        <SlashCommandPalette
                                            commands={filteredCommands}
                                            activeIndex={slashActiveIdx}
                                            onSelect={handleSlashSelect}
                                            onDismiss={() => setSlashQuery(null)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Choices editor */}
                        <div className="border-t border-[#282e39] pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-xs">call_split</span>
                                    Choices
                                </span>
                                <span className="text-[9px] text-[#4b5563]">{editChoices.length} options</span>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {editChoices.map((choice, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleChoiceSticky(i)}
                                                className={`shrink-0 w-6 h-6 rounded text-xs font-bold flex items-center justify-center border transition-colors ${
                                                    choice.sticky === false
                                                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                                        : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                }`}
                                                title={choice.sticky === false ? 'Consumable (*) — disappears after use' : 'Sticky (+) — always available'}
                                            >
                                                {choice.sticky === false ? '*' : '+'}
                                            </button>
                                            <input
                                                className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                value={choice.text}
                                                onChange={(e) => updateChoiceText(i, e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                placeholder={`Choice ${i + 1}`}
                                            />
                                            <button
                                                onClick={() => removeChoice(i)}
                                                className="text-[#4b5563] hover:text-red-400 transition-colors shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                        <input
                                            className="ml-8 w-[calc(100%-2.5rem)] bg-[#0b0c10] border border-[#282e39] rounded px-3 py-1 text-[11px] text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 transition-colors placeholder-[#4b5563]"
                                            value={choice.condition || ''}
                                            onChange={(e) => updateChoiceCondition(i, e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            placeholder="condition (e.g. has_key, hp > 0)"
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addChoice}
                                className="mt-2 w-full py-1.5 flex items-center justify-center gap-1.5 bg-[#1c1f27] text-[#9da6b9] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg border border-[#282e39] border-dashed transition-all text-xs"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add choice
                            </button>
                        </div>
                    </div>

                    {/* Right: Properties panel */}
                    <div className="w-72 border-l border-[#282e39] bg-[#0b0c10]/50 overflow-y-auto p-5 space-y-5">
                        {/* ID */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-[#9da6b9] tracking-wider mb-1 block">Node ID</label>
                            <div className="bg-[#1c1f27] rounded-lg px-3 py-2 text-xs text-[#4b5563] font-mono border border-[#282e39]">
                                {node.id}
                            </div>
                        </div>

                        {/* Chapter */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-[#9da6b9] tracking-wider mb-1 block">Chapter</label>
                            <input
                                className="w-full bg-[#1c1f27] border border-[#282e39] rounded-lg px-3 py-2 text-sm text-white focus:border-[#2b6cee] focus:outline-none transition-colors"
                                value={node.data.chapter || ''}
                                onChange={(e) => onNodeDataChange(node.id, 'chapter', e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                placeholder="e.g. Act 1"
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-[#9da6b9] tracking-wider mb-1 block">Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['hub', 'knot'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => onNodeDataChange(node.id, 'type', t)}
                                        className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                            nodeType === t
                                                ? 'bg-[#2b6cee]/20 border-[#2b6cee] text-[#2b6cee]'
                                                : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Burned toggle */}
                        {nodeType !== 'hub' && (
                            <div className="flex items-center gap-3 pt-3 border-t border-[#282e39]">
                                <input
                                    type="checkbox"
                                    id="overlay-burned"
                                    checked={node.data.isBurned || false}
                                    onChange={(e) => onNodeDataChange(node.id, 'isBurned', e.target.checked)}
                                    className="w-4 h-4 rounded border-[#282e39] bg-[#1c1f27] text-red-500 focus:ring-0"
                                />
                                <label htmlFor="overlay-burned" className="text-sm text-[#9da6b9]">Burned</label>
                            </div>
                        )}

                        {/* Live tag summary */}
                        {tags.length > 0 && (
                            <div className="pt-3 border-t border-[#282e39]">
                                <label className="text-[10px] uppercase font-bold text-[#9da6b9] tracking-wider mb-2 block">
                                    Active Tags ({tags.length})
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag, i) => {
                                        const tagStyle = TAG_ICONS[tag.key] || { icon: 'tag', color: 'text-gray-300 bg-gray-500/15 border-gray-500/30' };
                                        return (
                                            <span
                                                key={i}
                                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${tagStyle.color}`}
                                                title={tag.raw}
                                            >
                                                <span className="material-symbols-outlined text-[11px]">{tagStyle.icon}</span>
                                                {tag.value ? `${tag.key}:${tag.value}` : tag.key}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Keyboard hints */}
                        <div className="pt-3 border-t border-[#282e39] space-y-1.5">
                            <p className="text-[10px] text-[#4b5563]">
                                <kbd className="px-1 py-0.5 bg-[#1c1f27] border border-[#282e39] rounded text-[9px] font-mono">Esc</kbd> Save & close
                            </p>
                            <p className="text-[10px] text-[#4b5563]">
                                <kbd className="px-1 py-0.5 bg-[#1c1f27] border border-[#282e39] rounded text-[9px] font-mono">/</kbd> Insert tag
                            </p>
                            <p className="text-[10px] text-[#4b5563]">
                                Lines starting with <kbd className="px-1 py-0.5 bg-[#1c1f27] border border-[#282e39] rounded text-[9px] font-mono">#</kbd> are engine tags
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
