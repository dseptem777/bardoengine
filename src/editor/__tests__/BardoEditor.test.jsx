import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import BardoEditor from '../BardoEditor'

// Mock ReactFlow to avoid complex canvas rendering issues in JSDOM
vi.mock('reactflow', () => {
    return {
        default: ({ children }) => <div data-testid="react-flow">{children}</div>,
        Controls: () => <div>Controls</div>,
        Background: () => <div>Background</div>,
        MiniMap: () => <div>MiniMap</div>,
        Panel: ({ children }) => <div>{children}</div>,
        useNodesState: (initial) => [initial, vi.fn(), vi.fn()],
        useEdgesState: (initial) => [initial, vi.fn(), vi.fn()],
        addEdge: vi.fn(),
        Handle: () => <div />,
        Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' }
    }
})

describe('BardoEditor', () => {
    it('renders the editor with title and toolbar', () => {
        render(<BardoEditor onClose={vi.fn()} />)

        // BardoEditor text appears in both welcome screen and header
        expect(screen.getAllByText('BardoEditor').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByPlaceholderText('Story Title')).toBeInTheDocument()
    })

    it('shows welcome screen on initial load', () => {
        render(<BardoEditor onClose={vi.fn()} />)

        expect(screen.getByText('New Project')).toBeInTheDocument()
        expect(screen.getByText('Open Project')).toBeInTheDocument()
        expect(screen.getByText('Import .ink')).toBeInTheDocument()
    })
})
