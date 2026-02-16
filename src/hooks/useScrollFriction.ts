import { useEffect, useMemo, useCallback, RefObject } from 'react'

/**
 * useScrollFriction - "Horda de Scroll" mechanic
 *
 * As the Umbrío summons Arrebatados (souls of conquistadors), the scroll
 * becomes heavier/stickier. The player's Fuerza stat counteracts this.
 *
 * Intercepts wheel events on the scroll container and applies a resistance
 * formula that reduces scroll speed proportional to arrebatado count.
 */

const ARREBATADO_TEXTS = [
    'ORO... NECESITAMOS MÁS ORO...',
    'ESTA TIERRA ES NUESTRA...',
    'NO PUEDEN ESCAPAR DE NOSOTROS...',
    'VENIMOS POR LO QUE NOS PERTENECE...',
    'EL TIEMPO NO NOS DETIENE...',
    'PAGUEN SU DEUDA...',
    'SOMOS LEGIÓN...',
    'LA CODICIA ES ETERNA...',
]

interface ScrollFrictionConfig {
    scrollContainerRef: RefObject<HTMLElement | null>
    enabled: boolean
    arrebatadosCount: number
    fuerza: number
}

interface ArrebatadoElement {
    id: string
    text: string
    paragraphIndex: number
}

interface ScrollFrictionReturn {
    isActive: boolean
    currentFriction: number
    arrebatadosElements: ArrebatadoElement[]
}

export function useScrollFriction(config: ScrollFrictionConfig): ScrollFrictionReturn {
    const { scrollContainerRef, enabled, arrebatadosCount, fuerza } = config

    const isActive = enabled && arrebatadosCount > 0

    // Aggressive friction: even 2 arrebatados should feel heavy
    // With fuerza=10: 2 arrebatados → 0.5, 4 → 0.73, 7 → 0.88
    const currentFriction = isActive
        ? Math.min(1 - (1 / (1 + arrebatadosCount * 0.8 / Math.max(fuerza * 0.1, 1))), 0.95)
        : 0

    // Generate arrebatado visual element data
    const arrebatadosElements = useMemo<ArrebatadoElement[]>(() => {
        if (!isActive) return []

        return Array.from({ length: arrebatadosCount }, (_, i) => ({
            id: `arrebatado-${i}`,
            text: ARREBATADO_TEXTS[i % ARREBATADO_TEXTS.length],
            paragraphIndex: i,
        }))
    }, [isActive, arrebatadosCount])

    // Wheel event handler with friction applied + occasional pushback
    const pushbackAccum = { current: 0 }
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault()

            const container = scrollContainerRef.current
            if (!container) return

            if (currentFriction >= 0.95) {
                // Almost frozen — tiny jitter pushback
                container.scrollTop -= 2
                return
            }

            const reduced = e.deltaY * (1 - currentFriction)
            container.scrollTop += reduced

            // Pushback: accumulate scroll and occasionally resist
            if (e.deltaY > 0 && currentFriction > 0.3) {
                pushbackAccum.current += e.deltaY
                if (pushbackAccum.current > 300) {
                    pushbackAccum.current = 0
                    // Snap back a bit
                    const pushback = 15 + currentFriction * 30
                    container.scrollTop -= pushback
                }
            }
        },
        [currentFriction, scrollContainerRef]
    )

    // Attach wheel listener when active
    useEffect(() => {
        if (!isActive) return

        const container = scrollContainerRef.current
        if (!container) return

        container.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            container.removeEventListener('wheel', handleWheel)
        }
    }, [isActive, handleWheel, scrollContainerRef])

    return {
        isActive,
        currentFriction,
        arrebatadosElements,
    }
}
