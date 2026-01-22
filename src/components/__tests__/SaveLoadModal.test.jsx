/**
 * Tests for SaveLoadModal component
 * Covers save and load functionality UI
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

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

import SaveLoadModal from '../SaveLoadModal'

describe('SaveLoadModal', () => {
    const mockSaves = [
        {
            id: 'slot1',
            name: 'Save 1',
            timestamp: Date.now() - 3600000,
            knotName: 'chapter_one'
        },
        {
            id: 'slot2',
            name: 'Save 2',
            timestamp: Date.now(),
            knotName: 'chapter_two'
        }
    ]

    describe('when closed', () => {
        it('should not render when not open', () => {
            render(
                <SaveLoadModal
                    isOpen={false}
                    mode="load"
                    saves={[]}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            expect(screen.queryByText(/CARGAR PARTIDA/)).not.toBeInTheDocument()
        })
    })

    describe('load mode', () => {
        it('should render load title', () => {
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="load"
                    saves={mockSaves}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            expect(screen.getByText(/CARGAR PARTIDA/)).toBeInTheDocument()
        })

        it('should display save slots', () => {
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="load"
                    saves={mockSaves}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            expect(screen.getByText('Save 1')).toBeInTheDocument()
            expect(screen.getByText('Save 2')).toBeInTheDocument()
        })

        it('should show empty message when no saves', () => {
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="load"
                    saves={[]}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            expect(screen.getByText('No hay partidas guardadas')).toBeInTheDocument()
        })

        it('should call onLoad with save id when save clicked', () => {
            const onLoad = vi.fn()
            const onClose = vi.fn()
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="load"
                    saves={mockSaves}
                    onSave={vi.fn()}
                    onLoad={onLoad}
                    onDelete={vi.fn()}
                    onClose={onClose}
                />
            )

            fireEvent.click(screen.getByText('Save 1'))

            // The component calls onLoad(save.id), not onLoad(save)
            expect(onLoad).toHaveBeenCalledWith('slot1')
        })
    })

    describe('save mode', () => {
        it('should render save title', () => {
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="save"
                    saves={[]}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            expect(screen.getByText(/GUARDAR PARTIDA/)).toBeInTheDocument()
        })

        it('should show save name input with default value', () => {
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="save"
                    saves={[]}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            // The input has a default save name like "Partida DD/MM HH:MM"
            const input = screen.getByRole('textbox')
            expect(input).toBeInTheDocument()
            expect(input.value).toContain('Partida')
        })

        it('should show save button', () => {
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="save"
                    saves={[]}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            expect(screen.getByText('GUARDAR')).toBeInTheDocument()
        })

        it('should call onSave when save button clicked', () => {
            const onSave = vi.fn()
            const onClose = vi.fn()
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="save"
                    saves={[]}
                    onSave={onSave}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={onClose}
                />
            )

            const input = screen.getByRole('textbox')
            fireEvent.change(input, { target: { value: 'My Save' } })
            fireEvent.click(screen.getByText('GUARDAR'))

            expect(onSave).toHaveBeenCalledWith('My Save')
        })
    })

    describe('close button', () => {
        it('should call onClose when close button clicked', () => {
            const onClose = vi.fn()
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="load"
                    saves={[]}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={onClose}
                />
            )

            // The close button has the × character
            fireEvent.click(screen.getByText('×'))

            expect(onClose).toHaveBeenCalled()
        })
    })

    describe('delete functionality', () => {
        it('should show delete button on each save', () => {
            render(
                <SaveLoadModal
                    isOpen={true}
                    mode="load"
                    saves={mockSaves}
                    onSave={vi.fn()}
                    onLoad={vi.fn()}
                    onDelete={vi.fn()}
                    onClose={vi.fn()}
                />
            )

            // Each save should have a delete button with trash emoji
            const deleteButtons = screen.getAllByTitle('Eliminar')
            expect(deleteButtons).toHaveLength(2)
        })
    })
})
