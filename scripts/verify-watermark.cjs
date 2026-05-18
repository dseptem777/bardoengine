/**
 * verify-watermark.cjs
 * Structural verification: assert that a watermarked JSON is functionally
 * identical to the original, differing only in allowed substitution chars.
 *
 * Usage: node scripts/verify-watermark.cjs <original.json> <watermarked.json>
 *
 * Exit 0 = verification passed.
 * Exit 1 = violation found (prints details).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { SUBSTITUTION_TABLE } = require('./watermark-table.cjs');

// ---------------------------------------------------------------------------
// Build a set of all allowed substitution characters (both v0 and v1)
// ---------------------------------------------------------------------------
function buildAllowedSubstChars() {
    const chars = new Set();
    for (const entry of SUBSTITUTION_TABLE) {
        for (const c of entry.v0) chars.add(c);
        for (const c of entry.v1) chars.add(c);
    }
    return chars;
}

const ALLOWED_SUBST_CHARS = buildAllowedSubstChars();

/**
 * Normalize a string to canonical v0 form for structural comparison.
 * All substitution variants are collapsed to their v0 representative.
 * This lets us compare orig vs wm by normalizing both — they must match.
 */
function normalize(str) {
    let s = str;
    for (const entry of SUBSTITUTION_TABLE) {
        const re = new RegExp(entry.pattern.source, entry.pattern.flags);
        s = s.replace(re, entry.v0);
    }
    return s;
}

/**
 * Check if two strings differ only in allowed substitution positions.
 * Strategy: normalize both to v0 canonical form — they must be identical.
 * If not, the diff is outside the allowed substitution set.
 * Returns null if OK, or a description of the first violation.
 */
function checkStringDiff(orig, wm, pathStr) {
    if (orig === wm) return null; // identical — fine

    const normOrig = normalize(orig);
    const normWm = normalize(wm);

    if (normOrig !== normWm) {
        // Find the first differing position for a useful error message
        const len = Math.min(normOrig.length, normWm.length);
        for (let i = 0; i < len; i++) {
            if (normOrig[i] !== normWm[i]) {
                return `Illegal diff at ${pathStr} pos ${i}: orig normalized="${normOrig.slice(Math.max(0,i-10), i+10)}" wm normalized="${normWm.slice(Math.max(0,i-10), i+10)}"`;
            }
        }
        return `Length mismatch at ${pathStr}: orig normalized length=${normOrig.length} wm=${normWm.length}`;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Deep structural comparison
// ---------------------------------------------------------------------------

let violations = [];
let checked = 0;

function deepCompare(orig, wm, pathStr) {
    const typeO = typeof orig;
    const typeW = typeof wm;

    if (typeO !== typeW) {
        violations.push(`Type mismatch at ${pathStr}: ${typeO} vs ${typeW}`);
        return;
    }

    if (orig === null || wm === null) {
        if (orig !== wm) violations.push(`Null mismatch at ${pathStr}`);
        return;
    }

    if (typeO === 'string') {
        checked++;
        if (orig.startsWith('^')) {
            // ^text strings may differ only in substitution chars
            const err = checkStringDiff(orig, wm, pathStr);
            if (err) violations.push(err);
        } else {
            // All other strings must be byte-identical
            if (orig !== wm) {
                violations.push(`Non-^ string changed at ${pathStr}: orig="${orig.slice(0,80)}" wm="${wm.slice(0,80)}"`);
            }
        }
        return;
    }

    if (typeO === 'number' || typeO === 'boolean') {
        if (orig !== wm) violations.push(`Value mismatch at ${pathStr}: ${orig} vs ${wm}`);
        return;
    }

    if (Array.isArray(orig)) {
        if (!Array.isArray(wm)) {
            violations.push(`Array vs non-array at ${pathStr}`);
            return;
        }
        if (orig.length !== wm.length) {
            violations.push(`Array length mismatch at ${pathStr}: ${orig.length} vs ${wm.length}`);
            return;
        }
        for (let i = 0; i < orig.length; i++) {
            deepCompare(orig[i], wm[i], `${pathStr}[${i}]`);
        }
        return;
    }

    if (typeO === 'object') {
        const origKeys = Object.keys(orig).sort();
        const wmKeys = Object.keys(wm).sort();
        if (JSON.stringify(origKeys) !== JSON.stringify(wmKeys)) {
            violations.push(`Key set mismatch at ${pathStr}: ${origKeys.join(',')} vs ${wmKeys.join(',')}`);
            return;
        }
        for (const key of origKeys) {
            deepCompare(orig[key], wm[key], `${pathStr}.${key}`);
        }
    }
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node scripts/verify-watermark.cjs <original.json> <watermarked.json>');
        process.exit(1);
    }

    const origPath = path.resolve(args[0]);
    const wmPath = path.resolve(args[1]);

    for (const p of [origPath, wmPath]) {
        if (!fs.existsSync(p)) {
            console.error(`Error: file not found: ${p}`);
            process.exit(1);
        }
    }

    console.log(`Verifying watermark integrity...`);
    console.log(`  Original:    ${origPath}`);
    console.log(`  Watermarked: ${wmPath}`);

    const orig = JSON.parse(fs.readFileSync(origPath, 'utf8'));
    const wm = JSON.parse(fs.readFileSync(wmPath, 'utf8'));

    violations = [];
    checked = 0;
    deepCompare(orig, wm, 'root');

    console.log(`\nChecked ${checked} strings.`);

    if (violations.length === 0) {
        console.log('PASS: watermark is structurally valid — no forbidden diffs found.');
        process.exit(0);
    } else {
        console.error(`FAIL: ${violations.length} violation(s) found:`);
        for (const v of violations.slice(0, 20)) {
            console.error(`  - ${v}`);
        }
        if (violations.length > 20) {
            console.error(`  ... and ${violations.length - 20} more.`);
        }
        process.exit(1);
    }
}

main();
