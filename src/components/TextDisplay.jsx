import { useState, useEffect, useRef } from 'react'

// Font size classes mapping
const FONT_SIZE_CLASSES = {
    small: 'text-lg md:text-xl',
    normal: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-3xl',
}

export default function TextDisplay({
    text,
    isTyping,
    onComplete,
    typewriterDelay = 30, // 0 = instant
    fontSize = 'normal'
}) {
    const [displayedText, setDisplayedText] = useState('')
    const indexRef = useRef(0)
    const intervalRef = useRef(null)

    // Split text into paragraphs for rendering
    const paragraphs = displayedText.split('\n').filter(p => p.trim().length > 0 || p.length > 0)

    useEffect(() => {
        // Reset on new text
        setDisplayedText('')
        indexRef.current = 0

        if (!text) return

        // If not typing OR typewriter delay is 0 (instant), show full text immediately
        if (!isTyping || typewriterDelay === 0) {
            setDisplayedText(text)
            onComplete?.()
            return
        }

        // Typewriter effect with configurable delay
        intervalRef.current = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText(text.slice(0, indexRef.current + 1))
                indexRef.current++
            } else {
                clearInterval(intervalRef.current)
                onComplete?.()
            }
        }, typewriterDelay)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [text, isTyping, onComplete, typewriterDelay])

    // Skip effect when isTyping changes to false
    useEffect(() => {
        if (!isTyping && text) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            setDisplayedText(text)
        }
    }, [isTyping, text])

    const fontSizeClass = FONT_SIZE_CLASSES[fontSize] || FONT_SIZE_CLASSES.normal

    return (
        <div
            className="relative select-none cursor-pointer space-y-6"
            style={{
                textAlign: 'var(--player-text-align, left)',
                fontFamily: 'var(--bardo-font-main)'
            }}
        >
            {paragraphs.length > 0 ? (
                paragraphs.map((para, i) => (
                    <p
                        key={i}
                        className={`font-narrative ${fontSizeClass} leading-relaxed text-bardo-text`}
                    >
                        {para}
                        {/* Show cursor only on the last paragraph being typed */}
                        {isTyping &&
                            typewriterDelay > 0 &&
                            i === paragraphs.length - 1 &&
                            displayedText.length < text.length && (
                                <span className="inline-block w-2 h-6 bg-bardo-accent ml-1 animate-pulse" />
                            )}
                    </p>
                ))
            ) : (
                // Fallback for empty/initial state to maintain layout
                <p className={`font-narrative ${fontSizeClass} leading-relaxed opacity-0`}>&nbsp;</p>
            )}
        </div>
    )
}

