import React, { useEffect, useRef } from 'react';
import { NODE_TEMPLATES } from '../utils/nodeTemplates';

/**
 * ContextMenu — right-click menu for nodes, edges, and canvas.
 *
 * Props:
 *   x, y         — screen position
 *   type          — 'node' | 'edge' | 'pane'
 *   nodeId        — target node ID (when type='node')
 *   nodeType      — 'hub' | 'knot' (when type='node')
 *   edgeId        — target edge ID (when type='edge')
 *   onClose       — () => void
 *   onEdit        — (nodeId) => void
 *   onDuplicate   — (nodeId) => void
 *   onDelete      — (nodeId) => void
 *   onDeleteEdge  — (edgeId) => void
 *   onConvertType — (nodeId, newType) => void
 *   onAddNode     — (type, position) => void
 *   onInsertTemplate — (template, position) => void
 *   screenToFlow  — ({x, y}) => {x, y}  — convert screen coords to flow coords
 */
export default function ContextMenu({
    x, y, type, nodeId, nodeType, edgeId,
    onClose, onEdit, onDuplicate, onDelete, onDeleteEdge,
    onConvertType, onAddNode, onInsertTemplate, screenToFlow,
}) {
    const ref = useRef(null);
    const [showTemplates, setShowTemplates] = React.useState(false);

    // Close on click outside or Escape
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('mousedown', handleClick);
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('mousedown', handleClick);
            window.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const flowPos = screenToFlow ? screenToFlow({ x, y }) : { x: 400, y: 400 };

    const Item = ({ icon, label, onClick, danger }) => (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); onClose(); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                danger
                    ? 'text-red-400 hover:bg-red-500/15'
                    : 'text-[#c4cad6] hover:bg-[#2b6cee]/15 hover:text-white'
            }`}
        >
            <span className="material-symbols-outlined text-sm">{icon}</span>
            {label}
        </button>
    );

    const Divider = () => <div className="h-px bg-[#282e39] my-1" />;

    return (
        <div
            ref={ref}
            className="fixed z-[100] bg-[#101622] border border-[#2b6cee]/40 rounded-lg shadow-2xl shadow-black/50 py-1 min-w-[180px]"
            style={{ left: x, top: y }}
        >
            {type === 'node' && (
                <>
                    <Item icon="edit" label="Edit" onClick={() => onEdit?.(nodeId)} />
                    <Item icon="content_copy" label="Duplicate" onClick={() => onDuplicate?.(nodeId)} />
                    <Divider />
                    {nodeType !== 'hub' && (
                        <Item icon="castle" label="Convert to Hub" onClick={() => onConvertType?.(nodeId, 'hub')} />
                    )}
                    {nodeType !== 'knot' && (
                        <Item icon="radio_button_checked" label="Convert to Knot" onClick={() => onConvertType?.(nodeId, 'knot')} />
                    )}
                    <Divider />
                    <Item icon="delete" label="Delete" onClick={() => onDelete?.(nodeId)} danger />
                </>
            )}

            {type === 'edge' && (
                <Item icon="link_off" label="Delete connection" onClick={() => onDeleteEdge?.(edgeId)} danger />
            )}

            {type === 'pane' && (
                <>
                    <Item icon="radio_button_checked" label="New Knot here" onClick={() => onAddNode?.('knot', flowPos)} />
                    <Item icon="castle" label="New Hub here" onClick={() => onAddNode?.('hub', flowPos)} />
                    <Divider />
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-[#c4cad6] hover:bg-[#2b6cee]/15 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">dashboard</span>
                            Insert Template
                            <span className="material-symbols-outlined text-sm ml-auto">chevron_right</span>
                        </button>
                        {showTemplates && (
                            <div className="absolute left-full top-0 ml-1 bg-[#101622] border border-[#2b6cee]/40 rounded-lg shadow-2xl shadow-black/50 py-1 min-w-[200px]">
                                {NODE_TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.name}
                                        onClick={(e) => { e.stopPropagation(); onInsertTemplate?.(tpl, flowPos); onClose(); }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-[#c4cad6] hover:bg-[#2b6cee]/15 hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">{tpl.icon}</span>
                                        <span>{tpl.name}</span>
                                        <span className="ml-auto text-[10px] text-[#4b5563]">{tpl.desc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
