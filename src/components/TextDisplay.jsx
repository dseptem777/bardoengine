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
    const timeoutRef = useRef(null)
    const anchorRef = useRef(null)

    // Store onComplete in a ref to avoid re-triggering the effect when callback changes
    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    // Split text into paragraphs for rendering
    const paragraphs = displayedText.split('\n').filter(p => p.trim().length > 0 || p.length > 0)

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        // Reset on new text
        setDisplayedText('')
        indexRef.current = 0

        if (!text) return

        // If not typing OR typewriter delay is 0 (instant), show full text immediately
        if (!isTyping || typewriterDelay === 0) {
            setDisplayedText(text)
            onCompleteRef.current?.()
            return
        }

        const typeChar = () => {
            if (indexRef.current < text.length) {
                const currentChar = text[indexRef.current]
                setDisplayedText(text.slice(0, indexRef.current + 1))
                indexRef.current++

                // Dynamic rhythm logic
                // Calculate delay for next character based on current character punctuation
                let dynamicDelay = typewriterDelay

                // Pause on sentence endings
                if (['.', '?', '!'].includes(currentChar)) {
                    dynamicDelay = typewriterDelay * 12
                }
                // Short pause on commas
                else if ([',', ';', ':'].includes(currentChar)) {
                    dynamicDelay = typewriterDelay * 5
                }

                timeoutRef.current = setTimeout(typeChar, dynamicDelay)
            } else {
                onCompleteRef.current?.()
            }
        }

        // Start typing
        typeChar()

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [text, isTyping, typewriterDelay]) // Removed onComplete from deps

    // Skip effect when isTyping changes to false (user clicked to skip)
    useEffect(() => {
        if (!isTyping && text) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            setDisplayedText(text)
        }
    }, [isTyping, text])

    // Auto-scroll logic: scroll the anchor (bottom of text) into view while typing
    useEffect(() => {
        if (isTyping && anchorRef.current && typeof anchorRef.current.scrollIntoView === 'function') {
            // Using 'block: center' keeps the active typing line near the middle of the screen
            // providing natural padding at the bottom.
            anchorRef.current.scrollIntoView({
                block: 'center',
                behavior: 'auto'
            })
        }
    }, [displayedText, isTyping])

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

            {/* Scroll anchor: invisible element that moves with the text */}
            <div ref={anchorRef} className="h-px w-full pointer-events-none opacity-0" aria-hidden="true" />
        </div>
    )
}
