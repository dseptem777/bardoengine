/**
 * Tests for TextDisplay component
 * Covers typewriter effect, paragraph rendering, and skip behavior
 */

import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TextDisplay from '../TextDisplay'

describe('TextDisplay', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('rendering', () => {
        it('should render empty state initially', () => {
            render(<TextDisplay text="" isTyping={false} />)

            // Should have a placeholder for layout
            const container = document.querySelector('.relative')
            expect(container).toBeInTheDocument()
        })

        it('should render full text when isTyping is false', () => {
            render(<TextDisplay text="Hello World" isTyping={false} />)

            expect(screen.getByText('Hello World')).toBeInTheDocument()
        })

        it('should render full text when typewriterDelay is 0', () => {
            render(<TextDisplay text="Instant text" isTyping={true} typewriterDelay={0} />)

            expect(screen.getByText('Instant text')).toBeInTheDocument()
        })
    })

    describe('typewriter effect', () => {
        it('should display text progressively', async () => {
            render(<TextDisplay text="Hello" isTyping={true} typewriterDelay={30} />)

            // Initially empty
            expect(screen.queryByText('Hello')).not.toBeInTheDocument()

            // Advance time for each character
            for (let i = 1; i <= 5; i++) {
                act(() => {
                    vi.advanceTimersByTime(30)
                })
            }

            expect(screen.getByText('Hello')).toBeInTheDocument()
        })

        it('should call onComplete when typewriter finishes', () => {
            const onComplete = vi.fn()
            render(<TextDisplay text="Hi" isTyping={true} typewriterDelay={30} onComplete={onComplete} />)

            expect(onComplete).not.toHaveBeenCalled()

            // Advance through all characters
            act(() => {
                vi.advanceTimersByTime(100) // More than enough for 2 chars
            })

            expect(onComplete).toHaveBeenCalled()
        })

        it('should call onComplete immediately when isTyping is false', () => {
            const onComplete = vi.fn()
            render(<TextDisplay text="Test" isTyping={false} onComplete={onComplete} />)

            expect(onComplete).toHaveBeenCalled()
        })
    })

    describe('skip behavior', () => {
        it('should show full text when isTyping changes to false mid-animation', () => {
            const { rerender } = render(
                <TextDisplay text="Long text here" isTyping={true} typewriterDelay={30} />
            )

            // Partially through animation
            act(() => {
                vi.advanceTimersByTime(60) // Only 2 characters
            })

            expect(screen.queryByText('Long text here')).not.toBeInTheDocument()

            // Skip by setting isTyping to false
            rerender(
                <TextDisplay text="Long text here" isTyping={false} typewriterDelay={30} />
            )

            expect(screen.getByText('Long text here')).toBeInTheDocument()
        })
    })

    describe('paragraphs', () => {
        it('should split text into multiple paragraphs on newlines', () => {
            render(
                <TextDisplay
                    text={'First paragraph.\n\nSecond paragraph.'}
                    isTyping={false}
                />
            )

            expect(screen.getByText('First paragraph.')).toBeInTheDocument()
            expect(screen.getByText('Second paragraph.')).toBeInTheDocument()
        })
    })

    describe('font sizes', () => {
        it('should apply normal font size class by default', () => {
            render(<TextDisplay text="Test" isTyping={false} />)

            const paragraph = screen.getByText('Test')
            expect(paragraph).toHaveClass('text-xl')
        })

        it('should apply small font size class', () => {
            render(<TextDisplay text="Small text" isTyping={false} fontSize="small" />)

            const paragraph = screen.getByText('Small text')
            expect(paragraph).toHaveClass('text-lg')
        })

        it('should apply large font size class', () => {
            render(<TextDisplay text="Large text" isTyping={false} fontSize="large" />)

            const paragraph = screen.getByText('Large text')
            expect(paragraph).toHaveClass('text-2xl')
        })
    })
})
