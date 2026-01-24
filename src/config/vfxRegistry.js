/**
 * VFX Registry
 * Centralized parser for narrative tags related to Visual Effects and Audio.
 *
 * Usage:
 * const effect = parseVFXTag('flash_red')
 * if (effect) handleEffect(effect)
 */

export const VFX_TYPES = {
    SHAKE: 'shake',
    FLASH: 'flash',
    BACKGROUND: 'background',
    SFX: 'sfx',
    MUSIC: 'music',
    CUSTOM: 'custom'
}

/**
 * Parse a raw Ink tag into a structured effect object
 * @param {string} tag - The raw tag string (e.g., "shake", "bg:forest")
 * @returns {object|null} - Effect configuration or null if not a VFX tag
 */
export function parseVFXTag(tag) {
    if (!tag || typeof tag !== 'string') return null

    // Normalize
    const t = tag.trim()

    // 1. Screen Shake
    if (t === 'shake') {
        return { type: VFX_TYPES.SHAKE }
    }

    // 2. Screen Flash
    if (t.startsWith('flash_')) {
        const color = t.replace('flash_', '')
        return {
            type: VFX_TYPES.FLASH,
            color: color // 'red', 'blue', 'multi', etc.
        }
    }

    // 3. Background Change
    if (t.startsWith('bg:')) {
        return {
            type: VFX_TYPES.BACKGROUND,
            id: t.replace('bg:', '')
        }
    }

    // 4. Sound Effects
    if (t.startsWith('play_sfx:')) {
        return {
            type: VFX_TYPES.SFX,
            id: t.replace('play_sfx:', '')
        }
    }

    // 5. Music Control
    if (t.startsWith('music:')) {
        const value = t.replace('music:', '')
        if (value === 'stop') {
            return { type: VFX_TYPES.MUSIC, action: 'stop' }
        }
        return { type: VFX_TYPES.MUSIC, action: 'play', id: value }
    }

    // 6. Custom / Misc
    if (t === 'pitch_high') {
        return { type: VFX_TYPES.CUSTOM, id: 'pitch_high' }
    }

    return null
}
