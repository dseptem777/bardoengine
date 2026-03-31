# Tech Demo: "El Ocaso en el Museo del Sur"

## Overview

Tech demo for Episode 4 mechanics: scroll friction ("Arrebatados"), a 3-phase boss fight against Amaru, and persistent visual damage on death. Standalone Ink story following the pattern of `spider_demo`, `apnea`, and `vampiro`.

## Narrative Context

The player is a Centinela (guardian of the sacred in the Southern Cone) entering the Museo de Ciencias Naturales to prevent the theft of the Salta Mummy. The antagonist, an "Umbrio" who opens portals to the Uku Pacha (world below), has compromised security. Enemies are "Arrebatados" — souls of conquistadors trapped in the mud of time.

## Architecture: Modular Hooks

Three new hooks following established engine patterns:

| Hook | Pattern Source | Responsibility |
|------|---------------|----------------|
| `useScrollFriction` | `useHeavyCursor` (rAF + physics) | Intercepts wheel events, applies resistance formula based on enemy count and STR stat |
| `useBossController` | `useWillpowerSystem` (state machine) | Boss state machine (idle → phase 1-3 → defeated/dead), HP, phase dispatch |
| `useVisualDamage` | `useSaveSystem` (localStorage) | Accumulates visual damage (grayscale), persists across sessions, hard reset |

## Ink Tags

### Scroll Friction (Arrebatados)
```ink
# ARREBATADOS_START: count=3, fuerza={fuerza}
# ARREBATADOS_ADD: 2
# ARREBATADOS_STOP
```

### Boss Controller
```ink
# BOSS_START: name=amaru, hp=100
# BOSS_PHASE: 1    // Scroll Loop
# BOSS_PHASE: 2    // Scroll Grab
# BOSS_PHASE: 3    // Viewport Collapse
# BOSS_DAMAGE: 20
# BOSS_CHECK        // evaluates HP, sets boss_defeated in Ink
# BOSS_STOP
```

### Visual Damage
```ink
# VISUAL_DAMAGE: grayscale=0.3
# VISUAL_DAMAGE: reset
```

### Ink Variables
```ink
VAR boss_hp = 100
VAR boss_defeated = false
VAR boss_phase = 0
VAR scroll_locked = false
VAR arrebatados_count = 0
VAR death_count = 0
VAR fuerza = 10
VAR magia = 10
VAR sabiduria = 10
VAR hp = 100
```

## Mechanic Details

### useScrollFriction

- Intercepts `wheel` event on Player's scroll container
- Formula: `V_final = V_input * (1 - arrebatados / (fuerza + 10))`
- When `arrebatados >= fuerza + 10`, scroll freezes
- Each "arrebatado" renders as glitch text (monospace, rust-red, static animation) injected between paragraphs via `data-paragraph-index`
- API: `useScrollFriction({ scrollContainerRef, enabled, arrebatadosCount, fuerza })`

### useBossController — 3 Phases

**Phase 1: Infinite Hallway (Scroll Loop)**
- Content loops: when user reaches bottom, seamlessly teleports to top
- Implementation: detect `scrollTop + clientHeight >= scrollHeight`, reset to 0
- Resolution: One paragraph has a slightly different color (WIS stat affects how subtle). Click it → BOSS_DAMAGE → exits phase 1
- WIS >= 15: color difference is more noticeable

**Phase 2: Shadow Hands (Scroll Grab)**
- Overlay of shadow hands (CSS, position: fixed) emerging from screen edges
- Detect mouse velocity on X axis. If `mouseVelocityX < threshold` for 3 seconds → `overflow: hidden` (scroll locked)
- Player must shake mouse rapidly on X axis to keep scroll free
- Resolution: Maintain shake for N seconds → BOSS_DAMAGE → phase ends

**Phase 3: Viewport Collapse**
- `max-width` of text container reduces progressively (~2px/sec from ~700px to 0)
- Portal nodes injected inline as spans inside existing paragraphs
- Visual: bright pulsing border, violet/dimensional color
- Click portal → BOSS_DAMAGE: 10. Portals spawn every 3-5 seconds
- Scroll friction intensifies (simulates exhaustion)
- Game over: width reaches 0 → death → visual damage persists
- Auto-disappear portals after ~5 seconds if not clicked

**Boss HP:** Fixed indicator at top showing name, HP bar, current phase.

### useVisualDamage

- On death: increment `death_count` in localStorage, apply `grayscale(death_count * 0.15)` to root (max ~0.6)
- On load: read accumulated damage, apply CSS filter
- Hard Reset: Ink choice "Purificar tu esencia" → `VISUAL_DAMAGE: reset` → clear localStorage + filter
- Storage key: `bardoengine_visual_damage_{storyId}`

## New Components

- `ScrollGrabOverlay.jsx` — Shadow hands for Phase 2 (SVG/CSS, fixed, animated from edges)
- `BossHPIndicator.jsx` — Fixed top bar with boss name, HP, phase
- Portal nodes rendered inline in TextDisplay (spans with click handlers)

## Files to Create

- `src/hooks/useScrollFriction.ts`
- `src/hooks/useBossController.ts`
- `src/hooks/useVisualDamage.ts`
- `src/components/ScrollGrabOverlay.jsx`
- `src/components/BossHPIndicator.jsx`
- `museo_demo.ink`
- `src/stories/museo_demo.config.json`

## Files to Modify

- `src/hooks/useTagProcessor.ts` — parse ARREBATADOS_*, BOSS_*, VISUAL_DAMAGE tags
- `src/hooks/useBardoEngine.ts` — wire new hooks
- `src/components/Player.jsx` — pass scrollContainerRef, render overlays
- `src/components/TextDisplay.jsx` — support inline portal nodes

## Stats

Same as spider_demo: HP, Fuerza, Magia, Sabiduria (consistent with Centinelas universe).

## Story Flow

```
intro → museo_entrada (scroll friction starts low)
  → galeria_1 (arrebatados grow) → galeria_2 (more enemies)
  → sala_momia (encounter Amaru)
  → boss_fase_1 (scroll loop — find the errata)
  → boss_fase_2 (scroll grab — shake mouse)
  → boss_fase_3 (viewport collapse — click portals)
  → resultado: victoria | derrota
  → derrota: visual damage + restart with persistent grayscale
  → victoria: celebration, stats summary
```
