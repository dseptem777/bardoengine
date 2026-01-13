import { useState, useEffect, useRef } from 'react'

export default function TextDisplay({ text, isTyping, onComplete }) {
    const [displayedText, setDisplayedText] = useState('')
    const indexRef = useRef(0)
    const intervalRef = useRef(null)

    useEffect(() => {
        // Reset on new text
        setDisplayedText('')
        indexRef.current = 0

        if (!text) return

        if (!isTyping) {
            // Skip to full text immediately
            setDisplayedText(text)
            onComplete?.()
            return
        }

        // Typewriter effect
        intervalRef.current = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText(text.slice(0, indexRef.current + 1))
                indexRef.current++
            } else {
                clearInterval(intervalRef.current)
                onComplete?.()
            }
        }, 30)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [text, isTyping, onComplete])

    // Skip effect when isTyping changes to false
    useEffect(() => {
        if (!isTyping && text) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            setDisplayedText(text)
        }
    }, [isTyping, text])

    return (
        <div className="relative">
            <p className="font-narrative text-xl md:text-2xl leading-relaxed text-bardo-text">
                {displayedText}
                {isTyping && displayedText.length < text.length && (
                    <span className="inline-block w-2 h-6 bg-bardo-accent ml-1 animate-pulse" />
                )}
            </p>
        </div>
    )
}
