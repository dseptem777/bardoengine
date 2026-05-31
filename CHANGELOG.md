# Changelog — BardoEngine

## [0.32.5] - 2026-05-31

### Fixed
- **Texto corrupto (mojibake) en Android**: los nombres de logros y el subtítulo del juego se veían con caracteres rotos ("BuzÃ³n", "arqueolÃ³gica", emojis ilegibles) sólo en la app Android, porque el WebView del celular decodificaba los textos del config como Windows-1252 en lugar de UTF-8 (el texto de la historia ya se veía bien porque se decodifica aparte). Se agregó una reparación en runtime (`src/utils/fixMojibake.js`) que se aplica al cargar el config; no toca los textos que ya están correctos, así que desktop sigue igual.
- **La barra de HP tapaba el nombre en mobile**: la tira de vida fija arriba de todo se montaba sobre la fila del nombre/`[CLASIFICADO]` del header. Ahora el header reserva el alto de la tira y ya no se solapan.
- **Prompt pensado para teclado en el celular**: varias pantallas decían "PRESIONÁ UNA TECLA PARA CONTINUAR" incluso en touch. En dispositivos táctiles ahora dicen "TOCÁ PARA CONTINUAR" (pantalla de título, cortes de capítulo e indicador in-game).

### Changed
- **Tipografías self-hosteadas (funcionan offline)**: el juego cargaba todas las fuentes desde el CDN de Google Fonts en runtime, por lo que un celular sin conexión caía a la fuente del sistema —incluida la de dislexia (Atkinson Hyperlegible)—. Ahora se empaquetan localmente vía Fontsource (Inter, JetBrains Mono, Atkinson Hyperlegible y Playfair Display, con sus itálicas) y funcionan sin internet; se quitaron los `<link>` al CDN y se ajustó la CSP.

---

## [0.32.4] - 2026-05-29

### Added
- **Contrato de schema para los tags Ink→engine**: nuevo `src/engine/tagSchema.js` que centraliza las 20+ familias de tags estructurados que parsea el engine (KEY_MASH, WILLPOWER_*, SPIDER_*, BOSS_*, GENJUTSU_BREAK, CHAPTER_BREAK, MINIGAME, achievement, input). En modo dev, `useTagProcessor` ahora avisa fuerte cuando un tag parece de una familia conocida pero está mal formado de un modo que el handler ignoraría en silencio (ej: `CHAPTER_BREAK` sin `title=`, `WILLPOWER_CHECK` con umbral no numérico, `achievement:unlock:` sin id). El ruteo no cambia y la validación nunca rompe el procesamiento. Incluye 60 tests nuevos.

---

## [0.32.3] - 2026-05-28

### Fixed
- **Tutorial de Vínculos no aparecía en desktop**: el botón ❤️ del panel de Relaciones se ocultaba hasta tener al menos un vínculo con valor > 0, por lo que el paso del tutorial nunca encontraba su ancla y se salteaba en silencio (en mobile sí aparecía porque el botón vive en otro lado). Ahora el botón se ve siempre que la historia declare vínculos en su config, el panel solo lista los NPCs ya conocidos (no spoilea el resto), y el tutorial puede engancharse desde el primer beat.

---

## [0.32.2] - 2026-05-27

### Fixed
- **El script de ship escribía BOM en los JSON**: `ship.ps1` usaba `Set-Content -Encoding utf8`, que en PowerShell 5.1 antepone un BOM. Eso corrompía `centinelas.config.json` y demás configs, haciendo fallar `build-game` con "Unexpected token … is not valid JSON". Ahora escribe UTF-8 **sin** BOM y se limpió el BOM de los configs ya afectados (package.json, tauri.conf.json, story-config.json, package-lock.json).

---

## [0.32.1] - 2026-05-27

### Fixed
- **Script de ship**: `scripts/ship.ps1` ya no intenta bumpear la versión de `src-tauri/resources/story-config.json`, un artefacto generado por `build-game` que por diseño no tiene campo `version`. Eso hacía abortar el ship a mitad del bump en cada release que tocara Centinelas (y dejaba las versiones desincronizadas). La versión de Centinelas vive en `centinelas.config.json` y `tauri.conf.json`.

---

## [0.32.0] - 2026-05-27

### Features
- **Minijuego de RCP (reanimación rítmica)**: nuevo minijuego inmersivo a pantalla completa donde se hace RCP al ritmo del pulso (tap en mobile, Espacio o click en desktop). Cada atributo aporta un efecto propio: **fuerza** hace que cada compresión cure más, **conocimiento** amplía la ventana de timing, y **magia** otorga un "segundo aliento" que revive una vez al paciente.
- **Fast Start en el panel de debug**: arranque rápido directo al inicio del juego real (justo después de presentarte ante el Profesor), eligiendo un atributo. Pensado para testear sin rejugar todo el intro cuando los saves quedan obsoletos entre iteraciones.

### Fixed
- **Victoria del RCP imposible de alcanzar**: el chequeo de victoria corría recién después del decaimiento pasivo, mientras que cada compresión topeaba la vida del paciente en el máximo — el minijuego nunca se ganaba aunque se completara. Ahora la victoria se dispara en el instante en que se alcanza el objetivo.

---

## [0.31.0] - 2026-05-24

### Features
- **Tutorial spotlight para nuevos jugadores**: overlay que oscurece la pantalla e ilumina cada elemento real de la UI con tooltips narrados en personaje. Segmento inicial (HP, texto, bitácora, guardar, opciones, vínculos, inventario y las opciones de decisión) narrado por Enríquez; un segundo segmento, al revelar el nombre, narrado por El Profesor, que ilumina la ficha (nombre/locación) y los atributos. Es one-shot: se ve una vez y no vuelve a aparecer.
- **Re-ver y reiniciar tutoriales desde Opciones**: botón "Ver tutorial" (en juego) para repetir el recorrido, y "Reset tutoriales" (en juego y en el menú principal) para que los tutoriales vuelvan a mostrarse.
- **HP siempre legible en mobile**: la barra de vida del header en mobile ahora muestra el valor numérico adentro, incluso con la ficha aún censurada.

---

## [0.30.0] - 2026-05-22

### Features
- **ID card "expediente censurado"**: antes de que el jugador ingrese su nombre, el ID card (desktop) y el header (mobile portrait) muestran un placeholder estilo documento clasificado en lugar de aparecer de la nada. Slot del nombre con `[CLASIFICADO]`, capítulo con `[LOCACION DESCONOCIDA]`, atributos colapsados en una sola línea `[BAJO EVALUACION]`, cada uno con barra de redacción negra pulsante. Las barras de recursos (HP/WP) siempre se ven. Cuando llega el nombre, el placeholder se desvanece y el ID card real entra con el spring habitual.

---

## [0.29.0] - 2026-05-21

### Features
- **Header portrait rediseñado**: layout de dos columnas — nombre del personaje y capítulo apilados a la izquierda (sin truncar), grilla 2×3 de botones compactos a la derecha. Elimina el solapamiento de stats con los botones de acción y aprovecha el espacio negativo del header.

---

## [0.28.0] - 2026-05-21

### Features
- **Portrait reflow + zoom viewer**: full mobile portrait layout with two-column stat bars, responsive widths for panels/overlays, and a pinch-to-zoom image viewer (`react-zoom-pan-pinch`) for chapter break images.
- **Header HUD redesign**: slim two-row portrait HUD with permanent pinned header, character ID strip below stat bars, minimum 44×44px tap targets on all header controls, and responsive typography with compact achievement toasts.
- **Bulletproof portrait detection**: reliable two-row HUD activation based on viewport geometry; removed scroll-hide behavior to keep controls always accessible.
- **Android build pipeline fixes**: frontend is now re-embedded when `dist/` changes on Android builds; build script never ships stale frontend or wrong-variant APK; `isDebugBuild` hoisted so the output-copy step resolves correctly.

### Fixes
- **Parser**: CHAPTER_BREAK regex relaxed to allow spaces after commas.
- **TextDisplay tests**: font-size assertions updated to match mobile-first Tailwind classes.

---

## [0.27.2] - 2026-05-20

### Fixes
- **ship workflow**: `.claude/commands/ship.md` ahora aclara que el script atómico se invoca BARE (sin `2>&1 | Select-Object`, sin pipes). Sufijos rompen el match de la allowlist en `.claude/settings.local.json` y causan permission prompts innecesarios.

## [0.27.1] - 2026-05-20

### Fixes
- **ship workflow versionado**: `.claude/commands/ship.md` ahora se versiona en el repo. La instrucción que define el flujo de ship (escribir bullet del changelog → correr `scripts/ship.ps1`) queda como parte del proyecto, no solo local. `.claude/settings.json`, `.claude/settings.local.json` y `.claude/skills/` siguen gitignored.

## [0.27.0] - 2026-05-20

### Features
- **scripts/ship.ps1**: nuevo script atómico de release que reemplaza el flujo manual de ship.md por un solo comando. Valida tests y entradas de CHANGELOG, bumpea versiones en `package.json` y `tauri.conf.json`, commitea, mergea a dev con `--no-ff`, y pushea. Soporta `-DryRun` para preview sin efecto y `-Bump` para elegir `patch`/`minor`/`major`.

## [0.26.2] - 2026-05-19

### Fixes
- **GameOverMenu**: nuevo componente que se muestra cuando el jugador llega a un final letal (`-> muerte`), con opciones para cargar partida guardada o volver al menú principal. Integrado en `App.jsx` via flag `isGameOver` expuesto por `useBardoEngine`.
- **autosave guard**: `useBardoEngine.ts` ya no dispara autosave cuando `isGameOver` es `true`, previniendo loops de save/load en deadends fatales.

## [0.26.1] - 2026-05-18

### Fixes
- **InventoryPanel tooltip**: el tooltip de descripción de items ahora usa un React portal + `position: fixed` con coordenadas de viewport calculadas via `getBoundingClientRect()`. Escapa el clipping causado por el `backdrop-filter` del panel y el `overflow-y: auto` del scroll container. Elige automáticamente arriba/abajo según espacio disponible en viewport. Agrega listener de scroll/resize para cerrar el tooltip si el panel scrollea.

## [0.26.0] - 2026-05-18

### Features
- **Capa 0 — hardening de release**: devtools desactivados en builds de release (`tauri.conf.json`); CSP endurecida para bloquear eval/inline scripts; eliminado `plaintext.clone()` innecesario en el pipeline de cifrado (`crypto.rs`).
- **Capa 1 — watermarking narrativo**: sistema de esteganografía Unicode que inyecta un ID de build en los strings `^text` de la historia cifrada (`watermark.cjs`, `watermark-table.cjs`). Registro automático de builds en `.omc/build-registry.json`. Herramientas `identify-leak.cjs` (trazar copia filtrada hasta el comprador) y `verify-watermark.cjs` (gate de integridad pre-distribución). Tests en `src/tests/watermark.test.js`.
- **Capa 2 — rotación de claves por minor release**: `build-game.cjs` rota automáticamente el secreto de cifrado en cada bump minor; descifrado cross-key falla de forma cerrada (verified by new Rust test).

---

> **Nota (2026-05-04):** las entradas `0.26.0`, `0.26.1` y `0.26.2` fueron bumps erróneos del engine: en realidad solo cambiaba contenido de Centinelas, no había cambios al engine. Se reverte el `package.json` a `0.25.0` (la última versión real del engine) y de aquí en adelante el engine solo se bumpea cuando hay cambios reales al engine. Los cambios de Centinelas asociados quedan registrados en `docs/centinelas/CHANGELOG.md` (versiones 0.22.0, 0.23.0, 0.23.1).

---

## [0.25.1] - 2026-05-06

### Fixes
- **ChapterBreakOverlay z-index**: raised from z-200 to z-900 so the chapter break screen (including death screens) always renders above the spider infestation overlay (max z-850).

---

## [0.25.0] - 2026-05-01

### Features
- **deferred tag timing**: SFX (`play_sfx:*`), `shake`, and `flash_*` tags now fire as the typewriter reaches the paragraph that emitted them, instead of all firing at render time. Music, bg, stats, inventory, and other tags remain instantaneous. New config module `src/config/tagTiming.js` classifies tags by timing behavior.
- **TextDisplay segments**: `TextDisplay` now receives a `segments` prop (array of `{text, tags}`) that tracks which paragraph the typewriter cursor is in, enabling per-paragraph tag dispatch.
- **Player/App wiring**: `Player.jsx` and `App.jsx` updated to pass `segments` and an `onSegmentReached` callback down to `TextDisplay`.

### Fixes
- **TextDisplay skip race condition**: fixed stale `isTyping` ref on mount/new-beat transition that caused the skip effect to fire incorrectly when the first beat loaded.

### Tests
- 9 new test cases for `tagTiming.js` (`src/config/__tests__/tagTiming.test.js`)
- 1 new test case in `useStoryState` for segment-aware story state

---

## [0.24.2] - 2026-04-30

### Content
- **centinelas cap3**: revisión profunda del Capítulo 3 comparando crudo vs ink — párrafos faltantes en `cap3_briefing_lab` (Profesor/Mary Shelley, cadáver en camilla, rostro con surcos de lágrimas), refactor de preguntas del briefing a knot `cap3_briefing_preguntas` con sticky choices (identidad / Tiburón-Profundo / runas), fix de literal `NOMBRE DE PERSONAJE` → `{nombre_personaje}` en `cap3_espiar_lab`, reactividad nueva por `colaboraste_museo` en `cap3_museo_primera_sala`, nuevas VARs (`colaboraste_museo`, `preg_identidad`, `preg_profundo`, `preg_runas`), typo `modificación` → `momificación`

---

## [0.24.1] - 2026-04-30

### Fixes
- **chapter break**: el typewriter del knot que carga junto al `CHAPTER_BREAK` ya no corre detrás del overlay. Se añadió prop `paused` a `TextDisplay` que detiene los loops `setTimeout`/`rAF` y los reanuda desde el char actual al cerrar el overlay. Antes, si el jugador se quedaba viendo la imagen de capítulo, el texto se tipeaba en background y al dismissear ya estaba todo escrito.

---

## [0.24.0] - 2026-04-29

### Features
- **security**: harden story encryption with key splitting (2 env vars XOR'd with compile-time masks), HKDF-SHA256 derivation, ChaCha20 pre-AES obfuscation layer, and zeroize on drop
- **build**: load encryption secrets from `.env` at repo root via `dotenvy` in `src-tauri/build.rs` — single source of truth, no shell exports needed
- **docs**: add `SECURITY.md` with threat model — this is obfuscation, not DRM

---

## v0.23.1 (2026-04-29)

### Fixes
- **security(csp)**: replaced `null` Tauri CSP with a full policy covering `'self'`, Tauri asset/IPC schemes, Google Fonts, and `data:`/`blob:` sources — WebView is no longer wide open to XSS-to-IPC bridging

---

## v0.23.0 (2026-04-26)

### Features
- **comfy reading experience**: replaced per-character `scrollIntoView` jitter with a native `scrollTo({behavior:'smooth'})` bottom-anchored system. `pb-[35vh]` content padding creates a stable read-line at ~65% viewport height — new text always appears there, old text glides upward (Disco Elysium style). User scroll-up pauses auto-scroll. Zero custom RAF/tween code.

---

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

