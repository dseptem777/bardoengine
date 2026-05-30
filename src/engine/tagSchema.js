/**
 * tagSchema — the contract for the Ink → engine tag bridge.
 *
 * Single source of truth for the *structured* tags that `useTagProcessor` parses
 * directly: the horror / willpower / spider / boss / genjutsu / chapter-break /
 * minigame / achievement / input families.
 *
 * Design notes:
 *  - Open-ended namespaces are intentionally NOT enumerated here. VFX effects
 *    (`shake`, `flash_red`, `bg:`, `play_sfx:`, `music:`, `UI_EFFECT:` …) and the
 *    game-system tags (`stat:`, `inv:` …) are classified as `passthrough` and are
 *    always considered valid, so this validator can never false-flag them.
 *  - `validateTag()` is OBSERVE-ONLY. It mirrors the real handler semantics in
 *    `useTagProcessor` and reports when a tag *looks like* a known structured
 *    family but is malformed in a way the handler silently ignores (the classic
 *    example: `CHAPTER_BREAK:` with no `title=`, which renders nothing).
 *  - It never throws for normal input and never changes routing.
 *
 * Matching mirrors `useTagProcessor`: most structured families are matched
 * case-insensitively via `startsWith`; `achievement:unlock:` / `input:` /
 * `MINIGAME:` mirror their own casing. The first matching family wins, in the
 * same order the processor checks them.
 */

const DECAY_RATES = ['slow', 'normal', 'fast', 'extreme']
const RESISTANCE_LEVELS = ['high', 'medium', 'low', 'none']

/** Substring after a known prefix (prefix already matched case-insensitively). */
function after(tag, prefixLen) {
    return tag.slice(prefixLen).trim()
}

function isIntLike(s) {
    if (s === undefined || s === null) return false
    const t = String(s).trim()
    if (t === '') return false
    return !Number.isNaN(parseInt(t, 10))
}

const up = (tag) => tag.trim().toUpperCase()
const lo = (tag) => tag.trim().toLowerCase()

/**
 * Ordered family table. Each entry:
 *   family   - stable name (used by callers/tests)
 *   match    - (tag) => boolean, mirrors the processor's detection
 *   validate - (tag) => string[]  list of human-readable issues ([] = valid)
 */
const FAMILIES = [
    // ── Horror ──────────────────────────────────────────────────────────────
    {
        family: 'KEY_MASH',
        match: (t) => up(t).startsWith('KEY_MASH:'),
        validate: (t) => after(t, 'KEY_MASH:'.length) === ''
            ? ['missing count or variable after "KEY_MASH:"'] : [],
    },
    {
        family: 'MOUSE_RESISTANCE',
        match: (t) => up(t).startsWith('MOUSE_RESISTANCE:'),
        validate: (t) => {
            const level = after(t, 'MOUSE_RESISTANCE:'.length).toLowerCase()
            return RESISTANCE_LEVELS.includes(level)
                ? [] : [`level "${level}" not one of ${RESISTANCE_LEVELS.join('|')}`]
        },
    },
    {
        family: 'MOUSE_MAGNET',
        match: (t) => up(t).startsWith('MOUSE_MAGNET:'),
        validate: (t) => after(t, 'MOUSE_MAGNET:'.length) === ''
            ? ['missing target id after "MOUSE_MAGNET:"'] : [],
    },

    // ── Willpower (order: START → STOP → CHECK, as in the processor) ─────────
    {
        family: 'WILLPOWER_START',
        match: (t) => up(t).startsWith('WILLPOWER_START'),
        validate: (t) => {
            // Optional `:rate`. Defaults to "normal" when absent.
            const rate = t.split(':')[1]?.trim().toLowerCase()
            return (rate && !DECAY_RATES.includes(rate))
                ? [`decay rate "${rate}" not one of ${DECAY_RATES.join('|')}`] : []
        },
    },
    {
        // Processor matches WILLPOWER_STOP with strict `===`, so any trailing
        // payload would silently fall through. Flag that.
        family: 'WILLPOWER_STOP',
        match: (t) => up(t).startsWith('WILLPOWER_STOP'),
        validate: (t) => up(t) === 'WILLPOWER_STOP'
            ? [] : ['"WILLPOWER_STOP" takes no payload (handler matches it exactly)'],
    },
    {
        family: 'WILLPOWER_CHECK',
        match: (t) => up(t).startsWith('WILLPOWER_CHECK:'),
        validate: (t) => isIntLike(t.split(':')[1])
            ? [] : ['missing/non-numeric threshold (defaults to 50 silently)'],
    },

    // ── Genjutsu ────────────────────────────────────────────────────────────
    {
        family: 'GENJUTSU_BREAK',
        match: (t) => up(t).startsWith('GENJUTSU_BREAK:'),
        validate: (t) => {
            const payload = t.substring('GENJUTSU_BREAK:'.length).trim()
            const parts = payload.split(':').map((s) => s.trim())
            const issues = []
            if (!parts[0]) issues.push('missing stat (part 1 of stat:target:fisura)')
            if (!parts[1]) issues.push('missing target knot (part 2 of stat:target:fisura)')
            return issues
        },
    },

    // ── Spider (START → STOP → CHECK → DIFFICULTY) ──────────────────────────
    { family: 'SPIDER_START', match: (t) => up(t).startsWith('SPIDER_START'), validate: () => [] },
    { family: 'SPIDER_STOP', match: (t) => up(t).startsWith('SPIDER_STOP'), validate: () => [] },
    {
        family: 'SPIDER_CHECK',
        match: (t) => up(t).startsWith('SPIDER_CHECK'),
        validate: (t) => isIntLike(t.split(':')[1])
            ? [] : ['missing/non-numeric threshold (defaults to 5 silently)'],
    },
    {
        family: 'SPIDER_DIFFICULTY',
        match: (t) => up(t).startsWith('SPIDER_DIFFICULTY'),
        validate: (t) => (t.split(':')[1]?.trim())
            ? [] : ['missing difficulty after "SPIDER_DIFFICULTY:"'],
    },

    // ── Arrebatados / scroll friction ───────────────────────────────────────
    { family: 'ARREBATADOS_START', match: (t) => up(t).startsWith('ARREBATADOS_START'), validate: () => [] },
    {
        family: 'ARREBATADOS_ADD',
        match: (t) => up(t).startsWith('ARREBATADOS_ADD'),
        validate: (t) => isIntLike(t.split(':')[1])
            ? [] : ['missing/non-numeric count (defaults to 1 silently)'],
    },
    { family: 'ARREBATADOS_STOP', match: (t) => up(t).startsWith('ARREBATADOS_STOP'), validate: () => [] },

    // ── Boss controller ─────────────────────────────────────────────────────
    {
        family: 'BOSS_START',
        match: (t) => up(t).startsWith('BOSS_START'),
        validate: (t) => {
            // Optional `hp=N`; warn only if explicitly present and non-numeric.
            const m = t.match(/hp\s*=\s*([^,]*)/i)
            return (m && !isIntLike(m[1])) ? [`hp "${m[1].trim()}" is not numeric`] : []
        },
    },
    {
        family: 'BOSS_PHASE',
        match: (t) => up(t).startsWith('BOSS_PHASE'),
        validate: (t) => isIntLike(t.split(':')[1])
            ? [] : ['missing/non-numeric phase (defaults to 1 silently)'],
    },
    {
        family: 'BOSS_DAMAGE',
        match: (t) => up(t).startsWith('BOSS_DAMAGE'),
        validate: (t) => isIntLike(t.split(':')[1])
            ? [] : ['missing/non-numeric amount (defaults to 10 silently)'],
    },
    { family: 'BOSS_CHECK', match: (t) => up(t).startsWith('BOSS_CHECK'), validate: () => [] },
    { family: 'BOSS_STOP', match: (t) => up(t).startsWith('BOSS_STOP'), validate: () => [] },

    // ── Visual damage ───────────────────────────────────────────────────────
    {
        family: 'VISUAL_DAMAGE',
        match: (t) => up(t).startsWith('VISUAL_DAMAGE'),
        validate: (t) => {
            const raw = t.split(':').slice(1).join(':').trim()
            if (raw === '' || raw.toLowerCase() === 'reset') return [] // record-death / reset
            return /grayscale\s*=\s*[\d.]+/.test(raw)
                ? [] : ['payload should be "reset" or "grayscale=<number>"']
        },
    },

    // ── Chapter break — title is mandatory or the handler renders nothing ────
    {
        family: 'CHAPTER_BREAK',
        match: (t) => up(t).startsWith('CHAPTER_BREAK:'),
        validate: (t) => {
            // Mirror the handler: split into segments on commas before a known key,
            // then look for a segment whose key is exactly `title` with a value.
            // (A naive /title=/ regex would false-match inside `subtitle=`.)
            const payload = t.substring('CHAPTER_BREAK:'.length).trim()
            const segments = payload.split(/,\s*(?=(?:title|subtitle|image|music)=)/i)
            let hasTitle = false
            for (const seg of segments) {
                const eq = seg.indexOf('=')
                if (eq === -1) continue
                const key = seg.substring(0, eq).trim().toLowerCase()
                const val = seg.substring(eq + 1).trim()
                if (key === 'title' && val !== '') hasTitle = true
            }
            return hasTitle
                ? [] : ['missing "title=" — CHAPTER_BREAK without a title is silently ignored']
        },
    },

    // ── Minigame ────────────────────────────────────────────────────────────
    {
        family: 'MINIGAME',
        match: (t) => up(t).startsWith('MINIGAME:'),
        validate: (t) => after(t, 'MINIGAME:'.length) === ''
            ? ['missing minigame type after "MINIGAME:"'] : [],
    },

    // ── Achievement ─────────────────────────────────────────────────────────
    {
        family: 'achievement',
        match: (t) => lo(t).startsWith('achievement:unlock:'),
        validate: (t) => {
            const id = t.split(':')[2]?.trim()
            return id ? [] : ['missing achievement id (achievement:unlock:<id>)']
        },
    },

    // ── Input ───────────────────────────────────────────────────────────────
    {
        family: 'input',
        match: (t) => lo(t).startsWith('input:'),
        validate: (t) => {
            const varName = t.split(':')[1]?.trim()
            return varName ? [] : ['missing variable name (input:<var>:<placeholder>)']
        },
    },
]

/** Stable list of structured family names (handy for tests / docs). */
export const TAG_FAMILIES = FAMILIES.map((f) => f.family)

/**
 * Classify a tag into its structured family name, or:
 *  - 'empty'       for blank tags (the processor skips these)
 *  - 'passthrough' for anything else (VFX / stat / inv — always valid here)
 */
export function classifyTag(tag) {
    if (tag == null) return 'empty'
    const t = String(tag).trim()
    if (t === '') return 'empty'
    const fam = FAMILIES.find((f) => f.match(t))
    return fam ? fam.family : 'passthrough'
}

/**
 * Validate a tag against the contract.
 * @returns {{ family: string, valid: boolean, issues: string[] }}
 *
 * `empty` and `passthrough` are always valid. Structured families are valid only
 * when their handler would actually act on them. Never throws.
 */
export function validateTag(tag) {
    try {
        if (tag == null) return { family: 'empty', valid: true, issues: [] }
        const t = String(tag).trim()
        if (t === '') return { family: 'empty', valid: true, issues: [] }

        const fam = FAMILIES.find((f) => f.match(t))
        if (!fam) return { family: 'passthrough', valid: true, issues: [] }

        const issues = fam.validate(t) || []
        return { family: fam.family, valid: issues.length === 0, issues }
    } catch {
        // Validation must never break tag processing.
        return { family: 'passthrough', valid: true, issues: [] }
    }
}
