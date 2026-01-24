import { useCallback, useEffect, useRef, useMemo } from 'react'
import { useVFX } from './useVFX'
import { useAudio } from './useAudio'
import { useSaveSystem } from './useSaveSystem'
import { useGameSystems } from './useGameSystems'
import { useAchievements } from './useAchievements'
import { useMinigameController } from './useMinigameController'
import { useThemeManager } from './useThemeManager'
import { useTagProcessor } from './useTagProcessor'
import { useStoryState } from './useStoryState'

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
 * Refactored to delegate state management to useStoryState.
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
    // Story State Delegate
    // ==================
    const storyState = useStoryState()
    const {
        story,
        text,
        choices,
        canContinue,
        isEnded,
        history,
        initStory: initStoryState,
        continueStory: continueStoryState,
        makeChoice: makeChoiceState,
        setGlobalVariable,
        getGlobalVariable,
        resetStoryState
    } = storyState

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
    // Theme Injection
    // ==================
    const isThemeReady = useThemeManager(gameSystems.config, storyId)

    // ==================
    // Minigame Controller
    // ==================

    // Ref to break circular dependency
    const continueStoryRef = useRef<(() => void) | null>(null)

    // Result commit handler
    const handleMinigameResult = useCallback((result: boolean | number) => {
        if (!story) return

        const numericResult = (result === true || result === 1) ? 1 : 0
        console.log(`[Ink Bridge] Committing result: ${numericResult}`)

        setGlobalVariable("minigame_result", numericResult)
        const verified = getGlobalVariable("minigame_result")
        console.log(`[Ink Bridge] Verified value in Ink: ${verified}`)

        // Auto-continue after minigame
        if (continueStoryRef.current) {
            continueStoryRef.current()
        }
    }, [story, setGlobalVariable, getGlobalVariable])

    const minigameController = useMinigameController(handleMinigameResult)

    // ==================
    // Tag Processing
    // ==================

    const { processTags } = useTagProcessor({
        // @ts-ignore
        storyRef: { current: story }, // Adapter since tagProcessor expects a ref, but we have the instance
        minigameController,
        achievementsSystem,
        gameSystems,
        triggerVFX
    })

    // ==================
    // Story Continuation Wrapper
    // ==================

    // Wrapped continue function that coordinates systems
    const continueStory = useCallback(() => {
        if (!story || minigameController.isPlaying) return

        const { text: newText, tags } = continueStoryState()

        processTags(tags)

        if (storyId && newText) {
            // @ts-ignore
            saveSystem.autoSave(story.state.toJson(), newText, gameSystems.exportGameSystems() || undefined)
        }
    }, [story, minigameController.isPlaying, continueStoryState, processTags, storyId, saveSystem, gameSystems])

    // Keep ref updated
    continueStoryRef.current = continueStory

    // ==================
    // Story Initialization Wrapper
    // ==================

    const initStory = useCallback((data: any, savedState: any = null, savedText: string = '', savedGameSystems: any = null) => {
        initStoryState(data, savedState, savedText)

        // Set New Game+ flag
        try {
            setGlobalVariable("new_game_plus", achievementsSystem.hasCompletedGame)
            console.log('[NG+] Set new_game_plus =', achievementsSystem.hasCompletedGame)
        } catch (e) {
            console.log('[NG+] Error setting new_game_plus')
        }

        // Load saved game systems
        if (savedGameSystems) {
            gameSystems.loadGameSystems(savedGameSystems)
        }
    }, [initStoryState, setGlobalVariable, achievementsSystem.hasCompletedGame, gameSystems])

    // Auto-continue on story init (when no saved text)
    useEffect(() => {
        if (story && !text) {
            // If already ended (e.g. short story or error), don't continue
            if (isEnded) return

            // If we have choices but no text (rare), don't auto continue
            if (!canContinue && choices.length > 0) return

            continueStory()
        }
    }, [story, text, isEnded, canContinue, choices.length, continueStory])

    // ==================
    // Actions
    // ==================

    const makeChoice = useCallback((index: number) => {
        clearVFX()

        // makeChoiceState updates history internally
        const { text: newText, tags } = makeChoiceState(index)

        processTags(tags)

        if (storyId && newText) {
            // @ts-ignore
            saveSystem.autoSave(story.state.toJson(), newText, gameSystems.exportGameSystems() || undefined)
        }
    }, [clearVFX, makeChoiceState, processTags, storyId, saveSystem, story, gameSystems])

    const restart = useCallback(() => {
        if (storyData && storyId) {
            clearVFX()
            stopMusic(false)
            gameSystems.resetGameSystems()
            resetStoryState()
            initStory(storyData)
        }
    }, [storyData, storyId, clearVFX, stopMusic, gameSystems, resetStoryState, initStory])

    const backToStart = useCallback(() => {
        resetStoryState()
        clearVFX()
        stopMusic()
        gameSystems.resetGameSystems()
    }, [resetStoryState, clearVFX, stopMusic, gameSystems])

    const finishGame = useCallback(() => {
        achievementsSystem.markGameComplete()
        backToStart()
    }, [backToStart, achievementsSystem])

    // Minigame handlers
    const handleMinigameStart = useCallback(() => {
        setGlobalVariable("minigame_result", -1)
        minigameController.startGame()
    }, [minigameController, setGlobalVariable])

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

    const actions = useMemo(() => ({
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
    }), [
        initStory, continueStory, makeChoice, restart, backToStart, finishGame,
        newGame, continueGame, loadSave, manualSave, handleMinigameStart
    ])

    const subsystems = useMemo(() => ({
        audio: { playSfx, playMusic, stopMusic, stopAllAudio },
        vfx: { vfxState, triggerVFX, clearVFX },
        saveSystem,
        gameSystems,
        achievementsSystem,
        minigameController,
    }), [
        playSfx, playMusic, stopMusic, stopAllAudio,
        vfxState, triggerVFX, clearVFX,
        saveSystem, gameSystems, achievementsSystem, minigameController
    ])

    const configRef = useMemo(() => ({
        extrasConfig,
        hasExtras,
        achievementDefs,
    }), [extrasConfig, hasExtras, achievementDefs])

    const settingsHelpers = useMemo(() => ({
        getTypewriterDelay,
        getMusicVolume,
        getSfxVolume,
    }), [getTypewriterDelay, getMusicVolume, getSfxVolume])

    return useMemo(() => ({
        // Core state
        story,
        text,
        choices,
        canContinue,
        isEnded,
        history,
        isThemeReady,

        actions,
        subsystems,
        config: configRef,
        settingsHelpers
    }), [
        story, text, choices, canContinue, isEnded, history, isThemeReady,
        actions, subsystems, configRef, settingsHelpers
    ])
}
