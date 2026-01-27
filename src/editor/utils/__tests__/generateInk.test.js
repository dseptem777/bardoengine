import { describe, it, expect } from 'vitest';
import { generateInk, generateHubRegistry } from '../generateInk';

describe('generateInk', () => {
    it('should generate basic ink structure', () => {
        const nodes = [
            { id: 'hub_start', data: { type: 'hub', label: 'Hub', text: 'Hello Hub' } },
            { id: 'mission_a', data: { type: 'knot', label: 'Mission A', text: 'Mission Content' } }
        ];
        const edges = [
            { source: 'hub_start', target: 'mission_a' }
        ];

        const result = generateInk(nodes, edges);
        expect(result).toContain('=== hub_start ===');
        expect(result).toContain('Hello Hub');
        expect(result).toContain('+ [Mission A] -> mission_a');
        expect(result).toContain('=== mission_a ===');
    });

    it('should generate hub registry', () => {
        const nodes = [
            {
                id: 'hub_start',
                data: {
                    type: 'hub',
                    burnRules: [{ target: 'a', burns: ['b'] }]
                }
            }
        ];

        const registry = generateHubRegistry(nodes);
        expect(registry).toHaveLength(1);
        expect(registry[0].id).toBe('hub_start');
        expect(registry[0].options[0].target).toBe('a');
    });
});
