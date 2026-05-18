/**
 * watermark-table.cjs
 * Substitution table for narrative watermarking.
 *
 * Each entry encodes 1 bit per occurrence found in a ^text string.
 * variant_0 = bit 0, variant_1 = bit 1.
 *
 * Rules:
 * - Only applied to strings starting with ^ (narrative text in compiled Ink JSON).
 * - NEVER applied to strings starting with # (tags), -> (diverts), or any non-^ strings.
 * - NEVER applied to object keys.
 * - The regex field matches any occurrence of either variant in a string.
 *   The replacement function receives the match and the desired bit (0 or 1).
 */

'use strict';

/**
 * @typedef {Object} SubstitutionEntry
 * @property {string} id          - Short identifier for the slot type.
 * @property {string} v0          - The character(s) representing bit 0.
 * @property {string} v1          - The character(s) representing bit 1.
 * @property {RegExp} pattern     - Matches either variant anywhere in the string.
 * @property {string} description - Human-readable description.
 */

/** @type {SubstitutionEntry[]} */
const SUBSTITUTION_TABLE = [
    {
        id: 'em_dash',
        v0: '—',       // em-dash U+2014
        v1: '--',           // double hyphen
        pattern: /—|--/g,
        description: 'em-dash (U+2014) vs double hyphen (--)',
    },
    {
        id: 'en_dash',
        v0: ' – ',     // en-dash with surrounding spaces " – "
        v1: ' - ',          // spaced hyphen " - "
        // Match either spaced en-dash or spaced hyphen (narrative dash usage)
        pattern: / – | - /g,
        description: 'spaced en-dash ( – ) vs spaced hyphen ( - )',
    },
    {
        id: 'ldquo',
        v0: '“',       // left double curly quote U+201C
        v1: '"',            // straight double quote
        // Match any double-quote variant: left curly, right curly, or straight
        pattern: /[“”"]/g,
        description: 'curly double quotes (“”) vs straight double quote (")',
    },
    {
        id: 'lsquo',
        v0: '’',       // right single curly quote / curly apostrophe U+2019
        v1: "'",            // straight apostrophe
        // Match any single-quote apostrophe variant
        pattern: /[‘’']/g,
        description: 'curly apostrophe (’) vs straight apostrophe (\')',
    },
    {
        id: 'ellipsis',
        v0: '…',       // horizontal ellipsis U+2026
        v1: '...',          // three dots
        pattern: /…|\.\.\./g,
        description: 'ellipsis (U+2026) vs three dots (...)',
    },
    {
        id: 'nbsp',
        // Only substitute spaces that are NOT at the start or end of the string.
        // This avoids changing Ink indentation or leading/trailing whitespace.
        v0: ' ',       // regular space U+0020
        v1: ' ',       // no-break space U+00A0
        // Match either regular space or nbsp so extraction works after substitution
        pattern: /[  ]/g,
        description: 'regular space (U+0020) vs no-break space (U+00A0) — interior positions only',
    },
];

module.exports = { SUBSTITUTION_TABLE };
