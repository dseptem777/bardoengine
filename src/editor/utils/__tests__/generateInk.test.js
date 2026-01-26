import { describe, it, expect } from 'vitest';
import { generateInk, generateHubRegistry } from '../generateInk';

describe('Ink Generator', () => {
    const nodes = [
        { id: 'hub_start', data: { label: 'Start', type: 'hub', text: 'You are at the hub.' } },
        { id: 'mission_a', data: { label: 'Mission A', type: 'knot', text: 'Doing A.' } },
        { id: 'mission_b', data: { label: 'Mission B', type: 'knot', text: 'Doing B.' } }
    ];
    const edges = [
        { source: 'hub_start', target: 'mission_a', label: 'Go to A' },
        { source: 'hub_start', target: 'mission_b', label: 'Go to B' }
    ];

    it('generates ink content', () => {
        const ink = generateInk(nodes, edges);
        expect(ink).toContain('=== hub_start ===');
        expect(ink).toContain('#hub');
        expect(ink).toContain('+ [Go to A] -> mission_a');
        expect(ink).toContain('+ [Go to B] -> mission_b');
        expect(ink).toContain('=== mission_a ===');
    });

    it('generates registry', () => {
        const hubNode = { ...nodes[0], data: { ...nodes[0].data, burnRules: [
            { targetId: 'mission_a', burnedIds: ['mission_b'] }
        ]}};
        const registry = generateHubRegistry([hubNode, nodes[1], nodes[2]]);

        expect(registry).toHaveLength(1);
        expect(registry[0].id).toBe('hub_start');
        expect(registry[0].options[0].target).toBe('mission_a');
        expect(registry[0].options[0].burns).toContain('mission_b');
    });
});
