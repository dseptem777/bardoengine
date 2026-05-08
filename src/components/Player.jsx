import { useState, useEffect, useCallback, useRef } from 'react'
import { scrollToBottomSmooth } from '../utils/readingScroll.js'
import { BookOpen, Settings, Save, Heart, Backpack, FastForward } from 'lucide-react'
import TextDisplay from './TextDisplay'
import ChoiceButton from './ChoiceButton'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { useUiSounds } from '../hooks/useUiSounds'
import { HeaderStats } from './StatsPanel'
import BossHPIndicator from './BossHPIndicator'
import ScrollGrabOverlay from './ScrollGrabOverlay'
import BossPhaseOverlay from './BossPhaseOverlay'
import { version as engineVersion } from '../../package.json'

export default function Player({
    text,
    choices,
    isEnded,
    onChoice,
    onRestart,
    onFinish,
    onBack,
    onSave,
    onLoad,
    onContinueFromSave = null,
    onLoadSave = null,
    onContinue,
    canContinue,
    continueLabel = null,
    onOptions,
    onToggleHistory,
    audio = null,
    // Branding
    gameTitle = null,
    // Settings props
    typewriterDelay = 30,
    fontSize = 'normal',
    autoAdvance = false,
    autoAdvanceDelay = 4,
    isMinigameActive = false,
    chapterBreakActive = false,
    hasPendingMinigame = false,
    onMinigameReady = null,
    minigameAutoStart = true,
    checkBurned = null,
    checkLocked = null,
    willpowerActive = false,
    choiceResistanceLevel = 'none',  // 'none', 'slow', 'normal', 'fast', 'extreme'
    onChoicesVisibleChange = null,   // Callback when choices visibility changes
    onWillpowerHintVisible = null,   // Callback when willpower mash hint is revealed
    // Genjutsu props
    genjutsuBreak = null,
    dominantStat = null,
    willpowerValue = 100,
    onBreakGenjutsu = null,
    onGenjutsuTypingComplete = null,
    // Layout props
    isMobile = false,
    hasDesktopStatsPanel = false,
    headerStatsProps = null,         // { stats, statsConfig, getAllStatsInfo }
    inventoryEnabled = false,
    onToggleInventory = null,
    inventoryItemCount = 0,
    relationshipsEnabled = false,
    onToggleRelationships = null,
    // Shared scroll ref (from useBardoEngine, used by scroll friction hook)
    scrollContainerRef: externalScrollRef = null,
    // Boss fight props
    bossState = null,
    scrollFriction = null,
    onScrollLock = null,
    onScrollUnlock = null,
    onBossPhaseComplete = null,
    onBossPlayerDeath = null,
    sabiduria = 10,
    // Deferred-tag segments for typewriter-synchronized SFX
    textSegments = null,
    onSegmentReached = null,
}) {
    // UI sounds — low-volume feedback on choice interactions
    const uiSounds = useUiSounds(audio)

    // If no text but has interactive content, skip typewriter
    const hasInteractiveContent = choices.length > 0 || isEnded
    const [isTyping, setIsTyping] = useState(text ? true : !hasInteractiveContent)
    const [fastForward, setFastForward] = useState(false)
    const autoAdvanceTimerRef = useRef(null)
    const interactiveRef = useRef(null)
    const choiceButtonRefs = useRef({})

    // Scroll handling refs — use external ref if provided (shared with scroll friction hook)
    const localScrollRef = useRef(null)
    const scrollContainerRef = externalScrollRef || localScrollRef
    const contentRef = useRef(null)
    const isStickyRef = useRef(true)

    // Auto-hide header state (mobile only)
    const [headerVisible, setHeaderVisible] = useState(true)
    const lastScrollTopRef = useRef(0)
    const scrollDeltaRef = useRef(0)

    // Handle user scroll to detect if they want to stick to bottom + auto-hide header
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
        // If user is within 50px of bottom, sticky is ON
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
        isStickyRef.current = isAtBottom

        // Auto-hide header on mobile
        if (isMobile) {
            const delta = scrollTop - lastScrollTopRef.current
            lastScrollTopRef.current = scrollTop

            // Accumulate scroll delta for threshold
            if (delta > 0) {
                // Scrolling down
                scrollDeltaRef.current = Math.max(0, scrollDeltaRef.current + delta)
                if (scrollDeltaRef.current > 30) {
                    setHeaderVisible(false)
                    scrollDeltaRef.current = 0
                }
            } else if (delta < 0) {
                // Scrolling up
                scrollDeltaRef.current = Math.min(0, scrollDeltaRef.current + delta)
                if (scrollDeltaRef.current < -10) {
                    setHeaderVisible(true)
                    scrollDeltaRef.current = 0
                }
            }

            // Always show header at top of page
            if (scrollTop < 10) {
                setHeaderVisible(true)
            }
        }
    }, [isMobile])

    // Setup resize observer for auto-scrolling
    // Disabled during scroll friction — player must scroll manually
    const scrollFrictionActive = scrollFriction?.isActive
    const scrollFrictionActiveRef = useRef(scrollFrictionActive)
    scrollFrictionActiveRef.current = scrollFrictionActive
    useEffect(() => {
        if (!contentRef.current || !scrollContainerRef.current) return

        const resizeObserver = new ResizeObserver(() => {
            if (scrollFrictionActiveRef.current) return
            if (isStickyRef.current && scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                    top: scrollContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                })
            }
        })

        resizeObserver.observe(contentRef.current)

        return () => resizeObserver.disconnect()
    }, [])

    // Expose scroll container ref to parent for scroll manipulation hooks
    useEffect(() => {
        if (bossState && scrollContainerRef.current) {
            // Make ref available externally via a data attribute
            scrollContainerRef.current.dataset.scrollRef = 'true'
        }
    }, [bossState])

    // During boss phases, hide gate choices [→] — they're auto-selected by phase mechanics.
    // Normal choices (like transition text) should still display.
    const isBossGateChoice = bossState?.isActive && choices.length === 1 && choices[0]?.text?.trim() === '→'

    useEffect(() => {
        // If no text but has interactive content, skip typewriter immediately
        if (!text && (choices.length > 0 || isEnded)) {
            setIsTyping(false)
        } else if (text) {
            setIsTyping(true)
            setFastForward(false)
            // Force stick to bottom when new text arrives
            isStickyRef.current = true
        }
    }, [text, choices.length, isEnded])

    // Cleanup auto-advance timer on unmount or text change
    useEffect(() => {
        return () => {
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current)
            }
        }
    }, [text])

    // Notify parent when choices visibility changes
    useEffect(() => {
        const areChoicesVisible = !isTyping && choices.length > 0
        if (onChoicesVisibleChange) {
            onChoicesVisibleChange(areChoicesVisible)
        }
    }, [isTyping, choices.length, onChoicesVisibleChange])

    const handleSkip = useCallback(() => {
        // Block skipping only when willpower bar is VISIBLE (active + choices present)
        // Before choices appear, text can still be skipped
        if (willpowerActive && choices.length > 0) {
            console.log('[Player] Text skip blocked - willpower active with choices')
            return
        }

        if (fastForward || !text || text.length < 100) {
            // Second press OR short text → instant skip
            setIsTyping(false)
            setFastForward(false)
        } else {
            // First press on long text → fast-forward (3ms/char, no punctuation pauses)
            setFastForward(true)
        }
    }, [willpowerActive, choices.length, fastForward, text])

    // Handle keyboard resistance - simulates clicking choice multiple times
    const handleResistanceKeyPress = useCallback((index) => {
        // Only first choice (resistir) has resistance, others (ceder) select immediately
        if (!willpowerActive || index !== 0) {
            onChoice(index)
            return
        }

        // Delegate to the choice button ref
        if (choiceButtonRefs.current[index]) {
            choiceButtonRefs.current[index].simulateClick()
        }
    }, [willpowerActive, onChoice])

    // Check if a choice is locked (for keyboard nav filtering)
    const isChoiceLocked = useCallback((index) => {
        if (!checkLocked || !choices[index]) return false
        const result = checkLocked(choices[index])
        return result?.locked ?? false
    }, [checkLocked, choices])

    // Wrap onChoice for keyboard nav to skip locked choices
    const onChoiceFiltered = useCallback((index) => {
        if (isChoiceLocked(index)) return
        onChoice(index)
    }, [onChoice, isChoiceLocked])

    // Keyboard navigation
    useKeyboardNavigation({
        choices,
        isTyping,
        isEnded,
        canContinue,
        onChoice: onChoiceFiltered,
        onSkip: handleSkip,
        onBack,
        onContinue,
        disabled: isMinigameActive || chapterBreakActive,
        resistanceActive: willpowerActive,
        onResistanceKeyPress: handleResistanceKeyPress
    })

    const handleTypingComplete = useCallback(() => {
        setIsTyping(false)

        // Notify genjutsu system that the fisura paragraph is fully visible and clickable
        if (genjutsuBreak && onGenjutsuTypingComplete) {
            onGenjutsuTypingComplete()
        }

        // Auto-start minigame if configured
        if (hasPendingMinigame && minigameAutoStart && onMinigameReady) {
            onMinigameReady()
            return
        }

        // Auto-advance: only if enabled, no choices, not ended, and onContinue exists
        if (autoAdvance && choices.length === 0 && !isEnded && onContinue) {
            autoAdvanceTimerRef.current = setTimeout(() => {
                onContinue()
            }, autoAdvanceDelay * 1000)
        }
    }, [autoAdvance, autoAdvanceDelay, choices.length, isEnded, onContinue, hasPendingMinigame, minigameAutoStart, onMinigameReady, genjutsuBreak, onGenjutsuTypingComplete])

    // After typing finishes, smooth-scroll to bottom so the choices land at
    // the read line (~65% Y) — same mechanism as the typewriter scroll, just
    // with a small delay to let choices/buttons mount first.
    useEffect(() => {
        if (!isTyping && scrollContainerRef.current) {
            const timer = setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollToBottomSmooth(scrollContainerRef.current)
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isTyping])

    // Cancel auto-advance if user interacts
    const cancelAutoAdvance = useCallback(() => {
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current)
            autoAdvanceTimerRef.current = null
        }
    }, [])

    const handleChoice = useCallback((index) => {
        cancelAutoAdvance()
        onChoice(index)
    }, [onChoice, cancelAutoAdvance])

    // Header transition classes
    const headerTransformClass = isMobile
        ? `transition-transform duration-300 ease-in-out ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`
        : ''

    return (
        <div className="h-screen flex flex-col bg-bardo-bg overflow-hidden transition-colors duration-500">
            {/* Header */}
            <header
                className={`flex-none border-b border-bardo-accent/20 bg-black/40 backdrop-blur-md z-30 ${headerTransformClass}`}
                style={{ padding: isMobile ? '0.625rem' : '1rem', paddingTop: isMobile ? 'calc(0.625rem + var(--safe-area-top, 0px))' : 'calc(1rem + var(--safe-area-top, 0px))' }}
            >
                <div
                    className="mx-auto flex justify-between items-center w-full"
                    style={{ maxWidth: 'var(--player-max-width, 48rem)' }}
                >
                    {/* Left side: title + mobile header stats */}
                    <div className="flex items-center gap-3 min-w-0">
                        <h1
                            className={`text-bardo-accent text-sm tracking-wider shrink-0 ${isMobile ? 'max-w-[8rem] truncate' : ''}`}
                            style={{ fontFamily: 'var(--bardo-font-mono)' }}
                        >
                            {gameTitle
                                ? gameTitle
                                : (isMobile ? 'BARDO' : `BARDO ENGINE v${engineVersion}`)
                            }
                        </h1>
                        {/* Compact viewports: value stats inline in header */}
                        {headerStatsProps && (
                            <HeaderStats {...headerStatsProps} />
                        )}
                    </div>

                    {/* Right side: buttons */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {onOptions && (
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => { uiSounds.onMenuOpen(); onToggleHistory?.() }}
                                    className="flex items-center gap-1.5 font-mono text-bardo-muted hover:text-bardo-accent text-sm transition-colors"
                                    title="Bitácora (L)"
                                >
                                    <BookOpen size={14} />
                                    {!isMobile && 'BITÁCORA'}
                                </button>
                                <button
                                    onClick={() => { uiSounds.onMenuOpen(); onOptions?.() }}
                                    className="flex items-center gap-1.5 font-mono text-bardo-muted hover:text-bardo-accent text-sm transition-colors"
                                    title="Opciones"
                                >
                                    <Settings size={14} />
                                    {!isMobile && 'OPCIONES'}
                                </button>
                            </div>
                        )}
                        {onSave && (
                            <button
                                onClick={() => { uiSounds.onSave(); onSave?.() }}
                                disabled={isMinigameActive}
                                className={`flex items-center gap-1.5 font-mono text-sm transition-colors ${isMinigameActive ? 'text-neutral-600 cursor-not-allowed' : 'text-bardo-muted hover:text-bardo-accent'}`}
                            >
                                <Save size={14} />
                                {!isMobile && 'GUARDAR/CARGAR'}
                            </button>
                        )}
                        {/* Mobile: relationships toggle in header */}
                        {isMobile && relationshipsEnabled && onToggleRelationships && (
                            <button
                                onClick={onToggleRelationships}
                                className="text-bardo-muted hover:text-bardo-accent transition-colors"
                                title="Relaciones"
                            >
                                <Heart size={16} />
                            </button>
                        )}
                        {/* Mobile: inventory toggle in header */}
                        {isMobile && inventoryEnabled && onToggleInventory && (
                            <button
                                onClick={onToggleInventory}
                                className="relative text-bardo-muted hover:text-bardo-accent transition-colors"
                                title="Inventario"
                            >
                                <Backpack size={16} />
                                {inventoryItemCount > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-bardo-accent text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {inventoryItemCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={onBack}
                            className="font-mono text-bardo-muted hover:text-bardo-accent text-sm transition-colors"
                        >
                            {isMobile ? '←' : '← MENÚ'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content area - PURE BLOCK LAYOUT, NO FLEXBOX */}
            {/* Hidden during immersive minigames (apnea) so their text doesn't overlap */}
            <main
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`flex-1 overflow-y-auto custom-scrollbar bg-bardo-bg ${isMinigameActive ? 'invisible' : ''}`}
            >
                {/*
                    Simple block container with fixed top padding.
                    Text starts at a fixed position and ONLY grows downward.
                    NO FLEXBOX = NO REDISTRIBUTION = NO BUMPING.
                */}
                <div
                    ref={contentRef}
                    className={`w-full px-4 sm:px-6 md:px-12 pt-[10vh] sm:pt-[15vh] pb-[35vh] ${hasDesktopStatsPanel ? '' : 'mx-auto'}`}
                    style={hasDesktopStatsPanel ? {
                        maxWidth: 'var(--player-max-width, 48rem)',
                        marginLeft: 'max(calc((100% - var(--player-max-width, 48rem)) / 2), var(--stats-panel-inset, 260px))',
                        marginRight: 'auto',
                    } : { maxWidth: 'var(--player-max-width, 48rem)' }}
                >
                    {/* Text area - Fixed position from top, grows downward only */}
                    <div
                        className="mb-12 cursor-pointer"
                        onClick={handleSkip}
                    >
                        <TextDisplay
                            text={text}
                            isTyping={isTyping}
                            fastForward={fastForward}
                            onComplete={handleTypingComplete}
                            typewriterDelay={typewriterDelay}
                            fontSize={fontSize}
                            seekString={willpowerActive ? '[PRESIONÁ' : null}
                            onStringFound={onWillpowerHintVisible}
                            genjutsuBreak={genjutsuBreak}
                            dominantStat={dominantStat}
                            willpowerValue={willpowerValue}
                            onBreakGenjutsu={onBreakGenjutsu}
                            scrollContainerRef={scrollContainerRef}
                            paused={chapterBreakActive}
                            segments={textSegments}
                            onSegmentReached={onSegmentReached}
                        />
                    </div>

                    {/* Choices & Footer Area - Scroll target when typing completes */}
                    <div ref={interactiveRef} className="mt-8 choice-container">
                        {/* Choices - Appear below text, no layout impact on text above */}
                        {/* Hide gate choices [→] during boss — they're auto-selected by phase mechanics */}
                        {!isTyping && !hasPendingMinigame && choices.length > 0 && !isBossGateChoice && (
                            <div className="space-y-4">
                                {choices.map((choice, index) => {
                                    const lockResult = checkLocked ? checkLocked(choice) : null
                                    const isLocked = lockResult?.locked ?? false
                                    const cleanText = choice.text?.replace(/\s*#\s*REQUIRES:.*$/i, '') ?? ''
                                    return (
                                        <ChoiceButton
                                            key={index}
                                            ref={(el) => { choiceButtonRefs.current[index] = el }}
                                            text={cleanText}
                                            index={index}
                                            onClick={() => handleChoice(index)}
                                            disabled={checkBurned ? checkBurned(choice) : false}
                                            lockedRequirement={isLocked ? lockResult.displayText : null}
                                            // Last choice (resistir) has resistance, first (ceder) is easy
                                            resistanceLevel={willpowerActive && index === choices.length - 1 ? choiceResistanceLevel : 'none'}
                                            onHover={uiSounds.onChoiceHover}
                                            onClickSound={uiSounds.onChoiceClick}
                                        />
                                    )
                                })}
                            </div>
                        )}

                        {/* Controls Footer */}
                        {!isTyping && (
                            <div className="mt-8">
                                {/* Pagination or Minigame Start */}
                                {((choices.length === 0 && canContinue) || (hasPendingMinigame && !minigameAutoStart)) && !isEnded && (
                                    <div className="flex justify-center">
                                        <button
                                            onClick={hasPendingMinigame ? onMinigameReady : onContinue}
                                            className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-bardo-accent/10 border border-bardo-accent text-bardo-accent font-mono text-lg hover:bg-bardo-accent hover:text-bardo-bg transition-all duration-300 rounded overflow-hidden"
                                        >
                                            <span className="relative z-10 tracking-widest uppercase">
                                                {hasPendingMinigame ? 'Comenzar Juego' : (continueLabel || 'Siguiente')}
                                            </span>
                                            <span className="relative z-10 text-xl group-hover:translate-x-1 transition-transform duration-300">
                                                {hasPendingMinigame ? '◈' : '❱'}
                                            </span>
                                            <div className="absolute inset-0 bg-bardo-accent/20 animate-pulse" />
                                        </button>
                                    </div>
                                )}

                                {/* End state */}
                                {isEnded && (
                                    <div className="pt-8 space-y-4 w-full border-t border-bardo-accent/10">
                                        <p className="font-mono text-bardo-muted text-sm text-center">
                                            ─── FIN ───
                                        </p>
                                        <div className="w-full flex justify-center">
                                            <div className="inline-flex gap-4 items-center flex-wrap justify-center">
                                                <button
                                                    onClick={onRestart}
                                                    className="min-w-[140px] px-6 py-3 bg-bardo-accent text-bardo-bg font-mono hover:brightness-110 transition-all rounded text-center"
                                                >
                                                    NUEVO JUEGO
                                                </button>
                                                {onContinueFromSave && (
                                                    <button
                                                        onClick={onContinueFromSave}
                                                        className="min-w-[140px] px-6 py-3 bg-blue-600 text-white font-mono hover:bg-blue-500 transition-colors rounded text-center"
                                                    >
                                                        CONTINUAR
                                                    </button>
                                                )}
                                                {onLoadSave && (
                                                    <button
                                                        onClick={onLoadSave}
                                                        className="min-w-[140px] px-6 py-3 border border-bardo-accent text-bardo-accent font-mono hover:bg-bardo-accent hover:text-bardo-bg transition-colors rounded text-center"
                                                    >
                                                        CARGAR PARTIDA
                                                    </button>
                                                )}
                                                <button
                                                    onClick={onBack}
                                                    className="min-w-[140px] px-6 py-3 border border-bardo-muted/50 text-bardo-muted font-mono hover:bg-bardo-muted/20 transition-colors rounded text-center"
                                                >
                                                    MENÚ
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Boss HP Indicator */}
            {bossState && (
                <BossHPIndicator
                    bossName={bossState.bossName}
                    bossHp={bossState.bossHp}
                    bossMaxHp={bossState.bossMaxHp}
                    phase={bossState.phase}
                    isActive={bossState.isActive}
                />
            )}

            {/* Shadow Hands Overlay (Phase 2) */}
            <ScrollGrabOverlay
                active={bossState?.phase === 'phase_2'}
                textReady={!isTyping}
                onScrollLock={onScrollLock}
                onScrollUnlock={onScrollUnlock}
                onPhaseComplete={() => onBossPhaseComplete?.(15)}
                onPhaseFail={() => onBossPlayerDeath?.()}
                onDrainHp={(amount) => {
                    // HP drain while grabbed — visual feedback only (damage dealt at phase end)
                }}
            />

            {/* Boss Phase Overlay (Phase 1: Errata Hunt, Phase 3: Viewport Collapse) */}
            <BossPhaseOverlay
                phase={bossState?.phase}
                sabiduria={sabiduria}
                textReady={!isTyping}
                onPhaseComplete={onBossPhaseComplete}
                onPlayerDeath={onBossPlayerDeath}
                bossHp={bossState?.bossHp ?? 100}
            />

            {/* Arrebatados visual layer */}
            {scrollFriction?.isActive && scrollFriction.arrebatadosElements?.length > 0 && (
                <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
                    {scrollFriction.arrebatadosElements.map((el, idx) => (
                        <div
                            key={el.id}
                            className="absolute font-mono text-red-900/40 text-sm whitespace-nowrap animate-pulse"
                            style={{
                                top: `${20 + (el.paragraphIndex * 15)}%`,
                                left: `${10 + ((idx * 17) % 70)}%`,
                                transform: `rotate(${(idx * 3 - 4)}deg)`,
                                textShadow: '0 0 10px rgba(139,0,0,0.3)',
                            }}
                        >
                            {el.text}
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Indicators - OUTSIDE main, truly fixed at viewport level */}
            {isTyping && typewriterDelay > 0 && !(willpowerActive && choices.length > 0) && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
                    <div className="px-5 py-2.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-full shadow-2xl">
                        <p className="text-bardo-muted font-mono text-[10px] md:text-xs animate-pulse tracking-widest uppercase text-center font-bold">
                            {fastForward
                                ? 'Presioná de nuevo para saltar'
                                : 'Presioná una tecla para continuar'}
                        </p>
                    </div>
                </div>
            )}

            {!isTyping && autoAdvance && choices.length === 0 && !isEnded && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
                    <div className="px-5 py-2.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-full shadow-2xl">
                        <p className="text-bardo-muted font-mono text-[10px] md:text-xs animate-pulse text-center font-bold tracking-tight">
                            <FastForward size={10} className="inline mr-1" /> AUTO-AVANCE EN <span className="text-bardo-accent">{autoAdvanceDelay}s</span>...
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
