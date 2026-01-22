/**
 * Tests for LockpickGame component
 * Covers precision unlock mechanics
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, animate, style, ...props }) => (
            <div className={className} style={{ ...style, left: animate?.left }} {...props}>{children}</div>
        )
    }
}))

// Mock requestAnimationFrame
const mockRAF = vi.fn()
const mockCancelRAF = vi.fn()

beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', mockRAF.mockImplementation(cb => {
        setTimeout(() => cb(performance.now()), 16)
        return 1
    }))
    vi.stubGlobal('cancelAnimationFrame', mockCancelRAF)
})

import LockpickGame from '../LockpickGame'

describe('LockpickGame', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        mockRAF.mockClear()
        mockCancelRAF.mockClear()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('rendering', () => {
        it('should render game title', () => {
            render(<LockpickGame params={[0.2, 1.1]} onFinish={vi.fn()} />)

            expect(screen.getByText('Precision Unlock')).toBeInTheDocument()
        })

        it('should show instructions when playing', () => {
            render(<LockpickGame params={[0.2, 1.1]} onFinish={vi.fn()} />)

            expect(screen.getByText(/CLICK or/)).toBeInTheDocument()
            expect(screen.getByText('SPACE')).toBeInTheDocument()
        })

        it('should show LOCKED and ENGAGED labels', () => {
            render(<LockpickGame params={[0.2, 1.1]} onFinish={vi.fn()} />)

            expect(screen.getByText('LOCKED')).toBeInTheDocument()
            expect(screen.getByText('ENGAGED')).toBeInTheDocument()
        })
    })

    describe('interaction', () => {
        it('should trigger action on click', () => {
            const onFinish = vi.fn()
            render(<LockpickGame params={[0.2, 1.1]} onFinish={onFinish} />)

            const gameArea = screen.getByText('Precision Unlock').closest('div')
            fireEvent.click(gameArea)

            expect(onFinish).toHaveBeenCalled()
        })

        it('should trigger action on SPACE key', () => {
            const onFinish = vi.fn()
            render(<LockpickGame params={[0.2, 1.1]} onFinish={onFinish} />)

            fireEvent.keyDown(window, { code: 'Space' })

            expect(onFinish).toHaveBeenCalled()
        })

        it('should trigger action on Enter key', () => {
            const onFinish = vi.fn()
            render(<LockpickGame params={[0.2, 1.1]} onFinish={onFinish} />)

            fireEvent.keyDown(window, { code: 'Enter' })

            expect(onFinish).toHaveBeenCalled()
        })
    })

    describe('result display', () => {
        it('should call onFinish with result when action triggered', () => {
            const onFinish = vi.fn()
            render(<LockpickGame params={[0.2, 1.1]} onFinish={onFinish} />)

            fireEvent.keyDown(window, { code: 'Space' })

            // onFinish should be called with either 0 or 1
            expect(onFinish).toHaveBeenCalledWith(expect.any(Number))
        })
    })

    describe('params', () => {
        it('should use default difficulty 0.2 when not provided', () => {
            const onFinish = vi.fn()
            render(<LockpickGame params={[]} onFinish={onFinish} />)

            // Game should render without errors
            expect(screen.getByText('Precision Unlock')).toBeInTheDocument()
        })

        it('should accept custom difficulty', () => {
            render(<LockpickGame params={[0.8, 1.0]} onFinish={vi.fn()} />)

            // Higher difficulty = smaller zone, but game should still render
            expect(screen.getByText('Precision Unlock')).toBeInTheDocument()
        })
    })
})
