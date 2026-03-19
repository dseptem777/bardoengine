# Changelog — Centinelas del Sur

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

## [0.4.1] y anteriores

Ver historial de git.
