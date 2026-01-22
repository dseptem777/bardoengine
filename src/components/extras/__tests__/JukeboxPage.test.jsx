/**
 * Tests for JukeboxPage component
 * Covers music player functionality
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }) => (
            <div className={className} {...props}>{children}</div>
        ),
        button: ({ children, className, onClick, disabled, ...props }) => (
            <button className={className} onClick={onClick} disabled={disabled} {...props}>{children}</button>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

import JukeboxPage from '../JukeboxPage'

describe('JukeboxPage', () => {
    const mockTracks = [
        { id: 'theme', title: 'Main Theme', unlockedBy: null },
        { id: 'battle', title: 'Battle Music', unlockedBy: 'first_battle' },
        { id: 'secret', title: 'Hidden Track', unlockedBy: 'secret_ending' }
    ]

    const defaultProps = {
        tracks: mockTracks,
        unlockedAchievements: ['first_battle'],
        playMusic: vi.fn(),
        stopMusic: vi.fn(),
        currentTrack: null,
        onBack: vi.fn()
    }

    describe('rendering', () => {
        it('should render title', () => {
            render(<JukeboxPage {...defaultProps} />)

            expect(screen.getByText('JUKEBOX')).toBeInTheDocument()
        })

        it('should show unlock count', () => {
            render(<JukeboxPage {...defaultProps} />)

            // Theme (no unlockedBy) + Battle (unlocked via first_battle)
            expect(screen.getByText(/2\/3 desbloqueados/)).toBeInTheDocument()
        })
    })

    describe('track list', () => {
        it('should show titles for unlocked tracks', () => {
            render(<JukeboxPage {...defaultProps} />)

            expect(screen.getByText('Main Theme')).toBeInTheDocument()
            expect(screen.getByText('Battle Music')).toBeInTheDocument()
        })

        it('should show ??? for locked tracks', () => {
            render(<JukeboxPage {...defaultProps} />)

            expect(screen.getByText('???')).toBeInTheDocument()
        })

        it('should show lock icon for locked tracks', () => {
            render(<JukeboxPage {...defaultProps} />)

            expect(screen.getByText('🔒')).toBeInTheDocument()
        })

        it('should show play icon for unlocked tracks', () => {
            render(<JukeboxPage {...defaultProps} />)

            const playIcons = screen.getAllByText('▶️')
            expect(playIcons.length).toBeGreaterThan(0)
        })
    })

    describe('playback', () => {
        it('should call playMusic when track clicked', () => {
            const playMusic = vi.fn()
            render(<JukeboxPage {...defaultProps} playMusic={playMusic} />)

            fireEvent.click(screen.getByText('Main Theme').closest('button'))

            expect(playMusic).toHaveBeenCalledWith('theme')
        })

        it('should call stopMusic when playing track clicked again', () => {
            const playMusic = vi.fn()
            const stopMusic = vi.fn()
            render(<JukeboxPage {...defaultProps} playMusic={playMusic} stopMusic={stopMusic} />)

            const trackButton = screen.getByText('Main Theme').closest('button')

            // First click - play
            fireEvent.click(trackButton)
            expect(playMusic).toHaveBeenCalledWith('theme')

            // Second click - stop
            fireEvent.click(trackButton)
            expect(stopMusic).toHaveBeenCalled()
        })
    })

    describe('back button', () => {
        it('should call onBack when clicked', () => {
            const onBack = vi.fn()
            render(<JukeboxPage {...defaultProps} onBack={onBack} />)

            fireEvent.click(screen.getByText('← Volver'))

            expect(onBack).toHaveBeenCalled()
        })

        it('should stop music when leaving', () => {
            const stopMusic = vi.fn()
            const onBack = vi.fn()
            render(<JukeboxPage {...defaultProps} stopMusic={stopMusic} onBack={onBack} />)

            fireEvent.click(screen.getByText('← Volver'))

            expect(stopMusic).toHaveBeenCalled()
        })
    })

    describe('empty state', () => {
        it('should show empty message when no tracks', () => {
            render(<JukeboxPage {...defaultProps} tracks={[]} />)

            expect(screen.getByText(/no tiene jukebox/)).toBeInTheDocument()
        })
    })
})
