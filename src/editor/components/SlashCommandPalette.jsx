import React, { useEffect, useRef } from 'react';

const CATEGORY_COLORS = {
    VFX:      'text-purple-400',
    Minigame: 'text-green-400',
    Horror:   'text-red-400',
    Combat:   'text-orange-400',
    Game:     'text-cyan-400',
    Logic:    'text-blue-400',
};

/**
 * SlashCommandPalette
 * Docked below the textarea. Shows filtered slash commands.
 *
 * Props:
 *   commands    — filtered command objects to display
 *   activeIndex — currently highlighted index
 *   onSelect    — (command) => void
 *   onDismiss   — () => void
 */
export default function SlashCommandPalette({ commands, activeIndex, onSelect, onDismiss }) {
    const activeRef = useRef(null);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    if (commands.length === 0) return null;

    return (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#101622] border border-[#2b6cee]/50 rounded-lg shadow-2xl shadow-[#2b6cee]/10 overflow-hidden max-h-52 overflow-y-auto">
            {commands.map((cmd, i) => (
                <button
                    key={cmd.cmd}
                    ref={i === activeIndex ? activeRef : null}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(cmd); }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 text-left transition-colors ${
                        i === activeIndex ? 'bg-[#2b6cee]/20' : 'hover:bg-[#1c1f27]'
                    }`}
                >
                    <span className={`text-[10px] font-mono font-bold w-28 shrink-0 ${CATEGORY_COLORS[cmd.category] || 'text-gray-400'}`}>
                        /{cmd.cmd}
                    </span>
                    <span className="text-[10px] text-[#9da6b9] truncate">{cmd.desc}</span>
                    {cmd.hasValue && (
                        <span className="ml-auto shrink-0 text-[9px] text-[#4b5563] font-mono">+value</span>
                    )}
                </button>
            ))}
            <div className="px-3 py-1 border-t border-[#282e39] flex items-center gap-3 text-[9px] text-[#4b5563]">
                <span>↑↓ navigate</span>
                <span>↵ insert</span>
                <span>Esc dismiss</span>
            </div>
        </div>
    );
}
