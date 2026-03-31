import React, { useState } from 'react';

const QUICK_TEMPLATES = [
    { name: 'minigame_result', type: 'number', value: 0, desc: 'Minigame outcome (1=win, 0=lose)' },
    { name: 'hp', type: 'number', value: 100, desc: 'Player health' },
    { name: 'player_name', type: 'string', value: '', desc: 'Player name input' },
    { name: 'score', type: 'number', value: 0, desc: 'Score counter' },
    { name: 'has_key', type: 'boolean', value: false, desc: 'Key item flag' },
];

export default function VariablesPanel({ variables = [], onChange }) {
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('number');

    const addVariable = (name, type, value) => {
        if (!name.trim()) return;
        if (variables.some(v => v.name === name)) return;
        onChange([...variables, { name: name.trim(), type, value }]);
        setNewName('');
    };

    const removeVariable = (index) => {
        onChange(variables.filter((_, i) => i !== index));
    };

    const updateVariable = (index, field, value) => {
        // Prevent duplicate variable names
        if (field === 'name' && value && variables.some((v, i) => i !== index && v.name === value)) {
            return;
        }
        const updated = variables.map((v, i) => {
            if (i !== index) return v;
            const newVar = { ...v, [field]: value };
            // Reset value when type changes
            if (field === 'type') {
                newVar.value = value === 'string' ? '' : value === 'boolean' ? false : 0;
            }
            return newVar;
        });
        onChange(updated);
    };

    const getDefaultValue = (type) => {
        if (type === 'string') return '';
        if (type === 'boolean') return false;
        return 0;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2b6cee] text-base">data_object</span>
                    Variables
                </h3>
                <span className="text-[10px] text-[#4b5563]">{variables.length} defined</span>
            </div>

            {/* Variable List */}
            <div className="space-y-2">
                {variables.map((v, i) => (
                    <div key={i} className="bg-[#1c1f27] border border-[#282e39] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <input
                                className="bg-transparent text-white text-sm font-mono font-bold focus:outline-none flex-1"
                                value={v.name}
                                onChange={(e) => updateVariable(i, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            />
                            <button
                                onClick={() => removeVariable(i)}
                                className="text-[#4b5563] hover:text-red-400 transition-colors ml-2"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="bg-[#0b0c10] border border-[#282e39] rounded px-2 py-1 text-xs text-[#9da6b9] focus:outline-none focus:border-[#2b6cee]"
                                value={v.type}
                                onChange={(e) => updateVariable(i, 'type', e.target.value)}
                            >
                                <option value="number">number</option>
                                <option value="string">string</option>
                                <option value="boolean">boolean</option>
                            </select>
                            {v.type === 'boolean' ? (
                                <select
                                    className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2b6cee]"
                                    value={v.value ? 'true' : 'false'}
                                    onChange={(e) => updateVariable(i, 'value', e.target.value === 'true')}
                                >
                                    <option value="false">false</option>
                                    <option value="true">true</option>
                                </select>
                            ) : (
                                <input
                                    className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2b6cee]"
                                    type={v.type === 'number' ? 'number' : 'text'}
                                    value={v.value}
                                    onChange={(e) => updateVariable(i, 'value', v.type === 'number' ? Number(e.target.value) : e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Variable */}
            <div className="flex gap-2">
                <input
                    className="flex-1 bg-[#0b0c10] border border-[#282e39] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2b6cee] font-mono placeholder-[#4b5563]"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="variable_name"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') addVariable(newName, newType, getDefaultValue(newType));
                    }}
                />
                <select
                    className="bg-[#0b0c10] border border-[#282e39] rounded-lg px-2 py-2 text-xs text-[#9da6b9] focus:outline-none"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                >
                    <option value="number">num</option>
                    <option value="string">str</option>
                    <option value="boolean">bool</option>
                </select>
                <button
                    onClick={() => addVariable(newName, newType, getDefaultValue(newType))}
                    className="px-3 py-2 bg-[#2b6cee] text-white text-sm rounded-lg hover:bg-blue-600 transition-all"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
            </div>

            {/* Quick Templates */}
            <div>
                <div className="text-[10px] text-[#4b5563] uppercase font-bold mb-2">Quick Add</div>
                <div className="flex flex-wrap gap-1.5">
                    {QUICK_TEMPLATES
                        .filter(t => !variables.some(v => v.name === t.name))
                        .map(t => (
                            <button
                                key={t.name}
                                onClick={() => addVariable(t.name, t.type, t.value)}
                                className="px-2 py-1 rounded bg-[#1c1f27] border border-[#282e39] text-[9px] text-[#9da6b9] hover:text-white hover:border-[#2b6cee] transition-all font-mono"
                                title={t.desc}
                            >
                                {t.name}
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}
