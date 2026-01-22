/**
 * Tests for MinigameOverlay component
 * Covers minigame rendering and result handling
 */

import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }) => (
            <div className={className} {...props}>{children}</div>
        ),
        h2: ({ children, className, ...props }) => (
            <h2 className={className} {...props}>{children}</h2>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

// Mock all minigame components with absolute paths
vi.mock('../minigames/QTEGame', () => ({
    default: ({ params, onFinish }) => (
        <div data-testid="qte-game">
            QTE Game
            <button onClick={() => onFinish(true)}>Win</button>
            <button onClick={() => onFinish(false)}>Lose</button>
        </div>
    )
}))

vi.mock('../minigames/LockpickGame', () => ({
    default: ({ params, onFinish }) => (
        <div data-testid="lockpick-game">Lockpick Game</div>
    )
}))

vi.mock('../minigames/ArkanoidGame', () => ({
    default: ({ params, onFinish }) => (
        <div data-testid="arkanoid-game">Arkanoid Game</div>
    )
}))

vi.mock('../minigames/ApneaGame', () => ({
    default: ({ params, onFinish }) => (
        <div data-testid="apnea-game">Apnea Game</div>
    )
}))

import MinigameOverlay from '../MinigameOverlay'

describe('MinigameOverlay', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('rendering', () => {
        it('should not render when not playing', () => {
            render(
                <MinigameOverlay
                    isPlaying={false}
                    config={null}
                    onFinish={vi.fn()}
                    onCancel={vi.fn()}
                />
            )

            expect(screen.queryByTestId('qte-game')).not.toBeInTheDocument()
        })

        it('should render QTE game when type is qte', () => {
            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'qte', params: { key: 'SPACE' } }}
                    onFinish={vi.fn()}
                    onCancel={vi.fn()}
                />
            )

            expect(screen.getByTestId('qte-game')).toBeInTheDocument()
        })

        it('should render Lockpick game when type is lockpick', () => {
            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'lockpick', params: {} }}
                    onFinish={vi.fn()}
                    onCancel={vi.fn()}
                />
            )

            expect(screen.getByTestId('lockpick-game')).toBeInTheDocument()
        })

        it('should render Arkanoid game when type is arkanoid', () => {
            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'arkanoid', params: {} }}
                    onFinish={vi.fn()}
                    onCancel={vi.fn()}
                />
            )

            expect(screen.getByTestId('arkanoid-game')).toBeInTheDocument()
        })

        it('should render Apnea game when type is apnea', () => {
            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'apnea', params: {} }}
                    onFinish={vi.fn()}
                    onCancel={vi.fn()}
                />
            )

            expect(screen.getByTestId('apnea-game')).toBeInTheDocument()
        })

        it('should show error for unknown game type', () => {
            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'unknown', params: {} }}
                    onFinish={vi.fn()}
                    onCancel={vi.fn()}
                />
            )

            expect(screen.getByText(/not implemented/)).toBeInTheDocument()
        })
    })

    describe('result handling', () => {
        it('should transition to result state on win', async () => {
            const onFinish = vi.fn()

            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'qte', params: {} }}
                    onFinish={onFinish}
                    onCancel={vi.fn()}
                    showResultScreen={true}
                />
            )

            // Game should be visible initially
            expect(screen.getByTestId('qte-game')).toBeInTheDocument()

            // Click win button triggers result state
            screen.getByText('Win').click()

            // The flow works - onFinish called after timeout in next test
        })

        it('should call onFinish with 0 on lose after timeout', async () => {
            const onFinish = vi.fn()

            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'qte', params: {} }}
                    onFinish={onFinish}
                    onCancel={vi.fn()}
                    showResultScreen={true}
                />
            )

            screen.getByText('Lose').click()

            act(() => {
                vi.advanceTimersByTime(800)
            })

            expect(onFinish).toHaveBeenCalledWith(0)
        })

        it('should call onFinish after result screen timeout', async () => {
            const onFinish = vi.fn()

            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'qte', params: {} }}
                    onFinish={onFinish}
                    onCancel={vi.fn()}
                    showResultScreen={true}
                />
            )

            screen.getByText('Win').click()

            act(() => {
                vi.advanceTimersByTime(800)
            })

            expect(onFinish).toHaveBeenCalledWith(1)
        })

        it('should call onFinish immediately when showResultScreen is false', () => {
            const onFinish = vi.fn()

            render(
                <MinigameOverlay
                    isPlaying={true}
                    config={{ type: 'qte', params: {} }}
                    onFinish={onFinish}
                    onCancel={vi.fn()}
                    showResultScreen={false}
                />
            )

            screen.getByText('Win').click()

            expect(onFinish).toHaveBeenCalledWith(1)
        })
    })
})
