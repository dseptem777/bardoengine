import { describe, it, expect } from 'vitest'
import { fixMojibake, fixMojibakeDeep } from '../fixMojibake'

describe('fixMojibake', () => {
    it('repairs ó (common mojibake)', () => {
        expect(fixMojibake('Pirotecnia arqueolÃ³gica')).toBe('Pirotecnia arqueológica')
    })

    it('repairs á', () => {
        expect(fixMojibake('GuardiÃ¡n del Patrimonio')).toBe('Guardián del Patrimonio')
    })

    it('repairs BuzÃ³n', () => {
        expect(fixMojibake('BuzÃ³n')).toBe('Buzón')
    })

    it('leaves already-correct Spanish unchanged (Oído fino)', () => {
        expect(fixMojibake('Oído fino')).toBe('Oído fino')
    })

    it('leaves already-correct accented string unchanged', () => {
        expect(fixMojibake('Pirotecnia arqueológica')).toBe('Pirotecnia arqueológica')
    })

    it('leaves plain ASCII unchanged', () => {
        expect(fixMojibake('Hello world')).toBe('Hello world')
    })

    it('leaves empty string unchanged', () => {
        expect(fixMojibake('')).toBe('')
    })

    it('returns non-strings unchanged', () => {
        expect(fixMojibake(42)).toBe(42)
        expect(fixMojibake(null)).toBe(null)
        expect(fixMojibake(undefined)).toBe(undefined)
    })
})

describe('fixMojibakeDeep', () => {
    it('repairs strings nested in objects', () => {
        const input = { name: 'GuardiÃ¡n', desc: 'plain' }
        const result = fixMojibakeDeep(input)
        expect(result.name).toBe('Guardián')
        expect(result.desc).toBe('plain')
    })

    it('repairs strings in arrays', () => {
        const input = ['GuardiÃ¡n', 'normal']
        const result = fixMojibakeDeep(input)
        expect(result[0]).toBe('Guardián')
        expect(result[1]).toBe('normal')
    })

    it('does not mutate the original object', () => {
        const input = { name: 'GuardiÃ¡n' }
        fixMojibakeDeep(input)
        expect(input.name).toBe('GuardiÃ¡n')
    })

    it('passes through numbers and booleans', () => {
        const input = { count: 5, active: true }
        expect(fixMojibakeDeep(input)).toEqual({ count: 5, active: true })
    })
})
