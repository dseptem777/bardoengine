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
import RelationshipsPanel from './components/RelationshipsPanel'
import ExtrasMenu from './components/ExtrasMenu'
import AchievementToast from './components/AchievementToast'
import MinigameOverlay from './components/MinigameOverlay'
import InputOverlay from './components/InputOverlay'
import DebugSpawnModal from './components/DebugSpawnModal'
import HorrorVFXLayer from './components/HorrorVFXLayer'
import WillpowerMeter from './components/WillpowerMeter'
import SpiderOverlay from './components/SpiderOverlay'
import { useHeavyCursor } from './hooks/useHeavyCursor'
import { useStoryLoader } from './hooks/useStoryLoader'
import { useBardoEngine } from './hooks/useBardoEngine'
import { processChoiceRequirements } from './utils/choiceRequirements'
import { getDominantStat } from './utils/getDominantStat'
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
    const [relationshipsOpen, setRelationshipsOpen] = useState(false)
    const [extrasOpen, setExtrasOpen] = useState(false)
    const [showEditor, setShowEditor] = useState(false)
    const [choicesVisible, setChoicesVisible] = useState(false)  // True when Player's typewriter is done
    const [meterRevealed, setMeterRevealed] = useState(false)    // True once bar has been shown for first time
    const [debugUnlocked, setDebugUnlocked] = useState(false)
    const [showDebugSpawn, setShowDebugSpawn] = useState(false)

    // Dev story list (persisted in localStorage, all imported via .ink)
    const [devStoryList, setDevStoryList] = useState(() => {
        try {
            const stored = localStorage.getItem('bardo_dev_stories')
            if (!stored) return []
            return JSON.parse(stored)
        } catch { return [] }
    })

    const handleImportInk = useCallback(async (name, title, inkSource) => {
        const { Compiler } = await import('inkjs/compiler/Compiler')
        const { Story } = await import('inkjs')
        const compiler = new Compiler(inkSource)
        const compiled = compiler.Compile()
        const jsonStr = compiled.ToJson()
        // Validate it actually works as a Story
        new Story(jsonStr)

        const storyData = JSON.parse(jsonStr)
        const id = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
        const entry = { id, title, data: storyData }

        setDevStoryList(prev => {
            const filtered = prev.filter(s => s.id !== id)
            const next = [...filtered, entry]
            try {
                localStorage.setItem('bardo_dev_stories', JSON.stringify(next))
            } catch (e) {
                console.error('[App] localStorage quota exceeded — story too large to persist:', e)
            }
            return next
        })
    }, [])

    const handleRemoveStory = useCallback((id) => {
        setDevStoryList(prev => {
            const next = prev.filter(s => s.id !== id)
            localStorage.setItem('bardo_dev_stories', JSON.stringify(next))
            return next
        })
    }, [])

    // Story loader with environment detection
    const { stories, isLoading: storyLoading, error: storyError, isProductionMode } = useStoryLoader({
        devStories: DEV_STORIES
    })

    // Get current story ID
    const currentStoryId = isProductionMode && stories.length > 0
        ? stories[0].id
        : selectedStory?.id

    // Sync currentStoryId to parent (for SettingsProvider)
    useEffect(() => {
        if (onStorySelect && currentStoryId) {
            onStorySelect(currentStoryId)
        }
    }, [currentStoryId, onStorySelect])

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
        story, text, choices, canContinue, continueLabel, isEnded, history,
        actions, subsystems, config
    } = engine
    const { audio, vfx, saveSystem, gameSystems, achievementsSystem, minigameController, willpower, spiderInfestation, scrollFriction, bossController, visualDamage, scrollContainerRef, genjutsu } = subsystems

    // Keep debug unlocked in sync with dev mode
    useEffect(() => {
        if (!isProductionMode) setDebugUnlocked(true)
    }, [isProductionMode])

    // Reset reveal state when choices or text change
    useEffect(() => {
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

    // ==================
    // Spider Infestation — Pause when any modal is open
    // ==================
    const isMenuOpen = saveModalMode !== null || optionsOpen || historyOpen
        || inventoryOpen || relationshipsOpen || extrasOpen

    useEffect(() => {
        if (!spiderInfestation?.actions) return
        if (isMenuOpen) spiderInfestation.actions.pause()
        else spiderInfestation.actions.resume()
    }, [isMenuOpen, spiderInfestation?.actions])

    // ==================
    // Heavy Cursor Effect (Meta-Horror)
    // ==================
    // Activate heavy cursor when willpower system is active OR horror effects are active
    const horrorEffect = vfx.vfxState?.horrorEffect
    const willpowerActive = willpower?.state?.active

    const shouldActivateHeavyCursor = (willpowerActive && meterRevealed) ||
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

    // Helper to check if a choice is locked by requirements
    const checkChoiceLocked = useCallback((choice) => {
        if (!gameSystems) return null
        return processChoiceRequirements(choice, gameSystems)
    }, [gameSystems])

    // Dev mode: select story
    // If a compiled import exists in DEV_STORIES, prefer it over the
    // localStorage copy so that recompiled .ink files are picked up
    // without having to re-import the story manually.
    const selectStoryDev = useCallback((storyInfo) => {
        const freshData = DEV_STORIES[storyInfo.id]
        const resolved = freshData
            ? { ...storyInfo, data: freshData }
            : storyInfo
        setSelectedStory(resolved)
        if (onStorySelect) {
            onStorySelect(resolved.id)
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
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
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
                value={willpower?.state?.value ?? 100}
                decayRate={willpower?.state?.decayRate || 'normal'}
                targetKey={willpower?.state?.targetKey || 'V'}
                boostValue={willpower?.boostValue}
                volumeMultiplier={getMusicVolume()}
                genjutsuActive={genjutsu?.active ?? false}
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
                    nickname={
                        gameSystems.statsConfig?.nicknameVariable
                            ? story?.variablesState?.[gameSystems.statsConfig.nicknameVariable] || ''
                            : null
                    }
                    chapterName={
                        gameSystems.statsConfig?.chapterVariable
                            ? story?.variablesState?.[gameSystems.statsConfig.chapterVariable] || ''
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

            {/* Relationships Panel */}
            {showPlayer && (
                <RelationshipsPanel
                    stats={gameSystems.stats}
                    relationshipDefs={gameSystems.statsConfig?.definitions?.filter(d => d.displayType === 'relationship')}
                    isOpen={relationshipsOpen}
                    onToggle={() => setRelationshipsOpen(prev => !prev)}
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
                <div className="flex items-center justify-center min-h-screen bg-bardo-bg">
                    <div className="max-w-md w-full mx-4 p-8 border border-red-800/50 bg-red-950/30 text-center"
                        style={{ borderRadius: 'var(--ui-border-radius)' }}>
                        <p className="text-red-400 text-xl font-bold mb-2">Error de carga</p>
                        <p className="text-red-600 text-sm font-mono mb-6 break-all">{storyError}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 border border-red-700 text-red-400 hover:bg-red-900/30 text-sm transition-colors"
                                style={{ borderRadius: 'var(--ui-border-radius)' }}
                            >
                                Reintentar
                            </button>
                            {!isProductionMode && (
                                <button
                                    onClick={backToStorySelector}
                                    className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:bg-neutral-800/30 text-sm transition-colors"
                                    style={{ borderRadius: 'var(--ui-border-radius)' }}
                                >
                                    Volver al selector
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Story Selector (dev mode only) */}
            {!storyLoading && !storyError && showStorySelector && (
                <StorySelector
                    stories={devStoryList}
                    onSelect={selectStoryDev}
                    hasSave={() => false}
                    onOpenEditor={() => setShowEditor(true)}
                    onImportInk={handleImportInk}
                    onRemoveStory={handleRemoveStory}
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
                    onCheatCode={() => setDebugUnlocked(true)}
                    gameVersion={config.gameVersion}
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
                    onContinueFromSave={saveSystem.hasContinue ? handleContinue : null}
                    onLoadSave={() => setSaveModalMode('load')}
                    onSave={() => setSaveModalMode('save')}
                    onLoad={() => setSaveModalMode('load')}
                    onContinue={actions.continueStory}
                    canContinue={canContinue}
                    continueLabel={continueLabel}
                    onOptions={() => setOptionsOpen(true)}
                    onToggleHistory={() => setHistoryOpen(prev => !prev)}
                    gameTitle={getGameTitle()}
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
                    checkLocked={checkChoiceLocked}
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
                    relationshipsEnabled={gameSystems.statsConfig?.definitions?.some(d => d.displayType === 'relationship')}
                    onToggleRelationships={() => setRelationshipsOpen(prev => !prev)}
                    // Scroll container ref (shared with scroll friction hook)
                    scrollContainerRef={scrollContainerRef}
                    // Boss fight props
                    bossState={bossController?.state}
                    scrollFriction={scrollFriction}
                    onBossPhaseComplete={bossController?.handleBossPhaseComplete}
                    onBossPlayerDeath={bossController?.handleBossPlayerDeath}
                    sabiduria={gameSystems?.stats?.sabiduria}
                    genjutsuBreak={genjutsu?.break ?? null}
                    dominantStat={getDominantStat(gameSystems.stats || {})}
                    willpowerValue={willpower?.state?.value ?? 100}
                    onBreakGenjutsu={genjutsu?.breakGenjutsu}
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
                label={subsystems.input.pendingInput?.label}
                onCommit={subsystems.input.commitInput}
            />

            {/* Debug Spawn Button */}
            {debugUnlocked && story && (
                <button
                    onClick={() => setShowDebugSpawn(true)}
                    className="fixed bottom-4 right-4 z-50 bg-gray-900/90 border border-bardo-accent/40 text-bardo-accent text-xs font-mono px-3 py-2 rounded hover:bg-bardo-accent/20 hover:border-bardo-accent transition-all"
                    title="Debug Spawn (jump to any knot)"
                >
                    [DEBUG]
                </button>
            )}

            {/* Debug Spawn Modal */}
            <DebugSpawnModal
                isOpen={showDebugSpawn}
                onClose={() => setShowDebugSpawn(false)}
                knots={story ? actions.getKnotList() : []}
                variables={story ? actions.getVariables() : {}}
                onSpawn={(knotName, vars) => {
                    actions.spawnAtKnot(knotName, vars)
                    setShowDebugSpawn(false)
                }}
                onSaveVariables={(vars) => {
                    actions.debugSetVariables(vars)
                }}
            />

            {/* Bardo Editor Overlay - Only visible in Story Selector view */}
            {showEditor && showStorySelector && (
                <Suspense fallback={
                    <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex items-center justify-center">
                        <p className="text-yellow-400 text-xl tracking-widest animate-pulse">LOADING BARDOEDITOR...</p>
                    </div>
                }>
                    <BardoEditor onClose={() => setShowEditor(false)} />
                </Suspense>
            )}
        </div>
    )
}

// Wrapper component that manages story selection and provides settings per-game
function App() {
    const [selectedStoryId, setSelectedStoryId] = useState(null)

    return (
        <SettingsProvider storyId={selectedStoryId}>
            <AppContent
                onStorySelect={setSelectedStoryId}
                selectedStoryId={selectedStoryId}
            />
        </SettingsProvider>
    )
}

export default App
