import QTEGame from '../components/minigames/QTEGame'
import LockpickGame from '../components/minigames/LockpickGame'
import ArkanoidGame from '../components/minigames/ArkanoidGame'
import ApneaGame from '../components/minigames/ApneaGame'
import KeyMashGame from '../components/minigames/KeyMashGame'

/**
 * Minigame Registry
 * Maps minigame type strings to React components.
 *
 * To add a new minigame:
 * 1. Import the component
 * 2. Add it to the MINIGAME_REGISTRY object
 */
export const MINIGAME_REGISTRY = {
    'qte': QTEGame,
    'lockpick': LockpickGame,
    'arkanoid': ArkanoidGame,
    'apnea': ApneaGame,
    'keymash': KeyMashGame
}

/**
 * Get minigame component by type
 * @param {string} type - Minigame type identifier
 * @returns {React.Component|null} - The component or null if not found
 */
export function getMinigameComponent(type) {
    if (!type) return null
    return MINIGAME_REGISTRY[type.toLowerCase()] || null
}
