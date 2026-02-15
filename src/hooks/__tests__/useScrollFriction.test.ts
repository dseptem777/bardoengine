import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrollFriction } from '../useScrollFriction'
import { createRef } from 'react'

describe('useScrollFriction', () => {
    let container: HTMLDivElement

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
        vi.useFakeTimers()
    })

    afterEach(() => {
        document.body.removeChild(container)
        vi.useRealTimers()
    })

    function makeRef(el: HTMLElement | null = null) {
        const ref = createRef<HTMLElement | null>() as { current: HTMLElement | null }
        ref.current = el
        return ref
    }

    describe('initialization', () => {
        it('should be inactive when disabled', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: false,
                    arrebatadosCount: 5,
                    fuerza: 10,
                })
            )

            expect(result.current.isActive).toBe(false)
            expect(result.current.currentFriction).toBe(0)
            expect(result.current.arrebatadosElements).toEqual([])
        })

        it('should be inactive when arrebatadosCount is 0 even if enabled', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 0,
                    fuerza: 10,
                })
            )

            expect(result.current.isActive).toBe(false)
            expect(result.current.currentFriction).toBe(0)
        })
    })

    describe('friction calculation', () => {
        it('should calculate friction as arrebatadosCount / (fuerza + 10)', () => {
            const ref = makeRef(container)
            // 5 / (10 + 10) = 0.25
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 5,
                    fuerza: 10,
                })
            )

            expect(result.current.isActive).toBe(true)
            expect(result.current.currentFriction).toBe(0.25)
        })

        it('should cap friction at 1.0 when arrebatados >= fuerza + 10', () => {
            const ref = makeRef(container)
            // 20 / (10 + 10) = 1.0 exactly
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 20,
                    fuerza: 10,
                })
            )

            expect(result.current.currentFriction).toBe(1.0)
        })

        it('should cap friction at 1.0 when arrebatados exceed fuerza + 10', () => {
            const ref = makeRef(container)
            // 50 / (10 + 10) = 2.5 -> capped to 1.0
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 50,
                    fuerza: 10,
                })
            )

            expect(result.current.currentFriction).toBe(1.0)
        })

        it('should recalculate friction when arrebatadosCount changes', () => {
            const ref = makeRef(container)
            let arrebatadosCount = 5

            const { result, rerender } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount,
                    fuerza: 10,
                })
            )

            expect(result.current.currentFriction).toBe(0.25)

            arrebatadosCount = 10
            rerender()

            // 10 / (10 + 10) = 0.5
            expect(result.current.currentFriction).toBe(0.5)
        })
    })

    describe('wheel event interception', () => {
        it('should intercept wheel events and reduce scroll delta', () => {
            const ref = makeRef(container)
            container.scrollTop = 0

            renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 5,
                    fuerza: 10, // friction = 0.25
                })
            )

            const wheelEvent = new WheelEvent('wheel', {
                deltaY: 100,
                bubbles: true,
                cancelable: true,
            })

            act(() => {
                container.dispatchEvent(wheelEvent)
            })

            // scrollTop += deltaY * (1 - friction) = 100 * 0.75 = 75
            expect(container.scrollTop).toBe(75)
        })

        it('should completely freeze scroll when friction >= 1', () => {
            const ref = makeRef(container)
            container.scrollTop = 50

            renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 30,
                    fuerza: 10, // friction = 1.0 (capped)
                })
            )

            const wheelEvent = new WheelEvent('wheel', {
                deltaY: 100,
                bubbles: true,
                cancelable: true,
            })

            act(() => {
                container.dispatchEvent(wheelEvent)
            })

            // Scroll should not change
            expect(container.scrollTop).toBe(50)
        })

        it('should not intercept wheel events when disabled', () => {
            const ref = makeRef(container)
            container.scrollTop = 0

            renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: false,
                    arrebatadosCount: 5,
                    fuerza: 10,
                })
            )

            const wheelEvent = new WheelEvent('wheel', {
                deltaY: 100,
                bubbles: true,
                cancelable: true,
            })

            act(() => {
                container.dispatchEvent(wheelEvent)
            })

            // Default jsdom scrollTop stays 0 — no interception means no manual scrollTop change
            expect(container.scrollTop).toBe(0)
        })
    })

    describe('arrebatadosElements', () => {
        it('should generate correct number of arrebatado elements', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 3,
                    fuerza: 10,
                })
            )

            expect(result.current.arrebatadosElements).toHaveLength(3)
        })

        it('should have id, text, and paragraphIndex on each element', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 2,
                    fuerza: 10,
                })
            )

            for (const el of result.current.arrebatadosElements) {
                expect(el).toHaveProperty('id')
                expect(el).toHaveProperty('text')
                expect(el).toHaveProperty('paragraphIndex')
                expect(typeof el.id).toBe('string')
                expect(typeof el.text).toBe('string')
                expect(typeof el.paragraphIndex).toBe('number')
            }
        })

        it('should return empty array when disabled', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: false,
                    arrebatadosCount: 5,
                    fuerza: 10,
                })
            )

            expect(result.current.arrebatadosElements).toEqual([])
        })

        it('should cycle through text fragments when count exceeds fragment list', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 10,
                    fuerza: 10,
                })
            )

            expect(result.current.arrebatadosElements).toHaveLength(10)
            // 10 > 8 fragments, so it should cycle
            const texts = result.current.arrebatadosElements.map(el => el.text)
            expect(texts[0]).toBe(texts[8]) // index 8 wraps to index 0
        })
    })
})
