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
    it('returns all commands for empty query (capped at 8)', () => {
        expect(filterCommands('')).toHaveLength(8);
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
