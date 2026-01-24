import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Story } from 'inkjs'
import { useVFX } from './useVFX'
import { useAudio } from './useAudio'
import { useSaveSystem } from './useSaveSystem'
import { useGameSystems } from './useGameSystems'
import { useAchievements } from './useAchievements'
import { useMinigameController, parseMinigameTag } from './useMinigameController'

/**
 * useBardoEngine - Central orchestrator hook for the BardoEngine
 * 
 * Consolidates all story logic, state management, and subsystem coordination
 * that was previously scattered across App.jsx (~600 lines → this hook).
 * 
 * @param {Object} options
 * @param {string} options.storyId - Current story identifier
 * @param {Object} options.storyData - Story JSON data (from inkjs compile)
 * @param {Object} options.settings - User settings from useSettings
 * @param {Function} options.getTypewriterDelay - Function to get typewriter delay
 * @param {Function} options.getMusicVolume - Function to get music volume
 * @param {Function} options.getSfxVolume - Function to get SFX volume
 */
export function useBardoEngine({
    storyId,
    storyData,
    settings,
    getTypewriterDelay,
    getMusicVolume,
    getSfxVolume
}) {
    // ==================
    // Core Story State
    // ==================
    const [story, setStory] = useState(null)
    const [text, setText] = useState('')
    const [choices, setChoices] = useState([])
    const [canContinue, setCanContinue] = useState(false)
    const [isEnded, setIsEnded] = useState(false)
    const [history, setHistory] = useState([]) // Bitácora narrativa

    // Refs for callbacks (avoid stale closures)
    const storyRef = useRef(null)
    const continueStoryRef = useRef(null)

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
    const achievementDefs = gameSystems.config?.achievements || []
    const achievementsSystem = useAchievements(storyId, achievementDefs)

    // Extras config
    const extrasConfig = gameSystems.config?.extras || {}
    const hasExtras = achievementDefs.length > 0 ||
        (extrasConfig.gallery?.length > 0) ||
        (extrasConfig.jukebox?.length > 0)

    // ==================
    // Theme Injection (Dynamic CSS Variables)
    // ==================
    const [isThemeReady, setIsThemeReady] = useState(false)

    useEffect(() => {
        const root = document.documentElement

        // Helper to clear all possible Bardo-related CSS variables
        const clearTheme = () => {
            const vars = [
                '--bardo-accent', '--bardo-bg', '--bardo-text', '--bardo-muted',
                '--bardo-font-main', '--bardo-font-header', '--bardo-font-mono',
                '--stats-top', '--stats-left', '--inventory-top', '--inventory-right',
                '--player-max-width', '--player-text-align',
                '--ui-border-radius', '--ui-border-width'
            ]
            vars.forEach(v => root.style.removeProperty(v))
        }

        // IMMEDIATE: Block UI before ANY changes to prevent flash
        setIsThemeReady(false)

        // 1. If we are entering a story but config is NOT LOADED yet, stay blocked
        if (storyId && !gameSystems.configLoaded) {
            return
        }

        const theme = gameSystems.config?.theme

        // 2. Clear previous theme
        clearTheme()

        if (!theme) {
            // No theme config: set defaults and wait a bit for browser to catch up
            const timer = setTimeout(() => setIsThemeReady(true), 200)
            return () => {
                clearTimeout(timer)
                setIsThemeReady(false)
            }
        }

        // 3. Apply New Theme settings
        if (theme.primaryColor) root.style.setProperty('--bardo-accent', theme.primaryColor)
        if (theme.bgColor) root.style.setProperty('--bardo-bg', theme.bgColor)
        if (theme.textColor) root.style.setProperty('--bardo-text', theme.textColor)

        if (theme.typography) {
            const { mainFont, headerFont, googleFonts } = theme.typography
            if (mainFont) root.style.setProperty('--bardo-font-main', mainFont)
            if (headerFont) root.style.setProperty('--bardo-font-header', headerFont)

            if (googleFonts && Array.isArray(googleFonts) && googleFonts.length > 0) {
                const fontId = 'bardo-dynamic-fonts'
                let link = document.getElementById(fontId)
                if (!link) {
                    link = document.createElement('link')
                    link.id = fontId
                    link.rel = 'stylesheet'
                    document.head.appendChild(link)
                }
                const families = googleFonts.map(f => f.replace(/ /g, '+')).join('&family=')
                link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`
            }
        }

        if (theme.layout) {
            const { statsPosition, inventoryPosition, playerMaxWidth, textAlignment } = theme.layout
            if (statsPosition) {
                if (statsPosition.top) root.style.setProperty('--stats-top', `${statsPosition.top}rem`)
                if (statsPosition.left) root.style.setProperty('--stats-left', `${statsPosition.left}rem`)
            }
            if (inventoryPosition) {
                if (inventoryPosition.top) root.style.setProperty('--inventory-top', `${inventoryPosition.top}rem`)
                if (inventoryPosition.right) root.style.setProperty('--inventory-right', `${inventoryPosition.right}rem`)
            }
            if (playerMaxWidth) root.style.setProperty('--player-max-width', playerMaxWidth)
            if (textAlignment) root.style.setProperty('--player-text-align', textAlignment)
        }

        if (theme.uiStyle) {
            const { borderRadius, borderWidth } = theme.uiStyle
            if (borderRadius) root.style.setProperty('--ui-border-radius', borderRadius)
            if (borderWidth) root.style.setProperty('--ui-border-width', borderWidth)
        }

        console.log('[Theme] Theme applied successfully')

        // 4. Mandatory buffer to ensure all variables have propagated before showing UI
        const timer = setTimeout(() => setIsThemeReady(true), 250)

        return () => {
            clearTimeout(timer)
            setIsThemeReady(false)
            clearTheme()
        }
    }, [gameSystems.config, gameSystems.configLoaded, storyId])

    // ==================
    // Minigame Controller
    // ==================

    // Result commit handler
    const handleMinigameResult = useCallback((result) => {
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

    const processTags = useCallback((tags) => {
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
    }, [gameSystems, triggerVFX, minigameController, achievementsSystem])

    // ==================
    // Story Continuation
    // ==================

    const continueStory = useCallback(() => {
        const currentStory = storyRef.current
        if (!currentStory || minigameController.isPlaying) return

        const textParts = []
        const allTags = []

        while (currentStory.canContinue) {
            const nextBatch = currentStory.Continue()
            const tags = currentStory.currentTags

            textParts.push(nextBatch)
            allTags.push(...tags)

            // Break for pagination
            if (tags.some(t => {
                const tag = t.trim().toLowerCase()
                return tag === 'next' || tag === 'page'
            })) break

            // Break for minigame
            if (tags.some(t => t.trim().toLowerCase().startsWith('minigame:'))) break
        }

        const fullText = textParts.join('\n\n')
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
            saveSystem.autoSave(currentStory.state.toJson(), trimmedText, gameSystems.exportGameSystems())
        }
    }, [storyId, processTags, saveSystem, gameSystems, minigameController.isPlaying])

    // Keep ref updated for callbacks
    continueStoryRef.current = continueStory

    // ==================
    // Story Initialization
    // ==================

    const initStory = useCallback((data, savedState = null, savedText = '', savedGameSystems = null) => {
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

            const textParts = []
            const allTags = []

            while (story.canContinue) {
                const nextBatch = story.Continue()
                textParts.push(nextBatch)
                allTags.push(...story.currentTags)

                if (story.currentTags.some(t =>
                    t.trim().toLowerCase() === 'next' ||
                    t.trim().toLowerCase() === 'page'
                )) {
                    break
                }
            }

            const fullText = textParts.join('')
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
                saveSystem.autoSave(story.state.toJson(), trimmedText, gameSystems.exportGameSystems())
            }
        }
    }, [story, text, storyId, processTags, saveSystem, gameSystems])

    // ==================
    // Actions
    // ==================

    const makeChoice = useCallback((index) => {
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

    const loadSave = useCallback((saveId) => {
        const saveData = saveSystem.loadSave(saveId)
        if (saveData && storyData) {
            initStory(storyData, saveData.state, saveData.text, saveData.gameSystems)
            return saveData
        }
        return null
    }, [saveSystem, storyData, initStory])

    const manualSave = useCallback((name, overwriteId = null) => {
        if (!story || !storyId) return
        saveSystem.saveGame(name, story.state.toJson(), text, gameSystems.exportGameSystems(), overwriteId)
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
        initStory,
        continueStory,
        makeChoice,
        restart,
        backToStart,
        finishGame,
        newGame,
        continueGame,
        loadSave,
        manualSave,
        handleMinigameStart
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
        saveSystem,
        gameSystems,
        achievementsSystem,
        minigameController
    ])

    const config = useMemo(() => ({
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
        config,
        settingsHelpers
    }), [
        story,
        text,
        choices,
        canContinue,
        isEnded,
        history,
        isThemeReady,
        actions,
        subsystems,
        config,
        settingsHelpers
    ])
}
