# Phase 9: Slash Command Editor

**Date:** 2026-02-21
**Branch:** feature/loom-editor-v2

## Problem

The tag button panel in BardoEditor grows unboundedly — every new engine system adds more buttons. Authors must break writing flow to locate and click the right button. The panel already has 30+ tags across 5 categories and will keep expanding.

## Solution

Replace button-clicking with slash commands typed directly in the narrative textarea. Type `/shake` → `#shake` is inserted. Focus stays on writing.

## What Changes

### 1. Right panel — remove content textarea and tag buttons

The right panel keeps only node metadata:
- Node ID
- Display Label
- Chapter
- Type (hub/knot)
- Hub Burn Rules
- Burned toggle

The content textarea and the entire categorized tag button section are removed. The inline node editor (double-click on canvas) is the sole writing surface.

### 2. SlashCommandPalette component

New component: `src/editor/components/SlashCommandPalette.jsx`

**Trigger:** User types `/` anywhere in the textarea.

**Behavior:**
- Palette appears docked below the textarea
- Filters in real time as user continues typing (e.g. `/sh` shows shake, flash_white)
- Keyboard navigation: Arrow Up/Down to move, Enter to select, Esc to dismiss
- Click to select
- Dismissed automatically when `/word` pattern is no longer present

**Insertion:**
- No-value commands (e.g. `/shake`): replaces `/shake` with `#shake`
- Value commands (e.g. `/music`): replaces `/music` with `#music:`, cursor positioned after the colon

### 3. SLASH_COMMANDS data model

Replaces `BARDO_TAGS` constant in BardoEditor.jsx.

```js
{
  cmd: string,        // what user types after /
  tag: string,        // resulting #tag inserted
  desc: string,       // shown in palette
  category: string,   // VFX | Minigame | Horror | Combat | Game
  hasValue: boolean,  // if true, insert tag + position cursor after
}
```

All ~30 existing BARDO_TAGS become slash commands. Minigame subtypes (qte, lockpick, arkanoid, apnea, keymash) each get their own command.

### 4. Integration into PassageNode.jsx

The textarea `onChange` handler gains slash detection logic:
- Extract the current "word" being typed (text from last whitespace or newline to cursor)
- If it starts with `/` and has ≥1 char after, show palette with filtered results
- On selection, splice the `/word` out of the textarea value and insert the tag

## Data Flow

```
User types /shake
  → onChange detects /shake at cursor
  → SlashCommandPalette renders filtered list: [shake, flash_white, ...]
  → User presses Enter or clicks "shake"
  → /shake replaced with #shake in textarea value
  → Palette hides
  → onChange fires → content saved to node data
```

## Files Modified

| File | Change |
|------|--------|
| `src/editor/nodes/PassageNode.jsx` | Add slash detection, render SlashCommandPalette |
| `src/editor/components/SlashCommandPalette.jsx` | New component |
| `src/editor/BardoEditor.jsx` | Remove content textarea + tag panel from right panel; move BARDO_TAGS → SLASH_COMMANDS |

## Out of Scope

- Floating cursor-following palette (deferred, not worth complexity for small textarea)
- Slash commands in the right panel (panel no longer has a content textarea)
- Value prompts / sub-menus (insert-and-type is sufficient)
