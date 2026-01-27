import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import HubNode from './nodes/HubNode';
import KnotNode from './nodes/KnotNode';
import { generateInk, generateHubRegistry } from './utils/generateInk';

const initialNodes = [
  { id: 'hub_start', position: { x: 250, y: 5 }, data: { label: 'The Gilded Tavern', type: 'hub' }, type: 'hub' },
  { id: 'mission_a', position: { x: 100, y: 250 }, data: { label: 'Mission A', type: 'knot' }, type: 'knot' },
  { id: 'mission_b', position: { x: 400, y: 250 }, data: { label: 'Mission B', type: 'knot', isBurned: true }, type: 'knot' }
];
const initialEdges = [
    { id: 'e1-2', source: 'hub_start', target: 'mission_a', animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } },
    { id: 'e1-3', source: 'hub_start', target: 'mission_b', style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4' } }
];

let idCounter = 1;
const getId = () => `node_${idCounter++}`;

export default function BardoEditor({ onClose }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [storyTitle, setStoryTitle] = useState('MyNewStory');
  const [isContentMaximized, setIsContentMaximized] = useState(false);

  // ReactFlow instance to project coordinates
  const [rfInstance, setRfInstance] = useState(null);

  // Register custom node types
  const nodeTypes = useMemo(() => ({
      hub: HubNode,
      knot: KnotNode,
      alley: KnotNode, // Re-use Knot visual but data.type handles difference
  }), []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#2b6cee', strokeWidth: 2 }
  }, eds)), [setEdges]);

  const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
      setSelectedNodeId(selectedNodes[0]?.id || null);
      setIsContentMaximized(false);
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const updateNodeData = (key, value) => {
      setNodes(nds => nds.map(node => {
          if (node.id === selectedNodeId) {
              return { ...node, data: { ...node.data, [key]: value } };
          }
          return node;
      }));
  };

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

      const newNode = {
        id,
        position,
        type: type === 'hub' ? 'hub' : 'knot',
        data: { label: `New ${type}`, type },
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

      alert(`Exported "${storyTitle}" to Console (F12).`);
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

                <button onClick={handleExport} className="flex items-center gap-2 rounded-lg h-9 px-4 bg-[#2b6cee] text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                    <span className="material-symbols-outlined text-sm">save</span> Export
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

                        {/* Type Selection */}
                        <div className="grid grid-cols-3 gap-2">
                            {['hub', 'knot', 'alley'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => updateNodeType(type)}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                        selectedNode.data.type === type
                                        ? 'bg-[#2b6cee]/20 border-[#2b6cee] text-[#2b6cee]'
                                        : 'bg-[#1c1f27] border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
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
                                        } catch(e) {}
                                    }}
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                            <label className="text-[#9da6b9] text-[10px] uppercase font-bold mb-2 block">Ink Content</label>
                            <textarea
                                className={`w-full bg-[#1c1f27] border border-[#282e39] rounded-lg p-4 text-sm font-mono text-gray-300 focus:border-[#2b6cee] focus:outline-none transition-all resize-none ${isContentMaximized ? 'h-[500px]' : 'h-40'}`}
                                value={selectedNode.data.text || ''}
                                onChange={(e) => updateNodeData('text', e.target.value)}
                                placeholder="Enter Ink narrative content here..."
                            />
                        </div>

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
