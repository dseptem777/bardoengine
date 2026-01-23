# ROADMAP: Fase 2.75 - Polish Narrativo & Arquitectura Core

## 📋 Descripción General
Esta fase intermedia tiene como objetivo estabilizar la arquitectura del motor y elevar la calidad de la experiencia de usuario (QoL) antes de iniciar la **Fase 3 (BardoEditor)**. Se enfoca en mejorar la legibilidad del código, la accesibilidad y la personalización visual dinámica.

---

## 🏗️ 1. Arquitectura: El Orchestrator `useBardoEngine`

**Problema Actual**: `App.jsx` gestiona ~15 estados y 10+ entry points de hooks, convirtiéndose en un archivo de 600+ líneas difícil de mantener.

**Tarea**: Crear `src/hooks/useBardoEngine.js` para centralizar el "Cerebro" del motor.

### Interfaz del Hook (Propuesta)
```javascript
export function useBardoEngine(storyId, devStories) {
  // Inicialización de Sub-sistemas
  const { playSfx, playMusic, stopMusic } = useAudio(...)
  const { vfxState, triggerVFX } = useVFX(...)
  const saveSystem = useSaveSystem(storyId)
  const gameSystems = useGameSystems(storyId)
  
  // Estado Consolidado
  const [engineState, setEngineState] = useState({
    story: null,
    text: '',
    choices: [],
    history: [], // Para la Bitácora
    isTyping: false,
    isEnded: false
  })

  // Métodos de acción
  const makeChoice = (index) => { ... }
  const continueStory = () => { ... }

  return {
    ...engineState,
    actions: { makeChoice, continueStory, saveGame, restart, finishGame },
    subsystems: { audio, vfx, saves, systems, achievements }
  }
}
```

---

## 📖 2. Feature: Bitácora Narrativa (History Log)

**Objetivo**: Permitir al jugador revisar diálogos pasados.

**Modelo de Datos**: 
- `history`: Array de objetos `{ text, tags, choices, timestamp }`.

**Implementación**:
- Crear `src/components/HistoryLog.jsx`.
- Modal con `Framer Motion` (AnimatePresence) y desenfoque de fondo.
- Estética de terminal retro con scroll automático al final.
- Acceso: Tecla **'L'** o botón en el Header.

---

## 🎨 3. Feature: Temas Dinámicos (CSS Injection)

**Objetivo**: Que cada juego pueda definir su propia identidad cromática sin tocar el CSS core.

**Tarea**:
1. Refactorizar `src/index.css` para usar variables:
   ```css
   :root { --bardo-accent: var(--dynamic-accent, #facc15); }
   ```
2. Configurar `tailwind.config.js` para que `bardo-accent` use `var(--bardo-accent)`.
3. En el hook `useBardoEngine`, inyectar la variable en el root:
   ```javascript
   document.documentElement.style.setProperty('--dynamic-accent', config.theme.primaryColor);
   ```

---

## ⌨️ 4. Feature: Navegación por Teclado V2

**Objetivo**: Navegación fluida con Flechas + Enter/Espacio.

**Mejoras**:
- **Navegación Secuencial**: Las flechas `Up/Down` mueven un foco visual entre las opciones actuales.
- **Confirmación**: `Enter` selecciona la opción enfocada.
- **Avanzar**: `Espacio` realiza el skip del typewriter (como el click actual).
- **Visual**: Modificar `ChoiceButton.jsx` para mostrar un estado `:focus` o `isSelected` con glow intenso y un cursor `>`.

---

## 🚀 Guía de Implementación Paso a Paso (Para el Agente)

1. **Fase A (CSS)**: Preparar `index.css` y `tailwind.config.js` para variables dinámicas.
2. **Phase B (Extraction)**: Crear `useBardoEngine.js`. Migrar la lógica de `App.jsx` por partes (primero Init, luego Continue).
3. **Phase C (Bitácora)**: Implementar el componente y el almacenamiento del historial en el hook.
4. **Phase D (Navegación)**: Refactorizar `useKeyboardNavigation.js` para manejar el `focusedIndex` interno.
5. **Phase E (Polish)**: Asegurar que `finishGame` limpie correctamente el save (Fix definitivo Bug #10).
