/**
 * Tests for EngineLogoScreen component
 * Covers "Powered by BardoEngine" splash screen
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>{children}</div>
        ),
        p: ({ children, className, ...props }) => (
            <p className={className} {...props}>{children}</p>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

// Mock BardoEngineLogo
vi.mock('../BardoEngineLogo', () => ({
    default: ({ size, animated, showText }) => (
        <div data-testid="bardo-logo">BardoEngine Logo</div>
    )
}))

import EngineLogoScreen from '../EngineLogoScreen'

describe('EngineLogoScreen', () => {
    const defaultProps = {
        duration: 3000,
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
        it('should render logo', () => {
            render(<EngineLogoScreen {...defaultProps} />)

            expect(screen.getByTestId('bardo-logo')).toBeInTheDocument()
        })

        it('should show engine description', () => {
            render(<EngineLogoScreen {...defaultProps} />)

            expect(screen.getByText('Motor de narrativa interactiva')).toBeInTheDocument()
        })

        it('should show skip hint when skip is enabled', () => {
            render(<EngineLogoScreen {...defaultProps} />)

            expect(screen.getByText(/Click o presiona cualquier tecla/)).toBeInTheDocument()
        })

        it('should not show skip hint when skip is disabled', () => {
            render(<EngineLogoScreen {...defaultProps} skipEnabled={false} />)

            expect(screen.queryByText(/Click o presiona cualquier tecla/)).not.toBeInTheDocument()
        })
    })

    describe('auto-advance', () => {
        it('should call onComplete after duration', () => {
            const onComplete = vi.fn()
            render(<EngineLogoScreen {...defaultProps} duration={2000} onComplete={onComplete} />)

            // Fast forward past duration + fade time
            act(() => {
                vi.advanceTimersByTime(2000)
            })

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).toHaveBeenCalled()
        })
    })

    describe('skip functionality', () => {
        it('should call onComplete when clicked', () => {
            const onComplete = vi.fn()
            render(<EngineLogoScreen {...defaultProps} onComplete={onComplete} />)

            // Click to skip
            fireEvent.click(screen.getByTestId('bardo-logo').closest('div'))

            // Wait for fade
            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).toHaveBeenCalled()
        })

        it('should call onComplete on Escape key', () => {
            const onComplete = vi.fn()
            render(<EngineLogoScreen {...defaultProps} onComplete={onComplete} />)

            fireEvent.keyDown(window, { key: 'Escape' })

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).toHaveBeenCalled()
        })

        it('should call onComplete on Enter key', () => {
            const onComplete = vi.fn()
            render(<EngineLogoScreen {...defaultProps} onComplete={onComplete} />)

            fireEvent.keyDown(window, { key: 'Enter' })

            act(() => {
                vi.advanceTimersByTime(600)
            })

            expect(onComplete).toHaveBeenCalled()
        })

        it('should not skip when skipEnabled is false', () => {
            const onComplete = vi.fn()
            render(<EngineLogoScreen {...defaultProps} onComplete={onComplete} skipEnabled={false} />)

            fireEvent.click(screen.getByTestId('bardo-logo').closest('div'))

            act(() => {
                vi.advanceTimersByTime(600)
            })

            // Should not have been called by click (only by timeout)
            expect(onComplete).not.toHaveBeenCalled()
        })
    })

    describe('visibility', () => {
        it('should become invisible after completion', () => {
            const { container } = render(<EngineLogoScreen {...defaultProps} />)

            // Skip
            fireEvent.click(screen.getByTestId('bardo-logo').closest('div'))

            // Wait for fade
            act(() => {
                vi.advanceTimersByTime(600)
            })

            // Should be gone
            expect(screen.queryByTestId('bardo-logo')).not.toBeInTheDocument()
        })
    })
})
