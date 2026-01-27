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

        expect(screen.getByText('The Loom')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Story Title')).toBeInTheDocument()
        expect(screen.getByText('Nodes:')).toBeInTheDocument()
    })
})
