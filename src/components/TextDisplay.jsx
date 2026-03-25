import { useState, useEffect, useRef } from 'react'

// Font size classes mapping
const FONT_SIZE_CLASSES = {
    small: 'text-lg md:text-xl',
    normal: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-3xl',
}

// Characters to reveal per animation frame during fast-forward
const FAST_FORWARD_CHARS_PER_FRAME = 8

function getGenjutsuOpacity(wp) {
    if (wp > 70) return 0.15
    if (wp > 30) return 0.15 + (70 - wp) / 40 * 0.25  // 0.15 → 0.40
    return 0.40 + (30 - wp) / 30 * 0.30  // 0.40 → 0.70
}

export default function TextDisplay({
    text,
    isTyping,
    fastForward = false,
    onComplete,
    typewriterDelay = 30, // 0 = instant
    fontSize = 'normal',
    seekString = null,     // Optional string to look for
    onStringFound = null,  // Callback when seekString is revealed
    // Genjutsu system
    genjutsuBreak = null,      // { stat: string, text: string } | null
    dominantStat = null,       // string | null
    willpowerValue = 100,      // 0-100
    onBreakGenjutsu = null,    // () => void
}) {
    const [displayedText, setDisplayedText] = useState('')
    const hasFoundRef = useRef(false)
    const indexRef = useRef(0)
    const timeoutRef = useRef(null)
    const rafRef = useRef(null)           // rAF ID for fast-forward loop
    const anchorRef = useRef(null)
    const currentTextRef = useRef('')  // Track which text we're currently typing
    const typewriterProgressedRef = useRef(false)  // True only AFTER first char is typed
    const fastForwardRef = useRef(false)

    // Store onComplete in a ref to avoid re-triggering the effect when callback changes
    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    // Fast-forward: when activated, kill the slow timeout loop and switch to rAF chunk loop
    useEffect(() => {
        const wasOff = !fastForwardRef.current
        fastForwardRef.current = fastForward

        if (fastForward && wasOff && text && indexRef.current < text.length) {
            // Kill the normal typewriter timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }

            // Start rAF chunk loop
            const fastLoop = () => {
                if (indexRef.current >= text.length) {
                    onCompleteRef.current?.()
                    return
                }

                // Advance by N chars per frame
                indexRef.current = Math.min(indexRef.current + FAST_FORWARD_CHARS_PER_FRAME, text.length)
                setDisplayedText(text.slice(0, indexRef.current))
                typewriterProgressedRef.current = true

                rafRef.current = requestAnimationFrame(fastLoop)
            }

            rafRef.current = requestAnimationFrame(fastLoop)
        }

        // Cleanup rAF if fast-forward is turned off
        if (!fastForward && rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }, [fastForward, text])

    // Split text into paragraphs for rendering
    const paragraphs = displayedText.split('\n').filter(p => p.trim().length > 0 || p.length > 0)

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        // Clear any fast-forward rAF
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }

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
            if (indexRef.current >= text.length) {
                onCompleteRef.current?.()
                return
            }

            // If fast-forward activated mid-typing, don't continue the slow loop
            // (the rAF loop from the fastForward effect takes over)
            if (fastForwardRef.current) return

            const currentChar = text[indexRef.current]
            indexRef.current++
            setDisplayedText(text.slice(0, indexRef.current))
            typewriterProgressedRef.current = true

            // Dynamic rhythm logic
            let dynamicDelay = typewriterDelay
            if (['.', '?', '!'].includes(currentChar)) {
                dynamicDelay = typewriterDelay * 12
            } else if ([',', ';', ':'].includes(currentChar)) {
                dynamicDelay = typewriterDelay * 5
            }

            timeoutRef.current = setTimeout(typeChar, dynamicDelay)
        }

        // Start typing with a small delay to let React settle
        timeoutRef.current = setTimeout(typeChar, 10)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [text, isTyping, typewriterDelay])

    // Skip effect when isTyping changes to false (user clicked to skip)
    useEffect(() => {
        if (!isTyping && text) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
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

    // Auto-scroll logic: throttled to avoid per-character layout thrashing
    const scrollRafRef = useRef(null)
    useEffect(() => {
        if (isTyping && anchorRef.current && typeof anchorRef.current.scrollIntoView === 'function') {
            if (!scrollRafRef.current) {
                scrollRafRef.current = requestAnimationFrame(() => {
                    scrollRafRef.current = null
                    if (anchorRef.current) {
                        anchorRef.current.scrollIntoView({
                            block: 'center',
                            behavior: 'auto'
                        })
                    }
                })
            }
        }
        return () => {
            if (scrollRafRef.current) {
                cancelAnimationFrame(scrollRafRef.current)
                scrollRafRef.current = null
            }
        }
    }, [displayedText, isTyping])

    const fontSizeClass = FONT_SIZE_CLASSES[fontSize] || FONT_SIZE_CLASSES.normal

    return (
        <div
            className="relative cursor-default space-y-6"
            style={{
                textAlign: 'var(--player-text-align, left)',
                fontFamily: 'var(--bardo-font-main)'
            }}
        >
            {paragraphs.length > 0 ? (
                paragraphs.map((para, i) => {
                    const isGenjutsuTarget =
                        genjutsuBreak &&
                        dominantStat &&
                        onBreakGenjutsu &&
                        dominantStat === genjutsuBreak.stat &&
                        para.trim() === genjutsuBreak.text.trim()

                    const genjutsuStyle = isGenjutsuTarget ? {
                        textDecoration: 'underline dotted',
                        textUnderlineOffset: '4px',
                        opacity: getGenjutsuOpacity(willpowerValue),
                        filter: `drop-shadow(0 0 ${8 - willpowerValue / 100 * 6}px rgba(220, 38, 38, ${getGenjutsuOpacity(willpowerValue)}))`,
                        transition: 'opacity 500ms ease, filter 500ms ease',
                    } : undefined

                    return (
                        <p
                            key={i}
                            data-paragraph-index={i}
                            data-testid={isGenjutsuTarget ? 'genjutsu-break' : undefined}
                            className={`font-narrative ${fontSizeClass} leading-relaxed text-bardo-text ${
                                isGenjutsuTarget ? 'cursor-pointer' : ''
                            }`}
                            onClick={isGenjutsuTarget ? onBreakGenjutsu : undefined}
                            style={genjutsuStyle}
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
                    )
                })
            ) : (
                // Fallback for empty/initial state to maintain layout
                <p className={`font-narrative ${fontSizeClass} leading-relaxed opacity-0`}>&nbsp;</p>
            )}

            {/* Scroll anchor: invisible element that moves with the text */}
            <div ref={anchorRef} className="h-px w-full pointer-events-none opacity-0" aria-hidden="true" />
        </div>
    )
}
