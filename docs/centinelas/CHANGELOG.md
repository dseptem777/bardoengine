# Changelog — Centinelas del Sur

## [0.17.2] — 2026-04-21

### Fix: assets de audio + limpieza

- Tag `paso_agua` removido del ink — el sonido existe pero no encajó narrativamente en ningún beat.
- 87 archivos `.mp3` en `public/sounds/` ahora commiteados (SFX con variantes multi-take para todo el sistema de audio).
- Achievement badges actualizados (`duro rocky`, `ratoncito`); carpeta `old/` eliminada.

---

## [0.17.1] — 2026-04-21

### Fix: SFX random variants + tags faltantes

- Engine ahora rota aleatoriamente entre múltiples takes (ej: `golpe` → `golpe_a/b/c/d` random). Mismatches de nombre (`disparos_escopeta`, `explosion_magica`) resueltos via mapa interno.
- 5 nuevos tags insertados: `trueno_cercano` (pelea en tormenta), `boladefuego` (combate mágico araña), `sal_romperse` (trampa de sal en cementerio), `cuerda_rota` (descenso al pozo), `paso_agua` (charcos epílogo cap2b).

---

## [0.17.0] — 2026-04-21

### Feat: SFX Tier 3 + Tier 4 + stingers de origen

**Stingers de origen (Bloque D — 3 nuevos tags):**
- `origen_magia` → `# play_sfx:stinger_magia` (firma sonora de Chispa)
- `origen_combate` → `# play_sfx:stinger_fuerza` (firma sonora de Madrugador)
- `origen_conocimiento` → `# play_sfx:stinger_conocimiento` (firma sonora de Ratoncito)

**T3 SFX diegéticos (3 nuevos tags):**
- `cap2b_frente_cubil` → `trueno_lejano` en la apertura de la tormenta bíblica
- `cap2b_monticulos` → `canto_gutural` al entrar a la sala del ritual
- `cap2b_pasillo_horror` → `susurro_multiple` en el pasillo del cubil

**T4 Mood stingers (4 nuevos tags):**
- `escondite_asomarse` → `sting_horror` al ver la criatura comiendo el cadáver
- `cap2b_trampa_convertirse` → `sting_moral` al pedir la conversión
- `cap2b_investigacion` → `sting_revelacion` al conectar el caso vampírico
- `cap2b_vampiro_hablar` → `drone_tenso` al iniciar diálogo con el Vampiro

**Music gaps reparados (8 knots sin cobertura):**
- `escondite_asomarse`, `escondite_quedarse` → `horror_ambient`
- `apnea_escondite_exito`, `keymash_arrastre_exito` → `misterio_ambient`
- `apnea_escondite_fallo`, `keymash_arrastre_fallo`, `muerte` → `stop_music`
- `inter_enfermeria` → `misterio_ambient`

**Cobertura total:** ~50% → ~97% del árbol narrativo (252/262 knots). Los 5 knots restantes son routers sin contenido o minijuegos (intencionalmente sin tag). Audio documentado en `memory/sfx-prompts.md`: 36 entradas con prompts ElevenLabs + queries Freesound para los 36 archivos `.mp3` pendientes.

---

## [0.16.0] — 2026-04-20

### Feat: cobertura de audio Tier 1 + Tier 2

**Tier 1 — música por locación (~120 knots):**
- Cap 0 preparación: `escuela_ambient` en primeras escenas de Cap 0 sin audio
- Cap 1 investigación: `misterio_ambient` en `jesus_*`, `belen_*`, `ayuda_*`, entrevistas y diálogos
- Cap 1 morgue: `horror_ambient` en escenas de morgue, `orfanato` al entrar al hogar
- Cap 2a exploración: `orfanato`/`orfanato_alegre` en comedor/hab, `horror_ambient` en banos/sótano, `cueva_arañas` en cuevas, `boveda_ambient` en bóveda
- Cap 2b investigación: `playa_oscura` en cementerio, `misterio_ambient` en comisaría/casas, `terror_ambient` en frente/cubil, `horror_ambient` en pasillos y ritual
- Cap 2b combate: `boss_arañas` en combate directo con vampiros y ritual_fuerza/magia
- Intermisión 2: `misterio_ambient` en enfermería/siguiente, `orfanato_alegre` en cocina abuelita, `city_ambient_b` en escándalo, `agite_museo` en cap3 teaser

**Tier 2 — `stop_music` en beats dramáticos (7 knots):**
- `pozo_muerte` — silencio total en muerte del pozo
- `cap2b_vampiro_atacar` — corte antes del ataque con boss
- `cap2b_trampa_convertirse` — silencio al pedir la conversión
- `cap2b_convertirse_muerte_lucida` — silencio en muerte lúcida
- `despues_combate` — reset post-combate → `misterio_ambient`
- `cap2b_epilogo` — silencio dramático → `misterio_ambient`
- (knot adicional según beat narrativo)

**Cobertura total:** ~11% → ~50% del árbol narrativo. Minijuegos excluidos (manejan su propio audio).

---

## [0.15.0] — 2026-04-11

### Feat: 21 nuevos achievements + imágenes

**Nuevos achievements:**
- `primer_caso` — primer cadáver examinado
- `elegir_orfanato` — decisión del orfanato en Cap 1
- `conociste_enriquez`, `conociste_shelley`, `conociste_cabral` — NPCs encontrados
- `fuiste_tarotista` — consultó la tarotista
- `juan_salvado` / `juan_muerto` — destino del compañero
- `alegria_vive` / `alegria_muere` — destino de la madre
- `ninos_ninguno` / `ninos_mitad` / `ninos_casi_todos` / `ninos_todos_mueren` / `belen_muere` — 5 outcomes del orfanato Cap 2B
- `morgue_sin_mordisco` — escapó de la morgue sin ser mordido
- `mordio_profundo` — recibió mordida profunda
- `cambio_de_bando` — eligió convertirse (muerte lúcida)
- `cruz_contra_vampiros` — usó la cruz en el ritual
- `favor_tuco` — usó el favor del Tuco
- `caer_en_cana` — terminó en la comisaría
- `gano_willpower` — escapó del vampiro con willpower

**Imágenes:** 26 badges JPEG agregados a `public/games/centinelas/achievements/` — todos los achievements tienen imagen pixel art

---

## [0.14.6] — 2026-04-11

### Fix: arañas cap 2a
- SPIDER_START movido de `cueva_entrada` a `boveda` — el minigame ahora arranca en el nido (bóveda con capullos), no al entrar a la cueva
- Dificultad inicial cambiada de `slow` a `normal`

---

## [0.14.5] — 2026-04-11

### Fix: param `result=` en tags MINIGAME
- `keymash_arrastre` y `apnea_escondite`: agregado `result=<knot>` al tag MINIGAME — el engine necesita este param para saltar al knot correcto al terminar el minigame. Sin él, CONTINUAR después de morir llevaba directo a muerte sin replay del minigame.

---

## [0.14.4] — 2026-04-08

### Fix: muerte por hp = 0
- Agregado `VAR hp = 100` (renombrado desde `VAR salud`) — los tags `# stat:hp:` ahora escriben correctamente a la variable Ink
- Agregado `onZero.hp` en `centinelas.config.json` → salta al knot `muerte` al llegar a 0
- Nuevo knot `=== muerte ===` con CHAPTER_BREAK (`muerte.jpg`) y 6 textos irónicos en shuffle
- Imagen `public/games/centinelas/muerte.jpg` agregada

---

## [0.14.3] — 2026-04-07

### Fix: Pantalla "Elige tu misión" eliminada
- Se removió el CHAPTER_BREAK de `inter_misiones` — la decisión de misión queda directa en el flujo narrativo sin pantalla intermedia

---

## [0.14.2] — 2026-04-07

### Fix: Pregunta sobre computadoras en hall_central (Cap. 1)
- El reto de Enríquez por llegar temprano ahora es condicional (`entrada_temprana`); ya no se muestra si el jugador esperó la hora pactada
- La explicación del incidente del 2007 (por qué no usan computadoras) se mueve fuera del condicional y siempre aparece al hacer la pregunta
- Se agrega rama `else` con reacción neutra de Enríquez para el camino puntual

---

## [0.14.1] — 2026-04-07

### Fix: Hub investigación casa Cap 2B
- El texto introductorio y "¿Qué hay que ver primero?" solo aparecen en la primera visita al hub; las vueltas muestran "¿Y ahora a dónde?"

---

## [0.13.1] — 2026-04-06

### Fix: Imágenes de title breaks
- Imágenes de chapter break convertidas de `.png` a `.jpg` (`title_magia`, `title_fuerza`, `title_conocimiento`, `title`)
- Agregadas imágenes para Cap 1 (`title_cap1_cadaver.jpg`) y Cap 2A (`title_cap2a_inocentes.jpg`)
- Referencias actualizadas en `centinelas.ink` y `centinelas.config.json`

---

## [0.13.0] — 2026-04-05

### Feature: Intermisión 2
- **Hub post-cap2**: nueva intermisión con intro narrativa (insomnio, pesadillas, preocupación por la Secta) y 5 opciones de actividad
- **inter2_playa**: encuentro con el mar hostil — ola gigante, el mar te rechaza
- **inter2_tarot**: farolas que parpadean → casa de tarotista vacía → sobre con mensaje meta-demo (4th wall)
- **inter2_enfermeria**: Mary Shelley y sustancia orgánica restauradora experimental (`hp +5`)
- **inter2_abuelita**: cacería de súcubo con la Abuelita septuagenaria — 3 sub-ramas:
  - **Cocina** (entrada trasera): empleado indiferente, pista de baile, seducción del súcubo, check `fuerza >= 20` / `conocimiento >= 25` lore → `amistad_abuela +2`
  - **Escándalo**: histeria de multitud, policía, fracasan y alertan a la presa → `amistad_abuela +0`
  - **Banda "Vieja Loca"** (con una sola S): guardia los deja pasar, escenario, abuelita recita poesía sensual, check `conocimiento >= 20` para el bajo → `amistad_abuela +2`
- **inter2_siguiente**: mission gate con CHAPTER_BREAK hacia Capítulo 3
- **capitulo_3**: placeholder "PRÓXIMAMENTE — El Museo de Historia de Costa Alegre"
- **Routing**: cap2a y cap2b_epilogo ahora fluyen a `intermision_2` en lugar de `-> END`
- **amistad_abuela**: nuevo stat relationship (max 6, color púrpura `#a855f7`)

---

## [0.12.2] — 2026-04-05

### Fix: Eliminación de QTEs de la rama vampiro
- Eliminados los 2 QTE de la rama del vampiro (Cap 2B) — no aptos para mobile, sin lugar narrativo
- Agregado texto de transición en `cap2b_trampa_liberar`: el jugador ya tenía la estaca lista cuando liberó el círculo

---

## [0.12.1] — 2026-04-04

### Fix: Music tags
- `ciudad_ambient` → `city_ambient`
- `orfanato_ambient` → `orfanato`
- `cueva_ambient` → `cueva_arañas`

---

## [0.12.0] — 2026-04-04

### Feature: Chapter Breaks + Imágenes de Habitación + Soundtrack
- **Chapter Break en Intermisión 1**: CHAPTER_BREAK tag con imagen dinámica según origen × trauma × stat dominante (12 variantes: `hab_magia`, `hab_fuerza`, `hab_conocimiento` × normal/trauma/max/max_trauma)
- **Chapter Break en Capítulo 1**: `# CHAPTER_BREAK: title=Un Cadáver Sin Nombre, subtitle=Capítulo 1, image=city.jpg, music=city_ambient`
- **Chapter Break en Capítulo 2A**: `# CHAPTER_BREAK: title=Pequeños Inocentes, subtitle=Capítulo 2A, ...`
- **Chapter Break en Capítulo 2B**: `# CHAPTER_BREAK: title=El Nuevo Amanecer, subtitle=Capítulo 2B, ...`
- **Soundtrack completo**: 16 tracks asignados a knots en todo el juego (`city_ambient`, `escuela_ambient`, `horror_ambient`, `playa_ambient`, `rave_electronic`, `tension_drone`, etc.)
- **Achievement tag**: `# achievement:unlock:nuevo_amanecer` en la entrada al Capítulo 2B

---

## [0.11.0] — 2026-03-31

### Feature: Genjutsu Vampírico (Cap 2B)
- **4 encuentros × 3 stats**: fisura activa en `cap2b_hablar`, `cap2b_hablar_escalada`, `cap2b_convertirse`, `cap2b_improvisar`
- **Efectos stat-specific**: `magia` = glitch chromatic aberration, `fuerza` = micro-tremor scaleX/scaleY, `conocimiento` = golden flash brightness+sepia
- **Invisible a WP≥80**, se intensifica hasta WP=15; período 5s→1s, amplitud 0.15→1.0
- **Fisuras reubicadas** al centro de los párrafos — 12 en total, nunca al final
- **Ceder pasa directo**, resistir requiere multi-click y cuesta -15 WP

---

## [0.10.0] — 2026-03-24

### Feature: Spider Torch & Corruption (La Bóveda)
- Sistema Torch & Corruption activo en la bóveda (cap 1): cursor = antorcha, oscuridad atmosférica, texto se corrompe con blur/brightness
- Telarañas SVG con geometría radial real sobre párrafos corruptos
- Choices en `boveda_capullo` cambiados a sticky (`+`) para evitar que se quemen al cargar saves

---

## [0.9.0] — 2026-03-23

### Feature: Title Screen
- Imagen de fondo en pantalla de título (`title.png` — escena noir con neones y lluvia)
- Título y subtítulo posicionados en tercio inferior sobre la imagen (30% opacidad)
- Efecto lluvia CSS animado entre la imagen y el texto
- Corners decorativos ocultos cuando hay background image

### Engine (TitleScreen.jsx)
- Soporte para posicionamiento de título con `backgroundImage` (`mt-[68vh]`)
- Dos capas de lluvia SVG con velocidades distintas para efecto de profundidad

---

## [0.8.1] — 2026-03-21

### Content
- **cueva_pelea_normal**: Reemplazado QTE placeholder con escena narrativa de pelea con daga (opción sin fuerza suficiente)
- **combate_disparos**: Reemplazado QTE placeholder con escena narrativa de disparos a las patas de la araña gigante

---

## [0.8.0] — 2026-03-21

### Feature: ApneaGame como knot virtual + fix crítico de resultado de minigame

**Apnea como knot virtual:**
- El minigame se ve y se siente idéntico a un knot de Ink: mismo layout, tipografía, y el header con stats/inventario/nombre sigue visible durante el juego
- Texto que se acumula (no reemplaza línea por línea): cada acción del jugador agrega un párrafo — presionar espacio escribe "Aguantás la respiración", soltar escribe "Soltás un suspiro tembloroso", O2 bajo escribe "El pecho te arde", awareness alta escribe "¿Te escuchó?"
- `MinigameOverlay`: nuevo modo inmersivo para apnea — sin backdrop, sin frame, sin pantalla de resultado, z-index bajo para que el header del Player quede encima
- `Player.jsx`: contenido principal invisible durante minigames inmersivos (evita superposición de texto)

**Fix crítico: resultado de minigame siempre iba a fallo:**
- inkjs evalúa diverts y condicionales dentro de un solo `Continue()`. Al detectar el tag MINIGAME, Ink ya había evaluado `{ minigame_result: -1 → else → fallo }` antes de que el juego se jugara
- Fix: `processStoryLoop` guarda un snapshot del estado de Ink antes de cada `Continue()`. Cuando detecta un tag MINIGAME, guarda ese snapshot. Al terminar el juego, `handleMinigameResult` restaura el snapshot, setea el resultado correcto, hace un `Continue()` para avanzar pasado el tag, y llama `continueStory()` — el condicional ahora evalúa con el valor real
- Fix genérico: aplica a todos los minigames que usan el patrón `MINIGAME tag → divert → condicional`

### Archivos modificados
- `src/components/minigames/ApneaGame.jsx` — reescritura como knot virtual con texto acumulativo reactivo
- `src/components/MinigameOverlay.jsx` — modo inmersivo para apnea
- `src/components/Player.jsx` — ocultar contenido durante minigames inmersivos
- `src/hooks/useStoryState.ts` — snapshot de estado Ink pre-MINIGAME + `restoreMinigameState()`
- `src/hooks/useBardoEngine.ts` — restaurar snapshot en `handleMinigameResult`
- `public/sounds/breathing_loop.mp3` — nuevo asset (CC0)
- `public/sounds/heartbeat_loop.mp3` — nuevo asset (CC0)

---

## [0.7.1] — 2026-03-20

### Feature: Rediseño diegético del minijuego Apnea

Reescritura completa de `ApneaGame.jsx` — de HUD con barras a experiencia 100% inmersiva. Sin barras, sin números, sin UI visible. Todo el feedback es audiovisual:

**Audio (3 canales autocontenidos):**
- Respiración: suena cuando no se aguanta, volumen escala con déficit de O2
- Latidos: siempre presentes, velocidad y volumen escalan inversamente con O2
- Rumble de criatura: durante waves de sombra, volumen escala con awareness

**Visual:**
- Tinte azul progresivo = medidor de O2 (azul = asfixia)
- Vignette radial = awareness de la criatura (visión de túnel = está cerca)
- Screen shake cuantizado en 4 niveles según proximidad
- Texto narrativo se degrada con blur/opacidad a O2 bajo
- Flash oscuro al soltar (la criatura reacciona)

**Mecánicas:**
- Noise spike +15% awareness al soltar
- O2 drain escalado por ola: 12/14/18/20 %/s
- Recovery delay de 500ms (anti micro-tap)
- Awareness decay con 1s de delay post-spike (la criatura "escucha")

## [0.7.0] — 2026-03-19

### Feature: Minijuego Apnea integrado en Capítulo 1 — Encuentros con el Profundo

Dos secuencias de escondite en el Capítulo 1 ahora activan el minijuego de apnea en lugar de pasar automáticamente. El jugador debe aguantar la respiración (mantener ESPACIO) mientras el Profundo pasa cerca. Fallar = muerte.

**Ubicación A — `escondite_asomarse` (freezer, 3 olas / ~30s):**
- El momento de horror principal del Capítulo 1.
- Ola 3 requiere gestión activa de oxígeno: el jugador debe soltar brevemente, arriesgando visibilidad +30%/s.
- Fallo: muerte cinematográfica con `shake + flash_red + play_sfx:jumpscare`.

**Ubicación B — `final_morgue_escape` rama baja fuerza (taquilla, 2 olas / ~17s):**
- Camino de castigo: el personaje ya lleva -10 HP.
- Más corto y más fácil. Ola 2 drena O2 al 28% (zona PANIC pero sobrevivible sin soltar).
- Mismo resultado de fallo: muerte.

**Refactor de `ApneaGame.jsx`:**
- Reemplazó el array hardcodeado de 3 olas con `generateNarrative(waves)` usando `useMemo`.
- La duración de las olas escala: ola 1 = 3s, ola 2 = 5s, ola N = 5 + (N-1)×3s.
- El contador `OLA X/Y` ahora es siempre preciso para cualquier número de olas.
- `waves=1`, `waves=2`, `waves=3` y más generan timelines correctas sin código extra.

**Variable nueva:** `minigame_result` — leída después de cada minijuego para bifurcar entre `_exito` y `_fallo`.

### Archivos modificados
- `src/components/minigames/ApneaGame.jsx` — generateNarrative(), useMemo, helpers externos al componente
- `centinelas.ink` — VAR minigame_result, 8 knots nuevos, 2 TODO eliminados
- `src/stories/centinelas.json` — recompilado
- `src/stories/centinelas.config.json` — version bump 0.6.0 → 0.7.0

---

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

## [0.5.2] — 2026-03-19

### Fix: Eliminar UI_EFFECT y MOUSE_RESISTANCE atmosféricos huérfanos en Cap 2B

8 etiquetas removidas de secciones narrativas del Capítulo 2B que no estaban emparejadas con bloques `WILLPOWER_START`/`CHECK`/`STOP`. Los tags `UI_EFFECT` y `MOUSE_RESISTANCE` solo son válidos dentro de secuencias de combate de voluntad.

**Tags removidos:**
| Knot | Tag |
|------|-----|
| `cap2b_entre_criptas` | `UI_EFFECT: cold_blue` |
| `cap2b_pasillo_horror` | `UI_EFFECT: blood_pulse`, `MOUSE_RESISTANCE: low` |
| `cap2b_pasillo_luz` | `UI_EFFECT: static_mind` |
| `cap2b_monticulos` | `UI_EFFECT: static_mind`, `MOUSE_RESISTANCE: medium` |
| `cap2b_ritual_final` | `UI_EFFECT: blood_pulse`, `MOUSE_RESISTANCE: low` |

Todos los tags en bloques WILLPOWER y los resets del epílogo se mantienen intactos.

### Archivos modificados
- `centinelas.ink` — 8 líneas de tags removidas
- `src/stories/centinelas.json` — recompilado
- `src/stories/centinelas.config.json` — version bump 0.5.1 → 0.5.2

---

## [0.5.1] — 2026-03-19

### Fix: REQUIRES inline en choices del Capítulo 2B

16 puertas de stats en el Capítulo 2B estaban rotas: las etiquetas `# REQUIRES:` se colocaron al inicio del knot destino en vez de inline en la choice. El engine solo lee tags en `choice.tags`/`choice.text`, así que las puertas eran ignoradas silenciosamente.

**Choices corregidas:** `cap2b_entrar_invisible`, `cap2b_escapar_techos`, `cap2b_escapar_invisible`, `cap2b_lomas_hechizo`, `cap2b_lomas_trepar`, `cap2b_lomas_alcantarilla`, `cap2b_vampiro_trampa`, `cap2b_cubil_fuerza`, `cap2b_cubil_magia`, `cap2b_cubil_tunel`, `cap2b_ritual_fuerza`, `cap2b_ritual_magia`, `cap2b_ritual_diagrama`, `cap2b_ritual_cruz`, `cap2b_ritual_buda`, `cap2b_ritual_placa`

### Archivos modificados
- `centinelas.ink` — 16 REQUIRES movidos a inline en choices
- `src/stories/centinelas.json` — recompilado
- `src/stories/centinelas.config.json` — version bump 0.5.0 → 0.5.1

---

## [0.5.0] — 2026-03-18

### Capítulo 2B: El Nuevo Amanecer

Nuevo capítulo completo como camino alternativo al 2A. El jugador elige entre "Pequeños Inocentes" (2A) o "El Nuevo Amanecer" (2B) al finalizar la Intermisión 1.

#### Contenido narrativo
- **96 knots**, ~1200 líneas de Ink adaptadas del documento de co-escritura
- **12 secciones**: preparación, llegada a la casa, investigación (hub con counter), escape, comisaría, elección de cementerio, Lomas de Paz, encuentro vampírico, frente al cubil, dentro del cubil, ritual final, epílogo
- **6 opciones de preparación** que otorgan stats/items distintos
- **Hub de investigación** con counter de tiempo (`paso_tiempo_casa`): 3 habitaciones = policía llega
- **3 cementerios**: solo Lomas de Paz es el correcto; los otros incrementan `llegaste_tarde_2b`
- **10 opciones en el ritual final** (la escena más grande del juego)
- **4 caminos de muerte**: buda, placa de amor, sangre sobre diagrama, conversión vampírica sin conocimiento suficiente
- **4 minigames QTE** en encuentros vampíricos
- **Epílogo condicional** según flags: guardias muertos, Tuco, traumado, llegaste tarde, 7 bebés salvados

#### Variables nuevas (14)
`tiene_teoria_vampiros`, `tiene_favor_tuco`, `uso_favor_tuco`, `tiene_cementerio_correcto`, `tiene_teoria_sacrificio`, `vampiro_muerto`, `sin_guardias`, `todos_guardias_mueren`, `algunos_guardias_sobreviven`, `final_con_tuco`, `traumado`, `bebe_muerto`, `paso_tiempo_casa`, `llegaste_tarde_2b`

#### Items nuevos (7)
| ID | Nombre | Categoría |
|----|--------|-----------|
| `teoria_vampiros` | Teoría: Vampiros Superiores | documentos |
| `favor_tuco` | Favor del Sgto. Tuco | claves |
| `cementerio_correcto` | Pista: Lomas de Paz | documentos |
| `teoria_sacrificio` | Teoría: Sacrificio de Bebés | documentos |
| `cruz_plata` | Cruz de Plata | items |
| `placa_amor` | Placa de Amor | items |
| `buda_oro` | Buda de Oro | items |

### Fix: Story selector usa JSON fresco en dev mode

Al seleccionar una story en el selector de desarrollo, si existe como import estático en `DEV_STORIES`, se usa esa versión en lugar de la copia cacheada en localStorage. Esto evita tener que re-importar el `.ink` manualmente cada vez que se recompila.

### Archivos modificados
- `centinelas.ink` — 14 variables nuevas, fix stub `prox_mision_2`, ~1200 líneas de Cap 2B
- `src/stories/centinelas.config.json` — 7 items nuevos, version bump 0.4.1 → 0.5.0
- `src/stories/centinelas.json` — recompilado
- `src/App.jsx` — fix dev story selector para usar JSON fresco
- `docs/centinelas/plan_capitulo_2b.md` — plan de implementación del capítulo

## [0.4.1] y anteriores

Ver historial de git.
