/**
 * Tests for ExtrasMenu component
 * Covers navigation between achievements, gallery, and jukebox
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>{children}</div>
        ),
        button: ({ children, className, onClick, disabled, ...props }) => (
            <button className={className} onClick={onClick} disabled={disabled} {...props}>{children}</button>
        )
    },
    AnimatePresence: ({ children, mode }) => <>{children}</>
}))

// Mock child pages at the package level
vi.mock('../extras/AchievementsPage', () => ({
    default: ({ onBack }) => (
        <div data-testid="achievements-page">
            Achievements Page
            <button onClick={onBack} data-testid="back-btn">Back</button>
        </div>
    )
}))

vi.mock('../extras/GalleryPage', () => ({
    default: ({ onBack }) => (
        <div data-testid="gallery-page">
            Gallery Page
            <button onClick={onBack}>Back</button>
        </div>
    )
}))

vi.mock('../extras/JukeboxPage', () => ({
    default: ({ onBack }) => (
        <div data-testid="jukebox-page">
            Jukebox Page
            <button onClick={onBack}>Back</button>
        </div>
    )
}))

import ExtrasMenu from '../ExtrasMenu'

describe('ExtrasMenu', () => {
    // Default props need actual content to show menu items
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        achievements: [{ id: 'test', title: 'Test', unlocked: false }],
        achievementStats: { total: 10, unlocked: 5, percentage: 50 },
        unlockedAchievementIds: [],
        onResetAchievements: vi.fn(),
        gallery: [{ id: 'art1', title: 'Art 1' }],
        jukebox: [{ id: 'track1', title: 'Track 1' }],
        playMusic: vi.fn(),
        stopMusic: vi.fn(),
        currentTrack: null
    }

    describe('when closed', () => {
        it('should not render when not open', () => {
            render(<ExtrasMenu {...defaultProps} isOpen={false} />)
            expect(screen.queryByText('EXTRAS')).not.toBeInTheDocument()
        })
    })

    describe('main menu', () => {
        it('should render when open', () => {
            render(<ExtrasMenu {...defaultProps} />)
            expect(screen.getByText('EXTRAS')).toBeInTheDocument()
        })

        it('should show all menu items when content exists', () => {
            render(<ExtrasMenu {...defaultProps} />)
            expect(screen.getByText('LOGROS')).toBeInTheDocument()
            expect(screen.getByText('GALERÍA')).toBeInTheDocument()
            expect(screen.getByText('JUKEBOX')).toBeInTheDocument()
        })

        it('should show achievement stats', () => {
            render(<ExtrasMenu {...defaultProps} />)
            expect(screen.getByText('5/10')).toBeInTheDocument()
        })
    })

    describe('navigation', () => {
        it('should navigate to achievements page when LOGROS clicked', () => {
            render(<ExtrasMenu {...defaultProps} />)
            fireEvent.click(screen.getByText('LOGROS'))
            expect(screen.getByTestId('achievements-page')).toBeInTheDocument()
        })

        it('should navigate to gallery page when GALERÍA clicked', () => {
            render(<ExtrasMenu {...defaultProps} />)
            fireEvent.click(screen.getByText('GALERÍA'))
            expect(screen.getByTestId('gallery-page')).toBeInTheDocument()
        })

        it('should navigate to jukebox page when JUKEBOX clicked', () => {
            render(<ExtrasMenu {...defaultProps} />)
            fireEvent.click(screen.getByText('JUKEBOX'))
            expect(screen.getByTestId('jukebox-page')).toBeInTheDocument()
        })

        it('should return to menu when back is clicked', () => {
            render(<ExtrasMenu {...defaultProps} />)
            fireEvent.click(screen.getByText('LOGROS'))
            fireEvent.click(screen.getByTestId('back-btn'))
            expect(screen.getByText('EXTRAS')).toBeInTheDocument()
        })
    })

    describe('close button', () => {
        it('should call onClose when X clicked', () => {
            const onClose = vi.fn()
            render(<ExtrasMenu {...defaultProps} onClose={onClose} />)
            fireEvent.click(screen.getByText('✕'))
            expect(onClose).toHaveBeenCalled()
        })
    })
})
