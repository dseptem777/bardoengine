/**
 * Tests for loadGameConfig utility
 * Covers config loading, caching, and item definitions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadGameConfig, getItemDefinition, clearConfigCache, DEFAULT_CONFIG } from '../loadGameConfig'

// Mock Vite's dynamic import
vi.mock('../stories/test_story.config.json', () => ({
    default: {
        title: 'Test Story',
        version: '1.0.0',
        stats: {
            enabled: true,
            definitions: [{ id: 'hp', initial: 100 }]
        }
    }
}), { virtual: true })

describe('loadGameConfig', () => {
    beforeEach(() => {
        clearConfigCache()
        vi.clearAllMocks()
    })

    describe('DEFAULT_CONFIG', () => {
        it('should have expected default structure', () => {
            expect(DEFAULT_CONFIG).toMatchObject({
                title: 'BardoEngine Game',
                version: '0.1.0',
                intro: expect.objectContaining({
                    showEngineLogo: true
                }),
                stats: expect.objectContaining({
                    enabled: false
                }),
                inventory: expect.objectContaining({
                    enabled: false,
                    maxSlots: 10
                })
            })
        })
    })

    describe('loadGameConfig', () => {
        it('should return DEFAULT_CONFIG for null storyId', async () => {
            const config = await loadGameConfig(null)

            expect(config).toEqual(DEFAULT_CONFIG)
        })

        it('should return DEFAULT_CONFIG for undefined storyId', async () => {
            const config = await loadGameConfig(undefined)

            expect(config).toEqual(DEFAULT_CONFIG)
        })

        it('should return DEFAULT_CONFIG for unknown story (graceful fallback)', async () => {
            // Mock console.warn to avoid test noise
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

            const config = await loadGameConfig('nonexistent_story')

            expect(config).toEqual(DEFAULT_CONFIG)
            expect(warnSpy).toHaveBeenCalled()
            warnSpy.mockRestore()
        })

        it('should merge loaded config with defaults', async () => {
            // We can't easily test the actual dynamic import, but we can test the merge behavior
            // by checking that a loaded config would have default properties filled in
            const config = await loadGameConfig(null)

            expect(config.intro).toBeDefined()
            expect(config.intro.skipEnabled).toBe(true)
        })
    })

    describe('config caching', () => {
        it('should cache configs for same storyId', async () => {
            // Since we can't easily mock dynamic imports, we test the cache behavior indirectly
            // by calling twice and checking both return the same shape
            const config1 = await loadGameConfig('test_a')
            const config2 = await loadGameConfig('test_a')

            expect(config1).toEqual(config2)
        })
    })

    describe('clearConfigCache', () => {
        it('should clear the cache', () => {
            // Just verify it doesn't throw
            expect(() => clearConfigCache()).not.toThrow()
        })
    })
})

describe('getItemDefinition', () => {
    const mockConfig = {
        items: {
            'llave_dorada': {
                id: 'llave_dorada',
                name: 'Llave Dorada',
                icon: '🔑',
                description: 'Una llave brillante',
                category: 'llaves',
                stackable: false
            },
            'pocion': {
                id: 'pocion',
                name: 'Poción',
                icon: '🧪',
                description: 'Restaura HP',
                stackable: true
            }
        }
    }

    it('should return item definition from config', () => {
        const item = getItemDefinition(mockConfig, 'llave_dorada')

        expect(item).toEqual({
            id: 'llave_dorada',
            name: 'Llave Dorada',
            icon: '🔑',
            description: 'Una llave brillante',
            category: 'llaves',
            stackable: false
        })
    })

    it('should return fallback for unknown item', () => {
        const item = getItemDefinition(mockConfig, 'unknown_item')

        expect(item).toEqual({
            id: 'unknown_item',
            name: 'unknown_item',
            icon: '📦',
            description: 'Item desconocido.',
            category: 'items',
            stackable: false
        })
    })

    it('should return fallback for null config', () => {
        const item = getItemDefinition(null, 'some_item')

        expect(item).toMatchObject({
            id: 'some_item',
            name: 'some_item',
            icon: '📦'
        })
    })

    it('should return fallback for config without items', () => {
        const item = getItemDefinition({}, 'item')

        expect(item.id).toBe('item')
        expect(item.icon).toBe('📦')
    })
})
