import React, { useState } from 'react';

const TABS = ['general', 'stats', 'inventory', 'achievements'];

export default function ConfigPanel({ config, onChange }) {
    const [activeTab, setActiveTab] = useState('general');

    const update = (path, value) => {
        const newConfig = JSON.parse(JSON.stringify(config));
        const keys = path.split('.');
        let obj = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        onChange(newConfig);
    };

    const get = (path, fallback = '') => {
        const keys = path.split('.');
        let obj = config;
        for (const k of keys) {
            if (obj == null) return fallback;
            obj = obj[k];
        }
        return obj ?? fallback;
    };

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-[#0b0c10] rounded-lg p-1">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                            activeTab === tab
                                ? 'bg-[#2b6cee] text-white'
                                : 'text-[#4b5563] hover:text-[#9da6b9]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="space-y-4">
                    <Field label="Version">
                        <input
                            className="field-input"
                            value={get('version', '1.0.0')}
                            onChange={(e) => update('version', e.target.value)}
                        />
                    </Field>
                    <Field label="Primary Color">
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                className="w-8 h-8 rounded border border-[#282e39] cursor-pointer bg-transparent"
                                value={get('theme.primaryColor', '#facc15')}
                                onChange={(e) => update('theme.primaryColor', e.target.value)}
                            />
                            <input
                                className="field-input flex-1"
                                value={get('theme.primaryColor', '#facc15')}
                                onChange={(e) => update('theme.primaryColor', e.target.value)}
                            />
                        </div>
                    </Field>
                    <Field label="Background Color">
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                className="w-8 h-8 rounded border border-[#282e39] cursor-pointer bg-transparent"
                                value={get('theme.bgColor', '#0a0a0a')}
                                onChange={(e) => update('theme.bgColor', e.target.value)}
                            />
                            <input
                                className="field-input flex-1"
                                value={get('theme.bgColor', '#0a0a0a')}
                                onChange={(e) => update('theme.bgColor', e.target.value)}
                            />
                        </div>
                    </Field>
                    <Field label="Theme Description">
                        <input
                            className="field-input"
                            value={get('theme.description', '')}
                            onChange={(e) => update('theme.description', e.target.value)}
                            placeholder="e.g. Dark horror theme"
                        />
                    </Field>
                </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <StatsEditor
                    enabled={get('stats.enabled', false)}
                    definitions={get('stats.definitions', [])}
                    onToggle={(v) => update('stats.enabled', v)}
                    onDefinitionsChange={(defs) => update('stats.definitions', defs)}
                />
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
                <InventoryEditor
                    enabled={get('inventory.enabled', false)}
                    maxSlots={get('inventory.maxSlots', 10)}
                    categories={get('inventory.categories', [])}
                    onToggle={(v) => update('inventory.enabled', v)}
                    onMaxSlotsChange={(v) => update('inventory.maxSlots', v)}
                    onCategoriesChange={(v) => update('inventory.categories', v)}
                />
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
                <AchievementsEditor
                    achievements={get('achievements', [])}
                    onChange={(v) => update('achievements', v)}
                />
            )}

            <style>{`
                .field-input {
                    width: 100%;
                    background: #0b0c10;
                    border: 1px solid #282e39;
                    border-radius: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    color: white;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .field-input:focus { border-color: #2b6cee; }
            `}</style>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-[#9da6b9] text-[10px] uppercase font-bold mb-1.5 block">{label}</label>
            {children}
        </div>
    );
}

function StatsEditor({ enabled, definitions = [], onToggle, onDefinitionsChange }) {
    const addStat = () => {
        onDefinitionsChange([...definitions, {
            id: `stat_${definitions.length}`,
            label: 'New Stat',
            icon: '⭐',
            displayType: 'bar',
            min: 0,
            max: 100,
            initial: 50,
            color: '#facc15'
        }]);
    };

    const updateStat = (index, field, value) => {
        const updated = definitions.map((d, i) => i === index ? { ...d, [field]: value } : d);
        onDefinitionsChange(updated);
    };

    const removeStat = (index) => {
        onDefinitionsChange(definitions.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white font-bold">Enable Stats</span>
                <button
                    onClick={() => onToggle(!enabled)}
                    className={`w-10 h-5 rounded-full transition-all ${enabled ? 'bg-[#2b6cee]' : 'bg-[#282e39]'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${enabled ? 'translate-x-5' : ''}`} />
                </button>
            </div>

            {enabled && (
                <>
                    {definitions.map((stat, i) => (
                        <div key={i} className="bg-[#0b0c10] border border-[#282e39] rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <input
                                    className="bg-transparent text-white text-sm font-mono font-bold focus:outline-none flex-1"
                                    value={stat.id}
                                    onChange={(e) => updateStat(i, 'id', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                />
                                <button onClick={() => removeStat(i)} className="text-[#4b5563] hover:text-red-400 ml-2">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-[9px] text-[#4b5563] uppercase">Label</span>
                                    <input className="field-input" value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} />
                                </div>
                                <div>
                                    <span className="text-[9px] text-[#4b5563] uppercase">Icon</span>
                                    <input className="field-input" value={stat.icon} onChange={(e) => updateStat(i, 'icon', e.target.value)} />
                                </div>
                                <div>
                                    <span className="text-[9px] text-[#4b5563] uppercase">Min</span>
                                    <input className="field-input" type="number" value={stat.min} onChange={(e) => updateStat(i, 'min', Number(e.target.value))} />
                                </div>
                                <div>
                                    <span className="text-[9px] text-[#4b5563] uppercase">Max</span>
                                    <input className="field-input" type="number" value={stat.max} onChange={(e) => updateStat(i, 'max', Number(e.target.value))} />
                                </div>
                                <div>
                                    <span className="text-[9px] text-[#4b5563] uppercase">Initial</span>
                                    <input className="field-input" type="number" value={stat.initial} onChange={(e) => updateStat(i, 'initial', Number(e.target.value))} />
                                </div>
                                <div>
                                    <span className="text-[9px] text-[#4b5563] uppercase">Color</span>
                                    <div className="flex gap-1 items-center">
                                        <input type="color" className="w-6 h-6 rounded border border-[#282e39] cursor-pointer bg-transparent" value={stat.color || '#facc15'} onChange={(e) => updateStat(i, 'color', e.target.value)} />
                                        <input className="field-input flex-1" value={stat.color || ''} onChange={(e) => updateStat(i, 'color', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={addStat}
                        className="w-full py-2 rounded-lg border border-dashed border-[#282e39] text-[#4b5563] hover:text-white hover:border-[#2b6cee] text-xs transition-all flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> Add Stat
                    </button>
                </>
            )}
        </div>
    );
}

function InventoryEditor({ enabled, maxSlots, categories, onToggle, onMaxSlotsChange, onCategoriesChange }) {
    const [newCategory, setNewCategory] = useState('');

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white font-bold">Enable Inventory</span>
                <button
                    onClick={() => onToggle(!enabled)}
                    className={`w-10 h-5 rounded-full transition-all ${enabled ? 'bg-[#2b6cee]' : 'bg-[#282e39]'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${enabled ? 'translate-x-5' : ''}`} />
                </button>
            </div>

            {enabled && (
                <>
                    <Field label="Max Slots">
                        <input className="field-input" type="number" value={maxSlots} onChange={(e) => onMaxSlotsChange(Number(e.target.value))} min={1} max={99} />
                    </Field>
                    <Field label="Categories">
                        <div className="space-y-1.5">
                            {categories.map((cat, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        className="field-input flex-1"
                                        value={cat}
                                        onChange={(e) => {
                                            const updated = [...categories];
                                            updated[i] = e.target.value;
                                            onCategoriesChange(updated);
                                        }}
                                    />
                                    <button onClick={() => onCategoriesChange(categories.filter((_, j) => j !== i))} className="text-[#4b5563] hover:text-red-400">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <input
                                    className="field-input flex-1"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="New category..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newCategory.trim()) {
                                            onCategoriesChange([...categories, newCategory.trim()]);
                                            setNewCategory('');
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (newCategory.trim()) {
                                            onCategoriesChange([...categories, newCategory.trim()]);
                                            setNewCategory('');
                                        }
                                    }}
                                    className="text-[#4b5563] hover:text-[#2b6cee]"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        </div>
                    </Field>
                </>
            )}
        </div>
    );
}

function AchievementsEditor({ achievements = [], onChange }) {
    const addAchievement = () => {
        onChange([...achievements, {
            id: `achievement_${achievements.length}`,
            title: 'New Achievement',
            description: '',
            icon: '🏆',
            hidden: false
        }]);
    };

    const updateAchievement = (index, field, value) => {
        const updated = achievements.map((a, i) => i === index ? { ...a, [field]: value } : a);
        onChange(updated);
    };

    const removeAchievement = (index) => {
        onChange(achievements.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {achievements.map((ach, i) => (
                <div key={i} className="bg-[#0b0c10] border border-[#282e39] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <input
                            className="bg-transparent text-white text-sm font-mono font-bold focus:outline-none flex-1"
                            value={ach.id}
                            onChange={(e) => updateAchievement(i, 'id', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        />
                        <button onClick={() => removeAchievement(i)} className="text-[#4b5563] hover:text-red-400 ml-2">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-[9px] text-[#4b5563] uppercase">Title</span>
                            <input className="field-input" value={ach.title} onChange={(e) => updateAchievement(i, 'title', e.target.value)} />
                        </div>
                        <div>
                            <span className="text-[9px] text-[#4b5563] uppercase">Icon</span>
                            <input className="field-input" value={ach.icon} onChange={(e) => updateAchievement(i, 'icon', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <span className="text-[9px] text-[#4b5563] uppercase">Description</span>
                        <input className="field-input" value={ach.description} onChange={(e) => updateAchievement(i, 'description', e.target.value)} />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-[#9da6b9] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={ach.hidden || false}
                            onChange={(e) => updateAchievement(i, 'hidden', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-[#282e39] bg-[#1c1f27]"
                        />
                        Hidden achievement
                    </label>
                </div>
            ))}
            <button
                onClick={addAchievement}
                className="w-full py-2 rounded-lg border border-dashed border-[#282e39] text-[#4b5563] hover:text-white hover:border-[#2b6cee] text-xs transition-all flex items-center justify-center gap-1"
            >
                <span className="material-symbols-outlined text-sm">add</span> Add Achievement
            </button>
        </div>
    );
}
