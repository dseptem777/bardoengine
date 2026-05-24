/**
 * tutorialLogic.js — Pure functions for tutorial spotlight decisions.
 * No React, no side effects. All logic extracted from App.jsx closures.
 */

/**
 * True when the intro tutorial should fire:
 * intro has not been seen AND has not already been fired this session.
 */
export function shouldFireIntro({ tutorialSeen, introFired }) {
    return !tutorialSeen.intro && !introFired
}

/**
 * Build the ordered step anchor list for the intro segment.
 * Always starts with hp, text, history, save, options.
 * Appends relationships if relEnabled, inventory if inventoryEnabled.
 * Appends choices LAST only when choicesVisible && choicesLength > 1.
 *
 * Returns an array of anchor-key strings (order matches presentation order).
 */
export function buildIntroSteps({ choicesVisible, choicesLength, relEnabled, inventoryEnabled }) {
    const anchors = ['hp', 'text', 'history', 'save', 'options']
    if (relEnabled) anchors.push('relationships')
    if (inventoryEnabled) anchors.push('inventory')
    if (choicesVisible && choicesLength > 1) anchors.push('choices')
    return anchors
}

/**
 * True when the backup "choices" tutorial should fire:
 * intro already seen, choices not yet seen, choices are visible, and more than one choice.
 */
export function shouldFireChoicesBackup({ tutorialSeen, choicesVisible, choicesLength }) {
    return (
        tutorialSeen.intro === true &&
        !tutorialSeen.choices &&
        choicesVisible === true &&
        choicesLength > 1
    )
}

/**
 * Returns the queue to load when manually replaying the tutorial.
 * If playerName is truthy, stats segment is queued after intro.
 */
export function replayQueue({ playerName }) {
    return playerName ? ['stats'] : []
}

/**
 * Return updated seen object after the intro segment completes.
 * Completing intro always marks choices as seen too (choices was its last step).
 */
export function markIntroDone(seen) {
    return { ...seen, intro: true, choices: true }
}

/**
 * Seen object with all flags reset to false.
 */
export function resetSeen() {
    return { intro: false, choices: false, stats: false }
}

