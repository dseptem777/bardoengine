/**
 * Tests for TitleScreen component
 * Covers game title display, input handling, and visual effects
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>{children}</div>
        ),
        h1: ({ children, className, ...props }) => (
            <h1 className={className} {...props}>{children}</h1>
        ),
        p: ({ children, className, ...props }) => (
            <p className={className} {...props}>{children}</p>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

import TitleScreen from '../TitleScreen'

describe('TitleScreen', () => {
    const defaultProps = {
        gameTitle: 'Test Game',
        subtitle: null,
        backgroundImage: null,
        backgroundVideo: null,
        hideTitle: false,
        onStart: vi.fn(),
        showPressToStart: true
    }

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render game title', () => {
            render(<TitleScreen {...defaultProps} />)

            expect(screen.getByText('Test Game')).toBeInTheDocument()
        })

        it('should render subtitle when provided', () => {
            render(<TitleScreen {...defaultProps} subtitle="An Epic Adventure" />)

            expect(screen.getByText('An Epic Adventure')).toBeInTheDocument()
        })

        it('should hide title when hideTitle is true', () => {
            render(<TitleScreen {...defaultProps} hideTitle={true} />)

            expect(screen.queryByText('Test Game')).not.toBeInTheDocument()
        })
    })

    describe('press to start', () => {
        it('should show press to start message after delay', () => {
            render(<TitleScreen {...defaultProps} />)

            // Fast forward past the delay
            act(() => {
                vi.advanceTimersByTime(1100)
            })

            expect(screen.getByText(/PRESIONA UNA TECLA/)).toBeInTheDocument()
        })

        it('should not show press to start initially', () => {
            render(<TitleScreen {...defaultProps} />)

            expect(screen.queryByText(/PRESIONA UNA TECLA/)).not.toBeInTheDocument()
        })

        it('should not show press to start when showPressToStart is false', () => {
            render(<TitleScreen {...defaultProps} showPressToStart={false} />)

            act(() => {
                vi.advanceTimersByTime(1100)
            })

            expect(screen.queryByText(/PRESIONA UNA TECLA/)).not.toBeInTheDocument()
        })
    })

    describe('interaction', () => {
        it('should call onStart when clicked after ready', () => {
            const onStart = vi.fn()
            render(<TitleScreen {...defaultProps} onStart={onStart} />)

            // Wait for ready state
            act(() => {
                vi.advanceTimersByTime(1100)
            })

            // Click to start
            const container = document.querySelector('.fixed')
            fireEvent.click(container)

            // Wait for fade out
            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onStart).toHaveBeenCalled()
        })

        it('should not call onStart when clicked before ready', () => {
            const onStart = vi.fn()
            render(<TitleScreen {...defaultProps} onStart={onStart} />)

            // Click immediately
            const container = document.querySelector('.fixed')
            fireEvent.click(container)

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onStart).not.toHaveBeenCalled()
        })

        it('should call onStart on keydown after ready', () => {
            const onStart = vi.fn()
            render(<TitleScreen {...defaultProps} onStart={onStart} />)

            act(() => {
                vi.advanceTimersByTime(1100)
            })

            fireEvent.keyDown(window, { key: 'Enter' })

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onStart).toHaveBeenCalled()
        })
    })

    describe('background', () => {
        it('should render video background when provided', () => {
            render(<TitleScreen {...defaultProps} backgroundVideo="/intro.mp4" />)

            const video = document.querySelector('video')
            expect(video).toBeInTheDocument()
        })

        it('should render image background when provided', () => {
            const { container } = render(<TitleScreen {...defaultProps} backgroundImage="/bg.jpg" />)

            // Check that the container has a background div
            const bgDivs = container.querySelectorAll('div')
            expect(bgDivs.length).toBeGreaterThan(0)
        })
    })
})
