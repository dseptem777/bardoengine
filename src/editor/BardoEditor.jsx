import React, { useState, useCallback, useRef } from 'react';
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
import { generateInk, generateHubRegistry } from './utils/generateInk';

const initialNodes = [
  { id: 'hub_start', position: { x: 250, y: 5 }, data: { label: 'Hub: Start', type: 'hub' }, type: 'input' },
  { id: 'mission_a', position: { x: 100, y: 150 }, data: { label: 'Mission A', type: 'knot' } },
  { id: 'mission_b', position: { x: 400, y: 150 }, data: { label: 'Mission B', type: 'knot' } }
];
const initialEdges = [
    { id: 'e1-2', source: 'hub_start', target: 'mission_a' },
    { id: 'e1-3', source: 'hub_start', target: 'mission_b' }
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

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
      setSelectedNodeId(selectedNodes[0]?.id || null);
      // Reset maximized view when selection changes
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

  const updateNodeId = (newId) => {
      // Check if ID already exists
      if (nodes.some(n => n.id === newId && n.id !== selectedNodeId)) {
          alert(`ID "${newId}" already exists!`);
          return;
      }

      // Update node ID and all connected edges
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

  const handleAddNode = useCallback(() => {
      const id = getId();
      // Center position if possible, else random
      const position = rfInstance
        ? rfInstance.project({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 })
        : { x: Math.random() * 400, y: Math.random() * 400 };

      const newNode = {
        id,
        position,
        data: { label: `New Node ${id}`, type: 'knot' },
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

      alert(`Exported "${storyTitle}" to Console (F12).\nCopy the output from the console.`);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col text-black font-sans">
        {/* Header Toolbar */}
        <header className="bg-black border-b border-bardo-accent/30 p-3 flex justify-between items-center text-white shrink-0 shadow-md z-20">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold font-mono text-bardo-accent tracking-widest mr-4">THE LOOM</h1>

                <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Story ID / Title</label>
                    <input
                        className="bg-gray-800 border-none text-white text-sm font-bold focus:ring-1 focus:ring-bardo-accent px-2 py-0.5 rounded w-48"
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        placeholder="MyStory"
                    />
                </div>

                <div className="h-8 w-px bg-gray-700 mx-2"></div>

                <button onClick={handleAddNode} className="flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500/50 text-green-400 rounded hover:bg-green-600/40 transition-colors font-mono text-xs">
                    <span className="text-lg leading-none">+</span> Add Node
                </button>

                <button
                    onClick={handleDeleteNode}
                    disabled={!selectedNodeId}
                    className={`flex items-center gap-2 px-3 py-1 border rounded transition-colors font-mono text-xs ${
                        selectedNodeId
                        ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/40 cursor-pointer'
                        : 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                    }`}
                >
                    <span className="text-lg leading-none">×</span> Delete Selected
                </button>
            </div>

            <div className="flex gap-3">
                 <button onClick={handleExport} className="px-4 py-2 bg-blue-600/20 border border-blue-500 text-blue-400 rounded hover:bg-blue-600/40 transition-colors font-mono text-xs font-bold uppercase tracking-wider">
                    💾 Export Ink
                 </button>
                 <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors font-mono text-xs">
                    Close
                 </button>
            </div>
        </header>

        <div className="flex-1 w-full relative bg-gray-900 flex overflow-hidden">
            {/* Canvas */}
            <div className="flex-1 h-full relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={handleSelectionChange}
                    onInit={setRfInstance}
                    fitView
                    className="bg-gray-900"
                    deleteKeyCode={['Backspace', 'Delete']}
                >
                    <Background color="#333" gap={20} size={1} />
                    <Controls className="bg-gray-800 border-gray-700 fill-white text-white" />
                    <MiniMap
                        className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
                        nodeColor={(n) => {
                            if (n.id === selectedNodeId) return '#3b82f6'; // blue for selected
                            return n.data.type === 'hub' ? '#ff00ff' : '#d8b4fe';
                        }}
                        maskColor="rgba(0,0,0,0.6)"
                    />
                    <Panel position="bottom-left" className="bg-black/70 p-2 rounded text-xs text-gray-400 font-mono backdrop-blur-sm border border-white/10">
                        {nodes.length} Nodes | {edges.length} Connections
                    </Panel>
                </ReactFlow>
            </div>

            {/* Properties Panel (Right Sidebar) */}
            {selectedNode && (
                <div
                    className={`${isContentMaximized ? 'w-2/3' : 'w-96'} bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl z-10 transition-all duration-300 ease-in-out`}
                >
                    {/* Panel Header */}
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                        <h3 className="text-bardo-accent font-bold font-mono text-sm tracking-wider">
                            NODE PROPERTIES
                        </h3>
                        <button
                            onClick={() => setIsContentMaximized(!isContentMaximized)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-mono underline"
                        >
                            {isContentMaximized ? 'Minimize View' : 'Maximize View'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* ID and Label Group */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-[10px] mb-1 uppercase tracking-wider font-bold">Node ID (Unique)</label>
                                <input
                                    className="w-full bg-black/30 border border-gray-600 focus:border-bardo-accent text-white p-2 rounded text-xs font-mono transition-colors outline-none"
                                    value={selectedNode.id}
                                    onChange={(e) => updateNodeId(e.target.value)}
                                    onBlur={(e) => {
                                        // Simple validation to ensure ID isn't empty
                                        if (!e.target.value.trim()) updateNodeId(`node_${Math.floor(Math.random()*1000)}`);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-[10px] mb-1 uppercase tracking-wider font-bold">Display Label</label>
                                <input
                                    className="w-full bg-black/30 border border-gray-600 focus:border-bardo-accent text-white p-2 rounded text-xs font-mono transition-colors outline-none"
                                    value={selectedNode.data.label || ''}
                                    onChange={(e) => updateNodeData('label', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Type Selector */}
                        <div>
                            <label className="block text-gray-400 text-[10px] mb-1 uppercase tracking-wider font-bold">Node Type</label>
                            <div className="flex gap-2">
                                {['knot', 'hub', 'alley'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateNodeData('type', type)}
                                        className={`flex-1 py-1.5 px-2 rounded text-xs font-mono border transition-all ${
                                            selectedNode.data.type === type
                                            ? 'bg-bardo-accent/20 border-bardo-accent text-bardo-accent font-bold'
                                            : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
                                        }`}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hub Specifics */}
                        {selectedNode.data.type === 'hub' && (
                            <div className="bg-red-900/10 border border-red-500/30 p-3 rounded">
                                <h4 className="text-red-400 font-bold mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    Exclusion Rules (JSON)
                                </h4>
                                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed font-mono">
                                    <code>{`[{"target":"mission_a", "burns":["mission_b"]}]`}</code>
                                </p>
                                <textarea
                                    className="w-full h-24 bg-black border border-gray-700 focus:border-red-500 text-green-400 font-mono text-[10px] p-2 rounded outline-none resize-none"
                                    value={JSON.stringify(selectedNode.data.burnRules || [], null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const rules = JSON.parse(e.target.value);
                                            updateNodeData('burnRules', rules);
                                        } catch(e) {
                                            // Allow typing, validate on blur if needed, but for now just fail silently
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Content Editor */}
                        <div className="flex flex-col flex-1 min-h-[300px]">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Ink Content</label>
                                <span className="text-[10px] text-gray-600 font-mono">Use Ink syntax</span>
                            </div>
                            <textarea
                                className={`w-full ${isContentMaximized ? 'h-[600px]' : 'h-64'} bg-gray-900 border border-gray-700 focus:border-bardo-accent text-gray-200 p-4 rounded-lg text-sm font-mono leading-relaxed outline-none transition-all resize-y`}
                                placeholder="Write your story content here..."
                                value={selectedNode.data.text || ''}
                                onChange={(e) => updateNodeData('text', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
