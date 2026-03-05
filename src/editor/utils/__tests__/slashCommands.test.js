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
    it('returns all commands for empty query (no cap)', () => {
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
    it('caps filtered results at 12', () => {
        expect(filterCommands('a').length).toBeLessThanOrEqual(12);
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

    it('all commands have hasValue=false', () => {
        SLASH_COMMANDS.forEach(c => {
            expect(c.hasValue).toBe(false);
        });
    });
});

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
        expect(results.some(c => c.cmd === 'stat')).toBe(true);
        expect(results.some(c => c.cmd === 'stat:hp')).toBe(true);
    });

    it('filters sub-commands by sub-query after colon', () => {
        const results = filterCommands('stat:h', mockConfig);
        expect(results.some(c => c.cmd === 'stat:hp')).toBe(true);
        expect(results.some(c => c.cmd === 'stat:karma')).toBe(false);
    });

    it('handles empty config gracefully', () => {
        const results = filterCommands('stat', {});
        expect(results.some(c => c.cmd === 'stat')).toBe(true);
        expect(results.length).toBe(1);
    });

    it('handles config with no definitions', () => {
        const results = filterCommands('stat', { stats: { enabled: false } });
        expect(results.some(c => c.cmd === 'stat')).toBe(true);
        expect(results.filter(c => c.cmd.startsWith('stat:')).length).toBe(0);
    });

    it('handles config with empty arrays', () => {
        const config = {
            stats: { enabled: true, definitions: [] },
            achievements: [],
            inventory: { enabled: true, categories: [] },
        };
        const results = filterCommands('stat', config);
        expect(results.length).toBe(1);
    });

    it('inventory_remove sub-commands match inventory_add items', () => {
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
});
