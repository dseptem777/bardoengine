import { describe, it, expect } from 'vitest'
import { getDominantStat } from '../getDominantStat'

describe('getDominantStat', () => {
    it('returns the key with the highest value', () => {
        const stats = { fuerza: 5, magia: 10, conocimiento: 3 }
        expect(getDominantStat(stats)).toBe('magia')
    })

    it('returns first key on tie (insertion order)', () => {
        const stats = { fuerza: 10, magia: 10, conocimiento: 3 }
        expect(getDominantStat(stats)).toBe('fuerza')
    })

    it('handles single stat', () => {
        expect(getDominantStat({ fuerza: 5 })).toBe('fuerza')
    })

    it('returns null for empty stats', () => {
        expect(getDominantStat({})).toBeNull()
    })

    it('handles zero values', () => {
        const stats = { fuerza: 0, magia: 0, conocimiento: 1 }
        expect(getDominantStat(stats)).toBe('conocimiento')
    })
})
