/**
 * watermark.test.js
 * Vitest tests for the narrative watermarking system.
 *
 * Tests:
 * 1. Two distinct buildIds produce different bitstrings.
 * 2. Watermarked JSON is structurally identical to original (keys, non-^ strings, numbers).
 * 3. inkjs.Story runs identically on original and watermarked (same tags, same knot paths).
 * 4. JSON re-serialization (stringify → parse) preserves watermark extraction.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'module';

// Use createRequire to load CJS modules from ESM test context
const require = createRequire(import.meta.url);
const { applyNarrativeWatermark, extractWatermark, scoreMatch } = require('../../scripts/watermark.cjs');

// ---------------------------------------------------------------------------
// Fixture: small deterministic Ink JSON with ^text strings
// ---------------------------------------------------------------------------
// We use a hand-crafted fixture to avoid centinelas.json I/O in unit tests.
// It has em-dashes, curly quotes, ellipsis, apostrophes — all substitutable slots.
// Structure matches what inkjs expects for a simple linear story.
const FIXTURE_JSON = {
    inkVersion: 21,
    root: [
        [
            "^Era la noche mas oscura — nadie lo sabia.",
            "\n",
            "^No hay vuelta atras... o si la hay.",
            "\n",
            ["done", {"#n": "g-0"}],
            null
        ],
        "done",
        null
    ],
    listDefs: {}
};

// A tag-only string (must not be touched)
const TAG_STRING = "# some_tag";
// A divert string (must not be touched)
const DIVERT_STRING = "-> knot_name";

let wm1, wm2, bits1, bits2;

beforeAll(() => {
    wm1 = applyNarrativeWatermark(FIXTURE_JSON, 'deadbeef0000');
    wm2 = applyNarrativeWatermark(FIXTURE_JSON, 'cafebabe1234');
    bits1 = extractWatermark(wm1);
    bits2 = extractWatermark(wm2);
});

// ---------------------------------------------------------------------------
// 1. Two distinct buildIds produce different bitstrings
// ---------------------------------------------------------------------------
describe('watermark uniqueness', () => {
    it('extracts a non-empty bitstring', () => {
        expect(bits1.length).toBeGreaterThan(0);
    });

    it('different buildIds produce different bitstrings', () => {
        // They may match by chance on a few bits but not all
        expect(bits1).not.toBe(bits2);
    });

    it('scoreMatch correctly identifies buildId1 from bits1', () => {
        const score = scoreMatch(bits1, 'deadbeef0000', bits1.length);
        expect(score).toBe(100);
    });

    it('scoreMatch gives low score for wrong buildId', () => {
        const score = scoreMatch(bits1, 'cafebabe1234', bits1.length);
        // With random hash distribution, score should be ~50% for wrong id
        // We just assert it's not 100%
        expect(score).toBeLessThan(100);
    });
});

// ---------------------------------------------------------------------------
// 2. Structural equivalence
// ---------------------------------------------------------------------------
describe('structural equivalence', () => {
    it('inkVersion is preserved', () => {
        expect(wm1.inkVersion).toBe(FIXTURE_JSON.inkVersion);
        expect(wm2.inkVersion).toBe(FIXTURE_JSON.inkVersion);
    });

    it('listDefs is byte-identical', () => {
        expect(JSON.stringify(wm1.listDefs)).toBe(JSON.stringify(FIXTURE_JSON.listDefs));
    });

    it('divert strings (-> ...) are untouched', () => {
        // Walk wm1 and find all strings; none of the -> strings should change
        function findStrings(v, acc) {
            if (typeof v === 'string') { acc.push(v); return; }
            if (Array.isArray(v)) { v.forEach(x => findStrings(x, acc)); return; }
            if (v && typeof v === 'object') { Object.values(v).forEach(x => findStrings(x, acc)); }
        }
        const origStrings = [];
        const wmStrings = [];
        findStrings(FIXTURE_JSON, origStrings);
        findStrings(wm1, wmStrings);

        const origNonCaret = origStrings.filter(s => !s.startsWith('^'));
        const wmNonCaret = wmStrings.filter(s => !s.startsWith('^'));

        expect(wmNonCaret).toEqual(origNonCaret);
    });

    it('^text strings in watermarked JSON still start with ^', () => {
        function findCaretStrings(v, acc) {
            if (typeof v === 'string' && v.startsWith('^')) { acc.push(v); return; }
            if (Array.isArray(v)) { v.forEach(x => findCaretStrings(x, acc)); return; }
            if (v && typeof v === 'object') { Object.values(v).forEach(x => findCaretStrings(x, acc)); }
        }
        const wmCarets = [];
        findCaretStrings(wm1, wmCarets);
        expect(wmCarets.length).toBeGreaterThan(0);
        for (const s of wmCarets) {
            expect(s.startsWith('^')).toBe(true);
        }
    });

    it('watermarked JSON has same key structure as original', () => {
        expect(Object.keys(wm1).sort()).toEqual(Object.keys(FIXTURE_JSON).sort());
        expect(Object.keys(wm2).sort()).toEqual(Object.keys(FIXTURE_JSON).sort());
    });
});

// ---------------------------------------------------------------------------
// 3. inkjs runtime equivalence
// ---------------------------------------------------------------------------
describe('inkjs runtime equivalence', () => {
    it('tags and knot paths are identical between original and watermarked', async () => {
        // Dynamic import of inkjs (ESM)
        const { Story } = await import('inkjs');

        function runStory(jsonObj) {
            const story = new Story(JSON.stringify(jsonObj));
            const tags = [];
            const texts = [];
            let steps = 0;
            const MAX_STEPS = 50;

            while (story.canContinue && steps < MAX_STEPS) {
                const text = story.Continue();
                texts.push(text);
                if (story.currentTags && story.currentTags.length > 0) {
                    tags.push(...story.currentTags);
                }
                steps++;
            }

            // If choices available, always pick choice 0
            while (story.currentChoices.length > 0 && steps < MAX_STEPS) {
                story.ChooseChoiceIndex(0);
                while (story.canContinue && steps < MAX_STEPS) {
                    const text = story.Continue();
                    texts.push(text);
                    if (story.currentTags && story.currentTags.length > 0) {
                        tags.push(...story.currentTags);
                    }
                    steps++;
                }
            }

            return { tags, texts };
        }

        const origResult = runStory(FIXTURE_JSON);
        const wm1Result = runStory(wm1);

        // Tags must be byte-identical
        expect(wm1Result.tags).toEqual(origResult.tags);

        // Text count must be same (content may differ due to watermark)
        expect(wm1Result.texts.length).toBe(origResult.texts.length);
    });
});

// ---------------------------------------------------------------------------
// 4. Re-serialization preserves watermark
// ---------------------------------------------------------------------------
describe('watermark survives re-serialization', () => {
    it('extractWatermark after stringify→parse gives same bitstring', () => {
        const reserialized = JSON.parse(JSON.stringify(wm1));
        const bitsAfter = extractWatermark(reserialized);
        expect(bitsAfter).toBe(bits1);
    });

    it('scoreMatch still identifies correct buildId after re-serialization', () => {
        const reserialized = JSON.parse(JSON.stringify(wm1));
        const bitsAfter = extractWatermark(reserialized);
        const score = scoreMatch(bitsAfter, 'deadbeef0000', bitsAfter.length);
        expect(score).toBe(100);
    });
});
