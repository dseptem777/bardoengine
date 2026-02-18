import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
    Controls,
    addEdge,
    MiniMap,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import PassageNode, { getDominantTagCategory, TAG_CATEGORY_COLORS, CHAPTER_COLORS, parseContent } from './nodes/PassageNode';
import PreviewPanel from './components/PreviewPanel';
import VariablesPanel from './components/VariablesPanel';
import ConfigPanel from './components/ConfigPanel';
import { generateInk, generateHubRegistry, validateGraph } from './utils/generateInk';
import { useEditorState } from './hooks/useEditorState';

// Node ID counter for new nodes
let idCounter = Date.now();

const BARDO_TAGS = {
    VFX: [
        { tag: '#shake', desc: 'Shake the screen' },
        { tag: '#flash_red', desc: 'Flash screen red' },
        { tag: '#flash_white', desc: 'Flash screen white' },
        { tag: '#bg:', desc: 'Set background image', hasValue: true },
        { tag: '#play_sfx:', desc: 'Play sound effect', hasValue: true },
        { tag: '#music:', desc: 'Play background music', hasValue: true },
        { tag: '#music:stop', desc: 'Stop background music' },
        { tag: '#UI_EFFECT:', desc: 'UI horror effect (blur_vignette, etc)', hasValue: true },
    ],
    Minigames: [
        { tag: '#MINIGAME: type=qte', desc: 'Quick Time Event minigame' },
        { tag: '#MINIGAME: type=lockpick', desc: 'Lockpick minigame' },
        { tag: '#MINIGAME: type=arkanoid', desc: 'Arkanoid minigame' },
        { tag: '#KEY_MASH:', desc: 'Key mashing challenge (target count)', hasValue: true },
    ],
    Horror: [
        { tag: '#WILLPOWER_START:', desc: 'Start willpower drain (slow/normal/fast)', hasValue: true },
        { tag: '#WILLPOWER_STOP', desc: 'Stop willpower drain' },
        { tag: '#WILLPOWER_CHECK:', desc: 'Check willpower threshold', hasValue: true },
        { tag: '#MOUSE_RESISTANCE:', desc: 'Heavy cursor (low/medium/high)', hasValue: true },
        { tag: '#SPIDER_START:', desc: 'Spider infestation (difficulty=normal)', hasValue: true },
        { tag: '#SPIDER_STOP', desc: 'Stop spider infestation' },
        { tag: '#SPIDER_CHECK:', desc: 'Spider count check', hasValue: true },
    ],
    Combat: [
        { tag: '#ARREBATADOS_START:', desc: 'Start arrebatados system', hasValue: true },
        { tag: '#ARREBATADOS_STOP', desc: 'Stop arrebatados system' },
        { tag: '#BOSS_START:', desc: 'Start boss encounter', hasValue: true },
        { tag: '#BOSS_PHASE:', desc: 'Set boss phase', hasValue: true },
        { tag: '#BOSS_DAMAGE:', desc: 'Apply boss damage', hasValue: true },
        { tag: '#BOSS_CHECK', desc: 'Check boss status' },
        { tag: '#BOSS_STOP', desc: 'End boss encounter' },
        { tag: '#VISUAL_DAMAGE:', desc: 'Visual damage effect', hasValue: true },
    ],
    Game: [
        { tag: '#stat:', desc: 'Modify stat (stat:hp:+10)', hasValue: true },
        { tag: '#inventory_add:', desc: 'Add item to inventory', hasValue: true },
        { tag: '#inventory_remove:', desc: 'Remove item from inventory', hasValue: true },
        { tag: '#achievement:unlock:', desc: 'Unlock achievement', hasValue: true },
        { tag: '#input:', desc: 'Prompt for text input', hasValue: true },
        { tag: '#wait:', desc: 'Pause for X seconds', hasValue: true },
        { tag: '#clear', desc: 'Clear screen' },
        { tag: '#next', desc: 'Auto-continue to next beat' },
    ],
};

const getId = () => `node_${idCounter++}`;

export default function BardoEditor({ onClose }) {
    // Use centralized editor state with persistence
    const {
        nodes, edges, storyTitle, isDirty, projectConfig, variables,
        onNodesChange, onEdgesChange,
        setNodes, setEdges, setStoryTitle, setProjectConfig, setVariables,
        saveProject, loadProject, exportProject, importProject, newProject,
        exportInk, copyInk, exportConfig,
        undo, redo, canUndo, canRedo,
    } = useEditorState();

    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [isContentMaximized, setIsContentMaximized] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('editor'); // 'editor' | 'project'
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [chapterFilter, setChapterFilter] = useState(''); // '' = show all
    const [showWarnings, setShowWarnings] = useState(false);

    // Graph validation warnings (debounced via useMemo)
    const graphWarnings = useMemo(() => {
        return validateGraph(nodes, edges);
    }, [nodes, edges]);

    // ReactFlow instance to project coordinates
    const [rfInstance, setRfInstance] = useState(null);

    // File input ref for import
    const fileInputRef = useRef(null);
    const exportMenuRef = useRef(null);
    const connectingRef = useRef(null);

    // Callback for inline content editing from PassageNode
    const handleNodeContentChange = useCallback((nodeId, newContent) => {
        setNodes(nds => nds.map(node => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: { ...node.data, content: newContent, text: newContent },
                };
            }
            return node;
        }));
    }, [setNodes]);

    // Callback for inline choices editing from PassageNode
    const handleNodeChoicesChange = useCallback((nodeId, newChoices) => {
        setNodes(nds => nds.map(node => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: { ...node.data, choices: newChoices },
                };
            }
            return node;
        }));
    }, [setNodes]);

    // Apply selected styling to edges
    const styledEdges = useMemo(() => {
        return edges.map(e => ({
            ...e,
            style: e.id === selectedEdgeId
                ? { stroke: '#ef4444', strokeWidth: 3 }
                : { stroke: '#2b6cee', strokeWidth: 2 },
            animated: e.id === selectedEdgeId ? false : (e.animated ?? true),
            markerEnd: e.id === selectedEdgeId
                ? { type: MarkerType.ArrowClosed, color: '#ef4444' }
                : { type: MarkerType.ArrowClosed, color: '#2b6cee' },
        }));
    }, [edges, selectedEdgeId]);

    // Quick-create: add a connected node to the right of a given node
    const handleQuickCreate = useCallback((sourceNodeId, sourceHandle = null) => {
        const sourceNode = nodes.find(n => n.id === sourceNodeId);
        if (!sourceNode) return;

        const newId = getId();
        const newNode = {
            id: newId,
            position: {
                x: sourceNode.position.x + 320,
                y: sourceNode.position.y,
            },
            type: 'passage',
            data: { label: 'New knot', type: 'knot' },
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => addEdge({
            source: sourceNodeId,
            sourceHandle: sourceHandle || null,
            target: newId,
            animated: true,
            style: { stroke: '#2b6cee', strokeWidth: 2 },
        }, eds));
        setSelectedNodeId(newId);
    }, [nodes, setNodes, setEdges]);

    // Collect unique chapters and assign stable color indices
    const chapterColorMap = useMemo(() => {
        const chapters = new Set();
        nodes.forEach(n => {
            if (n.data?.chapter) chapters.add(n.data.chapter);
        });
        const map = {};
        let idx = 0;
        for (const ch of chapters) {
            map[ch] = idx++;
        }
        return map;
    }, [nodes]);

    const uniqueChapters = useMemo(() => Object.keys(chapterColorMap), [chapterColorMap]);

    // Inject callbacks + chapter/filter data into all passage nodes
    const nodesWithCallbacks = useMemo(() => {
        return nodes.map(n => {
            if (n.type === 'passage') {
                const chapter = n.data?.chapter || '';
                const isFiltered = chapterFilter && chapter !== chapterFilter;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        onContentChange: handleNodeContentChange,
                        onChoicesChange: handleNodeChoicesChange,
                        onQuickCreate: handleQuickCreate,
                        _filtered: isFiltered,
                        _chapterColorIdx: chapter ? (chapterColorMap[chapter] ?? -1) : -1,
                    },
                };
            }
            return n;
        });
    }, [nodes, handleNodeContentChange, handleNodeChoicesChange, handleQuickCreate, chapterFilter, chapterColorMap]);

    // Register custom node types
    const nodeTypes = useMemo(() => ({
        passage: PassageNode,
    }), []);

    const onConnect = useCallback((params) => {
        connectingRef.current = null; // Connection succeeded, don't create new node
        setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: '#2b6cee', strokeWidth: 2 },
            labelStyle: { fill: '#ffffff', fontWeight: 600 },
        }, eds));
    }, [setEdges]);

    // Track connection drag start for drag-to-empty
    const onConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
        if (handleType === 'source') {
            connectingRef.current = { nodeId, handleId };
        }
    }, []);

    // Drag-to-empty: create new node and connect
    const onConnectEnd = useCallback((event) => {
        if (!connectingRef.current || !rfInstance) {
            connectingRef.current = null;
            return;
        }

        // If dropped on a node or handle, don't create (onConnect already handled it)
        const targetIsHandle = event.target.closest('.react-flow__handle');
        const targetIsNode = event.target.closest('.react-flow__node');
        if (targetIsHandle || targetIsNode) {
            connectingRef.current = null;
            return;
        }

        const { nodeId: sourceId, handleId: sourceHandle } = connectingRef.current;
        connectingRef.current = null;

        const position = rfInstance.project({
            x: event.clientX,
            y: event.clientY,
        });

        const newId = getId();
        const newNode = {
            id: newId,
            position,
            type: 'passage',
            data: { label: 'New knot', type: 'knot' },
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => addEdge({
            source: sourceId,
            sourceHandle: sourceHandle || null,
            target: newId,
            animated: true,
            style: { stroke: '#2b6cee', strokeWidth: 2 },
        }, eds));
        setSelectedNodeId(newId);
    }, [rfInstance, setNodes, setEdges]);

    const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
        setSelectedNodeId(selectedNodes[0]?.id || null);
        setIsContentMaximized(false);
        if (selectedNodes.length > 0) setSelectedEdgeId(null);
    }, []);

    // Edge click → select edge (visual highlight + enable delete)
    const handleEdgeClick = useCallback((event, edge) => {
        setSelectedEdgeId(edge.id);
        setSelectedNodeId(null);
    }, []);

    // Delete selected edge
    const handleDeleteEdge = useCallback(() => {
        if (!selectedEdgeId) return;
        setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
    }, [selectedEdgeId, setEdges]);

    // Click on empty canvas → deselect edge
    const handlePaneClick = useCallback(() => {
        setSelectedEdgeId(null);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                // Allow Ctrl+S even in inputs
                if (!(e.ctrlKey && e.key === 's')) return;
            }

            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if (e.ctrlKey && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveProject();
            } else if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                setSearchOpen(prev => !prev);
                setSearchQuery('');
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeId) {
                e.preventDefault();
                handleDeleteEdge();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, saveProject, selectedEdgeId, handleDeleteEdge]);

    // Close export menu on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
                setShowExportMenu(false);
            }
        };
        if (showExportMenu) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [showExportMenu]);

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
                return {
                    ...node,
                    type: 'passage',
                    data: { ...node.data, type },
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

    const handleAddNode = useCallback((type = 'knot', position = null) => {
        const id = getId();
        const pos = position || (rfInstance
            ? rfInstance.project({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 })
            : { x: 400, y: 400 });

        const newNode = {
            id,
            position: pos,
            type: 'passage',
            data: {
                label: `New ${type}`,
                type,
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [rfInstance, setNodes]);

    // Double-click on canvas empty space → create new PassageNode
    // Only fires if click landed on the pane itself (not on a node)
    const handlePaneDoubleClick = useCallback((event) => {
        if (!rfInstance) return;
        // Check that the click target is the pane background, not a node
        const target = event.target;
        if (target.closest('.react-flow__node')) return;
        const position = rfInstance.project({ x: event.clientX, y: event.clientY });
        handleAddNode('knot', position);
    }, [rfInstance, handleAddNode]);

    const handleDeleteNode = useCallback(() => {
        if (!selectedNodeId) return;
        setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
        setSelectedNodeId(null);
    }, [selectedNodeId, setNodes, setEdges]);

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await importProject(file);
            } catch (err) {
                alert('Failed to import: ' + err.message);
            }
        }
        e.target.value = '';
    };

    const handleCopyInk = async () => {
        await copyInk();
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
        setShowExportMenu(false);
    };

    // Search results (filtered nodes)
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return nodes.filter(n => {
            const label = (n.data?.label || '').toLowerCase();
            const content = (n.data?.content || n.data?.text || '').toLowerCase();
            const id = n.id.toLowerCase();
            return label.includes(q) || content.includes(q) || id.includes(q);
        }).slice(0, 10);
    }, [nodes, searchQuery]);

    // Jump to node (center + select)
    const jumpToNode = useCallback((nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !rfInstance) return;
        rfInstance.setCenter(node.position.x + 140, node.position.y + 60, { zoom: 1.2, duration: 400 });
        setSelectedNodeId(nodeId);
    }, [nodes, rfInstance]);

    // Auto-layout: simple left-to-right tree layout
    const handleAutoLayout = useCallback(() => {
        if (nodes.length === 0) return;

        const NODE_W = 300;
        const NODE_H = 160;
        const GAP_X = 80;
        const GAP_Y = 40;

        // Build adjacency and find roots
        const children = {};
        const hasParent = new Set();
        nodes.forEach(n => { children[n.id] = []; });
        edges.forEach(e => {
            if (children[e.source]) {
                children[e.source].push(e.target);
                hasParent.add(e.target);
            }
        });

        const roots = nodes.filter(n => !hasParent.has(n.id));
        if (roots.length === 0) roots.push(nodes[0]);

        // BFS layering
        const visited = new Set();
        const layers = [];
        let queue = roots.map(r => r.id);
        while (queue.length > 0) {
            const layer = [];
            const nextQueue = [];
            queue.forEach(id => {
                if (visited.has(id)) return;
                visited.add(id);
                layer.push(id);
                (children[id] || []).forEach(childId => {
                    if (!visited.has(childId)) nextQueue.push(childId);
                });
            });
            if (layer.length > 0) layers.push(layer);
            queue = nextQueue;
        }

        // Add any unvisited nodes as a final layer
        const orphans = nodes.filter(n => !visited.has(n.id)).map(n => n.id);
        if (orphans.length > 0) layers.push(orphans);

        // Assign positions
        const positions = {};
        layers.forEach((layer, col) => {
            const totalH = layer.length * NODE_H + (layer.length - 1) * GAP_Y;
            const startY = -totalH / 2;
            layer.forEach((id, row) => {
                positions[id] = {
                    x: col * (NODE_W + GAP_X),
                    y: startY + row * (NODE_H + GAP_Y),
                };
            });
        });

        setNodes(nds => nds.map(n => ({
            ...n,
            position: positions[n.id] || n.position,
        })));

        // Fit view after layout
        setTimeout(() => { if (rfInstance) rfInstance.fitView({ padding: 0.2, duration: 400 }); }, 50);
    }, [nodes, edges, setNodes, rfInstance]);

    const toggleCategory = (cat) => {
        setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const appendTag = (tagItem) => {
        if (tagItem.hasValue) {
            const value = prompt(`Enter value for ${tagItem.tag}`) || '';
            if (!value) return;
            const fullTag = tagItem.tag + value;
            const currentContent = selectedNode?.data?.content || '';
            updateNodeData('content', currentContent + (currentContent ? '\n' : '') + fullTag);
        } else {
            const currentContent = selectedNode?.data?.content || '';
            updateNodeData('content', currentContent + (currentContent ? '\n' : '') + tagItem.tag);
        }
    };

    const insertVariable = (varName) => {
        const currentContent = selectedNode?.data?.content || '';
        updateNodeData('content', currentContent + `{${varName}}`);
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
                        <button
                            onClick={() => setActiveNav('project')}
                            className={`transition-colors ${activeNav === 'project' ? 'text-white border-b-2 border-[#2b6cee] pb-1' : 'text-[#9da6b9] hover:text-white'}`}
                        >
                            Project
                        </button>
                        <button
                            onClick={() => setActiveNav('editor')}
                            className={`transition-colors ${activeNav === 'editor' ? 'text-white border-b-2 border-[#2b6cee] pb-1' : 'text-[#9da6b9] hover:text-white'}`}
                        >
                            Editor
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#1c1f27] rounded-lg h-9 px-3 border border-[#282e39]">
                        <span className="material-symbols-outlined text-[#9da6b9] text-sm mr-2">search</span>
                        <input
                            className="bg-transparent border-none text-white text-sm focus:outline-none w-32 placeholder-[#4b5563]"
                            value={storyTitle}
                            onChange={(e) => setStoryTitle(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
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

                    {/* Undo */}
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className={`flex items-center justify-center rounded-lg h-9 w-9 border transition-all text-sm ${canUndo ? 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:text-white hover:bg-[#282e39]' : 'bg-[#1c1f27] border-[#282e39] text-[#282e39] cursor-not-allowed'}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <span className="material-symbols-outlined text-sm">undo</span>
                    </button>

                    {/* Redo */}
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className={`flex items-center justify-center rounded-lg h-9 w-9 border transition-all text-sm ${canRedo ? 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:text-white hover:bg-[#282e39]' : 'bg-[#1c1f27] border-[#282e39] text-[#282e39] cursor-not-allowed'}`}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <span className="material-symbols-outlined text-sm">redo</span>
                    </button>

                    {/* Save to localStorage */}
                    <button onClick={saveProject} className={`flex items-center gap-2 rounded-lg h-9 px-3 text-sm border transition-all ${isDirty ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30' : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:text-white hover:bg-[#282e39]'}`} title="Save to Browser (Ctrl+S)">
                        <span className="material-symbols-outlined text-sm">save</span>
                    </button>

                    {/* Load from localStorage */}
                    <button onClick={loadProject} className="flex items-center gap-2 rounded-lg h-9 px-3 bg-[#1c1f27] text-[#9da6b9] hover:text-white hover:bg-[#282e39] border border-[#282e39] transition-all text-sm" title="Load from Browser">
                        <span className="material-symbols-outlined text-sm">folder_open</span>
                    </button>

                    {/* Export dropdown */}
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 rounded-lg h-9 px-4 bg-[#2b6cee] text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 relative"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Export
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                            {graphWarnings.length > 0 && (
                                <span
                                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold bg-red-500 text-white cursor-pointer border-2 border-[#101622]"
                                    onClick={(e) => { e.stopPropagation(); setShowWarnings(true); }}
                                    title={`${graphWarnings.length} issue${graphWarnings.length !== 1 ? 's' : ''} found`}
                                >
                                    {graphWarnings.length}
                                </span>
                            )}
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1c1f27] border border-[#282e39] rounded-xl shadow-2xl overflow-hidden z-50">
                                <button
                                    onClick={() => { exportProject(); setShowExportMenu(false); }}
                                    className="w-full px-4 py-3 text-sm text-left text-[#9da6b9] hover:text-white hover:bg-[#282e39] flex items-center gap-3 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base text-blue-400">folder_zip</span>
                                    Export Project (.json)
                                </button>
                                <button
                                    onClick={() => { exportInk(); setShowExportMenu(false); }}
                                    className="w-full px-4 py-3 text-sm text-left text-[#9da6b9] hover:text-white hover:bg-[#282e39] flex items-center gap-3 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base text-yellow-400">code</span>
                                    Export Ink (.ink)
                                </button>
                                <button
                                    onClick={handleCopyInk}
                                    className="w-full px-4 py-3 text-sm text-left text-[#9da6b9] hover:text-white hover:bg-[#282e39] flex items-center gap-3 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base text-green-400">
                                        {copyFeedback ? 'check' : 'content_copy'}
                                    </span>
                                    {copyFeedback ? 'Copied!' : 'Copy Ink to Clipboard'}
                                </button>
                                <div className="h-px bg-[#282e39]" />
                                <button
                                    onClick={() => { exportConfig(); setShowExportMenu(false); }}
                                    className="w-full px-4 py-3 text-sm text-left text-[#9da6b9] hover:text-white hover:bg-[#282e39] flex items-center gap-3 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base text-purple-400">settings</span>
                                    Export Config (.config.json)
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-[#282e39] mx-1"></div>

                    {/* Preview Button */}
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="flex items-center gap-2 rounded-lg h-9 px-4 bg-green-600 text-white text-sm font-bold hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
                    >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                        Preview
                    </button>

                    <button onClick={onClose} className="flex items-center justify-center rounded-lg h-9 w-9 bg-[#1c1f27] text-[#9da6b9] hover:text-white hover:bg-[#282e39] border border-[#282e39] transition-all">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </header>

            {isPreviewOpen && (
                <PreviewPanel
                    nodes={nodes}
                    edges={edges}
                    variables={variables}
                    onClose={() => setIsPreviewOpen(false)}
                />
            )}

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
                    </div>
                    <div className="h-px w-8 bg-[#282e39] my-1"></div>
                    <button
                        onClick={selectedEdgeId ? handleDeleteEdge : handleDeleteNode}
                        disabled={!selectedNodeId && !selectedEdgeId}
                        className={`group relative flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${!selectedNodeId && !selectedEdgeId ? 'opacity-50 cursor-not-allowed bg-[#1c1f27] border-[#282e39] text-[#9da6b9]' : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:bg-red-500/20 hover:text-red-500 hover:border-red-500'}`}
                        title={selectedEdgeId ? "Delete Selected Edge" : "Delete Selected Node"}
                    >
                        <span className="material-symbols-outlined">{selectedEdgeId ? 'link_off' : 'delete'}</span>
                    </button>
                </aside>

                {/* Main Canvas */}
                <div className="flex-1 h-full relative">
                    <ReactFlow
                        nodes={nodesWithCallbacks}
                        edges={styledEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        onSelectionChange={handleSelectionChange}
                        onEdgeClick={handleEdgeClick}
                        onPaneClick={handlePaneClick}
                        onInit={setRfInstance}
                        onDoubleClick={handlePaneDoubleClick}
                        nodeTypes={nodeTypes}
                        fitView
                        minZoom={0.05}
                        maxZoom={2}
                        className="bg-transparent"
                        deleteKeyCode={['Backspace', 'Delete']}
                    >
                        <Controls className="!bg-[#1c1f27] !border-[#282e39] !fill-white [&>button]:!border-b-[#282e39] hover:[&>button]:!bg-[#282e39]" />
                        <MiniMap
                            style={{ width: 240, height: 160 }}
                            className="!bg-[#1c1f27] !border-[#282e39] !rounded-lg overflow-hidden"
                            zoomable
                            pannable
                            nodeColor={(n) => {
                                if (n.id === selectedNodeId) return '#ffffff';
                                // Chapter color if chapter filter active
                                const chapter = n.data?.chapter;
                                if (chapter && chapterColorMap[chapter] !== undefined) {
                                    if (chapterFilter && chapter !== chapterFilter) return '#1c1f27';
                                    const cIdx = chapterColorMap[chapter] % CHAPTER_COLORS.length;
                                    return CHAPTER_COLORS[cIdx].hex;
                                }
                                // Tag category color
                                const content = n.data?.content || n.data?.text || '';
                                if (content) {
                                    const { tags } = parseContent(content);
                                    const cat = getDominantTagCategory(tags);
                                    if (cat) return TAG_CATEGORY_COLORS[cat].minimap;
                                }
                                // Fallback to type color
                                const t = n.data?.type || n.type;
                                if (t === 'hub') return '#3b82f6';
                                if (t === 'knot') return '#eab308';
                                return '#4b5563';
                            }}
                            maskColor="rgba(16, 22, 34, 0.8)"
                        />
                    </ReactFlow>

                    {/* Floating Info */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-50">
                        <h1 className="text-white/20 text-4xl font-black uppercase tracking-[0.2em] select-none">Cluster Visualization</h1>
                        <p className="text-[#2b6cee]/40 text-sm tracking-widest mt-1">THE LOOM ENGINE</p>
                    </div>

                    {/* Auto-layout button */}
                    <button
                        onClick={handleAutoLayout}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg bg-[#1c1f27]/90 backdrop-blur border border-[#282e39] text-[#9da6b9] hover:text-white hover:border-[#2b6cee] transition-all flex items-center gap-2 text-xs font-mono uppercase tracking-wider"
                        title="Auto-layout nodes (left to right)"
                    >
                        <span className="material-symbols-outlined text-sm">account_tree</span>
                        Auto-layout
                    </button>

                    {/* Warnings panel */}
                    {showWarnings && graphWarnings.length > 0 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[480px]">
                            <div className="bg-[#101622] border border-red-500/50 rounded-xl shadow-2xl shadow-red-500/10 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[#282e39]">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400 text-sm">warning</span>
                                        <span className="text-white text-sm font-bold">{graphWarnings.length} Issue{graphWarnings.length !== 1 ? 's' : ''} Found</span>
                                    </div>
                                    <button
                                        onClick={() => setShowWarnings(false)}
                                        className="text-[#9da6b9] hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {graphWarnings.map((w, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { jumpToNode(w.nodeId); setShowWarnings(false); }}
                                            className="w-full px-4 py-2.5 text-left hover:bg-[#1c1f27] transition-colors flex items-start gap-3 border-b border-[#282e39]/50 last:border-b-0"
                                        >
                                            <span className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${w.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {w.type === 'error' ? 'error' : 'warning'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs">{w.message}</p>
                                                <p className="text-[#4b5563] text-[10px] font-mono mt-0.5">{w.nodeId}</p>
                                            </div>
                                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${w.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {w.type}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search overlay (Ctrl+P) */}
                    {searchOpen && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-96" onKeyDown={(e) => e.stopPropagation()}>
                            <div className="bg-[#101622] border border-[#2b6cee] rounded-xl shadow-2xl shadow-[#2b6cee]/20 overflow-hidden">
                                <div className="flex items-center px-4 py-3 border-b border-[#282e39]">
                                    <span className="material-symbols-outlined text-[#2b6cee] text-sm mr-2">search</span>
                                    <input
                                        autoFocus
                                        className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-[#4b5563]"
                                        placeholder="Search nodes by label, content, or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            e.stopPropagation();
                                            if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
                                            if (e.key === 'Enter') {
                                                const match = searchResults[0];
                                                if (match) { jumpToNode(match.id); setSearchOpen(false); setSearchQuery(''); }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {searchResults.length === 0 && searchQuery && (
                                        <p className="px-4 py-3 text-[#4b5563] text-xs">No results</p>
                                    )}
                                    {searchResults.map((node) => (
                                        <button
                                            key={node.id}
                                            onClick={() => { jumpToNode(node.id); setSearchOpen(false); setSearchQuery(''); }}
                                            className="w-full px-4 py-2 text-left hover:bg-[#2b6cee]/10 transition-colors flex items-center gap-3"
                                        >
                                            <span className={`material-symbols-outlined text-sm ${node.data?.type === 'hub' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                {node.data?.type === 'hub' ? 'castle' : 'radio_button_checked'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-bold truncate">{node.data?.label || node.id}</p>
                                                <p className="text-[#4b5563] text-[10px] truncate">{(node.data?.content || '').slice(0, 60)}</p>
                                            </div>
                                            <span className="text-[#4b5563] text-[10px] font-mono shrink-0">{node.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Project View or Node Properties */}
                {activeNav === 'project' && (
                    <div className="absolute top-6 right-6 bottom-20 w-96 bg-[#101622]/90 backdrop-blur-xl border border-[#282e39] rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden" onKeyDown={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-[#282e39]">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#2b6cee]">settings</span>
                                Project Settings
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            <VariablesPanel
                                variables={variables}
                                onChange={setVariables}
                            />
                            <div className="h-px bg-[#282e39]" />
                            <ConfigPanel
                                config={projectConfig}
                                onChange={setProjectConfig}
                            />
                        </div>
                    </div>
                )}

                {activeNav === 'editor' && selectedNode && (
                    <div className={`absolute top-6 right-6 bottom-20 bg-[#101622]/90 backdrop-blur-xl border border-[#282e39] rounded-2xl shadow-2xl z-40 transition-all duration-300 flex flex-col overflow-hidden ${isContentMaximized ? 'w-[800px]' : 'w-80'}`} onKeyDown={(e) => e.stopPropagation()}>
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

                            {/* Chapter */}
                            <div>
                                <label className="text-[#9da6b9] text-[10px] uppercase font-bold mb-1 block">Chapter</label>
                                <input
                                    className="w-full bg-[#1c1f27] border border-[#282e39] rounded-lg px-3 py-2 text-white text-sm focus:border-[#2b6cee] focus:outline-none transition-colors"
                                    value={selectedNode.data.chapter || ''}
                                    onChange={(e) => updateNodeData('chapter', e.target.value)}
                                    placeholder="e.g. Act 1, Chapter 2..."
                                />
                            </div>

                            {/* Narrative Content */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[10px] uppercase font-bold text-[#4b5563] tracking-widest">
                                        Narrative Content
                                    </label>
                                    {/* Insert Variable dropdown */}
                                    {variables.length > 0 && (
                                        <div className="relative group">
                                            <button className="text-[9px] text-[#4b5563] hover:text-[#2b6cee] transition-colors flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">data_object</span>
                                                Insert Var
                                            </button>
                                            <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-[#1c1f27] border border-[#282e39] rounded-lg shadow-xl z-50 min-w-[120px]">
                                                {variables.map(v => (
                                                    <button
                                                        key={v.name}
                                                        onClick={() => insertVariable(v.name)}
                                                        className="w-full px-3 py-1.5 text-left text-xs text-[#9da6b9] hover:text-white hover:bg-[#282e39] font-mono"
                                                    >
                                                        {`{${v.name}}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    className="w-full h-32 bg-[#0b0c10] border border-[#282e39] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#2b6cee] transition-all resize-none placeholder-[#4b5563]"
                                    value={selectedNode?.data?.content || ''}
                                    onChange={(e) => updateNodeData('content', e.target.value)}
                                    placeholder="Enter the story text for this node..."
                                />
                                <p className="mt-2 text-[10px] text-[#4b5563]">
                                    Tip: Use #tags for VFX (e.g. #shake, #flash_red)
                                </p>

                                {/* Categorized Tag Helper */}
                                <div className="mt-3 border-t border-[#282e39] pt-3 space-y-2">
                                    {Object.entries(BARDO_TAGS).map(([category, tags]) => (
                                        <div key={category}>
                                            <button
                                                onClick={() => toggleCategory(category)}
                                                className="flex items-center gap-1.5 w-full text-left mb-1"
                                            >
                                                <span className="material-symbols-outlined text-[#4b5563] text-xs">
                                                    {collapsedCategories[category] ? 'chevron_right' : 'expand_more'}
                                                </span>
                                                <span className="text-[9px] text-[#4b5563] uppercase font-bold tracking-wider">{category}</span>
                                            </button>
                                            {!collapsedCategories[category] && (
                                                <div className="flex flex-wrap gap-1.5 ml-4 mb-1">
                                                    {tags.map(item => (
                                                        <button
                                                            key={item.tag}
                                                            onClick={() => appendTag(item)}
                                                            className="px-2 py-1 rounded bg-[#1c1f27] border border-[#282e39] text-[9px] text-[#9da6b9] hover:text-white hover:border-[#2b6cee] transition-all font-mono"
                                                            title={item.desc}
                                                        >
                                                            {item.tag.replace(/#/g, '').replace(/:$/, '')}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

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

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
                <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
                    <div className="bg-[#101622] border border-[#282e39] rounded-2xl shadow-2xl w-96 p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold">Keyboard Shortcuts</h3>
                            <button onClick={() => setShowShortcuts(false)} className="text-[#9da6b9] hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            {[
                                ['Ctrl + Z', 'Undo'],
                                ['Ctrl + Shift + Z', 'Redo'],
                                ['Ctrl + S', 'Save to Browser'],
                                ['Delete / Backspace', 'Delete selected node'],
                            ].map(([key, desc]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-[#9da6b9]">{desc}</span>
                                    <kbd className="px-2 py-1 bg-[#0b0c10] border border-[#282e39] rounded text-xs text-white font-mono">{key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
                    {variables.length > 0 && (
                        <span>Vars: <span className="text-white">{variables.length}</span></span>
                    )}
                    {graphWarnings.length > 0 && (
                        <button
                            onClick={() => setShowWarnings(true)}
                            className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-xs" style={{ fontSize: '12px' }}>warning</span>
                            <span>{graphWarnings.length} issue{graphWarnings.length !== 1 ? 's' : ''}</span>
                        </button>
                    )}
                    {uniqueChapters.length > 0 && (
                        <>
                            <div className="w-px h-3 bg-[#282e39]"></div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs" style={{ fontSize: '12px' }}>filter_alt</span>
                                <select
                                    value={chapterFilter}
                                    onChange={(e) => setChapterFilter(e.target.value)}
                                    className="bg-transparent text-[10px] text-white focus:outline-none cursor-pointer border-none"
                                >
                                    <option value="" className="bg-[#0b0c10]">All chapters</option>
                                    {uniqueChapters.map(ch => (
                                        <option key={ch} value={ch} className="bg-[#0b0c10]">{ch}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowShortcuts(true)}
                        className="text-[#9da6b9] hover:text-white cursor-pointer transition-colors"
                    >
                        Keyboard Shortcuts
                    </button>
                </div>
            </footer>
        </div>
    );
}
