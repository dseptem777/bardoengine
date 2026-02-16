import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { useVFX } from './useVFX'
import { useAudio } from './useAudio'
import { useSaveSystem } from './useSaveSystem'
import { useGameSystems } from './useGameSystems'
import { useAchievements } from './useAchievements'
import { useMinigameController } from './useMinigameController'
import { useThemeManager } from './useThemeManager'
import { useTagProcessor } from './useTagProcessor'
import { useStoryState } from './useStoryState'
import { useWillpowerSystem } from './useWillpowerSystem'
import { useSpiderInfestation } from './useSpiderInfestation'
import { useScrollFriction } from './useScrollFriction'
import { useBossController } from './useBossController'
import { useVisualDamage } from './useVisualDamage'

interface BardoEngineOptions {
    storyId: string;
    storyData: any;
    settings: any;
    getTypewriterDelay: () => number;
    getMusicVolume: () => number;
    getSfxVolume: () => number;
}

export interface InputRequest {
    varName: string;
    placeholder: string;
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
    // Input System
    // ==================
    const [pendingInput, setPendingInput] = useState<InputRequest | null>(null)

    const handleInputRequest = useCallback((varName: string, placeholder: string) => {
        setPendingInput({ varName, placeholder })
    }, [])

    const commitInput = useCallback((value: string) => {
        if (!pendingInput) return

        setGlobalVariable(pendingInput.varName, value)
        setPendingInput(null)

        // Resume story after input
        if (continueStoryRef.current) {
            continueStoryRef.current()
        }
    }, [pendingInput, setGlobalVariable])

    // Scroll container ref (shared with Player for scroll manipulation)
    const scrollContainerRef = useRef<HTMLElement | null>(null)

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
    const achievementDefs = useMemo(() => gameSystems.config?.achievements || [], [gameSystems.config])
    const achievementsSystem = useAchievements(storyId, achievementDefs)

    // Extras config
    // @ts-ignore
    const extrasConfig = useMemo(() => gameSystems.config?.extras || {}, [gameSystems.config])
    const hasExtras = achievementDefs.length > 0 ||
        (extrasConfig.gallery?.length > 0) ||
        (extrasConfig.jukebox?.length > 0)

    // ==================
    // Theme Injection
    // ==================
    const isThemeReady = useThemeManager(gameSystems.config, storyId, gameSystems.configLoaded)

    // ==================
    // Minigame Controller
    // ==================

    // Ref to break circular dependency
    const continueStoryRef = useRef<(() => void) | null>(null)

    // Result commit handler
    const handleMinigameResult = useCallback((result: boolean | number) => {
        if (!storyRef.current) return

        const numericResult = (result === true || result === 1) ? 1 : 0
        console.log(`[Ink Bridge] Committing result: ${numericResult}`)

        setGlobalVariable("minigame_result", numericResult)
        const verified = getGlobalVariable("minigame_result")
        console.log(`[Ink Bridge] Verified value in Ink: ${verified}`)

        // Auto-continue after minigame
        if (continueStoryRef.current) {
            continueStoryRef.current()
        }
    }, [setGlobalVariable, getGlobalVariable])

    const minigameController = useMinigameController(handleMinigameResult)

    // ==================
    // Parallel Willpower System
    // ==================
    const onWillpowerCheckCallback = useCallback((passed: boolean) => {
        console.log(`[WillpowerSystem] Check result: ${passed}`)
    }, [])

    const [willpowerState, willpowerActions] = useWillpowerSystem(onWillpowerCheckCallback)

    const handleWillpowerStart = useCallback((config: { decayRate?: string, targetKey?: string, initialValue?: number }) => {
        willpowerActions.startWillpower({
            decayRate: config.decayRate || 'normal',
            targetKey: config.targetKey || 'V',
            value: config.initialValue ?? 100
        })
    }, [willpowerActions])

    const handleWillpowerStop = useCallback(() => {
        willpowerActions.stopWillpower()
    }, [willpowerActions])

    const handleWillpowerCheck = useCallback((threshold: number): boolean => {
        return willpowerActions.checkWillpower(threshold)
    }, [willpowerActions])

    const getWillpowerValue = useCallback((): number => {
        return willpowerState.value
    }, [willpowerState.value])

    // ==================
    // Spider Infestation System (Non-blocking)
    // ==================

    const spiderInfestation = useSpiderInfestation()

    const handleSpiderStart = useCallback((config: any) => {
        spiderInfestation.actions.startInfestation(config)
    }, [spiderInfestation.actions])

    const handleSpiderStop = useCallback(() => {
        spiderInfestation.actions.stopInfestation()
    }, [spiderInfestation.actions])

    const handleSpiderCheck = useCallback((threshold: number) => {
        const survived = spiderInfestation.actions.checkKills(threshold)
        // Set variable in Ink
        if (storyRef?.current) {
            try {
                storyRef.current.variablesState['spider_survived'] = survived
                console.log(`[Spider] Set spider_survived = ${survived}`)
            } catch (e) {
                console.warn('[Spider] Could not set spider_survived:', e)
            }
        }
        // Auto-select gate choice 0 after brief delay (Ink timing fix)
        setTimeout(() => {
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 2000)
    }, [spiderInfestation.actions])

    const handleSpiderDifficulty = useCallback((difficulty: string) => {
        spiderInfestation.actions.changeDifficulty(difficulty)
    }, [spiderInfestation.actions])

    // ==================
    // Scroll Friction System (Arrebatados)
    // ==================
    const [arrebatadosCount, setArrebatadosCount] = useState(0)
    const [arrebatadosEnabled, setArrebatadosEnabled] = useState(false)
    const [arrebatadosFuerza, setArrebatadosFuerza] = useState(10)

    const scrollFriction = useScrollFriction({
        scrollContainerRef,
        enabled: arrebatadosEnabled,
        arrebatadosCount,
        fuerza: arrebatadosFuerza,
    })

    const handleArrebatadosStart = useCallback((config: { count: number, fuerza: number }) => {
        setArrebatadosEnabled(true)
        setArrebatadosCount(config.count)
        setArrebatadosFuerza(config.fuerza)
    }, [])

    const handleArrebatadosAdd = useCallback((count: number) => {
        setArrebatadosCount(prev => prev + count)
    }, [])

    const handleArrebatadosStop = useCallback(() => {
        setArrebatadosEnabled(false)
        setArrebatadosCount(0)
    }, [])

    // ==================
    // Boss Controller System
    // ==================
    const bossController = useBossController()

    const handleBossStart = useCallback((config: { name: string; hp: number }) => {
        bossController.actions.startBoss(config)
    }, [bossController.actions])

    const handleBossPhase = useCallback((phase: number) => {
        bossController.actions.setPhase(phase)
    }, [bossController.actions])

    const handleBossDamage = useCallback((amount: number) => {
        bossController.actions.damage(amount)
    }, [bossController.actions])

    const handleBossCheck = useCallback((): boolean => {
        return bossController.actions.checkBoss()
    }, [bossController.actions])

    const handleBossStop = useCallback(() => {
        bossController.actions.stopBoss()
    }, [bossController.actions])

    // Boss phase completion — damages boss and auto-selects gate choice,
    // then flags for transition gate auto-advance
    const handleBossPhaseComplete = useCallback((damage: number) => {
        bossController.actions.damage(damage)
        // Check if boss is now defeated and set Ink variable BEFORE story continues
        // (Ink conditionals evaluate during continuation, before tags are processed)
        const defeated = bossController.actions.checkBoss()
        if (defeated) {
            setGlobalVariable('boss_defeated', true)
        }
        // Flag: after this gate choice, auto-advance the transition gate too
        bossTransitionPendingRef.current = true
        // Auto-select the current phase's gate choice [→]
        setTimeout(() => {
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 800)
    }, [bossController.actions, setGlobalVariable])

    // Boss phase 3 player death — auto-select gate choice to reach derrota
    const handleBossPlayerDeath = useCallback(() => {
        bossController.actions.playerDied()
        bossTransitionPendingRef.current = true
        setTimeout(() => {
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 1000)
    }, [bossController.actions])

    // Track whether we're waiting for a transition gate auto-advance
    const bossTransitionPendingRef = useRef(false)

    // Auto-select gate choices [→] that appear in transition knots AFTER a phase completes.
    // We set bossTransitionPendingRef=true in handleBossPhaseComplete/handleBossPlayerDeath,
    // then when the next gate choice appears, we auto-select it.
    useEffect(() => {
        if (!bossTransitionPendingRef.current) return
        if (choices.length !== 1) return
        const choiceText = choices[0]?.text?.trim()
        if (choiceText !== '→') return

        const timer = setTimeout(() => {
            bossTransitionPendingRef.current = false
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 1500) // pause to display transition text

        return () => clearTimeout(timer)
    }, [choices])

    // ==================
    // Visual Damage System (Persistent)
    // ==================
    const visualDamage = useVisualDamage(storyId)

    const visualDamageRef = useRef(visualDamage)
    visualDamageRef.current = visualDamage

    const handleVisualDamage = useCallback((config: { grayscale?: number, reset?: boolean }) => {
        if (config.reset) {
            visualDamageRef.current.resetDamage()
        } else {
            visualDamageRef.current.recordDeath()
        }
    }, [])

    // ==================
    // Tag Processing
    // ==================

    // Keep a stable ref of the story instance
    const storyRef = useRef<any>(null)
    storyRef.current = story

    const { processTags } = useTagProcessor({
        // @ts-ignore
        storyRef,
        minigameController,
        achievementsSystem,
        gameSystems,
        triggerVFX,
        onInputRequest: handleInputRequest,
        onWillpowerStart: handleWillpowerStart,
        onWillpowerStop: handleWillpowerStop,
        onWillpowerCheck: handleWillpowerCheck,
        getWillpowerValue,
        onSpiderStart: handleSpiderStart,
        onSpiderStop: handleSpiderStop,
        onSpiderCheck: handleSpiderCheck,
        onSpiderDifficulty: handleSpiderDifficulty,
        onArrebatadosStart: handleArrebatadosStart,
        onArrebatadosAdd: handleArrebatadosAdd,
        onArrebatadosStop: handleArrebatadosStop,
        onBossStart: handleBossStart,
        onBossPhase: handleBossPhase,
        onBossDamage: handleBossDamage,
        onBossCheck: handleBossCheck,
        onBossStop: handleBossStop,
        onVisualDamage: handleVisualDamage,
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

    // Keep refs updated
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
        if (typeof index !== 'number' || isNaN(index)) {
            console.error("[BardoEngine] Invalid choice index:", index)
            return
        }



        clearVFX()

        // Hubs: Check exclusions
        if (story) {
            try {
                const choice = story.currentChoices[index]
                if (choice) {
                    const currentPath = story.state.currentPathString || ""
                    const currentKnot = currentPath.split('.')[0]

                    const targetPath = choice.pathStringOnChoice || ""
                    const targetKnot = targetPath.split('.')[0]

                    // @ts-ignore
                    gameSystems.hubs.handleChoice(currentKnot, targetKnot)
                }
            } catch (e) {
                console.warn("[BardoEngine] Error processing hub choice:", e)
            }
        }

        // makeChoiceState updates history internally
        const { text: newText, tags } = makeChoiceState(index)

        processTags(tags)

        if (storyId && newText) {
            // @ts-ignore
            saveSystem.autoSave(story.state.toJson(), newText, gameSystems.exportGameSystems() || undefined)
        }
    }, [clearVFX, makeChoiceState, processTags, storyId, saveSystem, story, gameSystems])

    // Keep makeChoice ref updated for spider phase auto-select
    const makeChoiceRef = useRef<any>(null)
    makeChoiceRef.current = makeChoice

    const restart = useCallback(() => {
        if (storyData && storyId) {
            clearVFX()
            stopMusic(false)
            gameSystems.resetGameSystems()
            willpowerActions.stopWillpower()
            spiderInfestation.actions.stopInfestation()
            handleArrebatadosStop()
            bossController.actions.stopBoss()
            resetStoryState()
            initStory(storyData)
        }
    }, [storyData, storyId, clearVFX, stopMusic, gameSystems, willpowerActions, spiderInfestation.actions, handleArrebatadosStop, bossController.actions, resetStoryState, initStory])

    const backToStart = useCallback(() => {
        resetStoryState()
        clearVFX()
        stopMusic()
        gameSystems.resetGameSystems()
        willpowerActions.stopWillpower()
        spiderInfestation.actions.stopInfestation()
        handleArrebatadosStop()
        bossController.actions.stopBoss()
    }, [resetStoryState, clearVFX, stopMusic, gameSystems, willpowerActions, spiderInfestation.actions, handleArrebatadosStop, bossController.actions])

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
        // Input
        commitInput,
    }), [
        initStory, continueStory, makeChoice, restart, backToStart, finishGame,
        newGame, continueGame, loadSave, manualSave, handleMinigameStart, commitInput
    ])

    const subsystems = useMemo(() => ({
        audio: { playSfx, playMusic, stopMusic, stopAllAudio },
        vfx: { vfxState, triggerVFX, clearVFX },
        saveSystem,
        gameSystems,
        achievementsSystem,
        minigameController,
        input: { pendingInput, commitInput },
        willpower: {
            state: willpowerState,
            actions: willpowerActions,
            updateValue: willpowerActions.updateValue
        },
        spiderInfestation,
        scrollFriction,
        bossController: {
            state: bossController.state,
            actions: bossController.actions,
            handleBossPhaseComplete,
            handleBossPlayerDeath,
        },
        visualDamage,
        scrollContainerRef,
    }), [
        playSfx, playMusic, stopMusic, stopAllAudio,
        vfxState, triggerVFX, clearVFX,
        saveSystem, gameSystems, achievementsSystem, minigameController, pendingInput, commitInput,
        willpowerState, willpowerActions,
        spiderInfestation,
        scrollFriction, bossController.state, bossController.actions, handleBossPhaseComplete, handleBossPlayerDeath, visualDamage
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
