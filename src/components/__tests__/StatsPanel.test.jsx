/**
 * Tests for StatsPanel component
 * Covers stats display for bars and values
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, style, ...props }) => (
            <div className={className} style={style} {...props}>{children}</div>
        )
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))

import StatsPanel from '../StatsPanel'

describe('StatsPanel', () => {
    const mockStatsConfig = {
        enabled: true,
        stats: [
            { id: 'hp', label: 'HP', icon: '❤️', type: 'bar', displayType: 'bar', max: 100, color: '#ef4444' },
            { id: 'mp', label: 'MP', icon: '💙', type: 'bar', displayType: 'bar', max: 50, color: '#3b82f6' },
            { id: 'str', label: 'STR', icon: '💪', type: 'value', displayType: 'value', color: '#facc15' }
        ]
    }

    const mockStats = {
        hp: 75,
        mp: 30,
        str: 10
    }

    const mockGetAllStatsInfo = () => mockStatsConfig.stats.map(stat => ({
        ...stat,
        value: mockStats[stat.id]
    }))

    describe('rendering', () => {
        it('should render when enabled', () => {
            render(
                <StatsPanel
                    stats={mockStats}
                    statsConfig={mockStatsConfig}
                    getAllStatsInfo={mockGetAllStatsInfo}
                />
            )

            expect(screen.getByText('HP')).toBeInTheDocument()
        })

        it('should not render when disabled', () => {
            render(
                <StatsPanel
                    stats={mockStats}
                    statsConfig={{ enabled: false }}
                    getAllStatsInfo={() => []}
                />
            )

            expect(screen.queryByText('HP')).not.toBeInTheDocument()
        })
    })

    describe('bar stats', () => {
        it('should display bar stats with icon and label', () => {
            render(
                <StatsPanel
                    stats={mockStats}
                    statsConfig={mockStatsConfig}
                    getAllStatsInfo={mockGetAllStatsInfo}
                />
            )

            expect(screen.getByText('❤️')).toBeInTheDocument()
            expect(screen.getByText('HP')).toBeInTheDocument()
        })

        it('should show current/max values', () => {
            render(
                <StatsPanel
                    stats={mockStats}
                    statsConfig={mockStatsConfig}
                    getAllStatsInfo={mockGetAllStatsInfo}
                />
            )

            expect(screen.getByText('75/100')).toBeInTheDocument()
            expect(screen.getByText('30/50')).toBeInTheDocument()
        })
    })

    describe('value stats', () => {
        it('should display value stats with icon and label', () => {
            render(
                <StatsPanel
                    stats={mockStats}
                    statsConfig={mockStatsConfig}
                    getAllStatsInfo={mockGetAllStatsInfo}
                />
            )

            expect(screen.getByText('💪')).toBeInTheDocument()
            expect(screen.getByText('STR:')).toBeInTheDocument()
        })

        it('should display the stat value', () => {
            render(
                <StatsPanel
                    stats={mockStats}
                    statsConfig={mockStatsConfig}
                    getAllStatsInfo={mockGetAllStatsInfo}
                />
            )

            expect(screen.getByText('10')).toBeInTheDocument()
        })
    })

    describe('low health warning', () => {
        it('should show warning when stat is low (<=25%)', () => {
            const lowHealthStats = { hp: 20, mp: 50, str: 10 }
            const getLowStatsInfo = () => mockStatsConfig.stats.map(stat => ({
                ...stat,
                value: lowHealthStats[stat.id]
            }))

            render(
                <StatsPanel
                    stats={lowHealthStats}
                    statsConfig={mockStatsConfig}
                    getAllStatsInfo={getLowStatsInfo}
                />
            )

            expect(screen.getByText('¡Bajo!')).toBeInTheDocument()
        })
    })
})
