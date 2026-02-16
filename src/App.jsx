import React, { useState, useCallback, useEffect, Suspense } from 'react'
import Player from './components/Player'
import StorySelector from './components/StorySelector'
import StartScreen from './components/StartScreen'
import IntroSequence from './components/IntroSequence'
import SaveLoadModal from './components/SaveLoadModal'
import OptionsModal from './components/OptionsModal'
import HistoryLog from './components/HistoryLog'
import VFXLayer from './components/VFXLayer'
import StatsPanel from './components/StatsPanel'
import InventoryPanel from './components/InventoryPanel'
import ExtrasMenu from './components/ExtrasMenu'
import AchievementToast from './components/AchievementToast'
import MinigameOverlay from './components/MinigameOverlay'
import InputOverlay from './components/InputOverlay'
import HorrorVFXLayer from './components/HorrorVFXLayer'
import WillpowerMeter from './components/WillpowerMeter'
import ForcedClickOverlay from './components/ForcedClickOverlay'
import SpiderOverlay from './components/SpiderOverlay'
import { useHeavyCursor } from './hooks/useHeavyCursor'
import { useStoryLoader } from './hooks/useStoryLoader'
import { useBardoEngine } from './hooks/useBardoEngine'
import { SettingsProvider, useSettings } from './hooks/useSettings'
import { useIsMobile } from './hooks/useMediaQuery'

const BardoEditor = React.lazy(() => import('./editor/BardoEditor'))

// Import the compiled stories (used in development mode)
import partuzaStory from './stories/partuza.json'
import serruchinStory from './stories/serruchin.json'
import centinelasStory from './stories/centinelas.json'
import toyboxStory from './stories/toybox.json'
import apneaStory from './stories/apnea.json'
import vampiroStory from './stories/vampiro.json'
import spiderDemoStory from './stories/spider_demo.json'
import museoDemoStory from './stories/museo_demo.json'

// Dev mode stories
const DEV_STORIES = {
    serruchin: serruchinStory,
    partuza: partuzaStory,
    centinelas: centinelasStory,
    toybox: toyboxStory,
    apnea: apneaStory,
    vampiro: vampiroStory,
    spider_demo: spiderDemoStory,
    museo_demo: museoDemoStory
}

const AVAILABLE_STORIES = [
    { id: 'vampiro', title: '🧛 EL PESO DE LA VOLUNTAD (Meta-Horror Demo)', data: vampiroStory },
    { id: 'centinelas', title: '🚨 CENTINELAS DEL SUR', data: centinelasStory },
    { id: 'toybox', title: '📦 BARDO TOYBOX (Minigames)', data: toyboxStory },
    { id: 'apnea', title: '🫁 APNEA', data: apneaStory },
    { id: 'serruchin', title: '🪚 SERRUCHÍN', data: serruchinStory },
    { id: 'partuza', title: 'Tu nombre en clave es Partuza', data: partuzaStory },
    { id: 'spider_demo', title: '🕷️ INFESTACIÓN (Spider Demo)', data: spiderDemoStory },
    { id: 'museo_demo', title: '🏛️ EL OCASO EN EL MUSEO (Scroll/Boss Demo)', data: museoDemoStory }
]

// Inner App component that uses settings context
function AppContent({ onStorySelect }) {
    // Settings
    const { settings, getTypewriterDelay, getMusicVolume, getSfxVolume } = useSettings()

    // Mobile detection
    const isMobile = useIsMobile()

    // Screen state (NOT delegated to hook - UI concerns)
    const [selectedStory, setSelectedStory] = useState(null)
    const [introComplete, setIntroComplete] = useState(false)
    const [saveModalMode, setSaveModalMode] = useState(null)
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [historyOpen, setHistoryOpen] = useState(false)
    const [inventoryOpen, setInventoryOpen] = useState(false)
    const [extrasOpen, setExtrasOpen] = useState(false)
    const [showEditor, setShowEditor] = useState(false)
    const [choicesVisible, setChoicesVisible] = useState(false)  // True when Player's typewriter is done
    const [meterRevealed, setMeterRevealed] = useState(false)    // True once bar has been shown for first time

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
    const { audio, vfx, saveSystem, gameSystems, achievementsSystem, minigameController, willpower, spiderInfestation, scrollFriction, bossController, visualDamage, scrollContainerRef } = subsystems

    // Track if we've auto-submitted due to zero willpower
    const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)
    const [showForcedClick, setShowForcedClick] = useState(false)

    // Reset auto-submit flag and reveal state when choices or text change
    useEffect(() => {
        setHasAutoSubmitted(false)
        setShowForcedClick(false)
        setChoicesVisible(false)
        // Do NOT reset meterRevealed here. It is now strictly controlled by 'active' state.
    }, [choices, currentStoryId, text])

    // Manage willpower meter "reveal" state
    // The meter is revealed ONLY via the onWillpowerHintVisible callback from TextDisplay
    // when it detects the hint text "[PRESIONÁ" in the narrative.
    useEffect(() => {
        // When willpower becomes inactive, hide the meter
        setMeterRevealed(false)
    }, [willpower?.state?.active])

    // Trigger forced click animation when willpower reaches 0
    useEffect(() => {
        if (willpower?.state?.active &&
            willpower?.state?.value <= 0 &&
            choices.length >= 2 &&
            !hasAutoSubmitted) {
            console.log('[Willpower] Zero willpower - starting forced click takeover')
            setHasAutoSubmitted(true)
            setShowForcedClick(true)
        }
    }, [willpower?.state?.value, willpower?.state?.active, choices.length, hasAutoSubmitted, actions])

    // Handle forced click completion
    const handleForcedClickComplete = useCallback(() => {
        console.log('[Willpower] Forced click complete - selecting ceder')
        setShowForcedClick(false)
        actions.makeChoice(1)  // Index 1 = second option = ceder
    }, [actions])

    // ==================
    // Heavy Cursor Effect (Meta-Horror)
    // ==================
    // Activate heavy cursor when willpower system is active OR horror effects are active
    const horrorEffect = vfx.vfxState?.horrorEffect
    const willpowerActive = willpower?.state?.active

    const shouldActivateHeavyCursor = (willpowerActive && (meterRevealed || showForcedClick)) ||
        horrorEffect === 'static_mind' ||
        horrorEffect === 'blur_vignette' ||
        horrorEffect === 'submission_fade'

    // Map willpower/horror state to cursor resistance level
    const getResistanceLevel = () => {
        if (!shouldActivateHeavyCursor) return 'none'

        // When willpower is active, use the decay rate to determine cursor heaviness
        if (willpowerActive) {
            const decayRate = willpower?.state?.decayRate || 'normal'
            // Map decay rate to cursor resistance
            const cursorMap = {
                slow: 'low',
                normal: 'medium',
                fast: 'high',
                extreme: 'extreme'
            }
            return cursorMap[decayRate] || 'medium'
        }

        // Fall back to horror effect based resistance
        if (horrorEffect === 'static_mind') return 'high'
        if (horrorEffect === 'blur_vignette') return 'medium'
        if (horrorEffect === 'submission_fade') return 'extreme'
        return 'low'
    }

    useHeavyCursor({
        resistanceLevel: getResistanceLevel(),
        enabled: shouldActivateHeavyCursor,
        showTrail: shouldActivateHeavyCursor,
        magnetTarget: null,
        magnetStrength: 0
    })

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

    // Helper to check if a choice is burned
    const checkChoiceBurned = useCallback((choice) => {
        if (!gameSystems?.hubs?.isBurned) return false
        const targetKnot = choice.pathStringOnChoice?.split('.')[0]
        return targetKnot ? gameSystems.hubs.isBurned(targetKnot) : false
    }, [gameSystems])

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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'o') {
                e.preventDefault()
                setOptionsOpen(prev => !prev)
            }
            if (e.key.toLowerCase() === 'l' && story) {
                e.preventDefault()
                setHistoryOpen(prev => !prev)
            }
            if (e.key.toLowerCase() === 'i' && story) {
                e.preventDefault()
                setInventoryOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [story])

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

            {/* Horror VFX Layer - Extended effects for meta-horror */}
            <HorrorVFXLayer
                effect={vfx.vfxState.horrorEffect}
                intensity={vfx.vfxState.horrorIntensity}
            />

            {/* Parallel Willpower Meter - Shows after first reveal, stays until inactive */}
            <WillpowerMeter
                active={willpower?.state?.active && meterRevealed && !minigameController.isPlaying}
                initialValue={100}
                decayRate={willpower?.state?.decayRate || 'normal'}
                targetKey={willpower?.state?.targetKey || 'V'}
                onValueChange={willpower?.updateValue}
                position="left"
            />

            {/* Forced Click Animation - When willpower reaches 0 */}
            <ForcedClickOverlay
                active={showForcedClick}
                targetSelector='[data-choice-index="1"]'
                choicesVisible={choicesVisible}
                onComplete={handleForcedClickComplete}
                message="Ya no tenés control..."
            />

            {/* Spider Infestation Overlay - Parasitic horror on story UI */}
            <SpiderOverlay
                state={spiderInfestation.state}
                actions={spiderInfestation.actions}
            />

            {/* Save/Load Modal */}
            <SaveLoadModal
                isOpen={saveModalMode !== null}
                mode={saveModalMode || 'load'}
                saves={saveSystem.saves}
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

            {/* History Log */}
            <HistoryLog
                isOpen={historyOpen}
                history={engine.history}
                onClose={() => setHistoryOpen(false)}
            />

            {/* Stats Panel */}
            {showPlayer && (
                <StatsPanel
                    stats={gameSystems.stats}
                    statsConfig={gameSystems.statsConfig}
                    getAllStatsInfo={gameSystems.getAllStatsInfo}
                    playerName={
                        gameSystems.statsConfig?.playerNameVariable
                            ? story?.variablesState?.[gameSystems.statsConfig.playerNameVariable] || ''
                            : null
                    }
                    isMobile={isMobile}
                />
            )}

            {/* Inventory Panel */}
            {showPlayer && (
                <InventoryPanel
                    items={gameSystems.items}
                    inventoryConfig={gameSystems.inventoryConfig}
                    getItemsWithInfo={gameSystems.getItemsWithInfo}
                    isOpen={inventoryOpen}
                    onToggle={() => setInventoryOpen(prev => !prev)}
                    isMobile={isMobile}
                    hideToggle={isMobile}
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
                    onOpenEditor={() => setShowEditor(true)}
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
                    onOpenEditor={null} // Removed: editor only from main selector
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
                    onLoad={() => setSaveModalMode('load')}
                    onContinue={actions.continueStory}
                    canContinue={canContinue}
                    onOptions={() => setOptionsOpen(true)}
                    onToggleHistory={() => setHistoryOpen(prev => !prev)}
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
                    checkBurned={checkChoiceBurned}
                    // Willpower system - pass difficulty level for random resistance scaling
                    willpowerActive={willpower?.state?.active}
                    choiceResistanceLevel={willpower?.state?.active ? willpower?.state?.decayRate || 'normal' : 'none'}
                    // Notify when choices become visible (after typewriter finishes)
                    onChoicesVisibleChange={setChoicesVisible}
                    // Notify when the willpower mashing hint starts typing
                    onWillpowerHintVisible={() => setMeterRevealed(true)}
                    // Mobile layout props
                    isMobile={isMobile}
                    headerStatsProps={isMobile && gameSystems.statsConfig?.enabled ? {
                        stats: gameSystems.stats,
                        statsConfig: gameSystems.statsConfig,
                        getAllStatsInfo: gameSystems.getAllStatsInfo
                    } : null}
                    inventoryEnabled={!!gameSystems.inventoryConfig?.enabled}
                    onToggleInventory={() => setInventoryOpen(prev => !prev)}
                    inventoryItemCount={gameSystems.getItemsWithInfo?.()?.length || 0}
                    // Scroll container ref (shared with scroll friction hook)
                    scrollContainerRef={scrollContainerRef}
                    // Boss fight props
                    bossState={bossController?.state}
                    scrollFriction={scrollFriction}
                    onBossPhaseComplete={bossController?.handleBossPhaseComplete}
                    onBossPlayerDeath={bossController?.handleBossPlayerDeath}
                    sabiduria={gameSystems?.stats?.sabiduria}
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

            {/* Input Overlay */}
            <InputOverlay
                isOpen={!!subsystems.input.pendingInput}
                placeholder={subsystems.input.pendingInput?.placeholder}
                onCommit={subsystems.input.commitInput}
                onCancel={() => { }} // Could implement a cancel that just resumes without setting var
            />

            {/* Bardo Editor Overlay - Only visible in Story Selector view */}
            {showEditor && showStorySelector && (
                <Suspense fallback={<div className="fixed inset-0 z-[200] bg-black text-white flex items-center justify-center font-mono">LOADING THE LOOM...</div>}>
                    <BardoEditor onClose={() => setShowEditor(false)} />
                </Suspense>
            )}
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
