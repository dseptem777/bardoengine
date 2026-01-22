/**
 * Tests for IntroSequence component
 * Covers intro flow orchestration
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }) => (
            <div className={className} {...props}>{children}</div>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

// Track which phase we're at
let currentPhaseCallback = null

// Mock all subcomponents at the package level
vi.mock('../EngineLogoScreen', () => ({
    default: ({ onComplete }) => {
        currentPhaseCallback = onComplete
        return (
            <div data-testid="engine-logo">
                Engine Logo
                <button onClick={onComplete} data-testid="complete-engine">Complete Engine</button>
            </div>
        )
    }
}))

vi.mock('../IntroMoviePlayer', () => ({
    default: ({ onComplete }) => (
        <div data-testid="intro-movie">
            Intro Movie
            <button onClick={onComplete}>Skip</button>
        </div>
    )
}))

vi.mock('../TitleScreen', () => ({
    default: ({ gameTitle, onStart }) => (
        <div data-testid="title-screen">
            Title: {gameTitle}
            <button onClick={onStart} data-testid="start-game">Start Game</button>
        </div>
    )
}))

import IntroSequence from '../IntroSequence'

describe('IntroSequence', () => {
    const defaultProps = {
        gameTitle: 'Test Game',
        introConfig: {
            showEngineLogo: true,
            engineLogoDuration: 3000
        },
        audioHooks: null,
        onComplete: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
        currentPhaseCallback = null
    })

    it('should render engine logo when showEngineLogo is true', () => {
        render(<IntroSequence {...defaultProps} />)
        expect(screen.getByTestId('engine-logo')).toBeInTheDocument()
    })

    it('should render title screen when showEngineLogo is false', () => {
        render(
            <IntroSequence
                {...defaultProps}
                introConfig={{ showEngineLogo: false }}
            />
        )
        expect(screen.getByTestId('title-screen')).toBeInTheDocument()
    })

    it('should show title screen after completing engine logo', () => {
        render(<IntroSequence {...defaultProps} />)

        // Engine logo should be visible initially
        expect(screen.getByTestId('engine-logo')).toBeInTheDocument()

        // Complete the engine logo phase
        fireEvent.click(screen.getByTestId('complete-engine'))

        // Now title screen should be visible
        expect(screen.getByTestId('title-screen')).toBeInTheDocument()
    })

    it('should call onComplete when starting game', () => {
        const onComplete = vi.fn()
        render(
            <IntroSequence
                {...defaultProps}
                introConfig={{ showEngineLogo: false }}
                onComplete={onComplete}
            />
        )

        // We're at title screen
        expect(screen.getByTestId('title-screen')).toBeInTheDocument()

        // Start the game
        fireEvent.click(screen.getByTestId('start-game'))

        expect(onComplete).toHaveBeenCalled()
    })
})
