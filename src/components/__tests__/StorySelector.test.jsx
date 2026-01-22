/**
 * Tests for StorySelector component
 * Covers story list rendering and selection
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StorySelector from '../StorySelector'

describe('StorySelector', () => {
    const mockStories = [
        { id: 'toybox', title: 'TOYBOX', data: {} },
        { id: 'partuza', title: 'PARTUZA', data: {} },
        { id: 'centinelas', title: 'CENTINELAS', data: {} }
    ]

    describe('rendering', () => {
        it('should render BardoEngine logo', () => {
            render(<StorySelector stories={[]} onSelect={vi.fn()} hasSave={() => false} />)

            expect(screen.getByText(/BARDO/)).toBeInTheDocument()
            expect(screen.getByText(/ENGINE/)).toBeInTheDocument()
        })

        it('should render "Seleccionar Historia" header', () => {
            render(<StorySelector stories={[]} onSelect={vi.fn()} hasSave={() => false} />)

            expect(screen.getByText('Seleccionar Historia')).toBeInTheDocument()
        })

        it('should render all stories', () => {
            render(<StorySelector stories={mockStories} onSelect={vi.fn()} hasSave={() => false} />)

            expect(screen.getByText('TOYBOX')).toBeInTheDocument()
            expect(screen.getByText('PARTUZA')).toBeInTheDocument()
            expect(screen.getByText('CENTINELAS')).toBeInTheDocument()
        })

        it('should display story IDs', () => {
            render(<StorySelector stories={mockStories} onSelect={vi.fn()} hasSave={() => false} />)

            expect(screen.getByText('ID: toybox')).toBeInTheDocument()
            expect(screen.getByText('ID: partuza')).toBeInTheDocument()
        })

        it('should render footer', () => {
            render(<StorySelector stories={[]} onSelect={vi.fn()} hasSave={() => false} />)

            expect(screen.getByText(/Powered by Ink/)).toBeInTheDocument()
        })
    })

    describe('save indicator', () => {
        it('should show CONTINUAR badge for stories with saves', () => {
            const hasSave = (id) => id === 'toybox'

            render(<StorySelector stories={mockStories} onSelect={vi.fn()} hasSave={hasSave} />)

            // Should show CONTINUAR only for toybox
            const badges = screen.getAllByText('CONTINUAR')
            expect(badges).toHaveLength(1)
        })

        it('should show CONTINUAR badge for multiple stories with saves', () => {
            const hasSave = (id) => id === 'toybox' || id === 'partuza'

            render(<StorySelector stories={mockStories} onSelect={vi.fn()} hasSave={hasSave} />)

            const badges = screen.getAllByText('CONTINUAR')
            expect(badges).toHaveLength(2)
        })

        it('should not show any badge when no saves exist', () => {
            render(<StorySelector stories={mockStories} onSelect={vi.fn()} hasSave={() => false} />)

            expect(screen.queryByText('CONTINUAR')).not.toBeInTheDocument()
        })
    })

    describe('selection', () => {
        it('should call onSelect with story when clicked', () => {
            const onSelect = vi.fn()
            render(<StorySelector stories={mockStories} onSelect={onSelect} hasSave={() => false} />)

            fireEvent.click(screen.getByText('TOYBOX'))

            expect(onSelect).toHaveBeenCalledWith(mockStories[0])
        })

        it('should call onSelect with correct story for each option', () => {
            const onSelect = vi.fn()
            render(<StorySelector stories={mockStories} onSelect={onSelect} hasSave={() => false} />)

            fireEvent.click(screen.getByText('CENTINELAS'))

            expect(onSelect).toHaveBeenCalledWith(mockStories[2])
        })
    })

    describe('empty state', () => {
        it('should render without stories', () => {
            render(<StorySelector stories={[]} onSelect={vi.fn()} hasSave={() => false} />)

            expect(screen.getByText('Seleccionar Historia')).toBeInTheDocument()
        })
    })
})
