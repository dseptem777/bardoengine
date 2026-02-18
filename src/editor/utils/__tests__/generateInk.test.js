import { describe, it, expect } from 'vitest';
import { generateInk, generateHubRegistry, validateGraph } from '../generateInk';

describe('generateInk', () => {
    it('should generate a knot with content and -> END for dead ends', () => {
        const nodes = [
            { id: 'intro', data: { type: 'knot', label: 'Intro', content: 'You wake up in a dark room.' } }
        ];
        const result = generateInk(nodes, []);
        expect(result).toContain('-> intro');
        expect(result).toContain('=== intro ===');
        expect(result).toContain('You wake up in a dark room.');
        expect(result).toContain('-> END');
    });

    it('should divert to next node with a single outgoing edge', () => {
        const nodes = [
            { id: 'scene_1', data: { type: 'knot', content: 'Scene one.' } },
            { id: 'scene_2', data: { type: 'knot', content: 'Scene two.' } }
        ];
        const edges = [
            { id: 'e1', source: 'scene_1', target: 'scene_2' }
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('=== scene_1 ===');
        expect(result).toContain('-> scene_2');
        expect(result).toContain('=== scene_2 ===');
        expect(result).toContain('-> END');
    });

    it('should emit VAR declarations when variables are provided', () => {
        const nodes = [
            { id: 'start', data: { type: 'knot', content: 'Begin.' } }
        ];
        const variables = [
            { name: 'hp', type: 'number', value: 100 },
            { name: 'player_name', type: 'string', value: 'Hero' },
            { name: 'has_key', type: 'boolean', value: false }
        ];
        const result = generateInk(nodes, [], variables);
        expect(result).toContain('VAR hp = 100');
        expect(result).toContain('VAR player_name = "Hero"');
        expect(result).toContain('VAR has_key = false');
    });

    it('should sanitize node IDs (spaces, special chars)', () => {
        const nodes = [
            { id: 'My Scene 1!', data: { type: 'knot', content: 'Hello.' } }
        ];
        const result = generateInk(nodes, []);
        expect(result).toContain('=== my_scene_1 ===');
        expect(result).toContain('-> my_scene_1');
    });

    it('should prefix IDs that start with numbers', () => {
        const nodes = [
            { id: '123_test', data: { type: 'knot', content: 'Numbered.' } }
        ];
        const result = generateInk(nodes, []);
        expect(result).toContain('=== n_123_test ===');
    });

    it('should pass through tags in content verbatim', () => {
        const nodes = [
            { id: 'tagged', data: { type: 'knot', content: 'Something happens. #shake\n#flash_red\n#play_sfx:gunshot' } }
        ];
        const result = generateInk(nodes, []);
        expect(result).toContain('#shake');
        expect(result).toContain('#flash_red');
        expect(result).toContain('#play_sfx:gunshot');
    });

    it('should find entry node by id "start"', () => {
        const nodes = [
            { id: 'other', data: { type: 'knot', content: 'Other.' } },
            { id: 'start', data: { type: 'knot', content: 'Start here.' } }
        ];
        const result = generateInk(nodes, []);
        expect(result).toMatch(/^-> start\n/);
    });

    it('should find entry node by hub type if no start node', () => {
        const nodes = [
            { id: 'knot_a', data: { type: 'knot', content: 'A' } },
            { id: 'main_hub', data: { type: 'hub', content: 'Hub' } }
        ];
        const result = generateInk(nodes, []);
        expect(result).toMatch(/^-> main_hub\n/);
    });

    it('should use data.text as fallback if data.content is missing', () => {
        const nodes = [
            { id: 'legacy', data: { type: 'knot', text: 'Legacy text field.' } }
        ];
        const result = generateInk(nodes, []);
        expect(result).toContain('Legacy text field.');
    });

    // Inline choices tests
    it('should emit inline choices from data.choices[]', () => {
        const nodes = [
            {
                id: 'crossroads',
                data: {
                    type: 'knot',
                    content: 'You reach a fork in the road.',
                    choices: [
                        { text: 'Go north' },
                        { text: 'Go south' },
                    ]
                }
            },
            { id: 'north', data: { type: 'knot', content: 'You head north.' } },
            { id: 'south', data: { type: 'knot', content: 'You head south.' } },
        ];
        const edges = [
            { id: 'e1', source: 'crossroads', target: 'north', sourceHandle: 'choice_0' },
            { id: 'e2', source: 'crossroads', target: 'south', sourceHandle: 'choice_1' },
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('=== crossroads ===');
        expect(result).toContain('You reach a fork in the road.');
        expect(result).toContain('+ [Go north] -> north');
        expect(result).toContain('+ [Go south] -> south');
    });

    it('should emit -> END for inline choices with no connected edge', () => {
        const nodes = [
            {
                id: 'start',
                data: {
                    type: 'hub',
                    content: 'Choose wisely.',
                    choices: [
                        { text: 'Option A' },
                        { text: 'Option B' },
                    ]
                }
            },
            { id: 'path_a', data: { type: 'knot', content: 'Path A.' } },
        ];
        const edges = [
            { id: 'e1', source: 'start', target: 'path_a', sourceHandle: 'choice_0' },
            // choice_1 has no edge
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('+ [Option A] -> path_a');
        expect(result).toContain('+ [Option B] -> END');
    });

    it('should emit * for consumable choices (sticky: false)', () => {
        const nodes = [
            {
                id: 'room',
                data: {
                    type: 'knot',
                    content: 'A room.',
                    choices: [
                        { text: 'Take key', sticky: false },
                        { text: 'Look around' },
                    ]
                }
            },
            { id: 'took_key', data: { type: 'knot', content: 'You took the key.' } },
            { id: 'looked', data: { type: 'knot', content: 'Nothing special.' } },
        ];
        const edges = [
            { id: 'e1', source: 'room', target: 'took_key', sourceHandle: 'choice_0' },
            { id: 'e2', source: 'room', target: 'looked', sourceHandle: 'choice_1' },
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('* [Take key] -> took_key');
        expect(result).toContain('+ [Look around] -> looked');
    });

    it('should emit choice with condition', () => {
        const nodes = [
            {
                id: 'door',
                data: {
                    type: 'knot',
                    content: 'A locked door.',
                    choices: [
                        { text: 'Use key', condition: 'has_key' },
                        { text: 'Kick door' },
                    ]
                }
            },
            { id: 'opened', data: { type: 'knot', content: 'Door opens.' } },
            { id: 'kicked', data: { type: 'knot', content: 'Ouch.' } },
        ];
        const edges = [
            { id: 'e1', source: 'door', target: 'opened', sourceHandle: 'choice_0' },
            { id: 'e2', source: 'door', target: 'kicked', sourceHandle: 'choice_1' },
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('+ {has_key} [Use key] -> opened');
        expect(result).toContain('+ [Kick door] -> kicked');
    });

    it('should emit consumable choice with condition', () => {
        const nodes = [
            {
                id: 'battle',
                data: {
                    type: 'knot',
                    content: 'The enemy attacks.',
                    choices: [
                        { text: 'Use potion', sticky: false, condition: 'hp > 0' },
                    ]
                }
            },
            { id: 'healed', data: { type: 'knot', content: 'Healed.' } },
        ];
        const edges = [
            { id: 'e1', source: 'battle', target: 'healed', sourceHandle: 'choice_0' },
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('* {hp > 0} [Use potion] -> healed');
    });

    it('should emit warning comment for multi-edge nodes without choices', () => {
        const nodes = [
            { id: 'fork', data: { type: 'knot', content: 'A fork.' } },
            { id: 'left', data: { type: 'knot', content: 'Left.' } },
            { id: 'right', data: { type: 'knot', content: 'Right.' } },
        ];
        const edges = [
            { id: 'e1', source: 'fork', target: 'left' },
            { id: 'e2', source: 'fork', target: 'right' },
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('// WARNING: 2 outgoing edges but no choices. Using first target only.');
        expect(result).toContain('-> left');
    });

    it('should ignore empty data.choices array and use normal flow', () => {
        const nodes = [
            { id: 'scene_1', data: { type: 'knot', content: 'Scene one.', choices: [] } },
            { id: 'scene_2', data: { type: 'knot', content: 'Scene two.' } },
        ];
        const edges = [
            { id: 'e1', source: 'scene_1', target: 'scene_2' },
        ];
        const result = generateInk(nodes, edges);
        expect(result).toContain('=== scene_1 ===');
        expect(result).toContain('-> scene_2');
        expect(result).not.toContain('+ [');
    });
});

describe('validateGraph', () => {
    it('should return empty array for a clean graph', () => {
        const nodes = [
            { id: 'start', data: { type: 'knot', content: 'Begin.' } },
            { id: 'end', data: { type: 'knot', content: 'End.' } },
        ];
        const edges = [
            { id: 'e1', source: 'start', target: 'end' },
        ];
        const warnings = validateGraph(nodes, edges);
        expect(warnings).toHaveLength(0);
    });

    it('should return error for multi-edge node without choices', () => {
        const nodes = [
            { id: 'fork', data: { type: 'knot', content: 'Fork.' } },
            { id: 'a', data: { type: 'knot', content: 'A' } },
            { id: 'b', data: { type: 'knot', content: 'B' } },
        ];
        const edges = [
            { id: 'e1', source: 'fork', target: 'a' },
            { id: 'e2', source: 'fork', target: 'b' },
        ];
        const warnings = validateGraph(nodes, edges);
        const multiEdge = warnings.find(w => w.type === 'error' && w.nodeId === 'fork');
        expect(multiEdge).toBeDefined();
        expect(multiEdge.message).toContain('2 outgoing edges');
    });

    it('should return warning for orphan nodes', () => {
        const nodes = [
            { id: 'start', data: { type: 'knot', content: 'Start.' } },
            { id: 'orphan', data: { type: 'knot', content: 'Lonely.' } },
        ];
        const edges = [];
        const warnings = validateGraph(nodes, edges);
        const orphan = warnings.find(w => w.nodeId === 'orphan' && w.message.includes('Orphan'));
        expect(orphan).toBeDefined();
        expect(orphan.type).toBe('warning');
    });

    it('should return warning for disconnected choice handles', () => {
        const nodes = [
            {
                id: 'start',
                data: {
                    type: 'knot',
                    content: 'Pick.',
                    choices: [
                        { text: 'A' },
                        { text: 'B' },
                    ]
                }
            },
            { id: 'a', data: { type: 'knot', content: 'A.' } },
        ];
        const edges = [
            { id: 'e1', source: 'start', target: 'a', sourceHandle: 'choice_0' },
            // choice_1 has no edge
        ];
        const warnings = validateGraph(nodes, edges);
        const disconnected = warnings.find(w => w.message.includes('Choice "B"'));
        expect(disconnected).toBeDefined();
        expect(disconnected.type).toBe('warning');
    });

    it('should return warning for ID collisions', () => {
        const nodes = [
            { id: 'my node', data: { type: 'knot', content: 'A' } },
            { id: 'my_node', data: { type: 'knot', content: 'B' } },
        ];
        const edges = [];
        const warnings = validateGraph(nodes, edges);
        const collision = warnings.find(w => w.message.includes('ID collision'));
        expect(collision).toBeDefined();
    });
});

describe('generateHubRegistry', () => {
    it('should generate hub registry from hub nodes', () => {
        const nodes = [
            {
                id: 'hub_start',
                data: {
                    type: 'hub',
                    burnRules: [{ target: 'a', burns: ['b'] }]
                }
            },
            { id: 'knot_a', data: { type: 'knot' } }
        ];

        const registry = generateHubRegistry(nodes);
        expect(registry).toHaveLength(1);
        expect(registry[0].id).toBe('hub_start');
        expect(registry[0].options[0].target).toBe('a');
    });
});
