# Loom Editor — Tier 1: Writer-Essential Features

> Without these, a non-programmer writer cannot use the editor independently.

---

## 1. Visual Condition Builder

**Goal:** Replace the raw text `condition` field on choices with a dropdown-based UI.

**Files to modify:**
- `src/editor/nodes/PassageNode.jsx` — Replace condition `<input>` with `<ConditionBuilder>`
- `src/editor/components/ConditionBuilder.jsx` — **NEW** component
- `src/editor/hooks/useEditorState.js` — Pass `variables` to node data for dropdown population

**Component: ConditionBuilder**
```
┌─────────────────────────────────────────────────┐
│ Condition: [variable ▼] [operator ▼] [value   ] │
│            hp           >=            50         │
│                                                  │
│  [+ Add AND condition]  [Raw Ink mode toggle]    │
└─────────────────────────────────────────────────┘
```

**Behavior:**
- Dropdown lists all variables defined in VariablesPanel
- Operators based on type: number (`>`, `>=`, `<`, `<=`, `==`, `!=`), boolean (`is true`, `is false`), string (`==`, `!=`)
- Compound conditions with AND/OR
- "Raw Ink" toggle for advanced users who want to type `has_key && hp > 50`
- Outputs valid Ink condition string: `hp >= 50`, `has_key`, `hp > 50 && has_key`
- Also supports negation: `not has_key`

**Data flow:**
- ConditionBuilder receives `variables[]` from editor state (passed via node data)
- On change, calls `onConditionChange(index, conditionString)` which updates `choice.condition`
- generateInk.js needs NO changes — it already uses `choice.condition` as-is

**Implementation steps:**
1. Create `ConditionBuilder.jsx` with variable dropdown, operator dropdown, value input
2. Add compound condition support (array of conditions with AND/OR join)
3. Add "Raw Ink" toggle that shows a plain text input (current behavior)
4. In PassageNode.jsx edit mode, replace `<input>` for condition with `<ConditionBuilder>`
5. Thread `variables` from useEditorState through BardoEditor → node data → PassageNode
6. Write tests for condition string generation

---

## 2. Action Panel (Separate Tags from Narrative)

**Goal:** Writers should never need to type `#stat:hp:-10` — instead, they add "actions" from a visual panel that generates tags automatically.

**Files to modify:**
- `src/editor/nodes/PassageNode.jsx` — Split edit mode into "Text" tab + "Actions" tab
- `src/editor/components/ActionPanel.jsx` — **NEW** component
- `src/editor/components/actions/` — **NEW** directory with per-action-type forms
  - `StatAction.jsx`
  - `InventoryAction.jsx`
  - `AudioAction.jsx`
  - `VFXAction.jsx`
  - `AchievementAction.jsx`
  - `HorrorAction.jsx`
  - `CombatAction.jsx`
  - `UtilityAction.jsx`
- `src/editor/nodes/PassageNode.jsx` — Update parseContent/display to show action badges

**UI Design:**
```
┌─ Edit Node ────────────────────────────────────┐
│ [📝 Text] [⚡ Actions]              tabs       │
├────────────────────────────────────────────────┤
│ TEXT TAB:                                      │
│ ┌────────────────────────────────────────────┐ │
│ │ You enter the dark room.                   │ │
│ │ A creature lurks in the shadows.           │ │
│ │                                            │ │
│ │ (Type / for quick tags — still available)  │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ACTIONS TAB:                                   │
│ ┌────────────────────────────────────────────┐ │
│ │ Actions (executed in order):               │ │
│ │                                            │ │
│ │ 1. 🎵 Play music: horror_ambient    [✕]   │ │
│ │ 2. 📊 Stat: hp -10                  [✕]   │ │
│ │ 3. 💀 Screen shake                  [✕]   │ │
│ │                                            │ │
│ │ [+ Add Action ▼]                           │ │
│ │  ├─ 📊 Modify Stat                        │ │
│ │  ├─ 🎒 Add/Remove Item                    │ │
│ │  ├─ 🎵 Play Music/SFX                     │ │
│ │  ├─ ✨ Visual Effect                       │ │
│ │  ├─ 🏆 Unlock Achievement                 │ │
│ │  ├─ 💀 Horror Effect                      │ │
│ │  ├─ ⚔️ Combat Action                      │ │
│ │  └─ ⏱️ Utility (wait/clear/next)          │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Per-action forms:**

### StatAction
```
[Stat: hp ▼] [Operation: subtract ▼] [Value: 10]
→ Generates: #stat:hp:-10
```
- Stat dropdown populated from ConfigPanel stats definitions
- Operations: add (+), subtract (-), set (=)

### InventoryAction
```
[Action: Add ▼] [Item: llave_dorada] [Qty: 1]
→ Generates: #inv:add:llave_dorada or #inv:add:balas:5
```
- Item field: free text or dropdown from config if items defined

### AudioAction
```
[Type: Music ▼] [Track: horror_ambient] [○ Stop music]
→ Generates: #music:horror_ambient or #music:stop or #play_sfx:gunshot
```

### VFXAction
```
[Effect: ▼ Screen Shake / Flash Red / Flash White / Background / UI Effect]
[Background: forest_path]  ← conditional field based on effect type
→ Generates: #shake, #flash_red, #bg:forest_path, #UI_EFFECT:blur_vignette
```
- UI Effect sub-dropdown: blur_vignette, cold_blue, blood_pulse, static_mind, none

### AchievementAction
```
[Achievement: first_victory ▼]
→ Generates: #achievement:unlock:first_victory
```
- Dropdown from ConfigPanel achievements

### HorrorAction
```
[System: ▼ Willpower / Spider / Mouse Resistance / Mouse Magnet]

Willpower:  [Action: Start ▼] [Rate: fast ▼]
            → #WILLPOWER_START: fast
            [Action: Check ▼] [Threshold: 50]
            → #WILLPOWER_CHECK: 50
            [Action: Stop]
            → #WILLPOWER_STOP

Spider:     [Action: Start ▼] [Difficulty: normal ▼]
            → #SPIDER_START: difficulty=normal
            [Action: Check ▼] [Kills needed: 5]
            → #SPIDER_CHECK: 5

Mouse:      [Resistance: high ▼]
            → #MOUSE_RESISTANCE: high
```

### CombatAction
```
[System: ▼ Boss / Visual Damage / Arrebatados]

Boss:       [Action: Start ▼] [Name: Shadowlord] [HP: 200]
            → #BOSS_START: name=Shadowlord, hp=200
            [Action: Phase ▼] [Phase: 2]
            → #BOSS_PHASE: 2
            [Action: Damage ▼] [Amount: 25]
            → #BOSS_DAMAGE: 25

Arrebatados: [Action: Start ▼] [Count: 3] [Strength: 10]
             → #ARREBATADOS_START: count=3, fuerza=10
```

### UtilityAction
```
[Type: ▼ Wait / Clear / Next / Input]

Wait:   [Seconds: 3]           → #wait:3
Input:  [Variable: player_name] [Placeholder: Enter name...] → #input:player_name:Enter name...
Clear:                          → #clear
Next:                           → #next
```

**Data model change:**
- Node `data.content` stays as the single source of truth (text + tags mixed)
- ActionPanel reads tags FROM content (using `parseContent()`) and displays them as structured actions
- When actions are added/modified/removed/reordered, it regenerates the tag lines and merges with narrative text
- This way `generateInk.js` needs ZERO changes
- Slash commands (`/`) still work in text tab for power users

**Implementation steps:**
1. Create `ActionPanel.jsx` — container that parses existing tags from content, renders action list, handles add/remove/reorder
2. Create individual action form components (StatAction, AudioAction, etc.)
3. Create `actionToTag(action)` utility that converts structured action → tag string
4. Create `tagToAction(tag)` utility that parses tag string → structured action (reverse of slash commands)
5. Modify PassageNode.jsx edit mode to have Text/Actions tabs
6. Wire actions panel to read from and write back to `editContent`
7. Keep slash commands working in text tab (no regression)
8. Thread config data (stats, achievements, inventory categories) through to action forms for dropdowns
9. Write tests for `actionToTag` and `tagToAction` round-trip conversions

---

## 3. Visual Divert (Go To Node)

**Goal:** Let writers send the story to another passage without typing `-> knot_name`.

**Files to modify:**
- `src/editor/nodes/PassageNode.jsx` — Add "Go To" button in edit mode
- `src/editor/components/NodeSelector.jsx` — **NEW** — searchable dropdown of all nodes
- `src/editor/utils/generateInk.js` — Handle divert-only content lines (already works since `->` passes through as content)

**UI:**
```
┌─ Edit Node ─────────────────────────────┐
│ Text | Actions | [➡️ Go To]             │
│                                          │
│ After this passage, go to:               │
│ ┌──────────────────────────────────┐     │
│ │ 🔍 Search nodes...               │     │
│ │ ┌──────────────────────────────┐ │     │
│ │ │ 🏰 hub_intro (Chapter 1)    │ │     │
│ │ │ 📻 dark_room (Chapter 1)    │ │     │
│ │ │ 📻 forest_path (Chapter 2)  │ │     │
│ │ │ 📻 ending_good (Chapter 3)  │ │     │
│ │ └──────────────────────────────┘ │     │
│ └──────────────────────────────────┘     │
│                                          │
│ Current: → forest_path                   │
│ [Clear divert]                           │
└──────────────────────────────────────────┘
```

**Behavior:**
- Shows all available nodes with icons (hub/knot), labels, and chapters
- Search filters by label, id, or chapter
- Selecting a node adds `-> nodeId` as the LAST line of content
- Also creates an edge in the graph for visual connection
- "Clear divert" removes both the text divert and the edge
- This is for unconditional diverts (choices already handle conditional routing)

**Note:** This overlaps with edge connections. When a node has NO choices and a single outgoing edge, that edge is already rendered as `-> target` by generateInk. The "Go To" UI should:
- If no choices exist: show current edge target as the divert, allow changing
- If choices exist: "Go To" tab is hidden (choices handle routing)
- Creating a divert via this UI should also create the ReactFlow edge

**Implementation steps:**
1. Create `NodeSelector.jsx` — searchable dropdown listing all nodes
2. Add "Go To" tab/section in PassageNode edit mode (only visible when no choices)
3. When user selects a target node, create edge via `onConnect` callback + add `-> id` to content
4. When user clears divert, remove edge + remove `-> id` line from content
5. Sync: if user manually draws an edge on canvas, "Go To" reflects it
6. Write tests

---

## 4. Minigame Configuration Forms

**Goal:** When a writer inserts a minigame, show a form with all parameters instead of expecting them to type `minigame: type=qte, key=SPACE, timeout=1.5`.

**Files to modify:**
- `src/editor/components/actions/MinigameAction.jsx` — **NEW** (part of ActionPanel)
- `src/editor/utils/slashCommands.js` — Expand minigame entries with param definitions

**UI (inside ActionPanel):**
```
┌─ Minigame: QTE ─────────────────────────┐
│ Type: [QTE ▼]                            │
│                                          │
│ Key to press:  [SPACE ▼]                 │
│ Time limit:    [1.5] seconds             │
│ Auto-start:    [✓]                       │
│                                          │
│ → #minigame: type=qte, key=SPACE,       │
│   timeout=1.5, autostart=true            │
└──────────────────────────────────────────┘
```

**Per-type forms:**

| Type | Fields |
|------|--------|
| **QTE** | Key (dropdown: SPACE, ENTER, Q-Z), Timeout (number, seconds) |
| **Lockpick** | Zone size (slider 0.05-0.5), Speed (slider 0.5-3.0) |
| **Arkanoid** | (no params) |
| **Apnea** | Duration (number, seconds) |
| **KeyMash** | Key (dropdown), Count (number), Time limit (number, seconds) |

- Each type shows only its relevant fields
- Preview of generated tag shown at bottom
- Supports `{variable}` syntax: toggle next to numeric fields to use a variable instead of fixed value
- Auto-start checkbox (default true)

**Implementation steps:**
1. Define `MINIGAME_PARAMS` config object mapping type → field definitions
2. Create `MinigameAction.jsx` with type selector and dynamic form
3. Integrate into ActionPanel as a minigame action type
4. `actionToTag` generates proper `#minigame: type=X, ...` format
5. `tagToAction` parses existing minigame tags back into form state
6. Write tests

---

## 5. Variable Inspector in Preview

**Goal:** While testing a story in preview, writers need to see what their variables are set to.

**Files to modify:**
- `src/editor/components/PreviewPanel.jsx` — Add variable sidebar/drawer

**UI:**
```
┌─ Preview ──────────────────────────────────────┐
│ ┌──────────────────────────┐ ┌───────────────┐ │
│ │                          │ │ 📊 Variables  │ │
│ │  You enter the room.     │ │               │ │
│ │  The door slams shut.    │ │ hp: 85        │ │
│ │                          │ │ karma: +2     │ │
│ │  > [Look around]        │ │ has_key: true  │ │
│ │  > [Try the door]       │ │ score: 150    │ │
│ │                          │ │               │ │
│ │                          │ │ minigame_     │ │
│ │                          │ │ result: 1     │ │
│ │                          │ │               │ │
│ │  [Continue]    [Back]    │ │ willpower_    │ │
│ │                          │ │ passed: false │ │
│ └──────────────────────────┘ └───────────────┘ │
│ [Restart]                    [Toggle vars ▼]   │
└────────────────────────────────────────────────┘
```

**Behavior:**
- Collapsible sidebar showing all Ink variables and their current values
- Updates in real-time after each story step
- Highlights variables that changed on the last step (flash yellow)
- Color-coded by type: numbers=cyan, strings=green, booleans=amber
- Toggle button to show/hide

**Implementation steps:**
1. In PreviewPanel, after each `story.Continue()`, read `story.variablesState` to get all current values
2. Track previous values to detect changes (for highlight animation)
3. Add collapsible sidebar panel with variable list
4. Style with change-highlight animation
5. Add toggle button to footer

---

## Estimated Scope

| Feature | New files | Modified files | Complexity |
|---------|-----------|---------------|------------|
| Condition Builder | 1 | 2 | Medium |
| Action Panel | ~10 | 2 | Large |
| Visual Divert | 1 | 2 | Medium |
| Minigame Forms | 1 | 1 | Medium |
| Variable Inspector | 0 | 1 | Small |

**Total: ~13 new files, ~4 modified files**

**Recommended order:** Variable Inspector (quick win) → Condition Builder → Visual Divert → Minigame Forms → Action Panel (biggest, benefits from others being done first)
