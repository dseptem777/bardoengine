/**
 * useEditorState.js
 * Central state management for BardoEditor.
 * Handles nodes, edges, project metadata, and persistence.
 * 
 * Created by: Antigravity
 * For: BardoEditor Lite Phase 1
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    useNodesState,
    useEdgesState,
} from 'reactflow';

const STORAGE_KEY = 'bardoeditor_project';
const PROJECT_VERSION = '1.0.0';

/**
 * Default empty project state
 */
const createEmptyProject = () => ({
    version: PROJECT_VERSION,
    title: 'Untitled Story',
    nodes: [],
    edges: [],
    config: {
        theme: {
            primaryColor: '#facc15',
            bgColor: '#0a0a0a',
        },
        stats: { enabled: false },
        inventory: { enabled: false },
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
    const [isDirty, setIsDirty] = useState(false);

    // Track changes for dirty state
    useEffect(() => {
        setIsDirty(true);
    }, [nodes, edges, storyTitle]);

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
    }, [nodes, edges, storyTitle, projectConfig]);

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

            // Restore state
            setStoryTitle(project.title || 'Untitled Story');
            setNodes(project.nodes || []);
            setEdges(project.edges || []);
            setProjectConfig(project.config || createEmptyProject().config);
            setIsDirty(false);

            console.log('[BardoEditor] Project loaded from localStorage');
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to load:', err);
            alert('Failed to load project: ' + err.message);
            return false;
        }
    }, [setNodes, setEdges]);

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
                label: e.label,
                data: e.data,
            })),
            config: projectConfig,
            exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${storyTitle.replace(/\s+/g, '_').toLowerCase()}.bardoproject.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[BardoEditor] Project exported to file');
    }, [nodes, edges, storyTitle, projectConfig]);

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

                    // Restore state
                    setStoryTitle(project.title || 'Imported Story');
                    setNodes(project.nodes || []);
                    setEdges(project.edges || []);
                    setProjectConfig(project.config || createEmptyProject().config);
                    setIsDirty(true);

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
    }, [setNodes, setEdges]);

    /**
     * Clear project and start fresh
     */
    const newProject = useCallback(() => {
        if (isDirty && !confirm('You have unsaved changes. Start a new project anyway?')) {
            return false;
        }

        const empty = createEmptyProject();
        setStoryTitle(empty.title);
        setNodes([]);
        setEdges([]);
        setProjectConfig(empty.config);
        setIsDirty(false);

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        console.log('[BardoEditor] New project created');
        return true;
    }, [isDirty, setNodes, setEdges]);

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
        isDirty,

        // ReactFlow handlers
        onNodesChange,
        onEdgesChange,
        setNodes,
        setEdges,

        // Metadata setters
        setStoryTitle,
        setProjectConfig,

        // Project actions
        saveProject,
        loadProject,
        exportProject,
        importProject,
        newProject,
    }), [
        nodes, edges, storyTitle, projectConfig, isDirty,
        onNodesChange, onEdgesChange, setNodes, setEdges,
        setStoryTitle, setProjectConfig,
        saveProject, loadProject, exportProject, importProject, newProject,
    ]);
}

export default useEditorState;
