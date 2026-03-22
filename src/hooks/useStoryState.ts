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
    restoreMinigameState: () => boolean;
    resetStoryState: () => void;
    spawnAtKnot: (knotName: string, variables?: Record<string, any>) => { text: string; tags: string[] };
    getKnotList: () => string[];
    getVariables: () => Record<string, any>;
}

export function useStoryState(): UseStoryStateReturn {
    const [story, setStory] = useState<Story | null>(null)
    const [text, setText] = useState('')
    const [choices, setChoices] = useState<any[]>([])
    const [canContinue, setCanContinue] = useState(false)
    const [continueLabel, setContinueLabel] = useState<string | null>(null)
    const [isEnded, setIsEnded] = useState(false)
    const [history, setHistory] = useState<StoryHistoryEntry[]>([])
    const [currentTags, setCurrentTags] = useState<string[]>([])

    const storyRef = useRef<Story | null>(null)
    // Snapshot of Ink state from just before the Continue() that produced a MINIGAME tag.
    // inkjs follows diverts and evaluates conditionals inside a single Continue() call,
    // so by the time we detect the MINIGAME tag, Ink has already branched on minigame_result
    // (which is -1 at that point). Restoring this snapshot after the game lets the conditional
    // re-evaluate with the correct result.
    const minigameStateSnapshotRef = useRef<string | null>(null)

    // Helper to process story continuation until a stop condition
    const processStoryLoop = useCallback((currentStory: Story) => {
        let fullText = ""
        let hasCriticalError = false
        const allTags: string[] = []
        setContinueLabel(null)

        try {
            while (currentStory.canContinue) {
                // Save state BEFORE Continue() — needed for minigame result fix
                const preState = currentStory.state.toJson()

                const nextBatch = currentStory.Continue()
                const tags = currentStory.currentTags || []

                fullText += nextBatch + '\n\n'
                allTags.push(...tags)

                // Break for pagination (supports optional label: # next: Open the door)
                const paginationTag = tags.find((t: string) => {
                    const tag = t.trim().toLowerCase()
                    return tag === 'next' || tag === 'page' || tag.startsWith('next:') || tag.startsWith('page:')
                })
                if (paginationTag) {
                    const colonIdx = paginationTag.indexOf(':')
                    const label = colonIdx !== -1 ? paginationTag.substring(colonIdx + 1).trim() : null
                    setContinueLabel(label || null)
                    break
                }

                // Break for minigame — save the pre-Continue snapshot so handleMinigameResult
                // can restore it and let the conditional re-evaluate with the correct result
                if (tags.some((t: string) => t.trim().toLowerCase().startsWith('minigame:'))) {
                    minigameStateSnapshotRef.current = preState
                    break
                }
            }
        } catch (e) {
            console.error("[StoryState] Ink Runtime Error during processing:", e)
            fullText += "\n\n[Error: La historia encontró un error crítico.]"
            hasCriticalError = true
        }

        const trimmedText = fullText.trim()

        console.log(`[StoryState] processed loop. Text len: ${trimmedText.length}. Choices: ${currentStory.currentChoices.length}. CanContinue: ${currentStory.canContinue}`)

        // Update state
        setText(trimmedText)
        setChoices(hasCriticalError ? [] : [...currentStory.currentChoices])
        setCanContinue(hasCriticalError ? false : currentStory.canContinue)
        setIsEnded(hasCriticalError || (!currentStory.canContinue && currentStory.currentChoices.length === 0))
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
        if (!currentStory) {
            console.error("[StoryState] makeChoice called but story is null")
            return { text: '', tags: [] }
        }

        // Defensive check: Is the index valid?
        if (!currentStory.currentChoices || index >= currentStory.currentChoices.length) {
            console.warn(`[StoryState] DESYNC DETECTED! UI requested choice ${index}, but Engine has ${currentStory.currentChoices?.length || 0} choices. Resyncing UI.`)

            // Force UI resync
            setChoices([...(currentStory.currentChoices || [])])
            setCanContinue(currentStory.canContinue)
            return { text: '', tags: [] }
        }

        // Capture choice text for history BEFORE choosing (because Ink clears currentChoices after choosing)
        let choiceText = ""
        try {
            const choice = currentStory.currentChoices[index]
            choiceText = choice ? choice.text : ""
        } catch (e) {
            console.warn("[StoryState] Could not retrieve choice text for history")
        }

        try {
            currentStory.ChooseChoiceIndex(index)
        } catch (e) {
            console.error("[StoryState] Ink 'ChooseChoiceIndex' failed:", e)
            return { text: '', tags: [] }
        }

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

    // Restore Ink state to just before the Continue() that produced the MINIGAME tag.
    // This lets the conditional (e.g. { minigame_result: - 1: -> exito }) re-evaluate
    // with the correct value instead of the stale -1 from the initial Continue().
    const restoreMinigameState = useCallback(() => {
        const snapshot = minigameStateSnapshotRef.current
        if (!snapshot || !storyRef.current) return false
        try {
            storyRef.current.state.LoadJson(snapshot)
            minigameStateSnapshotRef.current = null
            return true
        } catch (e) {
            console.warn('[StoryState] Failed to restore minigame state snapshot:', e)
            return false
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

    const spawnAtKnot = useCallback((knotName: string, variables: Record<string, any> = {}) => {
        const s = storyRef.current
        if (!s) return { text: '', tags: [] }

        for (const [key, val] of Object.entries(variables)) {
            try {
                s.variablesState[key] = val
            } catch (e) {
                console.warn(`[DebugSpawn] Could not set variable ${key}:`, e)
            }
        }

        s.ChoosePathString(knotName, true)
        return processStoryLoop(s)
    }, [processStoryLoop])

    const getKnotList = useCallback((): string[] => {
        const s = storyRef.current
        if (!s) return []

        const knots: string[] = []
        const named = s.mainContentContainer?.namedContent
        if (named) {
            for (const [name] of named) {
                knots.push(name)
            }
        }
        return knots.sort()
    }, [])

    const getVariables = useCallback((): Record<string, any> => {
        const s = storyRef.current
        if (!s) return {}

        const vars: Record<string, any> = {}
        const globals = (s.variablesState as any)?._globalVariables
        if (globals) {
            for (const [key, val] of globals) {
                vars[key] = (val as any)?.value !== undefined ? (val as any).value : val
            }
        }
        return vars
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
        continueLabel,
        isEnded,
        history,
        currentTags,
        initStory,
        continueStory,
        makeChoice,
        setGlobalVariable,
        getGlobalVariable,
        restoreMinigameState,
        resetStoryState,
        spawnAtKnot,
        getKnotList,
        getVariables
    }), [
        story,
        text,
        choices,
        canContinue,
        continueLabel,
        isEnded,
        history,
        currentTags,
        initStory,
        continueStory,
        makeChoice,
        setGlobalVariable,
        getGlobalVariable,
        restoreMinigameState,
        resetStoryState,
        spawnAtKnot,
        getKnotList,
        getVariables
    ])
}
