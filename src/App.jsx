import { useState, useCallback, useEffect } from 'react'
import { Story } from 'inkjs'
import Player from './components/Player'
import StorySelector from './components/StorySelector'
import StartScreen from './components/StartScreen'
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
import { SettingsProvider, useSettings } from './hooks/useSettings'

// Import the compiled stories (used in development mode)
import partuzaStory from './stories/partuza.json'
import serruchinStory from './stories/serruchin.json'

// Dev mode stories
const DEV_STORIES = {
    serruchin: serruchinStory,
    partuza: partuzaStory
}

// Format for story selector
const AVAILABLE_STORIES = [
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
    const [saveModalMode, setSaveModalMode] = useState(null) // 'save' | 'load' | null
    const [optionsOpen, setOptionsOpen] = useState(false)

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

    // Initialize story
    const initStory = useCallback((data, id, savedState = null, savedText = '', savedGameSystems = null) => {
        const newStory = new Story(data)

        if (savedState) {
            newStory.state.LoadJson(savedState)
        }

        setStory(newStory)
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

    // Process tags (VFX + Game Systems)
    const processTags = useCallback((tags) => {
        tags.forEach(rawTag => {
            const tag = rawTag.trim()
            if (!tag) return
            const handled = gameSystems.processGameTag(tag)
            if (!handled) {
                triggerVFX(tag)
            }
        })
    }, [gameSystems, triggerVFX])

    // Continue story
    const continueStory = useCallback(() => {
        if (!story) return

        let fullText = ''
        let allTags = []

        while (story.canContinue) {
            fullText += story.Continue()
            allTags = [...allTags, ...story.currentTags]
        }

        setText(fullText.trim())
        setChoices(story.currentChoices)
        setCanContinue(story.canContinue)
        setIsEnded(!story.canContinue && story.currentChoices.length === 0)

        processTags(allTags)

        if (storyId) {
            saveSystem.autoSave(story.state.toJson(), fullText.trim(), gameSystems.exportGameSystems())
        }
    }, [story, storyId, processTags, saveSystem, gameSystems])

    // Make choice
    const makeChoice = useCallback((index) => {
        if (!story) return
        clearVFX()
        story.ChooseChoiceIndex(index)
        continueStory()
    }, [story, continueStory, clearVFX])

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
                fullText += story.Continue()
                allTags = [...allTags, ...story.currentTags]
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
    const showStartScreen = (isProductionMode && !story) || (!isProductionMode && selectedStory && !story)
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
                    onOptions={() => setOptionsOpen(true)}
                    // Settings
                    typewriterDelay={getTypewriterDelay()}
                    fontSize={settings.fontSize}
                    autoAdvance={settings.autoAdvance}
                    autoAdvanceDelay={settings.autoAdvanceDelay}
                />
            )}
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

