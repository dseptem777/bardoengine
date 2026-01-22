/**
 * Tests for AchievementsPage component
 * Covers achievement display and progress
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>{children}</div>
        ),
        button: ({ children, className, onClick, ...props }) => (
            <button className={className} onClick={onClick} {...props}>{children}</button>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

import AchievementsPage from '../AchievementsPage'

describe('AchievementsPage', () => {
    const mockAchievements = [
        { id: 'first_blood', displayTitle: 'First Blood', displayDescription: 'Complete chapter 1', icon: '🎯', unlocked: true },
        { id: 'explorer', displayTitle: 'Explorer', displayDescription: 'Discover all locations', icon: '🗺️', unlocked: false },
        { id: 'completionist', displayTitle: 'Completionist', displayDescription: 'Finish the game', icon: '🏆', unlocked: false }
    ]

    const defaultProps = {
        achievements: mockAchievements,
        stats: { total: 3, unlocked: 1, percentage: 33 },
        onResetAll: vi.fn(),
        onBack: vi.fn()
    }

    describe('rendering', () => {
        it('should render title', () => {
            render(<AchievementsPage {...defaultProps} />)

            expect(screen.getByText('LOGROS')).toBeInTheDocument()
        })

        it('should show progress count', () => {
            render(<AchievementsPage {...defaultProps} />)

            expect(screen.getByText('1/3')).toBeInTheDocument()
        })

        it('should show percentage', () => {
            render(<AchievementsPage {...defaultProps} />)

            expect(screen.getByText('33%')).toBeInTheDocument()
        })
    })

    describe('achievements list', () => {
        it('should display all achievements', () => {
            render(<AchievementsPage {...defaultProps} />)

            expect(screen.getByText('First Blood')).toBeInTheDocument()
            expect(screen.getByText('Explorer')).toBeInTheDocument()
            expect(screen.getByText('Completionist')).toBeInTheDocument()
        })

        it('should show achievement icons', () => {
            render(<AchievementsPage {...defaultProps} />)

            expect(screen.getByText('🎯')).toBeInTheDocument()
        })
    })

    describe('back button', () => {
        it('should call onBack when clicked', () => {
            const onBack = vi.fn()
            render(<AchievementsPage {...defaultProps} onBack={onBack} />)

            fireEvent.click(screen.getByText('← Volver'))

            expect(onBack).toHaveBeenCalled()
        })
    })

    describe('reset functionality', () => {
        it('should show reset button when achievements are unlocked', () => {
            render(<AchievementsPage {...defaultProps} />)

            expect(screen.getByText(/Borrar todos los logros/)).toBeInTheDocument()
        })

        it('should not show reset button when no achievements unlocked', () => {
            render(<AchievementsPage {...defaultProps} stats={{ total: 3, unlocked: 0, percentage: 0 }} />)

            expect(screen.queryByText(/Borrar todos los logros/)).not.toBeInTheDocument()
        })
    })

    describe('empty state', () => {
        it('should show empty message when no achievements', () => {
            render(<AchievementsPage {...defaultProps} achievements={[]} stats={{ total: 0, unlocked: 0, percentage: 0 }} />)

            expect(screen.getByText(/no tiene logros definidos/)).toBeInTheDocument()
        })
    })
})
