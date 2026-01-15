import { useState, useCallback, useEffect } from 'react'
import { Story } from 'inkjs'
import Player from './components/Player'
import StorySelector from './components/StorySelector'
import VFXLayer from './components/VFXLayer'
import StatsPanel from './components/StatsPanel'
import InventoryPanel from './components/InventoryPanel'
import { useVFX } from './hooks/useVFX'
import { useAudio } from './hooks/useAudio'
import { useSaveSystem } from './hooks/useSaveSystem'
import { useGameSystems } from './hooks/useGameSystems'
import { useStoryLoader } from './hooks/useStoryLoader'

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

function App() {
    const [story, setStory] = useState(null)
    const [storyId, setStoryId] = useState(null)
    const [text, setText] = useState('')
    const [choices, setChoices] = useState([])
    const [canContinue, setCanContinue] = useState(false)
    const [isEnded, setIsEnded] = useState(false)
    const [productionAutoStarted, setProductionAutoStarted] = useState(false)

    const { playSfx, playMusic, stopMusic, stopAll: stopAllAudio } = useAudio()
    const { vfxState, triggerVFX, clearVFX } = useVFX({ playSfx, playMusic, stopMusic })
    const { saveGame, loadGame, clearSave, hasSave } = useSaveSystem()

    // Story loader with environment detection
    const { stories, isLoading: storyLoading, error: storyError, isProductionMode } = useStoryLoader({
        devStories: DEV_STORIES
    })

    // Game systems (stats + inventory)
    const gameSystems = useGameSystems(storyId)

    // Initialize story
    const initStory = useCallback((storyData, id, savedState = null, savedText = '', savedGameSystems = null) => {
        const newStory = new Story(storyData)

        if (savedState) {
            newStory.state.LoadJson(savedState)
        }

        setStory(newStory)
        setStoryId(id)

        // Load saved game systems (stats/inventory)
        if (savedGameSystems) {
            gameSystems.loadGameSystems(savedGameSystems)
        }

        // If we have saved text, restore it along with choices
        // (the useEffect won't run since text won't be empty)
        if (savedText) {
            setText(savedText)
            setChoices(newStory.currentChoices)
            setCanContinue(newStory.canContinue)
            // Detect if we're at an ending (no choices and can't continue)
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
            // Try game systems first (stats/inventory)
            const handled = gameSystems.processGameTag(tag)
            // If not handled by game systems, try VFX
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

        // Process all tags (VFX + Game Systems)
        processTags(allTags)

        // Auto-save with current text and game systems
        if (storyId) {
            saveGame(storyId, story.state.toJson(), fullText.trim(), gameSystems.exportGameSystems())
        }
    }, [story, storyId, processTags, saveGame, gameSystems])

    // Make choice
    const makeChoice = useCallback((index) => {
        if (!story) return
        clearVFX()
        story.ChooseChoiceIndex(index)
        continueStory()
    }, [story, continueStory, clearVFX])

    // Start new game
    const startGame = useCallback((storyInfo) => {
        const saveData = loadGame(storyInfo.id)
        if (saveData) {
            initStory(storyInfo.data, storyInfo.id, saveData.state, saveData.text, saveData.gameSystems)
        } else {
            initStory(storyInfo.data, storyInfo.id)
        }
    }, [initStory, loadGame])

    // Restart
    const restart = useCallback(() => {
        if (storyId) {
            clearSave(storyId)
            clearVFX()
            stopMusic(false) // Stop music immediately on restart
            gameSystems.resetGameSystems()
            setText('') // Clear text so useEffect triggers continueStory
            setChoices([])
            setIsEnded(false)
            // Find story in available stories (works for both dev and production)
            const storyInfo = isProductionMode
                ? stories[0]
                : AVAILABLE_STORIES.find(s => s.id === storyId)
            if (storyInfo) {
                initStory(storyInfo.data, storyInfo.id)
            }
        }
    }, [storyId, clearSave, clearVFX, stopMusic, gameSystems, initStory])

    // Back to menu (only available in dev mode)
    const backToMenu = useCallback(() => {
        if (isProductionMode) return // No menu in production
        setStory(null)
        setStoryId(null)
        setText('')
        setChoices([])
        clearVFX()
        stopMusic() // Fade out music when going to menu
        gameSystems.resetGameSystems()
    }, [clearVFX, stopMusic, gameSystems, isProductionMode])

    // Finish game (clear save and back to menu)
    const finishGame = useCallback(() => {
        if (storyId) {
            clearSave(storyId)
        }
        backToMenu()
    }, [storyId, clearSave, backToMenu])

    // Continue story when initialized or after restart
    useEffect(() => {
        if (story && !text) {
            // If we can't continue, we're at a decision point - just load the current choices
            // The text was already restored from saved data in initStory
            if (!story.canContinue && story.currentChoices.length > 0) {
                setChoices(story.currentChoices)
                setCanContinue(false)
                setIsEnded(false)
                return
            }

            // Directly continue story here to avoid closure issues
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

            // Process all tags (VFX + Game Systems)
            processTags(allTags)

            // Auto-save with current text and game systems
            if (storyId) {
                saveGame(storyId, story.state.toJson(), fullText.trim(), gameSystems.exportGameSystems())
            }
        }
    }, [story, text, storyId, processTags, saveGame, gameSystems])

    // Auto-start in production mode
    useEffect(() => {
        if (isProductionMode && !productionAutoStarted && stories.length > 0 && !storyLoading) {
            setProductionAutoStarted(true)
            startGame(stories[0])
        }
    }, [isProductionMode, productionAutoStarted, stories, storyLoading, startGame])

    return (
        <div className="min-h-screen bg-bardo-bg relative overflow-hidden">
            <VFXLayer vfxState={vfxState} />

            {/* Stats Panel - only shows when story is active and stats are enabled */}
            {story && (
                <StatsPanel
                    stats={gameSystems.stats}
                    statsConfig={gameSystems.statsConfig}
                    getAllStatsInfo={gameSystems.getAllStatsInfo}
                />
            )}

            {/* Inventory Panel - only shows when story is active and inventory is enabled */}
            {story && (
                <InventoryPanel
                    items={gameSystems.items}
                    inventoryConfig={gameSystems.inventoryConfig}
                    getItemsWithInfo={gameSystems.getItemsWithInfo}
                />
            )}

            {/* Loading state for production mode */}
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

            {/* Story selector (dev mode only) or Player */}
            {!storyLoading && !storyError && !story && !isProductionMode ? (
                <StorySelector
                    stories={AVAILABLE_STORIES}
                    onSelect={startGame}
                    hasSave={hasSave}
                />
            ) : !storyLoading && !storyError && story ? (
                <Player
                    text={text}
                    choices={choices}
                    isEnded={isEnded}
                    onChoice={makeChoice}
                    onRestart={restart}
                    onFinish={finishGame}
                    onBack={isProductionMode ? null : backToMenu}
                />
            ) : null}
        </div>
    )
}

export default App
