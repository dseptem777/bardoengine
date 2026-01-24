/**
 * Tests for GalleryPage component
 * Covers image gallery display and fullscreen modal
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>{children}</div>
        ),
        button: ({ children, className, onClick, disabled, whileHover, whileTap, ...props }) => (
            <button className={className} onClick={onClick} disabled={disabled} {...props}>{children}</button>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

import GalleryPage from '../GalleryPage'

describe('GalleryPage', () => {
    const mockItems = [
        { id: 'art1', title: 'Concept Art 1', image: '/art1.jpg', unlockedBy: null },
        { id: 'art2', title: 'Concept Art 2', image: '/art2.jpg', unlockedBy: 'first_blood' },
        { id: 'art3', title: 'Secret Art', image: '/art3.jpg', unlockedBy: 'secret_achievement' }
    ]

    const defaultProps = {
        items: mockItems,
        unlockedAchievements: ['first_blood'],
        onBack: vi.fn()
    }

    describe('rendering', () => {
        it('should render title', () => {
            render(<GalleryPage {...defaultProps} />)

            expect(screen.getByText('GALERÍA')).toBeInTheDocument()
        })

        it('should show unlock count', () => {
            render(<GalleryPage {...defaultProps} />)

            // Item 1 has no unlockedBy, Item 2 is unlocked via first_blood
            expect(screen.getByText(/2\/3 desbloqueados/)).toBeInTheDocument()
        })
    })

    describe('items display', () => {
        it('should show titles for unlocked items', () => {
            render(<GalleryPage {...defaultProps} />)

            expect(screen.getByText('Concept Art 1')).toBeInTheDocument()
            expect(screen.getByText('Concept Art 2')).toBeInTheDocument()
        })

        it('should show lock icon for locked items', () => {
            render(<GalleryPage {...defaultProps} />)

            expect(screen.getByText('🔒')).toBeInTheDocument()
            expect(screen.getByText('Bloqueado')).toBeInTheDocument()
        })
    })

    describe('back button', () => {
        it('should call onBack when clicked', () => {
            const onBack = vi.fn()
            render(<GalleryPage {...defaultProps} onBack={onBack} />)

            fireEvent.click(screen.getByText('← Volver'))

            expect(onBack).toHaveBeenCalled()
        })
    })

    describe('empty state', () => {
        it('should show empty message when no items', () => {
            render(<GalleryPage items={[]} unlockedAchievements={[]} onBack={vi.fn()} />)

            expect(screen.getByText(/no tiene galería de arte/)).toBeInTheDocument()
        })
    })

    describe('fullscreen modal', () => {
        it('should open modal when unlocked item clicked', () => {
            render(<GalleryPage {...defaultProps} />)

            // Click on unlocked item (Concept Art 1 has no unlockedBy)
            fireEvent.click(screen.getByText('Concept Art 1').closest('button'))

            // Modal should show close button
            expect(screen.getByText('✕')).toBeInTheDocument()
        })
    })
})
