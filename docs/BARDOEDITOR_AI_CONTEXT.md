# BardoEditor - AI Development Context

> **Copy this entire file when starting work with a new AI assistant.**

## Quick Summary
Building a visual node-based story editor (like Twine) for BardoEngine. Target: writers who want to create interactive stories without coding.

## Project Location
```
Z:\scrapyard\bardoengine
```

## Current Branch
```
feature/phase3-bardoeditor-hubs-8648822128927855968
```

## Tech Stack
- React 18 + Vite
- ReactFlow (node canvas)
- Tailwind CSS
- inkjs (Ink runtime)
- TypeScript (partial)

## Key Editor Files
```
src/editor/BardoEditor.jsx      # Main editor (400 lines, exists)
src/editor/nodes/HubNode.jsx    # Hub node component
src/editor/nodes/KnotNode.jsx   # Knot node component  
src/editor/utils/generateInk.js # Graph → Ink generator
src/hooks/useHubs.ts            # Hub exclusion system
```

## Key Engine Files
```
src/components/Player.jsx       # Game player component
src/hooks/useBardoEngine.ts     # Core engine hook
src/hooks/useStoryLoader.js     # Story loading logic
src/stories/*.config.json       # Story config examples
```

## Commands
```powershell
npm run dev      # Dev server at localhost:5173
npm test         # Run Vitest tests
npm run build    # Production build
```

## VFX Tags (for autocomplete)
```
#shake, #flash, #slow, #pause
#play_sfx:sound_name
#play_music:track_name
#stop_music, #fade_in, #fade_out
```

## GitHub Issues

| Phase | Issue | Priority |
|-------|-------|----------|
| Phase 1: Foundation | [#57](https://github.com/dseptem777/bardoengine/issues/57) | High |
| Phase 2: Node System | [#58](https://github.com/dseptem777/bardoengine/issues/58) | High |
| Phase 3: Preview | [#59](https://github.com/dseptem777/bardoengine/issues/59) | Medium |
| Phase 4: Export | [#60](https://github.com/dseptem777/bardoengine/issues/60) | Medium |
| Phase 5: Polish | [#61](https://github.com/dseptem777/bardoengine/issues/61) | Low |

---

## Current Task: BardoEditor Lite

### Phase 1: Foundation
- [ ] Save/load projects (localStorage + JSON file)
- [ ] Proper state management

### Phase 2: Node System  
- [ ] ChoiceNode for branching
- [ ] Content editor with tag autocomplete

### Phase 3: Preview
- [ ] Embed BardoEngine Player
- [ ] Live Ink preview

### Phase 4: Export
- [ ] Generate bardo_data_full.json
- [ ] Generate story config

### Phase 5: Polish
- [ ] Keyboard shortcuts
- [ ] Undo/redo

## Important Data Flow
```
Graph nodes → generateInk() → inkjs compile → JSON → Player
```

BardoEditor outputs **compiled JSON** (inkjs format), not raw .ink.

## Style Guide
- Dark theme: bg #0a0a0a, accent #facc15
- Font: Inter
- Material Symbols for icons

## Git Flow
1. Work on feature branch
2. Test with `npm test`
3. PR to `dev` branch
4. Never commit directly to `main`

## Reference Files
- `src/stories/serruchin.config.json` - Full config example
- `centinelas.ink` - Complex Ink story example
- `docs/` - Additional documentation
