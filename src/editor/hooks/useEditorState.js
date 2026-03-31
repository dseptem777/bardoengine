/**
 * useEditorState.js
 * Central state management for BardoEditor.
 * Handles nodes, edges, project metadata, persistence, variables, and exports.
 * Supports native file save/open via Tauri with browser fallback.
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
import { parseInk } from '../utils/parseInk';
import { useUndoRedo } from './useUndoRedo';
import {
    isTauriApp,
    openFile,
    saveFileAs,
    writeToPath,
    readFromPath,
    addRecentProject,
    PROJECT_FILTERS,
    INK_FILTERS,
} from '../utils/fileManager';

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
 * Serialize current project state to a JSON string.
 */
function serializeProject(nodes, edges, storyTitle, projectConfig, variables) {
    return JSON.stringify({
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
    }, null, 2);
}

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

    // File management
    const [currentFilePath, setCurrentFilePath] = useState(null);
    const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);

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
     * Load a parsed project object into state.
     */
    const loadProjectData = useCallback((project, filePath = null) => {
        const migratedNodes = migrateNodes(project.nodes || []);

        isRestoringRef.current = true;
        setStoryTitle(project.title || 'Untitled Story');
        setNodes(migratedNodes);
        setEdges(project.edges || []);
        setVariables(project.variables || []);
        setProjectConfig(project.config || createEmptyProject().config);
        setIsDirty(false);
        setCurrentFilePath(filePath);
        setIsWelcomeScreen(false);
        initHistory(migratedNodes, project.edges || []);
        requestAnimationFrame(() => { isRestoringRef.current = false; });

        if (filePath) {
            addRecentProject(filePath, project.title || 'Untitled Story');
        }
    }, [setNodes, setEdges, initHistory]);

    /**
     * Autosave to localStorage (crash recovery)
     */
    const autosaveToLocalStorage = useCallback(() => {
        try {
            const json = serializeProject(nodes, edges, storyTitle, projectConfig, variables);
            localStorage.setItem(STORAGE_KEY, json);
        } catch {
            // Silently fail — localStorage is just crash recovery
        }
    }, [nodes, edges, storyTitle, projectConfig, variables]);

    // Autosave on changes (debounced via effect)
    useEffect(() => {
        if (!isWelcomeScreen && nodes.length > 0) {
            const timer = setTimeout(autosaveToLocalStorage, 2000);
            return () => clearTimeout(timer);
        }
    }, [nodes, edges, storyTitle, isWelcomeScreen, autosaveToLocalStorage]);

    /**
     * Save project — to file if path exists, otherwise saveAs. Falls back to localStorage.
     */
    const saveProject = useCallback(async () => {
        const json = serializeProject(nodes, edges, storyTitle, projectConfig, variables);

        // If we have a current path (Tauri), write directly
        if (currentFilePath) {
            try {
                const wrote = await writeToPath(currentFilePath, json);
                if (wrote) {
                    setIsDirty(false);
                    addRecentProject(currentFilePath, storyTitle);
                    console.log('[BardoEditor] Saved to', currentFilePath);
                    return true;
                }
            } catch (err) {
                console.error('[BardoEditor] Failed to save to path:', err);
            }
        }

        // No path or not Tauri — try saveAs for Tauri, fall back to localStorage
        if (isTauriApp()) {
            return saveProjectAs();
        }

        // Browser: save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, json);
            setIsDirty(false);
            console.log('[BardoEditor] Project saved to localStorage');
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to save:', err);
            alert('Failed to save project: ' + err.message);
            return false;
        }
    }, [nodes, edges, storyTitle, projectConfig, variables, currentFilePath]);

    /**
     * Save As — always shows dialog
     */
    const saveProjectAs = useCallback(async () => {
        const json = serializeProject(nodes, edges, storyTitle, projectConfig, variables);
        const defaultName = `${slugify(storyTitle)}.bardoproject.json`;

        try {
            const path = await saveFileAs(json, PROJECT_FILTERS, defaultName);
            if (path) {
                setCurrentFilePath(path);
                setIsDirty(false);
                addRecentProject(path, storyTitle);
                console.log('[BardoEditor] Saved as', path);
            }
            return !!path;
        } catch (err) {
            console.error('[BardoEditor] Save As failed:', err);
            alert('Failed to save: ' + err.message);
            return false;
        }
    }, [nodes, edges, storyTitle, projectConfig, variables]);

    /**
     * Open project from native dialog or browser file input
     */
    const openProject = useCallback(async () => {
        if (isDirty && !confirm('You have unsaved changes. Open a different project?')) {
            return false;
        }

        try {
            const result = await openFile(PROJECT_FILTERS);
            if (!result) return false;

            const project = JSON.parse(result.content);
            if (!project.nodes || !Array.isArray(project.nodes)) {
                throw new Error('Invalid project file: missing nodes');
            }

            loadProjectData(project, result.path);
            console.log('[BardoEditor] Project opened', result.path || '(browser)');
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to open:', err);
            alert('Failed to open project: ' + err.message);
            return false;
        }
    }, [isDirty, loadProjectData]);

    /**
     * Open a recent project by path (Tauri only)
     */
    const openRecentProject = useCallback(async (path) => {
        if (isDirty && !confirm('You have unsaved changes. Open a different project?')) {
            return false;
        }

        try {
            const content = await readFromPath(path);
            if (!content) {
                alert('Could not read file. It may have been moved or deleted.');
                return false;
            }

            const project = JSON.parse(content);
            if (!project.nodes || !Array.isArray(project.nodes)) {
                throw new Error('Invalid project file');
            }

            loadProjectData(project, path);
            console.log('[BardoEditor] Opened recent project', path);
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to open recent:', err);
            alert('Failed to open project: ' + err.message);
            return false;
        }
    }, [isDirty, loadProjectData]);

    /**
     * Import an .ink file and convert to editor graph
     */
    const importInkFile = useCallback(async () => {
        if (isDirty && !confirm('You have unsaved changes. Import will replace the current project.')) {
            return false;
        }

        try {
            const result = await openFile(INK_FILTERS);
            if (!result) return false;

            const { nodes: parsedNodes, edges: parsedEdges, variables: parsedVars } = parseInk(result.content);

            if (parsedNodes.length === 0) {
                alert('No knots found in the Ink file. Make sure it contains === knot_name === sections.');
                return false;
            }

            const project = {
                ...createEmptyProject(),
                title: extractTitleFromPath(result.path) || 'Imported Ink',
                nodes: parsedNodes,
                edges: parsedEdges,
                variables: parsedVars,
            };

            loadProjectData(project, null); // No file path — it's an import, not a save target
            setIsDirty(true); // Mark dirty since it needs saving
            console.log(`[BardoEditor] Imported Ink: ${parsedNodes.length} knots, ${parsedEdges.length} edges`);
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to import Ink:', err);
            alert('Failed to import Ink file: ' + err.message);
            return false;
        }
    }, [isDirty, loadProjectData]);

    /**
     * Load project from localStorage (legacy)
     */
    const loadProject = useCallback(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                alert('No saved project found');
                return false;
            }

            const project = JSON.parse(saved);
            loadProjectData(project, null);
            console.log('[BardoEditor] Project loaded from localStorage');
            return true;
        } catch (err) {
            console.error('[BardoEditor] Failed to load:', err);
            alert('Failed to load project: ' + err.message);
            return false;
        }
    }, [loadProjectData]);

    /**
     * Export project to JSON file (download)
     */
    const exportProject = useCallback(() => {
        const json = serializeProject(nodes, edges, storyTitle, projectConfig, variables);

        downloadFile(
            json,
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
     * Import project from JSON file (legacy browser-only method)
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

                    loadProjectData(project, null);
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
    }, [loadProjectData]);

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
        setCurrentFilePath(null);
        setIsWelcomeScreen(false);
        initHistory([], []);
        requestAnimationFrame(() => { isRestoringRef.current = false; });

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        console.log('[BardoEditor] New project created');
        return true;
    }, [isDirty, setNodes, setEdges, initHistory]);

    /**
     * Check if there's a saved project on mount — show welcome screen or recover
     */
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const project = JSON.parse(saved);
                if (project.nodes && project.nodes.length > 0) {
                    // Auto-recover crash save but still show welcome
                    // The welcome screen will offer to load it
                    setIsWelcomeScreen(true);
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []); // Only on mount

    /**
     * Get the display name for the current file
     */
    const currentFileName = useMemo(() => {
        if (!currentFilePath) return null;
        // Extract filename from path
        const parts = currentFilePath.replace(/\\/g, '/').split('/');
        return parts[parts.length - 1];
    }, [currentFilePath]);

    return useMemo(() => ({
        // State
        nodes,
        edges,
        storyTitle,
        projectConfig,
        variables,
        isDirty,
        currentFilePath,
        currentFileName,
        isWelcomeScreen,

        // ReactFlow handlers
        onNodesChange,
        onEdgesChange,
        setNodes,
        setEdges,

        // Metadata setters
        setStoryTitle,
        setProjectConfig,
        setVariables,
        setIsWelcomeScreen,

        // Undo/redo
        undo,
        redo,
        canUndo,
        canRedo,
        getHistory,
        jumpToHistory,

        // Project actions
        saveProject,
        saveProjectAs,
        openProject,
        openRecentProject,
        importInkFile,
        loadProject,
        exportProject,
        exportInk,
        copyInk,
        exportConfig,
        importProject,
        newProject,
    }), [
        nodes, edges, storyTitle, projectConfig, variables, isDirty,
        currentFilePath, currentFileName, isWelcomeScreen,
        onNodesChange, onEdgesChange, setNodes, setEdges,
        setStoryTitle, setProjectConfig, setVariables,
        undo, redo, canUndo, canRedo, getHistory, jumpToHistory,
        saveProject, saveProjectAs, openProject, openRecentProject, importInkFile,
        loadProject, exportProject, exportInk, copyInk, exportConfig, importProject, newProject,
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

/**
 * Extract a title from a file path (filename without extension).
 */
function extractTitleFromPath(filePath) {
    if (!filePath) return null;
    const parts = filePath.replace(/\\/g, '/').split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.\w+$/, '').replace(/_/g, ' ');
}

export default useEditorState;
