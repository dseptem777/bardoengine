/**
 * exampleProject.js
 * A complete example project demonstrating all major BardoEngine features.
 * "The Haunted Mansion" — a short horror story with stats, inventory,
 * minigames, willpower, VFX, audio, achievements, and multiple endings.
 */

export const EXAMPLE_PROJECT = {
    version: '1.2.0',
    title: 'The Haunted Mansion',
    nodes: [
        // Chapter 1: Arrival
        {
            id: 'start', type: 'passage', position: { x: 0, y: 0 },
            data: {
                label: 'Entrance', type: 'knot', chapter: 'Arrival',
                content: '#music:haunted_theme\n#bg:mansion_exterior\nThe old mansion looms before you, its windows dark like hollow eyes.\n\nYou clutch your flashlight tighter. The door is unlocked.',
                choices: [
                    { text: 'Enter the mansion', sticky: true },
                    { text: 'Check the mailbox first', sticky: false },
                ],
            },
        },
        {
            id: 'mailbox', type: 'passage', position: { x: 350, y: -100 },
            data: {
                label: 'Mailbox', type: 'knot', chapter: 'Arrival',
                content: 'Inside the rusty mailbox you find a torn note:\n\n"The key is in the kitchen. Whatever you do, don\'t go to the basement without it."\n#inv:add:note\n#play_sfx:paper',
            },
        },
        {
            id: 'foyer', type: 'passage', position: { x: 350, y: 80 },
            data: {
                label: 'Foyer', type: 'hub', chapter: 'Exploration',
                content: '#bg:mansion_foyer\n#play_sfx:door_creak\nThe foyer is covered in dust. A grand staircase leads up. Doors lead to the kitchen and the library.\n\nA locked door leads to the basement.',
                choices: [
                    { text: 'Go to the kitchen', sticky: false },
                    { text: 'Go to the library', sticky: false },
                    { text: 'Go upstairs', sticky: true },
                    { text: 'Try the basement door', sticky: true, condition: 'has_key' },
                ],
                burnRules: [
                    { target: 'kitchen', burns: [] },
                    { target: 'library', burns: [] },
                ],
            },
        },
        // Chapter 2: Exploration
        {
            id: 'kitchen', type: 'passage', position: { x: 700, y: -80 },
            data: {
                label: 'Kitchen', type: 'knot', chapter: 'Exploration',
                content: '#bg:kitchen\nThe kitchen is a mess. Broken plates everywhere.\n\nYou spot a rusty key hanging on a hook.\n#inv:add:rusty_key\n~ has_key = true\n#play_sfx:key_pickup\n#achievement:unlock:explorer',
            },
        },
        {
            id: 'library', type: 'passage', position: { x: 700, y: 80 },
            data: {
                label: 'Library', type: 'knot', chapter: 'Exploration',
                content: '#bg:library\nDusty bookshelves line the walls. One book is sticking out.\n\nYou pull it and find a health potion hidden behind.\n#stat:hp:+25\n#play_sfx:potion',
            },
        },
        {
            id: 'upstairs', type: 'passage', position: { x: 700, y: 220 },
            data: {
                label: 'Upstairs', type: 'knot', chapter: 'Exploration',
                content: '#bg:hallway_dark\n#WILLPOWER_START: fast\nThe hallway upstairs is wrong. The walls seem to breathe.\n\nYou feel your willpower draining...\n#WILLPOWER_CHECK: 40\n#WILLPOWER_STOP\n{willpower_passed == 1: You grit your teeth and push through. Your courage grows. | The walls close in. You stumble back, gasping.}\n#shake\n~ courage = courage + 10',
            },
        },
        // Chapter 3: Basement
        {
            id: 'basement', type: 'passage', position: { x: 700, y: 400 },
            data: {
                label: 'Basement', type: 'knot', chapter: 'Basement',
                content: '#bg:basement\n#music:boss_theme\n#play_sfx:door_slam\nThe basement is cold. Something moves in the shadows.\n\nA creature blocks the exit. You must fight or solve the lock.',
                choices: [
                    { text: 'Fight the creature', sticky: true },
                    { text: 'Try the lockpick puzzle', sticky: true },
                ],
            },
        },
        {
            id: 'boss_fight', type: 'passage', position: { x: 1050, y: 350 },
            data: {
                label: 'Boss Fight', type: 'knot', chapter: 'Basement',
                content: '#MINIGAME: type=qte, key=SPACE, timeout=1.5, autostart=true\nThe creature lunges! Press SPACE!',
                choices: [
                    { text: 'You struck the creature!', condition: 'minigame_result == 1' },
                    { text: 'It got you...', condition: 'minigame_result == 0' },
                ],
            },
        },
        {
            id: 'lockpick', type: 'passage', position: { x: 1050, y: 500 },
            data: {
                label: 'Lockpick', type: 'knot', chapter: 'Basement',
                content: '#MINIGAME: type=lockpick, speed=1, zoneSize=0.15, autostart=true\nYou find a back exit. The lock is old but complex...',
                choices: [
                    { text: 'The lock clicks open!', condition: 'minigame_result == 1' },
                    { text: 'The pick snaps...', condition: 'minigame_result == 0' },
                ],
            },
        },
        // Endings
        {
            id: 'victory', type: 'passage', position: { x: 1400, y: 350 },
            data: {
                label: 'Escape', type: 'knot', chapter: 'Ending',
                content: '#music:victory\n#flash_white\nYou burst through the exit into moonlight.\n\nThe mansion crumbles behind you. You survived.\n\n{courage > 5: You feel brave — this experience made you stronger. | You barely made it, trembling and weak.}\n#achievement:unlock:survivor',
            },
        },
        {
            id: 'defeat', type: 'passage', position: { x: 1400, y: 500 },
            data: {
                label: 'Game Over', type: 'knot', chapter: 'Ending',
                content: '#shake\n#flash_red\n#music:stop\nDarkness closes in. The mansion claims another victim.\n\n...or does it?\n#stat:hp:-100',
            },
        },
    ],
    edges: [
        // Arrival
        { id: 'e_start_mailbox', source: 'start', target: 'mailbox', sourceHandle: 'choice_1' },
        { id: 'e_start_foyer', source: 'start', target: 'foyer', sourceHandle: 'choice_0' },
        { id: 'e_mailbox_foyer', source: 'mailbox', target: 'foyer' },
        // Exploration hub
        { id: 'e_foyer_kitchen', source: 'foyer', target: 'kitchen', sourceHandle: 'choice_0' },
        { id: 'e_foyer_library', source: 'foyer', target: 'library', sourceHandle: 'choice_1' },
        { id: 'e_foyer_upstairs', source: 'foyer', target: 'upstairs', sourceHandle: 'choice_2' },
        { id: 'e_foyer_basement', source: 'foyer', target: 'basement', sourceHandle: 'choice_3' },
        // Return to foyer
        { id: 'e_kitchen_foyer', source: 'kitchen', target: 'foyer' },
        { id: 'e_library_foyer', source: 'library', target: 'foyer' },
        // Upstairs returns to foyer
        { id: 'e_up_foyer', source: 'upstairs', target: 'foyer' },
        // Basement
        { id: 'e_base_fight', source: 'basement', target: 'boss_fight', sourceHandle: 'choice_0' },
        { id: 'e_base_lock', source: 'basement', target: 'lockpick', sourceHandle: 'choice_1' },
        // Fight outcomes
        { id: 'e_fight_win', source: 'boss_fight', target: 'victory', sourceHandle: 'choice_0' },
        { id: 'e_fight_lose', source: 'boss_fight', target: 'defeat', sourceHandle: 'choice_1' },
        // Lockpick outcomes
        { id: 'e_lock_win', source: 'lockpick', target: 'victory', sourceHandle: 'choice_0' },
        { id: 'e_lock_lose', source: 'lockpick', target: 'defeat', sourceHandle: 'choice_1' },
    ],
    variables: [
        { name: 'hp', type: 'number', value: 100 },
        { name: 'courage', type: 'number', value: 0 },
        { name: 'has_key', type: 'boolean', value: false },
        { name: 'minigame_result', type: 'number', value: 0 },
        { name: 'willpower_passed', type: 'number', value: 0 },
    ],
    config: {
        theme: { primaryColor: '#ef4444', bgColor: '#0a0a0a' },
        stats: {
            enabled: true,
            definitions: [
                { id: 'hp', label: 'Health', initial: 100, max: 100, icon: 'favorite' },
                { id: 'courage', label: 'Courage', initial: 0, max: 20, icon: 'shield' },
            ],
        },
        inventory: {
            enabled: true,
            maxSlots: 5,
            categories: [
                {
                    name: 'Items',
                    items: [
                        { id: 'note', name: 'Torn Note', icon: 'description' },
                        { id: 'rusty_key', name: 'Rusty Key', icon: 'key' },
                    ],
                },
            ],
        },
        achievements: [
            { id: 'explorer', title: 'Explorer', description: 'Found the kitchen key' },
            { id: 'survivor', title: 'Survivor', description: 'Escaped the mansion' },
        ],
    },
};
