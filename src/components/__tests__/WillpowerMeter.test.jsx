/**
 * Tests for WillpowerMeter (immersive overlay rewrite)
 *
 * Covers:
 *   - Audio starts/stops with active prop
 *   - Corruption hook is called
 *   - Key handler triggers boost and whisper appears
 *   - Eye color changes at value thresholds
 *   - Cleanup on unmount
 */

import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock framer-motion ───────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, style, 'data-testid': testId, ...props }) => (
            <div className={className} style={style} data-testid={testId} {...props}>
                {children}
            </div>
        ),
        span: ({ children, className, style, 'data-testid': testId, ...props }) => (
            <span className={className} style={style} data-testid={testId} {...props}>
                {children}
            </span>
        ),
        g: ({ children, style, ...props }) => (
            <g style={style} {...props}>{children}</g>
        ),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}))

// ─── Mock useWillpowerAudio ───────────────────────────────────────────────────
const mockAudioStart = vi.fn()
const mockAudioStop = vi.fn()
const mockAudioSetIntensity = vi.fn()

vi.mock('../../hooks/useWillpowerAudio', () => ({
    useWillpowerAudio: vi.fn((onStaticBurst, _vol) => ({
        start: mockAudioStart,
        stop: mockAudioStop,
        setIntensity: mockAudioSetIntensity,
        // Expose callback so tests can trigger it
        _onStaticBurst: onStaticBurst,
    })),
}))

// ─── Mock useWillpowerCorruption ──────────────────────────────────────────────
vi.mock('../../hooks/useWillpowerCorruption', () => ({
    useWillpowerCorruption: vi.fn(),
}))

// ─── Import after mocks ───────────────────────────────────────────────────────
import WillpowerMeter from '../WillpowerMeter'
import { useWillpowerAudio } from '../../hooks/useWillpowerAudio'
import { useWillpowerCorruption } from '../../hooks/useWillpowerCorruption'

// ─── Tests ────────────────────────────────────────────────────────────────────

// ─── matchMedia helper ────────────────────────────────────────────────────────
function mockMatchMedia(matches) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn((query) => ({
            matches,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
}

describe('WillpowerMeter', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.clearAllMocks()
        // Default: non-touch device
        mockMatchMedia(false)
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    // ── Visibility ────────────────────────────────────────────────────────────

    describe('visibility', () => {
        it('renders nothing when active=false', () => {
            const { container } = render(
                <WillpowerMeter active={false} value={80} boostValue={vi.fn()} />
            )
            expect(container.firstChild).toBeNull()
        })

        it('renders eye SVG when active=true', () => {
            render(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)
            expect(screen.getByTestId('willpower-eye')).toBeInTheDocument()
        })

        it('renders the target key label', () => {
            render(
                <WillpowerMeter active={true} value={80} targetKey="V" boostValue={vi.fn()} />
            )
            expect(screen.getByText('V')).toBeInTheDocument()
        })
    })

    // ── Audio lifecycle ───────────────────────────────────────────────────────

    describe('audio lifecycle', () => {
        it('calls audio.start() when active becomes true', () => {
            render(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)
            expect(mockAudioStart).toHaveBeenCalledTimes(1)
        })

        it('does not call audio.start() when active=false', () => {
            render(<WillpowerMeter active={false} value={80} boostValue={vi.fn()} />)
            expect(mockAudioStart).not.toHaveBeenCalled()
        })

        it('calls audio.stop() when active switches from true to false', () => {
            const { rerender } = render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            rerender(<WillpowerMeter active={false} value={80} boostValue={vi.fn()} />)
            // stop() called either by effect cleanup or the active=false branch
            expect(mockAudioStop).toHaveBeenCalled()
        })

        it('calls audio.stop() on unmount', () => {
            const { unmount } = render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            mockAudioStop.mockClear()
            unmount()
            expect(mockAudioStop).toHaveBeenCalled()
        })

        it('calls audio.setIntensity with correct value', () => {
            render(<WillpowerMeter active={true} value={60} boostValue={vi.fn()} />)
            // intensity = 1 - 60/100 = 0.4
            expect(mockAudioSetIntensity).toHaveBeenCalledWith(0.4)
        })

        it('updates audio intensity when value changes', () => {
            const { rerender } = render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            mockAudioSetIntensity.mockClear()
            rerender(<WillpowerMeter active={true} value={20} boostValue={vi.fn()} />)
            // intensity = 1 - 20/100 = 0.8
            expect(mockAudioSetIntensity).toHaveBeenCalledWith(0.8)
        })
    })

    // ── Corruption hook ───────────────────────────────────────────────────────

    describe('corruption hook', () => {
        it('calls useWillpowerCorruption with active and value', () => {
            render(<WillpowerMeter active={true} value={55} boostValue={vi.fn()} />)
            expect(useWillpowerCorruption).toHaveBeenCalledWith(true, 55)
        })

        it('calls useWillpowerCorruption with active=false when not active', () => {
            render(<WillpowerMeter active={false} value={80} boostValue={vi.fn()} />)
            expect(useWillpowerCorruption).toHaveBeenCalledWith(false, 80)
        })
    })

    // ── Key handler ───────────────────────────────────────────────────────────

    describe('key handler', () => {
        it('calls boostValue on V keypress when active', () => {
            const boostValue = vi.fn()
            render(
                <WillpowerMeter
                    active={true}
                    value={80}
                    decayRate="normal"
                    targetKey="V"
                    boostValue={boostValue}
                />
            )

            fireEvent.keyDown(window, { key: 'v' })
            expect(boostValue).toHaveBeenCalledWith(6)  // BOOST_AMOUNTS.normal
        })

        it('calls boostValue with correct amount for extreme difficulty', () => {
            const boostValue = vi.fn()
            render(
                <WillpowerMeter
                    active={true}
                    value={80}
                    decayRate="extreme"
                    targetKey="V"
                    boostValue={boostValue}
                />
            )

            fireEvent.keyDown(window, { key: 'V' })
            expect(boostValue).toHaveBeenCalledWith(2.5)  // BOOST_AMOUNTS.extreme
        })

        it('does not call boostValue on wrong key', () => {
            const boostValue = vi.fn()
            render(
                <WillpowerMeter
                    active={true}
                    value={80}
                    targetKey="V"
                    boostValue={boostValue}
                />
            )

            fireEvent.keyDown(window, { key: 'X' })
            expect(boostValue).not.toHaveBeenCalled()
        })

        it('does not call boostValue when inactive', () => {
            const boostValue = vi.fn()
            render(
                <WillpowerMeter
                    active={false}
                    value={80}
                    targetKey="V"
                    boostValue={boostValue}
                />
            )

            fireEvent.keyDown(window, { key: 'v' })
            expect(boostValue).not.toHaveBeenCalled()
        })

        it('is case-insensitive for targetKey', () => {
            const boostValue = vi.fn()
            render(
                <WillpowerMeter
                    active={true}
                    value={80}
                    decayRate="slow"
                    targetKey="V"
                    boostValue={boostValue}
                />
            )

            fireEvent.keyDown(window, { key: 'V' })
            expect(boostValue).toHaveBeenCalledWith(8)  // BOOST_AMOUNTS.slow
        })
    })

    // ── Eye color at value thresholds ─────────────────────────────────────────

    describe('eye color thresholds', () => {
        it('uses cool/white color at value > 60', () => {
            render(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)
            const svg = screen.getByTestId('willpower-eye')
            // Ellipse stroke should use white/cool color
            const ellipse = svg.querySelector('ellipse')
            expect(ellipse.getAttribute('stroke')).toBe('#e2e8f0')
        })

        it('uses amber color at value 30-60', () => {
            render(<WillpowerMeter active={true} value={45} boostValue={vi.fn()} />)
            const svg = screen.getByTestId('willpower-eye')
            const ellipse = svg.querySelector('ellipse')
            expect(ellipse.getAttribute('stroke')).toBe('#f59e0b')
        })

        it('uses red color at value 15-30', () => {
            render(<WillpowerMeter active={true} value={20} boostValue={vi.fn()} />)
            const svg = screen.getByTestId('willpower-eye')
            const ellipse = svg.querySelector('ellipse')
            expect(ellipse.getAttribute('stroke')).toBe('#dc2626')
        })

        it('uses dark red color at value < 15', () => {
            render(<WillpowerMeter active={true} value={10} boostValue={vi.fn()} />)
            const svg = screen.getByTestId('willpower-eye')
            const ellipse = svg.querySelector('ellipse')
            expect(ellipse.getAttribute('stroke')).toBe('#991b1b')
        })
    })

    // ── Eye geometry ──────────────────────────────────────────────────────────

    describe('eye geometry', () => {
        it('renders the upper eyelid path', () => {
            render(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)
            const lid = screen.getByTestId('upper-lid')
            expect(lid).toBeInTheDocument()
        })

        it('upper lid path is higher (more open) at full willpower', () => {
            render(<WillpowerMeter active={true} value={100} boostValue={vi.fn()} />)
            const lid = screen.getByTestId('upper-lid')
            // At value=100, openness=1, lidY = 25 - 1*20 = 5
            expect(lid.getAttribute('d')).toContain('Q 40 5')
        })

        it('upper lid path is lower (more closed) at zero willpower', () => {
            render(<WillpowerMeter active={true} value={0} boostValue={vi.fn()} />)
            const lid = screen.getByTestId('upper-lid')
            // At value=0, openness=0, lidY = 25 - 0*20 = 25
            expect(lid.getAttribute('d')).toContain('Q 40 25')
        })

        it('shine disappears below value 20', () => {
            render(<WillpowerMeter active={true} value={15} boostValue={vi.fn()} />)
            const svg = screen.getByTestId('willpower-eye')
            const circles = svg.querySelectorAll('circle')
            // Last circle is the shine dot
            const shine = circles[circles.length - 1]
            expect(shine.getAttribute('opacity')).toBe('0')
        })

        it('shine is visible above value 20', () => {
            render(<WillpowerMeter active={true} value={50} boostValue={vi.fn()} />)
            const svg = screen.getByTestId('willpower-eye')
            const circles = svg.querySelectorAll('circle')
            const shine = circles[circles.length - 1]
            expect(parseFloat(shine.getAttribute('opacity'))).toBeGreaterThan(0)
        })
    })

    // ── Whisper texts ─────────────────────────────────────────────────────────

    describe('whisper texts', () => {
        it('shows a whisper text shortly after becoming active', () => {
            render(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)
            // Whisper is scheduled immediately; it shows up right away (scheduleNext calls setWhisper)
            expect(screen.getByTestId('whisper-text')).toBeInTheDocument()
        })

        it('whisper disappears after 3-4 seconds then a new one appears', () => {
            // Mock Math.random to 0 for deterministic timing:
            // fade-out = 3000ms, interval = 4000ms, next fade-out = 10000ms
            vi.spyOn(Math, 'random').mockReturnValue(0)
            render(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)

            // First whisper shown immediately
            expect(screen.getByTestId('whisper-text')).toBeInTheDocument()

            // After 3s (show-timeout with random=0) — whisper clears
            act(() => { vi.advanceTimersByTime(3001) })
            expect(screen.queryByTestId('whisper-text')).toBeNull()

            // After 4s interval (with random=0), next whisper appears — fades at t=10s, still visible
            act(() => { vi.advanceTimersByTime(4001) })
            expect(screen.getByTestId('whisper-text')).toBeInTheDocument()
        })

        it('clears whisper when active becomes false', () => {
            const { rerender } = render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            expect(screen.getByTestId('whisper-text')).toBeInTheDocument()

            rerender(<WillpowerMeter active={false} value={80} boostValue={vi.fn()} />)
            expect(screen.queryByTestId('whisper-text')).toBeNull()
        })

        it('whisper triggered by static burst (handleStaticBurst)', () => {
            let capturedCallback = null
            useWillpowerAudio.mockImplementation((onStaticBurst) => {
                capturedCallback = onStaticBurst
                return {
                    start: mockAudioStart,
                    stop: mockAudioStop,
                    setIntensity: mockAudioSetIntensity,
                }
            })

            render(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)

            // Trigger static burst callback
            act(() => {
                if (capturedCallback) capturedCallback()
            })

            expect(screen.getByTestId('whisper-text')).toBeInTheDocument()
        })
    })

    // ── Cleanup on unmount ────────────────────────────────────────────────────

    describe('cleanup on unmount', () => {
        it('stops audio on unmount', () => {
            const { unmount } = render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            mockAudioStop.mockClear()
            unmount()
            expect(mockAudioStop).toHaveBeenCalled()
        })

        it('removes keydown listener on unmount (boostValue not called after unmount)', () => {
            const boostValue = vi.fn()
            const { unmount } = render(
                <WillpowerMeter active={true} value={80} targetKey="V" boostValue={boostValue} />
            )
            unmount()
            boostValue.mockClear()
            fireEvent.keyDown(window, { key: 'v' })
            expect(boostValue).not.toHaveBeenCalled()
        })
    })

    // ── Touch support ─────────────────────────────────────────────────────────

    describe('touch support', () => {
        it('shows [V] key prompt on non-touch device', () => {
            mockMatchMedia(false)
            render(
                <WillpowerMeter active={true} value={80} targetKey="V" boostValue={vi.fn()} />
            )
            expect(screen.getByText('V')).toBeInTheDocument()
        })

        it('hides [V] key prompt on pure touch device', () => {
            mockMatchMedia(true)
            render(
                <WillpowerMeter active={true} value={80} targetKey="V" boostValue={vi.fn()} />
            )
            expect(screen.queryByText('V')).toBeNull()
        })

        it('shows TOCA hint on first activation on touch device', () => {
            mockMatchMedia(true)
            render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            expect(screen.getByTestId('touch-hint')).toBeInTheDocument()
            expect(screen.getByText('TOCA')).toBeInTheDocument()
        })

        it('does not show TOCA hint on non-touch device', () => {
            mockMatchMedia(false)
            render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            expect(screen.queryByTestId('touch-hint')).toBeNull()
        })

        it('hides TOCA hint after 5 seconds', () => {
            mockMatchMedia(true)
            render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            expect(screen.getByTestId('touch-hint')).toBeInTheDocument()

            act(() => { vi.advanceTimersByTime(5001) })
            expect(screen.queryByTestId('touch-hint')).toBeNull()
        })

        it('calls boostValue on touch and hides hint', () => {
            mockMatchMedia(true)
            const boostValue = vi.fn()
            render(
                <WillpowerMeter
                    active={true}
                    value={80}
                    decayRate="normal"
                    boostValue={boostValue}
                />
            )

            const touchZone = screen.getByTestId('eye-touch-zone')
            fireEvent.touchStart(touchZone)

            expect(boostValue).toHaveBeenCalledWith(6)  // BOOST_AMOUNTS.normal
            expect(screen.queryByTestId('touch-hint')).toBeNull()
        })

        it('does not call boostValue on touch when inactive', () => {
            mockMatchMedia(true)
            const boostValue = vi.fn()
            render(
                <WillpowerMeter active={false} value={80} boostValue={boostValue} />
            )
            // Component renders null when inactive, so touch zone doesn't exist
            expect(screen.queryByTestId('eye-touch-zone')).toBeNull()
            expect(boostValue).not.toHaveBeenCalled()
        })

        it('touch zone exists on non-touch device too (keyboard users may have touch screens)', () => {
            mockMatchMedia(false)
            render(
                <WillpowerMeter active={true} value={80} boostValue={vi.fn()} />
            )
            expect(screen.getByTestId('eye-touch-zone')).toBeInTheDocument()
        })

        it('does not show TOCA hint when inactive transitions to active on non-touch device', () => {
            mockMatchMedia(false)
            const { rerender } = render(
                <WillpowerMeter active={false} value={80} boostValue={vi.fn()} />
            )
            rerender(<WillpowerMeter active={true} value={80} boostValue={vi.fn()} />)
            expect(screen.queryByTestId('touch-hint')).toBeNull()
        })
    })
})
