# Spider Infestation in Chapter 2A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the spider infestation overlay system to Chapter 2A ("Pequeños Inocentes") of centinelas.ink, escalating through the cave/vault/chase sequence and evaluating with SPIDER_CHECK before the boss fight.

**Architecture:** Insert spider system tags into existing Ink narrative without changing any story text. Declare `spider_survived` variable, add SPIDER_START at cave entrance (slow), escalate to normal at the vault and fast during the chase, then SPIDER_CHECK:12 + SPIDER_STOP via a gate knot before the boss fight. Add a conditional flavor text in the aftermath based on the result. No `extreme` phase — the boss fight has its own QTE minigame.

**Tech Stack:** Ink scripting language, inkjs runtime, BardoEngine spider system (useSpiderInfestation.js)

---

## Context

### How the Spider System Works

The engine's `useSpiderInfestation.js` hook renders clickable spider sprites that crawl toward story text. Players squash them by clicking/tapping. A kill count accumulates across the entire infestation session. At the end, `SPIDER_CHECK: N` compares kills vs threshold.

**Tags recognized by the engine:**

| Tag | Effect |
|-----|--------|
| `# SPIDER_START: difficulty=X, fuerza={var}, magia={var}, sabiduria={var}` | Start overlay. Params parsed from Ink variables via `{braces}` syntax. |
| `# SPIDER_DIFFICULTY: X` | Hot-swap difficulty mid-session. X = slow/normal/fast/extreme |
| `# SPIDER_CHECK: N` | Evaluate kill count >= N. Sets `spider_survived` var in Ink. Auto-selects choice 0 after 2s. |
| `# SPIDER_STOP` | Clear overlay, stop spawning. |

**Difficulty levels:**

| Level | Spawn interval | Speed (px/s) | Web spit interval |
|-------|---------------|-------------|-------------------|
| slow | 3000ms | 35 | 6000ms |
| normal | 1800ms | 50 | 3500ms |
| fast | 1200ms | 70 | 2200ms |
| extreme | 700ms | 90 | 1200ms |

**Magic bonus:** If `magia >= 20`, spider movement is slowed to 60% (built into the engine, no tag needed).

### Critical Pattern: SPIDER_CHECK Gate Choice

Unlike WILLPOWER_CHECK (which sets a variable and lets Ink evaluate inline), SPIDER_CHECK auto-selects choice index 0 after a 2-second delay. This means the Ink **must** have a gate choice immediately after the CHECK:

```ink
=== spider_gate_knot ===
# SPIDER_CHECK: 12
# SPIDER_STOP

+ [→] -> next_real_knot
```

The `+ [→]` is the gate choice. The engine auto-clicks it. The `{ spider_survived: ... }` conditional goes in a later knot, NOT inline with the check.

### Centinelas Stats

Centinelas uses `fuerza`, `magia`, `conocimiento` (not `sabiduria`). The engine reads `sabiduria` as the key, so we pass `conocimiento`'s value into the `sabiduria` slot:

```
# SPIDER_START: difficulty=slow, fuerza={fuerza}, magia={magia}, sabiduria={conocimiento}
```

### Chapter 2A Narrative Flow (Spider Zone)

```
cueva_entrada ──→ [branch: escuchar/izquierda/derecha/trampas] ──→ cueva_derecha
    ──→ [branch: emboscada sabe/no_sabe] ──→ [branch: herida] ──→ boveda
    ──→ boveda_capullo (find Juan, CPR) ──→ regreso_orfanato (chase)
    ──→ [branch: ninos_decision × 5] ──→ combate_final (boss fight)
    ──→ [branch: 6 combat styles] ──→ despues_combate
```

Spider overlay runs from `cueva_entrada` through `ninos_*` branches. Stops before `combate_final` (which has a QTE minigame in `combate_disparos`).

---

## File Structure

**Modified files:**
- `centinelas.ink` — Add VAR, spider tags, gate knot, conditional text
- `src/stories/centinelas.json` — Recompiled output (auto-generated)
- `src/stories/centinelas.config.json` — Version bump

**No new files needed.** All engine support for spider tags already exists.

---

## Task 1: Declare `spider_survived` Variable

**Files:**
- Modify: `centinelas.ink:47` (after `VAR willpower_passed = false`)

- [ ] **Step 1: Add the variable declaration**

After line 47 (`VAR willpower_passed = false`), add:

```ink
VAR spider_survived = false
```

This is what the engine writes to when `SPIDER_CHECK` evaluates. Must be declared at the top level of the Ink file or inkjs will throw a runtime error.

- [ ] **Step 2: Verify no duplicate exists**

Run: `grep -n "spider_survived" centinelas.ink`
Expected: Exactly 1 result (the new VAR line).

---

## Task 2: Add SPIDER_START at Cave Entrance

**Files:**
- Modify: `centinelas.ink:1685` (knot `cueva_entrada`)

- [ ] **Step 1: Add SPIDER_START tag**

Current line 1685-1686:
```ink
=== cueva_entrada ===
# music:cueva_ambient
```

Change to:
```ink
=== cueva_entrada ===
# music:cueva_ambient
# SPIDER_START: difficulty=slow, fuerza={fuerza}, magia={magia}, sabiduria={conocimiento}
```

The tag goes AFTER `# music` so the music starts before the overlay. Tag placement: always on lines immediately following the knot header, before narrative text.

- [ ] **Step 2: Verify tag syntax**

Confirm the tag has:
- Colon after `SPIDER_START`
- Space after colon
- `difficulty=slow` (not `difficulty: slow`)
- Variable references use `{braces}` (not quotes)
- Comma-separated params with spaces after commas

---

## Task 3: Add SPIDER_DIFFICULTY: normal at Boveda

**Files:**
- Modify: `centinelas.ink:1790` (knot `boveda`)

- [ ] **Step 1: Add difficulty escalation tag**

Current line 1790-1792:
```ink
=== boveda ===
# next: Llegas a una gran bóveda
# music:boveda_ambient
```

Change to:
```ink
=== boveda ===
# SPIDER_DIFFICULTY: normal
# next: Llegas a una gran bóveda
# music:boveda_ambient
```

The `SPIDER_DIFFICULTY` tag goes first so the escalation happens before the text renders. The player sees more aggressive spiders starting with this emotional scene (finding Juan).

---

## Task 4: Add SPIDER_DIFFICULTY: fast at Chase Sequence

**Files:**
- Modify: `centinelas.ink:1877` (knot `regreso_orfanato`)

- [ ] **Step 1: Add difficulty escalation tag**

Current line 1877-1878:
```ink
=== regreso_orfanato ===
# music:chase_ambient
```

Change to:
```ink
=== regreso_orfanato ===
# SPIDER_DIFFICULTY: fast
# music:chase_ambient
```

Fast difficulty: spiders spawn every 1.2s at 70px/s. Matches the frantic chase pace narratively.

---

## Task 5: Create Spider Gate Knot Before Boss Fight

**Files:**
- Modify: `centinelas.ink` — insert new knot between `ninos_*` branches and `combate_final`, redirect 5 diverts

This is the most delicate task. The gate knot pattern is **required** by the spider system.

- [ ] **Step 1: Insert the gate knot**

Find the section break before `combate_final` (current lines 1972-1976):
```ink
// =========================================================
// COMBATE FINAL
// =========================================================

=== combate_final ===
```

Insert the gate knot BEFORE this section:
```ink
=== cap2a_spider_check ===
# SPIDER_CHECK: 12
# SPIDER_STOP

+ [→] -> combate_final

// =========================================================
// COMBATE FINAL
// =========================================================

=== combate_final ===
```

- [ ] **Step 2: Redirect all 5 diverts from ninos branches**

Replace all `-> combate_final` in the ninos branches with `-> cap2a_spider_check`:

| Line | Knot | Change |
|------|------|--------|
| 1949 | `ninos_habitacion` | `-> combate_final` → `-> cap2a_spider_check` |
| 1955 | `ninos_capilla` | `-> combate_final` → `-> cap2a_spider_check` |
| 1959 | `ninos_cocina` | `-> combate_final` → `-> cap2a_spider_check` |
| 1964 | `ninos_pelear` | `-> combate_final` → `-> cap2a_spider_check` |
| 1970 | `ninos_huir` | `-> combate_final` → `-> cap2a_spider_check` |

**IMPORTANT:** Do NOT change the `-> combate_final` inside the gate knot itself. Only the 5 in the ninos branches.

- [ ] **Step 3: Verify all diverts are correct**

Run: `grep -n "-> combate_final" centinelas.ink`
Expected: Exactly 1 result — the one inside `cap2a_spider_check`.

Run: `grep -n "-> cap2a_spider_check" centinelas.ink`
Expected: Exactly 5 results — one per ninos branch.

---

## Task 6: Add Conditional Aftermath Text

**Files:**
- Modify: `centinelas.ink:2065` (knot `despues_combate`)

- [ ] **Step 1: Add spider_survived conditional**

Current lines 2065-2070:
```ink
=== despues_combate ===
# next: Después del combate
# music:misterio_ambient
La adrenalina tarda en salir de tu cuerpo. No te das cuenta pero están teniendo unos temblores involuntarios, la energía sigue activa y está reclamando acción.
Lo correcto sería llamar a El Faro, informarle de la misión y pedir que envíen un equipo de limpieza (y alguien para que te lleve de vuelta a Costa Alegre, no estás es condición de manejar)
Pero tenés cosas que hacer
```

Change to:
```ink
=== despues_combate ===
# next: Después del combate
# music:misterio_ambient
{ spider_survived:
    La adrenalina tarda en salir de tu cuerpo pero te das cuenta que estás entero. Tus manos están firmes. Las arañas no pudieron con vos.
- else:
    La adrenalina tarda en salir de tu cuerpo. Las mordeduras de araña te arden en los brazos y el cuello. Tenés marcas por todos lados y cada movimiento cuesta el doble de lo que debería.
    # stat:hp:-10
}
Lo correcto sería llamar a El Faro, informarle de la misión y pedir que envíen un equipo de limpieza (y alguien para que te lleve de vuelta a Costa Alegre, no estás es condición de manejar)
Pero tenés cosas que hacer
```

Note: The `# stat:hp:-10` penalty goes INSIDE the else block, indented with 4 spaces per Ink syntax for content inside conditionals.

---

## Task 7: Compile and Verify

**Files:**
- `centinelas.ink` (input)
- `src/stories/centinelas.json` (output)

- [ ] **Step 1: Compile**

Run: `node compile-ink.cjs centinelas.ink src/stories/centinelas.json`
Expected: `Compiled successfully`

If compilation fails, check:
- Missing `VAR spider_survived` declaration
- Syntax error in gate choice (must be `+ [→] ->` not `* [→] ->`)
- Unclosed `{ }` conditional block
- Indentation inside conditional (4 spaces)

- [ ] **Step 2: Verify spider tags**

Run: `grep -n "SPIDER_" centinelas.ink`

Expected output (5 lines):
```
NNNN:# SPIDER_START: difficulty=slow, fuerza={fuerza}, magia={magia}, sabiduria={conocimiento}
NNNN:# SPIDER_DIFFICULTY: normal
NNNN:# SPIDER_DIFFICULTY: fast
NNNN:# SPIDER_CHECK: 12
NNNN:# SPIDER_STOP
```

There should be NO other SPIDER tags in the file.

- [ ] **Step 3: Verify gate knot routing**

Run: `grep -n "spider_check\|-> combate_final" centinelas.ink`

Expected: 5 lines pointing to `cap2a_spider_check`, 1 line pointing to `combate_final` (inside the gate knot).

- [ ] **Step 4: Run tests**

Run: `npm run test:run`
Expected: All tests pass (587+). Spider tag changes are in Ink only — no JS/TS touched, so tests should be unaffected.

---

## Task 8: Version Bump and Commit

**Files:**
- Modify: `src/stories/centinelas.config.json:3` — version bump
- Modify: `docs/centinelas/CHANGELOG.md` — new entry

- [ ] **Step 1: Bump version**

In `src/stories/centinelas.config.json`, change:
```json
"version": "0.5.2",
```
to:
```json
"version": "0.6.0",
```

This is a **minor** bump (new feature: spider infestation mechanic in Cap 2A).

- [ ] **Step 2: Update changelog**

Add entry after the `# Changelog` header and before the `## [0.5.2]` entry (which is the first version entry):

```markdown
## [0.6.0] — 2026-03-19

### Feature: Sistema de Infestación de Arañas en Capítulo 2A

Overlay de arañas interactivo integrado en la secuencia cueva → bóveda → persecución del Capítulo 2A. El jugador aplasta arañas mientras lee. Al finalizar, el resultado afecta el estado físico del personaje.

**Tags insertados:**
| Knot | Tag | Efecto |
|------|-----|--------|
| `cueva_entrada` | `SPIDER_START: difficulty=slow` | Inicio de infestación, arañas lentas |
| `boveda` | `SPIDER_DIFFICULTY: normal` | Escalada al encontrar el nido |
| `regreso_orfanato` | `SPIDER_DIFFICULTY: fast` | Persecución frenética |
| `cap2a_spider_check` | `SPIDER_CHECK: 12` + `SPIDER_STOP` | Evaluación final antes del boss |

**Variable nueva:** `spider_survived` — resultado del check, modifica texto en `despues_combate` (+0/-10 HP).

**Threshold:** 12 kills. Alcanzable con interacción casual (~1.3 kills/min). Bonus: `magia >= 20` ralentiza arañas al 60%.

No se usa dificultad `extreme` — el combate final tiene su propio QTE.

### Archivos modificados
- `centinelas.ink` — VAR, 4 spider tags, gate knot, conditional aftermath
- `src/stories/centinelas.json` — recompilado
- `src/stories/centinelas.config.json` — version bump 0.5.2 → 0.6.0

---
```

- [ ] **Step 3: Commit**

```bash
git add centinelas.ink src/stories/centinelas.json src/stories/centinelas.config.json docs/centinelas/CHANGELOG.md
git commit -m "feat(centinelas): sistema de infestación de arañas en Capítulo 2A (v0.6.0)

Overlay interactivo de arañas durante la secuencia cueva-bóveda-persecución.
Escalada slow → normal → fast. Threshold: 12 kills. spider_survived
modifica aftermath (+0/-10 HP). Sin extreme (boss tiene QTE propio).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary of All Changes to centinelas.ink

| Location | What | Tag/Code |
|----------|------|----------|
| After line 47 | New VAR | `VAR spider_survived = false` |
| `cueva_entrada` (line ~1686) | New tag | `# SPIDER_START: difficulty=slow, fuerza={fuerza}, magia={magia}, sabiduria={conocimiento}` |
| `boveda` (line ~1790) | New tag | `# SPIDER_DIFFICULTY: normal` |
| `regreso_orfanato` (line ~1877) | New tag | `# SPIDER_DIFFICULTY: fast` |
| Before `combate_final` | New knot | `=== cap2a_spider_check ===` with CHECK:12 + STOP + gate choice |
| 5 ninos branches | Redirect | `-> combate_final` → `-> cap2a_spider_check` |
| `despues_combate` (line ~2065) | Modified text | `{ spider_survived: ... - else: ... # stat:hp:-10 }` |

**Total: 1 new variable, 4 new tags, 1 new gate knot, 5 redirected diverts, 1 conditional text block.**
