import { useCallback } from 'react'
import { parseMinigameTag } from './useMinigameController'

interface TagProcessorOptions {
    storyRef: any;
    minigameController: any;
    achievementsSystem: any;
    gameSystems: any;
    triggerVFX: (tag: string) => void;
    onInputRequest?: (varName: string, placeholder: string) => void;
}

export function useTagProcessor({
    storyRef,
    minigameController,
    achievementsSystem,
    gameSystems,
    triggerVFX,
    onInputRequest
}: TagProcessorOptions) {
    const processTags = useCallback((tags: string[]) => {
        tags.forEach(rawTag => {
            const tag = rawTag.trim()
            if (!tag) return

            // Minigame tag
            const minigameConfig = parseMinigameTag(tag, storyRef)
            if (minigameConfig) {
                console.log('[Tags] Minigame detected:', minigameConfig)
                minigameController.queueGame(minigameConfig)
                return
            }

            // Achievement unlock tag
            if (tag.toLowerCase().startsWith('achievement:unlock:')) {
                const achievementId = tag.split(':')[2]
                console.log('[Tags] Achievement unlock:', achievementId)
                achievementsSystem.unlockAchievement(achievementId)
                return
            }

            // Game systems tags (stats, inventory)
            const handled = gameSystems.processGameTag(tag)

            // Input tag
            if (tag.toLowerCase().startsWith('input:')) {
                const parts = tag.split(':')
                const varName = parts[1]
                const placeholder = parts[2] || 'Ingresa el nombre...'
                console.log('[Tags] Input request:', varName)

                // We'll pass this up to the orchestrator via a new callback
                if (onInputRequest) {
                    onInputRequest(varName, placeholder)
                }
                return
            }

            // Fall back to VFX
            if (!handled) {
                triggerVFX(tag)
            }
        })
    }, [gameSystems, triggerVFX, minigameController, achievementsSystem, storyRef, onInputRequest])

    return { processTags }
}
