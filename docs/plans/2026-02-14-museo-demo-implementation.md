# Museo Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone tech demo ("El Ocaso en el Museo del Sur") showcasing scroll friction, 3-phase boss fight, and persistent visual damage — following the existing tech demo pattern (spider_demo, apnea, vampiro).

**Architecture:** Three new hooks (`useScrollFriction`, `useBossController`, `useVisualDamage`) wired through `useTagProcessor` and `useBardoEngine`. Two new overlay components. One new Ink story + config. All hooks follow established patterns: `useHeavyCursor` for rAF loops, `useWillpowerSystem` for state machines, `useSaveSystem` for localStorage persistence.

**Tech Stack:** React hooks (TS), Ink tags, Tailwind CSS, Vitest + RTL for tests, framer-motion for animations.

---

## Task 1: `useVisualDamage` hook

The simplest hook — localStorage persistence with CSS filter. Good foundation to build on.

**Files:**
- Create: `src/hooks/useVisualDamage.ts`
- Test: `src/hooks/__tests__/useVisualDamage.test.ts`

**Step 1: Write the failing test**

Create `src/hooks/__tests__/useVisualDamage.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useVisualDamage } from '../useVisualDamage'

describe('useVisualDamage', () => {
    beforeEach(() => {
        localStorage.clear()
        // Reset any filters on root
        document.documentElement.style.filter = ''
    })

    afterEach(() => {
        document.documentElement.style.filter = ''
    })

    it('should start with 0 deaths and no grayscale', () => {
        const { result } = renderHook(() => useVisualDamage('test_story'))
        expect(result.current.deathCount).toBe(0)
        expect(result.current.currentGrayscale).toBe(0)
    })

    it('should increment death count and apply grayscale on recordDeath', () => {
        const { result } = renderHook(() => useVisualDamage('test_story'))

        act(() => { result.current.recordDeath() })

        expect(result.current.deathCount).toBe(1)
        expect(result.current.currentGrayscale).toBeCloseTo(0.15)
        expect(document.documentElement.style.filter).toContain('grayscale')
    })

    it('should cap grayscale at 0.6', () => {
        const { result } = renderHook(() => useVisualDamage('test_story'))

        act(() => {
            for (let i = 0; i < 10; i++) result.current.recordDeath()
        })

        expect(result.current.currentGrayscale).toBeLessThanOrEqual(0.6)
    })

    it('should persist across hook re-renders', () => {
        const { result, rerender } = renderHook(() => useVisualDamage('test_story'))

        act(() => { result.current.recordDeath() })
        rerender()

        expect(result.current.deathCount).toBe(1)
    })

    it('should load persisted deaths from localStorage', () => {
        localStorage.setItem('bardoengine_visual_damage_test_story', JSON.stringify({ deathCount: 3 }))

        const { result } = renderHook(() => useVisualDamage('test_story'))
        expect(result.current.deathCount).toBe(3)
        expect(result.current.currentGrayscale).toBeCloseTo(0.45)
    })

    it('should clear everything on resetDamage', () => {
        const { result } = renderHook(() => useVisualDamage('test_story'))

        act(() => { result.current.recordDeath() })
        act(() => { result.current.resetDamage() })

        expect(result.current.deathCount).toBe(0)
        expect(result.current.currentGrayscale).toBe(0)
        expect(document.documentElement.style.filter).toBe('')
    })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useVisualDamage.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

Create `src/hooks/useVisualDamage.ts`:

```ts
import { useState, useCallback, useEffect } from 'react'

interface VisualDamageState {
    deathCount: number
    currentGrayscale: number
}

const MAX_GRAYSCALE = 0.6
const GRAYSCALE_PER_DEATH = 0.15

function getStorageKey(storyId: string): string {
    return `bardoengine_visual_damage_${storyId}`
}

function loadFromStorage(storyId: string): number {
    try {
        const raw = localStorage.getItem(getStorageKey(storyId))
        if (raw) {
            const data = JSON.parse(raw)
            return data.deathCount || 0
        }
    } catch (e) {
        console.warn('[VisualDamage] Failed to load from localStorage:', e)
    }
    return 0
}

function saveToStorage(storyId: string, deathCount: number): void {
    try {
        localStorage.setItem(getStorageKey(storyId), JSON.stringify({ deathCount }))
    } catch (e) {
        console.warn('[VisualDamage] Failed to save to localStorage:', e)
    }
}

function calcGrayscale(deathCount: number): number {
    return Math.min(deathCount * GRAYSCALE_PER_DEATH, MAX_GRAYSCALE)
}

function applyFilter(grayscale: number): void {
    if (grayscale > 0) {
        document.documentElement.style.filter = `grayscale(${grayscale})`
    } else {
        document.documentElement.style.filter = ''
    }
}

export function useVisualDamage(storyId: string) {
    const [deathCount, setDeathCount] = useState(() => loadFromStorage(storyId))
    const currentGrayscale = calcGrayscale(deathCount)

    // Apply filter on mount and when deathCount changes
    useEffect(() => {
        applyFilter(currentGrayscale)
        return () => { applyFilter(0) }
    }, [currentGrayscale])

    const recordDeath = useCallback(() => {
        setDeathCount(prev => {
            const next = prev + 1
            saveToStorage(storyId, next)
            return next
        })
    }, [storyId])

    const resetDamage = useCallback(() => {
        setDeathCount(0)
        try {
            localStorage.removeItem(getStorageKey(storyId))
        } catch (e) { /* ignore */ }
        applyFilter(0)
    }, [storyId])

    return { deathCount, currentGrayscale, recordDeath, resetDamage }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useVisualDamage.test.ts`
Expected: All 6 tests PASS

**Step 5: Commit**

```bash
git add src/hooks/useVisualDamage.ts src/hooks/__tests__/useVisualDamage.test.ts
git commit -m "feat: add useVisualDamage hook with persistent grayscale on death"
```

---

## Task 2: `useScrollFriction` hook

Intercepts wheel events and applies resistance formula. Follows `useHeavyCursor` rAF pattern.

**Files:**
- Create: `src/hooks/useScrollFriction.ts`
- Test: `src/hooks/__tests__/useScrollFriction.test.ts`

**Step 1: Write the failing test**

Create `src/hooks/__tests__/useScrollFriction.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrollFriction } from '../useScrollFriction'

describe('useScrollFriction', () => {
    let mockScrollContainer: HTMLDivElement

    beforeEach(() => {
        mockScrollContainer = document.createElement('div')
        // Give it scrollable dimensions
        Object.defineProperties(mockScrollContainer, {
            scrollHeight: { value: 2000, configurable: true },
            clientHeight: { value: 500, configurable: true },
            scrollTop: { value: 0, writable: true, configurable: true },
        })
        document.body.appendChild(mockScrollContainer)
    })

    afterEach(() => {
        document.body.removeChild(mockScrollContainer)
    })

    it('should initialize as inactive', () => {
        const ref = { current: mockScrollContainer }
        const { result } = renderHook(() =>
            useScrollFriction({ scrollContainerRef: ref, enabled: false, arrebatadosCount: 0, fuerza: 10 })
        )
        expect(result.current.isActive).toBe(false)
        expect(result.current.currentFriction).toBe(0)
    })

    it('should calculate friction based on arrebatados and fuerza', () => {
        const ref = { current: mockScrollContainer }
        const { result } = renderHook(() =>
            useScrollFriction({ scrollContainerRef: ref, enabled: true, arrebatadosCount: 5, fuerza: 10 })
        )
        // friction = arrebatados / (fuerza + 10) = 5/20 = 0.25
        expect(result.current.isActive).toBe(true)
        expect(result.current.currentFriction).toBeCloseTo(0.25)
    })

    it('should cap friction at 1.0 when arrebatados >= fuerza + 10', () => {
        const ref = { current: mockScrollContainer }
        const { result } = renderHook(() =>
            useScrollFriction({ scrollContainerRef: ref, enabled: true, arrebatadosCount: 25, fuerza: 10 })
        )
        expect(result.current.currentFriction).toBe(1)
    })

    it('should intercept wheel events and reduce scroll delta', () => {
        const ref = { current: mockScrollContainer }
        renderHook(() =>
            useScrollFriction({ scrollContainerRef: ref, enabled: true, arrebatadosCount: 10, fuerza: 10 })
        )

        // Simulate wheel event — friction = 10/20 = 0.5, so delta should be halved
        const wheelEvent = new WheelEvent('wheel', { deltaY: 100, cancelable: true })
        act(() => {
            mockScrollContainer.dispatchEvent(wheelEvent)
        })

        // scrollTop should be set to ~50 (100 * (1 - 0.5))
        expect(mockScrollContainer.scrollTop).toBeCloseTo(50, -1)
    })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useScrollFriction.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

Create `src/hooks/useScrollFriction.ts`:

```ts
import { useEffect, useCallback, useMemo } from 'react'

interface ScrollFrictionConfig {
    scrollContainerRef: React.RefObject<HTMLElement | null>
    enabled: boolean
    arrebatadosCount: number
    fuerza: number
}

// Glitch text fragments for visual arrebatado nodes
const ARREBATADO_TEXTS = [
    'ORO... NECESITAMOS MÁS ORO...',
    'ESTA TIERRA ES NUESTRA...',
    'NO PUEDEN ESCAPAR DE NOSOTROS...',
    'VENIMOS POR LO QUE NOS PERTENECE...',
    'EL TIEMPO NO NOS DETIENE...',
    'PAGUEN SU DEUDA...',
    'SOMOS LEGIÓN...',
    'LA CODICIA ES ETERNA...',
]

export function useScrollFriction({
    scrollContainerRef,
    enabled,
    arrebatadosCount,
    fuerza
}: ScrollFrictionConfig) {
    const currentFriction = useMemo(() => {
        if (!enabled || arrebatadosCount <= 0) return 0
        return Math.min(arrebatadosCount / (fuerza + 10), 1)
    }, [enabled, arrebatadosCount, fuerza])

    // Intercept wheel events
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!enabled || !container || currentFriction <= 0) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()

            if (currentFriction >= 1) return // fully frozen

            const reducedDelta = e.deltaY * (1 - currentFriction)
            container.scrollTop += reducedDelta
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, [scrollContainerRef, enabled, currentFriction])

    // Generate arrebatado visual elements data
    const arrebatadosElements = useMemo(() => {
        if (!enabled || arrebatadosCount <= 0) return []
        return Array.from({ length: arrebatadosCount }, (_, i) => ({
            id: `arrebatado-${i}`,
            text: ARREBATADO_TEXTS[i % ARREBATADO_TEXTS.length],
            paragraphIndex: i % 5, // distribute across paragraphs
        }))
    }, [enabled, arrebatadosCount])

    return {
        isActive: enabled && arrebatadosCount > 0,
        currentFriction,
        arrebatadosElements,
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useScrollFriction.test.ts`
Expected: All 4 tests PASS

**Step 5: Commit**

```bash
git add src/hooks/useScrollFriction.ts src/hooks/__tests__/useScrollFriction.test.ts
git commit -m "feat: add useScrollFriction hook with resistance formula and wheel interception"
```

---

## Task 3: `useBossController` hook

State machine for the 3-phase boss fight. Follows `useWillpowerSystem` pattern.

**Files:**
- Create: `src/hooks/useBossController.ts`
- Test: `src/hooks/__tests__/useBossController.test.ts`

**Step 1: Write the failing test**

Create `src/hooks/__tests__/useBossController.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBossController } from '../useBossController'

describe('useBossController', () => {
    it('should start in idle state', () => {
        const { result } = renderHook(() => useBossController())
        expect(result.current.state.phase).toBe('idle')
        expect(result.current.state.isActive).toBe(false)
        expect(result.current.state.bossHp).toBe(0)
    })

    it('should activate on startBoss', () => {
        const { result } = renderHook(() => useBossController())

        act(() => {
            result.current.actions.startBoss({ name: 'amaru', hp: 100 })
        })

        expect(result.current.state.isActive).toBe(true)
        expect(result.current.state.bossHp).toBe(100)
        expect(result.current.state.bossName).toBe('amaru')
        expect(result.current.state.phase).toBe('active')
    })

    it('should transition phases', () => {
        const { result } = renderHook(() => useBossController())

        act(() => { result.current.actions.startBoss({ name: 'amaru', hp: 100 }) })
        act(() => { result.current.actions.setPhase(1) })

        expect(result.current.state.phase).toBe('phase_1')

        act(() => { result.current.actions.setPhase(2) })
        expect(result.current.state.phase).toBe('phase_2')

        act(() => { result.current.actions.setPhase(3) })
        expect(result.current.state.phase).toBe('phase_3')
    })

    it('should apply damage and track HP', () => {
        const { result } = renderHook(() => useBossController())

        act(() => { result.current.actions.startBoss({ name: 'amaru', hp: 100 }) })
        act(() => { result.current.actions.damage(30) })

        expect(result.current.state.bossHp).toBe(70)
    })

    it('should transition to defeated when HP reaches 0', () => {
        const { result } = renderHook(() => useBossController())

        act(() => { result.current.actions.startBoss({ name: 'amaru', hp: 50 }) })
        act(() => { result.current.actions.damage(60) })

        expect(result.current.state.bossHp).toBe(0)
        expect(result.current.state.phase).toBe('defeated')
    })

    it('should check boss status and return defeated boolean', () => {
        const { result } = renderHook(() => useBossController())

        act(() => { result.current.actions.startBoss({ name: 'amaru', hp: 100 }) })

        expect(result.current.actions.checkBoss()).toBe(false)

        act(() => { result.current.actions.damage(100) })

        expect(result.current.actions.checkBoss()).toBe(true)
    })

    it('should stop and reset on stopBoss', () => {
        const { result } = renderHook(() => useBossController())

        act(() => { result.current.actions.startBoss({ name: 'amaru', hp: 100 }) })
        act(() => { result.current.actions.setPhase(2) })
        act(() => { result.current.actions.stopBoss() })

        expect(result.current.state.isActive).toBe(false)
        expect(result.current.state.phase).toBe('idle')
    })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useBossController.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

Create `src/hooks/useBossController.ts`:

```ts
import { useState, useCallback, useRef, useMemo } from 'react'

export type BossPhase = 'idle' | 'active' | 'phase_1' | 'phase_2' | 'phase_3' | 'defeated' | 'player_dead'

export interface BossState {
    isActive: boolean
    phase: BossPhase
    bossHp: number
    bossMaxHp: number
    bossName: string
}

export interface BossActions {
    startBoss: (config: { name: string; hp: number }) => void
    stopBoss: () => void
    setPhase: (phase: number) => void
    damage: (amount: number) => void
    checkBoss: () => boolean
    playerDied: () => void
}

const DEFAULT_STATE: BossState = {
    isActive: false,
    phase: 'idle',
    bossHp: 0,
    bossMaxHp: 0,
    bossName: '',
}

export function useBossController(): { state: BossState; actions: BossActions } {
    const [state, setState] = useState<BossState>(DEFAULT_STATE)
    const hpRef = useRef(0)

    const startBoss = useCallback((config: { name: string; hp: number }) => {
        console.log('[BossController] Starting boss:', config.name, 'HP:', config.hp)
        hpRef.current = config.hp
        setState({
            isActive: true,
            phase: 'active',
            bossHp: config.hp,
            bossMaxHp: config.hp,
            bossName: config.name,
        })
    }, [])

    const stopBoss = useCallback(() => {
        console.log('[BossController] Stopping')
        hpRef.current = 0
        setState(DEFAULT_STATE)
    }, [])

    const setPhase = useCallback((phaseNum: number) => {
        const phaseMap: Record<number, BossPhase> = {
            1: 'phase_1',
            2: 'phase_2',
            3: 'phase_3',
        }
        const phase = phaseMap[phaseNum] || 'active'
        console.log('[BossController] Phase:', phase)
        setState(prev => ({ ...prev, phase }))
    }, [])

    const damage = useCallback((amount: number) => {
        setState(prev => {
            const newHp = Math.max(0, prev.bossHp - amount)
            hpRef.current = newHp
            console.log(`[BossController] Damage: ${amount}, HP: ${prev.bossHp} → ${newHp}`)
            if (newHp <= 0) {
                return { ...prev, bossHp: 0, phase: 'defeated' }
            }
            return { ...prev, bossHp: newHp }
        })
    }, [])

    const checkBoss = useCallback((): boolean => {
        const defeated = hpRef.current <= 0
        console.log(`[BossController] Check: HP=${hpRef.current}, defeated=${defeated}`)
        return defeated
    }, [])

    const playerDied = useCallback(() => {
        console.log('[BossController] Player died')
        setState(prev => ({ ...prev, phase: 'player_dead' }))
    }, [])

    const actions = useMemo(() => ({
        startBoss, stopBoss, setPhase, damage, checkBoss, playerDied
    }), [startBoss, stopBoss, setPhase, damage, checkBoss, playerDied])

    return { state, actions }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useBossController.test.ts`
Expected: All 7 tests PASS

**Step 5: Commit**

```bash
git add src/hooks/useBossController.ts src/hooks/__tests__/useBossController.test.ts
git commit -m "feat: add useBossController hook with state machine and HP tracking"
```

---

## Task 4: `BossHPIndicator` component

Fixed indicator showing boss name, HP bar, and current phase.

**Files:**
- Create: `src/components/BossHPIndicator.jsx`

**Step 1: Write the component**

Create `src/components/BossHPIndicator.jsx`:

```jsx
import { motion, AnimatePresence } from 'framer-motion'

const PHASE_LABELS = {
    active: 'CONFRONTACIÓN',
    phase_1: 'FASE I: PASILLO INFINITO',
    phase_2: 'FASE II: MANOS DE SOMBRA',
    phase_3: 'FASE III: COLAPSO',
    defeated: 'DERROTADO',
    player_dead: 'CAÍDO',
}

export default function BossHPIndicator({ bossName, bossHp, bossMaxHp, phase, isActive }) {
    if (!isActive) return null

    const hpPercent = bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0
    const phaseLabel = PHASE_LABELS[phase] || ''
    const isDefeated = phase === 'defeated'

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="fixed top-0 left-0 right-0 z-[90] pointer-events-none"
                >
                    <div className="mx-auto max-w-xl px-4 pt-2">
                        <div className="bg-black/80 backdrop-blur-md border border-red-900/50 rounded-b-lg px-4 py-2">
                            {/* Boss Name */}
                            <div className="flex justify-between items-center mb-1">
                                <span
                                    className="font-mono text-red-400 text-sm tracking-widest uppercase"
                                    style={{ fontFamily: 'var(--bardo-font-mono)' }}
                                >
                                    {bossName}
                                </span>
                                <span className="font-mono text-red-400/60 text-xs">
                                    {phaseLabel}
                                </span>
                            </div>

                            {/* HP Bar */}
                            <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-red-900/30">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        background: isDefeated
                                            ? '#374151'
                                            : `linear-gradient(90deg, #991b1b, #dc2626, #ef4444)`,
                                    }}
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${hpPercent}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                            </div>

                            {/* HP Text */}
                            <div className="text-right mt-0.5">
                                <span className="font-mono text-red-400/40 text-[10px]">
                                    {Math.ceil(bossHp)} / {bossMaxHp}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
```

**Step 2: Commit**

```bash
git add src/components/BossHPIndicator.jsx
git commit -m "feat: add BossHPIndicator component with animated HP bar"
```

---

## Task 5: `ScrollGrabOverlay` component

Shadow hands overlay for Phase 2 of the boss fight.

**Files:**
- Create: `src/components/ScrollGrabOverlay.jsx`

**Step 1: Write the component**

Create `src/components/ScrollGrabOverlay.jsx`:

```jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ScrollGrabOverlay — Shadow hands that emerge from screen edges.
 * Player must shake mouse on X axis to keep them at bay.
 * If mouse velocity drops below threshold for 3 seconds, scroll is locked.
 *
 * Props:
 *   active: boolean — whether the overlay is shown
 *   onScrollLock: () => void — called when hands succeed in locking scroll
 *   onScrollUnlock: () => void — called when player shakes free
 *   onPhaseComplete: () => void — called when player maintains shake for N seconds
 *   shakeThreshold: number — minimum X velocity to count as "shaking" (default 200)
 *   lockDelay: number — ms of low velocity before lock (default 3000)
 *   winDuration: number — ms of sustained shaking to win (default 5000)
 */
export default function ScrollGrabOverlay({
    active,
    onScrollLock,
    onScrollUnlock,
    onPhaseComplete,
    shakeThreshold = 200,
    lockDelay = 3000,
    winDuration = 5000,
}) {
    const [isLocked, setIsLocked] = useState(false)
    const [shakeProgress, setShakeProgress] = useState(0) // 0-100
    const lastXRef = useRef(0)
    const lastTimeRef = useRef(0)
    const velocityRef = useRef(0)
    const calmStartRef = useRef(null) // when mouse stopped shaking
    const shakeStartRef = useRef(null) // when sustained shaking began
    const animFrameRef = useRef(null)

    useEffect(() => {
        if (!active) {
            setIsLocked(false)
            setShakeProgress(0)
            return
        }

        const handleMouseMove = (e) => {
            const now = performance.now()
            const dt = now - (lastTimeRef.current || now)
            lastTimeRef.current = now

            if (dt > 0) {
                const dx = Math.abs(e.clientX - lastXRef.current)
                velocityRef.current = (dx / dt) * 1000 // px/s
            }
            lastXRef.current = e.clientX
        }

        const tick = () => {
            const now = performance.now()
            const isShaking = velocityRef.current > shakeThreshold

            if (isShaking) {
                calmStartRef.current = null

                // Track sustained shaking for win condition
                if (!shakeStartRef.current) shakeStartRef.current = now
                const shakeDuration = now - shakeStartRef.current
                setShakeProgress(Math.min((shakeDuration / winDuration) * 100, 100))

                if (shakeDuration >= winDuration) {
                    onPhaseComplete?.()
                    return // stop ticking
                }

                if (isLocked) {
                    setIsLocked(false)
                    onScrollUnlock?.()
                }
            } else {
                shakeStartRef.current = null
                setShakeProgress(0)

                // Track calm time for lock
                if (!calmStartRef.current) calmStartRef.current = now
                const calmDuration = now - calmStartRef.current

                if (calmDuration >= lockDelay && !isLocked) {
                    setIsLocked(true)
                    onScrollLock?.()
                }
            }

            // Decay velocity when no mouse movement
            velocityRef.current *= 0.95

            animFrameRef.current = requestAnimationFrame(tick)
        }

        window.addEventListener('mousemove', handleMouseMove)
        animFrameRef.current = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            calmStartRef.current = null
            shakeStartRef.current = null
        }
    }, [active, shakeThreshold, lockDelay, winDuration, isLocked, onScrollLock, onScrollUnlock, onPhaseComplete])

    if (!active) return null

    return (
        <div className="fixed inset-0 z-[80] pointer-events-none">
            {/* Left hand */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-32"
                initial={{ x: -128 }}
                animate={{ x: isLocked ? 40 : 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)',
                    boxShadow: isLocked ? '20px 0 60px rgba(80,0,0,0.6)' : '10px 0 30px rgba(0,0,0,0.4)',
                }}
            >
                {/* Hand silhouette shapes */}
                <div className="absolute right-0 top-1/4 w-16 h-32 opacity-60">
                    <div className="w-3 h-20 bg-gray-900 rounded-r-full absolute right-0 top-0 rotate-[15deg]" />
                    <div className="w-3 h-24 bg-gray-900 rounded-r-full absolute right-3 top-[-8px] rotate-[8deg]" />
                    <div className="w-3 h-22 bg-gray-900 rounded-r-full absolute right-6 top-0 rotate-[3deg]" />
                    <div className="w-3 h-18 bg-gray-900 rounded-r-full absolute right-9 top-2 rotate-[-5deg]" />
                    <div className="w-4 h-12 bg-gray-900 rounded-r-full absolute right-11 top-8 rotate-[-15deg]" />
                </div>
            </motion.div>

            {/* Right hand */}
            <motion.div
                className="absolute right-0 top-0 bottom-0 w-32"
                initial={{ x: 128 }}
                animate={{ x: isLocked ? -40 : 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{
                    background: 'linear-gradient(to left, rgba(0,0,0,0.8), transparent)',
                    boxShadow: isLocked ? '-20px 0 60px rgba(80,0,0,0.6)' : '-10px 0 30px rgba(0,0,0,0.4)',
                }}
            >
                <div className="absolute left-0 top-1/3 w-16 h-32 opacity-60">
                    <div className="w-3 h-20 bg-gray-900 rounded-l-full absolute left-0 top-0 rotate-[-15deg]" />
                    <div className="w-3 h-24 bg-gray-900 rounded-l-full absolute left-3 top-[-8px] rotate-[-8deg]" />
                    <div className="w-3 h-22 bg-gray-900 rounded-l-full absolute left-6 top-0 rotate-[-3deg]" />
                    <div className="w-3 h-18 bg-gray-900 rounded-l-full absolute left-9 top-2 rotate-[5deg]" />
                    <div className="w-4 h-12 bg-gray-900 rounded-l-full absolute left-11 top-8 rotate-[15deg]" />
                </div>
            </motion.div>

            {/* Lock indicator */}
            {isLocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <p className="font-mono text-red-500 text-lg animate-pulse tracking-widest">
                        ¡SACUDÍ EL MOUSE PARA LIBERARTE!
                    </p>
                </motion.div>
            )}

            {/* Shake progress bar (bottom) */}
            {shakeProgress > 0 && !isLocked && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${shakeProgress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>
                    <p className="text-center font-mono text-green-400/60 text-xs mt-1">
                        RESISTIENDO...
                    </p>
                </div>
            )}
        </div>
    )
}
```

**Step 2: Commit**

```bash
git add src/components/ScrollGrabOverlay.jsx
git commit -m "feat: add ScrollGrabOverlay component with mouse-shake detection"
```

---

## Task 6: Wire tags into `useTagProcessor`

Add parsing for `ARREBATADOS_*`, `BOSS_*`, and `VISUAL_DAMAGE` tags.

**Files:**
- Modify: `src/hooks/useTagProcessor.ts`

**Step 1: Add new callback types to the interface**

In `src/hooks/useTagProcessor.ts`, add these callbacks to `TagProcessorOptions`:

```ts
// After the existing spider callbacks in the interface:
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
```

**Step 2: Add tag parsing in `processTags`**

Add a new section between the SPIDER block and the EXISTING TAG PROCESSING block. Use the same parameter parsing pattern as SPIDER_START for ARREBATADOS_START:

```ts
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
```

**Step 3: Add the new callbacks to the destructuring and dependency array**

Add to the function parameter destructuring and the `processTags` dependency array.

**Step 4: Run existing tests to verify nothing broke**

Run: `npx vitest run src/hooks/__tests__/`
Expected: All existing hook tests PASS

**Step 5: Commit**

```bash
git add src/hooks/useTagProcessor.ts
git commit -m "feat: add tag parsing for ARREBATADOS, BOSS, and VISUAL_DAMAGE systems"
```

---

## Task 7: Wire hooks into `useBardoEngine`

Connect the 3 new hooks to the engine orchestrator.

**Files:**
- Modify: `src/hooks/useBardoEngine.ts`

**Step 1: Add imports**

At the top of `useBardoEngine.ts`, add:

```ts
import { useScrollFriction } from './useScrollFriction'
import { useBossController } from './useBossController'
import { useVisualDamage } from './useVisualDamage'
```

**Step 2: Add scroll container ref**

Add a ref that Player will pass back. For now, create it in the engine and expose it:

```ts
// After the storyState destructuring:
const scrollContainerRef = useRef<HTMLElement | null>(null)
```

**Step 3: Initialize the 3 new hooks**

Add sections after the spider infestation block:

```ts
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

// ==================
// Visual Damage System (Persistent)
// ==================
const visualDamage = useVisualDamage(storyId)

const handleVisualDamage = useCallback((config: { grayscale?: number, reset?: boolean }) => {
    if (config.reset) {
        visualDamage.resetDamage()
    } else {
        visualDamage.recordDeath()
    }
}, [visualDamage])
```

**Step 4: Pass new callbacks to useTagProcessor**

In the `useTagProcessor` call, add the new callbacks:

```ts
onArrebatadosStart: handleArrebatadosStart,
onArrebatadosAdd: handleArrebatadosAdd,
onArrebatadosStop: handleArrebatadosStop,
onBossStart: handleBossStart,
onBossPhase: handleBossPhase,
onBossDamage: handleBossDamage,
onBossCheck: handleBossCheck,
onBossStop: handleBossStop,
onVisualDamage: handleVisualDamage,
```

**Step 5: Add to restart/backToStart cleanup**

In the `restart` and `backToStart` callbacks, add:

```ts
handleArrebatadosStop()
bossController.actions.stopBoss()
```

**Step 6: Expose new subsystems in return API**

Add to the `subsystems` useMemo:

```ts
scrollFriction,
bossController: {
    state: bossController.state,
    actions: bossController.actions,
},
visualDamage,
scrollContainerRef,
```

Also add these to the `subsystems` dependency array.

**Step 7: Run existing tests**

Run: `npx vitest run src/hooks/__tests__/useBardoEngine`
Expected: Existing tests PASS (new hooks are optional, don't break anything)

**Step 8: Commit**

```bash
git add src/hooks/useBardoEngine.ts
git commit -m "feat: wire scroll friction, boss controller, and visual damage into engine"
```

---

## Task 8: Update `Player.jsx` for new overlays and scroll ref

Pass scroll container ref to the engine and render boss overlays.

**Files:**
- Modify: `src/components/Player.jsx`

**Step 1: Add imports and new props**

Add new props to Player:

```jsx
// New props
scrollContainerRefOut = null,  // ref callback so engine can access scroll container
bossState = null,              // from useBossController
scrollFriction = null,         // from useScrollFriction
onScrollLock = null,
onScrollUnlock = null,
onBossPhaseComplete = null,
```

Import the new components:

```jsx
import BossHPIndicator from './BossHPIndicator'
import ScrollGrabOverlay from './ScrollGrabOverlay'
```

**Step 2: Connect scroll container ref**

After the `scrollContainerRef` is created, sync it to the engine:

```jsx
useEffect(() => {
    if (scrollContainerRefOut) {
        scrollContainerRefOut.current = scrollContainerRef.current
    }
}, [scrollContainerRefOut])
```

**Step 3: Add viewport collapse CSS**

Apply dynamic max-width when boss phase 3 is active:

```jsx
const contentStyle = {
    maxWidth: 'var(--player-max-width, 48rem)',
    ...(bossState?.phase === 'phase_3' ? {
        maxWidth: `${bossState._viewportWidth || 700}px`,
        transition: 'max-width 0.5s linear',
    } : {}),
}
```

**Step 4: Render overlays**

Add after the footer, before the floating indicators:

```jsx
{/* Boss HP Indicator */}
{bossState && (
    <BossHPIndicator
        bossName={bossState.bossName}
        bossHp={bossState.bossHp}
        bossMaxHp={bossState.bossMaxHp}
        phase={bossState.phase}
        isActive={bossState.isActive}
    />
)}

{/* Shadow Hands Overlay (Phase 2) */}
<ScrollGrabOverlay
    active={bossState?.phase === 'phase_2'}
    onScrollLock={onScrollLock}
    onScrollUnlock={onScrollUnlock}
    onPhaseComplete={onBossPhaseComplete}
/>

{/* Arrebatados visual layer */}
{scrollFriction?.isActive && scrollFriction.arrebatadosElements.length > 0 && (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
        {scrollFriction.arrebatadosElements.map(el => (
            <div
                key={el.id}
                className="absolute font-mono text-red-900/40 text-sm whitespace-nowrap animate-pulse"
                style={{
                    top: `${20 + (el.paragraphIndex * 15)}%`,
                    left: `${Math.random() * 60 + 10}%`,
                    transform: `rotate(${Math.random() * 6 - 3}deg)`,
                    textShadow: '0 0 10px rgba(139,0,0,0.3)',
                }}
            >
                {el.text}
            </div>
        ))}
    </div>
)}
```

**Step 5: Commit**

```bash
git add src/components/Player.jsx
git commit -m "feat: add boss overlays, scroll friction visuals, and viewport collapse to Player"
```

---

## Task 9: Story config + Ink story

Create the museo demo config and Ink story file.

**Files:**
- Create: `src/stories/museo_demo.config.json`
- Create: `museo_demo.ink`

**Step 1: Create config**

Create `src/stories/museo_demo.config.json`:

```json
{
    "title": "EL OCASO EN EL MUSEO",
    "version": "1.0.0",
    "theme": {
        "primaryColor": "#a855f7",
        "bgColor": "#0a0a0a",
        "description": "Purple - dimensional horror"
    },
    "stats": {
        "enabled": true,
        "definitions": [
            {
                "id": "hp",
                "label": "Vida",
                "icon": "❤️",
                "displayType": "bar",
                "min": 0,
                "max": 100,
                "initial": 100,
                "color": "#ef4444"
            },
            {
                "id": "fuerza",
                "label": "Fuerza",
                "icon": "💪",
                "displayType": "value",
                "min": 0,
                "max": 50,
                "initial": 10
            },
            {
                "id": "magia",
                "label": "Magia",
                "icon": "✨",
                "displayType": "value",
                "min": 0,
                "max": 50,
                "initial": 10
            },
            {
                "id": "sabiduria",
                "label": "Sabiduría",
                "icon": "📖",
                "displayType": "value",
                "min": 0,
                "max": 50,
                "initial": 10
            }
        ]
    },
    "inventory": {
        "enabled": false
    },
    "intro": {
        "enabled": false
    },
    "achievements": []
}
```

**Step 2: Write the Ink story**

Create `museo_demo.ink` — a complete tech demo story using all the new tags. The story should follow the flow: intro → museo exploration with scroll friction → boss fight 3 phases → victory/defeat with visual damage persistence.

The Ink story is the longest single piece. Write it following the spider_demo pattern:

```ink
// ═══════════════════════════════════════════════════════
// EL OCASO EN EL MUSEO DEL SUR — Tech Demo
// Scroll Friction + Boss Fight + Visual Damage Persistence
// ═══════════════════════════════════════════════════════

VAR fuerza = 10
VAR magia = 10
VAR sabiduria = 10
VAR hp = 100
VAR boss_hp = 100
VAR boss_defeated = false
VAR boss_phase = 0
VAR scroll_locked = false
VAR arrebatados_count = 0
VAR death_count = 0
VAR minigame_result = -1

-> intro

=== intro ===
# clear

El Museo de Ciencias Naturales del Sur. Medianoche.

Tu radio crepita: "Centinela, tenemos una Brecha Clase 3 en el ala arqueológica. Un Umbrío está intentando abrir un portal al Uku Pacha usando la energía de la Momia de Salta."

La seguridad del museo ya cayó. Los guardias están en trance, con los ojos blancos y murmurando en quechua antiguo.

Sos el último Centinela disponible en la zona.

+ [Entrar al museo] -> museo_entrada
+ [Pedir refuerzos] -> sin_refuerzos

=== sin_refuerzos ===

"No hay refuerzos, Centinela. Jesús está conteniendo otra brecha en Tucumán. Estás solo."

La radio se corta. El silencio del museo te traga.

+ [Entrar al museo] -> museo_entrada

=== museo_entrada ===
# clear
# ARREBATADOS_START: count=2, fuerza={fuerza}

La puerta principal está entreabierta. Adentro, el aire huele a tierra mojada y a algo metálico, como sangre vieja.

Las luces de emergencia parpadean en rojo. Entre las sombras, ves movimiento — figuras translúcidas que se arrastran por las paredes.

Son Arrebatados. Almas de conquistadores y saqueadores, atrapadas en el lodo del tiempo. El Umbrío las está usando como barrera.

Sentís el texto pesado. Cada paso te cuesta más.

+ [Avanzar hacia la Galería Principal] -> galeria_1
+ [Buscar un camino alternativo] -> camino_lateral

=== camino_lateral ===

Bordeás el hall central por un pasillo de servicio. Está oscuro, pero al menos no hay Arrebatados aquí.

Encontrás una puerta de mantenimiento que da a la galería.

# stat:sabiduria:+2

Tu cautela te recompensa. [+2 Sabiduría]

+ [Entrar a la galería] -> galeria_1

=== galeria_1 ===
# ARREBATADOS_ADD: 2
# clear

La Galería de Historia Natural. Vitrinas rotas, huesos de dinosaurios proyectando sombras grotescas.

Los Arrebatados son más densos aquí. Sus murmullos llenan el aire:

"ORO... NECESITAMOS MÁS ORO..."

"ESTA TIERRA ES NUESTRA POR DERECHO DE CONQUISTA..."

Cada palabra que lees se siente más pesada que la anterior.

+ [Abrirte paso a la fuerza] -> galeria_fuerza
+ [Buscar un patrón en sus movimientos] -> galeria_sabiduria
+ [Intentar dispersarlos con energía] -> galeria_magia

=== galeria_fuerza ===

Empujás a través de la masa de Arrebatados. Sus manos fantasmales te agarran pero tu determinación es más fuerte.

# stat:fuerza:+3
# stat:hp:-10

Te rasguñan el alma. [-10 HP, +3 Fuerza]

+ [Seguir adelante] -> galeria_2

=== galeria_sabiduria ===

Observás sus patrones. Se mueven en espiral, siguiendo líneas invisibles en el suelo — líneas ley, probablemente.

Si te movés entre las espirales, podés pasar sin contacto.

# stat:sabiduria:+4

Tu mente ve lo que los ojos no pueden. [+4 Sabiduría]

+ [Seguir adelante] -> galeria_2

=== galeria_magia ===

Concentrás tu energía ancestral y proyectás un pulso de luz. Los Arrebatados retroceden, chillando en idiomas muertos.

Pero el esfuerzo te deja mareado.

# stat:magia:+4
# stat:hp:-5

[-5 HP, +4 Magia]

+ [Seguir adelante] -> galeria_2

=== galeria_2 ===
# ARREBATADOS_ADD: 3
# clear

Sala de Arqueología Andina. Aquí está la vitrina de la Momia de Salta — vacía. El vidrio está cubierto de escarcha negra.

Y al fondo de la sala, lo ves.

El Umbrío. Un hombre joven con ojos como pozos de brea, flotando a treinta centímetros del suelo. Entre sus manos, un portal púrpura palpita como un corazón enfermo.

La Momia de Salta está suspendida dentro del portal, brillando con una energía antigua.

"Ah, un Centinela," dice, sin mover los labios. "Llegás tarde."

# ARREBATADOS_STOP

+ [Enfrentarlo] -> boss_intro

=== boss_intro ===
# clear
# BOSS_START: name=amaru, hp=100
# UI_EFFECT: cold_blue

AMARU, EL TEJEDOR DE SOMBRAS

"¿Sabés lo que hay del otro lado, Centinela? El Uku Pacha. El mundo de abajo. Y esta momia es la llave."

El museo empieza a deformarse. Las paredes se estiran, el techo se aleja, el piso se ondula.

"No vas a poder ni leer lo que viene."

{ fuerza >= 15: Tu fuerza te da la voluntad de resistir la distorsión. }
{ sabiduria >= 15: Tu sabiduría te permite ver a través de sus ilusiones. }
{ magia >= 15: Tu magia resuena contra la suya, debilitando sus hechizos. }

+ [Resistir] -> boss_fase_1

=== boss_fase_1 ===
# BOSS_PHASE: 1
# clear

FASE I: EL PASILLO INFINITO

El museo se transforma en un corredor sin fin. Caminás, pero el pasillo se repite. El mismo cuadro, la misma vitrina, la misma grieta en la pared.

"Vas a caminar por siempre, Centinela. Como los Arrebatados. Atrapado en un loop."

La voz de Amaru resuena desde todas las direcciones.

Pero algo no está bien. Uno de los textos tiene un brillo diferente. Algo que no pertenece al loop.

{ sabiduria >= 15: Tu sabiduría te ayuda: el error es más visible para vos. Buscá el texto con un color distinto y clickealo. }
{ sabiduria < 15: Buscá con cuidado: hay un texto con un color ligeramente diferente. Clickealo para romper el ciclo. }

Encontrá la errata en el texto y clickeala para romper el hechizo.

+ [Buscar la errata...] -> boss_fase_1_check

=== boss_fase_1_check ===
# BOSS_DAMAGE: 30

¡LO ENCONTRASTE!

El corredor se quiebra como un espejo. Amaru retrocede, sorprendido.

"Imposible... ¿cómo viste a través de mi trama?"

# flash_white
# shake

+ [Avanzar a la siguiente fase] -> boss_fase_2

=== boss_fase_2 ===
# BOSS_PHASE: 2
# clear

FASE II: LAS MANOS DE SOMBRA

Amaru gruñe. De las sombras de los márgenes del museo, emergen manos. Decenas de manos oscuras que se extienden hacia vos.

"Si no puedo atraparte en el loop, te voy a arrastrar al Uku Pacha directamente."

Las manos intentan agarrar la interfaz. Sentís cómo el control se te escapa.

¡SACUDÍ EL MOUSE RÁPIDAMENTE PARA LIBERARTE DE LAS MANOS!

Si dejás de sacudir, las manos te atrapan y el scroll se bloquea.

+ [Resistir las manos] -> boss_fase_2_check

=== boss_fase_2_check ===
# BOSS_DAMAGE: 30

¡Te liberaste!

Las manos se retraen, chillando. Amaru escupe sangre negra.

"Tenés... fuerza. Pero no la suficiente."

# shake
# flash_white

+ [Enfrentar la fase final] -> boss_fase_3

=== boss_fase_3 ===
# BOSS_PHASE: 3
# clear

FASE III: EL COLAPSO DE LA REALIDAD

Amaru levanta ambas manos. El espacio mismo empieza a comprimirse. Las paredes se cierran sobre vos.

"Si no puedo atraparte ni arrastrarte... voy a APLASTARTE."

El viewport se achica. Tu mundo se reduce píxel a píxel.

Pero hay grietas en la realidad de Amaru — portales pequeños que pulsan con luz violeta. Cada uno es una debilidad en su hechizo.

¡CLICKEÁ LOS PORTALES VIOLETA QUE APARECEN EN EL TEXTO PARA DAÑAR A AMARU!

Si el espacio llega a cero, morís.

+ [Atacar los portales] -> boss_fase_3_check

=== boss_fase_3_check ===
# BOSS_CHECK
# BOSS_STOP

{ boss_defeated:
    -> victoria
- else:
    -> derrota
}

=== victoria ===
# clear
# UI_EFFECT: none
# flash_white
# shake

¡AMARU HA CAÍDO!

El Tejedor de Sombras se desintegra en un remolino de sombras. Su último grito resuena por los pasillos vacíos del museo.

"Esto... no termina... aquí..."

La Momia de Salta cae suavemente al suelo, intacta. El portal al Uku Pacha se cierra con un estallido de luz púrpura.

Los Arrebatados se desvanecen como niebla al amanecer. Los guardias despiertan, confundidos.

Tu radio crepita: "Centinela, ¿status?"

"Brecha sellada. El Umbrío fue neutralizado. La pieza está segura."

Silencio.

"Buen trabajo, Centinela."

---

VICTORIA

HP final: {hp}

{ fuerza >= 15: Tu fuerza fue decisiva en la batalla. }
{ sabiduria >= 15: Tu sabiduría te permitió ver a través de las ilusiones. }
{ magia >= 15: Tu magia debilitó los hechizos del enemigo. }

*Tech Demo: El Ocaso en el Museo del Sur*
*Sistemas: Scroll Friction + Boss Fight (3 fases) + Visual Damage*

+ [Volver a jugar] -> intro

=== derrota ===
# clear
# VISUAL_DAMAGE: grayscale=0.3
# UI_EFFECT: blur_vignette

El espacio se cierra.

Tu mundo se comprime hasta que no queda nada. La oscuridad te envuelve como un sarcófago.

~ death_count = death_count + 1

"Bienvenido al Uku Pacha, Centinela. Ahora sos uno de los nuestros."

Lo último que escuchás son los murmullos de los Arrebatados, dándote la bienvenida a la eternidad.

APLASTADO POR LA REALIDAD

Muerte #{death_count}

# stat:hp:-25

[-25 HP]

+ [Intentar de nuevo (el daño persiste...)] -> intro
+ [Purificar tu esencia (Hard Reset)] -> hard_reset

=== hard_reset ===
# VISUAL_DAMAGE: reset
# clear

Concentrás lo último de tu energía ancestral. La oscuridad retrocede.

Tu visión se aclara. El daño al tejido de la realidad se restaura.

Empezás de cero, limpio. Como si nada hubiera pasado.

...Pero vos sabés que pasó.

+ [Comenzar de nuevo] -> intro
```

**Step 3: Compile the Ink story**

Run: `node compile-ink.cjs museo_demo.ink src/stories/museo_demo.json`
Expected: Successful compilation

**Step 4: Commit**

```bash
git add museo_demo.ink src/stories/museo_demo.json src/stories/museo_demo.config.json
git commit -m "feat: add museo demo Ink story and config"
```

---

## Task 10: Integration testing — run dev server and smoke test

Verify the full flow works end-to-end.

**Step 1: Run existing test suite**

Run: `npx vitest run`
Expected: All tests PASS (no regressions)

**Step 2: Start dev server**

Run: `npm run dev`
Expected: Vite dev server starts, museo_demo appears in story selector

**Step 3: Manual smoke test checklist**

- [ ] Select "EL OCASO EN EL MUSEO" from story selector
- [ ] Verify stats panel shows HP, Fuerza, Magia, Sabiduría
- [ ] Verify scroll friction activates at museo_entrada (text feels "sticky")
- [ ] Verify arrebatados visual text appears
- [ ] Navigate to boss fight, verify BossHPIndicator appears
- [ ] Phase 1: Verify scroll loop behavior
- [ ] Phase 2: Verify shadow hands overlay and mouse shake detection
- [ ] Phase 3: Verify viewport width reduction and portal nodes
- [ ] Reach defeat: Verify grayscale persists on restart
- [ ] Use "Purificar tu esencia": Verify grayscale resets
- [ ] Reach victory: Verify stats summary

**Step 4: Fix any issues found during smoke testing**

**Step 5: Final commit**

```bash
git add -A
git commit -m "fix: address integration issues from smoke testing"
```

---

## Task Summary

| # | Task | Files | Estimated Complexity |
|---|------|-------|---------------------|
| 1 | useVisualDamage hook | 2 new | Low |
| 2 | useScrollFriction hook | 2 new | Medium |
| 3 | useBossController hook | 2 new | Medium |
| 4 | BossHPIndicator component | 1 new | Low |
| 5 | ScrollGrabOverlay component | 1 new | Medium |
| 6 | Wire tags into useTagProcessor | 1 modified | Medium |
| 7 | Wire hooks into useBardoEngine | 1 modified | Medium |
| 8 | Update Player.jsx for overlays | 1 modified | Medium |
| 9 | Ink story + config | 3 new | Medium |
| 10 | Integration testing | 0 | Low |

**Total: 11 new files, 3 modified files**

**Dependencies:**
- Tasks 1-3 (hooks) are independent and can be parallelized
- Tasks 4-5 (components) are independent and can be parallelized
- Task 6 depends on Tasks 1-3
- Task 7 depends on Tasks 1-3 and 6
- Task 8 depends on Tasks 4-5 and 7
- Task 9 is independent (can be done anytime)
- Task 10 depends on all other tasks
