import { useState, useCallback, useRef, useEffect } from 'react';

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 300;

/**
 * Undo/redo history for nodes and edges.
 * Uses refs for pointer and history to avoid stale closures in debounced callbacks.
 */
export function useUndoRedo() {
    const historyRef = useRef([]);
    const pointerRef = useRef(-1);
    const debounceRef = useRef(null);

    // State mirrors for triggering re-renders
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const syncDerivedState = useCallback(() => {
        setCanUndo(pointerRef.current > 0);
        setCanRedo(pointerRef.current < historyRef.current.length - 1);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    /**
     * Push a new snapshot (debounced).
     * Stable callback — no stale closure issues.
     */
    const pushSnapshot = useCallback((nodes, edges) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const pointer = pointerRef.current;
            const prev = historyRef.current;

            // Discard any redo entries beyond current pointer
            const trimmed = prev.slice(0, pointer + 1);

            const snapshot = {
                nodes: JSON.parse(JSON.stringify(nodes)),
                edges: JSON.parse(JSON.stringify(edges)),
            };

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
        };
        historyRef.current = [snapshot];
        pointerRef.current = 0;
        syncDerivedState();
    }, [syncDerivedState]);

    return { canUndo, canRedo, pushSnapshot, undo, redo, initHistory };
}
