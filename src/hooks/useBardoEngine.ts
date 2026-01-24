import { useState, useCallback, useEffect, useRef } from 'react'
import { Story } from 'inkjs'
import { useVFX } from './useVFX'
import { useAudio } from './useAudio'
import { useSaveSystem } from './useSaveSystem'
import { useGameSystems } from './useGameSystems'
import { useAchievements } from './useAchievements'
import { useMinigameController } from './useMinigameController'
import { useThemeManager } from './useThemeManager'
import { useTagProcessor } from './useTagProcessor'

interface BardoEngineOptions {
    storyId: string;
    storyData: any;
    settings: any;
    getTypewriterDelay: () => number;
    getMusicVolume: () => number;
    getSfxVolume: () => number;
}

/**
 * useBardoEngine - Central orchestrator hook for the BardoEngine
 * 
 * Consolidates all story logic, state management, and subsystem coordination.
 */
export function useBardoEngine({
    storyId,
    storyData,
    settings,
    getTypewriterDelay,
    getMusicVolume,
    getSfxVolume
}: BardoEngineOptions) {
    // ==================
    // Core Story State
    // ==================
    const [story, setStory] = useState<Story | null>(null)
    const [text, setText] = useState('')
    const [choices, setChoices] = useState<any[]>([])
    const [canContinue, setCanContinue] = useState(false)
    const [isEnded, setIsEnded] = useState(false)
    const [history, setHistory] = useState<any[]>([]) // Bitácora narrativa

    // Refs for callbacks (avoid stale closures)
    const storyRef = useRef<Story | null>(null)
    const continueStoryRef = useRef<(() => void) | null>(null)

    // ==================
    // Sub-systems
    // ==================

    // Audio system
    const audio = useAudio({
        sfxVolume: getSfxVolume(),
        musicVolume: getMusicVolume(),
    })
    const { playSfx, playMusic, stopMusic, stopAll: stopAllAudio } = audio

    // VFX system
    const vfx = useVFX(
        { playSfx, playMusic, stopMusic },
        settings.vfxEnabled
    )
    const { vfxState, triggerVFX, clearVFX } = vfx

    // Save system
    const saveSystem = useSaveSystem(storyId)

    // Game systems (stats + inventory)
    const gameSystems = useGameSystems(storyId)

    // Achievements system
    // @ts-ignore
    const achievementDefs = gameSystems.config?.achievements || []
    const achievementsSystem = useAchievements(storyId, achievementDefs)

    // Extras config
    // @ts-ignore
    const extrasConfig = gameSystems.config?.extras || {}
    const hasExtras = achievementDefs.length > 0 ||
        (extrasConfig.gallery?.length > 0) ||
        (extrasConfig.jukebox?.length > 0)

    // ==================
    // Theme Injection (Dynamic CSS Variables)
    // ==================
    const isThemeReady = useThemeManager(gameSystems.config, storyId)

    // ==================
    // Minigame Controller
    // ==================

    // Result commit handler
    const handleMinigameResult = useCallback((result: boolean | number) => {
        const currentStory = storyRef.current
        if (!currentStory) return

        const numericResult = (result === true || result === 1) ? 1 : 0
        console.log(`[Ink Bridge] Committing result: ${numericResult}`)
        currentStory.variablesState["minigame_result"] = numericResult

        const verified = currentStory.variablesState["minigame_result"]
        console.log(`[Ink Bridge] Verified value in Ink: ${verified}`)

        if (continueStoryRef.current) {
            continueStoryRef.current()
        }
    }, [])

    const minigameController = useMinigameController(handleMinigameResult)

    // ==================
    // Tag Processing
    // ==================

    const { processTags } = useTagProcessor({
        storyRef,
        minigameController,
        achievementsSystem,
        gameSystems,
        triggerVFX
    })

    // ==================
    // Story Continuation
    // ==================

    const continueStory = useCallback(() => {
        const currentStory = storyRef.current
        if (!currentStory || minigameController.isPlaying) return

        let fullText = ''
        let allTags: string[] = []

        while (currentStory.canContinue) {
            const nextBatch = currentStory.Continue()
            const tags = currentStory.currentTags

            fullText += nextBatch + '\n\n'
            // @ts-ignore
            allTags = [...allTags, ...(tags || [])]

            // Break for pagination
            // @ts-ignore
            if ((tags || []).some(t => {
                const tag = t.trim().toLowerCase()
                return tag === 'next' || tag === 'page'
            })) break

            // Break for minigame
            // @ts-ignore
            if ((tags || []).some(t => t.trim().toLowerCase().startsWith('minigame:'))) break
        }

        const trimmedText = fullText.trim()
        setText(trimmedText)
        setChoices(currentStory.currentChoices)
        setCanContinue(currentStory.canContinue)
        setIsEnded(!currentStory.canContinue && currentStory.currentChoices.length === 0)

        // Add to history (Bitácora)
        if (trimmedText) {
            setHistory(prev => [...prev, {
                text: trimmedText,
                timestamp: Date.now(),
                tags: allTags
            }])
        }

        processTags(allTags)

        if (storyId) {
            // @ts-ignore
            saveSystem.autoSave(currentStory.state.toJson(), trimmedText, gameSystems.exportGameSystems() || undefined)
        }
    }, [storyId, processTags, saveSystem, gameSystems, minigameController.isPlaying])

    // Keep ref updated for callbacks
    continueStoryRef.current = continueStory

    // ==================
    // Story Initialization
    // ==================

    const initStory = useCallback((data: any, savedState: any = null, savedText: string = '', savedGameSystems: any = null) => {
        const newStory = new Story(data)

        if (savedState) {
            newStory.state.LoadJson(savedState)
        }

        // Set New Game+ flag
        try {
            newStory.variablesState["new_game_plus"] = achievementsSystem.hasCompletedGame
            console.log('[NG+] Set new_game_plus =', achievementsSystem.hasCompletedGame)
        } catch (e) {
            console.log('[NG+] Story does not have new_game_plus variable')
        }

        setStory(newStory)
        storyRef.current = newStory
        setHistory([]) // Clear history on new game

        // Load saved game systems
        if (savedGameSystems) {
            gameSystems.loadGameSystems(savedGameSystems)
        }

        // Restore saved text or start fresh
        if (savedText) {
            setText(savedText)
            setChoices(newStory.currentChoices)
            setCanContinue(newStory.canContinue)
            setIsEnded(!newStory.canContinue && newStory.currentChoices.length === 0)
            // Add restored text to history
            setHistory([{ text: savedText, timestamp: Date.now(), tags: [] }])
        } else {
            setIsEnded(false)
        }
    }, [gameSystems, achievementsSystem.hasCompletedGame])

    // Auto-continue on story init (when no saved text)
    useEffect(() => {
        if (story && !text) {
            if (!story.canContinue && story.currentChoices.length > 0) {
                setChoices(story.currentChoices)
                setCanContinue(false)
                setIsEnded(false)
                return
            }

            let fullText = ''
            let allTags: string[] = []

            while (story.canContinue) {
                const nextBatch = story.Continue()
                fullText += nextBatch
                // @ts-ignore
                allTags = [...allTags, ...(story.currentTags || [])]

                // @ts-ignore
                if ((story.currentTags || []).some(t =>
                    t.trim().toLowerCase() === 'next' ||
                    t.trim().toLowerCase() === 'page'
                )) {
                    break
                }
            }

            const trimmedText = fullText.trim()
            setText(trimmedText)
            setChoices(story.currentChoices)
            setCanContinue(story.canContinue)
            setIsEnded(!story.canContinue && story.currentChoices.length === 0)

            // Add to history
            if (trimmedText) {
                setHistory([{ text: trimmedText, timestamp: Date.now(), tags: allTags }])
            }

            processTags(allTags)

            if (storyId) {
                // @ts-ignore
                saveSystem.autoSave(story.state.toJson(), trimmedText, gameSystems.exportGameSystems() || undefined)
            }
        }
    }, [story, text, storyId, processTags, saveSystem, gameSystems])

    // ==================
    // Actions
    // ==================

    const makeChoice = useCallback((index: number) => {
        const currentStory = storyRef.current
        if (!currentStory) return

        // Get the text of the choice before making it
        const choice = currentStory.currentChoices[index]
        const choiceText = choice ? choice.text : ''

        clearVFX()
        currentStory.ChooseChoiceIndex(index)

        // Add choice to history (Bitácora)
        if (choiceText) {
            setHistory(prev => [...prev, {
                text: `> ${choiceText}`,
                timestamp: Date.now(),
                type: 'choice'
            }])
        }

        continueStory()
    }, [continueStory, clearVFX])

    const restart = useCallback(() => {
        if (storyData && storyId) {
            clearVFX()
            stopMusic(false)
            gameSystems.resetGameSystems()
            setText('')
            setChoices([])
            setIsEnded(false)
            setHistory([])
            initStory(storyData)
        }
    }, [storyData, storyId, clearVFX, stopMusic, gameSystems, initStory])

    const backToStart = useCallback(() => {
        setStory(null)
        setText('')
        setChoices([])
        setHistory([])
        clearVFX()
        stopMusic()
        gameSystems.resetGameSystems()
    }, [clearVFX, stopMusic, gameSystems])

    const finishGame = useCallback(() => {
        achievementsSystem.markGameComplete()
        backToStart()
    }, [backToStart, achievementsSystem])

    // Minigame handlers
    const handleMinigameStart = useCallback(() => {
        const currentStory = storyRef.current
        if (currentStory) {
            currentStory.variablesState["minigame_result"] = -1
        }
        minigameController.startGame()
    }, [minigameController])

    // ==================
    // Save/Load Actions
    // ==================

    const newGame = useCallback(() => {
        if (storyData) {
            gameSystems.resetGameSystems()
            initStory(storyData)
        }
    }, [storyData, initStory, gameSystems])

    const continueGame = useCallback(() => {
        if (!saveSystem.hasContinue) return null
        const saveData = saveSystem.loadLastSave()
        if (saveData && storyData) {
            initStory(storyData, saveData.state, saveData.text, saveData.gameSystems)
            return saveData
        }
        return null
    }, [saveSystem, storyData, initStory])

    const loadSave = useCallback((saveId: string) => {
        const saveData = saveSystem.loadSave(saveId)
        if (saveData && storyData) {
            initStory(storyData, saveData.state, saveData.text, saveData.gameSystems)
            return saveData
        }
        return null
    }, [saveSystem, storyData, initStory])

    const manualSave = useCallback((name: string, overwriteId: string | null = null) => {
        if (!story || !storyId) return
        // @ts-ignore
        saveSystem.saveGame(name, story.state.toJson(), text, gameSystems.exportGameSystems() || undefined, overwriteId)
    }, [story, storyId, text, saveSystem, gameSystems])

    // ==================
    // Return API
    // ==================

    return {
        // Core state
        story,
        text,
        choices,
        canContinue,
        isEnded,
        history,
        isThemeReady,

        // Actions
        actions: {
            initStory,
            continueStory,
            makeChoice,
            restart,
            backToStart,
            finishGame,
            // Save/Load
            newGame,
            continueGame,
            loadSave,
            manualSave,
            // Minigame
            handleMinigameStart,
        },

        // Sub-systems (exposed for components that need them)
        subsystems: {
            audio: { playSfx, playMusic, stopMusic, stopAllAudio },
            vfx: { vfxState, triggerVFX, clearVFX },
            saveSystem,
            gameSystems,
            achievementsSystem,
            minigameController,
        },

        // Config/derived
        config: {
            extrasConfig,
            hasExtras,
            achievementDefs,
        },

        // Settings passthrough
        settingsHelpers: {
            getTypewriterDelay,
            getMusicVolume,
            getSfxVolume,
        }
    }
}
