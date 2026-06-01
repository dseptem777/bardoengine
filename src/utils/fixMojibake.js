/**
 * fixMojibake.js
 * Repairs UTF-8 text that was mis-decoded as Windows-1252 by Android System WebView.
 * Example: "BuzÃ³n" → "Buzón", "ðŸ'" → "👍"
 */

// cp1252 reverse map: Unicode codepoint → cp1252 byte (0x80–0x9F range only)
const CP1252_REVERSE = {
    0x20AC: 0x80, // €
    0x201A: 0x82, // ‚
    0x0192: 0x83, // ƒ
    0x201E: 0x84, // „
    0x2026: 0x85, // …
    0x2020: 0x86, // †
    0x2021: 0x87, // ‡
    0x02C6: 0x88, // ˆ
    0x2030: 0x89, // ‰
    0x0160: 0x8A, // Š
    0x2039: 0x8B, // ‹
    0x0152: 0x8C, // Œ
    0x017D: 0x8E, // Ž
    0x2018: 0x91, // '
    0x2019: 0x92, // '
    0x201C: 0x93, // "
    0x201D: 0x94, // "
    0x2022: 0x95, // •
    0x2013: 0x96, // –
    0x2014: 0x97, // —
    0x02DC: 0x98, // ˜
    0x2122: 0x99, // ™
    0x0161: 0x9A, // š
    0x203A: 0x9B, // ›
    0x0153: 0x9C, // œ
    0x017E: 0x9E, // ž
    0x0178: 0x9F, // Ÿ
}

const MOJIBAKE_GATE = /[^\x00-\x7F][^\x00-\x7F]/

/**
 * Attempt to repair a single string that was decoded as cp1252 instead of UTF-8.
 * Returns the original string if it doesn't look like mojibake or repair fails.
 */
export function fixMojibake(value) {
    if (typeof value !== 'string') return value
    if (!MOJIBAKE_GATE.test(value)) return value

    const bytes = new Uint8Array(value.length)
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i)
        if (code <= 0xFF) {
            bytes[i] = code
        } else {
            const mapped = CP1252_REVERSE[code]
            if (mapped === undefined) {
                // Character not representable as cp1252 — not mojibake, return original
                return value
            }
            bytes[i] = mapped
        }
    }

    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch (_) {
        // Not valid UTF-8 when re-interpreted — return original (already correct)
        return value
    }
}

/**
 * Recursively walk an object/array/string and apply fixMojibake to every string value.
 * Returns a repaired copy (does not mutate the original).
 */
export function fixMojibakeDeep(obj) {
    if (typeof obj === 'string') return fixMojibake(obj)
    if (Array.isArray(obj)) return obj.map(fixMojibakeDeep)
    if (obj !== null && typeof obj === 'object') {
        const result = {}
        for (const key of Object.keys(obj)) {
            result[key] = fixMojibakeDeep(obj[key])
        }
        return result
    }
    return obj
}
