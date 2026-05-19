# Changelog — Centinelas del Sur

## [0.23.5] — 2026-05-19

### Fixed
- **cap3/museo**: reemplazadas 4 páginas-cartel en mayúsculas ("ENTRAS A LA PRIMERA/SEGUNDA/TERCERA/CUARTA SALA") por etiquetas `# next: <label>` en el botón SIGUIENTE, usando la sintaxis ya soportada por la engine. También se agregó `# next:` en las choices "Colaborás"/"No colaborás" del knot anterior para una transición limpia.
- **branding**: corregida capitalización del título "Centinelas del Sur" en `centinelas.ink`, `centinelas.config.json`, `story-config.json` y `tauri.conf.json` (estaba como `CENTINELAS DEL SUR` o `centinelas del Sur`).

---

## [0.23.4] — 2026-05-18

### Fixed
- **cap3/inicio**: agregado `# inv:clear_mission` al `CHAPTER_BREAK` del Capítulo 3 ("Visita al Museo"). Los ítems del Capítulo 2B que no son persistentes ahora se limpian correctamente al comenzar el Cap. 3.

---

## [0.23.3] — 2026-05-08

### Fixed
- **inter2_convergencia**: texto definitivo del escritor reemplaza el placeholder en el beat de cierre de la Intermisión 2. Todas las ramas actualizadas: actividad del día (playa, tarot, enfermería, abuela ×3), path orfanato (ambos/solo Belén/nadie), path cementerio (traumado/guardias muertos/guardias vivos/else).

---

## [0.23.2] — 2026-05-04

### Added
- **cueva/post-combate**: nuevo beat narrativo tras matar a la segunda araña — corte feo en el estómago (`# stat:hp:-10`) antes de `regreso_orfanato`. Refuerza la sensación de costo físico del combate en la oscuridad.

---

## [0.23.1] — 2026-05-04

### Fixed
- **cueva/orfanato**: el sistema de arañitas y el cono de oscuridad ahora se detienen al llegar al orfanato (`regreso_orfanato`), antes del boss y de las decisiones con los chicos. Antes seguían activos durante todo el cap. 2a.

---

## [0.23.0] — 2026-05-03

### Added
- **museo/transiciones**: 4 páginas-cartel "ENTRAS A LA PRIMERA/SEGUNDA/TERCERA/CUARTA SALA" insertadas en el recorrido diurno del Museo (cap. 3, knot `cap3_museo_primer_sala`)

---

## [0.22.2] — 2026-05-03

### Fixed
- **paginación/next**: corregidas 22 instancias del patrón `# next` ubicado después del texto de cierre antes de un divert — el tag ahora va antes del texto para que inkjs lo incluya en el mismo `Continue()` y la pausa ocurra en la página correcta; afectaba `conocimiento_esperar`, `inter_enfermeria`, todas las ramas de `inter2_*`, `cap3_recorrer_elfaro`, `cap3_espiar_oficina`, `cap3_espiar_lab`, `cap3_tl_*`, `cap3_museo_dia_hospital`, `cap3_museo_ya_adentro` y las tres ramas de minijuego en `cap3_museo_primera_sala`

---

## [0.22.1] — 2026-05-03

### Fixed
- **paginación/next**: corregida la colocación del tag `# next` al final de `despues_combate_ninos` — ahora pausa correctamente en "FIN DEL EPISODIO." antes de entrar a `intermision_2`, y el overlay del CHAPTER_BREAK "Costa Alegre" aparece correctamente tras el click
- **paginación/next**: corregido el tag `# next` antes de `-> inter2_siguiente` (rama "El Faro llama") — el CHAPTER_BREAK del capítulo 3 ahora muestra su overlay correctamente
- **paginación/next**: eliminado tag `# next` redundante antes de `-> cap3_final_fracaso` — el overlay "Fracasaste / Fin del Capítulo 3" ahora aparece correctamente

---

## [0.22.0] — 2026-05-03

### Fixed
- **achievement/juan_salvado**: eliminados 3 unlocks incorrectos del achievement en los knots `jesus_frontal`, `jesus_distraccion` y `jesus_sigilo` (intermisión Jesús); el unlock ahora ocurre únicamente en `cueva_capullo` cuando `juan_vive = true`, reflejando el momento narrativo correcto

---

## [0.21.0] — 2026-05-02

### Added
- **inter0/entrenamiento**: nuevo bloque narrativo en `intermision_hub` (rama `misiones_completadas == 0`) que cubre los primeros seis meses de entrenamiento del Centinela — cronograma bajo la puerta, actividades municipales, el manco del sillón y las clases de judo; termina con la frase puente "Pero esta noche eso iba a cambiar"
- **inter0/stat-gate**: bloque final del entrenamiento ramificado por stat dominante (`fuerza >= 20` → servicio militar / polígono; `conocimiento >= 20` → cajas de libros / click mental; `magia >= 20` → reunión con el Guardián + ejercicio de la vela); bloques mutuamente exclusivos vía switch ink

---

## [0.20.0] — 2026-05-02

### Added
- **inter1/convergencia**: nuevo knot puente `inter1_convergencia` con beat de cierre para la Intermisión 1, ramificado por dos ejes — actividad del día (playa / tarot / enfermería / Jesús con 3 niveles de amistad) y saldo del Capítulo 1 (evitó la pelea con El Profundo / peleó sin mordisco / peleó y fue mordido)
- **vars nuevas**: `inter1_actividad`, `peleo_profundo`, `mordido_profundo` — seteadas en los knots de actividad y en los knots de combate de Cap 1

### Fixed
- **inter1/flujo**: los diverts `-> inter_misiones` al final de los knots de actividad de Inter 1 (playa, tarot, jesús x3, enfermería) ahora apuntan a `-> inter1_convergencia`; el nuevo knot cierra con `-> inter_misiones` preservando el resto del flujo
- **abuela/escala**: `amistad_abuela` ahora usa escala 0/1/2 en lugar de 0/2/4 — incrementos de `+1` en `inter2_abuela_escandalo` y `inter2_abuela_banda`; umbrales en `inter2_convergencia` ajustados a `>= 2` (sonrisa filosa) y `>= 1` (conforme)

---

## [0.19.2] — 2026-05-01

### Fixed
- **inter2/loop**: la intermisión 2 ya no vuelve al hub tras completar una quest secundaria (playa, tarot, enfermería, abuelita); los diverts `-> intermision_2` en esos knots ahora apuntan a `-> inter2_convergencia`
- **inter2/convergencia**: nuevo knot puente `inter2_convergencia` con beat de cierre ramificado por dos ejes — actividad del día (playa / tarot / enfermería / abuela con 3 niveles de amistad) y última misión jugada (orfanato: Belén+Juan / solo Belén / ninguno; cementerio: traumado / sin guardias / guardias sobreviven)
- **vars nuevas**: `inter2_actividad` (seteada al inicio de cada knot de actividad) y `ultima_mision` (seteada en `capitulo_2a` y `capitulo_2b`)

---

## [0.19.1] — 2026-05-01

### Fixed
- **paginación**: tag `# next: Tomar carrera y saltar` movido inline al final del párrafo "Entre las dos terrazas..." — estaba como tag standalone que tomaba el contenido siguiente como nuevo beat, rompiendo la paginación del capítulo

---

## [0.19.0] — 2026-04-30

### Añadido
- **cap3/briefing**: 3 párrafos descriptivos faltantes en `cap3_briefing_lab` — Profesor y Mary Shelley presentes en la habitación, cadáver en la camilla, saludos del Profesor con rostro marcado por surcos de lágrimas
- **cap3/briefing**: refactor de preguntas a knot dedicado `cap3_briefing_preguntas` con sticky choices `+ {not var}` — el jugador ahora puede hacer las 3 preguntas (identidad del cadáver, Tiburón-Profundo, runas); el Tiburón solo aparece si se preguntó por él
- **cap3/museo**: reactividad nueva en `cap3_museo_primera_sala` — flavor diferenciado según `colaboraste_museo` (colaboró vs no colaboró en el museo nocturno)
- **vars nuevas**: `colaboraste_museo`, `preg_identidad`, `preg_profundo`, `preg_runas`

### Fixed
- **cap3/espiar**: literal `NOMBRE DE PERSONAJE` reemplazado por `{nombre_personaje}` en `cap3_espiar_lab`
- **cap3/cosméticas**: comentado encabezado `DE DIA EN EL MUSEO`, typo `modificación` → `momificación`

---

## [0.18.3] — 2026-04-29

### Fixed
- **cap3/minigames**: reformateados 4 tags `MINIGAME` de keymash en la secuencia del museo nocturno (líneas 4840, 4859, 4879, 4943) — formato heredado roto → formato nuevo; los minijuegos ahora arrancan y la rama de resultado ya no siempre pierde
- **hub**: condición `misiones_completadas == 1` cambiada a `>= 1` en `inter_tarot` e `inter_jesus` — el hub ya no se traba en la segunda visita

---

## [0.18.2] — 2026-04-25

### Fixed
- **Hallucinations eliminadas**: choice `cabral_al_museo` en tiempo libre, bloque condicional `{ cabral_al_museo }` en convergencia nocturna, choice de reacción al plan del Profesor con `+conocimiento`, opción nocturna "improvisando" — ninguno existía en el crudo.
- **Items secretos corregidos**: `enojo_enriquez` y `llegaste_con_ventaja` cambiados de `# achievement:unlock:` a `# inv:add:` y declarados en sección `"items"` del config para que aparezcan en el inventario.

### Añadido
- **Rama TRAUMADO** (`cap3_viaje_museo`): en el viaje al Museo, si el jugador es traumado y hay bebé muerto, aparece el fantasma del bebé en el asiento del acompañante.
- **Hall convergencia nocturna completado**: opciones 3 y 4 del crudo — estudiar maniquíes (>=25 SABIDURIA → `entidades_poseidas`) y atacar con pistola (retroceso).
- **Primera sala nocturna reescrita** con las 6 opciones del crudo: trabar la puerta (keymash), hechizo invisibilidad (keymash), esconderse en la canoa (keymash), símbolo en la puerta (requiere `entidades_poseidas`), lanza de vitrina (requiere `llegaste_con_ventaja`), correr.
- **Segunda sala nocturna** (`cap3_corres_museo`): elección del acta fundacional — rescatarla otorga achievement `acta_fundacional`.
- Achievement `acta_fundacional` ("Guardián del Patrimonio") + ítem `entidades_poseidas` añadidos al config.

---

## [0.18.1] — 2026-04-25

### Fixed
- `cabral_al_museo` ahora es una choice real: llevar a Cabral al Museo nocturno cuesta -20 HP y otorga +3 FUERZA en la convergencia nocturna.
- `belen_sobrevive` se setea correctamente en las 4 ramas de Cap 2B donde Belén no muere; el knot `cap3_tl_belen` ahora es alcanzable.
- Descriptions de `colaborador_museo` / `no_colaborador_museo` ajustadas al crudo: el jugador dona dinero (o no), no coordina con un equipo.
- Phantom ref `chase_ambient` (3 ocurrencias) reemplazada por `terror_ambient`. `explosion_magica` y `disparos_escopeta` quedan intactos: ya están mapeados con random rotation en `SFX_VARIANTS` (`useAudio.js`).

---

## [0.18.0] — 2026-04-23

### Añadido
- **Capítulo 3 "Visita al Museo"** — integración completa del crudo del co-autor (495 líneas, ~12k palabras)
  - Escena 1-2: Llegada 6am a El Faro, pre-briefing con 3 rutas (recorrer, espiar oficina Profesor, espiar laboratorio)
  - Escena 3: Briefing con El Profesor + Mary Shelley, plan de robar la Momia incaica
  - Escena 4: 6 opciones de tiempo libre antes del museo (Cabral +5 fuerza, cocina item secreto Enríquez, biblioteca +5 conocimiento/magia condicional, Belén +5 hp, guardias cementerio +5 hp, ir directo al museo)
  - Escenas 5-6: Reconocimiento diurno con 4 rutas (fuerza/conocimiento/magia/improvisada) + entrada nocturna
  - Escenas 7-8: Combate sensorial en la primera sala — 3 ramas (revólver + candelabro colapsando, báculo ceremonial con keymash, magia cruda)
  - Escenas 9-10: Sala de la Momia, portal violeta, ladrona femenina, rama condicional RATONCITO (conocimiento>=40 reconoce la voz), **cliffhanger final de demo**
- VARs nuevas: `item_enojo_enriquez`, `cabral_al_museo`, `voz_conocida`, `momia_robada`, `espiaste_lab`, `belen_sobrevive`
- Achievements nuevos: `espia_elfaro`, `enojo_enriquez`, `colaborador_museo`, `no_colaborador_museo`, `llegaste_con_ventaja`, `incineracion_museo`, `ratoncito_sabiduria`

### Técnico
- Crudo `docs/centinelas/crudos/Capitulo 3.txt` normalizado de latin-1 a UTF-8
- Compilación Ink verde (sin phantom refs de audio en knots nuevos)
- Integración respeta el principio de preservación: cada párrafo del crudo aparece textualmente en el ink

---

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
