/**
 * Tests for ArkanoidGame component
 * Covers breakout-style minigame mechanics
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock requestAnimationFrame
let rafCallback = null
const mockRAF = vi.fn((cb) => {
    rafCallback = cb
    return 1
})
const mockCancelRAF = vi.fn()

beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', mockRAF)
    vi.stubGlobal('cancelAnimationFrame', mockCancelRAF)
})

afterEach(() => {
    vi.unstubAllGlobals()
    rafCallback = null
})

import ArkanoidGame from '../ArkanoidGame'

describe('ArkanoidGame', () => {
    const defaultProps = {
        params: [],
        onFinish: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render game title', () => {
            render(<ArkanoidGame {...defaultProps} />)

            expect(screen.getByText('Bardo-Noid')).toBeInTheDocument()
        })

        it('should render canvas element', () => {
            render(<ArkanoidGame {...defaultProps} />)

            const canvas = document.querySelector('canvas')
            expect(canvas).toBeInTheDocument()
        })

        it('should show SYSTEM ONLINE when playing', () => {
            render(<ArkanoidGame {...defaultProps} />)

            expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument()
        })

        it('should show control instructions', () => {
            render(<ArkanoidGame {...defaultProps} />)

            expect(screen.getByText(/MOUSE PARA MOVER/)).toBeInTheDocument()
        })
    })

    describe('canvas dimensions', () => {
        it('should create canvas with correct dimensions', () => {
            render(<ArkanoidGame {...defaultProps} />)

            const canvas = document.querySelector('canvas')
            expect(canvas.width).toBe(400)
            expect(canvas.height).toBe(400)
        })
    })

    describe('mouse interaction', () => {
        it('should handle mouse move events', () => {
            render(<ArkanoidGame {...defaultProps} />)

            const canvas = document.querySelector('canvas')

            // Should not throw when moving mouse
            expect(() => {
                fireEvent.mouseMove(canvas, { clientX: 200, clientY: 300 })
            }).not.toThrow()
        })
    })

    describe('touch interaction', () => {
        it('should handle touch move events', () => {
            render(<ArkanoidGame {...defaultProps} />)

            const canvas = document.querySelector('canvas')

            expect(() => {
                fireEvent.touchMove(canvas, {
                    touches: [{ clientX: 200 }]
                })
            }).not.toThrow()
        })
    })

    describe('game loop', () => {
        it('should start animation frame when playing', () => {
            render(<ArkanoidGame {...defaultProps} />)

            expect(mockRAF).toHaveBeenCalled()
        })

        it('should cancel animation frame on unmount', () => {
            const { unmount } = render(<ArkanoidGame {...defaultProps} />)

            unmount()

            expect(mockCancelRAF).toHaveBeenCalled()
        })
    })
})
