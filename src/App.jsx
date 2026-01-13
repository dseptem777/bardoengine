import { useState, useCallback, useEffect } from 'react'
import { Story } from 'inkjs'
import Player from './components/Player'
import StorySelector from './components/StorySelector'
import VFXLayer from './components/VFXLayer'
import { useVFX } from './hooks/useVFX'
import { useSaveSystem } from './hooks/useSaveSystem'

// Import the compiled story
import partuzaStory from './stories/partuza.json'

const AVAILABLE_STORIES = [
    { id: 'partuza', title: 'Tu nombre en clave es Partuza', data: partuzaStory }
]

function App() {
    const [story, setStory] = useState(null)
    const [storyId, setStoryId] = useState(null)
    const [text, setText] = useState('')
    const [choices, setChoices] = useState([])
    const [canContinue, setCanContinue] = useState(false)
    const [isEnded, setIsEnded] = useState(false)

    const { vfxState, triggerVFX, clearVFX } = useVFX()
    const { saveGame, loadGame, clearSave, hasSave } = useSaveSystem()

    // Initialize story
    const initStory = useCallback((storyData, id, savedState = null, savedText = '') => {
        const newStory = new Story(storyData)

        if (savedState) {
            newStory.state.LoadJson(savedState)
        }

        setStory(newStory)
        setStoryId(id)

        // If we have saved text, restore it along with choices
        // (the useEffect won't run since text won't be empty)
        if (savedText) {
            setText(savedText)
            setChoices(newStory.currentChoices)
            setCanContinue(newStory.canContinue)
            // Detect if we're at an ending (no choices and can't continue)
            setIsEnded(!newStory.canContinue && newStory.currentChoices.length === 0)
        } else {
            setIsEnded(false)
        }
    }, [])

    // Continue story
    const continueStory = useCallback(() => {
        if (!story) return

        let fullText = ''
        let allTags = []

        while (story.canContinue) {
            fullText += story.Continue()
            allTags = [...allTags, ...story.currentTags]
        }

        setText(fullText.trim())
        setChoices(story.currentChoices)
        setCanContinue(story.canContinue)
        setIsEnded(!story.canContinue && story.currentChoices.length === 0)

        // Trigger VFX from tags
        allTags.forEach(tag => triggerVFX(tag))

        // Auto-save with current text
        if (storyId) {
            saveGame(storyId, story.state.toJson(), fullText.trim())
        }
    }, [story, storyId, triggerVFX, saveGame])

    // Make choice
    const makeChoice = useCallback((index) => {
        if (!story) return
        clearVFX()
        story.ChooseChoiceIndex(index)
        continueStory()
    }, [story, continueStory, clearVFX])

    // Start new game
    const startGame = useCallback((storyInfo) => {
        const saveData = loadGame(storyInfo.id)
        if (saveData) {
            initStory(storyInfo.data, storyInfo.id, saveData.state, saveData.text)
        } else {
            initStory(storyInfo.data, storyInfo.id)
        }
    }, [initStory, loadGame])

    // Restart
    const restart = useCallback(() => {
        if (storyId) {
            clearSave(storyId)
            clearVFX()
            setText('') // Clear text so useEffect triggers continueStory
            setChoices([])
            setIsEnded(false)
            const storyInfo = AVAILABLE_STORIES.find(s => s.id === storyId)
            if (storyInfo) {
                initStory(storyInfo.data, storyInfo.id)
            }
        }
    }, [storyId, clearSave, clearVFX, initStory])

    // Back to menu
    const backToMenu = useCallback(() => {
        setStory(null)
        setStoryId(null)
        setText('')
        setChoices([])
        clearVFX()
    }, [clearVFX])

    // Continue story when initialized or after restart
    useEffect(() => {
        if (story && !text) {
            // If we can't continue, we're at a decision point - just load the current choices
            // The text was already restored from saved data in initStory
            if (!story.canContinue && story.currentChoices.length > 0) {
                setChoices(story.currentChoices)
                setCanContinue(false)
                setIsEnded(false)
                return
            }

            // Directly continue story here to avoid closure issues
            let fullText = ''
            let allTags = []

            while (story.canContinue) {
                fullText += story.Continue()
                allTags = [...allTags, ...story.currentTags]
            }

            setText(fullText.trim())
            setChoices(story.currentChoices)
            setCanContinue(story.canContinue)
            setIsEnded(!story.canContinue && story.currentChoices.length === 0)

            // Trigger VFX from tags
            allTags.forEach(tag => triggerVFX(tag))

            // Auto-save with current text
            if (storyId) {
                saveGame(storyId, story.state.toJson(), fullText.trim())
            }
        }
    }, [story, text, storyId, triggerVFX, saveGame])

    return (
        <div className="min-h-screen bg-bardo-bg relative overflow-hidden">
            <VFXLayer vfxState={vfxState} />

            {!story ? (
                <StorySelector
                    stories={AVAILABLE_STORIES}
                    onSelect={startGame}
                    hasSave={hasSave}
                />
            ) : (
                <Player
                    text={text}
                    choices={choices}
                    isEnded={isEnded}
                    onChoice={makeChoice}
                    onRestart={restart}
                    onBack={backToMenu}
                />
            )}
        </div>
    )
}

export default App
