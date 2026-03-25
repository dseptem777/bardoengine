# Diseño: Genjutsu Vampírico

**Fecha**: 2026-03-24
**Proyecto**: BardoEngine — Centinelas
**Rama base**: `feature/willpower-immersive`
**Estado**: Aprobado

---

## Contexto

El sistema de willpower inmersivo (rama `feature/willpower-immersive`) transformó el HUD en un overlay atmosférico con ojo SVG, susurros vampíricos, audio sintético y corrupción visual del texto. Sin embargo, la mecánica central sigue siendo mashear V — acción sin correlato narrativo. No se siente como *resistir mentalmente*; se siente como un minigame desconectado de la historia.

El objetivo de este diseño es reemplazar el mashing por una mecánica de lectura activa: el jugador debe encontrar una contradicción en la ilusión del vampiro y hacer clic en ella.

---

## Concepto: El Genjutsu

Durante `WILLPOWER_START`, el vampiro proyecta una falsa realidad. El jugador ve opciones de Ink que parecen representar resistencia, pero **todas son trampas** — elegir cualquiera debita willpower y la escena continúa bajo presión creciente.

La única salida es identificar la **fisura**: un fragmento del texto narrativo marcado por el autor con `# GENJUTSU_BREAK: stat`. Al hacer clic en él, el jugador rompe la ilusión y avanza al nodo de resistencia.

La mecánica exige leer, no machacar.

---

## Las Fisuras

Cada fisura tiene un tipo vinculado al stat dominante del personaje:

| Stat | Naturaleza de la fisura | Ejemplo |
|------|------------------------|---------|
| `fuerza` | Inconsistencia física o sensorial imposible | El vampiro describe "el frío del metal" de un objeto que es de madera |
| `magia` | Costura mágica visible solo a ojos entrenados | Un glow residual en una palabra, una rima estructural forzada en la ilusión |
| `conocimiento` | Contradicción factual que el personaje sabría detectar | El vampiro cita un hecho histórico que el personaje sabe que es falso |

Si el stat del `GENJUTSU_BREAK` **no coincide** con el stat dominante del jugador, la fisura no se renderiza como clickeable — el vampiro eligió una mentira adecuada a ese personaje. El jugador solo puede ceder o agotar el willpower.

---

## Visibilidad de la Fisura

La fisura está siempre presente en el texto, pero su visibilidad escala *inversamente* al willpower:

| Willpower | Apariencia | Razón narrativa |
|-----------|------------|-----------------|
| 70–100 | opacity ~15%, casi subliminal | La ilusión es perfecta |
| 30–70 | opacity ~40%, leve temblor/glow | El vampiro empieza a esforzarse |
| 0–30 | opacity ~70%, glow visible | El vampiro ya no puede sostener la mentira |

Cuanto más cede el jugador, más visible se vuelve la salida — tensión narrativa: el daño acumulado es también la pista.

---

## Authoring en Ink

El autor marca el texto de la fisura con un tag inline en el párrafo correspondiente:

```ink
El vampiro sonríe. "Este lugar siempre fue tuyo, lo sabés."
# GENJUTSU_BREAK: conocimiento

* [Sí... siempre lo fue]
* [Tenés razón, no tiene sentido luchar]
* [Quizás solo necesito descansar]
```

Las opciones de Ink son parte de la trampa. El engine las renderiza normalmente pero al elegir cualquiera:
1. Se debita willpower (configurable por el autor, default: 15)
2. El texto vampírico aumenta de presión
3. La escena avanza al siguiente nodo de ilusión

Al hacer clic en la fisura:
1. Se registra el willpower actual como valor del check
2. La historia avanza al nodo de resistencia correspondiente

---

## Flujo de Interacción

```
WILLPOWER_START activo
  │
  ├── Jugador elige opción trampa
  │     → willpower -= 15 (configurable)
  │     → texto de presión vampírica
  │     → escena continúa en siguiente nodo de ilusión
  │
  ├── Jugador hace clic en la fisura (stat correcto)
  │     → willpower actual registrado
  │     → historia avanza al nodo de resistencia
  │
  └── Willpower llega a 0 sin encontrar fisura
        → engine selecciona automáticamente la última opción trampa
        → historia avanza al nodo de cesión (reemplaza ForcedClickOverlay)
```

---

## Cambios Respecto al Sistema Actual

### Eliminado
- **V-mashing**: no hay tecla que boostear willpower durante la ilusión
- **ForcedClickOverlay**: reemplazado por selección automática de opción trampa al llegar a 0
- **boostValue durante genjutsu**: la acción de boost queda suspendida mientras el genjutsu está activo (el ojo sigue mostrando el estado)

### Conservado
- **Ojo SVG** como indicador de willpower (se cierra igual que antes)
- **Susurros vampíricos** en los bordes de pantalla
- **Corrupción visual** del texto (blur/brightness sobre párrafos)
- **Audio sintético** (heartbeat + drone + static)
- **WILLPOWER_CHECK / WILLPOWER_STOP** sin cambios en Ink

---

## Implementación — Componentes Nuevos

### 1. Tag Parser: `GENJUTSU_BREAK`
- `useTagProcessor.ts` reconoce `# GENJUTSU_BREAK: stat` en el texto del párrafo
- Extrae el texto del párrafo y el stat requerido
- Emite evento hacia el engine: `{ type: 'GENJUTSU_BREAK', stat, text }`

### 2. Estado en `useBardoEngine.ts`
- Nuevo estado: `genjutsuBreak: { stat: string, text: string } | null`
- Se activa al procesar el tag, se limpia al romper la ilusión o al `WILLPOWER_STOP`
- Expone `breakGenjutsu()` action que avanza la historia y limpia el estado

### 3. Render en `TextDisplay.jsx`
- Al existir `genjutsuBreak`, detectar el texto correspondiente en el párrafo renderizado
- Wrapearlo en un `<span>` clickeable con estilo reactivo al willpower actual
- Estilo: `cursor: pointer`, `text-decoration: underline dotted`, opacity y glow escalados por willpower
- Si el stat del break ≠ stat dominante del jugador: no renderizar como clickeable (texto normal)

### 4. Lógica de Stat Dominante
- `useGameSystems` ya provee los stats del personaje
- Función `getDominantStat(stats)`: retorna el key con el valor más alto
- Comparar con el stat del `GENJUTSU_BREAK` para determinar visibilidad

### 5. Opciones Trampa
- Durante genjutsu activo, las opciones de Ink se renderizan normalmente
- Al elegir una: `boostValue(-15)` (o valor configurado), historia continúa
- No hay cambio visual especial en las opciones — la trampa es parte de la narrativa

### 6. Willpower 0 sin Fisura
- `useWillpowerSystem` ya tiene el valor en rAF
- Cuando `value <= 0` y `genjutsuBreak !== null`: engine llama `story.chooseChoiceIndex(0)` (o el último índice) y continúa
- Reemplaza `ForcedClickOverlay` por completo

---

## Consideraciones de Autoría

- Cada segmento de ilusión debe tener exactamente **un** `# GENJUTSU_BREAK` por tipo de stat relevante
- Si el autor quiere que solo ciertos personajes puedan romper la ilusión, usa el mecanismo de stat matching
- El texto de la fisura debe ser naturalmente part del párrafo, no forzado — la contradicción tiene que funcionar narrativamente
- El número de opciones trampa y el costo de willpower por elección son decisión del autor

---

## Alcance

Este diseño aplica **solo a Centinelas** (capítulo 2B y cualquier futuro encuentro vampírico). El engine implementa el soporte pero la activación depende de los tags en el Ink de la historia.

No modifica el comportamiento de `WILLPOWER_START` en historias que no usen `GENJUTSU_BREAK`.
