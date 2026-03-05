import React, { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import SlashCommandPalette from '../components/SlashCommandPalette';
import { getSlashQuery, insertTag, filterCommands } from '../utils/slashCommands';

const TYPE_COLORS = {
    hub: { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-400', headerBg: 'bg-blue-500/15', glow: 'shadow-blue-500/30' },
    knot: { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-400', headerBg: 'bg-yellow-500/15', glow: 'shadow-yellow-500/30' },
};

const TYPE_ICONS = {
    hub: 'castle',
    knot: 'radio_button_checked',
};

const TAG_ICONS = {
    music: { icon: 'music_note', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
    play_sfx: { icon: 'volume_up', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
    shake: { icon: 'vibration', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    flash_red: { icon: 'flash_on', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    flash_white: { icon: 'flash_on', color: 'text-white bg-white/10 border-white/30' },
    bg: { icon: 'image', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
    MINIGAME: { icon: 'sports_esports', color: 'text-green-300 bg-green-500/15 border-green-500/30' },
    KEY_MASH: { icon: 'keyboard', color: 'text-green-300 bg-green-500/15 border-green-500/30' },
    WILLPOWER_START: { icon: 'psychology', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    WILLPOWER_STOP: { icon: 'psychology', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    WILLPOWER_CHECK: { icon: 'psychology', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    MOUSE_RESISTANCE: { icon: 'mouse', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    SPIDER_START: { icon: 'bug_report', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    SPIDER_STOP: { icon: 'bug_report', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    SPIDER_CHECK: { icon: 'bug_report', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    BOSS_START: { icon: 'swords', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    BOSS_PHASE: { icon: 'swords', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    BOSS_DAMAGE: { icon: 'swords', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    BOSS_CHECK: { icon: 'swords', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    BOSS_STOP: { icon: 'swords', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    VISUAL_DAMAGE: { icon: 'broken_image', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    stat: { icon: 'bar_chart', color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' },
    inventory_add: { icon: 'inventory_2', color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' },
    inventory_remove: { icon: 'inventory_2', color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' },
    achievement: { icon: 'emoji_events', color: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30' },
    input: { icon: 'edit', color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' },
    wait: { icon: 'hourglass_empty', color: 'text-gray-300 bg-gray-500/15 border-gray-500/30' },
    clear: { icon: 'delete_sweep', color: 'text-gray-300 bg-gray-500/15 border-gray-500/30' },
    next: { icon: 'skip_next', color: 'text-gray-300 bg-gray-500/15 border-gray-500/30' },
    UI_EFFECT: { icon: 'blur_on', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
    ARREBATADOS_START: { icon: 'local_fire_department', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    ARREBATADOS_STOP: { icon: 'local_fire_department', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
    music_stop: { icon: 'music_off', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
};

// Tag category detection — priority: horror > combat > minigame > vfx > game
const HORROR_TAGS = new Set(['WILLPOWER_START', 'WILLPOWER_STOP', 'WILLPOWER_CHECK', 'MOUSE_RESISTANCE', 'SPIDER_START', 'SPIDER_STOP', 'SPIDER_CHECK', 'UI_EFFECT']);
const COMBAT_TAGS = new Set(['BOSS_START', 'BOSS_PHASE', 'BOSS_DAMAGE', 'BOSS_CHECK', 'BOSS_STOP', 'ARREBATADOS_START', 'ARREBATADOS_STOP', 'VISUAL_DAMAGE']);
const MINIGAME_TAGS = new Set(['MINIGAME', 'KEY_MASH']);
const VFX_TAGS = new Set(['shake', 'flash_red', 'flash_white', 'bg', 'play_sfx', 'music', 'music_stop']);
const GAME_TAGS = new Set(['stat', 'inventory_add', 'inventory_remove', 'achievement', 'input']);

const TAG_CATEGORY_COLORS = {
    horror:   { border: 'border-red-500',    ring: 'ring-red-500/20',    minimap: '#ef4444' },
    combat:   { border: 'border-orange-500', ring: 'ring-orange-500/20', minimap: '#f97316' },
    minigame: { border: 'border-green-500',  ring: 'ring-green-500/20',  minimap: '#22c55e' },
    vfx:      { border: 'border-purple-500', ring: 'ring-purple-500/20', minimap: '#a855f7' },
    game:     { border: 'border-cyan-500',   ring: 'ring-cyan-500/20',   minimap: '#06b6d4' },
};

function getDominantTagCategory(tags) {
    if (!tags || tags.length === 0) return null;
    const keys = tags.map(t => t.key);
    if (keys.some(k => HORROR_TAGS.has(k))) return 'horror';
    if (keys.some(k => COMBAT_TAGS.has(k))) return 'combat';
    if (keys.some(k => MINIGAME_TAGS.has(k))) return 'minigame';
    if (keys.some(k => VFX_TAGS.has(k))) return 'vfx';
    if (keys.some(k => GAME_TAGS.has(k))) return 'game';
    return null;
}

// Export for MiniMap coloring in BardoEditor
export { getDominantTagCategory, TAG_CATEGORY_COLORS, parseContent };

// Chapter color palette (auto-assigned by index)
const CHAPTER_COLORS = [
    { bg: 'bg-violet-500',  text: 'text-violet-300',  hex: '#8b5cf6' },
    { bg: 'bg-teal-500',    text: 'text-teal-300',    hex: '#14b8a6' },
    { bg: 'bg-pink-500',    text: 'text-pink-300',    hex: '#ec4899' },
    { bg: 'bg-lime-500',    text: 'text-lime-300',    hex: '#84cc16' },
    { bg: 'bg-sky-500',     text: 'text-sky-300',     hex: '#0ea5e9' },
    { bg: 'bg-amber-500',   text: 'text-amber-300',   hex: '#f59e0b' },
    { bg: 'bg-rose-500',    text: 'text-rose-300',    hex: '#f43f5e' },
    { bg: 'bg-emerald-500', text: 'text-emerald-300', hex: '#10b981' },
];

export { CHAPTER_COLORS };

/**
 * Parse content lines to extract tags and narrative text.
 */
function parseContent(content) {
    if (!content) return { narrativeLines: [], tags: [] };

    const lines = content.split('\n');
    const narrativeLines = [];
    const tags = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) {
            const tagRaw = trimmed.slice(1); // remove leading #
            // Extract tag key (before : or space or end)
            const colonIdx = tagRaw.indexOf(':');
            const spaceIdx = tagRaw.indexOf(' ');
            let key, value;

            if (colonIdx > 0) {
                key = tagRaw.slice(0, colonIdx).trim();
                value = tagRaw.slice(colonIdx + 1).trim();
            } else if (spaceIdx > 0) {
                key = tagRaw.slice(0, spaceIdx).trim();
                value = tagRaw.slice(spaceIdx + 1).trim();
            } else {
                key = tagRaw.trim();
                value = '';
            }

            // Handle music:stop as a special case
            if (key === 'music' && value === 'stop') {
                tags.push({ key: 'music_stop', value: '', raw: trimmed });
            } else {
                tags.push({ key, value, raw: trimmed });
            }
        } else {
            narrativeLines.push(line);
        }
    }

    return { narrativeLines, tags };
}

/**
 * PassageNode - Unified node that shows narrative text directly in the canvas.
 * Supports inline editing on double-click and inline choices (Phase 3).
 * Tag-based coloring and chapter badges (Phase 7).
 */
export default memo(({ id, data, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editChoices, setEditChoices] = useState([]);
    const [slashQuery, setSlashQuery] = useState(null);
    const [slashActiveIdx, setSlashActiveIdx] = useState(0);

    const filteredCommands = useMemo(() => filterCommands(slashQuery, data._config), [slashQuery, data._config]);
    const textareaRef = useRef(null);
    const editContainerRef = useRef(null);

    const nodeType = data.type || 'knot';
    const colors = TYPE_COLORS[nodeType] || TYPE_COLORS.knot;
    const icon = TYPE_ICONS[nodeType] || 'radio_button_checked';
    const isBurned = data.isBurned;
    const content = data.content || data.text || '';
    const choices = data.choices || [];
    const hasInlineChoices = choices.length > 0;
    const chapter = data.chapter || '';
    const isFiltered = data._filtered; // set by BardoEditor when chapter filter is active

    const { narrativeLines, tags } = parseContent(content);
    const previewText = narrativeLines.filter(l => l.trim()).slice(0, 6).join('\n');
    const hasMoreText = narrativeLines.filter(l => l.trim()).length > 6;

    // Dominant tag category for border coloring
    const tagCategory = getDominantTagCategory(tags);
    const categoryColors = tagCategory ? TAG_CATEGORY_COLORS[tagCategory] : null;

    // Border class: tag category overrides type color (except when selected)
    const borderClass = selected
        ? 'border-white'
        : isBurned
            ? 'border-gray-600'
            : categoryColors
                ? `${categoryColors.border}/70 hover:${categoryColors.border}`
                : `${colors.border}/60 hover:${colors.border}`;

    // Chapter color (auto-assigned by index from parent)
    const chapterColorIdx = data._chapterColorIdx ?? -1;
    const chapterColor = chapterColorIdx >= 0 ? CHAPTER_COLORS[chapterColorIdx % CHAPTER_COLORS.length] : null;

    // Enter edit mode
    const handleDoubleClick = useCallback((e) => {
        e.stopPropagation();
        setEditContent(content);
        setEditChoices(choices.map(c => ({ ...c })));
        setIsEditing(true);
    }, [content, choices]);

    // Focus textarea when entering edit mode
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
                textareaRef.current.value.length,
                textareaRef.current.value.length
            );
        }
    }, [isEditing]);

    // Commit edit and close
    const commitEdit = useCallback(() => {
        if (isEditing) {
            if (data.onContentChange) {
                data.onContentChange(id, editContent);
            }
            if (data.onChoicesChange) {
                // Filter out empty choices
                const validChoices = editChoices.filter(c => c.text.trim());
                data.onChoicesChange(id, validChoices);
            }
        }
        setSlashQuery(null);
        setIsEditing(false);
    }, [isEditing, id, editContent, editChoices, data]);

    // Handle blur on the edit container — only close if focus leaves entirely
    const handleContainerBlur = useCallback((e) => {
        if (editContainerRef.current && editContainerRef.current.contains(e.relatedTarget)) {
            return;
        }
        commitEdit();
    }, [commitEdit]);

    // Handle slash command selection
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

    // Handle keyboard in textarea
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
            commitEdit();
        }
    }, [slashQuery, filteredCommands, slashActiveIdx, handleSlashSelect, commitEdit]);

    // Auto-resize textarea + slash detection
    const handleTextareaChange = useCallback((e) => {
        const val = e.target.value;
        const cursor = e.target.selectionStart;
        setEditContent(val);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        const query = getSlashQuery(val, cursor);
        setSlashQuery(query);
        setSlashActiveIdx(0);
    }, []);

    // Inline choice editing helpers
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

    // Quick add choice without entering full edit mode
    const handleAddChoiceClick = useCallback((e) => {
        e.stopPropagation();
        if (data.onChoicesChange) {
            data.onChoicesChange(id, [...choices, { text: 'New choice' }]);
        }
    }, [id, choices, data]);

    const nodeWidth = isEditing ? 520 : 280;

    return (
        <div
            className={`group relative transition-all duration-300 ${isBurned ? 'opacity-50 grayscale' : ''} ${isFiltered ? 'opacity-15 pointer-events-none' : ''}`}
            style={{ width: nodeWidth }}
            onDoubleClick={handleDoubleClick}
        >
            {/* Target handle */}
            <Handle
                type="target"
                position={Position.Left}
                className={`!w-3 !h-3 ${colors.bg}`}
            />

            {/* Main card */}
            <div
                className={`rounded-xl bg-[#101622] border-2 shadow-xl transition-all duration-200 overflow-hidden ${
                    selected
                        ? `${borderClass} shadow-lg ${colors.glow}`
                        : borderClass
                }`}
            >
                {/* Header */}
                <div className={`flex items-center gap-2 px-3 py-2 ${colors.headerBg} border-b border-[#282e39]`}>
                    <span className={`material-symbols-outlined text-base ${colors.text}`}>{icon}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.text}`}>
                        {nodeType}
                    </span>
                    {chapter && chapterColor && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${chapterColor.bg}/20 ${chapterColor.text} border border-current/20`}>
                            {chapter}
                        </span>
                    )}
                    {isBurned && (
                        <span className="material-symbols-outlined text-red-500 text-xs ml-auto">local_fire_department</span>
                    )}
                    <span className="text-white text-xs font-semibold ml-auto truncate max-w-[120px]">
                        {data.label || 'Untitled'}
                    </span>
                </div>

                {/* Body */}
                <div className="px-3 py-2 min-h-[60px]">
                    {isEditing ? (
                        /* Edit mode */
                        <div ref={editContainerRef} onBlur={handleContainerBlur} onWheel={(e) => e.stopPropagation()} className="nopan">
                            <div className="relative">
                                <textarea
                                    ref={textareaRef}
                                    className="w-full bg-[#0b0c10] border border-[#282e39] rounded-lg p-2 text-sm text-white/90 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono leading-relaxed placeholder-[#4b5563]"
                                    value={editContent}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Write your story here...&#10;&#10;Type / to insert tags (e.g. /shake, /music)"
                                    style={{ minHeight: '120px' }}
                                />
                                {slashQuery !== null && filteredCommands.length > 0 && (
                                    <SlashCommandPalette
                                        commands={filteredCommands}
                                        activeIndex={slashActiveIdx}
                                        onSelect={handleSlashSelect}
                                        onDismiss={() => setSlashQuery(null)}
                                    />
                                )}
                            </div>

                            {/* Inline choices editor */}
                            {(
                                <div className="mt-3 border-t border-[#282e39] pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">call_split</span>
                                            Choices
                                        </span>
                                        <span className="text-[9px] text-[#4b5563]">{editChoices.length} options</span>
                                    </div>
                                    <div className="space-y-2">
                                        {editChoices.map((choice, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleChoiceSticky(i); }}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        className={`shrink-0 w-5 h-5 rounded text-xs font-bold flex items-center justify-center border transition-colors ${
                                                            choice.sticky === false
                                                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                                                : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                        }`}
                                                        title={choice.sticky === false ? 'Consumable (*) — disappears after use' : 'Sticky (+) — always available'}
                                                    >
                                                        {choice.sticky === false ? '*' : '+'}
                                                    </button>
                                                    <input
                                                        className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                        value={choice.text}
                                                        onChange={(e) => updateChoiceText(i, e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        placeholder={`Choice ${i + 1}`}
                                                    />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeChoice(i); }}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        className="text-[#4b5563] hover:text-red-400 transition-colors shrink-0"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>
                                                <input
                                                    className="ml-6 w-[calc(100%-2rem)] bg-[#0b0c10] border border-[#282e39] rounded px-2 py-0.5 text-[10px] text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 transition-colors placeholder-[#4b5563]"
                                                    value={choice.condition || ''}
                                                    onChange={(e) => updateChoiceCondition(i, e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    placeholder="condition (e.g. has_key, hp > 0)"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addChoice(); }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="mt-2 w-full py-1 flex items-center justify-center gap-1 bg-[#1c1f27] text-[#9da6b9] hover:text-amber-400 hover:bg-amber-500/10 rounded border border-[#282e39] border-dashed transition-all text-[10px]"
                                    >
                                        <span className="material-symbols-outlined text-xs">add</span>
                                        Add choice
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-2 text-[10px] text-[#4b5563]">
                                <span>Esc to close</span>
                                <span className="text-[#282e39]">|</span>
                                <span>#tags for effects</span>
                            </div>
                        </div>
                    ) : (
                        /* Display mode */
                        <div className="relative">
                            {previewText ? (
                                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                                    {previewText}
                                </p>
                            ) : (
                                <p className="text-sm text-[#4b5563] italic">
                                    Double-click to write...
                                </p>
                            )}
                            {hasMoreText && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#101622] to-transparent pointer-events-none" />
                            )}
                        </div>
                    )}
                </div>

                {/* Inline choices display */}
                {hasInlineChoices && !isEditing && (
                    <div className="px-3 pb-2 border-t border-[#282e39] pt-2 space-y-1.5">
                        {choices.map((choice, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className={`text-xs font-bold shrink-0 ${choice.sticky === false ? 'text-purple-400' : 'text-amber-400'}`}>
                                    {choice.sticky === false ? '*' : '\u2192'}
                                </span>
                                {choice.condition && (
                                    <span className="material-symbols-outlined text-cyan-400 text-[11px] shrink-0" title={`Condition: ${choice.condition}`}>lock</span>
                                )}
                                <span className="text-amber-200/80 truncate">{choice.text || `Choice ${i + 1}`}</span>
                            </div>
                        ))}
                        <button
                            onClick={handleAddChoiceClick}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full py-0.5 flex items-center justify-center gap-1 text-[#4b5563] hover:text-amber-400 transition-colors text-[10px]"
                            title="Add another choice"
                        >
                            <span className="material-symbols-outlined text-xs">add</span>
                        </button>
                    </div>
                )}

                {/* Add choice button for nodes without choices yet */}
                {!hasInlineChoices && !isEditing && (
                    <div className="px-3 pb-2">
                        <button
                            onClick={handleAddChoiceClick}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full py-1 flex items-center justify-center gap-1 text-[#4b5563] hover:text-amber-400 hover:bg-amber-500/5 rounded border border-transparent hover:border-[#282e39] transition-all text-[10px] opacity-0 hover:opacity-100"
                            title="Add a choice to create a branch"
                        >
                            <span className="material-symbols-outlined text-xs">add</span>
                            Add choice
                        </button>
                    </div>
                )}

                {/* Tag badges footer */}
                {tags.length > 0 && !isEditing && (
                    <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-[#282e39]">
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
                )}
            </div>

            {/* Source handles */}

            {/* Default single source handle (when no inline choices) */}
            {!hasInlineChoices && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className={`!w-3 !h-3 ${colors.bg}`}
                />
            )}

            {/* Source handles for inline choices (choice_0, choice_1, ...) */}
            {hasInlineChoices && choices.map((_, i) => (
                <Handle
                    key={`choice_${i}`}
                    type="source"
                    position={Position.Right}
                    id={`choice_${i}`}
                    className="!bg-amber-500 !w-2.5 !h-2.5"
                    style={{ top: `${((i + 1) / (choices.length + 1)) * 100}%` }}
                />
            ))}

            {/* Quick-create "+" button */}
            {!isEditing && data.onQuickCreate && (
                <button
                    className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#2b6cee] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#4b8cf7] shadow-lg"
                    onClick={(e) => { e.stopPropagation(); data.onQuickCreate(id); }}
                    title="Create connected node"
                >
                    +
                </button>
            )}
        </div>
    );
});
