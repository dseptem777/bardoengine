import { useEffect, useCallback } from 'react'

/**
 * Hook para navegación por teclado en BardoEngine
 * 
 * Controles:
 * - 1-9: Seleccionar opción por número
 * - Space/Enter: Continuar (cuando hay botón "Siguiente")
 * - Any key (excepto Escape, modificadores, F-keys): Skip typewriter
 * - Escape: Volver al menú
 */
export function useKeyboardNavigation({
    choices,
    isTyping,
    isEnded,
    canContinue = false,
    onChoice,
    onSkip,
    onBack,
    onContinue,
    disabled = false
}) {
    const handleKeyDown = useCallback((event) => {
        if (disabled) return;

        const key = event.key

        // Keys to ignore for "any key" skip
        const ignoredKeys = [
            'Escape', 'Tab',
            'Control', 'Alt', 'Shift', 'Meta',
            'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
            'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
            'CapsLock', 'NumLock', 'ScrollLock',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
        ]

        // Escape → Back to menu (always available during gameplay)
        if (key === 'Escape') {
            event.preventDefault()
            onBack?.()
            return
        }

        // If typing, any key (except ignored) skips typewriter
        if (isTyping) {
            if (!ignoredKeys.includes(key)) {
                event.preventDefault()
                onSkip?.()
            }
            return
        }

        // Space or Enter → Continue (when "Siguiente" button is shown)
        if ((key === ' ' || key === 'Enter') && choices.length === 0 && canContinue && !isEnded) {
            event.preventDefault()
            onContinue?.()
            return
        }

        // Number keys 1-9 for choice selection
        if (choices.length > 0 && !isEnded) {
            const num = parseInt(key, 10)
            if (num >= 1 && num <= 9) {
                const index = num - 1
                if (index < choices.length) {
                    event.preventDefault()
                    onChoice?.(index)
                }
            }
        }
    }, [choices, isTyping, isEnded, canContinue, onChoice, onSkip, onBack, onContinue, disabled])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])
}
