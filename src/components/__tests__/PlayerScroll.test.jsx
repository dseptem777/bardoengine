import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Player from '../Player'

// Mock TextDisplay to control text rendering simply
vi.mock('../TextDisplay', () => ({
    default: ({ text, onComplete }) => {
        // Simulate typing completion immediately for some tests, or manually
        return <div data-testid="text-display">{text}</div>
    }
}))

describe('Player Auto-scrolling', () => {
    let resizeCallback
    let observeMock
    let disconnectMock
    let originalResizeObserver

    beforeEach(() => {
        // Setup ResizeObserver mock to capture callback
        observeMock = vi.fn()
        disconnectMock = vi.fn()
        resizeCallback = null

        originalResizeObserver = global.ResizeObserver
        global.ResizeObserver = class MockResizeObserver {
            constructor(callback) {
                resizeCallback = callback
            }
            observe = observeMock
            disconnect = disconnectMock
            unobserve = vi.fn()
        }
    })

    afterEach(() => {
        global.ResizeObserver = originalResizeObserver
        vi.restoreAllMocks()
    })

    const defaultProps = {
        text: 'Some story text...',
        choices: [],
        isEnded: false,
        onChoice: vi.fn(),
        onRestart: vi.fn(),
        onFinish: vi.fn(),
        onBack: vi.fn(),
        typewriterDelay: 0 // Instant typing for simplicity
    }

    it('should scroll to bottom when content resizes and sticky is active', () => {
        const { container } = render(<Player {...defaultProps} />)

        // Find the scroll container (main)
        const main = container.querySelector('main')

        // Mock scroll properties
        Object.defineProperty(main, 'scrollHeight', { value: 1000, configurable: true })
        Object.defineProperty(main, 'scrollTop', { value: 0, configurable: true })
        Object.defineProperty(main, 'clientHeight', { value: 500, configurable: true })

        // Mock scrollTo
        main.scrollTo = vi.fn()

        // Trigger resize observer callback
        expect(resizeCallback).toBeDefined()

        act(() => {
            resizeCallback([{ contentRect: {} }])
        })

        // Should have called scrollTo because default is sticky
        expect(main.scrollTo).toHaveBeenCalledWith({
            top: 1000,
            behavior: 'smooth'
        })
    })

    it('should NOT scroll to bottom if user scrolled up (sticky inactive)', () => {
        const { container } = render(<Player {...defaultProps} />)
        const main = container.querySelector('main')

        // Mock scrollTo
        main.scrollTo = vi.fn()

        // Simulate user scrolling up
        // sticky logic: isAtBottom = scrollHeight - scrollTop - clientHeight < 50
        // Let's set it so it's > 50
        // scrollHeight 1000, clientHeight 500. scrollTop 400.
        // 1000 - 400 - 500 = 100 > 50. Not at bottom.

        Object.defineProperty(main, 'scrollHeight', { value: 1000, configurable: true })
        Object.defineProperty(main, 'scrollTop', { value: 400, configurable: true })
        Object.defineProperty(main, 'clientHeight', { value: 500, configurable: true })

        // Trigger scroll event to update sticky state
        fireEvent.scroll(main)

        // Trigger resize
        act(() => {
            resizeCallback([{ contentRect: {} }])
        })

        // Should NOT have called scrollTo
        expect(main.scrollTo).not.toHaveBeenCalled()
    })

    it('should force scroll to bottom when new text arrives (resetting sticky)', () => {
        const { container, rerender } = render(<Player {...defaultProps} />)
        const main = container.querySelector('main')
        main.scrollTo = vi.fn()

        // 1. User scrolls up
        Object.defineProperty(main, 'scrollHeight', { value: 1000, configurable: true })
        Object.defineProperty(main, 'scrollTop', { value: 400, configurable: true })
        Object.defineProperty(main, 'clientHeight', { value: 500, configurable: true })
        fireEvent.scroll(main)

        // Verify sticky is off (resize shouldn't scroll)
        act(() => { resizeCallback([{ contentRect: {} }]) })
        expect(main.scrollTo).not.toHaveBeenCalled()

        // 2. New text arrives
        rerender(<Player {...defaultProps} text="New text arriving!" />)

        // 3. Trigger resize (which happens when new text renders)
        act(() => { resizeCallback([{ contentRect: {} }]) })

        // Should have called scrollTo because new text forces sticky
        expect(main.scrollTo).toHaveBeenCalledWith({
            top: 1000,
            behavior: 'smooth'
        })
    })
})
