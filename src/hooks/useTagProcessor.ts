import { useCallback } from 'react'
import { parseMinigameTag } from './useMinigameController'

interface TagProcessorOptions {
    storyRef: any;
    minigameController: any;
    achievementsSystem: any;
    gameSystems: any;
    triggerVFX: (tag: string) => void;
}

export function useTagProcessor({
    storyRef,
    minigameController,
    achievementsSystem,
    gameSystems,
    triggerVFX
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

            // Fall back to VFX
            if (!handled) {
                triggerVFX(tag)
            }
        })
    }, [gameSystems, triggerVFX, minigameController, achievementsSystem, storyRef])

    return { processTags }
}
