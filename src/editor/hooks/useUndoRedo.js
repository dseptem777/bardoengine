import { useState, useCallback, useRef, useEffect } from 'react';

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 300;

/**
 * Auto-generate a label describing the difference between two snapshots.
 */
function diffLabel(prev, next) {
    if (!prev) return 'Initial state';

    const prevNodeCount = prev.nodes.length;
    const nextNodeCount = next.nodes.length;
    const prevEdgeCount = prev.edges.length;
    const nextEdgeCount = next.edges.length;

    if (nextNodeCount > prevNodeCount) {
        const diff = nextNodeCount - prevNodeCount;
        return `Added ${diff} node${diff > 1 ? 's' : ''}`;
    }
    if (nextNodeCount < prevNodeCount) {
        const diff = prevNodeCount - nextNodeCount;
        return `Removed ${diff} node${diff > 1 ? 's' : ''}`;
    }
    if (nextEdgeCount > prevEdgeCount) {
        return 'Added connection';
    }
    if (nextEdgeCount < prevEdgeCount) {
        return 'Removed connection';
    }

    // Check for content/label changes
    for (const nextNode of next.nodes) {
        const prevNode = prev.nodes.find(n => n.id === nextNode.id);
        if (!prevNode) continue;
        if ((prevNode.data?.content || '') !== (nextNode.data?.content || '') ||
            (prevNode.data?.label || '') !== (nextNode.data?.label || '')) {
            return `Edited ${nextNode.data?.label || nextNode.id}`;
        }
    }

    // Check for position changes (moved)
    for (const nextNode of next.nodes) {
        const prevNode = prev.nodes.find(n => n.id === nextNode.id);
        if (prevNode && (prevNode.position?.x !== nextNode.position?.x || prevNode.position?.y !== nextNode.position?.y)) {
            return 'Moved nodes';
        }
    }

    return 'Changed';
}

/**
 * Undo/redo history for nodes and edges.
 * Uses refs for pointer and history to avoid stale closures in debounced callbacks.
 * Enhanced with labels, timestamps, and history timeline support.
 */
export function useUndoRedo() {
    const historyRef = useRef([]);
    const pointerRef = useRef(-1);
    const debounceRef = useRef(null);

    // State mirrors for triggering re-renders
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [historyVersion, setHistoryVersion] = useState(0);

    const syncDerivedState = useCallback(() => {
        setCanUndo(pointerRef.current > 0);
        setCanRedo(pointerRef.current < historyRef.current.length - 1);
        setHistoryVersion(v => v + 1);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    /**
     * Push a new snapshot (debounced).
     */
    const pushSnapshot = useCallback((nodes, edges) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const pointer = pointerRef.current;
            const prev = historyRef.current;

            // Discard any redo entries beyond current pointer
            const trimmed = prev.slice(0, pointer + 1);

            const prevSnapshot = trimmed.length > 0 ? trimmed[trimmed.length - 1] : null;

            const snapshot = {
                nodes: JSON.parse(JSON.stringify(nodes)),
                edges: JSON.parse(JSON.stringify(edges)),
                timestamp: Date.now(),
                label: '', // will be set below
            };

            snapshot.label = diffLabel(prevSnapshot, snapshot);

            const newHistory = [...trimmed, snapshot];

            // Cap at MAX_HISTORY
            if (newHistory.length > MAX_HISTORY) {
                newHistory.shift();
            }

            historyRef.current = newHistory;
            pointerRef.current = newHistory.length - 1;
            syncDerivedState();
        }, DEBOUNCE_MS);
    }, [syncDerivedState]);

    /**
     * Undo: step back one snapshot.
     */
    const undo = useCallback(() => {
        if (pointerRef.current <= 0) return null;
        pointerRef.current -= 1;
        syncDerivedState();
        return historyRef.current[pointerRef.current];
    }, [syncDerivedState]);

    /**
     * Redo: step forward one snapshot.
     */
    const redo = useCallback(() => {
        if (pointerRef.current >= historyRef.current.length - 1) return null;
        pointerRef.current += 1;
        syncDerivedState();
        return historyRef.current[pointerRef.current];
    }, [syncDerivedState]);

    /**
     * Initialize history with the current state (call once on load).
     */
    const initHistory = useCallback((nodes, edges) => {
        const snapshot = {
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            timestamp: Date.now(),
            label: 'Initial state',
        };
        historyRef.current = [snapshot];
        pointerRef.current = 0;
        syncDerivedState();
    }, [syncDerivedState]);

    /**
     * Get full history timeline for display.
     */
    const getHistory = useCallback(() => {
        return {
            entries: historyRef.current.map((s, i) => ({
                index: i,
                label: s.label || 'Changed',
                timestamp: s.timestamp,
                isCurrent: i === pointerRef.current,
            })),
            currentIndex: pointerRef.current,
        };
    }, [historyVersion]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Jump to a specific history index.
     */
    const jumpTo = useCallback((index) => {
        if (index < 0 || index >= historyRef.current.length) return null;
        pointerRef.current = index;
        syncDerivedState();
        return historyRef.current[index];
    }, [syncDerivedState]);

    return { canUndo, canRedo, pushSnapshot, undo, redo, initHistory, getHistory, jumpTo };
}
