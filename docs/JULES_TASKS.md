# Jules Tasks - BardoEditor

> **Este archivo contiene tareas específicas para Jules.**
> Cada tarea tiene instrucciones exactas. Jules debe seguirlas al pie de la letra.

---

## ✅ COMPLETED: Phase 1 & Phase 2 (Base)
**Completado por:** Antigravity & Jules
- Phase 1: Persistence & Hook (Antigravity)
- Task 2.1: ChoiceNode Base (Antigravity)
- Task 2.2: Edge Labels (Jules)
- Task 2.3: Type Switching Fix (Jules)
- Task 2.4: Content & Options Editor (Jules)

---

## 🔵 CURRENT: Phase 2 - Final Polish

**Branch:** `feature/phase3-bardoeditor-hubs-8648822128927855968`

---

### Task 2.5: Tag Autocomplete Helper
**Status:** 🟡 READY FOR JULES
**Prioridad:** Medium

#### Objetivo
Ayudar al usuario a recordar los tags de VFX (#shake, #flash, etc.) mientras escribe en el Narrative Content.

#### Instrucciones

1. **Definir la lista de tags** en una constante al inicio de `src/editor/BardoEditor.jsx` (fuera del componente, cerca de `idCounter`):

```javascript
const BARDO_TAGS = [
    { tag: '#shake', desc: 'Shake the screen' },
    { tag: '#flash', desc: 'Flash white' },
    { tag: '#play_sfx:', desc: 'Play sound effect' },
    { tag: '#play_bgm:', desc: 'Change background music' },
    { tag: '#stop_bgm', desc: 'Stop music' },
    { tag: '#inventory_add:', desc: 'Add item to inventory' },
    { tag: '#inventory_remove:', desc: 'Remove item' },
    { tag: '#stat_add:', desc: 'Update a stat value' },
    { tag: '#wait:', desc: 'Pause narrative for X seconds' }
];
```

2. **Implementar el Helper UI**:
Debajo del `textarea` de "Narrative Content" (implementado en Task 2.4), agrega un pequeño panel de "Quick Tags" que inserte el tag al hacer clic.

```jsx
{/* Quick Tag Helper */}
<div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#282e39] pt-3">
    {BARDO_TAGS.map(item => (
        <button
            key={item.tag}
            onClick={() => {
                const currentContent = selectedNode.data.content || '';
                updateNodeData('content', currentContent + (currentContent ? '\n' : '') + item.tag);
            }}
            className="px-2 py-1 rounded bg-[#1c1f27] border border-[#282e39] text-[9px] text-[#9da6b9] hover:text-white hover:border-[#2b6cee] transition-all font-mono"
            title={item.desc}
        >
            {item.tag.replace(':', '')}
        </button>
    ))}
</div>
```

#### Verificación
```powershell
npm run dev
# 1. Seleccionar un nodo.
# 2. Hacer clic en el botón "#shake" debajo del contenido.
# 3. Verificar que #shake se agrega automáticamente al área de texto.
# 4. Verificar que al exportar JSON, el tag está presente.
```

---

## 📋 Proximamente: Phase 3 - Live Preview
(Este es un hito mayor. Antigravity tomará el liderazgo aquí).

---

## ⚠️ Reglas para Jules

1. **NO modificar** archivos que no estén listados en la tarea
2. **NO crear** nuevas ramas
3. **Verificar** antes de commitear
4. **NO hacer merge** a dev sin aprobación
