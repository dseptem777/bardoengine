import { useState, useEffect, useRef } from 'react'
import { scrollToBottomSmooth, userIsReadingUp } from '../utils/readingScroll.js'

// Font size classes mapping
const FONT_SIZE_CLASSES = {
    small: 'text-lg md:text-xl',
    normal: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-3xl',
}

// Characters to reveal per animation frame during fast-forward
const FAST_FORWARD_CHARS_PER_FRAME = 8

// Keyframes per stat — injected once into the document
// --fa (fisura amplitude) is a CSS custom prop set per-frame from JS (0.15→1.0)
const FISURA_KEYFRAMES = `
@keyframes fisura-magia {
  0%, 86%, 100% { transform: translate(0,0); text-shadow: none; opacity: 1; }
  88% {
    transform: translate(calc(var(--fa, 0.3) * -6px), 0);
    text-shadow:
      calc(var(--fa, 0.3) * 5px) 0 rgba(100, 220, 255, 0.85),
      calc(var(--fa, 0.3) * -5px) 0 rgba(255, 60, 230, 0.85);
    opacity: calc(1 - var(--fa, 0.3) * 0.28);
  }
  91% {
    transform: translate(calc(var(--fa, 0.3) * 4px), 0);
    text-shadow: calc(var(--fa, 0.3) * -3px) 0 rgba(100, 220, 255, 0.5);
    opacity: calc(1 - var(--fa, 0.3) * 0.14);
  }
  94% { transform: translate(0,0); text-shadow: none; opacity: 1; }
}

@keyframes fisura-fuerza {
  0%, 86%, 100% { transform: scaleX(1) scaleY(1); }
  88% {
    transform:
      scaleX(calc(1 - var(--fa, 0.3) * 0.10))
      scaleY(calc(1 + var(--fa, 0.3) * 0.15));
  }
  91% {
    transform:
      scaleX(calc(1 + var(--fa, 0.3) * 0.09))
      scaleY(calc(1 - var(--fa, 0.3) * 0.12));
  }
  94% {
    transform:
      scaleX(calc(1 - var(--fa, 0.3) * 0.05))
      scaleY(calc(1 + var(--fa, 0.3) * 0.07));
  }
  97% { transform: scaleX(1) scaleY(1); }
}

@keyframes fisura-conocimiento {
  0%, 86%, 100% { filter: brightness(1) sepia(0); letter-spacing: normal; }
  88% {
    filter:
      brightness(calc(1 + var(--fa, 0.3) * 3.0))
      sepia(1);
    letter-spacing: calc(var(--fa, 0.3) * 0.12em);
  }
  92% { filter: brightness(1) sepia(0); letter-spacing: normal; }
  94% {
    filter:
      brightness(calc(1 + var(--fa, 0.3) * 1.4))
      sepia(calc(var(--fa, 0.3) * 0.7));
    letter-spacing: calc(var(--fa, 0.3) * 0.05em);
  }
  97% { filter: brightness(1) sepia(0); letter-spacing: normal; }
}
`

let fisuraKeyframesInjected = false
function ensureFisuraKeyframes() {
    if (fisuraKeyframesInjected) return
    const style = document.createElement('style')
    style.textContent = FISURA_KEYFRAMES
    document.head.appendChild(style)
    fisuraKeyframesInjected = true
}

// WP>=80: invisible. Below 80: frequency AND amplitude both increase as WP drops.
function getFisuraAnimStyle(wp, stat) {
    if (wp >= 80) return { cursor: 'inherit' }

    const t = Math.max(0, Math.min(1, (80 - wp) / 65))  // 0 at WP=80, 1 at WP=15
    // Period: 5s (barely noticeable) → 1s (frantic)
    const duration = (5 - t * 4).toFixed(1) + 's'
    // Amplitude: 0.15 (tiny) → 1.0 (full)
    const amplitude = (0.15 + t * 0.85).toFixed(3)

    return {
        '--fa': amplitude,
        animation: `fisura-${stat} ${duration} ease-in-out infinite`,
        cursor: 'inherit',
    }
}

// Mounts completely inert — activates after first frame so there's never a pop-in
function GenjutsuFisura({ text, willpowerValue, stat, onClick }) {
    const [active, setActive] = useState(false)

    useEffect(() => {
        ensureFisuraKeyframes()
        const id = requestAnimationFrame(() => setActive(true))
        return () => cancelAnimationFrame(id)
    }, [])

    const t = Math.max(0, Math.min(1, (80 - willpowerValue) / 65))
    const opacity = 0.1 + 0.9 * t
    const animStyle = active ? getFisuraAnimStyle(willpowerValue, stat) : {}
    const style = { opacity, cursor: 'inherit', ...animStyle }
    return <span data-testid="genjutsu-break" style={style} onClick={onClick}>{text}</span>
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
    // Scroll system
    scrollContainerRef = null, // ref to the scrollable container (from Player)
    paused = false,
    // Deferred-tag segments: fire SFX/VFX when typewriter reaches each paragraph
    segments = null,           // { text: string, deferredTags: string[] }[] | null
    onSegmentReached = null,   // (segIndex: number, deferredTags: string[]) => void
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
    const pausedRef = useRef(paused)
    const kickSlowLoopRef = useRef(null)
    const kickFastLoopRef = useRef(null)
    // Segment boundary tracking
    const segmentBoundariesRef = useRef([])   // [{ startChar, segIndex, tags }]
    const firedSegmentsRef = useRef(new Set()) // Set of segIndex already fired
    const onSegmentReachedRef = useRef(onSegmentReached)

    useEffect(() => { pausedRef.current = paused }, [paused])

    // Keep onSegmentReached ref current
    useEffect(() => { onSegmentReachedRef.current = onSegmentReached }, [onSegmentReached])

    // Compute segment boundaries whenever text or segments change.
    // useStoryState joins segments with '\n\n', so we locate each segment's start
    // within the full text by scanning forward.
    useEffect(() => {
        firedSegmentsRef.current = new Set()
        if (!segments || segments.length === 0 || !text) {
            segmentBoundariesRef.current = []
            return
        }
        const boundaries = []
        let searchFrom = 0
        for (let i = 0; i < segments.length; i++) {
            const segText = segments[i].text
            if (!segText) {
                boundaries.push({ startChar: searchFrom, segIndex: i, tags: segments[i].deferredTags })
                continue
            }
            // Trim trailing whitespace that useStoryState may have stripped
            const idx = text.indexOf(segText.trimEnd(), searchFrom)
            if (idx !== -1) {
                boundaries.push({ startChar: idx, segIndex: i, tags: segments[i].deferredTags })
                searchFrom = idx + segText.trimEnd().length
            } else {
                // Fallback: place at current search position
                boundaries.push({ startChar: searchFrom, segIndex: i, tags: segments[i].deferredTags })
            }
        }
        segmentBoundariesRef.current = boundaries
    }, [text, segments])

    // Store onComplete in a ref to avoid re-triggering the effect when callback changes
    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    // Pause/resume: clear pending loops when paused, re-kick when unpaused
    useEffect(() => {
        if (paused) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        } else {
            // Clear any stale timer/raf IDs left behind by paused typeChar/fastLoop
            // (they return without scheduling but may leave the ref non-null)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
            if (fastForwardRef.current) {
                kickFastLoopRef.current?.()
            } else {
                kickSlowLoopRef.current?.()
            }
        }
    }, [paused])

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
                if (pausedRef.current) {
                    rafRef.current = null
                    return
                }

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

            kickFastLoopRef.current = () => {
                if (rafRef.current) return
                if (!pausedRef.current && fastForwardRef.current && indexRef.current < (text?.length ?? 0)) {
                    rafRef.current = requestAnimationFrame(fastLoop)
                }
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
        const textChanged = text !== currentTextRef.current  // check BEFORE updating ref
        setDisplayedText('')
        indexRef.current = 0
        currentTextRef.current = text || ''  // Track the new text
        typewriterProgressedRef.current = false  // Reset - typewriter hasn't progressed yet

        if (!text) return

        // If not typing OR typewriter delay is 0 (instant), show full text immediately
        if (!isTyping || typewriterDelay === 0) {
            // Guard: if new text just arrived while isTyping is still false, the parent
            // component will set isTyping=true in its own effect shortly after. Don't fire
            // onComplete here — that would start genjutsu WP before typing even begins.
            // Exception: typewriterDelay=0 means instant mode, always fire immediately.
            if (textChanged && typewriterDelay > 0) return
            setDisplayedText(text)
            typewriterProgressedRef.current = true  // Mark as progressed for instant text
            onCompleteRef.current?.()
            return
        }

        const typeChar = () => {
            if (pausedRef.current) {
                timeoutRef.current = null
                return
            }

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

        kickSlowLoopRef.current = () => {
            if (timeoutRef.current) return
            if (!pausedRef.current && indexRef.current < (text?.length ?? 0)) {
                typeChar()
            }
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
    const skipEffectMountedRef = useRef(false)
    useEffect(() => {
        const wasMounted = skipEffectMountedRef.current
        skipEffectMountedRef.current = true

        if (!isTyping && text) {
            // Two legit entry paths:
            //   1. Initial mount with isTyping=false → render text instantly (used by tests).
            //   2. User skipped mid-typing → typewriterProgressedRef=true.
            // Block the bug case: new text arrived while isTyping was still false from the
            // previous beat. Typewriter effect runs first (declaration order) and resets
            // progressed=false. Without this guard, skip would jump displayedText to full
            // new text and prematurely fire ALL deferred segment tags.
            if (wasMounted && !typewriterProgressedRef.current) return

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
            setDisplayedText(text)
            typewriterProgressedRef.current = true
            onCompleteRef.current?.()
        }
    }, [isTyping, text])

    // Fire deferred segment tags as the typewriter reveals each segment.
    // Runs after every displayedText change (both slow typewriter and fast-forward).
    useEffect(() => {
        if (!onSegmentReachedRef.current) return
        const boundaries = segmentBoundariesRef.current
        if (!boundaries || boundaries.length === 0) return
        const revealed = displayedText.length

        for (const boundary of boundaries) {
            if (firedSegmentsRef.current.has(boundary.segIndex)) continue
            // Segment 0 fires as soon as any character is revealed
            // Other segments fire when the typewriter crosses their start position
            const threshold = boundary.segIndex === 0 ? 1 : boundary.startChar + 1
            if (revealed >= threshold) {
                firedSegmentsRef.current.add(boundary.segIndex)
                if (boundary.tags && boundary.tags.length > 0) {
                    onSegmentReachedRef.current(boundary.segIndex, boundary.tags)
                }
            }
        }
    }, [displayedText])

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

    // Auto-scroll: keep the bottom of typed text visible. Combined with the
    // pb-[35vh] padding on the content wrapper (Player.jsx), this anchors the
    // active line at ~65% viewport-Y. Within a line, scrollHeight doesn't
    // change so this is a no-op; on line wrap, smooth scroll glides one line up.
    const scrollRafRef = useRef(null)
    useEffect(() => {
        if (!isTyping) return
        const container = scrollContainerRef?.current
        if (!container) return
        if (userIsReadingUp(container)) return
        if (scrollRafRef.current) return
        scrollRafRef.current = requestAnimationFrame(() => {
            scrollRafRef.current = null
            if (scrollContainerRef?.current) {
                scrollToBottomSmooth(scrollContainerRef.current)
            }
        })
        return () => {
            if (scrollRafRef.current) {
                cancelAnimationFrame(scrollRafRef.current)
                scrollRafRef.current = null
            }
        }
    }, [displayedText, isTyping, scrollContainerRef])

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
                    const fisuraPhrase = genjutsuBreak?.text?.trim()
                    const fisuraIdx = (
                        fisuraPhrase &&
                        dominantStat &&
                        onBreakGenjutsu &&
                        dominantStat === genjutsuBreak.stat
                    ) ? para.indexOf(fisuraPhrase) : -1
                    const hasFisura = fisuraIdx !== -1

                    const isLastTyping = isTyping &&
                        typewriterDelay > 0 &&
                        i === paragraphs.length - 1 &&
                        displayedText.length < text.length

                    return (
                        <p
                            key={i}
                            data-paragraph-index={i}
                            className={`font-narrative ${fontSizeClass} leading-relaxed text-bardo-text`}
                            style={{
                                fontFamily: 'Fraunces, Playfair Display, Georgia, serif',
                                fontWeight: 'var(--bardo-narrative-weight, 400)',
                                letterSpacing: 'var(--bardo-narrative-tracking, 0em)',
                                fontVariationSettings: '"opsz" var(--bardo-narrative-opsz, 14), "SOFT" 50',
                                fontFeatureSettings: '"liga" 1, "onum" 1, "ss01" 1',
                            }}
                        >
                            {hasFisura ? (
                                <>
                                    {para.slice(0, fisuraIdx)}
                                    <GenjutsuFisura
                                        text={fisuraPhrase}
                                        willpowerValue={willpowerValue}
                                        stat={genjutsuBreak.stat}
                                        onClick={onBreakGenjutsu}
                                    />
                                    {para.slice(fisuraIdx + fisuraPhrase.length)}
                                </>
                            ) : para}
                            {isLastTyping && (
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
