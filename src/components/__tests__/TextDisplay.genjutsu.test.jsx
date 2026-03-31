import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TextDisplay from '../TextDisplay'

describe('TextDisplay genjutsu', () => {
    // Simulate what Ink produces: lines separated by \n
    const baseProps = {
        text: 'First paragraph.\nEl vampiro sonríe. "Este lugar siempre fue tuyo."\nThird paragraph.',
        isTyping: false,
        typewriterDelay: 0,
    }

    it('renders clickable paragraph when genjutsu break matches', () => {
        const onBreakGenjutsu = vi.fn()
        render(
            <TextDisplay
                {...baseProps}
                genjutsuBreak={{ stat: 'conocimiento', text: 'El vampiro sonríe. "Este lugar siempre fue tuyo."' }}
                dominantStat="conocimiento"
                willpowerValue={50}
                onBreakGenjutsu={onBreakGenjutsu}
            />
        )

        const clickable = screen.getByTestId('genjutsu-break')
        expect(clickable).toBeTruthy()
        fireEvent.click(clickable)
        expect(onBreakGenjutsu).toHaveBeenCalled()
    })

    it('does not render clickable when stat does not match dominant', () => {
        render(
            <TextDisplay
                {...baseProps}
                genjutsuBreak={{ stat: 'fuerza', text: 'El vampiro sonríe. "Este lugar siempre fue tuyo."' }}
                dominantStat="conocimiento"
                willpowerValue={50}
                onBreakGenjutsu={vi.fn()}
            />
        )

        expect(screen.queryByTestId('genjutsu-break')).toBeNull()
    })

    it('does not render clickable when no genjutsuBreak', () => {
        render(<TextDisplay {...baseProps} />)
        expect(screen.queryByTestId('genjutsu-break')).toBeNull()
    })

    it('scales opacity inversely with willpower', () => {
        const props = {
            ...baseProps,
            genjutsuBreak: { stat: 'conocimiento', text: 'El vampiro sonríe. "Este lugar siempre fue tuyo."' },
            dominantStat: 'conocimiento',
            onBreakGenjutsu: vi.fn(),
        }

        const { rerender } = render(
            <TextDisplay {...props} willpowerValue={80} />
        )

        const el80 = screen.getByTestId('genjutsu-break')
        const opacity80 = parseFloat(el80.style.opacity)
        expect(opacity80).toBeLessThan(0.3)

        rerender(<TextDisplay {...props} willpowerValue={10} />)

        const el10 = screen.getByTestId('genjutsu-break')
        const opacity10 = parseFloat(el10.style.opacity)
        expect(opacity10).toBeGreaterThan(0.5)
    })
})
