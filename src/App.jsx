import { useState, useCallback, useEffect, useRef } from 'react'
import { Story } from 'inkjs'
import Player from './components/Player'
import StorySelector from './components/StorySelector'
import StartScreen from './components/StartScreen'
import IntroSequence from './components/IntroSequence'
import SaveLoadModal from './components/SaveLoadModal'
import OptionsModal from './components/OptionsModal'
import VFXLayer from './components/VFXLayer'
import StatsPanel from './components/StatsPanel'
import InventoryPanel from './components/InventoryPanel'
import { useVFX } from './hooks/useVFX'
import { useAudio } from './hooks/useAudio'
import { useSaveSystem } from './hooks/useSaveSystem'
import { useGameSystems } from './hooks/useGameSystems'
import { useStoryLoader } from './hooks/useStoryLoader'
import { useMinigameController, parseMinigameTag } from './hooks/useMinigameController'
import { SettingsProvider, useSettings } from './hooks/useSettings'
import MinigameOverlay from './components/MinigameOverlay'

// Import the compiled stories (used in development mode)
import partuzaStory from './stories/partuza.json'
import serruchinStory from './stories/serruchin.json'
import centinelasStory from './stories/centinelas.json'
import toyboxStory from './stories/toybox.json'
import apneaStory from './stories/apnea.json'

// Dev mode stories
const DEV_STORIES = {
    serruchin: serruchinStory,
    partuza: partuzaStory,
    centinelas: centinelasStory,
    toybox: toyboxStory,
    apnea: apneaStory
}

// Format for story selector
const AVAILABLE_STORIES = [
    { id: 'centinelas', title: '🛡️ CENTINELAS DEL SUR', data: centinelasStory },
    { id: 'toybox', title: '📦 BARDO TOYBOX (Minigames)', data: toyboxStory },
    { id: 'apnea', title: '🫁 APNEA', data: apneaStory },
    { id: 'serruchin', title: '🪚 SERRUCHÍN', data: serruchinStory },
    { id: 'partuza', title: 'Tu nombre en clave es Partuza', data: partuzaStory }
]

// Inner App component that uses settings context
function AppContent({ onStorySelect }) {
    // Settings
    const { settings, getTypewriterDelay, getMusicVolume, getSfxVolume } = useSettings()

    // Game state
    const [story, setStory] = useState(null)
    const [storyId, setStoryId] = useState(null)
    const [storyData, setStoryData] = useState(null)
    const [text, setText] = useState('')
    const [choices, setChoices] = useState([])
    const [canContinue, setCanContinue] = useState(false)
    const [isEnded, setIsEnded] = useState(false)

    // Screen state
    const [selectedStory, setSelectedStory] = useState(null) // Story selected but not started (dev mode)
    const [introComplete, setIntroComplete] = useState(false) // Track if intro sequence has been shown
    const [saveModalMode, setSaveModalMode] = useState(null) // 'save' | 'load' | null
    const [optionsOpen, setOptionsOpen] = useState(false)
    const storyRef = useRef(null)

    // Hooks with settings integration
    const { playSfx, playMusic, stopMusic, stopAll: stopAllAudio } = useAudio({
        sfxVolume: getSfxVolume(),
        musicVolume: getMusicVolume(),
    })
    const { vfxState, triggerVFX, clearVFX } = useVFX(
        { playSfx, playMusic, stopMusic },
        settings.vfxEnabled
    )

    // Story loader with environment detection
    const { stories, isLoading: storyLoading, error: storyError, isProductionMode } = useStoryLoader({
        devStories: DEV_STORIES
    })

    // Get current story ID for save system
    const currentStoryId = isProductionMode && stories.length > 0
        ? stories[0].id
        : (storyId || selectedStory?.id)

    // Save system (needs storyId)
    const saveSystem = useSaveSystem(currentStoryId)

    // Game systems (stats + inventory)
    const gameSystems = useGameSystems(currentStoryId)

    // Get game title for start screen
    const getGameTitle = () => {
        if (isProductionMode && stories.length > 0) return stories[0].title
        if (selectedStory) return selectedStory.title
        return 'BardoEngine'
    }

    // Get current story data (for starting games)
    const getCurrentStoryData = () => {
        if (isProductionMode && stories.length > 0) return stories[0]
        return selectedStory
    }

    // Get intro config for current game
    const getIntroConfig = () => {
        return gameSystems.config?.intro || {}
    }

    // Initialize story
    const initStory = useCallback((data, id, savedState = null, savedText = '', savedGameSystems = null) => {
        const newStory = new Story(data)

        if (savedState) {
            newStory.state.LoadJson(savedState)
        }

        setStory(newStory)
        storyRef.current = newStory
        setStoryId(id)
        setStoryData(data)

        // Load saved game systems (stats/inventory)
        if (savedGameSystems) {
            gameSystems.loadGameSystems(savedGameSystems)
        }

        // If we have saved text, restore it along with choices
        if (savedText) {
            setText(savedText)
            setChoices(newStory.currentChoices)
            setCanContinue(newStory.canContinue)
            setIsEnded(!newStory.canContinue && newStory.currentChoices.length === 0)
        } else {
            setIsEnded(false)
        }
    }, [gameSystems])

    // Ref to hold continueStory for callbacks (avoids stale closure)
    const continueStoryRef = useRef(null)

    // Minigame result commit handler (passed to controller)
    const handleMinigameResult = useCallback((result) => {
        const currentStory = storyRef.current
        if (!currentStory) return

        // Force numeric result
        const numericResult = (result === true || result === 1) ? 1 : 0

        console.log(`[Ink Bridge] Committing result: ${numericResult}`)
        currentStory.variablesState["minigame_result"] = numericResult

        // Verify the write was successful
        const verified = currentStory.variablesState["minigame_result"]
        console.log(`[Ink Bridge] Verified value in Ink: ${verified}`)

        // Continue story immediately (synchronous, no setTimeout)
        if (continueStoryRef.current) {
            continueStoryRef.current()
        }
    }, [])

    // Initialize minigame controller
    const minigameController = useMinigameController(handleMinigameResult)

    // Process tags (VFX + Game Systems + Minigames)
    const processTags = useCallback((tags) => {
        tags.forEach(rawTag => {
            const tag = rawTag.trim()
            if (!tag) return

            // Check for minigame tag first (pass storyRef for variable resolution)
            const minigameConfig = parseMinigameTag(tag, storyRef)
            if (minigameConfig) {
                console.log('[Tags] Minigame detected:', minigameConfig)
                minigameController.queueGame(minigameConfig)
                return
            }

            // Try game systems
            const handled = gameSystems.processGameTag(tag)

            // Fall back to VFX
            if (!handled) {
                triggerVFX(tag)
            }
        })
    }, [gameSystems, triggerVFX, minigameController])

    // Continue story
    const continueStory = useCallback(() => {
        const currentStory = storyRef.current
        if (!currentStory || minigameController.isPlaying) return

        let fullText = ''
        let allTags = []

        // Story continuation loop
        while (currentStory.canContinue) {
            const nextBatch = currentStory.Continue()
            const tags = currentStory.currentTags

            fullText += nextBatch + '\n\n'
            allTags = [...allTags, ...tags]

            // Break for pagination
            if (tags.some(t => {
                const tag = t.trim().toLowerCase()
                return tag === 'next' || tag === 'page'
            })) break

            // Break for minigame
            if (tags.some(t => t.trim().toLowerCase().startsWith('minigame:'))) break
        }

        setText(fullText.trim())
        setChoices(currentStory.currentChoices)
        setCanContinue(currentStory.canContinue)
        setIsEnded(!currentStory.canContinue && currentStory.currentChoices.length === 0)

        processTags(allTags)

        if (storyId) {
            saveSystem.autoSave(currentStory.state.toJson(), fullText.trim(), gameSystems.exportGameSystems())
        }
    }, [storyId, processTags, saveSystem, gameSystems, minigameController.isPlaying])

    // Keep ref updated for callbacks
    continueStoryRef.current = continueStory

    // Minigame handlers using new controller
    const handleMinigameStart = useCallback(() => {
        const currentStory = storyRef.current
        if (currentStory) {
            currentStory.variablesState["minigame_result"] = -1
        }
        minigameController.startGame()
    }, [minigameController])

    // Make choice
    const makeChoice = useCallback((index) => {
        const currentStory = storyRef.current
        if (!currentStory) return
        clearVFX()
        currentStory.ChooseChoiceIndex(index)
        continueStory()
    }, [continueStory, clearVFX])

    // ==================
    // Start Screen Actions
    // ==================

    // New Game - start fresh
    const handleNewGame = useCallback(() => {
        const storyInfo = getCurrentStoryData()
        if (storyInfo) {
            gameSystems.resetGameSystems()
            initStory(storyInfo.data, storyInfo.id)
        }
    }, [getCurrentStoryData, initStory, gameSystems])

    // Continue - load last save
    const handleContinue = useCallback(() => {
        if (!saveSystem.hasContinue) return
        const saveData = saveSystem.loadLastSave()
        if (saveData) {
            const storyInfo = getCurrentStoryData()
            if (storyInfo) {
                initStory(storyInfo.data, storyInfo.id, saveData.state, saveData.text, saveData.gameSystems)
            }
        }
    }, [saveSystem, getCurrentStoryData, initStory])

    // Load specific save
    const handleLoadSave = useCallback((saveId) => {
        const saveData = saveSystem.loadSave(saveId)
        if (saveData) {
            const storyInfo = getCurrentStoryData()
            if (storyInfo) {
                initStory(storyInfo.data, storyInfo.id, saveData.state, saveData.text, saveData.gameSystems)
            }
        }
    }, [saveSystem, getCurrentStoryData, initStory])

    // Manual save (from game)
    const handleManualSave = useCallback((name, overwriteId = null) => {
        if (!story || !storyId) return
        saveSystem.saveGame(name, story.state.toJson(), text, gameSystems.exportGameSystems(), overwriteId)
    }, [story, storyId, text, saveSystem, gameSystems])

    // ==================
    // In-Game Actions  
    // ==================

    // Restart - clear and start fresh
    const restart = useCallback(() => {
        if (storyData && storyId) {
            clearVFX()
            stopMusic(false)
            gameSystems.resetGameSystems()
            setText('')
            setChoices([])
            setIsEnded(false)
            initStory(storyData, storyId)
        }
    }, [storyData, storyId, clearVFX, stopMusic, gameSystems, initStory])

    // Back to start screen (keeps selected story in dev mode)
    const backToStartScreen = useCallback(() => {
        setStory(null)
        setStoryId(null)
        setStoryData(null)
        setText('')
        setChoices([])
        clearVFX()
        stopMusic()
        gameSystems.resetGameSystems()
        // In production, selectedStory stays null (uses stories[0])
        // In dev mode, keep selectedStory so we go back to its start screen
    }, [clearVFX, stopMusic, gameSystems])

    // Back to story selector (dev mode only)
    const backToStorySelector = useCallback(() => {
        backToStartScreen()
        setSelectedStory(null) // Clear selection to show story selector
        setIntroComplete(false) // Reset intro for next game selection
        // Notify parent so SettingsProvider knows no story is selected
        if (onStorySelect) {
            onStorySelect(null)
        }
    }, [backToStartScreen, onStorySelect])

    // Finish game (ending reached) - just go back to start, keeps saves
    const finishGame = useCallback(() => {
        backToStartScreen()
    }, [backToStartScreen])

    // Dev mode: select story (goes to start screen, not directly to game)
    const selectStoryDev = useCallback((storyInfo) => {
        setSelectedStory(storyInfo)
        // Notify parent so SettingsProvider gets the correct storyId
        if (onStorySelect) {
            onStorySelect(storyInfo.id)
        }
    }, [onStorySelect])

    // Continue story when initialized
    useEffect(() => {
        if (story && !text) {
            if (!story.canContinue && story.currentChoices.length > 0) {
                setChoices(story.currentChoices)
                setCanContinue(false)
                setIsEnded(false)
                return
            }

            let fullText = ''
            let allTags = []

            while (story.canContinue) {
                const nextBatch = story.Continue()
                fullText += nextBatch
                allTags = [...allTags, ...story.currentTags]

                // Pagination support: Break the loop if we find a 'next' or 'page' tag
                if (story.currentTags.some(t => t.trim().toLowerCase() === 'next' || t.trim().toLowerCase() === 'page')) {
                    break
                }
            }

            setText(fullText.trim())
            setChoices(story.currentChoices)
            setCanContinue(story.canContinue)
            setIsEnded(!story.canContinue && story.currentChoices.length === 0)

            processTags(allTags)

            if (storyId) {
                saveSystem.autoSave(story.state.toJson(), fullText.trim(), gameSystems.exportGameSystems())
            }
        }
    }, [story, text, storyId, processTags, saveSystem, gameSystems])

    // Determine current screen
    const showStorySelector = !isProductionMode && !selectedStory && !story
    const showIntro = ((isProductionMode && !story) || (!isProductionMode && selectedStory && !story)) && !introComplete
    const showStartScreen = ((isProductionMode && !story) || (!isProductionMode && selectedStory && !story)) && introComplete
    const showPlayer = story !== null

    return (
        <div className="min-h-screen bg-bardo-bg relative overflow-hidden">
            <VFXLayer vfxState={vfxState} />

            {/* Save/Load Modal */}
            <SaveLoadModal
                isOpen={saveModalMode !== null}
                mode={saveModalMode || 'load'}
                saves={saveSystem.saves.filter(s => !s.isAutosave)}
                onSave={handleManualSave}
                onLoad={handleLoadSave}
                onDelete={saveSystem.deleteSave}
                onClose={() => setSaveModalMode(null)}
            />

            {/* Options Modal */}
            <OptionsModal
                isOpen={optionsOpen}
                onClose={() => setOptionsOpen(false)}
            />

            {/* Stats Panel */}
            {story && (
                <StatsPanel
                    stats={gameSystems.stats}
                    statsConfig={gameSystems.statsConfig}
                    getAllStatsInfo={gameSystems.getAllStatsInfo}
                />
            )}

            {/* Inventory Panel */}
            {story && (
                <InventoryPanel
                    items={gameSystems.items}
                    inventoryConfig={gameSystems.inventoryConfig}
                    getItemsWithInfo={gameSystems.getItemsWithInfo}
                />
            )}

            {/* Loading state */}
            {storyLoading && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-bardo-accent text-2xl animate-pulse">Cargando...</div>
                </div>
            )}

            {/* Error state */}
            {storyError && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-red-500 text-xl">Error: {storyError}</div>
                </div>
            )}

            {/* Story Selector (dev mode only) */}
            {!storyLoading && !storyError && showStorySelector && (
                <StorySelector
                    stories={AVAILABLE_STORIES}
                    onSelect={selectStoryDev}
                    hasSave={() => false}
                />
            )}

            {/* Intro Sequence (before start screen) */}
            {!storyLoading && !storyError && showIntro && (
                <IntroSequence
                    gameTitle={getGameTitle()}
                    introConfig={getIntroConfig()}
                    audioHooks={{ playMusic, stopMusic, playSfx }}
                    onComplete={() => setIntroComplete(true)}
                />
            )}

            {/* Start Screen (both modes) */}
            {!storyLoading && !storyError && showStartScreen && (
                <StartScreen
                    gameTitle={getGameTitle()}
                    hasAnySave={saveSystem.hasAnySave}
                    hasContinue={saveSystem.hasContinue}
                    onNewGame={handleNewGame}
                    onContinue={handleContinue}
                    onLoadGame={() => setSaveModalMode('load')}
                    onOptions={() => setOptionsOpen(true)}
                    onBack={!isProductionMode ? backToStorySelector : null}
                />
            )}

            {/* Player (both modes) */}
            {!storyLoading && !storyError && showPlayer && (
                <Player
                    text={text}
                    choices={choices}
                    isEnded={isEnded}
                    onChoice={makeChoice}
                    onRestart={restart}
                    onFinish={finishGame}
                    onBack={backToStartScreen}
                    onSave={() => setSaveModalMode('save')}
                    onContinue={continueStory}
                    canContinue={canContinue}
                    onOptions={() => setOptionsOpen(true)}
                    // Settings
                    typewriterDelay={getTypewriterDelay()}
                    fontSize={settings.fontSize}
                    autoAdvance={settings.autoAdvance}
                    autoAdvanceDelay={settings.autoAdvanceDelay}
                    // Minigame integration
                    isMinigameActive={minigameController.isPlaying}
                    hasPendingMinigame={minigameController.isPending}
                    onMinigameReady={handleMinigameStart}
                    minigameAutoStart={minigameController.config?.autoStart}
                />
            )}

            {/* Minigame Overlay */}
            <MinigameOverlay
                isPlaying={minigameController.isPlaying}
                config={minigameController.config}
                onFinish={minigameController.finishGame}
                onCancel={minigameController.cancelGame}
            />
        </div>
    )
}

// Wrapper component that manages story selection and provides settings per-game
function App() {
    // We need to track selectedStory at this level to pass storyId to SettingsProvider
    const [selectedStoryId, setSelectedStoryId] = useState(null)

    // Story loader to detect production mode
    const { stories, isLoading, isProductionMode } = useStoryLoader({
        devStories: DEV_STORIES
    })

    // Determine current story ID
    // In production: always the first (and only) story
    // In dev mode: the selected story, or null if none selected
    const currentStoryId = isProductionMode && stories.length > 0
        ? stories[0].id
        : selectedStoryId

    return (
        <SettingsProvider storyId={currentStoryId}>
            <AppContent
                onStorySelect={setSelectedStoryId}
                selectedStoryId={selectedStoryId}
            />
        </SettingsProvider>
    )
}

export default App

