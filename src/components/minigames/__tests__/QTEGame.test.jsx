/**
 * Tests for QTEGame component
 * Covers quick-time event mechanics
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        circle: ({ children, ...props }) => <circle {...props}>{children}</circle>
    },
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn()
    })
}))

import QTEGame from '../QTEGame'

describe('QTEGame', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('rendering', () => {
        it('should render game title', () => {
            render(<QTEGame params={['SPACE', 2]} onFinish={vi.fn()} />)

            expect(screen.getByText('RAPID REACTION')).toBeInTheDocument()
        })

        it('should show ready countdown initially', () => {
            render(<QTEGame params={['SPACE', 2]} onFinish={vi.fn()} />)

            expect(screen.getByText(/READY/)).toBeInTheDocument()
        })

        it('should display the target key', () => {
            render(<QTEGame params={['E', 2]} onFinish={vi.fn()} />)

            expect(screen.getByText('E')).toBeInTheDocument()
        })

        it('should display space symbol for SPACE key', () => {
            render(<QTEGame params={['SPACE', 2]} onFinish={vi.fn()} />)

            expect(screen.getByText('⎵')).toBeInTheDocument()
        })
    })

    describe('game states', () => {
        it('should transition to playing after countdown', () => {
            render(<QTEGame params={['SPACE', 2]} onFinish={vi.fn()} />)

            // Fast forward through countdown
            act(() => {
                vi.advanceTimersByTime(1200) // 2 x 600ms countdown
            })

            expect(screen.getByText(/PRESS/)).toBeInTheDocument()
        })

        it('should show target key instruction when playing', () => {
            render(<QTEGame params={['K', 2]} onFinish={vi.fn()} />)

            act(() => {
                vi.advanceTimersByTime(1200)
            })

            expect(screen.getByText('[K]')).toBeInTheDocument()
        })
    })

    describe('win condition', () => {
        it('should call onFinish with 1 when correct key pressed', () => {
            const onFinish = vi.fn()
            render(<QTEGame params={['E', 2]} onFinish={onFinish} />)

            // Fast forward through countdown
            act(() => {
                vi.advanceTimersByTime(1200)
            })

            // Press the correct key
            fireEvent.keyDown(window, { key: 'e' })

            expect(onFinish).toHaveBeenCalledWith(1)
        })

        it('should show SUCCESS on win', () => {
            const onFinish = vi.fn()
            render(<QTEGame params={['E', 2]} onFinish={onFinish} />)

            act(() => {
                vi.advanceTimersByTime(1200)
            })

            fireEvent.keyDown(window, { key: 'e' })

            expect(screen.getByText(/SUCCESS/)).toBeInTheDocument()
        })
    })

    describe('lose condition', () => {
        it('should call onFinish with 0 when time runs out', () => {
            const onFinish = vi.fn()
            render(<QTEGame params={['SPACE', 1]} onFinish={onFinish} />)

            // Fast forward through countdown + game time
            act(() => {
                vi.advanceTimersByTime(1200) // countdown
            })

            act(() => {
                vi.advanceTimersByTime(1100) // game time expires
            })

            expect(onFinish).toHaveBeenCalledWith(0)
        })

        it('should show FAILED on timeout', () => {
            const onFinish = vi.fn()
            render(<QTEGame params={['SPACE', 1]} onFinish={onFinish} />)

            act(() => {
                vi.advanceTimersByTime(1200)
            })

            act(() => {
                vi.advanceTimersByTime(1100)
            })

            expect(screen.getByText(/FAILED/)).toBeInTheDocument()
        })
    })

    describe('params', () => {
        it('should use default key SPACE when not provided', () => {
            render(<QTEGame params={[]} onFinish={vi.fn()} />)

            expect(screen.getByText('⎵')).toBeInTheDocument()
        })

        it('should use default duration 2s when not provided', () => {
            const onFinish = vi.fn()
            render(<QTEGame params={['E']} onFinish={onFinish} />)

            act(() => {
                vi.advanceTimersByTime(1200) // countdown
            })

            // After 1.5s, game should still be playing
            act(() => {
                vi.advanceTimersByTime(1500)
            })

            expect(onFinish).not.toHaveBeenCalled()
        })
    })
})
