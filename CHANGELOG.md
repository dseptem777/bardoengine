# Changelog — BardoEngine

## v0.22.2 (2026-04-21)

### Fixes
- **audio assets committed**: 87 archivos `.mp3` en `public/sounds/` (SFX con variantes multi-take) ahora rastreados en git. Tag `paso_agua` removido del ink — el sonido existe pero no encajó narrativamente.
- **achievement badges**: imágenes actualizadas (`duro rocky`, `ratoncito`), carpeta `old/` eliminada.

---

## v0.22.1 (2026-04-21)

### Features
- **SFX random variants**: engine (`useAudio.js`) ahora selecciona aleatoriamente entre múltiples takes cuando existen (`golpe_a/b/c/d` → uno random por call). Implementado via `SFX_VARIANTS` map inline antes de `playSfx`. También resuelve mismatches de nombre (`disparos_escopeta` → `escopeta_a/b`, `explosion_magica` → `magiexplosion_a/b`) sin tocar el ink.
- **5 SFX nuevos en ink**: `trueno_cercano` (cubil_fuerza), `boladefuego` (combate_magia), `sal_romperse` (vampiro_trampa), `cuerda_rota` (pozo_bajar), `paso_agua` (epilogo charcos).

---

## v0.22.0 (2026-04-21)

### Features
- **audio Centinelas — T3 SFX + T4 stingers + stingers de origen**: 18 nuevos tags en el ink — music gaps reparados (8 knots), 3 stingers de origen en Cap 0 (`stinger_magia`, `stinger_fuerza`, `stinger_conocimiento`), SFX T3 diegéticos (`trueno_lejano`, `canto_gutural`, `susurro_multiple`), mood stingers T4 (`sting_horror`, `sting_moral`, `sting_revelacion`, `drone_tenso`). Los archivos de audio están documentados en `memory/sfx-prompts.md` (36 entradas con prompts ElevenLabs + queries Freesound). El engine acepta tags faltantes silenciosamente — los SFX se activan al depositar los `.mp3` en `public/sounds/`.

---

## v0.21.0 (2026-04-20)

### Features
- **cobertura de audio Centinelas — Tier 1 + Tier 2**: +~120 cues `music:` de ambiente por locación (orfanato, bóveda, cuevas, cementerio, cubil, pasillo, ritual, intermisión) + 7 inserciones `stop_music` en beats dramáticos clave (epílogo, conversión a vampiro, muerte lúcida). Cobertura sube de ~11% a ~50% del árbol narrativo. Minijuegos excluidos por diseño.

---

## v0.20.1 (2026-04-13)

### Fixes
- **modo daltónico — cambios de color reales**: rojo → naranja (`#ef4444` → `#f97316`), verde → azul (`#22c55e` → `#3b82f6`) en karma (StatsPanel), WillpowerMeter (ojo SVG), CSS global para clases Tailwind semánticas; paleta deuteranopia
- **preview de colores en Opciones**: swatch animado debajo del toggle "Modo Daltónico" — muestra color actual de Peligro y Éxito, cambia en tiempo real al activar
- **useSettings fuera de provider**: devuelve defaults seguros en lugar de lanzar error, evita crashes en tests unitarios sin wrapper

---

## v0.20.0 (2026-04-13)

### Features
- **modo daltónico**: toggle en Opciones → Accesibilidad; agrega indicadores no-color en WillpowerMeter (porcentaje numérico), StatsPanel karma (flechas ↑↓—), LockpickGame (icono ✗ en fallo); implementado via `data-colorblind` attribute + CSS helpers
- **modo disléxico**: toggle en Opciones → Accesibilidad; cambia fuente narrativa a Atkinson Hyperlegible, aumenta letter-spacing/line-height, reemplaza itálicas con negrita; implementado via `data-dyslexic` attribute + CSS global
- **Atkinson Hyperlegible**: cargada desde Google Fonts en `index.html`

---

## v0.19.1 (2026-04-13)

### Refactor
- **eliminación de BardoEditor**: borrado todo el código del editor visual (`src/editor/`, lazy import, estado `showEditor`, botón en StorySelector) — era código muerto deprecado, nunca se usará en producción

---

## v0.19.0 (2026-04-11)

### Features
- **sistema de imágenes en achievements**: soporte para campo `image` en config — badges JPEG se muestran en el grid y modal de logros; locked muestra círculo con `?`
- **BadgeImage component**: canvas BFS flood fill con erosion pass para eliminar fondo de badges
- **21 nuevos achievements en Centinelas**: personajes (Enríquez, Shelley, Cabral, tarotista), compañeros (Juan, Alegría), niños (4 tiers), morgue, Cap2B (vampiro, cruz, Tuco, cana, willpower)
- **fanzine cheat code**: además de habilitar debug mode, ahora desbloquea todos los achievements de una
- **hardening del player**: `user-select: none` global, context menu deshabilitado, drag de assets deshabilitado

---

## v0.18.10 (2026-04-11)

### Fixes
- **spider darkness ignora ID card**: StatsPanel subido de z-[150] a z-[820] — la oscuridad ya no tapa la tarjeta de stats (desktop e mobile)
- **linterna arañas más grande**: radios del torch aumentados ~1.45x (slow: 200px, normal: 170px, fast: 130px, extreme: 95px)

---

## v0.18.9 (2026-04-11)

### Fixes
- **minigame CONTINUAR loop**: autosave se disparaba después del break por tag MINIGAME porque `story.canContinue` sigue siendo `true` en ese punto — sobrescribía el save de paginación con un estado post-tag. Al cargar con CONTINUAR, el story pointer ya había pasado el tag → iba directo a muerte sin mostrar el minigame. Corregido saltando autosave cuando se detecta tag `minigame:`.
- **minigameController stale state**: `continueGame()` y `loadSave()` ahora llaman `minigameController.reset()` tras `initStory()` para limpiar estado residual de intentos anteriores.

---

## v0.18.6 (2026-04-08)

### Fixes
- **muerte chapter break**: `rawSpawnAtKnot` retornaba tags pero no se llamaba `processTags` — chapter break y texto de muerte nunca se mostraban. Corregido.
- **WillpowerMeter test flaky**: test de timing dependía de `Math.random()` no mockeado — el segundo whisper podía aparecer y desvanecerse dentro del mismo `advanceTimersByTime`. Ahora usa `vi.spyOn(Math, 'random').mockReturnValue(0)` para tiempos determinísticos.

---

## v0.18.5 (2026-04-08)

### Fixes
- **hp=0 → muerte**: `checkZeroStats` nunca se llamaba después de procesar tags de stat. Ahora `continueStory` sincroniza stats Ink→React después de `processTags` y evalúa condiciones `onZero` leyendo `story.variablesState` directo (no React state async). Fix también aplicado en `debugSetVariables`.
- **Ink variable `hp` no declarada**: `centinelas.ink` declaraba `VAR salud` pero los tags usaban `stat:hp:` — inkjs rechazaba silenciosamente la escritura. Renombrado a `VAR hp = 100`.
- **`useStats.ts`**: tipo `onZero` extiende con campos `knotName` y `message`.

---

## Centinelas v0.14.0 (2026-04-07)

### Fixes
- **intermision_playa**: agregado `# next` entre el bloque de texto condicional y el divert — ahora aparece el botón "siguiente" antes de transicionar al knot destino

---

## v0.18.4 (2026-04-07)

### Fixes
- **useTagProcessor: stat→Ink sync**: corregido bug donde `# stat:X:+N` no sincronizaba el nuevo valor a la variable Ink — `getStatInfo` leía el React state antes del re-render (stale), escribiendo el valor viejo de vuelta. Ahora se calcula desde la variable Ink actual + delta, aplicando los mismos bounds min/max del config.

---

## v0.18.3 (2026-04-07)

### Fixes
- **StatsPanel layout (fix definitivo)**: la ID card ya no tapa el texto en ningún viewport
  - `maxWidth: 280px` en la card — impide que los stats en fila expandan la card más allá del inset asumido
  - Nuevo hook `useIsNarrowViewport` (≤1023px): viewports 640-1023px ahora muestran slim bars en lugar de la ID card
  - `--stats-panel-inset` actualizado a 320px para el nuevo ancho máximo de la card
  - `HeaderStats` visible en el header para viewports 640-1023px cuando la card está oculta

---

## v0.18.2 (2026-04-07)

### Fixes
- **StatsPanel layout**: fix ID card overlapping story text on medium-width viewports (768px–1288px) using CSS `max()` to ensure text container never sits under the fixed card

---

## v0.18.1 / Centinelas v0.13.0 (2026-04-05)

### Features — Centinelas: Intermisión 2
- **Intermisión 2 hub**: nueva intermisión post-cap2 con intro narrativa (insomnio, pesadillas, preocupación por la Secta) y 5 opciones de actividad
- **inter2_playa**: encuentro con el mar hostil, ola gigante
- **inter2_tarot**: casa de tarotista vacía con mensaje meta-demo (4th wall)
- **inter2_enfermeria**: Mary Shelley y sustancia orgánica restauradora (+5 hp)
- **inter2_abuelita**: cacería de súcubo con la Abuelita — 3 sub-ramas:
  - Cocina (entrada trasera): seducción del súcubo, check `fuerza >= 20`, `conocimiento >= 25` lore — `amistad_abuela +2`
  - Escándalo: fracaso en la puerta, policía — `amistad_abuela +0`
  - Banda "Vieja Loca": show en escenario, check `conocimiento >= 20` (bajo) — `amistad_abuela +2`
- **inter2_siguiente**: mission gate con CHAPTER_BREAK hacia Capítulo 3
- **capitulo_3**: placeholder "PRÓXIMAMENTE — El Museo"
- **Routing**: cap2a y cap2b_epilogo ahora fluyen a `intermision_2` en lugar de `-> END`
- **amistad_abuela**: nuevo stat relationship en config (max 6, color púrpura)

---

## v0.18.1 / Centinelas v0.12.2 (2026-04-05)

### Fixes — Centinelas
- Eliminados los 2 QTE de la rama del vampiro (no aptos para mobile, sin lugar narrativo)
- Agregado texto de transición en `cap2b_trampa_liberar`: el jugador ya tenía la estaca lista cuando liberó el círculo

---

## v0.18.1 / Centinelas v0.12.1 (2026-04-04)

### Fixes — Music Tags (centinelas.ink)
- `ciudad_ambient` → `city_ambient` (archivo existente)
- `orfanato_ambient` → `orfanato` (archivo existente)
- `cueva_ambient` → `cueva_arañas` (archivo existente)

### Fixes — Tests
- `useTagProcessor.genjutsu`: tests actualizados para la firma de 3 args `(stat, knot, fisuraText)`
- `TextDisplay.genjutsu`: `data-testid="genjutsu-break"` movido al `<span>` de GenjutsuFisura; opacity aplicado incondicionalmente (no gateado por `active`/rAF)
- `TextDisplay`: test `onComplete when isTyping=false` usa `typewriterDelay={0}` para modo instantáneo

---

## v0.18.0 (2026-04-04)

### Features — Chapter Break System
- **ChapterBreakOverlay**: nuevo componente fullscreen para title cards entre capítulos (imagen, título, subtítulo)
- **CHAPTER_BREAK tag**: parseado en `useTagProcessor` con soporte para `title=`, `subtitle=`, `image=`, `music=` y referencias `{variable}`
- **chapterBreakHasTextRef**: detecta si el break llegó junto a texto — en ese caso dismiss no llama a continueStory, el texto ya está cargado
- **makeChoice path**: también setea el flag cuando el divert a un nuevo knot tiene CHAPTER_BREAK + texto
- **chapterBreakCooldown**: 400ms cooldown post-dismiss para evitar skip accidental del siguiente contenido
- **chapterBreakActive prop**: deshabilita keyboard navigation mientras el overlay está activo o en cooldown

### Fixes — Input System
- **Input snapshot/restore**: `processStoryLoop` guarda estado pre-Continue al detectar tag `input:`, `commitInput` restaura y replay con la variable ya seteada — texto como `"Bienvenido {nombre}"` se resuelve correctamente
- **inputReplayingRef**: flag doble (en useStoryState + useBardoEngine) evita que el dialog se muestre de nuevo durante el replay

### Fixes — Anti-Spam
- **event.repeat guard**: `useKeyboardNavigation` y `ChapterBreakOverlay` ignoran teclas mantenidas (auto-repeat del browser)

---

## v0.17.0 (2026-03-24)

### Features — Spider Infestation (Torch & Corruption)
- **Complete redesign**: cursor = antorcha, oscuridad cubre la pantalla con agujero en la luz
- **Corrupción directa**: CSS `filter: blur + brightness` aplicado directo al DOM de párrafos (no overlays rectangulares)
- **Telarañas orgánicas**: SVG full-screen con geometría radial real (radios + anillos concéntricos) en lugar de líneas aleatorias
- **Arañas graduales**: spawn trickle de 1 araña cada 4s hasta el cap de dificultad
- **Pausa automática**: overlay se pausa (y oscuridad se oculta) al abrir cualquier menú
- **Restauración suave**: ~2.5s para limpiar corrupción; telaraña SVG decae más lento (~10s) con mapa independiente
- **Fix anti-parpadeo**: filtro CSS aplicado directo en el game loop (no via React state), elimina reinicio de transitions
- **Fix unblur**: usa distancia al punto más cercano del rect (no al centro) — el mouse sobre el texto siempre restaura
- **Save/restore**: `continueGame` ahora restaura sistemas paralelos (spider, willpower, arrebatados) igual que `loadSave`
- **parallelSystems**: campo en `useSaveSystem` para guardar/restaurar estado de todos los sistemas paralelos

### Fixes — UI
- **StatsPanel z-index**: subido a z-[150], queda visible sobre minigames
- **DebugSpawnModal z-index**: subido a z-[9999], no lo tapan las arañas
- **centinelas.ink**: choices en `boveda_capullo` cambiados de `*` a `+` (sticky) para evitar que se quemen

## v0.16.0 (2026-03-23)

### Features — CrawlGame
- **Nuevo minigame narrativo**: reemplaza apnea #2 (taquilla) con CrawlGame — sostener V arrastra al personaje, soltar recupera estamina
- **Texto acumulativo reactivo**: hold, release, baja estamina, forced release, sustos aleatorios, hitos de progreso
- **VFX**: vignette rojo, manchas de sangre como blobs CSS progresivos, shake, degradación de texto, scare flash
- **SFX**: heartbeat_loop, 3 groans situacionales con pitch variation via Web Audio API (detune independiente)
- **Balance**: 14%/s drain, 4.5%/s progreso, 45s time limit

---

## v0.15.0 (2026-03-23)

### Security
- **Encryption key rotation**: Move hardcoded key to `BARDO_ENCRYPTION_KEY` env var. Old key burned from git history. `encrypt-story.cjs`, `crypto.rs`, and `build-game.cjs` all read from `.env` or environment.

### Fixes — Engine Correctness
- **Forced click**: Replace hardcoded `makeChoice(1)` with last-choice selection
- **useHeavyCursor**: Replace `innerHTML` with `createElement` (XSS prevention)
- **useSpiderInfestation**: Track `squashSpider` setTimeout in `pendingTimeoutsRef`
- **useStats**: Fix setState during render → `useEffect` with ref
- **useGameSystems**: Remove dead minigame branch (handled by `useTagProcessor`)
- **ForcedClickOverlay**: Replace 50ms `setInterval` polling with `MutationObserver` + `ResizeObserver`
- **App.jsx**: Add try/catch for localStorage quota on dev story import

### Fixes — Performance
- **useAudio**: Remove hardcoded `SOUNDS`/`MUSIC` registries, use dynamic path resolution (`/sounds/{id}.mp3`)

### Mobile + Accessibility
- **QTEGame**: Add touch/click support on key display (mobile playable)
- **useModalA11y**: New hook — focus trap, Escape key, ARIA attributes, focus restore
- **Modals**: Apply `useModalA11y` to SaveLoadModal, OptionsModal, ExtrasMenu, HistoryLog
- **MinigameOverlay**: Add keyboard dismiss for result screen

### UX Polish
- **OptionsModal**: Fix typewriter speed labels (Instantáneo↔Lento), add two-step RESET confirmation
- **TextDisplay**: Allow text selection, change cursor to default
- **Player**: Use CSS truncation for mobile title instead of `split(' ')[0]`
- **ChoiceButton**: Show "Seguí haciendo click" hint on first resistance click
- **SaveLoadModal**: Improve overwrite section header (orange tint)
- **RelationshipsPanel**: Add close button to desktop panel
- **useStoryState**: Add missing `continueLabel` to TypeScript interface

---

## v0.14.1 (2026-03-22)

### Critical Fixes
- **MinigameOverlay**: `hasCommittedRef` guard prevents double `onFinish` from timeout+click race
- **cancelGame**: Now commits failure result (0) to prevent permanent story deadlock
- **useAudio**: `stopMusic` captures Howl locally + `fadeTimeoutRef` prevents killing new tracks
- **ExtrasMenu**: Only stops music if user was on jukebox page, preserves game BGM

### Other Fixes
- **QTEGame**: Move `finish()` out of state updater into `useEffect` (StrictMode safe)
- **Player**: Disable save/load button during active minigame
- **App**: Remove duplicate `useStoryLoader`, sync storyId from AppContent to parent
- **useStoryState**: Clear choices and end story on critical Ink error
- **useAchievements**: Eliminate double `loadUnlocked()` on init

---

## v0.14.0 (2026-03-22)

### UI/UX Overhaul (7 stages)
- **Stage 1**: Remove emoji from title, add intro config, translate minigame strings to Spanish, remove footer and console.log spam
- **Stage 2**: Configurable branding — game title in header, roleLabel for stats, input label prop, hide Continue when no save
- **Stage 3**: Modal consistency — unified backgrounds, borders, border-radius, inline delete confirmation
- **Stage 4**: SVG icon system via `lucide-react` — replace 18 UI emoji with cross-platform SVG icons
- **Stage 5**: UX flow — minigame result timing 800→1500ms, QTE ¡YA! flash state, HistoryLog scroll position, styled error card, Arkanoid configurable rows/cols, inventory close button
- **Stage 6**: Cross-browser polish — `color-mix()` fallbacks, serif font fix, GalleryPage React fix, Jukebox music continuity
- **Stage 7 (Centinelas)**: 5 achievements, 19-track jukebox, achievement tags in ink, SFX audit

---

## v0.13.0 (2026-03-21)

### Features
- **Typewriter skip progresivo**: 2-phase skip system. First press fast-forwards text (8 chars/frame via rAF), second press shows all text instantly. Short text (<100 chars) skips instantly on first press.
- Floating indicator updates during fast-forward: "Presioná de nuevo para saltar"

### Fixes
- **QTE countdown race condition**: Countdown got stuck at "Ready? 2" due to `setGameState` being called inside `setReadyCountdown` updater. Separated state transition into its own effect.

---

## v0.12.1

- fix(engine): Dev story selector uses fresh JSON instead of localStorage cache

---

## v0.12.0

- feat(centinelas): ApneaGame como knot virtual + fix resultado minigame

