import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
    Controls,
    addEdge,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import HubNode from './nodes/HubNode';
import KnotNode from './nodes/KnotNode';
import ChoiceNode from './nodes/ChoiceNode';
import { generateInk, generateHubRegistry } from './utils/generateInk';
import { useEditorState } from './hooks/useEditorState';

// Node ID counter for new nodes
let idCounter = Date.now();

const getId = () => `node_${idCounter++}`;

export default function BardoEditor({ onClose }) {
    // Use centralized editor state with persistence
    const {
        nodes, edges, storyTitle, isDirty,
        onNodesChange, onEdgesChange,
        setNodes, setEdges, setStoryTitle,
        saveProject, loadProject, exportProject, importProject, newProject,
    } = useEditorState();

    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [isContentMaximized, setIsContentMaximized] = useState(false);

    // ReactFlow instance to project coordinates
    const [rfInstance, setRfInstance] = useState(null);

    // File input ref for import
    const fileInputRef = useRef(null);

    // Register custom node types
    const nodeTypes = useMemo(() => ({
        hub: HubNode,
        knot: KnotNode,
        alley: KnotNode,
        choice: ChoiceNode,
    }), []);

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

    const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
        setSelectedNodeId(selectedNodes[0]?.id || null);
        setIsContentMaximized(false);
    }, []);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    const updateNodeData = (key, value) => {
        setNodes(nds => nds.map(node => {
            if (node.id === selectedNodeId) {
                // Sync content and text properties for backward compatibility
                const newData = { ...node.data, [key]: value };
                if (key === 'content') newData.text = value;
                if (key === 'text') newData.content = value;

                return { ...node, data: newData };
            }
            return node;
        }));
    };

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

    const updateNodeId = (newId) => {
        if (!newId.trim()) return;
        if (nodes.some(n => n.id === newId && n.id !== selectedNodeId)) {
            alert(`ID "${newId}" already exists!`);
            return;
        }

        setNodes(nds => nds.map(node => {
            if (node.id === selectedNodeId) {
                return { ...node, id: newId };
            }
            return node;
        }));

        setEdges(eds => eds.map(edge => {
            const newEdge = { ...edge };
            if (newEdge.source === selectedNodeId) newEdge.source = newId;
            if (newEdge.target === selectedNodeId) newEdge.target = newId;
            return newEdge;
        }));

        setSelectedNodeId(newId);
    };

    const handleAddNode = useCallback((type = 'knot') => {
        const id = getId();
        const position = rfInstance
            ? rfInstance.project({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 })
            : { x: 400, y: 400 };

        // Determine the ReactFlow node type
        // Hub uses 'hub', Choice uses 'choice', everything else uses 'knot'
        const getNodeType = (t) => {
            if (t === 'hub') return 'hub';
            if (t === 'choice') return 'choice';
            return 'knot'; // knot, alley, etc.
        };

        const newNode = {
            id,
            position,
            type: getNodeType(type),
            data: {
                label: type === 'choice' ? 'What do you do?' : `New ${type}`,
                type,
                // Choice nodes get default options
                ...(type === 'choice' && { options: ['Option 1', 'Option 2'] })
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [rfInstance, setNodes]);

    const handleDeleteNode = useCallback(() => {
        if (!selectedNodeId) return;
        setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
        setSelectedNodeId(null);
    }, [selectedNodeId, setNodes, setEdges]);

    const handleExport = () => {
        const ink = `// STORY: ${storyTitle}\n` + generateInk(nodes, edges);
        const registry = generateHubRegistry(nodes);

        console.log('--- EXPORTED INK ---');
        console.log(ink);
        console.log('--- EXPORTED REGISTRY ---');
        console.log(JSON.stringify(registry, null, 2));

        // Also trigger file download
        exportProject();
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await importProject(file);
            } catch (err) {
                alert('Failed to import: ' + err.message);
            }
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#101622] flex flex-col text-white font-sans overflow-hidden">
            {/* Inject Styles & Fonts */}
            <style>
                {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

            .font-display { font-family: 'Inter', sans-serif; }
            .canvas-grid {
                background-image: radial-gradient(#282e39 1px, transparent 1px);
                background-size: 40px 40px;
            }
            .material-symbols-outlined { font-variation-settings: 'FILL' 1; }
            `}
            </style>

            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between border-b border-[#282e39] bg-[#101622]/80 backdrop-blur-md px-6 py-3 z-50 font-display">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#2b6cee] text-3xl">hub</span>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">The Loom</h2>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium">
                        <button className="text-[#9da6b9] hover:text-white transition-colors">Project</button>
                        <button className="text-white border-b-2 border-[#2b6cee] pb-1">Editor</button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#1c1f27] rounded-lg h-9 px-3 border border-[#282e39]">
                        <span className="material-symbols-outlined text-[#9da6b9] text-sm mr-2">search</span>
                        <input
                            className="bg-transparent border-none text-white text-sm focus:outline-none w-32 placeholder-[#4b5563]"
                            value={storyTitle}
                            onChange={(e) => setStoryTitle(e.target.value)}
                            placeholder="Story Title"
                        />
                    </div>

                    {/* Hidden file input for import */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.bardoproject.json"
                        onChange={handleImportFile}
                        className="hidden"
                    />

                    {/* New Project */}
                    <button onClick={newProject} className="flex items-center gap-2 rounded-lg h-9 px-3 bg-[#1c1f27] text-[#9da6b9] hover:text-white hover:bg-[#282e39] border border-[#282e39] transition-all text-sm" title="New Project">
                        <span className="material-symbols-outlined text-sm">note_add</span>
                    </button>

                    {/* Import */}
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-lg h-9 px-3 bg-[#1c1f27] text-[#9da6b9] hover:text-white hover:bg-[#282e39] border border-[#282e39] transition-all text-sm" title="Import Project">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                    </button>

                    {/* Save to localStorage */}
                    <button onClick={saveProject} className={`flex items-center gap-2 rounded-lg h-9 px-3 text-sm border transition-all ${isDirty ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30' : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:text-white hover:bg-[#282e39]'}`} title="Save to Browser">
                        <span className="material-symbols-outlined text-sm">save</span>
                    </button>

                    {/* Load from localStorage */}
                    <button onClick={loadProject} className="flex items-center gap-2 rounded-lg h-9 px-3 bg-[#1c1f27] text-[#9da6b9] hover:text-white hover:bg-[#282e39] border border-[#282e39] transition-all text-sm" title="Load from Browser">
                        <span className="material-symbols-outlined text-sm">folder_open</span>
                    </button>

                    {/* Export to file */}
                    <button onClick={handleExport} className="flex items-center gap-2 rounded-lg h-9 px-4 bg-[#2b6cee] text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-sm">download</span> Export
                    </button>

                    <button onClick={onClose} className="flex items-center justify-center rounded-lg h-9 w-9 bg-[#1c1f27] text-[#9da6b9] hover:text-white hover:bg-[#282e39] border border-[#282e39] transition-all">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 w-full relative canvas-grid bg-[#0b0c10] overflow-hidden flex font-display">
                {/* Side Navigation (Floating Tool Palette) */}
                <aside className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 bg-[#101622]/80 backdrop-blur-xl border border-[#282e39] p-3 rounded-2xl z-40 shadow-2xl">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleAddNode('hub')}
                            className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#1c1f27] text-[#9da6b9] hover:bg-[#2b6cee] hover:text-white transition-all border border-[#282e39] hover:border-[#2b6cee]"
                            title="Add Hub"
                        >
                            <span className="material-symbols-outlined">castle</span>
                        </button>
                        <button
                            onClick={() => handleAddNode('knot')}
                            className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#1c1f27] text-[#9da6b9] hover:bg-yellow-500 hover:text-white transition-all border border-[#282e39] hover:border-yellow-500"
                            title="Add Knot"
                        >
                            <span className="material-symbols-outlined">radio_button_checked</span>
                        </button>
                        <button
                            onClick={() => handleAddNode('alley')}
                            className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#1c1f27] text-[#9da6b9] hover:bg-green-500 hover:text-white transition-all border border-[#282e39] hover:border-green-500"
                            title="Add Alley"
                        >
                            <span className="material-symbols-outlined">psychology</span>
                        </button>
                        <button
                            onClick={() => handleAddNode('choice')}
                            className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#1c1f27] text-[#9da6b9] hover:bg-purple-500 hover:text-white transition-all border border-[#282e39] hover:border-purple-500"
                            title="Add Choice"
                        >
                            <span className="material-symbols-outlined">call_split</span>
                        </button>
                    </div>
                    <div className="h-px w-8 bg-[#282e39] my-1"></div>
                    <button
                        onClick={handleDeleteNode}
                        disabled={!selectedNodeId}
                        className={`group relative flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${!selectedNodeId ? 'opacity-50 cursor-not-allowed bg-[#1c1f27] border-[#282e39] text-[#9da6b9]' : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:bg-red-500/20 hover:text-red-500 hover:border-red-500'}`}
                        title="Delete Selected"
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </aside>

                {/* Main Canvas */}
                <div className="flex-1 h-full relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onSelectionChange={handleSelectionChange}
                        onInit={setRfInstance}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-transparent"
                        deleteKeyCode={['Backspace', 'Delete']}
                    >
                        {/* Replaced Background component with CSS radial gradient on container */}
                        <Controls className="!bg-[#1c1f27] !border-[#282e39] !fill-white [&>button]:!border-b-[#282e39] hover:[&>button]:!bg-[#282e39]" />
                        <MiniMap
                            className="!bg-[#1c1f27] !border-[#282e39] !rounded-lg overflow-hidden"
                            nodeColor={(n) => {
                                if (n.id === selectedNodeId) return '#2b6cee';
                                return n.type === 'hub' ? '#2b6cee' : '#4b5563';
                            }}
                            maskColor="rgba(16, 22, 34, 0.8)"
                        />
                    </ReactFlow>

                    {/* Floating Info */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-50">
                        <h1 className="text-white/20 text-4xl font-black uppercase tracking-[0.2em] select-none">Cluster Visualization</h1>
                        <p className="text-[#2b6cee]/40 text-sm tracking-widest mt-1">THE LOOM ENGINE</p>
                    </div>
                </div>

                {/* Right Panel: Cluster Analysis (Properties) */}
                {selectedNode && (
                    <div className={`absolute top-6 right-6 bottom-20 bg-[#101622]/90 backdrop-blur-xl border border-[#282e39] rounded-2xl shadow-2xl z-40 transition-all duration-300 flex flex-col overflow-hidden ${isContentMaximized ? 'w-[800px]' : 'w-80'}`}>
                        <div className="flex items-center justify-between p-5 border-b border-[#282e39]">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#2b6cee]">tune</span>
                                Node Properties
                            </h4>
                            <button
                                onClick={() => setIsContentMaximized(!isContentMaximized)}
                                className="text-[#9da6b9] hover:text-white"
                            >
                                <span className="material-symbols-outlined">{isContentMaximized ? 'close_fullscreen' : 'open_in_full'}</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Status Card */}
                            <div className="bg-[#1c1f27] p-3 rounded-xl border border-[#282e39] flex items-center justify-between">
                                <div>
                                    <div className="text-[#9da6b9] text-[10px] uppercase font-bold mb-1">Node ID</div>
                                    <input
                                        className="bg-transparent border-none text-white font-bold font-mono text-sm focus:outline-none w-full"
                                        value={selectedNode.id}
                                        onChange={(e) => updateNodeId(e.target.value)}
                                    />
                                </div>
                                <div className="text-[#2b6cee]">
                                    <span className="material-symbols-outlined">fingerprint</span>
                                </div>
                            </div>

                            {/* Label Input */}
                            <div>
                                <label className="text-[#9da6b9] text-[10px] uppercase font-bold mb-1 block">Display Label</label>
                                <input
                                    className="w-full bg-[#1c1f27] border border-[#282e39] rounded-lg px-3 py-2 text-white text-sm focus:border-[#2b6cee] focus:outline-none transition-colors"
                                    value={selectedNode.data.label || ''}
                                    onChange={(e) => updateNodeData('label', e.target.value)}
                                />
                            </div>

                            {/* Narrative Content */}
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
                                        {(selectedNode.data.options?.length || 0) < 4 && (
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

                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => updateNodeType('hub')}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${selectedNode.data.type === 'hub'
                                        ? 'bg-[#2b6cee]/20 border-[#2b6cee] text-[#2b6cee]'
                                        : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                        }`}
                                >
                                    hub
                                </button>
                                <button
                                    onClick={() => updateNodeType('knot')}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${selectedNode.data.type === 'knot'
                                        ? 'bg-[#2b6cee]/20 border-[#2b6cee] text-[#2b6cee]'
                                        : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                        }`}
                                >
                                    knot
                                </button>
                                <button
                                    onClick={() => updateNodeType('alley')}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${selectedNode.data.type === 'alley'
                                        ? 'bg-[#2b6cee]/20 border-[#2b6cee] text-[#2b6cee]'
                                        : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                        }`}
                                >
                                    alley
                                </button>
                                <button
                                    onClick={() => updateNodeType('choice')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${selectedNode?.data?.type === 'choice' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:text-white'}`}
                                >
                                    CHOICE
                                </button>
                            </div>

                            {/* Hub Rules */}
                            {selectedNode.data.type === 'hub' && (
                                <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-red-500 text-sm">local_fire_department</span>
                                        <span className="text-red-500 text-[10px] font-bold uppercase">Exclusion Logic</span>
                                    </div>
                                    <textarea
                                        className="w-full bg-[#0b0c10] border border-[#282e39] rounded-lg p-2 text-xs font-mono text-green-400 focus:outline-none focus:border-red-500/50 min-h-[80px]"
                                        value={JSON.stringify(selectedNode.data.burnRules || [], null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const rules = JSON.parse(e.target.value);
                                                updateNodeData('burnRules', rules);
                                            } catch (e) { }
                                        }}
                                    />
                                </div>
                            )}

                            {/* Toggle Burned (For Knots) */}
                            {selectedNode.data.type !== 'hub' && (
                                <div className="flex items-center gap-3 pt-4 border-t border-[#282e39]">
                                    <input
                                        type="checkbox"
                                        id="isBurned"
                                        checked={selectedNode.data.isBurned || false}
                                        onChange={(e) => updateNodeData('isBurned', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#282e39] bg-[#1c1f27] text-red-500 focus:ring-0 focus:ring-offset-0"
                                    />
                                    <label htmlFor="isBurned" className="text-sm text-[#9da6b9]">Mark as Burned (Preview)</label>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Status Bar */}
            <footer className="h-8 bg-[#0b0c10] border-t border-[#282e39] flex items-center justify-between px-6 text-[10px] text-[#4b5563] z-50 font-display">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Engine Online</span>
                    </div>
                    <div className="w-px h-3 bg-[#282e39]"></div>
                    <span>Nodes: <span className="text-white">{nodes.length}</span></span>
                    <span>Edges: <span className="text-white">{edges.length}</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[#9da6b9] hover:text-white cursor-pointer transition-colors">Keyboard Shortcuts</span>
                </div>
            </footer>
        </div>
    );
}
