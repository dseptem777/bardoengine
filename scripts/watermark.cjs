/**
 * watermark.cjs
 * Narrative watermarking for compiled Ink JSON.
 *
 * Strategy:
 * - Deep-walk all strings in the Ink JSON that start with "^" (narrative text).
 * - Each substitution opportunity in such a string is a "slot" encoding 1 bit.
 * - The bit sequence is derived deterministically from sha256(buildId + slotIndex).
 * - Tags (#), diverts (->), and all other non-^ strings are left byte-identical.
 * - Object keys are never touched.
 *
 * Public API:
 *   applyNarrativeWatermark(jsonObj, buildId) -> jsonObj (deep clone, watermarked)
 *   extractWatermark(jsonObj)                 -> bitstring (e.g. "01101...")
 *   scoreMatch(bitstring, candidateBuildId, expectedLength) -> number (0-100)
 */

'use strict';

const crypto = require('crypto');
const { SUBSTITUTION_TABLE } = require('./watermark-table.cjs');

// ---------------------------------------------------------------------------
// Bit derivation
// ---------------------------------------------------------------------------

/**
 * Derive a bit (0 or 1) for a given buildId and global slot index.
 * Uses sha256(buildId + ":" + slotIndex) and takes the LSB of the first byte.
 * @param {string} buildId
 * @param {number} slotIndex
 * @returns {0|1}
 */
function deriveBit(buildId, slotIndex) {
    const hash = crypto.createHash('sha256')
        .update(`${buildId}:${slotIndex}`)
        .digest();
    return hash[0] & 1;
}

// ---------------------------------------------------------------------------
// Determine which variant a matched token represents (for extraction)
// ---------------------------------------------------------------------------

/**
 * Given a matched token and its entry, determine the bit value (0 or 1).
 * @param {string} match  - The matched string.
 * @param {SubstitutionEntry} entry
 * @returns {'0'|'1'}
 */
function matchToBit(match, entry) {
    switch (entry.id) {
        case 'em_dash':
            return match === '—' ? '0' : '1';   // em-dash = 0, '--' = 1
        case 'en_dash':
            return match.includes('–') ? '0' : '1'; // " – " = 0, " - " = 1
        case 'ldquo':
            return (match === '“' || match === '”') ? '0' : '1'; // curly = 0, straight = 1
        case 'lsquo':
            return (match === '‘' || match === '’') ? '0' : '1'; // curly = 0, straight = 1
        case 'ellipsis':
            return match === '…' ? '0' : '1';   // ellipsis char = 0, '...' = 1
        case 'nbsp':
            return match === ' ' ? '0' : '1';   // regular space = 0, nbsp = 1
        default:
            return match === entry.v0 ? '0' : '1';
    }
}

/**
 * Given a desired bit and entry, return the replacement string.
 * @param {0|1} bit
 * @param {SubstitutionEntry} entry
 * @returns {string}
 */
function bitToVariant(bit, entry) {
    return bit === 0 ? entry.v0 : entry.v1;
}

// ---------------------------------------------------------------------------
// String-level watermark application
// ---------------------------------------------------------------------------

/**
 * Apply watermark substitutions to a single ^text string.
 * Returns the modified string and the number of slots consumed.
 *
 * @param {string} text       - The string value (must start with "^").
 * @param {string} buildId
 * @param {number} slotOffset - Global slot index before this string.
 * @returns {{ result: string, slotsUsed: number }}
 */
function watermarkString(text, buildId, slotOffset) {
    if (!text.startsWith('^')) {
        return { result: text, slotsUsed: 0 };
    }

    let result = text;
    let localSlot = 0;

    for (const entry of SUBSTITUTION_TABLE) {
        const re = new RegExp(entry.pattern.source, entry.pattern.flags);

        result = result.replace(re, (match, offset, fullString) => {
            // For nbsp: skip the very first and last character positions,
            // and skip spaces that are immediately adjacent to a hyphen or en-dash
            // (those spaces are part of en_dash substitution slots).
            if (entry.id === 'nbsp') {
                if (offset === 0 || offset === fullString.length - 1) {
                    return match;
                }
                const prev = fullString[offset - 1];
                const next = fullString[offset + 1];
                const dashChars = new Set(['-', '–', '—']);
                if (dashChars.has(prev) || dashChars.has(next)) {
                    return match;
                }
            }

            const globalSlot = slotOffset + localSlot;
            const bit = deriveBit(buildId, globalSlot);
            localSlot++;
            return bitToVariant(bit, entry);
        });
    }

    return { result, slotsUsed: localSlot };
}

/**
 * Read all substitution slots in a ^text string and return their current bit values.
 * @param {string} text
 * @returns {string} - bitstring fragment (e.g. "0110")
 */
function extractStringBits(text) {
    if (!text.startsWith('^')) return '';

    let bits = '';

    for (const entry of SUBSTITUTION_TABLE) {
        const re = new RegExp(entry.pattern.source, entry.pattern.flags);
        let match;
        while ((match = re.exec(text)) !== null) {
            const offset = match.index;

            // Skip boundary spaces and dash-adjacent spaces for nbsp
            if (entry.id === 'nbsp') {
                if (offset === 0 || offset === text.length - 1) continue;
                const prev = text[offset - 1];
                const next = text[offset + 1];
                const dashChars = new Set(['-', '–', '—', '–', '—']);
                if (dashChars.has(prev) || dashChars.has(next)) continue;
            }

            bits += matchToBit(match[0], entry);
        }
    }

    return bits;
}

// ---------------------------------------------------------------------------
// Deep-walk helpers
// ---------------------------------------------------------------------------

/**
 * Walk a value deeply. For every string starting with "^", call visitor.
 * Returns a new value (deep clone with modifications) and slots count.
 *
 * @param {*} value
 * @param {function(string, number): {result: string, slotsUsed: number}} visitor
 * @param {object} state - mutable state: { slotIndex: number }
 * @returns {*}
 */
function deepWalk(value, visitor, state) {
    if (typeof value === 'string') {
        if (value.startsWith('^')) {
            const { result, slotsUsed } = visitor(value, state.slotIndex);
            state.slotIndex += slotsUsed;
            return result;
        }
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => deepWalk(item, visitor, state));
    }
    if (value !== null && typeof value === 'object') {
        const out = {};
        for (const key of Object.keys(value)) {
            out[key] = deepWalk(value[key], visitor, state);
        }
        return out;
    }
    return value;
}

/**
 * Walk and collect bit readings.
 * @param {*} value
 * @param {string[]} bits - accumulator
 */
function deepExtract(value, bits) {
    if (typeof value === 'string') {
        if (value.startsWith('^')) {
            bits.push(extractStringBits(value));
        }
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value) deepExtract(item, bits);
        return;
    }
    if (value !== null && typeof value === 'object') {
        for (const key of Object.keys(value)) {
            deepExtract(value[key], bits);
        }
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Apply narrative watermark to a parsed Ink JSON object.
 * Returns a new object (deep clone). Does NOT mutate the input.
 *
 * @param {object} jsonObj - Parsed Ink story JSON.
 * @param {string} buildId - Hex build identifier (e.g. "deadbeef0000").
 * @returns {object}
 */
function applyNarrativeWatermark(jsonObj, buildId) {
    if (!buildId || typeof buildId !== 'string') {
        throw new Error('buildId must be a non-empty string');
    }
    const state = { slotIndex: 0 };
    const visitor = (text, offset) => watermarkString(text, buildId, offset);
    return deepWalk(jsonObj, visitor, state);
}

/**
 * Extract the watermark bitstring from a parsed Ink JSON object.
 * @param {object} jsonObj
 * @returns {string} - concatenated bit string (e.g. "01101100...")
 */
function extractWatermark(jsonObj) {
    const bits = [];
    deepExtract(jsonObj, bits);
    return bits.join('');
}

/**
 * Score how well a bitstring matches what we'd expect for a given buildId.
 * Returns a percentage (0-100) of matching bits.
 *
 * @param {string} bitstring        - Extracted bitstring from suspect JSON.
 * @param {string} candidateBuildId - BuildId to test against.
 * @param {number} expectedLength   - How many slots to compare (use bitstring.length).
 * @returns {number} - Match percentage 0-100.
 */
function scoreMatch(bitstring, candidateBuildId, expectedLength) {
    const len = Math.min(bitstring.length, expectedLength);
    if (len === 0) return 0;

    let matches = 0;
    for (let i = 0; i < len; i++) {
        const expected = deriveBit(candidateBuildId, i);
        const actual = parseInt(bitstring[i], 10);
        if (expected === actual) matches++;
    }
    return Math.round((matches / len) * 100);
}

module.exports = {
    applyNarrativeWatermark,
    extractWatermark,
    scoreMatch,
};
