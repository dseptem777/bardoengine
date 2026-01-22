/**
 * Tests for IntroMoviePlayer component
 * Covers fullscreen video player for intro movies
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>{children}</div>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

import IntroMoviePlayer from '../IntroMoviePlayer'

describe('IntroMoviePlayer', () => {
    const defaultProps = {
        videoSrc: '/intro.mp4',
        onComplete: vi.fn(),
        skipEnabled: true
    }

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render video element when videoSrc provided', () => {
            render(<IntroMoviePlayer {...defaultProps} />)

            const video = document.querySelector('video')
            expect(video).toBeInTheDocument()
            expect(video.src).toContain('intro.mp4')
        })

        it('should not render when no videoSrc', () => {
            render(<IntroMoviePlayer videoSrc={null} onComplete={vi.fn()} />)

            expect(document.querySelector('video')).not.toBeInTheDocument()
        })

        it('should call onComplete immediately when no videoSrc', () => {
            const onComplete = vi.fn()
            render(<IntroMoviePlayer videoSrc={null} onComplete={onComplete} />)

            expect(onComplete).toHaveBeenCalled()
        })
    })

    describe('skip hint', () => {
        it('should show skip hint after delay', () => {
            render(<IntroMoviePlayer {...defaultProps} />)

            // Initially no hint
            expect(screen.queryByText(/Click o ESC para saltar/)).not.toBeInTheDocument()

            // After delay
            act(() => {
                vi.advanceTimersByTime(1600)
            })

            expect(screen.getByText(/Click o ESC para saltar/)).toBeInTheDocument()
        })
    })

    describe('skip functionality', () => {
        it('should call onComplete when clicked', () => {
            const onComplete = vi.fn()
            render(<IntroMoviePlayer {...defaultProps} onComplete={onComplete} />)

            // Click to skip
            const video = document.querySelector('video')
            fireEvent.click(video.closest('div'))

            // Wait for fade
            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).toHaveBeenCalled()
        })

        it('should call onComplete on Escape key', () => {
            const onComplete = vi.fn()
            render(<IntroMoviePlayer {...defaultProps} onComplete={onComplete} />)

            fireEvent.keyDown(window, { key: 'Escape' })

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).toHaveBeenCalled()
        })

        it('should not skip when skipEnabled is false', () => {
            const onComplete = vi.fn()
            render(<IntroMoviePlayer {...defaultProps} onComplete={onComplete} skipEnabled={false} />)

            const video = document.querySelector('video')
            fireEvent.click(video.closest('div'))

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).not.toHaveBeenCalled()
        })
    })

    describe('video events', () => {
        it('should call onComplete when video ends', () => {
            const onComplete = vi.fn()
            render(<IntroMoviePlayer {...defaultProps} onComplete={onComplete} />)

            const video = document.querySelector('video')
            fireEvent.ended(video)

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).toHaveBeenCalled()
        })

        it('should call onComplete when video errors', () => {
            const onComplete = vi.fn()
            render(<IntroMoviePlayer {...defaultProps} onComplete={onComplete} />)

            const video = document.querySelector('video')
            fireEvent.error(video)

            expect(onComplete).toHaveBeenCalled()
        })
    })

    describe('video attributes', () => {
        it('should have autoPlay attribute', () => {
            render(<IntroMoviePlayer {...defaultProps} />)

            const video = document.querySelector('video')
            expect(video.autoplay).toBe(true)
        })

        it('should have playsInline attribute', () => {
            render(<IntroMoviePlayer {...defaultProps} />)

            const video = document.querySelector('video')
            expect(video.playsInline).toBe(true)
        })
    })
})
