/**
 * Tests for useKeyboardNavigation hook
 * Covers keyboard event handling for choice selection and typewriter skip
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useKeyboardNavigation } from '../useKeyboardNavigation'

describe('useKeyboardNavigation', () => {
    let mockOnChoice
    let mockOnSkip
    let mockOnBack

    beforeEach(() => {
        mockOnChoice = vi.fn()
        mockOnSkip = vi.fn()
        mockOnBack = vi.fn()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const dispatchKeyDown = (key) => {
        const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true
        })
        window.dispatchEvent(event)
    }

    describe('choice selection', () => {
        it('should call onChoice when number key matches choice index', () => {
            const choices = [{ text: 'Option 1' }, { text: 'Option 2' }, { text: 'Option 3' }]

            renderHook(() => useKeyboardNavigation({
                choices,
                isTyping: false,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('2')
            })

            expect(mockOnChoice).toHaveBeenCalledWith(1) // Index 1 for key "2"
        })

        it('should not call onChoice if index is out of range', () => {
            const choices = [{ text: 'Option 1' }]

            renderHook(() => useKeyboardNavigation({
                choices,
                isTyping: false,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('5') // Only 1 choice exists
            })

            expect(mockOnChoice).not.toHaveBeenCalled()
        })

        it('should not call onChoice when isEnded is true', () => {
            const choices = [{ text: 'Option 1' }]

            renderHook(() => useKeyboardNavigation({
                choices,
                isTyping: false,
                isEnded: true,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('1')
            })

            expect(mockOnChoice).not.toHaveBeenCalled()
        })

        it('should not call onChoice when isTyping is true', () => {
            const choices = [{ text: 'Option 1' }]

            renderHook(() => useKeyboardNavigation({
                choices,
                isTyping: true,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('1')
            })

            // Should skip instead of choosing
            expect(mockOnChoice).not.toHaveBeenCalled()
            expect(mockOnSkip).toHaveBeenCalled()
        })
    })

    describe('typewriter skip', () => {
        it('should call onSkip when any regular key is pressed while typing', () => {
            renderHook(() => useKeyboardNavigation({
                choices: [],
                isTyping: true,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown(' ') // Space
            })

            expect(mockOnSkip).toHaveBeenCalled()
        })

        it('should call onSkip for Enter key while typing', () => {
            renderHook(() => useKeyboardNavigation({
                choices: [],
                isTyping: true,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('Enter')
            })

            expect(mockOnSkip).toHaveBeenCalled()
        })

        it('should not call onSkip for ignored keys (F-keys, modifiers)', () => {
            renderHook(() => useKeyboardNavigation({
                choices: [],
                isTyping: true,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('F5')
            })

            expect(mockOnSkip).not.toHaveBeenCalled()

            act(() => {
                dispatchKeyDown('Control')
            })

            expect(mockOnSkip).not.toHaveBeenCalled()
        })

        it('should not call onSkip for Tab key', () => {
            renderHook(() => useKeyboardNavigation({
                choices: [],
                isTyping: true,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('Tab')
            })

            expect(mockOnSkip).not.toHaveBeenCalled()
        })
    })

    describe('escape key', () => {
        it('should call onBack when Escape is pressed', () => {
            renderHook(() => useKeyboardNavigation({
                choices: [],
                isTyping: false,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('Escape')
            })

            expect(mockOnBack).toHaveBeenCalled()
        })

        it('should call onBack even while typing', () => {
            renderHook(() => useKeyboardNavigation({
                choices: [],
                isTyping: true,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            act(() => {
                dispatchKeyDown('Escape')
            })

            expect(mockOnBack).toHaveBeenCalled()
            expect(mockOnSkip).not.toHaveBeenCalled()
        })
    })

    describe('disabled state', () => {
        it('should not respond to any keys when disabled', () => {
            renderHook(() => useKeyboardNavigation({
                choices: [{ text: 'Option 1' }],
                isTyping: false,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack,
                disabled: true
            }))

            act(() => {
                dispatchKeyDown('1')
                dispatchKeyDown('Escape')
            })

            expect(mockOnChoice).not.toHaveBeenCalled()
            expect(mockOnBack).not.toHaveBeenCalled()
        })
    })

    describe('cleanup', () => {
        it('should remove event listener on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

            const { unmount } = renderHook(() => useKeyboardNavigation({
                choices: [],
                isTyping: false,
                isEnded: false,
                onChoice: mockOnChoice,
                onSkip: mockOnSkip,
                onBack: mockOnBack
            }))

            unmount()

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
            removeEventListenerSpy.mockRestore()
        })
    })
})
