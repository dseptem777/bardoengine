# Diseño: Genjutsu Vampírico

**Fecha**: 2026-03-24
**Proyecto**: BardoEngine — Centinelas
**Rama base**: `feature/willpower-immersive`
**Estado**: Aprobado

---

## Contexto

El sistema de willpower inmersivo (rama `feature/willpower-immersive`) transformó el HUD en un overlay atmosférico con ojo SVG, susurros vampíricos, audio sintético y corrupción visual del texto. Sin embargo, la mecánica central sigue siendo mashear V — acción sin correlato narrativo. No se siente como *resistir mentalmente*; se siente como un minigame desconectado de la historia.

El objetivo de este diseño es reemplazar el mashing por una mecánica de lectura activa: el jugador debe encontrar una contradicción en la ilusión del vampiro y hacer clic en el párrafo que la contiene.

---

## Concepto: El Genjutsu

Durante `WILLPOWER_START`, el vampiro proyecta una falsa realidad. El jugador ve opciones de Ink que parecen representar resistencia, pero **todas son trampas** — elegir cualquiera debita willpower y la escena continúa bajo presión creciente.

La única salida es identificar la **fisura**: un párrafo del texto narrativo marcado por el autor con `# GENJUTSU_BREAK: stat` (tag inline en la misma línea del párrafo). Al hacer clic en ese párrafo, el jugador rompe la ilusión y avanza al nodo de resistencia.

La mecánica exige leer, no machacar.

---

## Las Fisuras

Cada fisura tiene un tipo vinculado al stat dominante del personaje. El párrafo **completo** es la fisura — no una palabra aislada. La contradicción está en el contenido narrativo; el glow visual guía hacia el párrafo correcto.

| Stat | Naturaleza de la fisura | Ejemplo |
|------|------------------------|---------|
| `fuerza` | Inconsistencia física o sensorial imposible | El vampiro describe "el frío del metal" de un objeto que es de madera |
| `magia` | Costura mágica visible solo a ojos entrenados | Un glow residual en una palabra, una rima estructural forzada en la ilusión |
| `conocimiento` | Contradicción factual que el personaje sabría detectar | El vampiro cita un hecho histórico que el personaje sabe que es falso |

Si el stat del `GENJUTSU_BREAK` **no coincide** con el stat dominante del jugador, el párrafo no se renderiza como clickeable — el vampiro eligió una mentira adecuada a ese personaje. El jugador solo puede ceder o agotar el willpower.

El stat dominante se determina con `getDominantStat(stats)`: retorna la key del stat con el valor más alto. En Centinelas los stats son `fuerza`, `magia`, `conocimiento`.

---

## Visibilidad de la Fisura

El párrafo con la fisura tiene un glow/underline cuya intensidad escala *inversamente* al willpower:

| Willpower | Apariencia | Razón narrativa |
|-----------|------------|-----------------|
| 70–100 | opacity ~15%, casi subliminal | La ilusión es perfecta |
| 30–70 | opacity ~40%, leve temblor/glow | El vampiro empieza a esforzarse |
| 0–30 | opacity ~70%, glow visible | El vampiro ya no puede sostener la mentira |

Cuanto más cede el jugador, más visible se vuelve la salida — tensión narrativa: el daño acumulado es también la pista.

---

## Authoring en Ink

### Sintaxis del tag de fisura

El tag `GENJUTSU_BREAK` debe ir **en la misma línea** que el texto del párrafo (tag inline de Ink):

```ink
El vampiro sonríe. "Este lugar siempre fue tuyo, lo sabés." # GENJUTSU_BREAK: conocimiento
```

**Nunca en la línea siguiente** — en Ink, un tag en línea propia después de un párrafo no se asocia al texto inmediatamente anterior de forma garantizada. Los tags inline son los únicos confiables para asociar metadata a un párrafo específico.

### Opciones trampa

Las opciones de Ink son parte de la ilusión. Al elegir cualquiera:
1. Se debita **15 puntos de willpower** (valor fijo, no configurable por tag)
2. El texto vampírico aumenta de presión
3. La historia avanza al siguiente nodo de ilusión

La primera opción (`index 0`) debe ser siempre la opción de "rendición/cesión" — es la que el engine selecciona automáticamente al llegar a willpower 0.

```ink
El vampiro sonríe. "Este lugar siempre fue tuyo, lo sabés." # GENJUTSU_BREAK: conocimiento

* [Me rindo, tenés razón]
* [Quizás solo necesito descansar]
* [Sí... siempre lo fue]
```

### Múltiples párrafos con fisura

En una secuencia de ilusión, cada nodo puede tener su propio `GENJUTSU_BREAK`. Al avanzar al siguiente nodo (por elegir una opción trampa), el estado `genjutsuBreak` se actualiza al nuevo párrafo. Solo hay una fisura activa a la vez — la del párrafo actual.

---

## Flujo de Interacción

```
WILLPOWER_START activo
  │
  ├── Ink avanza a párrafo con GENJUTSU_BREAK tag
  │     → engine detecta tag, almacena { stat, text: párrafo completo }
  │     → TextDisplay renderiza ese párrafo como clickeable (si stat matches)
  │
  ├── Jugador elige opción trampa
  │     → willpower -= 15
  │     → historia continúa al siguiente nodo de ilusión
  │     → genjutsuBreak se actualiza al nuevo párrafo (si tiene tag)
  │
  ├── Jugador hace clic en el párrafo-fisura (stat correcto)
  │     → engine escribe en Ink: genjutsu_stat_used = stat, genjutsu_willpower = value actual
  │     → historia avanza al nodo de resistencia (via story.Continue())
  │
  └── Willpower llega a 0 sin haber hecho clic en fisura
        → engine llama story.chooseChoiceIndex(0) (opción de rendición)
        → historia avanza al nodo de cesión
        → reemplaza ForcedClickOverlay por completo
```

---

## Variables Ink Escritas al Romper

Al hacer clic en la fisura, el engine escribe dos variables Ink antes de continuar la historia:

| Variable Ink | Valor |
|-------------|-------|
| `genjutsu_stat_used` | String del stat usado (e.g., `"conocimiento"`) |
| `genjutsu_willpower` | Número entero, willpower al momento del break (0–100) |

El autor puede usar estas variables para ramificar la narrativa:

```ink
{ genjutsu_willpower > 60:
    Rompiste la ilusión casi sin esfuerzo.
- else:
    Apenas lograste ver la grieta.
}
```

---

## Cambios Respecto al Sistema Actual

### Eliminado
- **V-mashing**: `WillpowerMeter.jsx` no llama `boostValue` mientras `genjutsuActive` es true (guard en el componente, comprobando el flag del subsistema)
- **ForcedClickOverlay**: reemplazado por selección automática de `choiceIndex(0)` al llegar a willpower 0

### Conservado
- **Ojo SVG** como indicador de willpower (se cierra igual que antes)
- **Susurros vampíricos** en los bordes de pantalla
- **Corrupción visual** del texto (blur/brightness sobre párrafos)
- **Audio sintético** (heartbeat + drone + static)
- **WILLPOWER_CHECK / WILLPOWER_STOP** sin cambios en Ink

### Cleanup en `WILLPOWER_STOP`
Al dispararse `WILLPOWER_STOP`, `genjutsuBreak` se pone a `null` inmediatamente. `TextDisplay.jsx` re-renderiza sin span clickeable. No requiere animación de salida.

---

## Implementación — Componentes

### 1. Tag Parser en `useTagProcessor.ts`

En el paso de continuación de historia, si `story.currentTags` contiene un tag con prefijo `GENJUTSU_BREAK:`:
- Extraer el stat: `tag.replace('GENJUTSU_BREAK:', '').trim()`
- El texto es `story.currentText` (el párrafo completo de ese paso)
- Emitir hacia el engine: `{ type: 'GENJUTSU_BREAK', stat, text }`

Este mecanismo funciona porque en inkjs, los tags inline de un párrafo se entregan en `story.currentTags` en el mismo paso de `Continue()` que produce ese texto.

### 2. Estado en `useBardoEngine.ts`

Nuevo estado:
```ts
genjutsuBreak: { stat: string, text: string } | null
```

Nuevo flag derivado:
```ts
genjutsuActive: boolean  // true cuando genjutsuBreak !== null
```

Nueva acción:
```ts
breakGenjutsu(): void
// - escribe genjutsu_stat_used y genjutsu_willpower via setGlobalVariable
// - llama story.Continue() para avanzar
// - limpia genjutsuBreak → null
```

Al recibir `WILLPOWER_STOP`: limpiar `genjutsuBreak → null`.
Al recibir `WILLPOWER_START`: no cambia genjutsuBreak (empieza null, se activa cuando el primer párrafo con tag aparezca).

### 3. Render en `TextDisplay.jsx`

Si `genjutsuBreak` existe y el párrafo actual coincide con `genjutsuBreak.text`:
- Verificar que `getDominantStat(stats) === genjutsuBreak.stat`
- Si sí: wrappear el párrafo en un `<span>` clickeable con estilo reactivo al willpower
- Si no: renderizar como texto normal (sin clickeable)

Estilo del span:
```
cursor: pointer
text-decoration: underline dotted
opacity: escala según willpower (15% → 40% → 70%)
filter: drop-shadow con color rojo/ámbar
transition: opacity 500ms
```

Al hacer clic: llamar `breakGenjutsu()`.

### 4. Guard de boost en `WillpowerMeter.jsx`

En el handler de keydown y en `handleTouch`, agregar guard:
```js
if (genjutsuActive) return  // no boost mientras la ilusión está activa
```

`genjutsuActive` se pasa como prop desde `App.jsx` (derivado de `genjutsuBreak !== null` en el subsistema).

### 5. Willpower 0 sin Fisura en `useBardoEngine.ts`

En el callback `onValueChange` del willpower system, si `value <= 0` y `genjutsuBreak !== null`:
```ts
story.chooseChoiceIndex(0)
story.Continue()
setGenjutsuBreak(null)
```

Mismo threshold que el ojo completamente cerrado (willpower 0).

### 6. Stat Dominante en `useGameSystems`

Nueva función exportada:
```ts
getDominantStat(stats: Record<string, number>): string
// Retorna el key con el valor más alto
// En empate: retorna el primero en orden de definición del config
```

---

## Consideraciones de Autoría

- El tag **debe ser inline** en la misma línea del párrafo
- La opción de rendición/cesión siempre va en **`index 0`** (primera opción)
- El texto de la fisura debe funcionar como contradicción narrativa — el glow guía, pero la lógica justifica
- No hay configuración de costo de willpower por elección trampa — siempre 15
- El engine no valida que haya exactamente un `GENJUTSU_BREAK` por nodo — es responsabilidad del autor

---

## Alcance

Este diseño aplica a Centinelas. El engine implementa el soporte pero la activación depende de los tags en el Ink de la historia. No modifica el comportamiento de `WILLPOWER_START` en historias que no usen `GENJUTSU_BREAK`.
