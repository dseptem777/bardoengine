/**
 * Achievements Registry
 * Centralizes validation and normalization for game achievements.
 * Ensures consistent structure for the achievements system.
 */

/**
 * Validate a single achievement definition
 * @param {object} achievement
 * @returns {boolean}
 */
export function validateAchievement(achievement) {
    if (!achievement) return false

    if (!achievement.id || typeof achievement.id !== 'string') {
        console.warn('[Achievements] Invalid or missing ID:', achievement)
        return false
    }

    if (!achievement.title) {
        console.warn(`[Achievements] Missing title for achievement "${achievement.id}"`)
        return false
    }

    return true
}

/**
 * Normalize a list of achievements with defaults
 * @param {Array} list - Raw achievement definitions
 * @returns {Array} - Validated and normalized definitions
 */
export function normalizeAchievements(list) {
    if (!Array.isArray(list)) {
        console.warn('[Achievements] Definitions must be an array')
        return []
    }

    return list.filter(validateAchievement).map(a => ({
        // Defaults
        icon: '🏆',
        description: '',
        hidden: false,
        secret: false, // Alias for hidden
        ...a,
        // Ensure hidden/secret consistency
        hidden: a.hidden || a.secret || false
    }))
}
