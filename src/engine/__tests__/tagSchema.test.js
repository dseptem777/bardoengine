import { describe, it, expect } from 'vitest'
import { classifyTag, validateTag, TAG_FAMILIES } from '../tagSchema'

describe('tagSchema — classifyTag', () => {
    it('classifies each structured family from a representative valid tag', () => {
        const cases = {
            'KEY_MASH: 30': 'KEY_MASH',
            'MOUSE_RESISTANCE: high': 'MOUSE_RESISTANCE',
            'MOUSE_MAGNET: opt1': 'MOUSE_MAGNET',
            'WILLPOWER_START: fast': 'WILLPOWER_START',
            'WILLPOWER_STOP': 'WILLPOWER_STOP',
            'WILLPOWER_CHECK: 50': 'WILLPOWER_CHECK',
            'GENJUTSU_BREAK: fuerza:knot_a:la fisura': 'GENJUTSU_BREAK',
            'SPIDER_START: difficulty=normal': 'SPIDER_START',
            'SPIDER_STOP': 'SPIDER_STOP',
            'SPIDER_CHECK: 5': 'SPIDER_CHECK',
            'SPIDER_DIFFICULTY: fast': 'SPIDER_DIFFICULTY',
            'ARREBATADOS_START: count=3, fuerza=10': 'ARREBATADOS_START',
            'ARREBATADOS_ADD: 2': 'ARREBATADOS_ADD',
            'ARREBATADOS_STOP': 'ARREBATADOS_STOP',
            'BOSS_START: name=x, hp=100': 'BOSS_START',
            'BOSS_PHASE: 2': 'BOSS_PHASE',
            'BOSS_DAMAGE: 10': 'BOSS_DAMAGE',
            'BOSS_CHECK': 'BOSS_CHECK',
            'BOSS_STOP': 'BOSS_STOP',
            'VISUAL_DAMAGE: grayscale=0.3': 'VISUAL_DAMAGE',
            'CHAPTER_BREAK: title=Capítulo 1': 'CHAPTER_BREAK',
            'MINIGAME: lockpick': 'MINIGAME',
            'achievement:unlock:first_blood': 'achievement',
            'input:nombre:Tu nombre...': 'input',
        }
        for (const [tag, family] of Object.entries(cases)) {
            expect(classifyTag(tag), tag).toBe(family)
        }
    })

    it('every classified case name exists in TAG_FAMILIES', () => {
        const structured = ['KEY_MASH', 'CHAPTER_BREAK', 'achievement', 'input', 'BOSS_START']
        for (const f of structured) expect(TAG_FAMILIES).toContain(f)
    })

    it('treats blank/null as "empty"', () => {
        expect(classifyTag('')).toBe('empty')
        expect(classifyTag('   ')).toBe('empty')
        expect(classifyTag(null)).toBe('empty')
        expect(classifyTag(undefined)).toBe('empty')
    })

    it('treats VFX / stat / inv / unknown tags as "passthrough"', () => {
        for (const t of ['shake', 'flash_red', 'bg:forest', 'play_sfx:gunshot',
            'music:theme', 'UI_EFFECT: blur_vignette', 'stat:vida:-1',
            'inv:add:llave', 'next', 'totally_made_up_tag']) {
            expect(classifyTag(t), t).toBe('passthrough')
        }
    })

    it('is case-insensitive for the structured families', () => {
        expect(classifyTag('key_mash: 10')).toBe('KEY_MASH')
        expect(classifyTag('chapter_break: title=X')).toBe('CHAPTER_BREAK')
        expect(classifyTag('Boss_Start: hp=50')).toBe('BOSS_START')
    })
})

describe('tagSchema — validateTag (valid cases)', () => {
    const valid = [
        'KEY_MASH: 30',
        'KEY_MASH: willpower',
        'MOUSE_RESISTANCE: medium',
        'MOUSE_MAGNET: choice_2',
        'WILLPOWER_START',
        'WILLPOWER_START: extreme',
        'WILLPOWER_STOP',
        'WILLPOWER_CHECK: 80',
        'GENJUTSU_BREAK: magia:target_knot:la grieta se abre',
        'SPIDER_START: difficulty=fast, fuerza={fuerza}',
        'SPIDER_STOP',
        'SPIDER_CHECK: 5',
        'SPIDER_DIFFICULTY: normal',
        'ARREBATADOS_START: count=3, fuerza=10',
        'ARREBATADOS_ADD: 4',
        'ARREBATADOS_STOP',
        'BOSS_START: name=julieta, hp=120',
        'BOSS_PHASE: 3',
        'BOSS_DAMAGE: 25',
        'BOSS_CHECK',
        'BOSS_STOP',
        'VISUAL_DAMAGE: reset',
        'VISUAL_DAMAGE: grayscale=0.5',
        'VISUAL_DAMAGE',
        'CHAPTER_BREAK: title=El Museo, subtitle=Parte 2',
        'MINIGAME: arkanoid lives=3',
        'achievement:unlock:llegaste',
        'input:nombre:Ingresa tu nombre',
        // passthrough namespaces
        'shake', 'play_sfx:scream', 'stat:cordura:-2', '',
    ]
    it.each(valid)('accepts %s', (tag) => {
        const r = validateTag(tag)
        expect(r.valid, `${tag} → ${r.issues.join('; ')}`).toBe(true)
        expect(r.issues).toEqual([])
    })
})

describe('tagSchema — validateTag (malformed cases the handler silently ignores)', () => {
    const malformed = {
        'KEY_MASH:': 'KEY_MASH',
        'MOUSE_RESISTANCE: ultra': 'MOUSE_RESISTANCE',
        'MOUSE_MAGNET:': 'MOUSE_MAGNET',
        'WILLPOWER_START: turbo': 'WILLPOWER_START',
        'WILLPOWER_STOP: now': 'WILLPOWER_STOP',
        'WILLPOWER_CHECK: alto': 'WILLPOWER_CHECK',
        'WILLPOWER_CHECK:': 'WILLPOWER_CHECK',
        'GENJUTSU_BREAK: fuerza': 'GENJUTSU_BREAK',
        'SPIDER_CHECK: muchas': 'SPIDER_CHECK',
        'SPIDER_DIFFICULTY:': 'SPIDER_DIFFICULTY',
        'ARREBATADOS_ADD: dos': 'ARREBATADOS_ADD',
        'BOSS_START: hp=mucho': 'BOSS_START',
        'BOSS_PHASE: final': 'BOSS_PHASE',
        'BOSS_DAMAGE: fuerte': 'BOSS_DAMAGE',
        'VISUAL_DAMAGE: explode': 'VISUAL_DAMAGE',
        'CHAPTER_BREAK: subtitle=sin titulo': 'CHAPTER_BREAK',
        'CHAPTER_BREAK: title=': 'CHAPTER_BREAK',
        'MINIGAME:': 'MINIGAME',
        'achievement:unlock:': 'achievement',
        'input:': 'input',
    }
    for (const [tag, family] of Object.entries(malformed)) {
        it(`flags "${tag}" as invalid (${family})`, () => {
            const r = validateTag(tag)
            expect(r.family).toBe(family)
            expect(r.valid).toBe(false)
            expect(r.issues.length).toBeGreaterThan(0)
        })
    }

    it('the headline case: CHAPTER_BREAK without title= is caught', () => {
        const r = validateTag('CHAPTER_BREAK: subtitle=oops, image=x.png')
        expect(r.valid).toBe(false)
        expect(r.issues[0]).toMatch(/title=/)
    })
})

describe('tagSchema — robustness', () => {
    it('never throws on odd input and degrades to passthrough', () => {
        for (const weird of [null, undefined, 123, {}, [], '   ', '::::']) {
            expect(() => validateTag(weird)).not.toThrow()
            const r = validateTag(weird)
            expect(r).toHaveProperty('valid')
            expect(r).toHaveProperty('family')
            expect(Array.isArray(r.issues)).toBe(true)
        }
    })

    it('passthrough tags are always valid', () => {
        for (const t of ['bg:cementerio', 'music:tango', 'inv:remove:foto']) {
            expect(validateTag(t)).toEqual({ family: 'passthrough', valid: true, issues: [] })
        }
    })
})
