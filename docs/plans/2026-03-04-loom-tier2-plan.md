# Loom Editor — Tier 2: UX Power-Ups

> These dramatically improve the writing workflow once Tier 1 is in place.

---

## 6. Context Menu (Right-Click)

**Goal:** Quick access to common node operations without hunting through toolbars.

**Files to modify:**
- `src/editor/components/ContextMenu.jsx` — **NEW**
- `src/editor/BardoEditor.jsx` — Add right-click handler, manage menu state

**UI:**
```
Right-click on node:
┌─────────────────────────┐
│ ✏️  Edit                 │
│ 📋  Duplicate            │
│ ─────────────────────── │
│ 🏰  Convert to Hub      │
│ 📻  Convert to Knot     │
│ ─────────────────────── │
│ 📑  Set Chapter...      │
│ 🔗  Connect to...       │
│ ─────────────────────── │
│ 🗑️  Delete              │
└─────────────────────────┘

Right-click on canvas (empty space):
┌─────────────────────────┐
│ 📻  New Knot here       │
│ 🏰  New Hub here        │
│ ─────────────────────── │
│ 📋  Paste node          │
│ ─────────────────────── │
│ 🔍  Search (Ctrl+P)     │
│ 📐  Auto-layout         │
└─────────────────────────┘

Right-click on edge:
┌─────────────────────────┐
│ 🗑️  Delete connection   │
└─────────────────────────┘
```

**Behavior:**
- Appears at cursor position, dismisses on click-away or Escape
- "Connect to..." opens NodeSelector (from Tier 1) as a submenu
- "Set Chapter..." opens inline input
- Actions reuse existing BardoEditor functions (addNode, deleteNode, etc.)

**Implementation steps:**
1. Create `ContextMenu.jsx` — receives `{x, y, type, nodeId?, edgeId?}`, renders appropriate menu
2. In BardoEditor, add `onNodeContextMenu`, `onPaneContextMenu`, `onEdgeContextMenu` handlers
3. Prevent default browser context menu
4. Wire menu items to existing editor actions
5. "Duplicate" calls new `duplicateNode(nodeId)` function (see #7)
6. "Connect to..." opens NodeSelector popup at menu position

---

## 7. Copy/Duplicate Nodes

**Goal:** Writers often want "a scene similar to this one" — duplicate is essential.

**Files to modify:**
- `src/editor/hooks/useEditorState.js` — Add `duplicateNode(nodeId)` function
- `src/editor/BardoEditor.jsx` — Add Ctrl+D shortcut, wire to context menu

**Behavior:**
- Duplicated node placed at offset (+50, +50) from original
- Gets new unique ID: `original_id_copy` (or `_copy2`, `_copy3` if collisions)
- Copies: content, choices (without edges), type, chapter, label (with " (copy)" suffix)
- Does NOT copy: edges (user must reconnect), burned state
- Selected automatically after creation
- Undo-able

**Implementation steps:**
1. Add `duplicateNode(nodeId)` to useEditorState:
   - Deep clone node data
   - Generate new ID with collision check
   - Offset position
   - Add to nodes array
   - Push undo snapshot
2. Add Ctrl+D keyboard shortcut in BardoEditor (check selectedNode exists)
3. Wire to context menu "Duplicate" item
4. Write tests

---

## 8. Node Templates

**Goal:** Pre-built node structures for common narrative patterns so writers don't start from blank.

**Files to modify:**
- `src/editor/components/TemplatePanel.jsx` — **NEW**
- `src/editor/BardoEditor.jsx` — Add template button to toolbar, template insertion logic
- `src/editor/utils/nodeTemplates.js` — **NEW** — template definitions

**Templates:**

### Simple Branch
```
┌──────────────┐     ┌──────────────┐
│  Decision    │────→│  Option A    │
│  Point       │     └──────────────┘
│              │────→┌──────────────┐
│  (2 choices) │     │  Option B    │
└──────────────┘     └──────────────┘
```
- 1 knot with 2 choices + 2 target knots, pre-connected

### Three-Way Branch
- Same but 3 choices + 3 targets

### Hub with Burn
```
┌──────────────┐     ┌──────────────┐
│  Explore Hub │────→│  Room 1      │
│  (hub type)  │────→│──────────────│
│              │────→│  Room 2      │
│  3 options   │     │──────────────│
└──────────────┘     │  Room 3      │
                     └──────────────┘
```
- 1 hub with 3 choices + 3 knots, choices are consumable (*)

### Combat Encounter
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Boss Intro  │────→│  Fight       │────→│  Victory     │
│  BOSS_START  │     │  (minigame)  │  ┌→│              │
└──────────────┘     │  BOSS_CHECK  │  │  └──────────────┘
                     └──────┬───────┘  │  ┌──────────────┐
                            └──────────┘→ │  Defeat      │
                            (condition)    └──────────────┘
```
- Pre-wired with boss tags, minigame, and conditional branching on boss_defeated

### Horror Sequence
- Willpower drain start → text passages → willpower check → pass/fail branches

### Puzzle (Minigame)
- Intro → minigame node → success/failure branches (conditioned on minigame_result)

### Dialogue Loop
- Hub with sticky choices that return to the same hub, plus an "exit" choice

**UI:**
```
┌─ Insert Template ──────────────────────┐
│                                        │
│ 🔀 Simple Branch      — 2-way choice  │
│ 🔀 Three-Way Branch   — 3-way choice  │
│ 🏰 Exploration Hub    — Burnable hub  │
│ ⚔️ Combat Encounter   — Boss fight    │
│ 💀 Horror Sequence    — Willpower     │
│ 🧩 Puzzle             — Minigame      │
│ 💬 Dialogue Loop      — NPC talk      │
│                                        │
│ Click to insert at cursor position     │
└────────────────────────────────────────┘
```

**Implementation steps:**
1. Define templates in `nodeTemplates.js` as arrays of `{nodes, edges}` with relative positions
2. Create `TemplatePanel.jsx` with template list + descriptions
3. On selection: offset all positions to canvas center or last click position, generate unique IDs, insert nodes + edges
4. Push undo snapshot
5. Add toolbar button (template icon) to open panel

---

## 9. Hub Burn Rules Visual Builder

**Goal:** Replace raw JSON editor for hub exclusion logic with checkboxes/toggles.

**Files to modify:**
- `src/editor/components/BurnRulesEditor.jsx` — **NEW**
- `src/editor/BardoEditor.jsx` — Replace JSON textarea in node properties with BurnRulesEditor

**Current (JSON):**
```json
[
  {"id": "room_1", "maxVisits": 1},
  {"id": "room_2", "maxVisits": 2}
]
```

**New UI:**
```
┌─ Hub Burn Rules ──────────────────────────┐
│                                            │
│ Connected passages:                        │
│                                            │
│ ☑ room_1 — Burns after [1 ▼] visit(s)    │
│ ☑ room_2 — Burns after [2 ▼] visit(s)    │
│ ☐ room_3 — Never burns                    │
│                                            │
│ [Select all] [Clear all]                   │
└────────────────────────────────────────────┘
```

**Behavior:**
- Auto-populates from outgoing edges of the hub node
- Checkbox enables/disables burn rule per target
- Dropdown for maxVisits (1-5, or "unlimited")
- Generates the JSON structure that the engine expects
- If writer adds new edge, it appears in the list automatically

**Implementation steps:**
1. Create `BurnRulesEditor.jsx` — receives hub node data + outgoing edges
2. Compute connected targets from edges
3. Render checkbox + visit-count dropdown per target
4. On change, update `node.data.burnRules` array
5. Replace the JSON textarea in BardoEditor's node properties panel
6. Write tests

---

## 10. Example Project

**Goal:** New writers should be able to open a complete example to learn from.

**Files to create:**
- `src/editor/utils/exampleProject.js` — **NEW** — full project data
- Modify `src/editor/BardoEditor.jsx` — "Load Example" button in toolbar or empty state

**Example project contents:**
- Title: "The Haunted Mansion" (demonstrates horror features)
- ~15 nodes across 3 chapters
- Demonstrates:
  - Text narration with choices (sticky + consumable)
  - Hub with burn rules
  - Stats (hp, courage) with modifications
  - Inventory (key, flashlight)
  - 1 achievement
  - Audio (music + sfx)
  - VFX (shake, flash, background changes)
  - 1 minigame (QTE or lockpick)
  - Willpower system (short sequence)
  - Conditional choices (based on inventory + stats)
  - Multiple endings
- Variables: hp, courage, has_key, player_name, minigame_result
- Clean layout that auto-layouts nicely

**UI:**
```
Empty editor state:
┌────────────────────────────────────────────┐
│                                            │
│       Welcome to The Loom                  │
│                                            │
│  [🆕 New Project]  [📂 Import]            │
│                                            │
│  [📖 Load Example Project]                │
│  "The Haunted Mansion" — Learn by example  │
│                                            │
└────────────────────────────────────────────┘
```

Also accessible from toolbar: `[📖 Example]` button.

**Implementation steps:**
1. Design the example story graph (15 nodes, 3 chapters)
2. Write content that naturally uses all major features
3. Export as `exampleProject.js` constant
4. Add "Load Example" to toolbar + empty state
5. Loading example triggers `importProject`-like flow (with confirmation if dirty)

---

## Estimated Scope

| Feature | New files | Modified files | Complexity |
|---------|-----------|---------------|------------|
| Context Menu | 1 | 1 | Medium |
| Copy/Duplicate | 0 | 2 | Small |
| Node Templates | 2 | 1 | Medium |
| Burn Rules Editor | 1 | 1 | Small-Medium |
| Example Project | 1 | 1 | Medium (content) |

**Total: ~5 new files, ~4 modified files**

**Recommended order:** Copy/Duplicate (quick, enables context menu) → Context Menu → Burn Rules Editor → Node Templates → Example Project (benefits from all other features being done)
