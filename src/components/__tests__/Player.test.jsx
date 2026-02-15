/**
 * Tests for Player component
 * The main game interface component - handles text display, choices, and game flow
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion (used by child components)
vi.mock('framer-motion', () => {
    const start = vi.fn().mockResolvedValue(null)
    const stop = vi.fn()
    const set = vi.fn()
    return {
        motion: {
            div: ({ children, className, onClick, ...props }) => (
                <div className={className} onClick={onClick} {...props}>{children}</div>
            ),
            button: ({ children, className, onClick, ...props }) => (
                <button className={className} onClick={onClick} {...props}>{children}</button>
            ),
            span: ({ children, className, ...props }) => (
                <span className={className} {...props}>{children}</span>
            )
        },
        AnimatePresence: ({ children }) => <>{children}</>,
        useAnimation: () => ({ start, stop, set })
    }
})

// Mock useKeyboardNavigation hook
vi.mock('../../hooks/useKeyboardNavigation', () => ({
    useKeyboardNavigation: vi.fn()
}))

import Player from '../Player'

describe('Player', () => {
    const defaultProps = {
        text: 'Welcome to the adventure.',
        choices: [],
        isEnded: false,
        onChoice: vi.fn(),
        onRestart: vi.fn(),
        onFinish: vi.fn(),
        onBack: vi.fn(),
        onSave: vi.fn(),
        onContinue: vi.fn(),
        canContinue: true,
        onOptions: vi.fn(),
        typewriterDelay: 0, // Instant for tests
        fontSize: 'normal',
        autoAdvance: false,
        autoAdvanceDelay: 4,
        isMinigameActive: false,
        hasPendingMinigame: false,
        onMinigameReady: vi.fn(),
        minigameAutoStart: true
    }

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render the header with BardoEngine branding', () => {
            render(<Player {...defaultProps} />)

            // Matches "BARDO ENGINE" in the header (case sensitive to avoid footer match)
            expect(screen.getByText(/BARDO ENGINE/)).toBeInTheDocument()
        })

        it('should render the story text', () => {
            render(<Player {...defaultProps} />)

            expect(screen.getByText('Welcome to the adventure.')).toBeInTheDocument()
        })

        it('should render footer', () => {
            render(<Player {...defaultProps} />)

            expect(screen.getByText(/Powered by Ink/)).toBeInTheDocument()
        })

        it('should render save button when onSave provided', () => {
            render(<Player {...defaultProps} />)

            expect(screen.getByText(/GUARDAR/)).toBeInTheDocument()
        })

        it('should render menu button', () => {
            render(<Player {...defaultProps} />)

            // The menu button text includes ←
            expect(screen.getByText(/MENÚ/)).toBeInTheDocument()
        })

        it('should render options button when onOptions provided', () => {
            render(<Player {...defaultProps} />)

            expect(screen.getByRole('button', { name: /OPCIONES/i })).toBeInTheDocument()
        })
    })

    describe('choices', () => {
        it('should render choices when provided and typing complete', () => {
            const choices = [
                { text: 'Go left' },
                { text: 'Go right' }
            ]

            render(<Player {...defaultProps} choices={choices} typewriterDelay={0} />)

            // Click to skip typewriter
            const textArea = screen.getByText('Welcome to the adventure.').closest('div')
            fireEvent.click(textArea)

            expect(screen.getByText(/Go left/)).toBeInTheDocument()
            expect(screen.getByText(/Go right/)).toBeInTheDocument()
        })
    })

    describe('end state', () => {
        it('should show end state when story ended', () => {
            render(<Player {...defaultProps} isEnded={true} typewriterDelay={0} />)

            // Skip typewriter
            const textArea = screen.getByText('Welcome to the adventure.').closest('div')
            fireEvent.click(textArea)

            // The FIN text uses em-dashes, check for REINICIAR button which is more reliable
            expect(screen.getByText('REINICIAR')).toBeInTheDocument()
        })

        it('should show REINICIAR button when story ended', () => {
            render(<Player {...defaultProps} isEnded={true} typewriterDelay={0} />)

            const textArea = screen.getByText('Welcome to the adventure.').closest('div')
            fireEvent.click(textArea)

            expect(screen.getByText('REINICIAR')).toBeInTheDocument()
        })
    })

    describe('navigation buttons', () => {
        it('should call onBack when MENÚ clicked', () => {
            const onBack = vi.fn()
            render(<Player {...defaultProps} onBack={onBack} />)

            fireEvent.click(screen.getByText(/MENÚ/))

            expect(onBack).toHaveBeenCalled()
        })

        it('should call onSave when GUARDAR clicked', () => {
            const onSave = vi.fn()
            render(<Player {...defaultProps} onSave={onSave} />)

            fireEvent.click(screen.getByText(/GUARDAR/))

            expect(onSave).toHaveBeenCalled()
        })

        it('should call onOptions when options button clicked', () => {
            const onOptions = vi.fn()
            render(<Player {...defaultProps} onOptions={onOptions} />)

            fireEvent.click(screen.getByRole('button', { name: /OPCIONES/i }))

            expect(onOptions).toHaveBeenCalled()
        })
    })

    describe('continue button', () => {
        it('should show Siguiente button when no choices and can continue', () => {
            render(<Player {...defaultProps} choices={[]} canContinue={true} typewriterDelay={0} />)

            const textArea = screen.getByText('Welcome to the adventure.').closest('div')
            fireEvent.click(textArea)

            expect(screen.getByText('Siguiente')).toBeInTheDocument()
        })
    })

    describe('minigame handling', () => {
        it('should show Comenzar Juego button when minigame pending and not auto-start', () => {
            render(<Player {...defaultProps} hasPendingMinigame={true} minigameAutoStart={false} typewriterDelay={0} />)

            const textArea = screen.getByText('Welcome to the adventure.').closest('div')
            fireEvent.click(textArea)

            expect(screen.getByText('Comenzar Juego')).toBeInTheDocument()
        })
    })
})
