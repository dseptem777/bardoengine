import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { useVFX } from './useVFX'
import { useAudio } from './useAudio'
import { useSaveSystem } from './useSaveSystem'
import { useGameSystems } from './useGameSystems'
import { useAchievements } from './useAchievements'
import { useMinigameController } from './useMinigameController'
import { useThemeManager } from './useThemeManager'
import { useTagProcessor } from './useTagProcessor'
import { useStoryState } from './useStoryState'
import { useWillpowerSystem } from './useWillpowerSystem'
import { useSpiderInfestation } from './useSpiderInfestation'
import { useScrollFriction } from './useScrollFriction'
import { useBossController } from './useBossController'
import { useVisualDamage } from './useVisualDamage'

interface BardoEngineOptions {
    storyId: string;
    storyData: any;
    settings: any;
    getTypewriterDelay: () => number;
    getMusicVolume: () => number;
    getSfxVolume: () => number;
}

export interface InputRequest {
    varName: string;
    placeholder: string;
}

/**
 * useBardoEngine - Central orchestrator hook for the BardoEngine
 *
 * Consolidates all story logic, state management, and subsystem coordination.
 * Refactored to delegate state management to useStoryState.
 */
export function useBardoEngine({
    storyId,
    storyData,
    settings,
    getTypewriterDelay,
    getMusicVolume,
    getSfxVolume
}: BardoEngineOptions) {
    // ==================
    // Story State Delegate
    // ==================
    const storyState = useStoryState()
    const {
        story,
        text,
        choices,
        canContinue,
        continueLabel,
        isEnded,
        history,
        initStory: initStoryState,
        continueStory: continueStoryState,
        makeChoice: makeChoiceState,
        setGlobalVariable,
        getGlobalVariable,
        restoreMinigameState,
        restoreInputState,
        resetStoryState,
        spawnAtKnot: rawSpawnAtKnot,
        getKnotList,
        getVariables
    } = storyState

    // ==================
    // Input System
    // ==================
    const [pendingInput, setPendingInput] = useState<InputRequest | null>(null)
    // Flag to skip handleInputRequest during commitInput replay
    const inputReplayingRef = useRef(false)

    const handleInputRequest = useCallback((varName: string, placeholder: string) => {
        if (inputReplayingRef.current) return  // skip during replay
        setPendingInput({ varName, placeholder })
    }, [])

    const commitInput = useCallback((value: string) => {
        if (!pendingInput) return

        // Restore Ink state to before the Continue() that consumed the input tag.
        // Then set the variable so Continue() replays with the correct value
        // (e.g. "Bienvenido {nombre}" renders correctly instead of empty).
        inputReplayingRef.current = true
        restoreInputState()
        setGlobalVariable(pendingInput.varName, value)
        setPendingInput(null)

        // Resume story — Continue() replays and now evaluates the variable correctly
        if (continueStoryRef.current) {
            continueStoryRef.current()
        }
        inputReplayingRef.current = false
    }, [pendingInput, setGlobalVariable, restoreInputState])

    // ==================
    // Chapter Break System
    // ==================
    const [chapterBreak, setChapterBreak] = useState<{
        title: string;
        subtitle?: string;
        image?: string;
        _key: number;
    } | null>(null)
    // Cooldown after chapter break dismiss — keeps keyboard nav disabled
    // so spamming spacebar doesn't skip through post-break content
    const [chapterBreakCooldown, setChapterBreakCooldown] = useState(false)

    // Scroll container ref (shared with Player for scroll manipulation)
    const scrollContainerRef = useRef<HTMLElement | null>(null)

    // ==================
    // Sub-systems
    // ==================

    // Audio system
    const audio = useAudio({
        sfxVolume: getSfxVolume(),
        musicVolume: getMusicVolume(),
    })
    const { playSfx, playMusic, stopMusic, stopAll: stopAllAudio } = audio

    // Chapter Break handlers (after audio init)
    // Counter to track break identity — used to detect if continueStory triggered a new break
    const chapterBreakCountRef = useRef(0)
    // True when CHAPTER_BREAK arrived in the same processStoryLoop batch as text content.
    // On dismiss, skip continueStory — the text is already loaded behind the overlay.
    const chapterBreakHasTextRef = useRef(false)

    const handleChapterBreak = useCallback((config: { title: string, subtitle?: string, image?: string, music?: string }) => {
        const resolvedImage = config.image
            ? (config.image.startsWith('/') || config.image.startsWith('http')
                ? config.image
                : `/games/${storyId}/${config.image}`)
            : undefined

        if (config.music) {
            playMusic(config.music)
        }

        chapterBreakCountRef.current += 1
        setChapterBreak({
            title: config.title,
            subtitle: config.subtitle,
            image: resolvedImage,
            _key: chapterBreakCountRef.current,
        })
    }, [storyId, playMusic])

    const dismissChapterBreak = useCallback(() => {
        setChapterBreakCooldown(true)
        const countAtDismiss = chapterBreakCountRef.current

        if (chapterBreakHasTextRef.current) {
            // Text is already loaded behind the overlay (same batch as CHAPTER_BREAK).
            // Just remove the overlay — player will see the text that's already set.
            setChapterBreak(null)
            setTimeout(() => setChapterBreakCooldown(false), 400)
        } else {
            // No text behind overlay (deferred break) — advance the story.
            if (continueStoryRef.current) continueStoryRef.current()
            if (chapterBreakCountRef.current !== countAtDismiss) {
                // continueStory triggered another break — overlay re-mounts with new _key.
                setTimeout(() => setChapterBreakCooldown(false), 400)
            } else {
                setChapterBreak(null)
                setTimeout(() => setChapterBreakCooldown(false), 400)
            }
        }
    }, [])

    // VFX system
    const vfx = useVFX(
        { playSfx, playMusic, stopMusic },
        settings.vfxEnabled
    )
    const { vfxState, triggerVFX, clearVFX } = vfx

    // Save system
    const saveSystem = useSaveSystem(storyId)

    // Game systems (stats + inventory)
    const gameSystems = useGameSystems(storyId)

    // Achievements system
    // @ts-ignore
    const achievementDefs = useMemo(() => gameSystems.config?.achievements || [], [gameSystems.config])
    const achievementsSystem = useAchievements(storyId, achievementDefs)

    // Extras config
    // @ts-ignore
    const extrasConfig = useMemo(() => gameSystems.config?.extras || {}, [gameSystems.config])
    const hasExtras = achievementDefs.length > 0 ||
        (extrasConfig.gallery?.length > 0) ||
        (extrasConfig.jukebox?.length > 0)

    // ==================
    // Theme Injection
    // ==================
    const isThemeReady = useThemeManager(gameSystems.config, storyId, gameSystems.configLoaded)

    // ==================
    // Minigame Controller
    // ==================

    // Ref to break circular dependency
    const continueStoryRef = useRef<(() => void) | null>(null)

    // Deferred CHAPTER_BREAK tags — when a pagination tag (# next) and CHAPTER_BREAK
    // co-occur in the same Continue() batch, we defer the break to the next continueStory() call
    // so the player can read the current text first.
    const pendingChapterBreakTagsRef = useRef<string[]>([])

    // Result commit handler
    const handleMinigameResult = useCallback((result: boolean | number) => {
        if (!storyRef.current) return

        const numericResult = (result === true || result === 1) ? 1 : 0
        console.log(`[Ink Bridge] Committing result: ${numericResult}`)

        // Restore Ink state to before the Continue() that produced the MINIGAME tag.
        // inkjs evaluates diverts and conditionals inside a single Continue() call,
        // so by the time we detect the tag, Ink has already branched on minigame_result=-1.
        // Restoring the snapshot lets the conditional re-evaluate with the correct value.
        const restored = restoreMinigameState()

        setGlobalVariable("minigame_result", numericResult)
        const verified = getGlobalVariable("minigame_result")
        console.log(`[Ink Bridge] Verified value in Ink: ${verified}`)

        if (restored && storyRef.current) {
            // Advance past the MINIGAME tag line so continueStory() doesn't re-trigger it.
            // This single Continue() re-processes the knot (now with the correct result),
            // following the divert and conditional into the right branch.
            storyRef.current.Continue()
        }

        // Auto-continue after minigame
        if (continueStoryRef.current) {
            continueStoryRef.current()
        }
    }, [setGlobalVariable, getGlobalVariable, restoreMinigameState])

    const minigameController = useMinigameController(handleMinigameResult)

    // ==================
    // Parallel Willpower System
    // ==================
    const onWillpowerCheckCallback = useCallback((passed: boolean) => {
        console.log(`[WillpowerSystem] Check result: ${passed}`)
    }, [])

    const [willpowerState, willpowerActions] = useWillpowerSystem(onWillpowerCheckCallback)

    // ==================
    // Genjutsu Vampírico (Illusion Break System)
    // ==================
    const [genjutsuBreak, setGenjutsuBreak] = useState<{
        stat: string
        text: string
        targetKnot: string
    } | null>(null)
    const genjutsuActive = genjutsuBreak !== null
    const genjutsuBreakRef = useRef(genjutsuBreak)
    genjutsuBreakRef.current = genjutsuBreak

    // Typing-ready gate: auto-surrender only fires after fisura paragraph finishes typing
    const [genjutsuTextReady, setGenjutsuTextReady] = useState(false)
    const genjutsuFrozenDecayRateRef = useRef<string>('normal')
    const genjutsuFrozenTargetKeyRef = useRef<string>('V')
    const genjutsuReactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const GENJUTSU_REACTION_MS = 2000

    const handleWillpowerStart = useCallback((config: { decayRate?: string, targetKey?: string, initialValue?: number }) => {
        willpowerActions.startWillpower({
            decayRate: config.decayRate || 'normal',
            targetKey: config.targetKey || 'V',
            value: config.initialValue ?? 100
        })
    }, [willpowerActions])

    const handleWillpowerStop = useCallback(() => {
        willpowerActions.stopWillpower()
        setGenjutsuBreak(null)
        setGenjutsuTextReady(false)
        if (genjutsuReactionTimerRef.current) {
            clearTimeout(genjutsuReactionTimerRef.current)
            genjutsuReactionTimerRef.current = null
        }
    }, [willpowerActions])

    const handleWillpowerCheck = useCallback((threshold: number): boolean => {
        return willpowerActions.checkWillpower(threshold)
    }, [willpowerActions])

    const willpowerValueRef = useRef(willpowerState.value)
    willpowerValueRef.current = willpowerState.value
    const getWillpowerValue = useCallback((): number => {
        return willpowerValueRef.current
    }, [])

    // ==================
    // Spider Infestation System (Non-blocking)
    // ==================

    const spiderInfestation = useSpiderInfestation()

    const handleSpiderStart = useCallback((config: any) => {
        spiderInfestation.actions.startInfestation(config)
    }, [spiderInfestation.actions])

    const handleSpiderStop = useCallback(() => {
        spiderInfestation.actions.stopInfestation()
    }, [spiderInfestation.actions])

    const handleSpiderCheck = useCallback((threshold: number) => {
        // threshold = % clean text required (0-100)
        const survived = spiderInfestation.actions.checkCorruption(threshold)
        // Set variable in Ink
        if (storyRef?.current) {
            try {
                storyRef.current.variablesState['spider_survived'] = survived
                console.log(`[Spider] Set spider_survived = ${survived}`)
            } catch (e) {
                console.warn('[Spider] Could not set spider_survived:', e)
            }
        }
        // Auto-select gate choice 0 after brief delay (Ink timing fix)
        const tid = setTimeout(() => {
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 2000)
        pendingTimersRef.current.push(tid)
    }, [spiderInfestation.actions])

    const handleSpiderDifficulty = useCallback((difficulty: string) => {
        spiderInfestation.actions.changeDifficulty(difficulty)
    }, [spiderInfestation.actions])

    // ==================
    // Scroll Friction System (Arrebatados)
    // ==================
    const [arrebatadosCount, setArrebatadosCount] = useState(0)
    const [arrebatadosEnabled, setArrebatadosEnabled] = useState(false)
    const [arrebatadosFuerza, setArrebatadosFuerza] = useState(10)

    const scrollFriction = useScrollFriction({
        scrollContainerRef,
        enabled: arrebatadosEnabled,
        arrebatadosCount,
        fuerza: arrebatadosFuerza,
    })

    const handleArrebatadosStart = useCallback((config: { count: number, fuerza: number }) => {
        setArrebatadosEnabled(true)
        setArrebatadosCount(config.count)
        setArrebatadosFuerza(config.fuerza)
    }, [])

    const handleArrebatadosAdd = useCallback((count: number) => {
        setArrebatadosCount(prev => prev + count)
    }, [])

    const handleArrebatadosStop = useCallback(() => {
        setArrebatadosEnabled(false)
        setArrebatadosCount(0)
    }, [])

    // Build snapshot of all active parallel systems for save data
    const buildParallelSystemsSaveState = useCallback(() => {
        const spider = spiderInfestation.actions.getSaveState()
        const willpower = willpowerState.active ? {
            value: willpowerState.value,
            decayRate: willpowerState.decayRate,
            targetKey: willpowerState.targetKey,
        } : null
        const arrebatados = arrebatadosEnabled ? {
            count: arrebatadosCount,
            fuerza: arrebatadosFuerza,
        } : null
        const genjutsu = genjutsuBreak ? {
            stat: genjutsuBreak.stat,
            text: genjutsuBreak.text,
            targetKnot: genjutsuBreak.targetKnot,
        } : null

        if (!spider && !willpower && !arrebatados && !genjutsu) return null
        return { spider, willpower, arrebatados, genjutsu }
    }, [spiderInfestation.actions, willpowerState, arrebatadosEnabled, arrebatadosCount, arrebatadosFuerza, genjutsuBreak])

    // ==================
    // Boss Controller System
    // ==================
    const bossController = useBossController()

    const handleBossStart = useCallback((config: { name: string; hp: number }) => {
        bossController.actions.startBoss(config)
    }, [bossController.actions])

    const handleBossPhase = useCallback((phase: number) => {
        bossController.actions.setPhase(phase)
    }, [bossController.actions])

    const handleBossDamage = useCallback((amount: number) => {
        bossController.actions.damage(amount)
    }, [bossController.actions])

    const handleBossCheck = useCallback((): boolean => {
        return bossController.actions.checkBoss()
    }, [bossController.actions])

    const handleBossStop = useCallback(() => {
        bossController.actions.stopBoss()
    }, [bossController.actions])

    // Boss phase completion — damages boss and auto-selects gate choice,
    // then flags for transition gate auto-advance
    const handleBossPhaseComplete = useCallback((damage: number) => {
        bossController.actions.damage(damage)
        // Check if boss is now defeated and set Ink variable BEFORE story continues
        // (Ink conditionals evaluate during continuation, before tags are processed)
        const defeated = bossController.actions.checkBoss()
        if (defeated) {
            setGlobalVariable('boss_defeated', true)
        }
        // Flag: after this gate choice, auto-advance the transition gate too
        bossTransitionPendingRef.current = true
        // Auto-select the current phase's gate choice [→]
        const tid = setTimeout(() => {
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 800)
        pendingTimersRef.current.push(tid)
    }, [bossController.actions, setGlobalVariable])

    // Boss phase 3 player death — auto-select gate choice to reach derrota
    const handleBossPlayerDeath = useCallback(() => {
        bossController.actions.playerDied()
        bossTransitionPendingRef.current = true
        const tid = setTimeout(() => {
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 1000)
        pendingTimersRef.current.push(tid)
    }, [bossController.actions])

    // Track whether we're waiting for a transition gate auto-advance
    const bossTransitionPendingRef = useRef(false)

    // Track pending auto-choice timeouts so they can be cleared on restart/unmount
    const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

    // Auto-select gate choices [→] that appear in transition knots AFTER a phase completes.
    // We set bossTransitionPendingRef=true in handleBossPhaseComplete/handleBossPlayerDeath,
    // then when the next gate choice appears, we auto-select it.
    useEffect(() => {
        if (!bossTransitionPendingRef.current) return
        if (choices.length !== 1) return
        const choiceText = choices[0]?.text?.trim()
        if (choiceText !== '→') return

        const timer = setTimeout(() => {
            bossTransitionPendingRef.current = false
            if (makeChoiceRef.current) {
                makeChoiceRef.current(0)
            }
        }, 1500) // pause to display transition text

        return () => clearTimeout(timer)
    }, [choices])

    // ==================
    // Visual Damage System (Persistent)
    // ==================
    const visualDamage = useVisualDamage(storyId)

    const visualDamageRef = useRef(visualDamage)
    visualDamageRef.current = visualDamage

    const handleVisualDamage = useCallback((config: { grayscale?: number, reset?: boolean }) => {
        if (config.reset) {
            visualDamageRef.current.resetDamage()
        } else {
            visualDamageRef.current.recordDeath()
        }
    }, [])

    // ==================
    // Tag Processing
    // ==================

    // Keep a stable ref of the story instance
    const storyRef = useRef<any>(null)
    storyRef.current = story

    // ── Genjutsu: tag handler ───────────────────────────────────────────────
    const handleGenjutsuBreak = useCallback((stat: string, targetKnot: string, fisuraText: string) => {
        // fisuraText comes directly from the GENJUTSU_BREAK tag — no story.currentText needed
        console.log(`[Genjutsu] BREAK: stat=${stat}, target=${targetKnot}, fisura="${fisuraText}"`)

        // Save decay config before freezing — needed to resume after typing completes
        genjutsuFrozenDecayRateRef.current = willpowerState.decayRate
        genjutsuFrozenTargetKeyRef.current = willpowerState.targetKey

        // Freeze willpower while text types — player cannot click the fisura yet
        willpowerActions.stopWillpower()

        if (genjutsuReactionTimerRef.current) clearTimeout(genjutsuReactionTimerRef.current)
        setGenjutsuTextReady(false)
        setGenjutsuBreak({ stat, text: fisuraText, targetKnot })
    }, [willpowerState.decayRate, willpowerState.targetKey, willpowerActions])

    // ── Genjutsu: called by Player when TextDisplay finishes typing the fisura ─
    const onGenjutsuTypingComplete = useCallback(() => {
        if (!genjutsuBreakRef.current) return  // player already broke the illusion

        // Start at WP=65: already below the visibility threshold (80), so fisura is
        // immediately slightly visible. Difficulty still scales via decay rate.
        console.log('[Genjutsu] Typing complete — starting WP countdown at 65')
        willpowerActions.startWillpower({
            value: 65,
            decayRate: genjutsuFrozenDecayRateRef.current,
            targetKey: genjutsuFrozenTargetKeyRef.current,
        })
        setGenjutsuTextReady(true)
    }, [willpowerActions])

    // ── Genjutsu: break action ──────────────────────────────────────────────
    const breakGenjutsu = useCallback(() => {
        const gb = genjutsuBreakRef.current
        if (!gb || !storyRef.current) return

        try {
            setGlobalVariable('genjutsu_stat_used', gb.stat)
            setGlobalVariable('genjutsu_willpower', Math.round(willpowerValueRef.current))
            console.log(`[Genjutsu] Broke illusion: stat=${gb.stat}, wp=${Math.round(willpowerValueRef.current)}`)
        } catch (e) {
            console.warn('[Genjutsu] Could not set Ink variables:', e)
        }

        setGenjutsuBreak(null)
        setGenjutsuTextReady(false)
        if (genjutsuReactionTimerRef.current) {
            clearTimeout(genjutsuReactionTimerRef.current)
            genjutsuReactionTimerRef.current = null
        }
        willpowerActions.stopWillpower()

        try {
            storyRef.current.ChoosePathString(gb.targetKnot)
            if (continueStoryRef.current) {
                continueStoryRef.current()
            }
        } catch (e) {
            console.warn('[Genjutsu] Could not divert to target knot:', e)
        }
    }, [willpowerActions, setGlobalVariable])

    const { processTags } = useTagProcessor({
        // @ts-ignore
        storyRef,
        minigameController,
        achievementsSystem,
        gameSystems,
        triggerVFX,
        onInputRequest: handleInputRequest,
        onWillpowerStart: handleWillpowerStart,
        onWillpowerStop: handleWillpowerStop,
        onWillpowerCheck: handleWillpowerCheck,
        getWillpowerValue,
        onSpiderStart: handleSpiderStart,
        onSpiderStop: handleSpiderStop,
        onSpiderCheck: handleSpiderCheck,
        onSpiderDifficulty: handleSpiderDifficulty,
        onArrebatadosStart: handleArrebatadosStart,
        onArrebatadosAdd: handleArrebatadosAdd,
        onArrebatadosStop: handleArrebatadosStop,
        onBossStart: handleBossStart,
        onBossPhase: handleBossPhase,
        onBossDamage: handleBossDamage,
        onBossCheck: handleBossCheck,
        onBossStop: handleBossStop,
        onVisualDamage: handleVisualDamage,
        onGenjutsuBreak: handleGenjutsuBreak,
        onChapterBreak: handleChapterBreak,
    })

    // ==================
    // Story Continuation Wrapper
    // ==================

    // Wrapped continue function that coordinates systems
    const continueStory = useCallback(() => {
        if (!story || minigameController.isPlaying) return

        // Fire deferred CHAPTER_BREAK from previous beat (player read the text, now show the overlay)
        const pendingTags = pendingChapterBreakTagsRef.current
        if (pendingTags.length > 0) {
            pendingChapterBreakTagsRef.current = []
            chapterBreakHasTextRef.current = false  // deferred break — no text behind overlay
            processTags(pendingTags)
            return
        }

        const { text: newText, tags } = continueStoryState()

        // When pagination (# next) and CHAPTER_BREAK co-occur in the same Continue() batch,
        // defer the CHAPTER_BREAK so the player can read the current text first.
        const hasPagination = tags.some((t: string) => {
            const tag = t.trim().toLowerCase()
            return tag === 'next' || tag === 'page' || tag.startsWith('next:') || tag.startsWith('page:')
        })
        const chapterBreakTags = tags.filter((t: string) => t.trim().toUpperCase().startsWith('CHAPTER_BREAK:'))

        if (hasPagination && chapterBreakTags.length > 0) {
            pendingChapterBreakTagsRef.current = chapterBreakTags
            const filteredTags = tags.filter((t: string) => !t.trim().toUpperCase().startsWith('CHAPTER_BREAK:'))
            processTags(filteredTags)
        } else {
            // Track if CHAPTER_BREAK arrived with text in the same batch
            if (chapterBreakTags.length > 0) {
                chapterBreakHasTextRef.current = !!newText.trim()
            }
            processTags(tags)
        }

        // Sync stats from Ink variables to React state (tags update Ink directly, bypassing React)
        if (gameSystems.statsEnabled && story) {
            const defs = gameSystems.statsConfig?.definitions || []
            const syncVars: Record<string, any> = {}
            defs.forEach((def: any) => {
                const val = story.variablesState[def.id]
                if (typeof val === 'number') syncVars[def.id] = val
            })
            if (Object.keys(syncVars).length > 0) syncStatsFromVariables(syncVars)
        }

        // Check zero-stat conditions — read Ink vars directly (React state is still async here)
        if (gameSystems.statsEnabled && story) {
            const defs = gameSystems.statsConfig?.definitions || []
            const onZero = gameSystems.statsConfig?.onZero || {}
            for (const def of defs) {
                if (def.displayType === 'bar' && onZero[def.id]) {
                    const val = (story.variablesState[def.id] as number) ?? (def.min ?? 0)
                    if (val <= (def.min ?? 0)) {
                        const { action, knotName } = onZero[def.id]
                        if (action === 'end') {
                            try {
                                const { tags: deathTags } = rawSpawnAtKnot(knotName || 'game_over')
                                processTags(deathTags)
                            } catch { /* knot not found */ }
                            break
                        }
                    }
                }
            }
        }

        // Notify spider system that player advanced (resets idle timer)
        if (spiderInfestation.state.infesting) {
            spiderInfestation.actions.notifyAdvance()
        }

        // Don't autosave if story just ended (preserves last save before death/ending)
        const storyEnded = !story.canContinue && story.currentChoices.length === 0
        if (storyId && newText && !storyEnded) {
            // @ts-ignore
            saveSystem.autoSave(story.state.toJson(), newText, gameSystems.exportGameSystems() || undefined, buildParallelSystemsSaveState())
        }
    }, [story, minigameController.isPlaying, continueStoryState, processTags, spiderInfestation, storyId, saveSystem, gameSystems])

    // Debug spawn wrapper — sets variables, jumps to knot, processes tags
    const spawnAtKnot = useCallback((knotName: string, variables: Record<string, any> = {}) => {
        if (!story) return

        clearVFX()
        const { tags } = rawSpawnAtKnot(knotName, variables)
        processTags(tags)

        // Sync any stat variables back to React state
        syncStatsFromVariables(variables)
    }, [story, clearVFX, rawSpawnAtKnot, processTags, gameSystems])

    // Debug: set variables without spawning — updates Ink + syncs stats visually
    const debugSetVariables = useCallback((variables: Record<string, any>) => {
        if (!story) return

        for (const [key, val] of Object.entries(variables)) {
            try {
                setGlobalVariable(key, val)
            } catch (e) {
                console.warn(`[Debug] Could not set variable ${key}:`, e)
            }
        }

        syncStatsFromVariables(variables)

        // Check zero-stat conditions — read Ink vars directly
        if (gameSystems.statsEnabled && story) {
            const defs = gameSystems.statsConfig?.definitions || []
            const onZero = gameSystems.statsConfig?.onZero || {}
            for (const def of defs) {
                if (def.displayType === 'bar' && onZero[def.id]) {
                    const val = (story.variablesState[def.id] as number) ?? (def.min ?? 0)
                    if (val <= (def.min ?? 0)) {
                        const { action, knotName } = onZero[def.id]
                        if (action === 'end') {
                            try {
                                const { tags: deathTags } = rawSpawnAtKnot(knotName || 'game_over')
                                processTags(deathTags)
                            } catch { /* knot not found */ }
                            break
                        }
                    }
                }
            }
        }
    }, [story, setGlobalVariable, gameSystems, rawSpawnAtKnot])

    // Helper: sync changed variables to useStats React state if they match stat IDs
    function syncStatsFromVariables(variables: Record<string, any>) {
        if (!gameSystems.statsEnabled) return
        const statDefs = gameSystems.statsConfig?.definitions || []
        const statIds = new Set(statDefs.map((d: any) => d.id))

        for (const [key, val] of Object.entries(variables)) {
            if (statIds.has(key) && typeof val === 'number') {
                gameSystems.setStat(key, val)
            }
        }
    }

    // Keep refs updated
    continueStoryRef.current = continueStory

    // ==================
    // Bidirectional stat sync: React stats → Ink variables
    // ==================
    useEffect(() => {
        if (!story || !gameSystems.statsEnabled) return

        const statDefs = gameSystems.statsConfig?.definitions || []
        for (const def of statDefs) {
            const value = gameSystems.stats[def.id]
            if (value !== undefined) {
                try {
                    setGlobalVariable(def.id, value)
                } catch (e) {
                    // Variable may not exist in Ink, that's ok
                }
            }
        }
    }, [story, gameSystems.stats, gameSystems.statsEnabled, gameSystems.statsConfig, setGlobalVariable])

    // ==================
    // Story Initialization Wrapper
    // ==================

    const initStory = useCallback((data: any, savedState: any = null, savedText: string = '', savedGameSystems: any = null) => {
        initStoryState(data, savedState, savedText)

        // Set New Game+ flag
        try {
            setGlobalVariable("new_game_plus", achievementsSystem.hasCompletedGame)
            console.log('[NG+] Set new_game_plus =', achievementsSystem.hasCompletedGame)
        } catch (e) {
            console.log('[NG+] Error setting new_game_plus')
        }

        // Load saved game systems and sync stats to Ink
        if (savedGameSystems) {
            gameSystems.loadGameSystems(savedGameSystems)

            // Sync saved stats back to Ink variables so conditionals work
            if (savedGameSystems.stats) {
                Object.entries(savedGameSystems.stats).forEach(([statId, value]) => {
                    try {
                        setGlobalVariable(statId, value as number)
                        console.log(`[Init] Synced stat ${statId} = ${value} to Ink`)
                    } catch (e) {
                        // Variable may not exist in Ink, that's ok
                    }
                })
            }
        }
    }, [initStoryState, setGlobalVariable, achievementsSystem.hasCompletedGame, gameSystems])

    // Auto-continue on story init (when no saved text)
    useEffect(() => {
        if (story && !text) {
            // Don't auto-continue while a chapter break overlay is active
            if (chapterBreak) return

            // If already ended (e.g. short story or error), don't continue
            if (isEnded) return

            // If we have choices but no text (rare), don't auto continue
            if (!canContinue && choices.length > 0) return

            continueStory()
        }
    }, [story, text, isEnded, canContinue, choices.length, continueStory, chapterBreak])

    // ==================
    // Actions
    // ==================

    const makeChoice = useCallback((index: number) => {
        if (typeof index !== 'number' || isNaN(index)) {
            console.error("[BardoEngine] Invalid choice index:", index)
            return
        }

        // Genjutsu: only the resist choice (last) costs willpower; ceder (first) is free
        if (genjutsuBreakRef.current && index === choices.length - 1) {
            const GENJUTSU_TRAP_COST = 15
            willpowerActions.boostValue(-GENJUTSU_TRAP_COST)
            console.log(`[Genjutsu] Trap choice selected — willpower -${GENJUTSU_TRAP_COST}`)
        }

        clearVFX()

        // Hubs: Check exclusions
        if (story) {
            try {
                const choice = story.currentChoices[index]
                if (choice) {
                    const currentPath = story.state.currentPathString || ""
                    const currentKnot = currentPath.split('.')[0]

                    const targetPath = choice.pathStringOnChoice || ""
                    const targetKnot = targetPath.split('.')[0]

                    // @ts-ignore
                    gameSystems.hubs.handleChoice(currentKnot, targetKnot)
                }
            } catch (e) {
                console.warn("[BardoEngine] Error processing hub choice:", e)
            }
        }

        // makeChoiceState updates history internally
        const { text: newText, tags } = makeChoiceState(index)

        // Track if CHAPTER_BREAK arrived with text (same as in continueStory)
        const chapterBreakTags = tags.filter((t: string) => t.trim().toUpperCase().startsWith('CHAPTER_BREAK:'))
        if (chapterBreakTags.length > 0) {
            chapterBreakHasTextRef.current = !!newText.trim()
        }

        processTags(tags)

        // Notify spider system that player advanced (resets idle timer)
        if (spiderInfestation.state.infesting) {
            spiderInfestation.actions.notifyAdvance()
        }

        // Don't autosave if story just ended (preserves last save before death/ending)
        const storyEnded = !story.canContinue && story.currentChoices.length === 0
        if (storyId && newText && !storyEnded) {
            // @ts-ignore
            saveSystem.autoSave(story.state.toJson(), newText, gameSystems.exportGameSystems() || undefined, buildParallelSystemsSaveState())
        }
    }, [clearVFX, makeChoiceState, processTags, spiderInfestation, storyId, saveSystem, story, gameSystems, willpowerActions])

    // Keep makeChoice ref updated for spider phase auto-select
    const makeChoiceRef = useRef<any>(null)
    makeChoiceRef.current = makeChoice

    // Genjutsu: auto-surrender when willpower reaches 0 (only after fisura finishes typing)
    useEffect(() => {
        if (!genjutsuActive) return
        if (!genjutsuTextReady) return      // typing not done — player can't interact yet
        if (willpowerState.value > 0) return
        if (!willpowerState.active) return  // only fires once willpower has been resumed
        if (choices.length === 0) return

        console.log('[Genjutsu] Willpower 0 — auto-surrendering (choice 0)')
        if (genjutsuReactionTimerRef.current) clearTimeout(genjutsuReactionTimerRef.current)
        // Clear ref BEFORE makeChoice to prevent trap-cost guard from firing
        genjutsuBreakRef.current = null
        setGenjutsuBreak(null)
        if (makeChoiceRef.current) {
            makeChoiceRef.current(0)
        }
    }, [genjutsuActive, genjutsuTextReady, willpowerState.value, willpowerState.active, choices.length])

    const restart = useCallback(() => {
        if (storyData && storyId) {
            pendingTimersRef.current.forEach(clearTimeout)
            pendingTimersRef.current = []
            clearVFX()
            stopMusic(false)
            gameSystems.resetGameSystems()
            willpowerActions.stopWillpower()
            spiderInfestation.actions.stopInfestation()
            handleArrebatadosStop()
            bossController.actions.stopBoss()
            setGenjutsuBreak(null)
            setGenjutsuTextReady(false)
            setChapterBreak(null)
            pendingChapterBreakTagsRef.current = []
            chapterBreakHasTextRef.current = false
            if (genjutsuReactionTimerRef.current) {
                clearTimeout(genjutsuReactionTimerRef.current)
                genjutsuReactionTimerRef.current = null
            }
            resetStoryState()
            initStory(storyData)
        }
    }, [storyData, storyId, clearVFX, stopMusic, gameSystems, willpowerActions, spiderInfestation.actions, handleArrebatadosStop, bossController.actions, resetStoryState, initStory])

    const backToStart = useCallback(() => {
        pendingTimersRef.current.forEach(clearTimeout)
        pendingTimersRef.current = []
        resetStoryState()
        clearVFX()
        stopMusic()
        gameSystems.resetGameSystems()
        willpowerActions.stopWillpower()
        spiderInfestation.actions.stopInfestation()
        handleArrebatadosStop()
        bossController.actions.stopBoss()
        setGenjutsuBreak(null)
        setGenjutsuTextReady(false)
        setChapterBreak(null)
        if (genjutsuReactionTimerRef.current) {
            clearTimeout(genjutsuReactionTimerRef.current)
            genjutsuReactionTimerRef.current = null
        }
    }, [resetStoryState, clearVFX, stopMusic, gameSystems, willpowerActions, spiderInfestation.actions, handleArrebatadosStop, bossController.actions])

    const finishGame = useCallback(() => {
        achievementsSystem.markGameComplete()
        backToStart()
    }, [backToStart, achievementsSystem])

    // Minigame handlers
    const handleMinigameStart = useCallback(() => {
        setGlobalVariable("minigame_result", -1)
        minigameController.startGame()
    }, [minigameController, setGlobalVariable])

    // ==================
    // Save/Load Actions
    // ==================

    const newGame = useCallback(() => {
        if (storyData) {
            gameSystems.resetGameSystems()
            initStory(storyData)
        }
    }, [storyData, initStory, gameSystems])

    const continueGame = useCallback(() => {
        if (!saveSystem.hasContinue) return null
        const saveData = saveSystem.loadLastSave()
        if (saveData && storyData) {
            initStory(storyData, saveData.state, saveData.text, saveData.gameSystems)
            // Restore parallel systems that were active when saved
            const ps = saveData.parallelSystems
            if (ps?.spider) {
                spiderInfestation.actions.startInfestation(ps.spider)
            }
            if (ps?.willpower) {
                willpowerActions.startWillpower(ps.willpower)
            }
            if (ps?.arrebatados) {
                setArrebatadosEnabled(true)
                setArrebatadosCount(ps.arrebatados.count)
                setArrebatadosFuerza(ps.arrebatados.fuerza)
            }
            if (ps?.genjutsu) {
                setGenjutsuBreak(ps.genjutsu)
            }
            return saveData
        }
        return null
    }, [saveSystem, storyData, initStory, spiderInfestation.actions, willpowerActions, setArrebatadosEnabled, setArrebatadosCount, setArrebatadosFuerza])

    const loadSave = useCallback((saveId: string) => {
        const saveData = saveSystem.loadSave(saveId)
        if (saveData && storyData) {
            initStory(storyData, saveData.state, saveData.text, saveData.gameSystems)
            // Restore parallel systems that were active when saved
            const ps = saveData.parallelSystems
            if (ps?.spider) {
                spiderInfestation.actions.startInfestation(ps.spider)
            }
            if (ps?.willpower) {
                willpowerActions.startWillpower(ps.willpower)
            }
            if (ps?.arrebatados) {
                setArrebatadosEnabled(true)
                setArrebatadosCount(ps.arrebatados.count)
                setArrebatadosFuerza(ps.arrebatados.fuerza)
            }
            if (ps?.genjutsu) {
                setGenjutsuBreak(ps.genjutsu)
            }
            return saveData
        }
        return null
    }, [saveSystem, storyData, initStory, spiderInfestation.actions, willpowerActions, setArrebatadosEnabled, setArrebatadosCount, setArrebatadosFuerza])

    const manualSave = useCallback((name: string, overwriteId: string | null = null) => {
        if (!story || !storyId) return
        // @ts-ignore
        saveSystem.saveGame(name, story.state.toJson(), text, gameSystems.exportGameSystems() || undefined, overwriteId, buildParallelSystemsSaveState())
    }, [story, storyId, text, saveSystem, gameSystems])

    // ==================
    // Return API
    // ==================

    const actions = useMemo(() => ({
        initStory,
        continueStory,
        makeChoice,
        restart,
        backToStart,
        finishGame,
        // Save/Load
        newGame,
        continueGame,
        loadSave,
        manualSave,
        // Minigame
        handleMinigameStart,
        // Input
        commitInput,
        // Debug
        spawnAtKnot,
        debugSetVariables,
        getKnotList,
        getVariables,
    }), [
        initStory, continueStory, makeChoice, restart, backToStart, finishGame,
        newGame, continueGame, loadSave, manualSave, handleMinigameStart, commitInput,
        spawnAtKnot, debugSetVariables, getKnotList, getVariables
    ])

    const subsystems = useMemo(() => ({
        audio: { playSfx, playMusic, stopMusic, stopAllAudio },
        vfx: { vfxState, triggerVFX, clearVFX },
        saveSystem,
        gameSystems,
        achievementsSystem,
        minigameController,
        input: { pendingInput, commitInput },
        willpower: {
            state: willpowerState,
            actions: willpowerActions,
            updateValue: willpowerActions.updateValue,
            boostValue: willpowerActions.boostValue
        },
        spiderInfestation,
        scrollFriction,
        bossController: {
            state: bossController.state,
            actions: bossController.actions,
            handleBossPhaseComplete,
            handleBossPlayerDeath,
        },
        visualDamage,
        scrollContainerRef,
        genjutsu: {
            break: genjutsuBreak,
            active: genjutsuActive,
            breakGenjutsu,
            onTypingComplete: onGenjutsuTypingComplete,
        },
        chapterBreak: {
            data: chapterBreak,
            dismiss: dismissChapterBreak,
            cooldown: chapterBreakCooldown,
        },
    }), [
        playSfx, playMusic, stopMusic, stopAllAudio,
        vfxState, triggerVFX, clearVFX,
        saveSystem, gameSystems, achievementsSystem, minigameController, pendingInput, commitInput,
        willpowerState, willpowerActions,
        spiderInfestation,
        scrollFriction, bossController.state, bossController.actions, handleBossPhaseComplete, handleBossPlayerDeath, visualDamage,
        genjutsuBreak, genjutsuActive, breakGenjutsu, onGenjutsuTypingComplete,
        chapterBreak, dismissChapterBreak, chapterBreakCooldown
    ])

    const gameVersion = gameSystems.config?.version || '0.0.0'

    const configRef = useMemo(() => ({
        extrasConfig,
        hasExtras,
        achievementDefs,
        gameVersion,
    }), [extrasConfig, hasExtras, achievementDefs, gameVersion])

    const settingsHelpers = useMemo(() => ({
        getTypewriterDelay,
        getMusicVolume,
        getSfxVolume,
    }), [getTypewriterDelay, getMusicVolume, getSfxVolume])

    return useMemo(() => ({
        // Core state
        story,
        text,
        choices,
        canContinue,
        continueLabel,
        isEnded,
        history,
        isThemeReady,

        actions,
        subsystems,
        config: configRef,
        settingsHelpers
    }), [
        story, text, choices, canContinue, continueLabel, isEnded, history, isThemeReady,
        actions, subsystems, configRef, settingsHelpers
    ])
}
