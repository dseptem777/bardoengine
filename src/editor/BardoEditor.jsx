import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap
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

export default function BardoEditor({ onClose }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
      setSelectedNodeId(selectedNodes[0]?.id || null);
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

  const handleExport = () => {
      const ink = generateInk(nodes, edges);
      const registry = generateHubRegistry(nodes);

      console.log('--- EXPORTED INK ---');
      console.log(ink);
      console.log('--- EXPORTED REGISTRY ---');
      console.log(JSON.stringify(registry, null, 2));

      alert("Exported to Console (F12) for now.\nCheck '--- EXPORTED INK ---'");
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col text-black font-sans">
        <header className="bg-black border-b border-bardo-accent/30 p-4 flex justify-between items-center text-white shrink-0">
            <h1 className="text-xl font-bold font-mono text-bardo-accent tracking-widest">THE LOOM (BardoEditor)</h1>
            <div className="flex gap-4">
                 <button onClick={handleExport} className="px-4 py-2 bg-blue-600/20 border border-blue-500 text-blue-400 rounded hover:bg-blue-600/40 transition-colors font-mono text-sm">
                    💾 Export Ink
                 </button>
                 <button onClick={onClose} className="px-4 py-2 bg-red-600/20 border border-red-500 text-red-400 rounded hover:bg-red-600/40 transition-colors font-mono text-sm">
                    ✕ Close
                 </button>
            </div>
        </header>
        <div className="flex-1 w-full relative bg-gray-900 flex">
            {/* Canvas */}
            <div className="flex-1 h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={handleSelectionChange}
                    fitView
                    className="bg-gray-900"
                >
                    <Background color="#444" gap={16} />
                    <Controls className="bg-white" />
                    <MiniMap className="bg-gray-800" nodeColor={(n) => n.data.type === 'hub' ? '#ff00ff' : '#d8b4fe'} />
                </ReactFlow>
            </div>

            {/* Properties Panel */}
            {selectedNode && (
                <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto text-white shadow-xl z-10">
                    <h3 className="text-bardo-accent font-bold mb-6 font-mono border-b border-gray-700 pb-2">PROPERTIES</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Node ID</label>
                            <div className="font-mono text-sm bg-black/50 p-2 rounded text-gray-300 break-all">{selectedNode.id}</div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Label</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-700 focus:border-bardo-accent text-white p-2 rounded text-sm transition-colors outline-none"
                                value={selectedNode.data.label || ''}
                                onChange={(e) => updateNodeData('label', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Type</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-700 focus:border-bardo-accent text-white p-2 rounded text-sm transition-colors outline-none"
                                value={selectedNode.data.type || 'knot'}
                                onChange={(e) => updateNodeData('type', e.target.value)}
                            >
                                <option value="knot">Standard Knot</option>
                                <option value="hub">Hub (Base)</option>
                                <option value="alley">Alley (Dead End)</option>
                            </select>
                        </div>

                        {selectedNode.data.type === 'hub' && (
                            <div className="pt-4 border-t border-gray-700 mt-4">
                                <h4 className="text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">Exclusion Rules</h4>
                                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                                    JSON Array: <code>{`[{"targetId":"mission_a", "burnedIds":["mission_b"]}]`}</code>
                                </p>
                                <textarea
                                    className="w-full h-40 bg-black border border-gray-700 focus:border-red-500 text-green-400 font-mono text-xs p-2 rounded outline-none"
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

                        <div className="pt-4 border-t border-gray-700 mt-4">
                            <h4 className="text-gray-400 font-bold mb-2 text-sm uppercase tracking-wider">Content</h4>
                            <textarea
                                className="w-full h-32 bg-gray-900 border border-gray-700 focus:border-bardo-accent text-white p-2 rounded text-sm outline-none"
                                placeholder="Ink content..."
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
