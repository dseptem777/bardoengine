/**
 * useWillpowerCorruption
 *
 * Applies "mental fog" CSS filter effects directly to story paragraph DOM
 * elements when willpower is active and dropping. Uses a rAF loop for
 * per-frame updates — no React state, no re-renders.
 *
 * Pattern follows useSpiderInfestation.js lines 272-283.
 */

import { useEffect, useRef } from 'react'

/**
 * @param active - Whether the willpower system is currently running
 * @param willpowerValue - Current willpower value 0–100
 */
export function useWillpowerCorruption(active: boolean, willpowerValue: number): void {
    const rafIdRef = useRef<number | null>(null)
    const activeRef = useRef(active)
    const willpowerRef = useRef(willpowerValue)

    // Keep refs in sync so the rAF loop always sees the latest values
    activeRef.current = active
    willpowerRef.current = willpowerValue

    useEffect(() => {
        function clearAllFilters(): void {
            const paragraphs = document.querySelectorAll<HTMLElement>('[data-paragraph-index]')
            paragraphs.forEach(elem => {
                elem.style.filter = ''
            })
        }

        function loop(): void {
            if (!activeRef.current) {
                clearAllFilters()
                rafIdRef.current = null
                return
            }

            const wp = willpowerRef.current
            // level: 0 at willpower=100, approaching 1 as willpower→0
            // Curve: Math.pow(1 - wp/100, 1.5) gives gentle start, steeper at low values
            const level = Math.pow(1 - wp / 100, 1.5)

            const paragraphs = document.querySelectorAll<HTMLElement>('[data-paragraph-index]')

            paragraphs.forEach(elem => {
                if (level < 0.02) {
                    // Willpower near full — clear any lingering filter
                    elem.style.filter = ''
                } else {
                    const blur = (level * level) * 4
                    const brightness = 1 - level * 0.3
                    const contrast = 1 + level * 0.4
                    const saturate = 1 - level * 0.7

                    let filter =
                        `blur(${blur.toFixed(2)}px) ` +
                        `brightness(${brightness.toFixed(3)}) ` +
                        `contrast(${contrast.toFixed(3)}) ` +
                        `saturate(${saturate.toFixed(3)})`

                    // Below 20 willpower: add sickly hue-rotate shift
                    if (wp < 20) {
                        filter += ` hue-rotate(${(level * 30).toFixed(1)}deg)`
                    }

                    elem.style.filter = filter
                }
            })

            rafIdRef.current = requestAnimationFrame(loop)
        }

        if (active) {
            // Cancel any previous loop before starting a new one
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current)
            }
            rafIdRef.current = requestAnimationFrame(loop)
        } else {
            // active went false — cancel loop and clear all filters
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current)
                rafIdRef.current = null
            }
            clearAllFilters()
        }

        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current)
                rafIdRef.current = null
            }
            clearAllFilters()
        }
    }, [active]) // Re-run only when active changes; willpowerValue is read via ref
}
