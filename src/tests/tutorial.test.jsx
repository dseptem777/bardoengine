/**
 * Tests for the tutorial spotlight system:
 *  1. tutorialSeen flags in DEFAULT_SETTINGS
 *  2. TutorialSpotlight skips steps whose anchor doesn't exist in DOM
 *  3. Pure logic in tutorialLogic.js (buildIntroSteps, shouldFireChoicesBackup,
 *     replayQueue, markIntroDone, resetSeen)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

import {
    buildIntroSteps,
    shouldFireChoicesBackup,
    replayQueue,
    markIntroDone,
    resetSeen,
} from '../utils/tutorialLogic'

// ─── 1. tutorialSeen in DEFAULT_SETTINGS ────────────────────────────────────

describe('useSettings — tutorialSeen default', () => {
    it('exports DEFAULT_SETTINGS with tutorialSeen.intro/choices/stats all false', async () => {
        const mod = await import('../hooks/useSettings.jsx')
        const { useSettings } = mod

        function Reader() {
            const { settings } = useSettings()
            return <div data-testid="val">{JSON.stringify(settings.tutorialSeen)}</div>
        }
        const { getByTestId } = render(<Reader />)
        const val = JSON.parse(getByTestId('val').textContent)
        expect(val).toEqual({ intro: false, choices: false, stats: false })
    })
})

// ─── 2. TutorialSpotlight — skip steps with missing anchor ──────────────────

describe('TutorialSpotlight — anchor skip', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockReturnValue({
                matches: false,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }),
        })
    })

    it('renders nothing when all step anchors are missing from DOM', async () => {
        const { default: TutorialSpotlight } = await import('../components/TutorialSpotlight.jsx')
        const onDone = vi.fn()
        const steps = [
            { anchor: 'hp', title: 'HP', body: 'test body' },
            { anchor: 'choices', title: 'Choices', body: 'test body 2' },
        ]
        const { container } = render(
            <TutorialSpotlight steps={steps} speaker={{ name: 'ENRÍQUEZ' }} onDone={onDone} />
        )
        expect(container.querySelector('[role="dialog"]')).toBeNull()
    })

    it('renders only steps whose anchor exists in DOM', async () => {
        const { default: TutorialSpotlight } = await import('../components/TutorialSpotlight.jsx')

        const anchor = document.createElement('div')
        anchor.setAttribute('data-tutorial', 'hp')
        document.body.appendChild(anchor)

        const steps = [
            { anchor: 'hp', title: 'HP', body: 'Su signo vital.' },
            { anchor: 'choices', title: 'Decisiones', body: 'Las opciones.' },
        ]

        const { queryByText } = render(
            <TutorialSpotlight steps={steps} speaker={{ name: 'ENRÍQUEZ' }} onDone={vi.fn()} />
        )

        expect(queryByText('Su signo vital.')).toBeTruthy()
        expect(queryByText('Las opciones.')).toBeNull()

        document.body.removeChild(anchor)
    })
})

// ─── 3. tutorialLogic — buildIntroSteps ────────────────────────────────────

describe('buildIntroSteps', () => {
    it('includes base anchors in order', () => {
        const anchors = buildIntroSteps({ choicesVisible: false, choicesLength: 0, relEnabled: false, inventoryEnabled: false })
        expect(anchors).toEqual(['hp', 'text', 'history', 'save', 'options'])
    })

    it('appends relationships when relEnabled', () => {
        const anchors = buildIntroSteps({ choicesVisible: false, choicesLength: 0, relEnabled: true, inventoryEnabled: false })
        expect(anchors).toContain('relationships')
        expect(anchors.indexOf('relationships')).toBeGreaterThan(anchors.indexOf('options'))
    })

    it('appends inventory when inventoryEnabled', () => {
        const anchors = buildIntroSteps({ choicesVisible: false, choicesLength: 0, relEnabled: false, inventoryEnabled: true })
        expect(anchors).toContain('inventory')
        expect(anchors.indexOf('inventory')).toBeGreaterThan(anchors.indexOf('options'))
    })

    it('appends choices LAST when choicesVisible && choicesLength > 1', () => {
        const anchors = buildIntroSteps({ choicesVisible: true, choicesLength: 2, relEnabled: true, inventoryEnabled: true })
        expect(anchors.at(-1)).toBe('choices')
        expect(anchors.indexOf('choices')).toBeGreaterThan(anchors.indexOf('relationships'))
        expect(anchors.indexOf('choices')).toBeGreaterThan(anchors.indexOf('inventory'))
    })

    it('excludes choices when choicesVisible is false', () => {
        const anchors = buildIntroSteps({ choicesVisible: false, choicesLength: 5, relEnabled: false, inventoryEnabled: false })
        expect(anchors).not.toContain('choices')
    })

    it('excludes choices when choicesLength is 1', () => {
        const anchors = buildIntroSteps({ choicesVisible: true, choicesLength: 1, relEnabled: false, inventoryEnabled: false })
        expect(anchors).not.toContain('choices')
    })

    it('excludes choices when choicesLength is 0', () => {
        const anchors = buildIntroSteps({ choicesVisible: true, choicesLength: 0, relEnabled: false, inventoryEnabled: false })
        expect(anchors).not.toContain('choices')
    })

    it('includes relationships before inventory before choices', () => {
        const anchors = buildIntroSteps({ choicesVisible: true, choicesLength: 3, relEnabled: true, inventoryEnabled: true })
        const relIdx = anchors.indexOf('relationships')
        const invIdx = anchors.indexOf('inventory')
        const choIdx = anchors.indexOf('choices')
        expect(relIdx).toBeLessThan(invIdx)
        expect(invIdx).toBeLessThan(choIdx)
    })
})

// ─── 4. tutorialLogic — shouldFireChoicesBackup ─────────────────────────────

describe('shouldFireChoicesBackup', () => {
    it('returns true when intro seen, choices not seen, visible, length > 1', () => {
        expect(shouldFireChoicesBackup({
            tutorialSeen: { intro: true, choices: false, stats: false },
            choicesVisible: true,
            choicesLength: 2,
        })).toBe(true)
    })

    it('returns false when intro NOT seen', () => {
        expect(shouldFireChoicesBackup({
            tutorialSeen: { intro: false, choices: false, stats: false },
            choicesVisible: true,
            choicesLength: 2,
        })).toBe(false)
    })

    it('returns false when choices already seen', () => {
        expect(shouldFireChoicesBackup({
            tutorialSeen: { intro: true, choices: true, stats: false },
            choicesVisible: true,
            choicesLength: 2,
        })).toBe(false)
    })

    it('returns false when choicesVisible is false', () => {
        expect(shouldFireChoicesBackup({
            tutorialSeen: { intro: true, choices: false, stats: false },
            choicesVisible: false,
            choicesLength: 3,
        })).toBe(false)
    })

    it('returns false when choicesLength is 1', () => {
        expect(shouldFireChoicesBackup({
            tutorialSeen: { intro: true, choices: false, stats: false },
            choicesVisible: true,
            choicesLength: 1,
        })).toBe(false)
    })

    it('returns false when choicesLength is 0', () => {
        expect(shouldFireChoicesBackup({
            tutorialSeen: { intro: true, choices: false, stats: false },
            choicesVisible: true,
            choicesLength: 0,
        })).toBe(false)
    })
})

// ─── 5. tutorialLogic — replayQueue ─────────────────────────────────────────

describe('replayQueue', () => {
    it('returns ["stats"] when playerName is a non-empty string', () => {
        expect(replayQueue({ playerName: 'Dante' })).toEqual(['stats'])
    })

    it('returns [] when playerName is empty string', () => {
        expect(replayQueue({ playerName: '' })).toEqual([])
    })

    it('returns [] when playerName is null', () => {
        expect(replayQueue({ playerName: null })).toEqual([])
    })

    it('returns [] when playerName is undefined', () => {
        expect(replayQueue({ playerName: undefined })).toEqual([])
    })
})

// ─── 6. tutorialLogic — markIntroDone ───────────────────────────────────────

describe('markIntroDone', () => {
    it('sets intro and choices to true, preserves other keys', () => {
        const seen = { intro: false, choices: false, stats: false }
        const result = markIntroDone(seen)
        expect(result.intro).toBe(true)
        expect(result.choices).toBe(true)
        expect(result.stats).toBe(false)
    })

    it('does not mutate the original object', () => {
        const seen = { intro: false, choices: false, stats: false }
        markIntroDone(seen)
        expect(seen.intro).toBe(false)
    })
})

// ─── 7. tutorialLogic — resetSeen ───────────────────────────────────────────

describe('resetSeen', () => {
    it('returns all flags false', () => {
        expect(resetSeen()).toEqual({ intro: false, choices: false, stats: false })
    })
})
