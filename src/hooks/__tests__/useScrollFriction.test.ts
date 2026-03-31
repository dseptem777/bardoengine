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
        it('should have noticeable friction even with few arrebatados', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 2,
                    fuerza: 10,
                })
            )

            expect(result.current.isActive).toBe(true)
            // With aggressive formula, 2 arrebatados should give significant friction
            expect(result.current.currentFriction).toBeGreaterThan(0.3)
        })

        it('should increase friction with more arrebatados', () => {
            const ref = makeRef(container)
            let count = 2

            const { result, rerender } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: count,
                    fuerza: 10,
                })
            )

            const lowFriction = result.current.currentFriction

            count = 8
            rerender()

            expect(result.current.currentFriction).toBeGreaterThan(lowFriction)
        })

        it('should cap friction at 0.95', () => {
            const ref = makeRef(container)
            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 100,
                    fuerza: 10,
                })
            )

            expect(result.current.currentFriction).toBe(0.95)
        })

        it('should reduce friction when fuerza is higher', () => {
            const ref = makeRef(container)

            const { result: lowStr } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 5,
                    fuerza: 5,
                })
            )

            const { result: highStr } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 5,
                    fuerza: 20,
                })
            )

            expect(lowStr.current.currentFriction).toBeGreaterThan(highStr.current.currentFriction)
        })
    })

    describe('wheel event interception', () => {
        it('should intercept wheel events and reduce scroll delta', () => {
            const ref = makeRef(container)
            container.scrollTop = 0

            const { result } = renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 4,
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

            const friction = result.current.currentFriction
            // scrollTop should be less than full deltaY
            expect(container.scrollTop).toBeGreaterThan(0)
            expect(container.scrollTop).toBeLessThan(100)
        })

        it('should nearly freeze scroll when friction is very high', () => {
            const ref = makeRef(container)
            container.scrollTop = 50

            renderHook(() =>
                useScrollFriction({
                    scrollContainerRef: ref,
                    enabled: true,
                    arrebatadosCount: 100,
                    fuerza: 10, // friction = 0.95 (capped)
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

            // With 0.95 friction, jitter pushback: scrollTop -= 2
            expect(container.scrollTop).toBeLessThan(50)
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
