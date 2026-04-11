import { describe, it, expect } from 'vitest'
import { Story } from 'inkjs'
import storyData from '../stories/centinelas.json'

describe('DEBUG: inkjs Continue() behavior at keymash_arrastre', () => {
    it('traces Continue() calls from last #next to minigame', () => {
        const story = new Story(storyData)

        // Navigate to final_morgue_escape
        story.ChoosePathString('final_morgue_escape', true)

        // Process through # next tags until we reach the conditional
        let step = 0
        while (story.canContinue) {
            step++
            const text = story.Continue()
            const tags = story.currentTags || []

            console.log(`\n=== Continue() #${step} ===`)
            console.log(`Text: "${text?.substring(0, 80)}..."`)
            console.log(`Tags: [${tags.join(', ')}]`)
            console.log(`canContinue: ${story.canContinue}`)
            console.log(`choices: ${story.currentChoices.length}`)

            // Check for MINIGAME tag
            if (tags.some(t => t.trim().toLowerCase().startsWith('minigame:'))) {
                console.log('>>> MINIGAME TAG FOUND! <<<')
            }

            // Break on pagination (# next) to simulate user clicking SIGUIENTE
            if (tags.some(t => {
                const tag = t.trim().toLowerCase()
                return tag === 'next' || tag.startsWith('next:')
            })) {
                console.log('>>> PAGINATION BREAK - simulating SIGUIENTE click <<<')
                continue // Continue to next iteration (simulating immediate SIGUIENTE)
            }

            // Break on choices
            if (story.currentChoices.length > 0) {
                console.log('>>> CHOICES - selecting first <<<')
                story.ChooseChoiceIndex(0)
            }

            // Stop if we hit minigame or end
            if (tags.some(t => t.trim().toLowerCase().startsWith('minigame:')) || !story.canContinue) {
                console.log(`\n=== STOPPED at step ${step} ===`)
                console.log(`Final canContinue: ${story.canContinue}`)
                console.log(`Final choices: ${story.currentChoices.length}`)
                break
            }
        }
    })

    it('traces what happens when processStoryLoop would run from last pagination', () => {
        const story = new Story(storyData)
        story.ChoosePathString('final_morgue_escape', true)

        // Fast-forward through pagination breaks (simulate user clicking SIGUIENTE)
        let lastPaginationState = null
        let paginationCount = 0

        while (story.canContinue) {
            const stateBeforeContinue = story.state.toJson()
            const text = story.Continue()
            const tags = story.currentTags || []

            if (tags.some(t => {
                const tag = t.trim().toLowerCase()
                return tag === 'next' || tag.startsWith('next:')
            })) {
                lastPaginationState = stateBeforeContinue
                paginationCount++
                console.log(`\nPagination #${paginationCount}: "${text?.substring(0, 60)}..."`)
            }

            if (story.currentChoices.length > 0) {
                // Pick first choice (flee)
                story.ChooseChoiceIndex(0)
            }

            if (tags.some(t => t.trim().toLowerCase().startsWith('minigame:'))) {
                break
            }
        }

        console.log(`\nTotal paginations before minigame: ${paginationCount}`)
        console.log(`Have lastPaginationState: ${!!lastPaginationState}`)

        // Now simulate CONTINUAR: restore to last pagination state
        if (lastPaginationState) {
            story.state.LoadJson(lastPaginationState)
            console.log(`\n=== RESTORED to last pagination state ===`)
            console.log(`canContinue: ${story.canContinue}`)
            console.log(`minigame_result: ${story.variablesState['minigame_result']}`)

            // Now simulate processStoryLoop from this position
            console.log(`\n=== Simulating processStoryLoop ===`)
            let loopStep = 0
            let allText = ''
            let allTags = []

            while (story.canContinue) {
                loopStep++
                const text = story.Continue()
                const tags = story.currentTags || []

                allText += text + '\n\n'
                allTags.push(...tags)

                console.log(`\nLoop iteration #${loopStep}:`)
                console.log(`  Text: "${text?.substring(0, 80)}"`)
                console.log(`  Tags: [${tags.join(', ')}]`)
                console.log(`  canContinue: ${story.canContinue}`)

                const hasMinigame = tags.some(t => t.trim().toLowerCase().startsWith('minigame:'))
                if (hasMinigame) {
                    console.log('  >>> MINIGAME TAG FOUND - would break here <<<')
                    break
                }

                const hasPagination = tags.some(t => {
                    const tag = t.trim().toLowerCase()
                    return tag === 'next' || tag.startsWith('next:')
                })
                if (hasPagination) {
                    console.log('  >>> PAGINATION - would break here <<<')
                    break
                }
            }

            console.log(`\n=== Summary ===`)
            console.log(`Loop iterations: ${loopStep}`)
            console.log(`All tags: [${allTags.join(', ')}]`)
            console.log(`Has MINIGAME tag: ${allTags.some(t => t.trim().toLowerCase().startsWith('minigame:'))}`)
            console.log(`Full text length: ${allText.trim().length}`)
            console.log(`Text preview: "${allText.trim().substring(0, 200)}"`)
        }
    })
})
