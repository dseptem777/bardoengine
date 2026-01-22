/**
 * Tests for VFXLayer component
 * Covers visual effect rendering based on vfxState
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion before importing component
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, style, ...props }) => (
            <div className={className} style={style} data-testid="motion-div">{children}</div>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

// Import after mocks
import VFXLayer from '../VFXLayer'

describe('VFXLayer', () => {
    describe('shake effect', () => {
        it('should inject shake keyframes when shake is true', () => {
            render(<VFXLayer vfxState={{ shake: true, flash: null }} />)

            // When shake is true, a style element with keyframes is injected
            const styleElement = document.querySelector('style')
            expect(styleElement).toBeInTheDocument()
            expect(styleElement.textContent).toContain('@keyframes shake')
        })

        it('should not inject shake keyframes when shake is false', () => {
            render(<VFXLayer vfxState={{ shake: false, flash: null }} />)

            const styleElement = document.querySelector('style')
            expect(styleElement).not.toBeInTheDocument()
        })
    })

    describe('flash effect', () => {
        it('should render flash overlay when flash color is set', () => {
            render(<VFXLayer vfxState={{ shake: false, flash: 'red' }} />)

            const overlay = screen.getByTestId('motion-div')
            expect(overlay).toBeInTheDocument()
            expect(overlay).toHaveClass('fixed', 'inset-0')
        })

        it('should not render flash overlay when flash is null', () => {
            render(<VFXLayer vfxState={{ shake: false, flash: null }} />)

            expect(screen.queryByTestId('motion-div')).not.toBeInTheDocument()
        })

        it('should apply correct background color for flash', () => {
            render(<VFXLayer vfxState={{ shake: false, flash: 'blue' }} />)

            const overlay = screen.getByTestId('motion-div')
            expect(overlay.style.backgroundColor).toContain('59, 130, 246')
        })
    })

    describe('combined effects', () => {
        it('should render both shake and flash when both are active', () => {
            render(<VFXLayer vfxState={{ shake: true, flash: 'yellow' }} />)

            const styleElement = document.querySelector('style')
            expect(styleElement).toBeInTheDocument()

            const overlay = screen.getByTestId('motion-div')
            expect(overlay).toBeInTheDocument()
        })
    })
})
