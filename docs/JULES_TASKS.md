# Jules Tasks - BardoEditor

> **Este archivo contiene tareas específicas para Jules.**
> Cada tarea tiene instrucciones exactas. Jules debe seguirlas al pie de la letra.

---

## ✅ COMPLETED: Phase 1 - Foundation
**Completado por:** Antigravity (2026-01-27)

---

## ✅ COMPLETED: Phase 2 Tasks 2.1 - 2.3
- **Task 2.1 (ChoiceNode):** Antigravity
- **Task 2.2 (Edge Labels):** Jules (PR #62)
- **Task 2.3 (Fix updateNodeType):** Jules (PR #63)

---

## 🔵 CURRENT: Phase 2 - Node System Features

**Branch:** `feature/phase3-bardoeditor-hubs-8648822128927855968`

---

### Task 2.4: Implementar Panel de Edición de Contenido
**Status:** 🟡 READY FOR JULES
**Prioridad:** High

#### Objetivo
Permitir al usuario editar el texto narrativo de los nodos y las opciones de los Choice Nodes desde el panel lateral derecho (Properties Panel).

#### Instrucciones

1. **Abrir `src/editor/BardoEditor.jsx`**

2. **Refactorizar el panel de propiedades** (sección "Properties" en el sidebar derecho, aprox línea ~380):
   
   Actualmente solo hay inputs para ID y Label. Necesitamos agregar una sección de "Content" y una de "Options".

3. **Agregar el editor de contenido (Narrative Text):**
   Debajo del input de "Display Label", agrega un textarea para el contenido:
   
```jsx
{/* Content Editor */}
<div className="mb-6">
    <label className="block text-[10px] uppercase font-bold text-[#4b5563] mb-2 tracking-widest">
        Narrative Content
    </label>
    <textarea
        className="w-full h-32 bg-[#0b0c10] border border-[#282e39] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#2b6cee] transition-all resize-none placeholder-[#4b5563]"
        value={selectedNode?.data?.content || ''}
        onChange={(e) => updateNodeData('content', e.target.value)}
        placeholder="Enter the story text for this node..."
    />
    <p className="mt-2 text-[10px] text-[#4b5563]">
        Tip: Use #tags for VFX (e.g. #shake, #flash)
    </p>
</div>
```

4. **Agregar el editor de opciones (Solo para el tipo 'choice'):**
   Si el nodo es de tipo `choice`, muestra una lista de inputs para editar las opciones:

```jsx
{/* Choice Options Editor */}
{selectedNode?.data?.type === 'choice' && (
    <div className="mb-6 animate-fade-in">
        <label className="block text-[10px] uppercase font-bold text-purple-500 mb-2 tracking-widest">
            Choice Options
        </label>
        <div className="space-y-2">
            {(selectedNode.data.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                    <input
                        className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded-lg h-9 px-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                        value={option}
                        onChange={(e) => {
                            const newOptions = [...selectedNode.data.options];
                            newOptions[index] = e.target.value;
                            updateNodeData('options', newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                    />
                    {/* Botón para eliminar opción si hay más de 2 */}
                    {selectedNode.data.options.length > 2 && (
                        <button 
                            onClick={() => {
                                const newOptions = selectedNode.data.options.filter((_, i) => i !== index);
                                updateNodeData('options', newOptions);
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-[#1c1f27] text-red-400 hover:bg-red-500/10 rounded-lg border border-[#282e39] transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    )}
                </div>
            ))}
            
            {/* Botón para agregar opción (máximo 4) */}
            {selectedNode.data.options.length < 4 && (
                <button
                    onClick={() => {
                        const newOptions = [...(selectedNode.data.options || []), `New Option` ];
                        updateNodeData('options', newOptions);
                    }}
                    className="w-full h-9 flex items-center justify-center gap-2 bg-[#1c1f27] text-[#9da6b9] hover:text-white hover:bg-[#282e39] rounded-lg border border-[#282e39] border-dashed transition-all text-xs"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Option
                </button>
            )}
        </div>
    </div>
)}
```

#### Verificación
```powershell
npm run dev
# 1. Crear un Knot. Escribir en "Narrative Content".
# 2. Crear un Choice. Cambiar el nombre de "Option 1".
# 3. Darle al botón "Add Option" y verificar que aparece un tercer input.
# 4. Eliminar una opción y verificar que desaparece.
# 5. Exportar JSON (clic en download) y verificar que el JSON tiene el content y las options.
```

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
| Phase 2 | 🔵 | 3/5 | 2 |
| Phase 3 | 🔴 | 0/2 | 2 |
| Phase 4 | 🔴 | 0/2 | 2 |
| Phase 5 | 🔴 | 0/4 | 4 |
