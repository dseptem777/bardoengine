# Enhanced Slash Commands Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the Loom Editor's slash command system with complete templates, contextual autocomplete from project config, conditional block commands, and improved descriptions — all without adding any new UI panels or buttons.

**Architecture:** Modify `slashCommands.js` to hold complete tag templates and accept a `config` parameter for dynamic sub-command generation. Thread `projectConfig` from `BardoEditor.jsx` through node data into `PassageNode.jsx`. Add Logic category color to `SlashCommandPalette.jsx`. No new components.

**Tech Stack:** React, ReactFlow, Vitest

---

### Task 1: Complete Templates — Update Tag Fields

**Files:**
- Modify: `src/editor/utils/slashCommands.js:6-48` (SLASH_COMMANDS array)
- Test: `src/editor/utils/__tests__/slashCommands.test.js`

**Step 1: Write the failing test**

Add to `slashCommands.test.js`:

```js
describe('SLASH_COMMANDS templates', () => {
    it('minigame commands include all default params', () => {
        const qte = SLASH_COMMANDS.find(c => c.cmd === 'minigame_qte');
        expect(qte.tag).toContain('key=');
        expect(qte.tag).toContain('timeout=');
        expect(qte.tag).toContain('autostart=');
    });

    it('willpower_start includes speed default', () => {
        const wp = SLASH_COMMANDS.find(c => c.cmd === 'willpower_start');
        expect(wp.tag).toContain('normal');
        expect(wp.hasValue).toBe(false);
    });

    it('keymash includes target default', () => {
        const km = SLASH_COMMANDS.find(c => c.cmd === 'keymash');
        expect(km.tag).toContain('30');
        expect(km.hasValue).toBe(false);
    });

    it('spider_start includes difficulty default', () => {
        const sp = SLASH_COMMANDS.find(c => c.cmd === 'spider_start');
        expect(sp.tag).toContain('difficulty=normal');
        expect(sp.hasValue).toBe(false);
    });

    it('bg includes placeholder value', () => {
        const bg = SLASH_COMMANDS.find(c => c.cmd === 'bg');
        expect(bg.tag).toBe('#bg:forest');
        expect(bg.hasValue).toBe(false);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/editor/utils/__tests__/slashCommands.test.js`
Expected: FAIL — current tags don't have full params

**Step 3: Update SLASH_COMMANDS with complete templates**

Replace the entire `SLASH_COMMANDS` array in `slashCommands.js`:

```js
export const SLASH_COMMANDS = [
    // VFX
    { cmd: 'shake',             tag: '#shake',                      desc: 'Shakes the screen briefly',                                                category: 'VFX',      hasValue: false },
    { cmd: 'flash_red',         tag: '#flash_red',                  desc: 'Flashes screen red — use for damage or danger',                            category: 'VFX',      hasValue: false },
    { cmd: 'flash_white',       tag: '#flash_white',                desc: 'Flashes screen white — use for explosions or revelations',                 category: 'VFX',      hasValue: false },
    { cmd: 'bg',                tag: '#bg:forest',                  desc: 'Sets background image. Change "forest" to your image name (no extension)', category: 'VFX',      hasValue: false },
    { cmd: 'sfx',               tag: '#play_sfx:gunshot',           desc: 'Plays a sound effect once. Change "gunshot" to your sound file name',      category: 'VFX',      hasValue: false },
    { cmd: 'music',             tag: '#music:theme',                desc: 'Plays background music. Loops until stopped or changed',                   category: 'VFX',      hasValue: false },
    { cmd: 'music_stop',        tag: '#music:stop',                 desc: 'Fades out the current background music',                                   category: 'VFX',      hasValue: false },
    { cmd: 'ui_effect',         tag: '#UI_EFFECT: blur_vignette',   desc: 'Horror UI effect. Options: blur_vignette, static_noise, blood_drip',       category: 'VFX',      hasValue: false },
    // Minigames
    { cmd: 'minigame_qte',      tag: '#MINIGAME: type=qte, key=SPACE, timeout=1.5, autostart=true',       desc: 'Quick-time event — player presses key before timeout. Result: minigame_result (1=win, 0=lose)',  category: 'Minigame', hasValue: false },
    { cmd: 'minigame_lockpick', tag: '#MINIGAME: type=lockpick, speed=1, zoneSize=0.15, autostart=true',   desc: 'Lockpick minigame — stop the indicator in the zone. Result: minigame_result (1=win, 0=lose)',    category: 'Minigame', hasValue: false },
    { cmd: 'minigame_arkanoid', tag: '#MINIGAME: type=arkanoid, autostart=true',                           desc: 'Arkanoid minigame — break all blocks. Result: minigame_result (1=win, 0=lose)',                  category: 'Minigame', hasValue: false },
    { cmd: 'minigame_apnea',    tag: '#MINIGAME: type=apnea, autostart=true',                              desc: 'Apnea challenge — hold breath as long as possible. Result: minigame_result (1=win, 0=lose)',     category: 'Minigame', hasValue: false },
    { cmd: 'keymash',           tag: '#KEY_MASH: 30',               desc: 'Key mashing challenge — player must hit 30 key presses. Change number to adjust difficulty',  category: 'Minigame', hasValue: false },
    // Horror
    { cmd: 'willpower_start',   tag: '#WILLPOWER_START: normal',    desc: 'Starts willpower drain. Player must click to resist. Speed: slow, normal, fast',              category: 'Horror',   hasValue: false },
    { cmd: 'willpower_stop',    tag: '#WILLPOWER_STOP',             desc: 'Stops the willpower drain immediately',                                                       category: 'Horror',   hasValue: false },
    { cmd: 'willpower_check',   tag: '#WILLPOWER_CHECK: 50',        desc: 'Checks if willpower is above threshold (0-100). Result: willpower_passed (1=pass, 0=fail)',   category: 'Horror',   hasValue: false },
    { cmd: 'mouse_resistance',  tag: '#MOUSE_RESISTANCE: medium',   desc: 'Makes cursor feel heavy/sluggish. Intensity: low, medium, high',                             category: 'Horror',   hasValue: false },
    { cmd: 'spider_start',      tag: '#SPIDER_START: difficulty=normal',  desc: 'Spiders crawl on screen. Player clicks to squish. Difficulty: normal, hard',            category: 'Horror',   hasValue: false },
    { cmd: 'spider_stop',       tag: '#SPIDER_STOP',                desc: 'Stops the spider infestation overlay',                                                        category: 'Horror',   hasValue: false },
    { cmd: 'spider_check',      tag: '#SPIDER_CHECK: 5',            desc: 'Checks if player squished enough spiders. Result: spider_survived (1=yes, 0=no)',             category: 'Horror',   hasValue: false },
    // Combat
    { cmd: 'arrebatados_start', tag: '#ARREBATADOS_START: normal',  desc: 'Starts arrebatados system. Intensity: normal, hard',                                          category: 'Combat',   hasValue: false },
    { cmd: 'arrebatados_stop',  tag: '#ARREBATADOS_STOP',           desc: 'Stops the arrebatados system',                                                                category: 'Combat',   hasValue: false },
    { cmd: 'boss_start',        tag: '#BOSS_START: boss_name',      desc: 'Starts a boss encounter. Change "boss_name" to your boss ID',                                 category: 'Combat',   hasValue: false },
    { cmd: 'boss_phase',        tag: '#BOSS_PHASE: 2',              desc: 'Sets the boss to a specific phase number',                                                    category: 'Combat',   hasValue: false },
    { cmd: 'boss_damage',       tag: '#BOSS_DAMAGE: 10',            desc: 'Applies damage to the boss. Change number to adjust',                                         category: 'Combat',   hasValue: false },
    { cmd: 'boss_check',        tag: '#BOSS_CHECK',                 desc: 'Checks if boss is defeated. Result: boss_defeated (1=yes, 0=no)',                              category: 'Combat',   hasValue: false },
    { cmd: 'boss_stop',         tag: '#BOSS_STOP',                  desc: 'Ends the boss encounter and cleans up',                                                        category: 'Combat',   hasValue: false },
    { cmd: 'visual_damage',     tag: '#VISUAL_DAMAGE: 20',          desc: 'Flashes screen with damage effect. Number = intensity (0-100)',                                category: 'Combat',   hasValue: false },
    // Game
    { cmd: 'stat',              tag: '#stat:hp:+0',                 desc: 'Modifies a stat. Format: stat:name:+N or -N. Use /stat for autocomplete from config',         category: 'Game',     hasValue: false },
    { cmd: 'inventory_add',     tag: '#inv:add:item_name',          desc: 'Adds an item to inventory. Change "item_name" to your item ID',                               category: 'Game',     hasValue: false },
    { cmd: 'inventory_remove',  tag: '#inv:remove:item_name',       desc: 'Removes an item from inventory. Change "item_name" to your item ID',                          category: 'Game',     hasValue: false },
    { cmd: 'achievement',       tag: '#achievement:unlock:trophy',  desc: 'Unlocks an achievement. Change "trophy" to your achievement ID',                              category: 'Game',     hasValue: false },
    { cmd: 'input',             tag: '#input:varName:Enter your name...', desc: 'Prompts player for text input. Saved to varName variable',                              category: 'Game',     hasValue: false },
    { cmd: 'wait',              tag: '#wait:2',                     desc: 'Pauses the story for N seconds before continuing',                                             category: 'Game',     hasValue: false },
    { cmd: 'clear',             tag: '#clear',                      desc: 'Clears all text from the screen',                                                              category: 'Game',     hasValue: false },
    { cmd: 'next',              tag: '#next',                       desc: 'Auto-continues to the next beat without waiting for player',                                   category: 'Game',     hasValue: false },
];
```

Key changes:
- All `hasValue` are now `false` — templates are complete, no value needed
- Minigames include all params with defaults
- Horror/combat commands include default intensity/threshold
- VFX commands include placeholder values (e.g., `forest`, `gunshot`)
- `inventory_add`/`inventory_remove` use correct `#inv:add:`/`#inv:remove:` format
- All descriptions explain what the command does + key params + result variables

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/editor/utils/__tests__/slashCommands.test.js`
Expected: PASS

Note: The existing test `'every command has required fields'` checks `hasValue` is boolean — all are `false` now, still passes. The test `'returns all commands for empty query (capped at 8)'` still works since there are >8 commands.

**Step 5: Commit**

```bash
git add src/editor/utils/slashCommands.js src/editor/utils/__tests__/slashCommands.test.js
git commit -m "feat(editor): complete slash command templates with defaults and better descriptions"
```

---

### Task 2: Conditional Block Commands — /if, /ifelse, /ifelseif

**Files:**
- Modify: `src/editor/utils/slashCommands.js:6-48` (add to SLASH_COMMANDS)
- Modify: `src/editor/components/SlashCommandPalette.jsx:3-9` (add Logic color)
- Test: `src/editor/utils/__tests__/slashCommands.test.js`

**Step 1: Write the failing test**

Add to `slashCommands.test.js`:

```js
describe('conditional commands', () => {
    it('has /if command in Logic category', () => {
        const ifCmd = SLASH_COMMANDS.find(c => c.cmd === 'if');
        expect(ifCmd).toBeDefined();
        expect(ifCmd.category).toBe('Logic');
        expect(ifCmd.tag).toContain('{');
        expect(ifCmd.tag).toContain('}');
    });

    it('has /ifelse command', () => {
        const cmd = SLASH_COMMANDS.find(c => c.cmd === 'ifelse');
        expect(cmd).toBeDefined();
        expect(cmd.tag).toContain('|');
    });

    it('has /ifelseif command', () => {
        const cmd = SLASH_COMMANDS.find(c => c.cmd === 'ifelseif');
        expect(cmd).toBeDefined();
        expect(cmd.tag).toMatch(/\|.*\|/);
    });

    it('/if is filterable', () => {
        const results = filterCommands('if');
        expect(results.some(c => c.cmd === 'if')).toBe(true);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/editor/utils/__tests__/slashCommands.test.js`
Expected: FAIL — no `if` command exists yet

**Step 3: Add conditional commands to SLASH_COMMANDS**

Add at the end of the SLASH_COMMANDS array (before the closing `];`):

```js
    // Logic
    { cmd: 'if',       tag: '{variable == value: text shown when true}',                                           desc: 'Conditional text. Complex: {hp > 0 and has_key: text}. Nesting: {a: {b: deep}}',  category: 'Logic', hasValue: false },
    { cmd: 'ifelse',   tag: '{variable == value: text when true | text when false}',                                desc: 'If/else conditional. Shown text depends on variable check',                       category: 'Logic', hasValue: false },
    { cmd: 'ifelseif', tag: '{variable == value: text | variable2 == value2: other text | fallback text}',          desc: 'Multi-branch conditional. First matching condition wins, last is fallback',        category: 'Logic', hasValue: false },
```

**Step 4: Add Logic category color to SlashCommandPalette.jsx**

In `SlashCommandPalette.jsx`, add `Logic` to the `CATEGORY_COLORS` object:

```js
const CATEGORY_COLORS = {
    VFX:      'text-purple-400',
    Minigame: 'text-green-400',
    Horror:   'text-red-400',
    Combat:   'text-orange-400',
    Game:     'text-cyan-400',
    Logic:    'text-blue-400',
};
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/editor/utils/__tests__/slashCommands.test.js`
Expected: PASS

**Step 6: Commit**

```bash
git add src/editor/utils/slashCommands.js src/editor/components/SlashCommandPalette.jsx src/editor/utils/__tests__/slashCommands.test.js
git commit -m "feat(editor): add /if, /ifelse, /ifelseif conditional commands with Logic category"
```

---

### Task 3: Contextual Autocomplete — filterCommands with Config

**Files:**
- Modify: `src/editor/utils/slashCommands.js:81-87` (filterCommands function)
- Test: `src/editor/utils/__tests__/slashCommands.test.js`

This is the core feature: when the writer types `/stat`, instead of showing just the generic `stat` command, the palette shows sub-commands generated from the project config (e.g., `/stat:hp`, `/stat:karma`).

**Step 1: Write the failing test**

Add to `slashCommands.test.js`:

```js
describe('contextual filterCommands with config', () => {
    const mockConfig = {
        stats: {
            enabled: true,
            definitions: [
                { id: 'hp', label: 'Health', initial: 100, max: 100 },
                { id: 'karma', label: 'Karma', initial: 0 },
            ],
        },
        inventory: {
            enabled: true,
            categories: [
                { items: [{ id: 'key', name: 'Rusty Key' }, { id: 'torch', name: 'Torch' }] },
            ],
        },
        achievements: [
            { id: 'first_blood', title: 'First Blood' },
            { id: 'explorer', title: 'Explorer' },
        ],
    };

    it('generates stat sub-commands from config', () => {
        const results = filterCommands('stat', mockConfig);
        expect(results.some(c => c.cmd === 'stat:hp')).toBe(true);
        expect(results.some(c => c.cmd === 'stat:karma')).toBe(true);
    });

    it('stat sub-command inserts complete template', () => {
        const results = filterCommands('stat', mockConfig);
        const hp = results.find(c => c.cmd === 'stat:hp');
        expect(hp.tag).toBe('#stat:hp:+0');
        expect(hp.category).toBe('Game');
    });

    it('generates inventory sub-commands from config', () => {
        const results = filterCommands('inventory_add', mockConfig);
        expect(results.some(c => c.cmd === 'inventory_add:key')).toBe(true);
        expect(results.some(c => c.cmd === 'inventory_add:torch')).toBe(true);
    });

    it('inventory_add sub-command uses correct inv:add format', () => {
        const results = filterCommands('inventory_add', mockConfig);
        const key = results.find(c => c.cmd === 'inventory_add:key');
        expect(key.tag).toBe('#inv:add:key');
    });

    it('generates achievement sub-commands from config', () => {
        const results = filterCommands('achievement', mockConfig);
        expect(results.some(c => c.cmd === 'achievement:first_blood')).toBe(true);
    });

    it('achievement sub-command inserts complete template', () => {
        const results = filterCommands('achievement', mockConfig);
        const fb = results.find(c => c.cmd === 'achievement:first_blood');
        expect(fb.tag).toBe('#achievement:unlock:first_blood');
    });

    it('generates if sub-commands with system + config variables', () => {
        const results = filterCommands('if', mockConfig);
        // Should have the generic /if plus sub-commands for variables
        expect(results.some(c => c.cmd === 'if:hp')).toBe(true);
        expect(results.some(c => c.cmd === 'if:minigame_result')).toBe(true);
    });

    it('if:hp uses numeric comparison default', () => {
        const results = filterCommands('if', mockConfig);
        const hp = results.find(c => c.cmd === 'if:hp');
        expect(hp.tag).toBe('{hp > 0: text}');
    });

    it('if:minigame_result uses == 1 default', () => {
        const results = filterCommands('if', mockConfig);
        const mr = results.find(c => c.cmd === 'if:minigame_result');
        expect(mr.tag).toBe('{minigame_result == 1: text}');
    });

    it('still works without config (backward compatible)', () => {
        const results = filterCommands('shake');
        expect(results.some(c => c.cmd === 'shake')).toBe(true);
    });

    it('shows parent command + sub-commands when query matches parent exactly', () => {
        const results = filterCommands('stat', mockConfig);
        // Should include the generic /stat AND the sub-commands
        expect(results.some(c => c.cmd === 'stat')).toBe(true);
        expect(results.some(c => c.cmd === 'stat:hp')).toBe(true);
    });

    it('filters sub-commands by sub-query after colon', () => {
        const results = filterCommands('stat:h', mockConfig);
        expect(results.some(c => c.cmd === 'stat:hp')).toBe(true);
        expect(results.some(c => c.cmd === 'stat:karma')).toBe(false);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/editor/utils/__tests__/slashCommands.test.js`
Expected: FAIL — `filterCommands` doesn't accept config parameter

**Step 3: Implement contextual filterCommands**

Replace the `filterCommands` function in `slashCommands.js`:

```js
/**
 * System variables auto-set by the engine, always available for conditionals.
 */
const SYSTEM_VARIABLES = [
    { id: 'minigame_result', type: 'result', desc: 'Last minigame result (1=win, 0=lose)' },
    { id: 'willpower_passed', type: 'result', desc: 'Last willpower check (1=pass, 0=fail)' },
    { id: 'spider_survived', type: 'result', desc: 'Last spider check (1=survived, 0=failed)' },
    { id: 'boss_defeated', type: 'result', desc: 'Boss defeated status (1=yes, 0=no)' },
];

/**
 * Generate contextual sub-commands from project config.
 * Called when query exactly matches or starts with a parent command.
 */
function generateSubCommands(parentCmd, config) {
    if (!config) return [];
    const subs = [];

    if (parentCmd === 'stat' && config.stats?.definitions) {
        for (const stat of config.stats.definitions) {
            subs.push({
                cmd: `stat:${stat.id}`,
                tag: `#stat:${stat.id}:+0`,
                desc: `${stat.label || stat.id}${stat.max ? ` (max: ${stat.max})` : ''}`,
                category: 'Game',
                hasValue: false,
            });
        }
    }

    if (parentCmd === 'inventory_add' && config.inventory?.categories) {
        for (const cat of config.inventory.categories) {
            for (const item of (cat.items || [])) {
                subs.push({
                    cmd: `inventory_add:${item.id}`,
                    tag: `#inv:add:${item.id}`,
                    desc: item.name || item.id,
                    category: 'Game',
                    hasValue: false,
                });
            }
        }
    }

    if (parentCmd === 'inventory_remove' && config.inventory?.categories) {
        for (const cat of config.inventory.categories) {
            for (const item of (cat.items || [])) {
                subs.push({
                    cmd: `inventory_remove:${item.id}`,
                    tag: `#inv:remove:${item.id}`,
                    desc: item.name || item.id,
                    category: 'Game',
                    hasValue: false,
                });
            }
        }
    }

    if (parentCmd === 'achievement' && config.achievements) {
        for (const ach of config.achievements) {
            subs.push({
                cmd: `achievement:${ach.id}`,
                tag: `#achievement:unlock:${ach.id}`,
                desc: ach.title || ach.id,
                category: 'Game',
                hasValue: false,
            });
        }
    }

    if (parentCmd === 'if' || parentCmd === 'ifelse' || parentCmd === 'ifelseif') {
        // Add stat-based variables
        if (config.stats?.definitions) {
            for (const stat of config.stats.definitions) {
                subs.push({
                    cmd: `${parentCmd}:${stat.id}`,
                    tag: `{${stat.id} > 0: text}`,
                    desc: `Condition on ${stat.label || stat.id} (number)`,
                    category: 'Logic',
                    hasValue: false,
                });
            }
        }
        // Add system variables
        for (const sv of SYSTEM_VARIABLES) {
            subs.push({
                cmd: `${parentCmd}:${sv.id}`,
                tag: `{${sv.id} == 1: text}`,
                desc: sv.desc,
                category: 'Logic',
                hasValue: false,
            });
        }
    }

    return subs;
}

/** Commands that support contextual sub-commands */
const CONTEXTUAL_PARENTS = new Set(['stat', 'inventory_add', 'inventory_remove', 'achievement', 'if', 'ifelse', 'ifelseif']);

/**
 * Filter SLASH_COMMANDS by query string, with optional config for contextual sub-commands.
 * Returns at most 8 results.
 *
 * When query exactly matches a contextual parent (e.g. "stat"), returns parent + sub-commands.
 * When query contains ":" (e.g. "stat:h"), filters sub-commands by the part after colon.
 */
export function filterCommands(query, config) {
    if (query === null) return [];
    const q = query.toLowerCase();

    // Check if query targets a contextual parent (e.g., "stat" or "stat:hp")
    const colonIdx = q.indexOf(':');
    if (colonIdx > 0) {
        const parentQuery = q.slice(0, colonIdx);
        const subQuery = q.slice(colonIdx + 1);
        const parentCmd = SLASH_COMMANDS.find(c => c.cmd === parentQuery);
        if (parentCmd && CONTEXTUAL_PARENTS.has(parentCmd.cmd)) {
            const subs = generateSubCommands(parentCmd.cmd, config);
            return subs.filter(s => {
                const subPart = s.cmd.slice(s.cmd.indexOf(':') + 1);
                return subPart.includes(subQuery);
            }).slice(0, 8);
        }
    }

    // Standard filtering
    const baseResults = SLASH_COMMANDS.filter(c =>
        c.cmd.includes(q) || c.desc.toLowerCase().includes(q)
    );

    // If query exactly matches a contextual parent, inject sub-commands
    const exactParent = SLASH_COMMANDS.find(c => c.cmd === q && CONTEXTUAL_PARENTS.has(c.cmd));
    if (exactParent && config) {
        const subs = generateSubCommands(exactParent.cmd, config);
        // Parent first, then sub-commands
        return [exactParent, ...subs].slice(0, 8);
    }

    return baseResults.slice(0, 8);
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/editor/utils/__tests__/slashCommands.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/editor/utils/slashCommands.js src/editor/utils/__tests__/slashCommands.test.js
git commit -m "feat(editor): contextual autocomplete generates sub-commands from project config"
```

---

### Task 4: Thread Config Through ReactFlow Nodes

**Files:**
- Modify: `src/editor/BardoEditor.jsx:149-157` (nodesWithCallbacks useMemo)
- Modify: `src/editor/nodes/PassageNode.jsx:151` (filterCommands call)

**Step 1: Pass projectConfig into node data**

In `BardoEditor.jsx`, inside the `nodesWithCallbacks` useMemo, add `_config: projectConfig` to the data object:

```js
    const nodesWithCallbacks = useMemo(() => {
        return nodes.map(n => {
            if (n.type === 'passage') {
                const chapter = n.data?.chapter || '';
                const isFiltered = chapterFilter && chapter !== chapterFilter;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        onContentChange: handleNodeContentChange,
                        onChoicesChange: handleNodeChoicesChange,
                        onQuickCreate: handleQuickCreate,
                        _filtered: isFiltered,
                        _chapterColorIdx: chapter ? (chapterColorMap[chapter] ?? -1) : -1,
                        _config: projectConfig,
                    },
                };
            }
            return n;
        });
    }, [nodes, handleNodeContentChange, handleNodeChoicesChange, handleQuickCreate, chapterFilter, chapterColorMap, projectConfig]);
```

**Step 2: Use config in PassageNode's filterCommands call**

In `PassageNode.jsx`, change line 151:

From:
```js
const filteredCommands = useMemo(() => filterCommands(slashQuery), [slashQuery]);
```

To:
```js
const filteredCommands = useMemo(() => filterCommands(slashQuery, data._config), [slashQuery, data._config]);
```

**Step 3: Run the full test suite to check nothing breaks**

Run: `npx vitest run src/editor/`
Expected: All existing tests PASS

**Step 4: Manual verification**

Run: `npm run dev`
- Open the editor, configure some stats in ConfigPanel (e.g., hp, karma)
- In a node, type `/stat` — should see `/stat` parent + `/stat:hp` and `/stat:karma`
- Type `/stat:h` — should filter to just `/stat:hp`
- Type `/if` — should see `/if` parent + variable sub-commands
- Type `/shake` — should work as before (no sub-commands)

**Step 5: Commit**

```bash
git add src/editor/BardoEditor.jsx src/editor/nodes/PassageNode.jsx
git commit -m "feat(editor): thread project config into nodes for contextual slash autocomplete"
```

---

### Task 5: Final Integration Test and Edge Cases

**Files:**
- Test: `src/editor/utils/__tests__/slashCommands.test.js`

**Step 1: Write edge case tests**

Add to `slashCommands.test.js`:

```js
describe('edge cases', () => {
    it('handles empty config gracefully', () => {
        const results = filterCommands('stat', {});
        // Should return the parent stat command, no sub-commands
        expect(results.some(c => c.cmd === 'stat')).toBe(true);
        expect(results.length).toBe(1);
    });

    it('handles config with disabled stats', () => {
        const results = filterCommands('stat', { stats: { enabled: false } });
        expect(results.some(c => c.cmd === 'stat')).toBe(true);
        // No definitions = no sub-commands
        expect(results.filter(c => c.cmd.startsWith('stat:')).length).toBe(0);
    });

    it('handles config with empty arrays', () => {
        const config = {
            stats: { enabled: true, definitions: [] },
            achievements: [],
            inventory: { enabled: true, categories: [] },
        };
        const results = filterCommands('stat', config);
        expect(results.length).toBe(1); // just the parent
    });

    it('sub-commands for inventory_remove match inventory_add items', () => {
        const config = {
            inventory: {
                enabled: true,
                categories: [{ items: [{ id: 'key', name: 'Key' }] }],
            },
        };
        const addResults = filterCommands('inventory_add', config);
        const removeResults = filterCommands('inventory_remove', config);
        expect(addResults.some(c => c.cmd === 'inventory_add:key')).toBe(true);
        expect(removeResults.some(c => c.cmd === 'inventory_remove:key')).toBe(true);
        expect(removeResults.find(c => c.cmd === 'inventory_remove:key').tag).toBe('#inv:remove:key');
    });

    it('all SLASH_COMMANDS have hasValue=false (complete templates)', () => {
        SLASH_COMMANDS.forEach(c => {
            expect(c.hasValue).toBe(false);
        });
    });
});
```

**Step 2: Run all tests**

Run: `npx vitest run src/editor/utils/__tests__/slashCommands.test.js`
Expected: ALL PASS

**Step 3: Run full project tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/editor/utils/__tests__/slashCommands.test.js
git commit -m "test(editor): comprehensive edge case tests for enhanced slash commands"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Complete templates + better descriptions | slashCommands.js |
| 2 | /if, /ifelse, /ifelseif + Logic category | slashCommands.js, SlashCommandPalette.jsx |
| 3 | Contextual filterCommands(query, config) | slashCommands.js |
| 4 | Thread config through ReactFlow nodes | BardoEditor.jsx, PassageNode.jsx |
| 5 | Edge case tests | slashCommands.test.js |

**Total: 0 new files, 4 modified files, 5 commits**
