import { useState, useCallback, useRef, useMemo } from 'react'

/**
 * useMinigameController - Centralized minigame state machine
 * 
 * States: idle -> pending -> playing -> idle
 * 
 * Flow:
 * 1. queueGame(config) - Called when a minigame tag is detected
 * 2. startGame() - Called when ready to play (auto or manual)
 * 3. finishGame(result) - Called when game ends, commits result
 */
export function useMinigameController(onResultCommit) {
    // State machine: idle | pending | playing
    const [state, setState] = useState('idle')
    const [config, setConfig] = useState(null)
    const resultRef = useRef(null)

    /**
     * Queue a minigame for execution
     * @param {object} gameConfig - { type, params, autoStart }
     */
    const queueGame = useCallback((gameConfig) => {
        console.log('[MinigameController] Queuing game:', gameConfig)
        setConfig(gameConfig)
        setState('pending')
    }, [])

    /**
     * Start the queued minigame
     */
    const startGame = useCallback(() => {
        if (state !== 'pending') {
            console.warn('[MinigameController] Cannot start: not in pending state')
            return
        }
        console.log('[MinigameController] Starting game:', config?.type)
        setState('playing')
    }, [state, config])

    /**
     * Complete the minigame and commit result
     * @param {boolean|number} result - Win (true/1) or Lose (false/0)
     */
    const finishGame = useCallback((result) => {
        const numericResult = (result === true || result === 1) ? 1 : 0
        console.log('[MinigameController] Finishing game with result:', numericResult)

        resultRef.current = numericResult
        setState('idle')
        setConfig(null)

        // Commit result to Ink via callback
        console.log('[MinigameController] onResultCommit exists?', !!onResultCommit)
        if (onResultCommit) {
            console.log('[MinigameController] Calling onResultCommit with:', numericResult)
            onResultCommit(numericResult)
        } else {
            console.error('[MinigameController] ERROR: onResultCommit is not defined!')
        }
    }, [onResultCommit])

    /**
     * Cancel the current minigame without result
     */
    const cancelGame = useCallback(() => {
        console.log('[MinigameController] Game cancelled')
        setState('idle')
        setConfig(null)
    }, [])

    /**
     * Reset controller to initial state
     */
    const reset = useCallback(() => {
        setState('idle')
        setConfig(null)
        resultRef.current = null
    }, [])

    return useMemo(() => ({
        // State
        state,
        config,
        lastResult: resultRef.current,

        // Derived state
        isPending: state === 'pending',
        isPlaying: state === 'playing',

        // Actions
        queueGame,
        startGame,
        finishGame,
        cancelGame,
        reset
    }), [
        state,
        config,
        queueGame,
        startGame,
        finishGame,
        cancelGame,
        reset
    ])
}

/**
 * Parse a minigame tag into a config object
 * 
 * Supported formats:
 * - Legacy: "minigame:qte:SPACE:1.5"
 * - New: "minigame: type=qte, key=SPACE, timeout=1.5, autostart=true"
 * - Dynamic: "minigame: type=lockpick, speed={agilidad}, autostart=true"
 * 
 * @param {string} tag - Raw tag string (without #)
 * @param {object} storyRef - Optional ref to Ink story for variable resolution
 * @returns {object|null} - { type, params, autoStart }
 */
export function parseMinigameTag(tag, storyRef = null) {
    if (!tag || !tag.toLowerCase().startsWith('minigame:')) {
        return null
    }

    const content = tag.substring('minigame:'.length).trim()

    // Check for new format (key=value pairs)
    if (content.includes('=')) {
        return parseNewFormat(content, storyRef)
    }

    // Legacy format (colon-separated values)
    return parseLegacyFormat(content)
}

/**
 * Resolve Ink variable placeholders like {variableName}
 */
function resolveInkVariables(value, storyRef) {
    if (!storyRef?.current || typeof value !== 'string') return value

    // Match {variableName} patterns
    const resolved = value.replace(/\{([^}]+)\}/g, (match, varName) => {
        try {
            const inkValue = storyRef.current.variablesState[varName.trim()]
            if (inkValue !== undefined) {
                console.log(`[MinigameParser] Resolved {${varName}} = ${inkValue}`)
                return inkValue
            }
        } catch (e) {
            console.warn(`[MinigameParser] Failed to resolve {${varName}}:`, e)
        }
        return match // Keep original if not found
    })

    return resolved
}

function parseNewFormat(content, storyRef = null) {
    const pairs = content.split(',').map(p => p.trim())
    const config = { type: null, params: {}, autoStart: true }

    for (const pair of pairs) {
        const [key, rawValue] = pair.split('=').map(s => s.trim())

        // Resolve any Ink variables in the value
        const value = resolveInkVariables(rawValue, storyRef)

        if (key === 'type') {
            config.type = value.toLowerCase()
        } else if (key === 'autostart') {
            config.autoStart = value.toLowerCase() === 'true'
        } else if (key === 'onFail' || key === 'onSuccess') {
            // Store consequence tags for later processing
            config.params[key] = value
        } else if (key === 'consume') {
            // Store item to consume on use
            config.params.consumeItem = value
        } else {
            // Parse numeric values
            const numValue = parseFloat(value)
            config.params[key] = isNaN(numValue) ? value : numValue
        }
    }

    return config.type ? config : null
}

function parseLegacyFormat(content) {
    const parts = content.split(':').map(p => p.trim())
    const type = parts[0]?.toLowerCase()

    if (!type) return null

    const config = { type, params: {}, autoStart: true }

    // Type-specific parameter parsing
    switch (type) {
        case 'qte':
            config.params.key = parts[1] || 'SPACE'
            config.params.timeout = parseFloat(parts[2]) || 2.0
            break
        case 'lockpick':
            config.params.zoneSize = parseFloat(parts[1]) || 0.15
            config.params.speed = parseFloat(parts[2]) || 1.5
            break
        case 'arkanoid':
            // No additional params needed
            break
    }

    return config
}
