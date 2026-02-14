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
    fontSize = 'normal',
    seekString = null,     // Optional string to look for
    onStringFound = null   // Callback when seekString is revealed
}) {
    const [displayedText, setDisplayedText] = useState('')
    const hasFoundRef = useRef(false)
    const indexRef = useRef(0)
    const timeoutRef = useRef(null)
    const anchorRef = useRef(null)
    const currentTextRef = useRef('')  // Track which text we're currently typing
    const typewriterProgressedRef = useRef(false)  // True only AFTER first char is typed

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

        // Reset everything on new text
        setDisplayedText('')
        indexRef.current = 0
        currentTextRef.current = text || ''  // Track the new text
        typewriterProgressedRef.current = false  // Reset - typewriter hasn't progressed yet

        if (!text) return

        // If not typing OR typewriter delay is 0 (instant), show full text immediately
        if (!isTyping || typewriterDelay === 0) {
            setDisplayedText(text)
            typewriterProgressedRef.current = true  // Mark as progressed for instant text
            onCompleteRef.current?.()
            return
        }

        const typeChar = () => {
            if (indexRef.current < text.length) {
                const currentChar = text[indexRef.current]
                indexRef.current++
                const newDisplayed = text.slice(0, indexRef.current)
                setDisplayedText(newDisplayed)

                // Mark as progressed AFTER setting displayed text
                // This ensures detection sees the correct state
                typewriterProgressedRef.current = true

                // Dynamic rhythm logic
                let dynamicDelay = typewriterDelay
                if (['.', '?', '!'].includes(currentChar)) {
                    dynamicDelay = typewriterDelay * 12
                } else if ([',', ';', ':'].includes(currentChar)) {
                    dynamicDelay = typewriterDelay * 5
                }

                timeoutRef.current = setTimeout(typeChar, dynamicDelay)
            } else {
                onCompleteRef.current?.()
            }
        }

        // Start typing with a small delay to let React settle
        timeoutRef.current = setTimeout(typeChar, 10)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [text, isTyping, typewriterDelay])

    // Skip effect when isTyping changes to false (user clicked to skip)
    useEffect(() => {
        if (!isTyping && text) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            setDisplayedText(text)
            typewriterProgressedRef.current = true  // Mark as progressed since we showed full text
        }
    }, [isTyping, text])

    // Detect seekString visibility - ONLY when typewriter has naturally reached it
    useEffect(() => {
        if (!seekString || !onStringFound || hasFoundRef.current) return

        // Critical check: Only detect if we're typing the CURRENT text
        // and the typewriter has actually progressed for this text
        if (!typewriterProgressedRef.current) return
        if (currentTextRef.current !== text) return  // Text changed, ignore stale displayedText

        // Verify displayedText is a valid prefix of the current text
        if (!text.startsWith(displayedText)) return

        const seekIdx = displayedText.indexOf(seekString.trim())
        if (seekIdx !== -1) {
            console.log('[TextDisplay] HINT REVEALED:', seekString, 'at char', seekIdx, '/', displayedText.length)
            hasFoundRef.current = true
            onStringFound(seekString)
        }
    }, [displayedText, seekString, onStringFound, text])

    // Reset flag when text changes
    useEffect(() => {
        hasFoundRef.current = false
    }, [text])

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
                        data-paragraph-index={i}
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
