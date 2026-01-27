# Jules Tasks - BardoEditor

> **Este archivo contiene tareas específicas para Jules.**
> Cada tarea tiene instrucciones exactas. Jules debe seguirlas al pie de la letra.

---

## ✅ COMPLETED: Phase 1 - Foundation
**Completado por:** Antigravity (2026-01-27)

---

## ✅ COMPLETED: Phase 2 Task 2.1 - ChoiceNode
**Completado por:** Antigravity (2026-01-27)

---

## ✅ COMPLETED: Phase 2 Task 2.2 - Edge Labels
**Completado por:** Jules (2026-01-27) - PR #62

---

## 🔵 CURRENT: Phase 2 - Remaining Tasks

**Branch:** `feature/phase3-bardoeditor-hubs-8648822128927855968`

---

### Task 2.3: Fix updateNodeType para Choice
**Status:** 🟡 READY FOR JULES
**Prioridad:** High (bug fix)

#### Problema
La función `updateNodeType` en línea ~79-90 no maneja el tipo `choice` correctamente.
Actualmente hace: `type: type === 'hub' ? 'hub' : 'knot'`
Esto ignora `choice`.

#### Instrucciones

1. Abrir `src/editor/BardoEditor.jsx`

2. Buscar la función `updateNodeType` (aprox línea 79):

```jsx
const updateNodeType = (type) => {
    setNodes(nds => nds.map(node => {
        if (node.id === selectedNodeId) {
            return {
                ...node,
                type: type === 'hub' ? 'hub' : 'knot', // Use 'knot' renderer for alley too
                data: { ...node.data, type }
            };
        }
        return node;
    }));
};
```

3. Reemplazar con:

```jsx
const updateNodeType = (type) => {
    setNodes(nds => nds.map(node => {
        if (node.id === selectedNodeId) {
            // Determine ReactFlow node type
            const getNodeType = (t) => {
                if (t === 'hub') return 'hub';
                if (t === 'choice') return 'choice';
                return 'knot'; // knot, alley use knot renderer
            };
            
            return {
                ...node,
                type: getNodeType(type),
                data: { 
                    ...node.data, 
                    type,
                    // Add default options if changing to choice
                    ...(type === 'choice' && !node.data.options && { options: ['Option 1', 'Option 2'] })
                }
            };
        }
        return node;
    }));
};
```

4. **Buscar los botones de tipo en el Properties Panel** (aprox línea 350-380) y agregar un botón para CHOICE:

Buscar algo como:
```jsx
<button onClick={() => updateNodeType('hub')} ...>HUB</button>
<button onClick={() => updateNodeType('knot')} ...>KNOT</button>
<button onClick={() => updateNodeType('alley')} ...>ALLEY</button>
```

Y agregar después de ALLEY:
```jsx
<button 
    onClick={() => updateNodeType('choice')} 
    className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${selectedNode?.data?.type === 'choice' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:text-white'}`}
>
    CHOICE
</button>
```

#### Verificación
```powershell
npm run dev
# Crear un nodo Hub
# Seleccionar el nodo
# En Properties Panel, click en "CHOICE"
# El nodo debe cambiar a visualización púrpura de ChoiceNode
```

---

### Task 2.4: Tag Autocomplete
**Status:** 🔴 BLOCKED (necesita Task 2.3 primero)

---

## ⚠️ Reglas para Jules

1. **NO modificar** archivos que no estén listados en la tarea
2. **NO crear** nuevas ramas - usar la rama actual
3. **Verificar** con los comandos indicados antes de commitear
4. **Reportar** si algo no funciona como esperado
5. **NO hacer merge** a dev sin aprobación

---

## 📊 Progress Tracker

| Phase | Status | Tasks Completed | Tasks Remaining |
|-------|--------|----------------|-----------------|
| Phase 1 | ✅ | 5/5 | 0 |
| Phase 2 | 🔵 | 2/4 | 2 |
| Phase 3 | 🔴 | 0/2 | 2 |
| Phase 4 | 🔴 | 0/2 | 2 |
| Phase 5 | 🔴 | 0/4 | 4 |
