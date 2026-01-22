/**
 * Tests for InventoryPanel component
 * Covers inventory display and toggle functionality
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, onMouseEnter, onMouseLeave, ...props }) => (
            <div className={className} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} {...props}>{children}</div>
        ),
        button: ({ children, className, onClick, ...props }) => (
            <button className={className} onClick={onClick} {...props}>{children}</button>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

import InventoryPanel from '../InventoryPanel'

describe('InventoryPanel', () => {
    const mockInventoryConfig = {
        enabled: true,
        maxSlots: 20
    }

    const mockItems = { 'potion': 2, 'sword': 1 }

    const mockGetItemsWithInfo = () => [
        { id: 'potion', name: 'Health Potion', icon: '🧪', qty: 2, category: 'consumable', description: 'Restores health' },
        { id: 'sword', name: 'Iron Sword', icon: '⚔️', qty: 1, category: 'weapon', description: 'A basic sword' }
    ]

    describe('rendering', () => {
        it('should render toggle button when enabled', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            expect(screen.getByText('🎒')).toBeInTheDocument()
        })

        it('should not render when disabled', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={{ enabled: false }}
                    getItemsWithInfo={() => []}
                />
            )

            expect(screen.queryByText('🎒')).not.toBeInTheDocument()
        })

        it('should show item count badge when items exist', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            // The badge shows the number of unique items (2)
            expect(screen.getByText('2')).toBeInTheDocument()
        })
    })

    describe('toggle functionality', () => {
        it('should open panel when button clicked', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            // Panel should not be visible initially
            expect(screen.queryByText('INVENTARIO')).not.toBeInTheDocument()

            // Click toggle button
            fireEvent.click(screen.getByText('🎒'))

            // Panel should now be visible
            expect(screen.getByText(/INVENTARIO/)).toBeInTheDocument()
        })

        it('should close panel when button clicked again', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            // Get all backpack icons - there's one in toggle button
            const toggleButtons = screen.getAllByText('🎒')

            // Open - click the first one which is the toggle button
            fireEvent.click(toggleButtons[0])
            expect(screen.getByText(/INVENTARIO/)).toBeInTheDocument()

            // Close - get buttons again since DOM changed
            const toggleButtonsAfter = screen.getAllByText('🎒')
            fireEvent.click(toggleButtonsAfter[0])

            // Panel header should be gone
            expect(screen.queryByText(/INVENTARIO/)).not.toBeInTheDocument()
        })
    })

    describe('inventory contents', () => {
        it('should display items when panel is open', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            fireEvent.click(screen.getByText('🎒'))

            expect(screen.getByText('Health Potion')).toBeInTheDocument()
            expect(screen.getByText('Iron Sword')).toBeInTheDocument()
        })

        it('should show item icons', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            fireEvent.click(screen.getByText('🎒'))

            expect(screen.getByText('🧪')).toBeInTheDocument()
            expect(screen.getByText('⚔️')).toBeInTheDocument()
        })

        it('should show quantity for stackable items', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            fireEvent.click(screen.getByText('🎒'))

            expect(screen.getByText('x2')).toBeInTheDocument()
        })

        it('should show slot count', () => {
            render(
                <InventoryPanel
                    items={mockItems}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={mockGetItemsWithInfo}
                />
            )

            fireEvent.click(screen.getByText('🎒'))

            expect(screen.getByText('2/20')).toBeInTheDocument()
        })
    })

    describe('empty state', () => {
        it('should show empty message when no items', () => {
            render(
                <InventoryPanel
                    items={{}}
                    inventoryConfig={mockInventoryConfig}
                    getItemsWithInfo={() => []}
                />
            )

            fireEvent.click(screen.getByText('🎒'))

            expect(screen.getByText('Inventario vacío')).toBeInTheDocument()
        })
    })
})
