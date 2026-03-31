import { useState, useCallback, useEffect, useMemo } from 'react'

const MAX_GRAYSCALE = 0.6
const GRAYSCALE_PER_DEATH = 0.15

function computeGrayscale(deaths: number): number {
    const raw = Math.min(deaths * GRAYSCALE_PER_DEATH, MAX_GRAYSCALE)
    return Math.round(raw * 100) / 100
}

function applyFilter(grayscale: number): void {
    if (grayscale > 0) {
        document.documentElement.style.filter = `grayscale(${grayscale})`
    } else {
        document.documentElement.style.filter = ''
    }
}

function getStorageKey(storyId: string): string {
    return `bardoengine_visual_damage_${storyId}`
}

export interface VisualDamageResult {
    deathCount: number
    currentGrayscale: number
    recordDeath: () => void
    resetDamage: () => void
}

export function useVisualDamage(storyId: string): VisualDamageResult {
    const storageKey = getStorageKey(storyId)

    const [deathCount, setDeathCount] = useState<number>(() => {
        const stored = localStorage.getItem(storageKey)
        return stored ? parseInt(stored, 10) || 0 : 0
    })

    const currentGrayscale = useMemo(() => computeGrayscale(deathCount), [deathCount])

    // Apply filter whenever grayscale changes
    useEffect(() => {
        applyFilter(currentGrayscale)
    }, [currentGrayscale])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.documentElement.style.filter = ''
        }
    }, [])

    const recordDeath = useCallback(() => {
        setDeathCount(prev => {
            const next = prev + 1
            localStorage.setItem(storageKey, String(next))
            return next
        })
    }, [storageKey])

    const resetDamage = useCallback(() => {
        setDeathCount(0)
        localStorage.removeItem(storageKey)
    }, [storageKey])

    return { deathCount, currentGrayscale, recordDeath, resetDamage }
}
