/**
 * Tests for StartScreen component
 * Covers main menu rendering and button interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        button: ({ children, onClick, className, whileHover, whileTap, ...props }) => (
            <button onClick={onClick} className={className} {...props}>{children}</button>
        )
    }
}))

import StartScreen from '../StartScreen'

describe('StartScreen', () => {
    const defaultProps = {
        gameTitle: 'Test Game',
        hasAnySave: false,
        hasContinue: false,
        hasExtras: false,
        onNewGame: vi.fn(),
        onContinue: vi.fn(),
        onLoadGame: vi.fn(),
        onOptions: vi.fn(),
        onExtras: vi.fn()
    }

    describe('rendering', () => {
        it('should render game title', () => {
            render(<StartScreen {...defaultProps} />)

            expect(screen.getByText('Test Game')).toBeInTheDocument()
        })

        it('should render NUEVA PARTIDA button', () => {
            render(<StartScreen {...defaultProps} />)

            expect(screen.getByText('NUEVA PARTIDA')).toBeInTheDocument()
        })

        it('should render CONTINUAR button', () => {
            render(<StartScreen {...defaultProps} />)

            expect(screen.getByText('CONTINUAR')).toBeInTheDocument()
        })

        it('should render footer with version', () => {
            render(<StartScreen {...defaultProps} />)

            expect(screen.getByText(/Powered by BardoEngine/)).toBeInTheDocument()
        })
    })

    describe('conditional elements', () => {
        it('should show CARGAR PARTIDA only when hasAnySave is true', () => {
            const { rerender } = render(<StartScreen {...defaultProps} hasAnySave={false} />)

            expect(screen.queryByText('CARGAR PARTIDA')).not.toBeInTheDocument()

            rerender(<StartScreen {...defaultProps} hasAnySave={true} />)

            expect(screen.getByText('CARGAR PARTIDA')).toBeInTheDocument()
        })

        it('should show EXTRAS only when hasExtras is true and onExtras provided', () => {
            const { rerender } = render(<StartScreen {...defaultProps} hasExtras={false} />)

            expect(screen.queryByText(/EXTRAS/)).not.toBeInTheDocument()

            rerender(<StartScreen {...defaultProps} hasExtras={true} />)

            expect(screen.getByText(/EXTRAS/)).toBeInTheDocument()
        })

        it('should show back button only when onBack is provided', () => {
            const { rerender } = render(<StartScreen {...defaultProps} />)

            expect(screen.queryByText(/Elegir otra historia/)).not.toBeInTheDocument()

            rerender(<StartScreen {...defaultProps} onBack={vi.fn()} />)

            expect(screen.getByText(/Elegir otra historia/)).toBeInTheDocument()
        })

        it('should show checkmark on CONTINUAR when hasContinue is true', () => {
            render(<StartScreen {...defaultProps} hasContinue={true} />)

            expect(screen.getByText('✓ CONTINUAR')).toBeInTheDocument()
        })
    })

    describe('button interactions', () => {
        it('should call onNewGame when NUEVA PARTIDA clicked', () => {
            const onNewGame = vi.fn()
            render(<StartScreen {...defaultProps} onNewGame={onNewGame} />)

            fireEvent.click(screen.getByText('NUEVA PARTIDA'))

            expect(onNewGame).toHaveBeenCalled()
        })

        it('should call onContinue when CONTINUAR clicked and enabled', () => {
            const onContinue = vi.fn()
            render(<StartScreen {...defaultProps} hasContinue={true} onContinue={onContinue} />)

            fireEvent.click(screen.getByText('✓ CONTINUAR'))

            expect(onContinue).toHaveBeenCalled()
        })

        it('should NOT call onContinue when disabled', () => {
            const onContinue = vi.fn()
            render(<StartScreen {...defaultProps} hasContinue={false} onContinue={onContinue} />)

            fireEvent.click(screen.getByText('CONTINUAR'))

            expect(onContinue).not.toHaveBeenCalled()
        })

        it('should call onLoadGame when CARGAR PARTIDA clicked', () => {
            const onLoadGame = vi.fn()
            render(<StartScreen {...defaultProps} hasAnySave={true} onLoadGame={onLoadGame} />)

            fireEvent.click(screen.getByText('CARGAR PARTIDA'))

            expect(onLoadGame).toHaveBeenCalled()
        })

        it('should call onOptions when OPCIONES clicked', () => {
            const onOptions = vi.fn()
            render(<StartScreen {...defaultProps} onOptions={onOptions} />)

            fireEvent.click(screen.getByText(/OPCIONES/))

            expect(onOptions).toHaveBeenCalled()
        })

        it('should call onBack when back button clicked', () => {
            const onBack = vi.fn()
            render(<StartScreen {...defaultProps} onBack={onBack} />)

            fireEvent.click(screen.getByText(/Elegir otra historia/))

            expect(onBack).toHaveBeenCalled()
        })
    })
})
