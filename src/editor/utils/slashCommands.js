/**
 * slashCommands.js
 * Data and utility functions for the slash command palette.
 */

export const SLASH_COMMANDS = [
    // VFX
    { cmd: 'shake',             tag: '#shake',                      desc: 'Shake the screen',                         category: 'VFX',      hasValue: false },
    { cmd: 'flash_red',         tag: '#flash_red',                  desc: 'Flash screen red',                         category: 'VFX',      hasValue: false },
    { cmd: 'flash_white',       tag: '#flash_white',                desc: 'Flash screen white',                       category: 'VFX',      hasValue: false },
    { cmd: 'bg',                tag: '#bg:',                        desc: 'Set background image',                     category: 'VFX',      hasValue: true  },
    { cmd: 'sfx',               tag: '#play_sfx:',                  desc: 'Play sound effect',                        category: 'VFX',      hasValue: true  },
    { cmd: 'music',             tag: '#music:',                     desc: 'Play background music',                    category: 'VFX',      hasValue: true  },
    { cmd: 'music_stop',        tag: '#music:stop',                 desc: 'Stop background music',                    category: 'VFX',      hasValue: false },
    { cmd: 'ui_effect',         tag: '#UI_EFFECT:',                 desc: 'UI horror effect (blur_vignette...)',       category: 'VFX',      hasValue: true  },
    // Minigames
    { cmd: 'minigame_qte',      tag: '#MINIGAME: type=qte',         desc: 'Quick Time Event minigame',                category: 'Minigame', hasValue: false },
    { cmd: 'minigame_lockpick', tag: '#MINIGAME: type=lockpick',    desc: 'Lockpick minigame',                        category: 'Minigame', hasValue: false },
    { cmd: 'minigame_arkanoid', tag: '#MINIGAME: type=arkanoid',    desc: 'Arkanoid minigame',                        category: 'Minigame', hasValue: false },
    { cmd: 'minigame_apnea',    tag: '#MINIGAME: type=apnea',       desc: 'Apnea minigame',                           category: 'Minigame', hasValue: false },
    { cmd: 'keymash',           tag: '#KEY_MASH:',                  desc: 'Key mashing challenge (target count)',     category: 'Minigame', hasValue: true  },
    // Horror
    { cmd: 'willpower_start',   tag: '#WILLPOWER_START:',           desc: 'Start willpower drain (slow/normal/fast)', category: 'Horror',   hasValue: true  },
    { cmd: 'willpower_stop',    tag: '#WILLPOWER_STOP',             desc: 'Stop willpower drain',                     category: 'Horror',   hasValue: false },
    { cmd: 'willpower_check',   tag: '#WILLPOWER_CHECK:',           desc: 'Check willpower threshold',                category: 'Horror',   hasValue: true  },
    { cmd: 'mouse_resistance',  tag: '#MOUSE_RESISTANCE:',          desc: 'Heavy cursor (low/medium/high)',           category: 'Horror',   hasValue: true  },
    { cmd: 'spider_start',      tag: '#SPIDER_START: difficulty=',  desc: 'Spider infestation (normal/hard)',         category: 'Horror',   hasValue: true  },
    { cmd: 'spider_stop',       tag: '#SPIDER_STOP',                desc: 'Stop spider infestation',                  category: 'Horror',   hasValue: false },
    { cmd: 'spider_check',      tag: '#SPIDER_CHECK:',              desc: 'Spider count check',                       category: 'Horror',   hasValue: true  },
    // Combat
    { cmd: 'arrebatados_start', tag: '#ARREBATADOS_START:',         desc: 'Start arrebatados system',                 category: 'Combat',   hasValue: true  },
    { cmd: 'arrebatados_stop',  tag: '#ARREBATADOS_STOP',           desc: 'Stop arrebatados system',                  category: 'Combat',   hasValue: false },
    { cmd: 'boss_start',        tag: '#BOSS_START:',                desc: 'Start boss encounter',                     category: 'Combat',   hasValue: true  },
    { cmd: 'boss_phase',        tag: '#BOSS_PHASE:',                desc: 'Set boss phase',                           category: 'Combat',   hasValue: true  },
    { cmd: 'boss_damage',       tag: '#BOSS_DAMAGE:',               desc: 'Apply boss damage',                        category: 'Combat',   hasValue: true  },
    { cmd: 'boss_check',        tag: '#BOSS_CHECK',                 desc: 'Check boss status',                        category: 'Combat',   hasValue: false },
    { cmd: 'boss_stop',         tag: '#BOSS_STOP',                  desc: 'End boss encounter',                       category: 'Combat',   hasValue: false },
    { cmd: 'visual_damage',     tag: '#VISUAL_DAMAGE:',             desc: 'Visual damage effect',                     category: 'Combat',   hasValue: true  },
    // Game
    { cmd: 'stat',              tag: '#stat:',                      desc: 'Modify stat (e.g. hp:+10)',                category: 'Game',     hasValue: true  },
    { cmd: 'inventory_add',     tag: '#inventory_add:',             desc: 'Add item to inventory',                    category: 'Game',     hasValue: true  },
    { cmd: 'inventory_remove',  tag: '#inventory_remove:',          desc: 'Remove item from inventory',               category: 'Game',     hasValue: true  },
    { cmd: 'achievement',       tag: '#achievement:unlock:',        desc: 'Unlock achievement',                       category: 'Game',     hasValue: true  },
    { cmd: 'input',             tag: '#input:',                     desc: 'Prompt for text input (varName:placeholder)', category: 'Game', hasValue: true  },
    { cmd: 'wait',              tag: '#wait:',                      desc: 'Pause for X seconds',                      category: 'Game',     hasValue: true  },
    { cmd: 'clear',             tag: '#clear',                      desc: 'Clear screen',                             category: 'Game',     hasValue: false },
    { cmd: 'next',              tag: '#next',                       desc: 'Auto-continue to next beat',               category: 'Game',     hasValue: false },
];

/**
 * Extract the current slash query from textarea content at cursor position.
 * Returns the word after / if cursor is directly at its end.
 * Returns null if no active slash command.
 *
 * getSlashQuery('Hello /shake', 12) → 'shake'
 * getSlashQuery('Hello /', 7)       → ''
 * getSlashQuery('Hello world', 11)  → null
 */
export function getSlashQuery(text, cursorPos) {
    // Only trigger at end of text or at end of a line (cursor before \n or at text end)
    const nextChar = text[cursorPos];
    if (nextChar !== undefined && nextChar !== '\n') {
        return null;
    }
    const before = text.slice(0, cursorPos);
    const match = before.match(/(?:^|[\s\n])\/(\w*)$/);
    return match ? match[1] : null;
}

/**
 * Replace the /query at cursorPos with tag in text.
 */
export function insertTag(text, cursorPos, query, tag) {
    const slashStart = cursorPos - query.length - 1;
    return text.slice(0, slashStart) + tag + text.slice(cursorPos);
}

/**
 * Filter SLASH_COMMANDS by query string. Returns at most 8 results.
 */
export function filterCommands(query) {
    if (query === null) return [];
    const q = query.toLowerCase();
    return SLASH_COMMANDS.filter(c =>
        c.cmd.includes(q) || c.desc.toLowerCase().includes(q)
    ).slice(0, 8);
}
