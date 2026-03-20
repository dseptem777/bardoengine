# ApneaGame Diegetic Redesign

**Date**: 2026-03-20
**Status**: Approved
**Scope**: Rewrite `src/components/minigames/ApneaGame.jsx`

## Summary

Replace the HUD-based ApneaGame with a fully diegetic experience. No bars, no numbers, no visible UI. All player feedback comes through audio (breathing, heartbeat, creature rumble) and visual effects (blue tint, vignette, shake, text degradation). The creature is never seen — only felt through ambient effects that react to player behavior.

## External Interface (unchanged)

```jsx
<ApneaGame params={{ waves: 3 }} onFinish={(result) => {}} />
```

- `params.waves` (number, default 3): number of shadow waves
- `params.duration` (number, default 35): total game duration
- `onFinish(1)`: player survived
- `onFinish(0)`: player died (O2 depletion or detected)
- Touch support: touchstart/touchend map to hold/release

Nothing changes in Ink tags, minigameRegistry, MinigameOverlay, or centinelas.ink.

## Core Mechanic

Hold SPACE = hold breath (silence, but O2 depletes).
Release SPACE = breathe (O2 recovers, but makes noise).

During shadow waves, any noise risks detection. Between waves, breathing is safe.

## Game States

`intro → playing → win → lose` (unchanged)

## Wave System

`generateNarrative(waves)` is preserved as-is. It produces a timeline of narrative entries with shadow/recovery phases and escalating durations (3s, 5s, 8s, 11s...).

## Mechanics

### O2 System
- **Drain while holding**: scales per wave — `10 + (wave - 1) * 2` %/s
  - Wave 1: 12%/s, Wave 2: 14%/s, Wave 3: 18%/s, Wave 4+: 20%/s
- **Recovery while released**: 8%/s, after 500ms delay (anti micro-tap)
- **Death at 0%**: `onFinish(0)`

### Creature Awareness (replaces "visibility")
Internal value 0-100 representing how much the creature suspects the player's presence.
- **Increases** when not holding during shadow: +30%/s
- **Noise spike on release**: +15% instant when transitioning hold→release
- **Decreases** when holding: -25%/s, with 1s delay after a noise spike
- **Death at 100%**: `onFinish(0)`

This value is never shown numerically — it drives the intensity of ambient effects.

### Noise Spike Detail
When the player releases after holding:
- Instant +15% to creatureAwareness
- Breathing audio volume scales with how depleted O2 was (lower O2 = louder gasp)
- Creature ambient effects spike (rumble volume, vignette, shake)
- 1s delay before creatureAwareness starts decaying again (creature is "listening")

## Audio (self-contained, 3 channels)

ApneaGame manages its own audio via `new Audio()`. No dependency on `useAudio` hook.

| Channel | File | Behavior |
|---------|------|----------|
| Breathing | `public/sounds/breathing_loop.mp3` | Loops when `!isHolding`. Volume scales with O2 deficit (lower O2 = louder/more desperate). Silences instantly on hold. |
| Heartbeat | `public/sounds/heartbeat_loop.mp3` | Loops always during gameplay. `playbackRate`: 0.6 at O2=100%, 1.5 at O2=20%. Volume scales inversely with O2. |
| Creature rumble | `public/sounds/creature_rumble.mp3` | Loops during shadow phases only. Volume scales with `creatureAwareness`. Spikes on noise events. Fades out when wave ends. |

All audio is cleaned up in useEffect return. Audio objects are created once and reused.

## Visual Feedback (back to front layer order)

### 1. Base background
`bg-zinc-900` — near-black, like hiding in darkness.

### 2. Blue O2 tint
Full-screen overlay, `bg-blue-900`. Opacity: 0 at O2=100%, 0.8 at O2=0%.
This IS the oxygen meter — the player learns "blue = suffocating."

### 3. Creature vignette
Radial gradient (transparent center, black edges). Opacity scales with `creatureAwareness`. At high awareness, field of vision narrows to tunnel vision. Communicates "the thing is right here."

### 4. Screen shake
Framer-motion animation on the container. Intensity scales with creature proximity during shadow phases. Constant low tremor when creature is near, sharp jolt on noise spike.

### 5. Narrative text
Visible but degrades with O2:
- O2 > 60%: full opacity, sharp
- O2 40-60%: opacity 0.7, blur(1px)
- O2 20-40%: opacity 0.4, blur(2px), slight shake
- O2 < 20%: opacity 0.2, blur(3px), nearly illegible
- Color: red during shadow phases, gray-300 during recovery

### 6. Noise spike flash
On release during shadow: brief dark flash (not white — white breaks atmosphere). Like "the creature turned its head."

### What is NOT rendered
- No HUD bars (oxygen or noise)
- No numbers or percentages
- No "AGUANTANDO..." text indicator
- No wave counter
- No "APNEA" title during gameplay

## Intro Screen

Simplified. Instructions + "PRESIONA ESPACIO". Disappears on game start. Same as current minus the title during gameplay.

## Wave Experience Flow

```
WAVE START:
  → Rumble fades in, vignette closes gradually
  → Text: "LA SOMBRA ESTA CERCA" (red)
  → Low constant shake
  → Player holds → screen turns blue, heartbeat accelerates

PLAYER RELEASES (noise spike):
  → Loud breathing audio
  → Rumble spikes (creature reacts)
  → Vignette closes tighter, shake intensifies
  → Dark flash
  → 1-2s later, if player re-holds, effects decay gradually

WAVE ENDS:
  → Rumble fades out
  → Vignette opens
  → Shake stops
  → Text: "Los pasos se alejan..." (gray)
  → Safe to breathe
```

## Balance Targets

### waves=2 (taquilla, ~17s)
- Wave 1 (3s, drain 12%/s): easy intro, O2 to ~64%. Safe.
- Recovery (5s): recovers to ~96%
- Wave 2 (5s, drain 14%/s): O2 to ~26%. Screen very blue, heartbeat fast. Survivable.
- **Difficulty**: Medium-low. Winnable without experience.

### waves=3 (freezer, ~30s)
- Wave 1 (3s, 12%/s): intro wave.
- Wave 2 (5s, 14%/s): gets tense. Must manage release timing.
- Wave 3 (8s, 18%/s): O2 drains fast. MUST release at least once (noise spike risk). Heartbeat pounding, screen deep blue, text nearly invisible.
- **Difficulty**: High. Requires active management. Real failure possible.

## Audio Assets Needed

Three MP3 files to source (free/royalty-free):
1. `breathing_loop.mp3` — stressed breathing loop, ~5-10s
2. `heartbeat_loop.mp3` — single heartbeat pattern, short loop, ~2-4s
3. `creature_rumble.mp3` — low-frequency rumble/drone, ~10-15s

## Files Modified

- `src/components/minigames/ApneaGame.jsx` — full rewrite
- `public/sounds/breathing_loop.mp3` — new asset
- `public/sounds/heartbeat_loop.mp3` — new asset
- `public/sounds/creature_rumble.mp3` — new asset

## Files NOT Modified

- `centinelas.ink` / `centinelas.json`
- `src/config/minigameRegistry.js`
- `src/components/MinigameOverlay.jsx`
- `src/hooks/useMinigameController.js`
- `src/hooks/useTagProcessor.ts`
- `src/stories/centinelas.config.json`
