# Phase 9: Slash Command Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the BardoEditor tag button panel with slash commands typed directly in the narrative textarea — type `/shake` → inserts `#shake`, type `/music` → inserts `#music:` with cursor ready for value.

**Architecture:** Extract slash command data + utility functions into a dedicated module (`slashCommands.js`), keep them unit-tested, then wire a new `SlashCommandPalette` component into PassageNode's inline editor. Finally clean up the right panel to remove the now-redundant content textarea and tag buttons.

**Tech Stack:** React 18, Vitest + React Testing Library, ReactFlow, Tailwind CSS

---

## Files Overview

| Action | Path |
|--------|------|
| Create | `src/editor/utils/slashCommands.js` |
| Create | `src/editor/utils/__tests__/slashCommands.test.js` |
| Create | `src/editor/components/SlashCommandPalette.jsx` |
| Modify | `src/editor/nodes/PassageNode.jsx` |
| Modify | `src/editor/BardoEditor.jsx` |

---

## Task 1: Slash command data + utility functions

**Files:**
- Create: `src/editor/utils/slashCommands.js`
- Create: `src/editor/utils/__tests__/slashCommands.test.js`

### Step 1: Write failing tests

Create `src/editor/utils/__tests__/slashCommands.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { getSlashQuery, insertTag, filterCommands, SLASH_COMMANDS } from '../slashCommands';

describe('getSlashQuery', () => {
    it('extracts query when /word is at cursor end', () => {
        expect(getSlashQuery('Hello /shake', 12)).toBe('shake');
    });
    it('extracts empty string when only / typed', () => {
        expect(getSlashQuery('Hello /', 7)).toBe('');
    });
    it('returns null when no slash before cursor', () => {
        expect(getSlashQuery('Hello world', 11)).toBe(null);
    });
    it('returns null when slash is mid-word (e.g. URL)', () => {
        expect(getSlashQuery('http://foo', 10)).toBe(null);
    });
    it('works when slash is at line start', () => {
        expect(getSlashQuery('Line one\n/music', 15)).toBe('music');
    });
    it('returns null when cursor is not at end of /word', () => {
        expect(getSlashQuery('/shake more text', 6)).toBe(null);
    });
});

describe('insertTag', () => {
    it('replaces /query with tag', () => {
        expect(insertTag('Hello /shake', 12, 'shake', '#shake')).toBe('Hello #shake');
    });
    it('replaces partial /query with full tag', () => {
        expect(insertTag('Hello /sh', 9, 'sh', '#shake')).toBe('Hello #shake');
    });
    it('replaces lone / with tag', () => {
        expect(insertTag('Hello /', 7, '', '#shake')).toBe('Hello #shake');
    });
    it('preserves text after cursor', () => {
        expect(insertTag('/shake\nNext line', 6, 'shake', '#shake')).toBe('#shake\nNext line');
    });
});

describe('filterCommands', () => {
    it('returns empty array for null query', () => {
        expect(filterCommands(null)).toHaveLength(0);
    });
    it('returns all commands for empty query', () => {
        expect(filterCommands('')).toHaveLength(SLASH_COMMANDS.length);
    });
    it('filters by cmd substring', () => {
        const results = filterCommands('shake');
        expect(results.some(c => c.cmd === 'shake')).toBe(true);
    });
    it('filters by desc substring', () => {
        const results = filterCommands('screen');
        expect(results.length).toBeGreaterThan(0);
    });
    it('caps results at 8', () => {
        expect(filterCommands('').length).toBeLessThanOrEqual(8);
    });
    it('is case-insensitive', () => {
        expect(filterCommands('SHAKE').some(c => c.cmd === 'shake')).toBe(true);
    });
});

describe('SLASH_COMMANDS', () => {
    it('every command has required fields', () => {
        SLASH_COMMANDS.forEach(c => {
            expect(typeof c.cmd).toBe('string');
            expect(typeof c.tag).toBe('string');
            expect(typeof c.desc).toBe('string');
            expect(typeof c.category).toBe('string');
            expect(typeof c.hasValue).toBe('boolean');
        });
    });
    it('contains at least 30 commands', () => {
        expect(SLASH_COMMANDS.length).toBeGreaterThanOrEqual(30);
    });
});
```

### Step 2: Run tests — verify they fail

```
npm run test:run -- slashCommands
```
Expected: all tests fail with "Cannot find module '../slashCommands'"

### Step 3: Implement `src/editor/utils/slashCommands.js`

```js
/**
 * slashCommands.js
 * Data and utility functions for the slash command palette.
 */

export const SLASH_COMMANDS = [
    // VFX
    { cmd: 'shake',            tag: '#shake',                      desc: 'Shake the screen',                    category: 'VFX',      hasValue: false },
    { cmd: 'flash_red',        tag: '#flash_red',                  desc: 'Flash screen red',                    category: 'VFX',      hasValue: false },
    { cmd: 'flash_white',      tag: '#flash_white',                desc: 'Flash screen white',                  category: 'VFX',      hasValue: false },
    { cmd: 'bg',               tag: '#bg:',                        desc: 'Set background image',                category: 'VFX',      hasValue: true  },
    { cmd: 'sfx',              tag: '#play_sfx:',                  desc: 'Play sound effect',                   category: 'VFX',      hasValue: true  },
    { cmd: 'music',            tag: '#music:',                     desc: 'Play background music',               category: 'VFX',      hasValue: true  },
    { cmd: 'music_stop',       tag: '#music:stop',                 desc: 'Stop background music',               category: 'VFX',      hasValue: false },
    { cmd: 'ui_effect',        tag: '#UI_EFFECT:',                 desc: 'UI horror effect (blur_vignette…)',   category: 'VFX',      hasValue: true  },
    // Minigames
    { cmd: 'minigame_qte',     tag: '#MINIGAME: type=qte',         desc: 'Quick Time Event minigame',           category: 'Minigame', hasValue: false },
    { cmd: 'minigame_lockpick',tag: '#MINIGAME: type=lockpick',    desc: 'Lockpick minigame',                   category: 'Minigame', hasValue: false },
    { cmd: 'minigame_arkanoid',tag: '#MINIGAME: type=arkanoid',    desc: 'Arkanoid minigame',                   category: 'Minigame', hasValue: false },
    { cmd: 'minigame_apnea',   tag: '#MINIGAME: type=apnea',       desc: 'Apnea minigame',                      category: 'Minigame', hasValue: false },
    { cmd: 'keymash',          tag: '#KEY_MASH:',                  desc: 'Key mashing challenge (target count)',category: 'Minigame', hasValue: true  },
    // Horror
    { cmd: 'willpower_start',  tag: '#WILLPOWER_START:',           desc: 'Start willpower drain (slow/normal/fast)', category: 'Horror', hasValue: true },
    { cmd: 'willpower_stop',   tag: '#WILLPOWER_STOP',             desc: 'Stop willpower drain',                category: 'Horror',   hasValue: false },
    { cmd: 'willpower_check',  tag: '#WILLPOWER_CHECK:',           desc: 'Check willpower threshold',           category: 'Horror',   hasValue: true  },
    { cmd: 'mouse_resistance', tag: '#MOUSE_RESISTANCE:',          desc: 'Heavy cursor (low/medium/high)',      category: 'Horror',   hasValue: true  },
    { cmd: 'spider_start',     tag: '#SPIDER_START: difficulty=',  desc: 'Spider infestation (normal/hard)',    category: 'Horror',   hasValue: true  },
    { cmd: 'spider_stop',      tag: '#SPIDER_STOP',                desc: 'Stop spider infestation',             category: 'Horror',   hasValue: false },
    { cmd: 'spider_check',     tag: '#SPIDER_CHECK:',              desc: 'Spider count check',                  category: 'Horror',   hasValue: true  },
    // Combat
    { cmd: 'arrebatados_start',tag: '#ARREBATADOS_START:',         desc: 'Start arrebatados system',            category: 'Combat',   hasValue: true  },
    { cmd: 'arrebatados_stop', tag: '#ARREBATADOS_STOP',           desc: 'Stop arrebatados system',             category: 'Combat',   hasValue: false },
    { cmd: 'boss_start',       tag: '#BOSS_START:',                desc: 'Start boss encounter',                category: 'Combat',   hasValue: true  },
    { cmd: 'boss_phase',       tag: '#BOSS_PHASE:',                desc: 'Set boss phase',                      category: 'Combat',   hasValue: true  },
    { cmd: 'boss_damage',      tag: '#BOSS_DAMAGE:',               desc: 'Apply boss damage',                   category: 'Combat',   hasValue: true  },
    { cmd: 'boss_check',       tag: '#BOSS_CHECK',                 desc: 'Check boss status',                   category: 'Combat',   hasValue: false },
    { cmd: 'boss_stop',        tag: '#BOSS_STOP',                  desc: 'End boss encounter',                  category: 'Combat',   hasValue: false },
    { cmd: 'visual_damage',    tag: '#VISUAL_DAMAGE:',             desc: 'Visual damage effect',                category: 'Combat',   hasValue: true  },
    // Game
    { cmd: 'stat',             tag: '#stat:',                      desc: 'Modify stat (e.g. hp:+10)',           category: 'Game',     hasValue: true  },
    { cmd: 'inventory_add',    tag: '#inventory_add:',             desc: 'Add item to inventory',               category: 'Game',     hasValue: true  },
    { cmd: 'inventory_remove', tag: '#inventory_remove:',          desc: 'Remove item from inventory',          category: 'Game',     hasValue: true  },
    { cmd: 'achievement',      tag: '#achievement:unlock:',        desc: 'Unlock achievement',                  category: 'Game',     hasValue: true  },
    { cmd: 'input',            tag: '#input:',                     desc: 'Prompt for text input (varName:placeholder)', category: 'Game', hasValue: true },
    { cmd: 'wait',             tag: '#wait:',                      desc: 'Pause for X seconds',                 category: 'Game',     hasValue: true  },
    { cmd: 'clear',            tag: '#clear',                      desc: 'Clear screen',                        category: 'Game',     hasValue: false },
    { cmd: 'next',             tag: '#next',                       desc: 'Auto-continue to next beat',          category: 'Game',     hasValue: false },
];

/**
 * Extract the current slash query from textarea content at cursor position.
 * Returns the word after the last `/` if the cursor is directly at its end.
 * Returns null if no active slash command.
 *
 * Examples:
 *   getSlashQuery('Hello /shake', 12) → 'shake'
 *   getSlashQuery('Hello /', 7)       → ''
 *   getSlashQuery('Hello world', 11)  → null
 */
export function getSlashQuery(text, cursorPos) {
    const before = text.slice(0, cursorPos);
    // Match /word at end — must be preceded by start, whitespace, or newline
    const match = before.match(/(?:^|[\s\n])\/(\w*)$/);
    return match ? match[1] : null;
}

/**
 * Replace the /query at cursorPos with tag in text.
 * Returns the new string.
 */
export function insertTag(text, cursorPos, query, tag) {
    // The slash starts at cursorPos - query.length - 1
    const slashStart = cursorPos - query.length - 1;
    return text.slice(0, slashStart) + tag + text.slice(cursorPos);
}

/**
 * Filter SLASH_COMMANDS by query string. Returns at most 8 results.
 */
export function filterCommands(query) {
    if (query === null) return [];
    const q = query.toLowerCase();
    return SLASH_COMMANDS.filter(c =>
        c.cmd.includes(q) || c.desc.toLowerCase().includes(q)
    ).slice(0, 8);
}
```

### Step 4: Run tests — verify they pass

```
npm run test:run -- slashCommands
```
Expected: all 16 tests pass.

### Step 5: Commit

```bash
git add src/editor/utils/slashCommands.js src/editor/utils/__tests__/slashCommands.test.js
git commit -m "feat: add slash command data and utility functions"
```

---

## Task 2: SlashCommandPalette component

**Files:**
- Create: `src/editor/components/SlashCommandPalette.jsx`

No unit tests needed — this is pure presentational rendering. Verified visually in Task 4.

### Step 1: Create `src/editor/components/SlashCommandPalette.jsx`

```jsx
import React, { useEffect, useRef } from 'react';

const CATEGORY_COLORS = {
    VFX:      'text-purple-400',
    Minigame: 'text-green-400',
    Horror:   'text-red-400',
    Combat:   'text-orange-400',
    Game:     'text-cyan-400',
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

    // Scroll active item into view
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
```

### Step 2: Commit

```bash
git add src/editor/components/SlashCommandPalette.jsx
git commit -m "feat: add SlashCommandPalette component"
```

---

## Task 3: Wire slash commands into PassageNode.jsx

**Files:**
- Modify: `src/editor/nodes/PassageNode.jsx`

### Step 1: Add imports at top of PassageNode.jsx

After the existing React import line, add:

```js
import SlashCommandPalette from '../components/SlashCommandPalette';
import { getSlashQuery, insertTag, filterCommands } from '../utils/slashCommands';
```

### Step 2: Add slash state inside the component

After the existing `editChoices` state line, add:

```js
const [slashQuery, setSlashQuery] = useState(null);
const [slashActiveIdx, setSlashActiveIdx] = useState(0);

const filteredCommands = useMemo(
    () => filterCommands(slashQuery),
    [slashQuery]
);
```

Add `useMemo` to the existing React import if not already present.

### Step 3: Replace `handleTextareaChange`

Current implementation only updates content. Replace with:

```js
const handleTextareaChange = useCallback((e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setEditContent(val);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px';

    const query = getSlashQuery(val, cursor);
    setSlashQuery(query);
    setSlashActiveIdx(0);
}, []);
```

### Step 4: Replace `handleKeyDown`

Current implementation only handles Escape. Replace with:

```js
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
}, [slashQuery, filteredCommands, slashActiveIdx, commitEdit]);
```

### Step 5: Add `handleSlashSelect` callback

After `handleKeyDown`, add:

```js
const handleSlashSelect = useCallback((command) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const newContent = insertTag(editContent, cursor, slashQuery, command.tag);
    setEditContent(newContent);
    setSlashQuery(null);
    setSlashActiveIdx(0);

    // Position cursor: after tag for no-value, after colon for value commands
    requestAnimationFrame(() => {
        const newCursor = cursor - slashQuery.length - 1 + command.tag.length;
        textarea.setSelectionRange(newCursor, newCursor);
        textarea.focus();
    });
}, [editContent, slashQuery]);
```

### Step 6: Render the palette in JSX

Inside the edit mode section, wrap the textarea and palette in a `relative` div. Find the textarea JSX block:

```jsx
<textarea
    ref={textareaRef}
    className="w-full bg-[#0b0c10] ..."
    ...
/>
```

Replace with:

```jsx
<div className="relative">
    <textarea
        ref={textareaRef}
        className="w-full bg-[#0b0c10] border border-[#282e39] rounded-lg p-2 text-sm text-white/90 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono leading-relaxed placeholder-[#4b5563]"
        value={editContent}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder="Write your story here...&#10;&#10;Type / to insert tags (#shake, #music:theme...)"
        style={{ minHeight: '100px', maxHeight: '300px' }}
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
```

### Step 7: Reset slashQuery on commitEdit

In the `commitEdit` callback, add `setSlashQuery(null);` before `setIsEditing(false)`:

```js
const commitEdit = useCallback(() => {
    if (isEditing) {
        if (data.onContentChange) {
            data.onContentChange(id, editContent);
        }
        if (data.onChoicesChange) {
            const validChoices = editChoices.filter(c => c.text.trim());
            data.onChoicesChange(id, validChoices);
        }
    }
    setSlashQuery(null);
    setIsEditing(false);
}, [isEditing, id, editContent, editChoices, data]);
```

### Step 8: Run all tests

```
npm run test:run
```
Expected: all 542+ tests pass (no new tests here — slash logic is tested in Task 1).

### Step 9: Commit

```bash
git add src/editor/nodes/PassageNode.jsx
git commit -m "feat: wire slash command palette into PassageNode inline editor"
```

---

## Task 4: Clean up BardoEditor.jsx right panel

**Files:**
- Modify: `src/editor/BardoEditor.jsx`

### Step 1: Remove `BARDO_TAGS` constant and related state

In `BardoEditor.jsx`:

1. Delete the entire `BARDO_TAGS` constant (lines starting with `const BARDO_TAGS = {` through the closing `};`)
2. Delete the `collapsedCategories` state: `const [collapsedCategories, setCollapsedCategories] = useState({});`
3. Delete the `toggleCategory` function
4. Delete the `appendTag` function
5. Delete the `insertVariable` function (no longer needed — variable insertion was in the right panel content editor)

### Step 2: Remove content textarea section from right panel

In the right panel JSX (inside `activeNav === 'editor' && selectedNode`), find and delete the entire **"Narrative Content"** section — from the `{/* Narrative Content */}` comment through the closing `</div>` that wraps the tag helper. This includes:
- The `<div className="mb-6">` containing the label, Insert Var dropdown, textarea, tip text, and categorized tag helper

Keep everything else: Node ID, Display Label, Chapter, Type Selection, Hub Rules, Burned toggle.

### Step 3: Remove unused imports/variables if any

Check that `collapsedCategories`, `toggleCategory`, `appendTag`, `insertVariable` are fully removed and no references remain. A quick grep:

```bash
grep -n "collapsedCategories\|toggleCategory\|appendTag\|insertVariable\|BARDO_TAGS" src/editor/BardoEditor.jsx
```

Expected: no results.

### Step 4: Run all tests

```
npm run test:run
```
Expected: all tests pass.

### Step 5: Commit

```bash
git add src/editor/BardoEditor.jsx
git commit -m "feat: remove tag button panel from right panel, slash commands are the interface"
```

---

## Verification

After all tasks complete, manually verify in the dev server (`npm run dev`):

1. Double-click a node → type `/` → palette appears below textarea with all commands
2. Type `/sh` → palette filters to shake, flash_white, etc.
3. Arrow keys navigate the list
4. Enter inserts `#shake` at cursor position
5. Type `/music` → Enter → inserts `#music:` with cursor after colon → type `theme` → tag complete
6. Esc dismisses palette without inserting
7. Right panel no longer shows content textarea or tag buttons
8. Export Ink → tags appear correctly in generated output
