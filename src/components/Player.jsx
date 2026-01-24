import { useState, useEffect, useCallback, useRef } from 'react'
import TextDisplay from './TextDisplay'
import ChoiceButton from './ChoiceButton'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'

export default function Player({
    text,
    choices,
    isEnded,
    onChoice,
    onRestart,
    onFinish,
    onBack,
    onSave,
    onContinue,
    canContinue,
    onOptions,
    onToggleHistory,
    // Settings props
    typewriterDelay = 30,
    fontSize = 'normal',
    autoAdvance = false,
    autoAdvanceDelay = 4,
    isMinigameActive = false,
    hasPendingMinigame = false,
    onMinigameReady = null,
    minigameAutoStart = true,
}) {
    // If no text but has interactive content, skip typewriter
    const hasInteractiveContent = choices.length > 0 || isEnded
    const [isTyping, setIsTyping] = useState(text ? true : !hasInteractiveContent)
    const autoAdvanceTimerRef = useRef(null)
    const interactiveRef = useRef(null)

    // Scroll handling refs
    const scrollContainerRef = useRef(null)
    const contentRef = useRef(null)
    const isStickyRef = useRef(true)

    // Handle user scroll to detect if they want to stick to bottom
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
        // If user is within 50px of bottom, sticky is ON
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
        isStickyRef.current = isAtBottom
    }, [])

    // Setup resize observer for auto-scrolling
    useEffect(() => {
        if (!contentRef.current || !scrollContainerRef.current) return

        const resizeObserver = new ResizeObserver(() => {
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

    useEffect(() => {
        // If no text but has interactive content, skip typewriter immediately
        if (!text && (choices.length > 0 || isEnded)) {
            setIsTyping(false)
        } else if (text) {
            setIsTyping(true)
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

    const handleSkip = useCallback(() => {
        setIsTyping(false)
    }, [])

    // Keyboard navigation

    // Keyboard navigation
    useKeyboardNavigation({
        choices,
        isTyping,
        isEnded,
        onChoice,
        onSkip: handleSkip,
        onBack,
        disabled: isMinigameActive
    })

    const handleTypingComplete = useCallback(() => {
        setIsTyping(false)

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
    }, [autoAdvance, autoAdvanceDelay, choices.length, isEnded, onContinue, hasPendingMinigame, minigameAutoStart, onMinigameReady])

    // Scroll to interactive area when typing finishes
    useEffect(() => {
        if (!isTyping && interactiveRef.current && typeof interactiveRef.current.scrollIntoView === 'function') {
            // Delay slightly to ensure DOM has rendered the choices/buttons
            const timer = setTimeout(() => {
                interactiveRef.current.scrollIntoView({
                    block: 'center',
                    behavior: 'smooth'
                })
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

    return (
        <div className="h-screen flex flex-col bg-bardo-bg overflow-hidden transition-colors duration-500">
            {/* Header */}
            <header className="flex-none p-4 border-b border-bardo-accent/20 bg-black/40 backdrop-blur-md">
                <div
                    className="mx-auto flex justify-between items-center w-full"
                    style={{ maxWidth: 'var(--player-max-width, 48rem)' }}
                >
                    <h1
                        className="text-bardo-accent text-sm tracking-wider"
                        style={{ fontFamily: 'var(--bardo-font-mono)' }}
                    >
                        BARDO ENGINE v0.9.0
                    </h1>
                    <div className="flex items-center gap-4">
                        {onOptions && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onToggleHistory}
                                    className="p-2 text-white/60 hover:text-bardo-accent hover:bg-white/5 rounded-full transition-all group"
                                    title="Bitácora (L)"
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform inline-block">📖</span>
                                </button>
                                <button
                                    onClick={onOptions}
                                    className="p-2 text-white/60 hover:text-bardo-accent hover:bg-white/5 rounded-full transition-all group"
                                    title="Opciones"
                                >
                                    <span className="text-xl group-hover:rotate-90 transition-transform duration-500 inline-block">⚙️</span>
                                </button>
                            </div>
                        )}
                        {onSave && (
                            <button
                                onClick={onSave}
                                className="font-mono text-bardo-muted hover:text-bardo-accent text-sm transition-colors"
                            >
                                💾 GUARDAR
                            </button>
                        )}
                        <button
                            onClick={onBack}
                            className="font-mono text-bardo-muted hover:text-bardo-accent text-sm transition-colors"
                        >
                            ← MENÚ
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content area - PURE BLOCK LAYOUT, NO FLEXBOX */}
            <main
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar bg-bardo-bg"
            >
                {/* 
                    Simple block container with fixed top padding.
                    Text starts at a fixed position and ONLY grows downward.
                    NO FLEXBOX = NO REDISTRIBUTION = NO BUMPING.
                */}
                <div
                    ref={contentRef}
                    className="mx-auto w-full px-6 md:px-12 pt-[15vh] pb-[20vh]"
                    style={{ maxWidth: 'var(--player-max-width, 48rem)' }}
                >
                    {/* Text area - Fixed position from top, grows downward only */}
                    <div
                        className="mb-12 cursor-pointer"
                        onClick={handleSkip}
                    >
                        <TextDisplay
                            text={text}
                            isTyping={isTyping}
                            onComplete={handleTypingComplete}
                            typewriterDelay={typewriterDelay}
                            fontSize={fontSize}
                        />
                    </div>

                    {/* Choices & Footer Area - Scroll target when typing completes */}
                    <div ref={interactiveRef} className="mt-8">
                        {/* Choices - Appear below text, no layout impact on text above */}
                        {!isTyping && !hasPendingMinigame && choices.length > 0 && (
                            <div className="space-y-4">
                                {choices.map((choice, index) => (
                                    <ChoiceButton
                                        key={index}
                                        text={choice.text}
                                        index={index}
                                        onClick={() => handleChoice(index)}
                                    />
                                ))}
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
                                                {hasPendingMinigame ? 'Comenzar Juego' : 'Siguiente'}
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
                                                    REINICIAR
                                                </button>
                                                <button
                                                    onClick={onFinish}
                                                    className="min-w-[140px] px-6 py-3 bg-green-600 text-white font-mono hover:bg-green-500 transition-colors rounded text-center"
                                                >
                                                    ✓ FINALIZAR
                                                </button>
                                                <button
                                                    onClick={onBack}
                                                    className="min-w-[140px] px-6 py-3 border border-bardo-accent text-bardo-accent font-mono hover:bg-bardo-accent hover:text-bardo-bg transition-colors rounded text-center"
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

            {/* Footer - flex-none to stay at bottom */}
            <footer className="flex-none p-4 border-t border-bardo-accent/10">
                <p className="text-center font-mono text-bardo-muted/50 text-xs">
                    Powered by Ink • © BardoEngine
                </p>
            </footer>

            {/* Floating Indicators - OUTSIDE main, truly fixed at viewport level */}
            {isTyping && typewriterDelay > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
                    <div className="px-5 py-2.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-full shadow-2xl">
                        <p className="text-bardo-muted font-mono text-[10px] md:text-xs animate-pulse tracking-widest uppercase text-center font-bold">
                            Presioná una tecla para continuar
                        </p>
                    </div>
                </div>
            )}

            {!isTyping && autoAdvance && choices.length === 0 && !isEnded && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
                    <div className="px-5 py-2.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-full shadow-2xl">
                        <p className="text-bardo-muted font-mono text-[10px] md:text-xs animate-pulse text-center font-bold tracking-tight">
                            ⏩ AUTO-AVANCE EN <span className="text-bardo-accent">{autoAdvanceDelay}s</span>...
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
