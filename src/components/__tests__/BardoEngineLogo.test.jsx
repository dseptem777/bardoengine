/**
 * Tests for BardoEngineLogo component
 * Covers SVG logo with chaos star + sol de mayo design
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }) => (
            <div className={className} {...props}>{children}</div>
        ),
        svg: ({ children, className, width, height, viewBox, style, ...props }) => (
            <svg className={className} width={width} height={height} viewBox={viewBox} style={style} {...props}>{children}</svg>
        ),
        circle: (props) => <circle {...props} />,
        line: (props) => <line {...props} />,
        path: (props) => <path {...props} />
    }
}))

import BardoEngineLogo from '../BardoEngineLogo'

describe('BardoEngineLogo', () => {
    describe('rendering', () => {
        it('should render SVG element', () => {
            render(<BardoEngineLogo size={200} />)

            const svg = document.querySelector('svg')
            expect(svg).toBeInTheDocument()
        })

        it('should render with specified size', () => {
            render(<BardoEngineLogo size={150} />)

            const svg = document.querySelector('svg')
            expect(svg.getAttribute('width')).toBe('150')
            expect(svg.getAttribute('height')).toBe('150')
        })

        it('should show text by default', () => {
            render(<BardoEngineLogo showText={true} />)

            expect(screen.getByText('BARDOENGINE')).toBeInTheDocument()
        })

        it('should hide text when showText is false', () => {
            render(<BardoEngineLogo showText={false} />)

            expect(screen.queryByText('BARDOENGINE')).not.toBeInTheDocument()
        })
    })

    describe('rays', () => {
        it('should render 8 main rays', () => {
            render(<BardoEngineLogo size={200} />)

            // Each ray has a line element
            const lines = document.querySelectorAll('line')
            // 8 main rays + 8 secondary rays = 16
            expect(lines.length).toBe(16)
        })

        it('should render center circle', () => {
            render(<BardoEngineLogo size={200} />)

            const circles = document.querySelectorAll('circle')
            expect(circles.length).toBeGreaterThanOrEqual(2) // Outer ring + inner dot
        })
    })

    describe('className', () => {
        it('should apply custom className', () => {
            render(<BardoEngineLogo className="my-custom-class" />)

            const container = document.querySelector('.my-custom-class')
            expect(container).toBeInTheDocument()
        })
    })

    describe('default values', () => {
        it('should use default size of 200', () => {
            render(<BardoEngineLogo />)

            const svg = document.querySelector('svg')
            expect(svg.getAttribute('width')).toBe('200')
        })

        it('should show text by default', () => {
            render(<BardoEngineLogo />)

            expect(screen.getByText('BARDOENGINE')).toBeInTheDocument()
        })

        it('should be animated by default', () => {
            // Animation is handled by framer-motion, we just verify it renders
            render(<BardoEngineLogo animated={true} />)

            expect(document.querySelector('svg')).toBeInTheDocument()
        })
    })

    describe('logo structure', () => {
        it('should have glow filter defined', () => {
            render(<BardoEngineLogo />)

            const filter = document.querySelector('#glow')
            expect(filter).toBeInTheDocument()
        })

        it('should render arrow paths for rays', () => {
            render(<BardoEngineLogo />)

            const paths = document.querySelectorAll('path')
            expect(paths.length).toBe(8) // 8 arrow heads
        })
    })
})
