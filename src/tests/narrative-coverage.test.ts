import { describe, it, expect } from 'vitest'
import { Story } from 'inkjs'
import fs from 'fs'
import path from 'path'

// Helper to load JSON story data
const loadStory = (filename: any) => {
    const filePath = path.resolve(__dirname, '../../src/stories', filename)
    let content = fs.readFileSync(filePath, 'utf-8')
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1)
    }
    return JSON.parse(content)
}

describe('Narrative Coverage', () => {
    // List of stories to test
    const stories = [
        'centinelas.json',
        'partuza.json',
        'serruchin.json',
        'toybox.json'
        // 'apnea.json' - excluded if it has complex logic requiring specific variable states
    ]

    stories.forEach(storyFile => {
        it(`should traverse ${storyFile} without errors`, () => {
            const storyData = loadStory(storyFile)
            const story = new Story(storyData)

            // Basic traversal: check if we can start and make some choices
            // A full graph traversal is complex (state explosion), here we do a random walk
            // or a limited depth traversal to catch basic runtime errors.

            // Limit iterations to prevent infinite loops
            let steps = 0
            const MAX_STEPS = 1000

            while (story.canContinue || story.currentChoices.length > 0) {
                if (steps++ > MAX_STEPS) break

                if (story.canContinue) {
                    story.Continue()
                } else if (story.currentChoices.length > 0) {
                    // Always pick the first choice for a deterministic "happy path" walk
                    // Ideally, we'd recursively test all choices, but Ink state is mutable and cloning is heavy.
                    story.ChooseChoiceIndex(0)
                }
            }

            // If we reached here without throwing, it's a pass for the "happy path"
            expect(true).toBe(true)
        })
    })
})
