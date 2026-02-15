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

    // friction = min(arrebatadosCount / (fuerza + 10), 1)
    const currentFriction = isActive
        ? Math.min(arrebatadosCount / (fuerza + 10), 1)
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

    // Wheel event handler with friction applied
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault()

            if (currentFriction >= 1) {
                // Scroll completely frozen
                return
            }

            const container = scrollContainerRef.current
            if (container) {
                container.scrollTop += e.deltaY * (1 - currentFriction)
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
