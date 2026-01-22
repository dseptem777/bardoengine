/**
 * Tests for ChoiceButton component
 * Covers rendering, click handling, and debounce behavior
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ChoiceButton from '../ChoiceButton'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    }
}))

describe('ChoiceButton', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('rendering', () => {
        it('should render choice text', () => {
            render(<ChoiceButton text="Go north" index={0} onClick={() => { }} />)

            expect(screen.getByText('Go north')).toBeInTheDocument()
        })

        it('should display correct index number', () => {
            render(<ChoiceButton text="Option" index={2} onClick={() => { }} />)

            expect(screen.getByText('[3]')).toBeInTheDocument() // index + 1
        })

        it('should render as a button element', () => {
            render(<ChoiceButton text="Click me" index={0} onClick={() => { }} />)

            expect(screen.getByRole('button')).toBeInTheDocument()
        })
    })

    describe('click behavior', () => {
        it('should not call onClick immediately after render (debounce)', () => {
            const onClick = vi.fn()
            render(<ChoiceButton text="Option" index={0} onClick={onClick} />)

            const button = screen.getByRole('button')
            fireEvent.click(button)

            expect(onClick).not.toHaveBeenCalled()
        })

        it('should call onClick after debounce period', () => {
            const onClick = vi.fn()
            render(<ChoiceButton text="Option" index={0} onClick={onClick} />)

            // Wait for isReady timer (150ms)
            act(() => {
                vi.advanceTimersByTime(150)
            })

            const button = screen.getByRole('button')
            fireEvent.click(button)

            expect(onClick).toHaveBeenCalledTimes(1)
        })

        it('should handle multiple clicks', () => {
            const onClick = vi.fn()
            render(<ChoiceButton text="Option" index={0} onClick={onClick} />)

            act(() => {
                vi.advanceTimersByTime(150)
            })

            const button = screen.getByRole('button')
            fireEvent.click(button)
            fireEvent.click(button)

            expect(onClick).toHaveBeenCalledTimes(2)
        })
    })

    describe('accessibility', () => {
        it('should be focusable', () => {
            render(<ChoiceButton text="Option" index={0} onClick={() => { }} />)

            const button = screen.getByRole('button')
            expect(button).not.toHaveAttribute('tabindex', '-1')
        })
    })
})
