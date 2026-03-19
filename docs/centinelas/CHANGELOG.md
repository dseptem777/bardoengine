# Changelog — Centinelas del Sur

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

## [0.4.1] y anteriores

Ver historial de git.
