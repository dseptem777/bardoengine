import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

/**
 * useSpiderInfestation — Continuous Non-Blocking Infestation
 * 
 * Runs across multiple story beats. Choices work normally.
 * Spiders crawl, webs spit on text. Kill count accumulates.
 * At the end, SPIDER_CHECK evaluates kills vs threshold.
 * 
 * Tags:
 *   SPIDER_START: difficulty=normal, fuerza={fuerza}...
 *   SPIDER_STOP
 *   SPIDER_CHECK: threshold (+ gate choice in Ink)
 */

const DIFFICULTY = {
    slow: { interval: 3000, speed: 35, webSpitInterval: 6000 },
    normal: { interval: 1800, speed: 50, webSpitInterval: 3500 },
    fast: { interval: 1200, speed: 70, webSpitInterval: 2200 },
    extreme: { interval: 700, speed: 90, webSpitInterval: 1200 },
}

let _spiderId = 0

export function useSpiderInfestation() {
    // State
    const [active, setActive] = useState(false)
    const [difficulty, setDifficulty] = useState('normal')
    const [spiders, setSpiders] = useState([])
    const [webs, setWebs] = useState([])
    const [killCount, setKillCount] = useState(0)
    const [threshold, setThreshold] = useState(0)
    const [phaseResult, setPhaseResult] = useState(null)
    const [showingResult, setShowingResult] = useState(false)

    // Refs
    const activeRef = useRef(false)
    const spidersRef = useRef([])
    const websRef = useRef([])
    const difficultyRef = useRef('normal')
    const killCountRef = useRef(0)
    const spawnTimerRef = useRef(null)
    const webSpitTimerRef = useRef(null)
    const animFrameRef = useRef(null)
    const lastTimeRef = useRef(0)
    const statsRef = useRef({ fuerza: 0, magia: 0, sabiduria: 0 })

    useEffect(() => { activeRef.current = active }, [active])
    useEffect(() => { spidersRef.current = spiders }, [spiders])
    useEffect(() => { websRef.current = webs }, [webs])
    useEffect(() => { difficultyRef.current = difficulty }, [difficulty])
    useEffect(() => { killCountRef.current = killCount }, [killCount])

    // ============================
    // Spider Factory
    // ============================
    const createSpider = useCallback(() => {
        _spiderId++
        const vw = window.innerWidth
        const vh = window.innerHeight

        const edge = Math.random()
        let x, y
        if (edge < 0.4) {
            x = Math.random() * vw; y = vh + 20
        } else if (edge < 0.6) {
            x = Math.random() * vw; y = -20
        } else if (edge < 0.8) {
            x = -20; y = Math.random() * vh
        } else {
            x = vw + 20; y = Math.random() * vh
        }

        const sizeRoll = Math.random()
        const size = sizeRoll < 0.4 ? 'small' : sizeRoll < 0.8 ? 'medium' : 'large'

        return {
            id: _spiderId,
            x, y,
            targetX: vw / 2,
            targetY: vh / 2,
            targetType: null,
            targetIndex: null,
            size,
            alive: true,
            dying: false,
            wobblePhase: Math.random() * Math.PI * 2,
            speed: DIFFICULTY[difficultyRef.current]?.speed || 50,
            reachedTarget: false,
            spawnTime: Date.now(),
        }
    }, [])

    // ============================
    // Target Assignment
    // ============================
    const assignTarget = useCallback((spider) => {
        const paragraphs = document.querySelectorAll('[data-paragraph-index]')
        if (paragraphs.length > 0) {
            const target = paragraphs[Math.floor(Math.random() * paragraphs.length)]
            const rect = target.getBoundingClientRect()
            const idx = parseInt(target.getAttribute('data-paragraph-index'))
            spider.targetType = 'paragraph'
            spider.targetIndex = idx
            spider.targetX = rect.left + Math.random() * rect.width
            spider.targetY = rect.top + Math.random() * rect.height * 0.6
        }
    }, [])

    // ============================
    // Web Spit
    // ============================
    const spitWeb = useCallback(() => {
        if (!activeRef.current) return
        const paragraphs = document.querySelectorAll('[data-paragraph-index]')
        if (paragraphs.length === 0) return

        const existingTargets = new Set(websRef.current.map(w => w.targetIndex))
        const available = Array.from(paragraphs).filter((_, i) => !existingTargets.has(i))
        if (available.length === 0) return

        const target = available[Math.floor(Math.random() * available.length)]
        const rect = target.getBoundingClientRect()
        const idx = parseInt(target.getAttribute('data-paragraph-index'))

        setWebs(prev => [...prev, {
            id: `webspit-${Date.now()}-${idx}`,
            targetType: 'paragraph',
            targetIndex: idx,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        }])
    }, [])

    // ============================
    // Game Loop
    // ============================
    const gameLoop = useCallback((timestamp) => {
        if (!activeRef.current) return

        const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1)
        lastTimeRef.current = timestamp

        const magicSlowFactor = statsRef.current.magia >= 20 ? 0.6 : 1.0

        let updated = false
        const currentSpiders = [...spidersRef.current]

        for (const spider of currentSpiders) {
            if (!spider.alive) continue

            if (!spider.targetType) {
                assignTarget(spider)
            }

            const dx = spider.targetX - spider.x
            const dy = spider.targetY - spider.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist > 5 && !spider.reachedTarget) {
                const wobble = Math.sin(timestamp / 300 + spider.wobblePhase) * 30
                const moveSpeed = spider.speed * magicSlowFactor * dt
                spider.x += (dx / dist) * moveSpeed + wobble * dt
                spider.y += (dy / dist) * moveSpeed
                updated = true
            } else if (!spider.reachedTarget) {
                spider.reachedTarget = true
                updated = true

                setTimeout(() => {
                    if (!activeRef.current) return
                    setSpiders(prev => prev.map(s => {
                        if (s.id === spider.id && s.alive) {
                            return { ...s, targetType: null, targetIndex: null, reachedTarget: false }
                        }
                        return s
                    }))
                }, 1000 + Math.random() * 1500)
            }
        }

        if (updated) setSpiders([...currentSpiders])
        animFrameRef.current = requestAnimationFrame(gameLoop)
    }, [assignTarget])

    // ============================
    // Spawner + Web Spit
    // ============================
    useEffect(() => {
        if (!active) {
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
            if (webSpitTimerRef.current) clearInterval(webSpitTimerRef.current)
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            return
        }

        const diff = DIFFICULTY[difficulty] || DIFFICULTY.normal

        lastTimeRef.current = performance.now()
        animFrameRef.current = requestAnimationFrame(gameLoop)

        spawnTimerRef.current = setInterval(() => {
            if (!activeRef.current) return
            setSpiders(prev => [...prev, createSpider()])
        }, diff.interval)

        webSpitTimerRef.current = setInterval(() => {
            spitWeb()
        }, diff.webSpitInterval)

        return () => {
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
            if (webSpitTimerRef.current) clearInterval(webSpitTimerRef.current)
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        }
    }, [active, difficulty, createSpider, gameLoop, spitWeb])

    // ============================
    // Actions
    // ============================

    const startInfestation = useCallback((config = {}) => {
        const diff = config.difficulty || 'normal'
        console.log(`[Spider] START: difficulty=${diff}`)

        _spiderId = 0
        setDifficulty(diff)
        setSpiders([])
        setWebs([])
        setKillCount(0)
        killCountRef.current = 0
        setThreshold(0)
        setPhaseResult(null)
        setShowingResult(false)
        statsRef.current = {
            fuerza: config.fuerza || 0,
            magia: config.magia || 0,
            sabiduria: config.sabiduria || 0,
        }
        setActive(true)
    }, [])

    const changeDifficulty = useCallback((newDiff) => {
        console.log(`[Spider] DIFFICULTY change: ${newDiff}`)
        setDifficulty(newDiff)
    }, [])

    const stopInfestation = useCallback(() => {
        console.log(`[Spider] STOP. Final kills: ${killCountRef.current}`)
        setActive(false)
        setShowingResult(false)
        setPhaseResult(null)
        setTimeout(() => {
            setSpiders([])
            setWebs([])
        }, 500)
    }, [])

    const checkKills = useCallback((thresh) => {
        const survived = killCountRef.current >= thresh
        console.log(`[Spider] CHECK: ${killCountRef.current}/${thresh} → ${survived ? 'SURVIVED' : 'FALLEN'}`)
        setThreshold(thresh)
        setPhaseResult(survived ? 'survived' : 'fallen')
        setShowingResult(true)

        // Stop infestation
        setActive(false)

        // Clear result after flash
        setTimeout(() => {
            setShowingResult(false)
            setSpiders([])
            setWebs([])
        }, 1800)

        return survived
    }, [])

    const squashSpider = useCallback((spiderId) => {
        setSpiders(prev => prev.map(s => {
            if (s.id === spiderId && s.alive) return { ...s, alive: false, dying: true }
            return s
        }))
        setKillCount(prev => { killCountRef.current = prev + 1; return prev + 1 })
        setTimeout(() => { setSpiders(prev => prev.filter(s => s.id !== spiderId)) }, 300)
    }, [])

    const clearWeb = useCallback((webId) => {
        setWebs(prev => prev.filter(w => w.id !== webId))
    }, [])

    const getKillCount = useCallback(() => killCountRef.current, [])

    // ============================
    // Public API
    // ============================

    const actions = useMemo(() => ({
        startInfestation,
        stopInfestation,
        changeDifficulty,
        checkKills,
        squashSpider,
        clearWeb,
        getKillCount,
    }), [startInfestation, stopInfestation, changeDifficulty, checkKills, squashSpider, clearWeb, getKillCount])

    const state = useMemo(() => ({
        active: active || showingResult,   // visible
        infesting: active,                 // game loop running
        difficulty,
        spiders,
        webs,
        killCount,
        threshold,
        phaseResult,
        showingResult,
        stats: statsRef.current,
    }), [active, showingResult, difficulty, spiders, webs, killCount, threshold, phaseResult])

    return { state, actions }
}
