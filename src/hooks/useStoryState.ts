import { useState, useCallback, useRef, useMemo } from 'react'
import { Story } from 'inkjs'

export interface StoryHistoryEntry {
    text: string;
    timestamp: number;
    tags?: string[];
    type?: 'text' | 'choice';
}

export interface UseStoryStateReturn {
    story: Story | null;
    text: string;
    choices: any[];
    canContinue: boolean;
    isEnded: boolean;
    history: StoryHistoryEntry[];
    currentTags: string[];
    initStory: (data: any, savedState?: any, savedText?: string) => void;
    continueStory: () => { text: string; tags: string[] };
    makeChoice: (index: number) => { text: string; tags: string[] };
    setGlobalVariable: (varName: string, value: any) => void;
    getGlobalVariable: (varName: string) => any;
    resetStoryState: () => void;
}

export function useStoryState(): UseStoryStateReturn {
    const [story, setStory] = useState<Story | null>(null)
    const [text, setText] = useState('')
    const [choices, setChoices] = useState<any[]>([])
    const [canContinue, setCanContinue] = useState(false)
    const [isEnded, setIsEnded] = useState(false)
    const [history, setHistory] = useState<StoryHistoryEntry[]>([])
    const [currentTags, setCurrentTags] = useState<string[]>([])

    const storyRef = useRef<Story | null>(null)

    // Helper to process story continuation until a stop condition
    const processStoryLoop = useCallback((currentStory: Story) => {
        let fullText = ""
        const allTags: string[] = []

        while (currentStory.canContinue) {
            const nextBatch = currentStory.Continue()
            const tags = currentStory.currentTags || []

            fullText += nextBatch + '\n\n'
            allTags.push(...tags)

            // Break for pagination
            if (tags.some((t: string) => {
                const tag = t.trim().toLowerCase()
                return tag === 'next' || tag === 'page'
            })) break

            // Break for minigame - Orchestrator handles the actual game start, but we must pause text generation
            if (tags.some((t: string) => t.trim().toLowerCase().startsWith('minigame:'))) break
        }

        const trimmedText = fullText.trim()

        // Update state
        setText(trimmedText)
        setChoices(currentStory.currentChoices)
        setCanContinue(currentStory.canContinue)
        setIsEnded(!currentStory.canContinue && currentStory.currentChoices.length === 0)
        setCurrentTags(allTags)

        // Add to history if there is text
        if (trimmedText) {
            setHistory(prev => [...prev, {
                text: trimmedText,
                timestamp: Date.now(),
                tags: allTags,
                type: 'text'
            }])
        }

        return { text: trimmedText, tags: allTags }
    }, [])

    const continueStory = useCallback(() => {
        const currentStory = storyRef.current
        if (!currentStory) return { text: '', tags: [] }

        return processStoryLoop(currentStory)
    }, [processStoryLoop])

    const makeChoice = useCallback((index: number) => {
        const currentStory = storyRef.current
        if (!currentStory) return { text: '', tags: [] }

        const choice = currentStory.currentChoices[index]
        const choiceText = choice ? choice.text : ''

        currentStory.ChooseChoiceIndex(index)

        // Record choice in history
        if (choiceText) {
            setHistory(prev => [...prev, {
                text: `> ${choiceText}`,
                timestamp: Date.now(),
                type: 'choice'
            }])
        }

        return processStoryLoop(currentStory)
    }, [processStoryLoop])

    const initStory = useCallback((data: any, savedState: any = null, savedText: string = '') => {
        const newStory = new Story(data)

        if (savedState) {
            newStory.state.LoadJson(savedState)
        }

        setStory(newStory)
        storyRef.current = newStory
        setHistory([]) // Clear history on new init

        if (savedText) {
            // Restore visual state
            setText(savedText)
            setChoices(newStory.currentChoices)
            setCanContinue(newStory.canContinue)
            setIsEnded(!newStory.canContinue && newStory.currentChoices.length === 0)
            setHistory([{ text: savedText, timestamp: Date.now(), tags: [], type: 'text' }])
        } else {
            // Initial continue if starting fresh
            setIsEnded(false)
        }
    }, [])

    const setGlobalVariable = useCallback((varName: string, value: any) => {
        if (storyRef.current) {
            try {
                storyRef.current.variablesState[varName] = value
            } catch (e) {
                console.warn(`[StoryState] Could not set variable ${varName}:`, e)
            }
        }
    }, [])

    const getGlobalVariable = useCallback((varName: string) => {
        if (storyRef.current) {
            try {
                return storyRef.current.variablesState[varName]
            } catch (e) {
                console.warn(`[StoryState] Could not get variable ${varName}:`, e)
                return null
            }
        }
        return null
    }, [])

    const resetStoryState = useCallback(() => {
        setStory(null)
        storyRef.current = null
        setText('')
        setChoices([])
        setCanContinue(false)
        setIsEnded(false)
        setHistory([])
        setCurrentTags([])
    }, [])

    return useMemo(() => ({
        story,
        text,
        choices,
        canContinue,
        isEnded,
        history,
        currentTags,
        initStory,
        continueStory,
        makeChoice,
        setGlobalVariable,
        getGlobalVariable,
        resetStoryState
    }), [
        story,
        text,
        choices,
        canContinue,
        isEnded,
        history,
        currentTags,
        initStory,
        continueStory,
        makeChoice,
        setGlobalVariable,
        getGlobalVariable,
        resetStoryState
    ])
}
