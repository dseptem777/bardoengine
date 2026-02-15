import { useCallback, useMemo } from 'react'
import { parseMinigameTag } from './useMinigameController'

interface TagProcessorOptions {
    storyRef: any;
    minigameController: any;
    achievementsSystem: any;
    gameSystems: any;
    triggerVFX: (tag: string) => void;
    onInputRequest?: (varName: string, placeholder: string) => void;
    // Horror system callbacks (optional)
    onMouseResistance?: (level: string) => void;
    onCursorMagnet?: (targetId: string, strength: number) => void;
    // Parallel willpower system callbacks
    onWillpowerStart?: (config: { decayRate?: string, targetKey?: string, initialValue?: number }) => void;
    onWillpowerStop?: () => void;
    onWillpowerCheck?: (threshold: number) => boolean;
    getWillpowerValue?: () => number;
    // Spider infestation callbacks
    onSpiderStart?: (config: { difficulty?: string, fuerza?: number, magia?: number, sabiduria?: number }) => void;
    onSpiderStop?: () => void;
    onSpiderCheck?: (threshold: number) => void;
    onSpiderDifficulty?: (difficulty: string) => void;
    // Arrebatados (scroll friction) callbacks
    onArrebatadosStart?: (config: { count: number, fuerza: number }) => void;
    onArrebatadosAdd?: (count: number) => void;
    onArrebatadosStop?: () => void;
    // Boss controller callbacks
    onBossStart?: (config: { name: string, hp: number }) => void;
    onBossPhase?: (phase: number) => void;
    onBossDamage?: (amount: number) => void;
    onBossCheck?: () => boolean;
    onBossStop?: () => void;
    // Visual damage callbacks
    onVisualDamage?: (config: { grayscale?: number, reset?: boolean }) => void;
}

export function useTagProcessor({
    storyRef,
    minigameController,
    achievementsSystem,
    gameSystems,
    triggerVFX,
    onInputRequest,
    onMouseResistance,
    onCursorMagnet,
    onWillpowerStart,
    onWillpowerStop,
    onWillpowerCheck,
    getWillpowerValue,
    onSpiderStart,
    onSpiderStop,
    onSpiderCheck,
    onSpiderDifficulty,
    onArrebatadosStart,
    onArrebatadosAdd,
    onArrebatadosStop,
    onBossStart,
    onBossPhase,
    onBossDamage,
    onBossCheck,
    onBossStop,
    onVisualDamage
}: TagProcessorOptions) {
    const processTags = useCallback((tags: string[]) => {
        tags.forEach(rawTag => {
            const tag = rawTag.trim()
            if (!tag) return

            // ============================================
            // HORROR SYSTEM TAGS
            // ============================================

            // KEY_MASH: Willpower resistance minigame
            // Format: KEY_MASH: 30 or KEY_MASH: willpower (variable)
            if (tag.toUpperCase().startsWith('KEY_MASH:')) {
                const countOrVar = tag.split(':')[1]?.trim()
                let count = parseInt(countOrVar)

                // Check if it's a variable reference
                if (isNaN(count) && storyRef?.current) {
                    try {
                        const varValue = storyRef.current.variablesState[countOrVar]
                        count = typeof varValue === 'number' ? varValue : 30
                        console.log(`[Tags] KEY_MASH resolved variable ${countOrVar} = ${count}`)
                    } catch (e) {
                        count = 30
                    }
                }

                console.log(`[Tags] KEY_MASH detected: ${count} presses required`)
                minigameController.queueGame({
                    type: 'keymash',
                    params: {
                        key: 'V',
                        count: count || 30,
                        timeLimit: Math.max(10, (count || 30) * 0.5) // Scale time with count
                    },
                    autoStart: true
                })
                return
            }

            // MOUSE_RESISTANCE: Heavy cursor effect
            // Format: MOUSE_RESISTANCE: high | medium | low | none
            if (tag.toUpperCase().startsWith('MOUSE_RESISTANCE:')) {
                const level = tag.split(':')[1]?.trim().toLowerCase()
                console.log(`[Tags] MOUSE_RESISTANCE: ${level}`)
                if (onMouseResistance) {
                    onMouseResistance(level)
                }
                return
            }

            // MOUSE_MAGNET: Attract cursor to choice
            // Format: MOUSE_MAGNET: option_id
            if (tag.toUpperCase().startsWith('MOUSE_MAGNET:')) {
                const targetId = tag.split(':')[1]?.trim()
                console.log(`[Tags] MOUSE_MAGNET: ${targetId}`)
                if (onCursorMagnet) {
                    onCursorMagnet(targetId, 0.7)
                }
                return
            }

            // ============================================
            // PARALLEL WILLPOWER SYSTEM TAGS
            // ============================================

            // WILLPOWER_START: Begin parallel willpower challenge
            // Format: WILLPOWER_START: decay_rate (slow|normal|fast|extreme)
            if (tag.toUpperCase().startsWith('WILLPOWER_START')) {
                const parts = tag.split(':')
                const decayRate = parts[1]?.trim().toLowerCase() || 'normal'
                console.log(`[Tags] WILLPOWER_START: decay=${decayRate}`)
                if (onWillpowerStart) {
                    onWillpowerStart({ decayRate, targetKey: 'V', initialValue: 100 })
                }
                return
            }

            // WILLPOWER_STOP: End willpower challenge
            if (tag.toUpperCase() === 'WILLPOWER_STOP') {
                console.log('[Tags] WILLPOWER_STOP')
                if (onWillpowerStop) {
                    onWillpowerStop()
                }
                return
            }

            // WILLPOWER_CHECK: Check current willpower against threshold
            // Format: WILLPOWER_CHECK: threshold
            // Sets 'willpower_passed' variable in Ink
            if (tag.toUpperCase().startsWith('WILLPOWER_CHECK:')) {
                const threshold = parseInt(tag.split(':')[1]?.trim()) || 50
                console.log(`[Tags] WILLPOWER_CHECK: threshold=${threshold}`)

                let passed = false
                if (onWillpowerCheck) {
                    passed = onWillpowerCheck(threshold)
                } else if (getWillpowerValue) {
                    passed = getWillpowerValue() >= threshold
                }

                // Set result in Ink
                if (storyRef?.current) {
                    try {
                        storyRef.current.variablesState['willpower_passed'] = passed
                        console.log(`[Tags] Set willpower_passed = ${passed}`)
                    } catch (e) {
                        console.warn('[Tags] Could not set willpower_passed:', e)
                    }
                }
                return
            }

            // ============================================
            // SPIDER INFESTATION — Continuous across story beats
            // SPIDER_START: difficulty=normal, fuerza={fuerza}...
            // SPIDER_STOP
            // SPIDER_CHECK: threshold
            // SPIDER_DIFFICULTY: fast
            // ============================================

            if (tag.toUpperCase().startsWith('SPIDER_START')) {
                const rawParams = tag.split(':').slice(1).join(':').trim()
                const parts = rawParams.split(',').map((s: string) => s.trim())
                const config: any = { difficulty: 'normal' }

                for (const part of parts) {
                    const [key, rawVal] = part.split('=').map((s: string) => s.trim())
                    if (key && rawVal) {
                        let val: any = rawVal
                        const varMatch = rawVal.match(/^\{(.+)\}$/)
                        if (varMatch && storyRef?.current) {
                            try {
                                val = storyRef.current.variablesState[varMatch[1]] ?? 0
                            } catch (e) { val = 0 }
                        } else if (key === 'difficulty') {
                            val = rawVal.toLowerCase()
                        } else {
                            val = parseFloat(rawVal) || 0
                        }
                        config[key] = val
                    }
                }

                console.log(`[Tags] SPIDER_START:`, config)
                if (onSpiderStart) onSpiderStart(config)
                return
            }

            if (tag.toUpperCase().startsWith('SPIDER_STOP')) {
                console.log(`[Tags] SPIDER_STOP`)
                if (onSpiderStop) onSpiderStop()
                return
            }

            if (tag.toUpperCase().startsWith('SPIDER_CHECK')) {
                const thresholdStr = tag.split(':')[1]?.trim()
                const threshold = parseInt(thresholdStr) || 5
                console.log(`[Tags] SPIDER_CHECK: threshold=${threshold}`)
                if (onSpiderCheck) onSpiderCheck(threshold)
                return
            }

            if (tag.toUpperCase().startsWith('SPIDER_DIFFICULTY')) {
                const newDiff = tag.split(':')[1]?.trim()?.toLowerCase() || 'normal'
                console.log(`[Tags] SPIDER_DIFFICULTY: ${newDiff}`)
                if (onSpiderDifficulty) onSpiderDifficulty(newDiff)
                return
            }

            // ============================================
            // ARREBATADOS (Scroll Friction) TAGS
            // ============================================

            if (tag.toUpperCase().startsWith('ARREBATADOS_START')) {
                const rawParams = tag.split(':').slice(1).join(':').trim()
                const parts = rawParams.split(',').map((s: string) => s.trim())
                const config: any = { count: 3, fuerza: 10 }

                for (const part of parts) {
                    const [key, rawVal] = part.split('=').map((s: string) => s.trim())
                    if (key && rawVal) {
                        let val: any = rawVal
                        const varMatch = rawVal.match(/^\{(.+)\}$/)
                        if (varMatch && storyRef?.current) {
                            try {
                                val = storyRef.current.variablesState[varMatch[1]] ?? 0
                            } catch (e) { val = 0 }
                        } else {
                            val = parseInt(rawVal) || 0
                        }
                        config[key] = val
                    }
                }

                console.log('[Tags] ARREBATADOS_START:', config)
                if (onArrebatadosStart) onArrebatadosStart(config)
                return
            }

            if (tag.toUpperCase().startsWith('ARREBATADOS_ADD')) {
                const count = parseInt(tag.split(':')[1]?.trim()) || 1
                console.log(`[Tags] ARREBATADOS_ADD: ${count}`)
                if (onArrebatadosAdd) onArrebatadosAdd(count)
                return
            }

            if (tag.toUpperCase().startsWith('ARREBATADOS_STOP')) {
                console.log('[Tags] ARREBATADOS_STOP')
                if (onArrebatadosStop) onArrebatadosStop()
                return
            }

            // ============================================
            // BOSS CONTROLLER TAGS
            // ============================================

            if (tag.toUpperCase().startsWith('BOSS_START')) {
                const rawParams = tag.split(':').slice(1).join(':').trim()
                const parts = rawParams.split(',').map((s: string) => s.trim())
                const config: any = { name: 'boss', hp: 100 }

                for (const part of parts) {
                    const [key, rawVal] = part.split('=').map((s: string) => s.trim())
                    if (key && rawVal) {
                        config[key] = key === 'hp' ? parseInt(rawVal) || 100 : rawVal
                    }
                }

                console.log('[Tags] BOSS_START:', config)
                if (onBossStart) onBossStart(config)
                return
            }

            if (tag.toUpperCase().startsWith('BOSS_PHASE')) {
                const phase = parseInt(tag.split(':')[1]?.trim()) || 1
                console.log(`[Tags] BOSS_PHASE: ${phase}`)
                if (onBossPhase) onBossPhase(phase)
                return
            }

            if (tag.toUpperCase().startsWith('BOSS_DAMAGE')) {
                const amount = parseInt(tag.split(':')[1]?.trim()) || 10
                console.log(`[Tags] BOSS_DAMAGE: ${amount}`)
                if (onBossDamage) onBossDamage(amount)
                return
            }

            if (tag.toUpperCase().startsWith('BOSS_CHECK')) {
                console.log('[Tags] BOSS_CHECK')
                let defeated = false
                if (onBossCheck) {
                    defeated = onBossCheck()
                }
                if (storyRef?.current) {
                    try {
                        storyRef.current.variablesState['boss_defeated'] = defeated
                        console.log(`[Tags] Set boss_defeated = ${defeated}`)
                    } catch (e) {
                        console.warn('[Tags] Could not set boss_defeated:', e)
                    }
                }
                return
            }

            if (tag.toUpperCase().startsWith('BOSS_STOP')) {
                console.log('[Tags] BOSS_STOP')
                if (onBossStop) onBossStop()
                return
            }

            // ============================================
            // VISUAL DAMAGE TAGS
            // ============================================

            if (tag.toUpperCase().startsWith('VISUAL_DAMAGE')) {
                const rawParam = tag.split(':').slice(1).join(':').trim()
                if (rawParam.toLowerCase() === 'reset') {
                    console.log('[Tags] VISUAL_DAMAGE: reset')
                    if (onVisualDamage) onVisualDamage({ reset: true })
                } else {
                    const match = rawParam.match(/grayscale\s*=\s*([\d.]+)/)
                    const grayscale = match ? parseFloat(match[1]) : 0.3
                    console.log(`[Tags] VISUAL_DAMAGE: grayscale=${grayscale}`)
                    if (onVisualDamage) onVisualDamage({ grayscale })
                }
                return
            }

            // ============================================
            // EXISTING TAG PROCESSING
            // ============================================

            // Minigame tag
            const minigameConfig = parseMinigameTag(tag, storyRef)
            if (minigameConfig) {
                console.log('[Tags] Minigame detected:', minigameConfig)
                minigameController.queueGame(minigameConfig)
                return
            }

            // Achievement unlock tag
            if (tag.toLowerCase().startsWith('achievement:unlock:')) {
                const achievementId = tag.split(':')[2]
                console.log('[Tags] Achievement unlock:', achievementId)
                achievementsSystem.unlockAchievement(achievementId)
                return
            }

            // Game systems tags (stats, inventory)
            const handled = gameSystems.processGameTag(tag)

            // Input tag
            if (tag.toLowerCase().startsWith('input:')) {
                const parts = tag.split(':')
                const varName = parts[1]
                const placeholder = parts[2] || 'Ingresa el nombre...'
                console.log('[Tags] Input request:', varName)

                // We'll pass this up to the orchestrator via a new callback
                if (onInputRequest) {
                    onInputRequest(varName, placeholder)
                }
                return
            }

            // Fall back to VFX (including UI_EFFECT: horror tags)
            if (!handled) {
                triggerVFX(tag)
            }
        })
    }, [
        gameSystems,
        triggerVFX,
        minigameController,
        achievementsSystem,
        storyRef,
        onInputRequest,
        onMouseResistance,
        onCursorMagnet,
        onWillpowerStart,
        onWillpowerStop,
        onWillpowerCheck,
        getWillpowerValue,
        onSpiderStart,
        onSpiderStop,
        onSpiderCheck,
        onSpiderDifficulty,
        onArrebatadosStart,
        onArrebatadosAdd,
        onArrebatadosStop,
        onBossStart,
        onBossPhase,
        onBossDamage,
        onBossCheck,
        onBossStop,
        onVisualDamage
    ])

    return useMemo(() => ({ processTags }), [processTags])
}

