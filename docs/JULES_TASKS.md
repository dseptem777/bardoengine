# Jules Tasks - BardoEditor

> **Este archivo contiene tareas específicas para Jules.**
> Cada tarea tiene instrucciones exactas. Jules debe seguirlas al pie de la letra.

---

## ✅ COMPLETED: Phase 1 - Foundation

**Completado por:** Antigravity (2026-01-27)

- `src/editor/hooks/useEditorState.js` - State management
- `src/editor/BardoEditor.jsx` - Integrado con botones New/Import/Save/Load/Export
- Dirty state indicator (amarillo cuando hay cambios sin guardar)
- Persistencia localStorage + archivos JSON

---

## ✅ COMPLETED: Phase 2 Task 2.1 - ChoiceNode

**Completado por:** Antigravity (2026-01-27)

- `src/editor/nodes/ChoiceNode.jsx` - Componente púrpura con branching
- Botón en sidebar (4to botón, icon call_split)
- Nodos con 2 output handles por defecto
- Fix en `handleAddNode` para soportar múltiples tipos

---

## 🔵 CURRENT: Phase 2 - Remaining Tasks

**Issue:** [#58](https://github.com/dseptem777/bardoengine/issues/58)
**Branch:** `feature/phase3-bardoeditor-hubs-8648822128927855968`

---

### Task 2.2: Edge Labels para Choices
**Status:** 🟡 READY FOR JULES
**Prioridad:** Medium

#### Objetivo
Mostrar el texto de las opciones en los edges/connections para visualizar qué choice lleva a dónde.

#### Instrucciones

1. Modificar `onConnect` en `src/editor/BardoEditor.jsx`:

Buscar la función `onConnect` (aprox línea 43) y reemplazar con:

```jsx
const onConnect = useCallback((params) => {
    // If connecting from a choice node, prompt for edge label
    const sourceNode = nodes.find(n => n.id === params.source);
    
    let label = '';
    if (sourceNode?.type === 'choice') {
        label = prompt('Enter choice text (e.g., "Go left", "Attack"):') || '';
    }
    
    setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: { stroke: '#2b6cee', strokeWidth: 2 },
        label,
        labelStyle: { fill: '#ffffff', fontWeight: 600 },
    }, eds));
}, [setEdges, nodes]);
```

2. Actualizar dependencias del useCallback agregando `nodes` al array de dependencias.

#### Verificación
```powershell
npm run dev
# Crear un Choice node
# Crear un Hub/Knot node
# Conectar el Choice al Hub
# Debe aparecer un prompt pidiendo texto
# Escribir "Option A"
# El edge debe mostrar "Option A" como label
```

---

### Task 2.3: Properties Panel mejorado
**Status:** 🔴 BLOCKED (necesita Task 2.2 primero)

#### Objetivo
Mejorar el panel de propiedades para editar opciones de ChoiceNode y content de nodos.

#### Instrucciones

(Se documentará después de Task 2.2)

---

### Task 2.4: Tag Autocomplete
**Status:** 🔴 BLOCKED (necesita Task 2.3 primero)

---

## 📋 Future Tasks (Phase 3+)

### Task 3.1: Preview Panel
**Status:** 🔴 NOT STARTED
**Needs:** Phase 2 completo

### Task 4.1: Export to BardoEngine Format
**Status:** 🔴 NOT STARTED

### Task 5.1: Keyboard Shortcuts & Polish
**Status:** 🔴 NOT STARTED

---

## ⚠️ Reglas para Jules

1. **NO modificar** archivos que no estén listados en la tarea
2. **NO crear** nuevas ramas - usar la rama actual
3. **Verificar** con los comandos indicados antes de commitear
4. **Reportar** si algo no funciona como esperado
5. **NO hacer merge** a dev sin aprobación
6. Si algo no está claro, **esperar instrucciones** en lugar de improvisar

---

## 📊 Progress Tracker

| Phase | Status | Tasks Completed | Tasks Remaining |
|-------|--------|----------------|-----------------|
| Phase 1 | ✅ | 5/5 | 0 |
| Phase 2 | 🔵 | 1/4 | 3 |
| Phase 3 | 🔴 | 0/2 | 2 |
| Phase 4 | 🔴 | 0/2 | 2 |
| Phase 5 | 🔴 | 0/4 | 4 |
