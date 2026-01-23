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

    useEffect(() => {
        // If no text but has interactive content, skip typewriter immediately
        if (!text && (choices.length > 0 || isEnded)) {
            setIsTyping(false)
        } else if (text) {
            setIsTyping(true)
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
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-bardo-accent/20">
                <div
                    className="mx-auto flex justify-between items-center w-full transition-all duration-500"
                    style={{ maxWidth: 'var(--player-max-width, 48rem)' }}
                >
                    <h1
                        className="text-bardo-accent text-sm tracking-wider"
                        style={{ fontFamily: 'var(--bardo-font-mono)' }}
                    >
                        BARDOENGINE v1.0
                    </h1>
                    <div className="flex items-center gap-4">
                        {onOptions && (
                            <button
                                onClick={onOptions}
                                className="font-mono text-bardo-muted hover:text-bardo-accent text-sm transition-colors"
                                title="Opciones"
                            >
                                ⚙️
                            </button>
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

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center p-4 md:p-8">
                <div
                    className="mx-auto w-full transition-all duration-500"
                    style={{ maxWidth: 'var(--player-max-width, 48rem)' }}
                >
                    {/* Text area */}
                    <div
                        className="mb-8 cursor-pointer"
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

                    {/* Choices - Hidden if a minigame is pending */}
                    {!isTyping && !hasPendingMinigame && (
                        <div className="space-y-3">
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
                        <div className="space-y-3">

                            {/* Pagination or Minigame Start (only if not auto-starting) */}
                            {((choices.length === 0 && canContinue) || (hasPendingMinigame && !minigameAutoStart)) && !isEnded && (
                                <div className="pt-4 flex justify-center">
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
                                        {/* Retro pulse effect */}
                                        <div className="absolute inset-0 bg-bardo-accent/20 animate-pulse" />
                                    </button>
                                </div>
                            )}

                            {/* End state */}
                            {isEnded && (
                                <div className="pt-8 space-y-4 w-full">
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

                    {/* Typing indicator */}
                    {isTyping && typewriterDelay > 0 && (
                        <p className="text-bardo-muted font-mono text-sm animate-pulse">
                            Presiona cualquier tecla o click para continuar...
                        </p>
                    )}

                    {/* Auto-advance indicator */}
                    {!isTyping && autoAdvance && choices.length === 0 && !isEnded && (
                        <p className="text-bardo-muted font-mono text-xs animate-pulse mt-4">
                            ⏩ Auto-avance en {autoAdvanceDelay}s...
                        </p>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-4 border-t border-bardo-accent/10">
                <p className="text-center font-mono text-bardo-muted/50 text-xs">
                    Powered by Ink • © BardoEngine
                </p>
            </footer>
        </div>
    )
}
