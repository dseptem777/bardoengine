/**
 * tagTiming.js
 * Classifies Ink tags as "deferrable" (fired when typewriter crosses the paragraph)
 * or "instant" (fired upfront before the typewriter starts).
 *
 * Deferrable: point-in-time sensory effects — SFX, shake, flash.
 * Instant: everything that sets scene state (music, bg, stats, inventory, systems).
 */

/**
 * Returns true if the tag should be deferred until the typewriter
 * reaches the paragraph that emitted it.
 *
 * @param {string} tag - Raw Ink tag string (may have surrounding whitespace)
 * @returns {boolean}
 */
export function isDeferrableTag(tag) {
    if (!tag || typeof tag !== 'string') return false

    const t = tag.trim()
    const lower = t.toLowerCase()

    // Sound effects — always deferred (tied to the moment described in text)
    if (lower.startsWith('play_sfx:')) return true

    // Screen shake — point-in-time, e.g. "Caí haciendo un escándalo"
    if (lower === 'shake') return true

    // Screen flashes — point-in-time visual hit
    if (lower.startsWith('flash_')) return true

    // UI_EFFECT — these are persistent mode toggles (blur_vignette, cold_blue, etc.)
    // They set an ambient state for the scene, not a one-shot effect tied to a paragraph.
    // Keep as instant so the visual context loads before text starts.
    // If a future story needs deferred UI_EFFECT, this can be made configurable.
    // if (t.toUpperCase().startsWith('UI_EFFECT:')) return true  // intentionally instant

    return false
}
