/**
 * nodeTemplates.js
 * Pre-built node structures for common narrative patterns.
 * Each template is { name, desc, icon, build(basePos) } where build returns { nodes, edges }.
 * IDs use template_ prefix + timestamp to avoid collisions.
 */

let templateCounter = 0;
const tid = (suffix) => `tpl_${Date.now()}_${templateCounter++}_${suffix}`;

export const NODE_TEMPLATES = [
    {
        name: 'Simple Branch',
        desc: '2-way choice',
        icon: 'call_split',
        build(base) {
            const ids = { decision: tid('decision'), a: tid('option_a'), b: tid('option_b') };
            return {
                nodes: [
                    { id: ids.decision, type: 'passage', position: { x: base.x, y: base.y }, data: { label: 'Decision', type: 'knot', content: 'The path splits before you.\n\nWhat do you do?', choices: [{ text: 'Go left', sticky: true }, { text: 'Go right', sticky: true }] } },
                    { id: ids.a, type: 'passage', position: { x: base.x + 350, y: base.y - 80 }, data: { label: 'Option A', type: 'knot', content: 'You went left...' } },
                    { id: ids.b, type: 'passage', position: { x: base.x + 350, y: base.y + 80 }, data: { label: 'Option B', type: 'knot', content: 'You went right...' } },
                ],
                edges: [
                    { id: `e_${ids.decision}_${ids.a}`, source: ids.decision, target: ids.a, sourceHandle: 'choice_0' },
                    { id: `e_${ids.decision}_${ids.b}`, source: ids.decision, target: ids.b, sourceHandle: 'choice_1' },
                ],
            };
        },
    },
    {
        name: 'Three-Way Branch',
        desc: '3-way choice',
        icon: 'device_hub',
        build(base) {
            const ids = { decision: tid('decision'), a: tid('a'), b: tid('b'), c: tid('c') };
            return {
                nodes: [
                    { id: ids.decision, type: 'passage', position: { x: base.x, y: base.y }, data: { label: 'Decision', type: 'knot', content: 'Three paths lie ahead.\n\nChoose wisely.', choices: [{ text: 'First path', sticky: true }, { text: 'Second path', sticky: true }, { text: 'Third path', sticky: true }] } },
                    { id: ids.a, type: 'passage', position: { x: base.x + 350, y: base.y - 120 }, data: { label: 'Path A', type: 'knot', content: 'The first path...' } },
                    { id: ids.b, type: 'passage', position: { x: base.x + 350, y: base.y }, data: { label: 'Path B', type: 'knot', content: 'The second path...' } },
                    { id: ids.c, type: 'passage', position: { x: base.x + 350, y: base.y + 120 }, data: { label: 'Path C', type: 'knot', content: 'The third path...' } },
                ],
                edges: [
                    { id: `e_${ids.decision}_${ids.a}`, source: ids.decision, target: ids.a, sourceHandle: 'choice_0' },
                    { id: `e_${ids.decision}_${ids.b}`, source: ids.decision, target: ids.b, sourceHandle: 'choice_1' },
                    { id: `e_${ids.decision}_${ids.c}`, source: ids.decision, target: ids.c, sourceHandle: 'choice_2' },
                ],
            };
        },
    },
    {
        name: 'Exploration Hub',
        desc: 'Hub with burnable choices',
        icon: 'castle',
        build(base) {
            const ids = { hub: tid('hub'), r1: tid('room1'), r2: tid('room2'), r3: tid('room3') };
            return {
                nodes: [
                    { id: ids.hub, type: 'passage', position: { x: base.x, y: base.y }, data: { label: 'Hub', type: 'hub', content: 'You stand in the main hall.\n\nSeveral doors lead to different rooms.', choices: [{ text: 'Enter Room 1', sticky: false }, { text: 'Enter Room 2', sticky: false }, { text: 'Enter Room 3', sticky: false }] } },
                    { id: ids.r1, type: 'passage', position: { x: base.x + 350, y: base.y - 120 }, data: { label: 'Room 1', type: 'knot', content: 'Room 1...' } },
                    { id: ids.r2, type: 'passage', position: { x: base.x + 350, y: base.y }, data: { label: 'Room 2', type: 'knot', content: 'Room 2...' } },
                    { id: ids.r3, type: 'passage', position: { x: base.x + 350, y: base.y + 120 }, data: { label: 'Room 3', type: 'knot', content: 'Room 3...' } },
                ],
                edges: [
                    { id: `e_${ids.hub}_${ids.r1}`, source: ids.hub, target: ids.r1, sourceHandle: 'choice_0' },
                    { id: `e_${ids.hub}_${ids.r2}`, source: ids.hub, target: ids.r2, sourceHandle: 'choice_1' },
                    { id: `e_${ids.hub}_${ids.r3}`, source: ids.hub, target: ids.r3, sourceHandle: 'choice_2' },
                ],
            };
        },
    },
    {
        name: 'Puzzle',
        desc: 'Minigame with win/lose branches',
        icon: 'extension',
        build(base) {
            const ids = { intro: tid('intro'), game: tid('game'), win: tid('win'), lose: tid('lose') };
            return {
                nodes: [
                    { id: ids.intro, type: 'passage', position: { x: base.x, y: base.y }, data: { label: 'Puzzle Intro', type: 'knot', content: 'A challenge awaits...' } },
                    { id: ids.game, type: 'passage', position: { x: base.x + 350, y: base.y }, data: { label: 'Minigame', type: 'knot', content: '#MINIGAME: type=qte, key=SPACE, timeout=1.5, autostart=true', choices: [{ text: 'Victory', condition: 'minigame_result == 1' }, { text: 'Defeat', condition: 'minigame_result == 0' }] } },
                    { id: ids.win, type: 'passage', position: { x: base.x + 700, y: base.y - 80 }, data: { label: 'Victory', type: 'knot', content: 'You succeeded!' } },
                    { id: ids.lose, type: 'passage', position: { x: base.x + 700, y: base.y + 80 }, data: { label: 'Defeat', type: 'knot', content: 'You failed...' } },
                ],
                edges: [
                    { id: `e_${ids.intro}_${ids.game}`, source: ids.intro, target: ids.game },
                    { id: `e_${ids.game}_${ids.win}`, source: ids.game, target: ids.win, sourceHandle: 'choice_0' },
                    { id: `e_${ids.game}_${ids.lose}`, source: ids.game, target: ids.lose, sourceHandle: 'choice_1' },
                ],
            };
        },
    },
    {
        name: 'Dialogue Loop',
        desc: 'NPC talk with exit',
        icon: 'chat',
        build(base) {
            const ids = { hub: tid('dialogue'), topic1: tid('topic1'), topic2: tid('topic2'), exit: tid('exit') };
            return {
                nodes: [
                    { id: ids.hub, type: 'passage', position: { x: base.x, y: base.y }, data: { label: 'Dialogue', type: 'hub', content: '"What would you like to know?"', choices: [{ text: 'Ask about topic 1', sticky: true }, { text: 'Ask about topic 2', sticky: true }, { text: 'Leave', sticky: true }] } },
                    { id: ids.topic1, type: 'passage', position: { x: base.x + 350, y: base.y - 100 }, data: { label: 'Topic 1', type: 'knot', content: '"Let me tell you about..."' } },
                    { id: ids.topic2, type: 'passage', position: { x: base.x + 350, y: base.y + 20 }, data: { label: 'Topic 2', type: 'knot', content: '"Ah, you want to know about..."' } },
                    { id: ids.exit, type: 'passage', position: { x: base.x + 350, y: base.y + 140 }, data: { label: 'Leave', type: 'knot', content: '"Goodbye then."' } },
                ],
                edges: [
                    { id: `e_${ids.hub}_${ids.topic1}`, source: ids.hub, target: ids.topic1, sourceHandle: 'choice_0' },
                    { id: `e_${ids.hub}_${ids.topic2}`, source: ids.hub, target: ids.topic2, sourceHandle: 'choice_1' },
                    { id: `e_${ids.hub}_${ids.exit}`, source: ids.hub, target: ids.exit, sourceHandle: 'choice_2' },
                    { id: `e_${ids.topic1}_${ids.hub}`, source: ids.topic1, target: ids.hub },
                    { id: `e_${ids.topic2}_${ids.hub}`, source: ids.topic2, target: ids.hub },
                ],
            };
        },
    },
];
