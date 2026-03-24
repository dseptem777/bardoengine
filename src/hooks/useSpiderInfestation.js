import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

/**
 * useSpiderInfestation — Torch & Corruption System
 *
 * Cursor/finger = torch. Atmospheric spiders flee from light.
 * Text paragraphs outside the torch radius corrupt over time.
 * Hover (desktop) or drag (mobile) over corrupted text restores it.
 * Idle penalty: torch radius shrinks if player doesn't advance.
 *
 * Tags:
 *   SPIDER_START: difficulty=normal, fuerza={fuerza}, magia={magia}
 *   SPIDER_STOP
 *   SPIDER_CHECK: threshold (% clean text required, 0-100)
 *   SPIDER_DIFFICULTY: fast
 */

const DIFFICULTY = {
    slow:    { torchRadius: 140, corruptionRate: 5,  spiderCount: 4,  spiderSpeed: 28, idleDecayRate: 4  },
    normal:  { torchRadius: 115, corruptionRate: 9,  spiderCount: 7,  spiderSpeed: 42, idleDecayRate: 7  },
    fast:    { torchRadius: 90,  corruptionRate: 15, spiderCount: 10, spiderSpeed: 58, idleDecayRate: 11 },
    extreme: { torchRadius: 65,  corruptionRate: 22, spiderCount: 15, spiderSpeed: 72, idleDecayRate: 16 },
}

const IDLE_THRESHOLD_MS = 5000
const MIN_TORCH_RATIO = 0.3

export function useSpiderInfestation() {
    // ─── State ────────────────────────────────────────────────────────────────
    const [active, setActive] = useState(false)
    const [difficulty, setDifficulty] = useState('normal')
    const [spiders, setSpiders] = useState([])
    const [torchPosition, setTorchPosition] = useState({ x: -9999, y: -9999 })
    const [torchRadius, setTorchRadius] = useState(150)
    const [corruptionMap, setCorruptionMap] = useState(new Map()) // paragraphIndex → level (0-1)
    const [overallCorruption, setOverallCorruption] = useState(0)
    const [paused, setPaused] = useState(false)
    const [phaseResult, setPhaseResult] = useState(null)
    const [showingResult, setShowingResult] = useState(false)

    // ─── Refs (game loop reads) ────────────────────────────────────────────────
    const activeRef = useRef(false)
    const pausedRef = useRef(false)
    const difficultyRef = useRef('normal')
    const spidersRef = useRef([])
    const torchPositionRef = useRef({ x: -9999, y: -9999 })
    const torchRadiusRef = useRef(150)
    const baseTorchRadiusRef = useRef(150)
    const corruptionMapRef = useRef(new Map())
    const webCorruptionMapRef = useRef(new Map())
    const statsRef = useRef({ fuerza: 0, magia: 0, sabiduria: 0 })
    const spiderIdRef = useRef(0)
    const animFrameRef = useRef(null)
    const lastTimeRef = useRef(0)
    const lastAdvanceTimeRef = useRef(Date.now())
    const lastWebUpdateRef = useRef(0)
    const pendingTimeoutsRef = useRef([])
    const isTouchingRef = useRef(false)

    // Sync state → refs
    useEffect(() => { activeRef.current = active }, [active])
    useEffect(() => { pausedRef.current = paused }, [paused])
    useEffect(() => { difficultyRef.current = difficulty }, [difficulty])
    useEffect(() => { spidersRef.current = spiders }, [spiders])
    useEffect(() => { torchRadiusRef.current = torchRadius }, [torchRadius])

    // ─── Input: Torch Tracking ─────────────────────────────────────────────────
    useEffect(() => {
        if (!active) return

        const onMouseMove = (e) => {
            const pos = { x: e.clientX, y: e.clientY }
            torchPositionRef.current = pos
            setTorchPosition(pos)
        }

        const onTouchStart = (e) => {
            isTouchingRef.current = true
            const touch = e.touches[0]
            const pos = { x: touch.clientX, y: touch.clientY }
            torchPositionRef.current = pos
            setTorchPosition(pos)
        }

        const onTouchMove = (e) => {
            const touch = e.touches[0]
            const pos = { x: touch.clientX, y: touch.clientY }
            torchPositionRef.current = pos
            setTorchPosition(pos)
        }

        const onTouchEnd = () => {
            isTouchingRef.current = false
            // Torch disappears when finger lifts — push it off screen
            const offscreen = { x: -9999, y: -9999 }
            torchPositionRef.current = offscreen
            setTorchPosition(offscreen)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchmove', onTouchMove, { passive: true })
        window.addEventListener('touchend', onTouchEnd)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }
    }, [active])

    // ─── Spider Factory ─────────────────────────────────────────────────────────
    const createSpider = useCallback(() => {
        spiderIdRef.current++
        const vw = window.innerWidth
        const vh = window.innerHeight

        const edge = Math.random()
        let x, y
        if (edge < 0.4)       { x = Math.random() * vw; y = vh + 20 }
        else if (edge < 0.6)  { x = Math.random() * vw; y = -20 }
        else if (edge < 0.8)  { x = -20; y = Math.random() * vh }
        else                  { x = vw + 20; y = Math.random() * vh }

        const sizeRoll = Math.random()
        const size = sizeRoll < 0.4 ? 'small' : sizeRoll < 0.8 ? 'medium' : 'large'

        const diff = DIFFICULTY[difficultyRef.current] || DIFFICULTY.normal

        return {
            id: spiderIdRef.current,
            x, y,
            targetX: vw / 2 + (Math.random() - 0.5) * vw * 0.5,
            targetY: vh / 2 + (Math.random() - 0.5) * vh * 0.5,
            size,
            wobblePhase: Math.random() * Math.PI * 2,
            speed: diff.spiderSpeed,
            wanderTimer: 0,
        }
    }, [])

    // ─── Game Loop ──────────────────────────────────────────────────────────────
    const gameLoop = useCallback((timestamp) => {
        if (!activeRef.current) return

        const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1)
        lastTimeRef.current = timestamp

        if (pausedRef.current) {
            animFrameRef.current = requestAnimationFrame(gameLoop)
            return
        }

        const diff = DIFFICULTY[difficultyRef.current] || DIFFICULTY.normal
        const torch = torchPositionRef.current
        const torchR = torchRadiusRef.current
        const repulseR = torchR * 1.3

        // ── Idle Penalty: shrink torch radius ──────────────────────────────────
        const idleSec = (timestamp - lastAdvanceTimeRef.current) / 1000
        const minRadius = baseTorchRadiusRef.current * MIN_TORCH_RATIO
        if (idleSec > IDLE_THRESHOLD_MS / 1000) {
            const newR = Math.max(minRadius, torchRadiusRef.current - diff.idleDecayRate * dt)
            if (newR !== torchRadiusRef.current) {
                torchRadiusRef.current = newR
                setTorchRadius(newR)
            }
        } else if (torchRadiusRef.current < baseTorchRadiusRef.current) {
            // Recover when player is active
            const newR = Math.min(baseTorchRadiusRef.current, torchRadiusRef.current + diff.idleDecayRate * 2 * dt)
            torchRadiusRef.current = newR
            setTorchRadius(newR)
        }

        // ── Spider Movement ────────────────────────────────────────────────────
        const currentSpiders = spidersRef.current.map(spider => {
            // Periodically reassign wander target
            let { targetX, targetY } = spider
            const newWanderTimer = spider.wanderTimer - dt
            if (newWanderTimer <= 0) {
                const paragraphs = document.querySelectorAll('[data-paragraph-index]')
                if (paragraphs.length > 0) {
                    const p = paragraphs[Math.floor(Math.random() * paragraphs.length)]
                    const rect = p.getBoundingClientRect()
                    targetX = rect.left + Math.random() * rect.width
                    targetY = rect.top + Math.random() * rect.height * 0.8
                }
            }

            // Torch repulsion
            const tdx = spider.x - torch.x
            const tdy = spider.y - torch.y
            const tDist = Math.sqrt(tdx * tdx + tdy * tdy)

            let repulseX = 0, repulseY = 0
            if (tDist < repulseR && tDist > 0) {
                const strength = (1 - tDist / repulseR) * diff.spiderSpeed * 2
                repulseX = (tdx / tDist) * strength * dt
                repulseY = (tdy / tDist) * strength * dt
            }

            // Move toward target
            const dx = targetX - spider.x
            const dy = targetY - spider.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const wobble = Math.sin(timestamp / 300 + spider.wobblePhase) * 20
            let moveX = 0, moveY = 0
            if (dist > 10) {
                moveX = (dx / dist) * spider.speed * dt + wobble * dt
                moveY = (dy / dist) * spider.speed * dt
            }

            return {
                ...spider,
                x: spider.x + moveX + repulseX,
                y: spider.y + repulseY + moveY,
                targetX,
                targetY,
                wanderTimer: newWanderTimer <= 0 ? 2 + Math.random() * 3 : newWanderTimer,
            }
        })
        setSpiders(currentSpiders)
        spidersRef.current = currentSpiders

        // ── Corruption System ──────────────────────────────────────────────────
        const paragraphs = document.querySelectorAll('[data-paragraph-index]')
        if (paragraphs.length > 0) {
            const newMap = new Map(corruptionMapRef.current)

            paragraphs.forEach(elem => {
                const idx = parseInt(elem.getAttribute('data-paragraph-index'))
                const rect = elem.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2

                // Distance from torch to nearest point on paragraph rect
                // (0 when cursor is inside the paragraph — always restores)
                const closestX = Math.max(rect.left, Math.min(torch.x, rect.right))
                const closestY = Math.max(rect.top, Math.min(torch.y, rect.bottom))
                const tdx = closestX - torch.x
                const tdy = closestY - torch.y
                const torchDist = Math.sqrt(tdx * tdx + tdy * tdy)

                const current = newMap.get(idx) || 0

                if (torchDist < torchR) {
                    // Inside torch: fixed restore rate ~4s to fully clean — independent of difficulty
                    const restored = Math.max(0, current - 0.4 * dt)
                    if (restored === 0) newMap.delete(idx)
                    else newMap.set(idx, restored)
                } else {
                    // Outside torch: check spider proximity for corruption
                    let spiderProximity = 0
                    for (const spider of currentSpiders) {
                        const sdx = spider.x - centerX
                        const sdy = spider.y - centerY
                        const sDist = Math.sqrt(sdx * sdx + sdy * sdy)
                        if (sDist < 120) {
                            spiderProximity = Math.max(spiderProximity, 1 - sDist / 120)
                        }
                    }
                    if (spiderProximity > 0) {
                        const corrupted = Math.min(1, current + diff.corruptionRate * spiderProximity * dt * 0.1)
                        newMap.set(idx, corrupted)
                    }
                }
            })

            corruptionMapRef.current = newMap

            // Apply CSS filter directly to DOM — smooth every frame, no React round-trip
            paragraphs.forEach(elem => {
                const idx = parseInt(elem.getAttribute('data-paragraph-index'))
                const level = newMap.get(idx) || 0
                if (level > 0.02) {
                    const blur = (level * level) * 9
                    const brightness = Math.max(0.1, 1 - level * 0.82)
                    elem.style.filter = `blur(${blur.toFixed(1)}px) brightness(${brightness.toFixed(2)})`
                } else {
                    elem.style.filter = ''
                }
            })

            // Web SVG map: grows with corruption instantly, but decays ~4x slower than unblur
            const webMap = webCorruptionMapRef.current
            const newWebMap = new Map(webMap)
            paragraphs.forEach(elem => {
                const idx = parseInt(elem.getAttribute('data-paragraph-index'))
                const actual = newMap.get(idx) || 0
                const web = newWebMap.get(idx) || 0
                if (actual > web) {
                    newWebMap.set(idx, actual)
                } else {
                    const decayed = Math.max(0, web - 0.1 * dt)
                    if (decayed === 0) newWebMap.delete(idx)
                    else newWebMap.set(idx, decayed)
                }
            })
            webCorruptionMapRef.current = newWebMap

            // Throttle SVG web update to ~4fps — strands don't need to move every frame
            if (timestamp - lastWebUpdateRef.current > 250) {
                lastWebUpdateRef.current = timestamp
                setCorruptionMap(new Map(newWebMap))
            }

            // Overall corruption %
            let total = 0
            newMap.forEach(v => { total += v })
            const pct = Math.round((total / paragraphs.length) * 100)
            setOverallCorruption(pct)
        }

        animFrameRef.current = requestAnimationFrame(gameLoop)
    }, [])

    // ─── Spawner — gradual trickle up to cap ─────────────────────────────────
    const spawnCapRef = useRef(0)
    const spawnIntervalRef = useRef(null)

    useEffect(() => {
        if (!active) {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
            return
        }

        const diff = DIFFICULTY[difficulty] || DIFFICULTY.normal
        spawnCapRef.current = diff.spiderCount

        // Start with 2 spiders immediately
        const initial = [createSpider(), createSpider()]
        setSpiders(initial)
        spidersRef.current = initial

        lastTimeRef.current = performance.now()
        animFrameRef.current = requestAnimationFrame(gameLoop)

        // Trickle in one spider every ~4s until cap
        spawnIntervalRef.current = setInterval(() => {
            if (!activeRef.current) return
            setSpiders(prev => {
                if (prev.length >= spawnCapRef.current) return prev
                const next = [...prev, createSpider()]
                spidersRef.current = next
                return next
            })
        }, 4000)

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
        }
    }, [active, difficulty, createSpider, gameLoop])

    // When difficulty changes mid-run, update the cap (spawner interval handles the rest)
    useEffect(() => {
        if (!active) return
        const diff = DIFFICULTY[difficulty] || DIFFICULTY.normal
        spawnCapRef.current = diff.spiderCount
    }, [difficulty, active])

    // ─── Actions ───────────────────────────────────────────────────────────────
    const startInfestation = useCallback((config = {}) => {
        const diff = config.difficulty || 'normal'
        const diffConfig = DIFFICULTY[diff] || DIFFICULTY.normal

        pendingTimeoutsRef.current.forEach(clearTimeout)
        pendingTimeoutsRef.current = []
        spiderIdRef.current = 0

        statsRef.current = {
            fuerza: config.fuerza || 0,
            magia: config.magia || 0,
            sabiduria: config.sabiduria || 0,
        }

        // Apply stat modifiers to base torch radius
        let base = diffConfig.torchRadius
        if (statsRef.current.magia >= 20) base = Math.round(base * 1.4)
        baseTorchRadiusRef.current = base
        torchRadiusRef.current = base

        lastAdvanceTimeRef.current = Date.now()

        setDifficulty(diff)
        difficultyRef.current = diff
        setSpiders([])
        setCorruptionMap(new Map())
        corruptionMapRef.current = new Map()
        webCorruptionMapRef.current = new Map()
        setOverallCorruption(0)
        setTorchRadius(base)
        setPhaseResult(null)
        setShowingResult(false)
        setPaused(false)
        pausedRef.current = false
        setActive(true)
    }, [])

    const stopInfestation = useCallback(() => {
        pendingTimeoutsRef.current.forEach(clearTimeout)
        pendingTimeoutsRef.current = []
        setActive(false)
        setShowingResult(false)
        setPhaseResult(null)
        const tid = setTimeout(() => {
            setSpiders([])
            setCorruptionMap(new Map())
            corruptionMapRef.current = new Map()
            webCorruptionMapRef.current = new Map()
            setOverallCorruption(0)
        }, 500)
        pendingTimeoutsRef.current.push(tid)
    }, [])

    const changeDifficulty = useCallback((newDiff) => {
        const diffConfig = DIFFICULTY[newDiff] || DIFFICULTY.normal
        difficultyRef.current = newDiff
        setDifficulty(newDiff)

        // Adjust spider count by adding/removing spiders
        const currentCount = spidersRef.current.length
        const targetCount = diffConfig.spiderCount
        if (targetCount > currentCount) {
            const newSpiders = Array.from({ length: targetCount - currentCount }, () => createSpider())
            setSpiders(prev => [...prev, ...newSpiders])
        } else if (targetCount < currentCount) {
            setSpiders(prev => prev.slice(0, targetCount))
        }

        // Adjust base torch radius for new difficulty (preserve stat bonuses)
        let base = diffConfig.torchRadius
        if (statsRef.current.magia >= 20) base = Math.round(base * 1.4)
        baseTorchRadiusRef.current = base
    }, [createSpider])

    const checkCorruption = useCallback((cleanThreshold) => {
        const cleanPct = 100 - overallCorruption
        // Read from ref for accuracy at call time
        const mapTotal = Array.from(corruptionMapRef.current.values()).reduce((a, v) => a + v, 0)
        const paragraphCount = document.querySelectorAll('[data-paragraph-index]').length
        const actualCleanPct = paragraphCount > 0
            ? Math.round((1 - mapTotal / paragraphCount) * 100)
            : 100

        const survived = actualCleanPct >= cleanThreshold
        console.log(`[Spider] CHECK: ${actualCleanPct}% clean (required ${cleanThreshold}%) → ${survived ? 'SURVIVED' : 'CORRUPTED'}`)

        setPhaseResult(survived ? 'survived' : 'corrupted')
        setShowingResult(true)
        setActive(false)

        const tid = setTimeout(() => {
            setShowingResult(false)
            setSpiders([])
            setCorruptionMap(new Map())
            corruptionMapRef.current = new Map()
            setOverallCorruption(0)
        }, 1800)
        pendingTimeoutsRef.current.push(tid)

        return survived
    }, [overallCorruption])

    const pause = useCallback(() => {
        pausedRef.current = true
        setPaused(true)
    }, [])

    const resume = useCallback(() => {
        pausedRef.current = false
        setPaused(false)
    }, [])

    const notifyAdvance = useCallback(() => {
        lastAdvanceTimeRef.current = Date.now()
    }, [])

    // Returns the minimal config needed to restore infestation after a save/load
    const getSaveState = useCallback(() => {
        if (!activeRef.current) return null
        return {
            difficulty: difficultyRef.current,
            fuerza: statsRef.current.fuerza,
            magia: statsRef.current.magia,
            sabiduria: statsRef.current.sabiduria,
        }
    }, [])

    // ─── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            pendingTimeoutsRef.current.forEach(clearTimeout)
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        }
    }, [])

    // ─── Public API ────────────────────────────────────────────────────────────
    const actions = useMemo(() => ({
        startInfestation,
        stopInfestation,
        changeDifficulty,
        checkCorruption,
        pause,
        resume,
        notifyAdvance,
        getSaveState,
    }), [startInfestation, stopInfestation, changeDifficulty, checkCorruption, pause, resume, notifyAdvance, getSaveState])

    const state = useMemo(() => ({
        active: active || showingResult,
        infesting: active,
        difficulty,
        spiders,
        torchPosition,
        torchRadius,
        corruptionMap,
        overallCorruption,
        paused,
        phaseResult,
        showingResult,
        stats: statsRef.current,
    }), [active, showingResult, difficulty, spiders, torchPosition, torchRadius, corruptionMap, overallCorruption, paused, phaseResult])

    return useMemo(() => ({ state, actions }), [state, actions])
}
