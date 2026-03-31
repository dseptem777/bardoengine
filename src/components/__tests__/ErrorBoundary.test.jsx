/**
 * Tests for ErrorBoundary component
 * Covers error catching and recovery UI
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'

// Mock logger
vi.mock('../../utils/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        getLogsAsString: vi.fn().mockReturnValue('Mock logs')
    }
}))

// Component that throws an error
function BrokenComponent() {
    throw new Error('Test error')
}

// Component that works
function WorkingComponent() {
    return <div>Working component</div>
}

describe('ErrorBoundary', () => {
    // Suppress console.error during tests
    const originalError = console.error
    beforeEach(() => {
        console.error = vi.fn()
    })

    afterEach(() => {
        console.error = originalError
    })

    describe('normal operation', () => {
        it('should render children when no error', () => {
            render(
                <ErrorBoundary>
                    <WorkingComponent />
                </ErrorBoundary>
            )

            expect(screen.getByText('Working component')).toBeInTheDocument()
        })
    })

    describe('error handling', () => {
        it('should display error UI when child throws', () => {
            render(
                <ErrorBoundary>
                    <BrokenComponent />
                </ErrorBoundary>
            )

            expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
        })

        it('should show error message', () => {
            render(
                <ErrorBoundary>
                    <BrokenComponent />
                </ErrorBoundary>
            )

            expect(screen.getByText(/El juego encontró un error inesperado/)).toBeInTheDocument()
        })

        it('should show error icon', () => {
            const { container } = render(
                <ErrorBoundary>
                    <BrokenComponent />
                </ErrorBoundary>
            )

            expect(container.querySelector('.error-icon')).toBeInTheDocument()
        })
    })

    describe('action buttons', () => {
        it('should show Reiniciar button', () => {
            render(
                <ErrorBoundary>
                    <BrokenComponent />
                </ErrorBoundary>
            )

            expect(screen.getByText(/Reiniciar Juego/)).toBeInTheDocument()
        })

        it('should show Volver al Menú button', () => {
            render(
                <ErrorBoundary>
                    <BrokenComponent />
                </ErrorBoundary>
            )

            expect(screen.getByText(/Volver al Menú/)).toBeInTheDocument()
        })

        it('should show Copiar Logs button', () => {
            render(
                <ErrorBoundary>
                    <BrokenComponent />
                </ErrorBoundary>
            )

            expect(screen.getByText(/Copiar Logs/)).toBeInTheDocument()
        })
    })

    describe('hints', () => {
        it('should show hint about reporting', () => {
            render(
                <ErrorBoundary>
                    <BrokenComponent />
                </ErrorBoundary>
            )

            expect(screen.getByText(/Si el problema persiste/)).toBeInTheDocument()
        })
    })
})
