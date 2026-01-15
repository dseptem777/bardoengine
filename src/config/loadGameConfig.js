/**
 * Game Config Loader
 * Loads per-game configuration from {storyId}.config.json files
 */

// Default config for games without a config file
export const DEFAULT_CONFIG = {
    title: 'BardoEngine Game',
    version: '0.1.0',
    stats: {
        enabled: false,
        definitions: [],
        onZero: {}
    },
    inventory: {
        enabled: false,
        maxSlots: 10,
        categories: ['items']
    },
    items: {}
}

// Cache for loaded configs
const configCache = {}

/**
 * Load game config from {storyId}.config.json
 * Uses Vite's dynamic import for JSON files
 */
export async function loadGameConfig(storyId) {
    if (!storyId) return DEFAULT_CONFIG

    // Return cached config if available
    if (configCache[storyId]) {
        return configCache[storyId]
    }

    try {
        // Dynamic import of JSON config file
        const configModule = await import(`../stories/${storyId}.config.json`)
        const config = { ...DEFAULT_CONFIG, ...configModule.default }

        // Cache for future use
        configCache[storyId] = config
        console.log(`[Config] Loaded config for '${storyId}' v${config.version}`)

        return config
    } catch (e) {
        console.warn(`[Config] No config found for '${storyId}', using defaults`)
        return DEFAULT_CONFIG
    }
}

/**
 * Get item definition from a loaded config
 */
export function getItemDefinition(config, itemId) {
    if (config?.items?.[itemId]) {
        return config.items[itemId]
    }

    // Fallback for unknown items
    return {
        id: itemId,
        name: itemId,
        icon: '📦',
        description: 'Item desconocido.',
        category: 'items',
        stackable: false
    }
}

/**
 * Clear config cache (useful for hot reload)
 */
export function clearConfigCache() {
    Object.keys(configCache).forEach(key => delete configCache[key])
}
