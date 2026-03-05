/**
 * useEditorState.js
 * Central state management for BardoEditor.
 * Handles nodes, edges, project metadata, persistence, variables, and exports.
 *
 * Created by: Antigravity
 * For: BardoEditor Lite Phase 1
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    useNodesState,
    useEdgesState,
} from 'reactflow';
import { generateInk } from '../utils/generateInk';
import { useUndoRedo } from './useUndoRedo';

const STORAGE_KEY = 'bardoeditor_project';
const PROJECT_VERSION = '1.2.0';

/**
 * Migrate old node types (hub/knot/alley) to the unified 'passage' ReactFlow type.
 * Preserves data.type for generateInk and visual differentiation.
 * Choice nodes also migrate to passage type.
 */
function migrateNodes(nodes) {
    return nodes.map(n => {
        // Convert any non-passage ReactFlow type to passage
        if (n.type !== 'passage') {
            return { ...n, type: 'passage' };
        }
        return n;
    });
}

/**
 * Default empty project state
 */
const createEmptyProject = () => ({
    version: PROJECT_VERSION,
    title: 'Untitled Story',
    nodes: [],
    edges: [],
    variables: [],
    config: {
        theme: {
            primaryColor: '#facc15',
            bgColor: '#0a0a0a',
        },
        stats: { enabled: false },
        inventory: { enabled: false },
        achievements: [],
    },
});

/**
 * Main editor state hook
 * @returns {Object} Editor state and actions
 */
export function useEditorState() {
    // ReactFlow state
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Project metadata
    const [storyTitle, setStoryTitle] = useState('Untitled Story');
    const [projectConfig, setProjectConfig] = useState(createEmptyProject().config);
    const [variables, setVariables] = useState([]);
    const [isDirty, setIsDirty] = useState(false);

    // Undo/redo
    const { canUndo, canRedo, pushSnapshot, undo: undoStep, redo: redoStep, initHistory, getHistory, jumpTo: jumpToStep } = useUndoRedo();
    const isRestoringRef = useRef(false);

    // Track dirty state (includes title changes)
    useEffect(() => {
        setIsDirty(true);
    }, [nodes, edges, storyTitle]);

    // Push undo snapshots only for graph changes (not title)
    useEffect(() => {
        if (!isRestoringRef.current) {
            pushSnapshot(nodes, edges);
        }
    }, [nodes, edges, pushSnapshot]);

    const undo = useCallback(() => {
        const snapshot = undoStep();
        if (snapshot) {
            isRestoringRef.current = true;
            setNodes(snapshot.nodes);
            setEdges(snapshot.edges);
            // Allow the effect to fire without pushing
            requestAnimationFrame(() => { isRestoringRef.current = false; });
        }
    }, [undoStep, setNodes, setEdges]);

    const redo = useCallback(() => {
        const snapshot = redoStep();
        if (snapshot) {
            isRestoringRef.current = true;
            setNodes(snapshot.nodes);
            setEdges(snapshot.edges);
            requestAnimationFrame(() => { isRestoringRef.current = false; });
        }
    }, [redoStep, setNodes, setEdges]);

    const jumpToHistory = useCallback((index) => {
        const snapshot = jumpToStep(index);
        if (snapshot) {
            isRestoringRef.current = true;
            setNodes(snapshot.nodes);
            setEdges(snapshot.edges);
            requestAnimationFrame(() => { isRestoringRef.current = false; });
        }
    }, [jumpToStep, setNodes, setEdges]);

    /**
     * Save project to localStorage
     */
    const saveProject = useCallback(() => {
        const project = {
            version: PROJECT_VERSION,
            title: storyTitle,
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type,
                position: n.position,
                data: n.data,
            })),
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
                targetHandle: e.targetHandle,
                label: e.label,
                data: e.data,
            })),
            variables,
            config: projectConfig,
            savedAt: new Date().toISOString(),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
            setIsDirty(false);
            console.log('[BardoEditor] Project saved to localStorage');
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to save:', err);
            alert('Failed to save project: ' + err.message);
            return false;
        }
    }, [nodes, edges, storyTitle, projectConfig, variables]);

    /**
     * Load project from localStorage
     */
    const loadProject = useCallback(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                alert('No saved project found');
                return false;
            }

            const project = JSON.parse(saved);

            // Migrate old node types to passage
            const migratedNodes = migrateNodes(project.nodes || []);

            // Restore state
            isRestoringRef.current = true;
            setStoryTitle(project.title || 'Untitled Story');
            setNodes(migratedNodes);
            setEdges(project.edges || []);
            setVariables(project.variables || []);
            setProjectConfig(project.config || createEmptyProject().config);
            setIsDirty(false);
            initHistory(migratedNodes, project.edges || []);
            requestAnimationFrame(() => { isRestoringRef.current = false; });

            console.log('[BardoEditor] Project loaded from localStorage');
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to load:', err);
            alert('Failed to load project: ' + err.message);
            return false;
        }
    }, [setNodes, setEdges, initHistory]);

    /**
     * Export project to JSON file (download)
     */
    const exportProject = useCallback(() => {
        const project = {
            version: PROJECT_VERSION,
            title: storyTitle,
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type,
                position: n.position,
                data: n.data,
            })),
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
                targetHandle: e.targetHandle,
                label: e.label,
                data: e.data,
            })),
            variables,
            config: projectConfig,
            exportedAt: new Date().toISOString(),
        };

        downloadFile(
            JSON.stringify(project, null, 2),
            `${slugify(storyTitle)}.bardoproject.json`,
            'application/json'
        );

        console.log('[BardoEditor] Project exported to file');
    }, [nodes, edges, storyTitle, projectConfig, variables]);

    /**
     * Export Ink source code
     */
    const exportInk = useCallback(() => {
        const ink = generateInk(nodes, edges, variables);
        downloadFile(ink, `${slugify(storyTitle)}.ink`, 'text/plain');
        console.log('[BardoEditor] Ink exported to file');
    }, [nodes, edges, variables, storyTitle]);

    /**
     * Copy Ink source to clipboard
     */
    const copyInk = useCallback(async () => {
        const ink = generateInk(nodes, edges, variables);
        try {
            await navigator.clipboard.writeText(ink);
            return true;
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = ink;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    }, [nodes, edges, variables]);

    /**
     * Export config as .config.json
     */
    const exportConfig = useCallback(() => {
        const configOut = {
            title: storyTitle,
            version: projectConfig.version || '1.0.0',
            ...projectConfig,
        };
        downloadFile(
            JSON.stringify(configOut, null, 2),
            `${slugify(storyTitle)}.config.json`,
            'application/json'
        );
        console.log('[BardoEditor] Config exported to file');
    }, [storyTitle, projectConfig]);

    /**
     * Import project from JSON file
     */
    const importProject = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const project = JSON.parse(e.target.result);

                    // Validate basic structure
                    if (!project.nodes || !Array.isArray(project.nodes)) {
                        throw new Error('Invalid project file: missing nodes');
                    }

                    // Migrate old node types to passage
                    const migratedNodes = migrateNodes(project.nodes || []);

                    // Restore state
                    isRestoringRef.current = true;
                    setStoryTitle(project.title || 'Imported Story');
                    setNodes(migratedNodes);
                    setEdges(project.edges || []);
                    setVariables(project.variables || []);
                    setProjectConfig(project.config || createEmptyProject().config);
                    setIsDirty(true);
                    initHistory(migratedNodes, project.edges || []);
                    requestAnimationFrame(() => { isRestoringRef.current = false; });

                    console.log('[BardoEditor] Project imported from file');
                    resolve(true);
                } catch (err) {
                    console.error('[BardoEditor] Failed to import:', err);
                    reject(err);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }, [setNodes, setEdges, initHistory]);

    /**
     * Clear project and start fresh
     */
    const newProject = useCallback(() => {
        if (isDirty && !confirm('You have unsaved changes. Start a new project anyway?')) {
            return false;
        }

        const empty = createEmptyProject();
        isRestoringRef.current = true;
        setStoryTitle(empty.title);
        setNodes([]);
        setEdges([]);
        setVariables([]);
        setProjectConfig(empty.config);
        setIsDirty(false);
        initHistory([], []);
        requestAnimationFrame(() => { isRestoringRef.current = false; });

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        console.log('[BardoEditor] New project created');
        return true;
    }, [isDirty, setNodes, setEdges, initHistory]);

    /**
     * Check if there's a saved project on mount
     */
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const project = JSON.parse(saved);
                if (project.nodes && project.nodes.length > 0) {
                    const shouldLoad = confirm(
                        `Found saved project "${project.title}". Load it?`
                    );
                    if (shouldLoad) {
                        loadProject();
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []); // Only on mount

    return useMemo(() => ({
        // State
        nodes,
        edges,
        storyTitle,
        projectConfig,
        variables,
        isDirty,

        // ReactFlow handlers
        onNodesChange,
        onEdgesChange,
        setNodes,
        setEdges,

        // Metadata setters
        setStoryTitle,
        setProjectConfig,
        setVariables,

        // Undo/redo
        undo,
        redo,
        canUndo,
        canRedo,
        getHistory,
        jumpToHistory,

        // Project actions
        saveProject,
        loadProject,
        exportProject,
        exportInk,
        copyInk,
        exportConfig,
        importProject,
        newProject,
    }), [
        nodes, edges, storyTitle, projectConfig, variables, isDirty,
        onNodesChange, onEdgesChange, setNodes, setEdges,
        setStoryTitle, setProjectConfig, setVariables,
        undo, redo, canUndo, canRedo, getHistory, jumpToHistory,
        saveProject, loadProject, exportProject, exportInk, copyInk, exportConfig, importProject, newProject,
    ]);
}

function slugify(str) {
    return str.replace(/\s+/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default useEditorState;
