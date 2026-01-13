/**
 * Game Configurations for BardoEngine
 * Each game/story can define its own stats and inventory settings
 */

export const GAME_CONFIGS = {
    // Default config for games without specific configuration
    _default: {
        stats: {
            enabled: false,
            definitions: []
        },
        inventory: {
            enabled: false,
            maxSlots: 10,
            categories: ['items']
        }
    },

    // Serruchín - Demo de mecánica inmersiva de autoamputación
    serruchin: {
        stats: {
            enabled: true,
            definitions: [
                {
                    id: 'hp',
                    label: 'Vida',
                    icon: '❤️',
                    displayType: 'bar',
                    min: 0,
                    max: 100,
                    initial: 100,
                    color: '#ef4444'
                }
            ],
            onZero: {
                hp: { action: 'end', message: 'El dolor fue demasiado. Tu cuerpo no aguantó...' }
            }
        },
        inventory: {
            enabled: true,
            maxSlots: 5,
            categories: ['herramientas', 'trofeos']
        }
    },

    // Partuza - Demo game with full features
    partuza: {
        stats: {
            enabled: true,
            definitions: [
                // RECURSOS (barras) - se consumen/regeneran
                {
                    id: 'hp',
                    label: 'Vida',
                    icon: '❤️',
                    displayType: 'bar',
                    min: 0,
                    max: 100,
                    initial: 100,
                    color: '#ef4444'
                },
                {
                    id: 'cordura',
                    label: 'Cordura',
                    icon: '🧠',
                    displayType: 'bar',
                    min: 0,
                    max: 100,
                    initial: 80,
                    color: '#8b5cf6'
                },
                // ATRIBUTOS (valores) - raramente cambian
                {
                    id: 'karma',
                    label: 'Karma',
                    icon: '⚖️',
                    displayType: 'value',
                    min: -100,
                    max: 100,
                    initial: 0
                }
            ],
            onZero: {
                hp: { action: 'end', message: 'La parca vino por vos...' },
                cordura: { action: 'end', message: 'Te volviste completamente loco.' }
            }
        },
        inventory: {
            enabled: true,
            maxSlots: 10,
            categories: ['items', 'claves', 'documentos']
        }
    }
}

/**
 * Item definitions - Can be extended per game
 * These define the metadata for items that can be added to inventory
 * 
 * iconType options:
 * - 'emoji' (default): icon is an emoji string
 * - 'image': icon is a path to a local image (gets bundled)
 */
export const ITEM_DEFINITIONS = {
    // Partuza items - using emojis
    llave_dorada: {
        id: 'llave_dorada',
        name: 'Llave Dorada',
        icon: '🔑',
        iconType: 'emoji',  // optional, 'emoji' is default
        description: 'Una llave misteriosa que brilla con luz propia.',
        category: 'claves',
        stackable: false
    },
    sobre_misterioso: {
        id: 'sobre_misterioso',
        name: 'Sobre Misterioso',
        icon: '📧',
        description: 'Un sobre sellado con cera roja.',
        category: 'documentos',
        stackable: false
    },
    catalogo_coto: {
        id: 'catalogo_coto',
        name: 'Catálogo de Coto',
        icon: '📄',
        description: 'Ofertas de acelga y pepitas.',
        category: 'documentos',
        stackable: false
    },
    polvo_estrellas: {
        id: 'polvo_estrellas',
        name: 'Polvo de Estrellas',
        icon: '✨',
        description: 'Un frasco con polvo brillante de origen dudoso.',
        category: 'items',
        stackable: false
    },
    // Serruchín items
    serruchin: {
        id: 'serruchin',
        name: 'Serrucho Oxidado',
        icon: '🪚',
        iconType: 'emoji',
        description: 'Un serrucho viejo y oxidado. Manchas sospechosas cubren los dientes.',
        category: 'herramientas',
        stackable: false
    },
    brazo_podrido: {
        id: 'brazo_podrido',
        name: 'Tu Brazo Gangrenado',
        icon: '🦴',
        iconType: 'emoji',
        description: 'Lo que queda de tu brazo izquierdo. Negro, podrido, pero ya no es tu problema.',
        category: 'trofeos',
        stackable: false
    },

    whisky: {
        id: 'whisky',
        name: 'Whisky',
        icon: '🥃',
        description: 'Una botella de whisky.',
        category: 'items',
        stackable: true
    }

    // Example with local image (uncomment when you have assets):
    // espada_antigua: {
    //     id: 'espada_antigua',
    //     name: 'Espada Antigua',
    //     icon: '/assets/items/espada.png',  // Place in public/assets/items/
    //     iconType: 'image',
    //     description: 'Una espada oxidada pero aún afilada.',
    //     category: 'items',
    //     stackable: false
    // }
}

/**
 * Get config for a specific story, falling back to default
 */
export function getGameConfig(storyId) {
    return GAME_CONFIGS[storyId] || GAME_CONFIGS._default
}

/**
 * Get item definition by ID
 */
export function getItemDefinition(itemId) {
    return ITEM_DEFINITIONS[itemId] || {
        id: itemId,
        name: itemId,
        icon: '📦',
        description: 'Item desconocido.',
        category: 'items',
        stackable: false
    }
}
