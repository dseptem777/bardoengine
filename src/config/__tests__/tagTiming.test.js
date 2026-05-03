import { describe, it, expect } from 'vitest'
import { isDeferrableTag } from '../tagTiming'

describe('isDeferrableTag', () => {
    // Deferrable tags — should fire when typewriter reaches the paragraph
    it('returns true for play_sfx:* tags', () => {
        expect(isDeferrableTag('play_sfx:aterrizaje')).toBe(true)
        expect(isDeferrableTag('play_sfx:magia_hex')).toBe(true)
        expect(isDeferrableTag('play_sfx:gunshot')).toBe(true)
    })

    it('returns true for shake', () => {
        expect(isDeferrableTag('shake')).toBe(true)
        expect(isDeferrableTag('  shake  ')).toBe(true)
    })

    it('returns true for flash_* tags', () => {
        expect(isDeferrableTag('flash_red')).toBe(true)
        expect(isDeferrableTag('flash_dark')).toBe(true)
        expect(isDeferrableTag('flash_white')).toBe(true)
        expect(isDeferrableTag('flash_blue')).toBe(true)
    })

    // Instant tags — should fire upfront before typewriter starts
    it('returns false for music: tags', () => {
        expect(isDeferrableTag('music:theme')).toBe(false)
        expect(isDeferrableTag('music:stop')).toBe(false)
    })

    it('returns false for bg: tags', () => {
        expect(isDeferrableTag('bg:forest')).toBe(false)
        expect(isDeferrableTag('bg:ciudad')).toBe(false)
    })

    it('returns false for UI_EFFECT: tags', () => {
        expect(isDeferrableTag('UI_EFFECT: blur_vignette')).toBe(false)
        expect(isDeferrableTag('UI_EFFECT: cold_blue')).toBe(false)
        expect(isDeferrableTag('UI_EFFECT: none')).toBe(false)
    })

    it('returns false for pagination tags', () => {
        expect(isDeferrableTag('next')).toBe(false)
        expect(isDeferrableTag('next: Open the door')).toBe(false)
        expect(isDeferrableTag('page')).toBe(false)
    })

    it('returns false for system tags', () => {
        expect(isDeferrableTag('CHAPTER_BREAK: Chapter 2')).toBe(false)
        expect(isDeferrableTag('WILLPOWER_START: fast')).toBe(false)
        expect(isDeferrableTag('WILLPOWER_STOP')).toBe(false)
        expect(isDeferrableTag('SPIDER_START: difficulty=normal')).toBe(false)
        expect(isDeferrableTag('MINIGAME: qte params')).toBe(false)
        expect(isDeferrableTag('achievement:unlock:id')).toBe(false)
        expect(isDeferrableTag('input:varName:placeholder')).toBe(false)
    })

    it('returns false for null/undefined/empty', () => {
        expect(isDeferrableTag(null)).toBe(false)
        expect(isDeferrableTag(undefined)).toBe(false)
        expect(isDeferrableTag('')).toBe(false)
    })
})
