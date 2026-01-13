import { useState, useEffect, useCallback } from 'react'
import TextDisplay from './TextDisplay'
import ChoiceButton from './ChoiceButton'

export default function Player({ text, choices, isEnded, onChoice, onRestart, onBack }) {
    // If no text but has interactive content, skip typewriter
    const hasInteractiveContent = choices.length > 0 || isEnded
    const [isTyping, setIsTyping] = useState(text ? true : !hasInteractiveContent)

    useEffect(() => {
        // If no text but has interactive content, skip typewriter immediately
        if (!text && (choices.length > 0 || isEnded)) {
            setIsTyping(false)
        } else if (text) {
            setIsTyping(true)
        }
    }, [text, choices.length, isEnded])

    const handleSkip = useCallback(() => {
        setIsTyping(false)
    }, [])

    const handleTypingComplete = useCallback(() => {
        setIsTyping(false)
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-bardo-accent/20">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <h1 className="font-mono text-bardo-accent text-sm tracking-wider">
                        BARDOENGINE v1.0
                    </h1>
                    <button
                        onClick={onBack}
                        className="font-mono text-bardo-muted hover:text-bardo-accent text-sm transition-colors"
                    >
                        ← MENÚ
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center p-4 md:p-8">
                <div className="max-w-3xl mx-auto w-full">
                    {/* Text area */}
                    <div
                        className="mb-8 cursor-pointer"
                        onClick={handleSkip}
                    >
                        <TextDisplay
                            text={text}
                            isTyping={isTyping}
                            onComplete={handleTypingComplete}
                        />
                    </div>

                    {/* Choices */}
                    {!isTyping && (
                        <div className="space-y-3">
                            {choices.map((choice, index) => (
                                <ChoiceButton
                                    key={index}
                                    text={choice.text}
                                    index={index}
                                    onClick={() => onChoice(index)}
                                />
                            ))}

                            {/* End state */}
                            {isEnded && (
                                <div className="text-center pt-8 space-y-4">
                                    <p className="font-mono text-bardo-muted text-sm">
                                        ─── FIN ───
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={onRestart}
                                            className="px-6 py-3 bg-bardo-accent text-bardo-bg font-mono 
                                 hover:bg-yellow-400 transition-colors rounded"
                                        >
                                            REINICIAR
                                        </button>
                                        <button
                                            onClick={onBack}
                                            className="px-6 py-3 border border-bardo-accent text-bardo-accent font-mono 
                                 hover:bg-bardo-accent hover:text-bardo-bg transition-colors rounded"
                                        >
                                            MENÚ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Typing indicator */}
                    {isTyping && (
                        <p className="text-bardo-muted font-mono text-sm animate-pulse">
                            Click para continuar...
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
