/**
 * Tests for OptionsModal component
 * Covers settings UI and interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>{children}</div>
        ),
        button: ({ children, className, onClick, ...props }) => (
            <button className={className} onClick={onClick} {...props}>{children}</button>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

// Create mock functions that we can spy on
const mockUpdateSetting = vi.fn()
const mockResetSettings = vi.fn()
const mockToggleFullscreen = vi.fn()

// Mock useSettings hook
vi.mock('../../hooks/useSettings', () => ({
    useSettings: () => ({
        settings: {
            musicVolume: 50,
            sfxVolume: 70,
            typewriterSpeed: 3,
            autoAdvance: false,
            autoAdvanceDelay: 4,
            vfxEnabled: true,
            fontSize: 'normal'
        },
        updateSetting: mockUpdateSetting,
        resetSettings: mockResetSettings,
        isFullscreen: false,
        toggleFullscreen: mockToggleFullscreen
    })
}))

import OptionsModal from '../OptionsModal'

describe('OptionsModal', () => {
    beforeEach(() => {
        mockUpdateSetting.mockClear()
        mockResetSettings.mockClear()
        mockToggleFullscreen.mockClear()
    })

    describe('when closed', () => {
        it('should not render when not open', () => {
            render(<OptionsModal isOpen={false} onClose={vi.fn()} />)

            expect(screen.queryByText('OPCIONES')).not.toBeInTheDocument()
        })
    })

    describe('when open', () => {
        it('should render title', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/OPCIONES/)).toBeInTheDocument()
        })

        it('should show audio section', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Audio/)).toBeInTheDocument()
        })

        it('should show music volume control', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Volumen Música/)).toBeInTheDocument()
        })

        it('should show SFX volume control', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Volumen SFX/)).toBeInTheDocument()
        })

        it('should show text section', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Texto/)).toBeInTheDocument()
        })

        it('should show speed control', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText('Velocidad')).toBeInTheDocument()
        })

        it('should show accessibility section', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Accesibilidad/)).toBeInTheDocument()
        })

        it('should show VFX toggle', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Efectos Visuales/)).toBeInTheDocument()
        })

        it('should show font size control', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Tamaño de Fuente/)).toBeInTheDocument()
        })
    })

    describe('actions', () => {
        it('should call onClose when close button clicked', () => {
            const onClose = vi.fn()
            render(<OptionsModal isOpen={true} onClose={onClose} />)

            fireEvent.click(screen.getByText('CERRAR'))

            expect(onClose).toHaveBeenCalled()
        })

        it('should call resetSettings when reset clicked', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            fireEvent.click(screen.getByText('RESET'))

            expect(mockResetSettings).toHaveBeenCalled()
        })
    })

    describe('fullscreen toggle', () => {
        it('should show fullscreen section', () => {
            render(<OptionsModal isOpen={true} onClose={vi.fn()} />)

            expect(screen.getByText(/Pantalla Completa/)).toBeInTheDocument()
        })
    })
})
