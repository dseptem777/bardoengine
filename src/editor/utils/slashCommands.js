/**
 * slashCommands.js
 * Data and utility functions for the slash command palette.
 */

export const SLASH_COMMANDS = [
    // VFX
    { cmd: 'shake',             tag: '#shake',                      desc: 'Shakes the screen briefly',                                                category: 'VFX',      hasValue: false },
    { cmd: 'flash_red',         tag: '#flash_red',                  desc: 'Flashes screen red — use for damage or danger',                            category: 'VFX',      hasValue: false },
    { cmd: 'flash_white',       tag: '#flash_white',                desc: 'Flashes screen white — use for explosions or revelations',                 category: 'VFX',      hasValue: false },
    { cmd: 'bg',                tag: '#bg:forest',                  desc: 'Sets background image. Change "forest" to your image name (no extension)', category: 'VFX',      hasValue: false },
    { cmd: 'sfx',               tag: '#play_sfx:gunshot',           desc: 'Plays a sound effect once. Change "gunshot" to your sound file name',      category: 'VFX',      hasValue: false },
    { cmd: 'music',             tag: '#music:theme',                desc: 'Plays background music. Loops until stopped or changed',                   category: 'VFX',      hasValue: false },
    { cmd: 'music_stop',        tag: '#music:stop',                 desc: 'Fades out the current background music',                                   category: 'VFX',      hasValue: false },
    { cmd: 'ui_effect',         tag: '#UI_EFFECT: blur_vignette',   desc: 'Horror UI effect. Options: blur_vignette, static_noise, blood_drip',       category: 'VFX',      hasValue: false },
    // Minigames
    { cmd: 'minigame_qte',      tag: '#MINIGAME: type=qte, key=SPACE, timeout=1.5, autostart=true',       desc: 'Quick-time event — player presses key before timeout. Result: minigame_result (1=win, 0=lose)',  category: 'Minigame', hasValue: false },
    { cmd: 'minigame_lockpick', tag: '#MINIGAME: type=lockpick, speed=1, zoneSize=0.15, autostart=true',   desc: 'Lockpick minigame — stop the indicator in the zone. Result: minigame_result (1=win, 0=lose)',    category: 'Minigame', hasValue: false },
    { cmd: 'minigame_arkanoid', tag: '#MINIGAME: type=arkanoid, autostart=true',                           desc: 'Arkanoid minigame — break all blocks. Result: minigame_result (1=win, 0=lose)',                  category: 'Minigame', hasValue: false },
    { cmd: 'minigame_apnea',    tag: '#MINIGAME: type=apnea, autostart=true',                              desc: 'Apnea challenge — hold breath as long as possible. Result: minigame_result (1=win, 0=lose)',     category: 'Minigame', hasValue: false },
    { cmd: 'keymash',           tag: '#KEY_MASH: 30',               desc: 'Key mashing challenge — player must hit 30 key presses. Change number to adjust difficulty',  category: 'Minigame', hasValue: false },
    // Horror
    { cmd: 'willpower_start',   tag: '#WILLPOWER_START: normal',    desc: 'Starts willpower drain. Player must click to resist. Speed: slow, normal, fast',              category: 'Horror',   hasValue: false },
    { cmd: 'willpower_stop',    tag: '#WILLPOWER_STOP',             desc: 'Stops the willpower drain immediately',                                                       category: 'Horror',   hasValue: false },
    { cmd: 'willpower_check',   tag: '#WILLPOWER_CHECK: 50',        desc: 'Checks if willpower is above threshold (0-100). Result: willpower_passed (1=pass, 0=fail)',   category: 'Horror',   hasValue: false },
    { cmd: 'mouse_resistance',  tag: '#MOUSE_RESISTANCE: medium',   desc: 'Makes cursor feel heavy/sluggish. Intensity: low, medium, high',                             category: 'Horror',   hasValue: false },
    { cmd: 'spider_start',      tag: '#SPIDER_START: difficulty=normal',  desc: 'Spiders crawl on screen. Player clicks to squish. Difficulty: normal, hard',            category: 'Horror',   hasValue: false },
    { cmd: 'spider_stop',       tag: '#SPIDER_STOP',                desc: 'Stops the spider infestation overlay',                                                        category: 'Horror',   hasValue: false },
    { cmd: 'spider_check',      tag: '#SPIDER_CHECK: 5',            desc: 'Checks if player squished enough spiders. Result: spider_survived (1=yes, 0=no)',             category: 'Horror',   hasValue: false },
    // Combat
    { cmd: 'arrebatados_start', tag: '#ARREBATADOS_START: normal',  desc: 'Starts arrebatados system. Intensity: normal, hard',                                          category: 'Combat',   hasValue: false },
    { cmd: 'arrebatados_stop',  tag: '#ARREBATADOS_STOP',           desc: 'Stops the arrebatados system',                                                                category: 'Combat',   hasValue: false },
    { cmd: 'boss_start',        tag: '#BOSS_START: boss_name',      desc: 'Starts a boss encounter. Change "boss_name" to your boss ID',                                 category: 'Combat',   hasValue: false },
    { cmd: 'boss_phase',        tag: '#BOSS_PHASE: 2',              desc: 'Sets the boss to a specific phase number',                                                    category: 'Combat',   hasValue: false },
    { cmd: 'boss_damage',       tag: '#BOSS_DAMAGE: 10',            desc: 'Applies damage to the boss. Change number to adjust',                                         category: 'Combat',   hasValue: false },
    { cmd: 'boss_check',        tag: '#BOSS_CHECK',                 desc: 'Checks if boss is defeated. Result: boss_defeated (1=yes, 0=no)',                              category: 'Combat',   hasValue: false },
    { cmd: 'boss_stop',         tag: '#BOSS_STOP',                  desc: 'Ends the boss encounter and cleans up',                                                        category: 'Combat',   hasValue: false },
    { cmd: 'visual_damage',     tag: '#VISUAL_DAMAGE: 20',          desc: 'Flashes screen with damage effect. Number = intensity (0-100)',                                category: 'Combat',   hasValue: false },
    // Game
    { cmd: 'stat',              tag: '#stat:hp:+0',                 desc: 'Modifies a stat. Format: stat:name:+N or -N. Use /stat for autocomplete from config',         category: 'Game',     hasValue: false },
    { cmd: 'inventory_add',     tag: '#inv:add:item_name',          desc: 'Adds an item to inventory. Change "item_name" to your item ID',                               category: 'Game',     hasValue: false },
    { cmd: 'inventory_remove',  tag: '#inv:remove:item_name',       desc: 'Removes an item from inventory. Change "item_name" to your item ID',                          category: 'Game',     hasValue: false },
    { cmd: 'achievement',       tag: '#achievement:unlock:trophy',  desc: 'Unlocks an achievement. Change "trophy" to your achievement ID',                              category: 'Game',     hasValue: false },
    { cmd: 'input',             tag: '#input:varName:Enter your name...', desc: 'Prompts player for text input. Saved to varName variable',                              category: 'Game',     hasValue: false },
    { cmd: 'wait',              tag: '#wait:2',                     desc: 'Pauses the story for N seconds before continuing',                                             category: 'Game',     hasValue: false },
    { cmd: 'clear',             tag: '#clear',                      desc: 'Clears all text from the screen',                                                              category: 'Game',     hasValue: false },
    { cmd: 'next',              tag: '#next',                       desc: 'Auto-continues to the next beat without waiting for player',                                   category: 'Game',     hasValue: false },
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
