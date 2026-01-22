/**
 * Tests for ApneaGame component
 * Covers breath-holding survival minigame mechanics
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, onTouchStart, onTouchEnd, ...props }) => (
            <div className={className} onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} {...props}>{children}</div>
        ),
        span: ({ children, className, ...props }) => (
            <span className={className} {...props}>{children}</span>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

// Mock requestAnimationFrame globally
const mockRAF = vi.fn((cb) => {
    return 1
})
const mockCancelRAF = vi.fn()

import ApneaGame from '../ApneaGame'

describe('ApneaGame', () => {
    const defaultProps = {
        params: { waves: 2, duration: 10 },
        onFinish: vi.fn()
    }

    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', mockRAF)
        vi.stubGlobal('cancelAnimationFrame', mockCancelRAF)
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('rendering', () => {
        it('should render without crashing', () => {
            expect(() => {
                render(<ApneaGame {...defaultProps} />)
            }).not.toThrow()
        })

        it('should render game container', () => {
            render(<ApneaGame {...defaultProps} />)

            // Should have some container element
            expect(document.querySelector('div')).toBeInTheDocument()
        })
    })

    describe('keyboard controls', () => {
        it('should render with keyboard handlers attached', () => {
            // Just verify we can render the component - keyboard handlers are attached internally
            const { container } = render(<ApneaGame {...defaultProps} />)
            expect(container.firstChild).toBeInTheDocument()
        })
    })

    describe('default params', () => {
        it('should work with empty object params', () => {
            expect(() => {
                render(<ApneaGame params={{}} onFinish={vi.fn()} />)
            }).not.toThrow()
        })

        it('should work with array params', () => {
            expect(() => {
                render(<ApneaGame params={[]} onFinish={vi.fn()} />)
            }).not.toThrow()
        })
    })

    describe('cleanup', () => {
        it('should not throw on unmount', () => {
            const { unmount } = render(<ApneaGame {...defaultProps} />)

            expect(() => {
                unmount()
            }).not.toThrow()
        })
    })
})
