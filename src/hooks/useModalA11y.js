import { useEffect, useRef } from 'react'

/**
 * useModalA11y - Adds focus trap, Escape key handler, and restores focus on close
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Called when Escape is pressed
 */
export function useModalA11y(isOpen, onClose) {
    const containerRef = useRef(null)
    const previousFocusRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return

        // Save previously focused element
        previousFocusRef.current = document.activeElement

        const container = containerRef.current
        if (!container) return

        // Focus the container or first focusable element
        const focusFirst = () => {
            const focusable = container.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
            if (focusable.length > 0) {
                focusable[0].focus()
            } else {
                container.focus()
            }
        }
        requestAnimationFrame(focusFirst)

        // Focus trap + Escape handler
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
                return
            }

            if (e.key !== 'Tab') return

            const focusable = container.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
            if (focusable.length === 0) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            // Restore focus
            if (previousFocusRef.current && previousFocusRef.current.focus) {
                previousFocusRef.current.focus()
            }
        }
    }, [isOpen, onClose])

    return containerRef
}
