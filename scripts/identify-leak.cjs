/**
 * identify-leak.cjs
 * Identify the probable origin of a leaked Ink JSON by matching its watermark
 * against all entries in .omc/build-registry.json.
 *
 * Usage: node scripts/identify-leak.cjs <suspect.json>
 *
 * Output: top 3 matching builds, sorted by score descending, with channel/recipient/timestamp.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { extractWatermark, scoreMatch } = require('./watermark.cjs');

const BUILD_REGISTRY = path.join(__dirname, '..', '.omc', 'build-registry.json');

function loadRegistry() {
    if (!fs.existsSync(BUILD_REGISTRY)) {
        console.error(`Error: build registry not found at ${BUILD_REGISTRY}`);
        console.error('No builds have been registered yet.');
        process.exit(1);
    }
    const lines = fs.readFileSync(BUILD_REGISTRY, 'utf8')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

    return lines.map((line, i) => {
        try {
            return JSON.parse(line);
        } catch (e) {
            console.warn(`Warning: skipping malformed registry line ${i + 1}: ${e.message}`);
            return null;
        }
    }).filter(Boolean);
}

function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === '--help') {
        console.log('Usage: node scripts/identify-leak.cjs <suspect.json>');
        console.log('');
        console.log('Extracts the narrative watermark from a leaked/decrypted Ink JSON');
        console.log('and scores it against all builds in .omc/build-registry.json.');
        process.exit(args[0] === '--help' ? 0 : 1);
    }

    const suspectPath = path.resolve(args[0]);
    if (!fs.existsSync(suspectPath)) {
        console.error(`Error: file not found: ${suspectPath}`);
        process.exit(1);
    }

    console.log(`\nLoading suspect JSON: ${suspectPath}`);
    let suspectJson;
    try {
        suspectJson = JSON.parse(fs.readFileSync(suspectPath, 'utf8'));
    } catch (e) {
        console.error(`Error parsing JSON: ${e.message}`);
        process.exit(1);
    }

    console.log('Extracting watermark bitstring...');
    const bitstring = extractWatermark(suspectJson);
    console.log(`Extracted ${bitstring.length} bits from watermark slots.`);

    if (bitstring.length === 0) {
        console.log('\nNo watermark slots found in this JSON.');
        console.log('Either the file has no ^text strings, or the watermark was fully stripped.');
        process.exit(0);
    }

    const registry = loadRegistry();
    console.log(`Scoring against ${registry.length} registered builds...\n`);

    const scored = registry.map(entry => ({
        ...entry,
        score: scoreMatch(bitstring, entry.buildId, bitstring.length),
    }));

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 3);

    console.log('Top 3 matches:');
    console.log('─'.repeat(60));
    top.forEach((entry, i) => {
        console.log(`#${i + 1}  Score: ${entry.score}%`);
        console.log(`    buildId:   ${entry.buildId}`);
        console.log(`    channel:   ${entry.channel}`);
        console.log(`    recipient: ${entry.recipient || '(none)'}`);
        console.log(`    version:   ${entry.version}`);
        console.log(`    timestamp: ${entry.timestamp}`);
        console.log(`    gitSha:    ${entry.gitSha}`);
        console.log('');
    });

    if (top.length > 0 && top[0].score >= 70) {
        console.log(`Likely source: ${top[0].buildId} (${top[0].channel}${top[0].recipient ? ' / ' + top[0].recipient : ''})`);
    } else if (top.length > 0) {
        console.log(`Inconclusive — best match is only ${top[0].score}%. Watermark may have been partially normalized.`);
    }
}

main();
