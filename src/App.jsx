import { useState, useCallback, useEffect } from 'react'
import Player from './components/Player'
import StorySelector from './components/StorySelector'
import StartScreen from './components/StartScreen'
import IntroSequence from './components/IntroSequence'
import SaveLoadModal from './components/SaveLoadModal'
import OptionsModal from './components/OptionsModal'
import VFXLayer from './components/VFXLayer'
import StatsPanel from './components/StatsPanel'
import InventoryPanel from './components/InventoryPanel'
import ExtrasMenu from './components/ExtrasMenu'
import AchievementToast from './components/AchievementToast'
import MinigameOverlay from './components/MinigameOverlay'
import { useStoryLoader } from './hooks/useStoryLoader'
import { useBardoEngine } from './hooks/useBardoEngine'
import { SettingsProvider, useSettings } from './hooks/useSettings'

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

    // Screen state (NOT delegated to hook - UI concerns)
    const [selectedStory, setSelectedStory] = useState(null)
    const [introComplete, setIntroComplete] = useState(false)
    const [saveModalMode, setSaveModalMode] = useState(null)
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [extrasOpen, setExtrasOpen] = useState(false)

    // Story loader with environment detection
    const { stories, isLoading: storyLoading, error: storyError, isProductionMode } = useStoryLoader({
        devStories: DEV_STORIES
    })

    // Get current story ID
    const currentStoryId = isProductionMode && stories.length > 0
        ? stories[0].id
        : selectedStory?.id

    // Get current story data
    const getCurrentStoryData = () => {
        if (isProductionMode && stories.length > 0) return stories[0]
        return selectedStory
    }

    const storyInfo = getCurrentStoryData()

    // ==================
    // BardoEngine Hook (Central Orchestrator)
    // ==================
    const engine = useBardoEngine({
        storyId: currentStoryId,
        storyData: storyInfo?.data,
        settings,
        getTypewriterDelay,
        getMusicVolume,
        getSfxVolume
    })

    // Destructure for convenience
    const {
        story, text, choices, canContinue, isEnded, history,
        actions, subsystems, config
    } = engine
    const { audio, vfx, saveSystem, gameSystems, achievementsSystem, minigameController } = subsystems

    // ==================
    // Screen Navigation Handlers
    // ==================

    // Get game title for start screen
    const getGameTitle = () => {
        if (isProductionMode && stories.length > 0) return stories[0].title
        if (selectedStory) return selectedStory.title
        return 'BardoEngine'
    }

    // Get intro config for current game
    const getIntroConfig = () => {
        return gameSystems.config?.intro || {}
    }

    // Dev mode: select story
    const selectStoryDev = useCallback((storyInfo) => {
        setSelectedStory(storyInfo)
        if (onStorySelect) {
            onStorySelect(storyInfo.id)
        }
    }, [onStorySelect])

    // Back to story selector (dev mode only)
    const backToStorySelector = useCallback(() => {
        actions.backToStart()
        setSelectedStory(null)
        setIntroComplete(false)
        if (onStorySelect) {
            onStorySelect(null)
        }
    }, [actions, onStorySelect])

    // Back to start screen (keeps selected story in dev mode)
    const backToStartScreen = useCallback(() => {
        actions.backToStart()
    }, [actions])

    // ==================
    // Save/Load Handlers (wrap engine actions for modal)
    // ==================

    const handleNewGame = useCallback(() => {
        actions.newGame()
    }, [actions])

    const handleContinue = useCallback(() => {
        actions.continueGame()
    }, [actions])

    const handleLoadSave = useCallback((saveId) => {
        actions.loadSave(saveId)
        setSaveModalMode(null)
    }, [actions])

    const handleManualSave = useCallback((name, overwriteId = null) => {
        actions.manualSave(name, overwriteId)
        setSaveModalMode(null)
    }, [actions])

    // ==================
    // Screen Logic
    // ==================
    const isReady = !storyLoading && (!currentStoryId || engine.isThemeReady)

    const showStorySelector = isReady && !isProductionMode && !selectedStory && !story
    const showIntro = isReady && ((isProductionMode && !story) || (!isProductionMode && selectedStory && !story)) && !introComplete
    const showStartScreen = isReady && ((isProductionMode && !story) || (!isProductionMode && selectedStory && !story)) && introComplete
    const showPlayer = isReady && story !== null

    // ==================
    // Render
    // ==================

    return (
        <div className="min-h-screen bg-bardo-bg relative overflow-hidden transition-colors duration-500">
            <VFXLayer vfxState={vfx.vfxState} />

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
            {showPlayer && (
                <StatsPanel
                    stats={gameSystems.stats}
                    statsConfig={gameSystems.statsConfig}
                    getAllStatsInfo={gameSystems.getAllStatsInfo}
                />
            )}

            {/* Inventory Panel */}
            {showPlayer && (
                <InventoryPanel
                    items={gameSystems.items}
                    inventoryConfig={gameSystems.inventoryConfig}
                    getItemsWithInfo={gameSystems.getItemsWithInfo}
                />
            )}

            {/* Loading state */}
            {!isReady && (
                <div className="flex items-center justify-center min-h-screen bg-black">
                    <div className="text-bardo-accent text-2xl animate-pulse font-mono uppercase tracking-[0.2em]">Cargando...</div>
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
                    audioHooks={{ playMusic: audio.playMusic, stopMusic: audio.stopMusic, playSfx: audio.playSfx }}
                    onComplete={() => setIntroComplete(true)}
                />
            )}

            {/* Start Screen (both modes) */}
            {!storyLoading && !storyError && showStartScreen && (
                <StartScreen
                    gameTitle={getGameTitle()}
                    hasAnySave={saveSystem.hasAnySave}
                    hasContinue={saveSystem.hasContinue}
                    hasExtras={config.hasExtras}
                    onNewGame={handleNewGame}
                    onContinue={handleContinue}
                    onLoadGame={() => setSaveModalMode('load')}
                    onOptions={() => setOptionsOpen(true)}
                    onExtras={() => setExtrasOpen(true)}
                    onBack={!isProductionMode ? backToStorySelector : null}
                />
            )}

            {/* Player (both modes) */}
            {!storyLoading && !storyError && showPlayer && (
                <Player
                    text={text}
                    choices={choices}
                    isEnded={isEnded}
                    onChoice={actions.makeChoice}
                    onRestart={actions.restart}
                    onFinish={actions.finishGame}
                    onBack={backToStartScreen}
                    onSave={() => setSaveModalMode('save')}
                    onContinue={actions.continueStory}
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
                    onMinigameReady={actions.handleMinigameStart}
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

            {/* Extras Menu */}
            <ExtrasMenu
                isOpen={extrasOpen}
                onClose={() => setExtrasOpen(false)}
                achievements={achievementsSystem.achievements}
                achievementStats={achievementsSystem.stats}
                unlockedAchievementIds={achievementsSystem.achievements.filter(a => a.unlocked).map(a => a.id)}
                onResetAchievements={achievementsSystem.resetAllAchievements}
                gallery={config.extrasConfig.gallery || []}
                jukebox={config.extrasConfig.jukebox || []}
                playMusic={audio.playMusic}
                stopMusic={audio.stopMusic}
                currentTrack={null}
            />

            {/* Achievement Toast */}
            <AchievementToast
                achievement={achievementsSystem.pendingToast}
                onDismiss={achievementsSystem.clearToast}
                playSound={audio.playSfx}
            />
        </div>
    )
}

// Wrapper component that manages story selection and provides settings per-game
function App() {
    const [selectedStoryId, setSelectedStoryId] = useState(null)

    const { stories, isLoading, isProductionMode } = useStoryLoader({
        devStories: DEV_STORIES
    })

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
