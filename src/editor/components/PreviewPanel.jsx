import React, { useState, useEffect, useCallback, useRef } from 'react';
import Player from '../../components/Player';
import { Story } from 'inkjs';
import { generateInk, buildIdMap } from '../utils/generateInk';
import { useVFX } from '../../hooks/useVFX';
import { useMinigameController, parseMinigameTag } from '../../hooks/useMinigameController';
import MinigameOverlay from '../../components/MinigameOverlay';

export default function PreviewPanel({ nodes, edges, variables = [], onClose, startAtNodeId = null }) {
    const simulatorRef = useRef(null);
    const stateStackRef = useRef([]);
    const idMapRef = useRef(new Map());
    const [text, setText] = useState('');
    const [choices, setChoices] = useState([]);
    const [canContinue, setCanContinue] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [history, setHistory] = useState([]);
    const [compileError, setCompileError] = useState(null);
    const [isCompiling, setIsCompiling] = useState(true);

    // Knot warp state
    const [currentKnotName, setCurrentKnotName] = useState('');
    const [selectedWarpKnot, setSelectedWarpKnot] = useState('');
    const [knotList, setKnotList] = useState([]);

    // Variable Inspector state
    const [showVarPanel, setShowVarPanel] = useState(false);
    const [vfxEnabled, setVfxEnabled] = useState(false);
    const [inkVariables, setInkVariables] = useState({});
    const [changedVars, setChangedVars] = useState(new Set());
    const prevVarsRef = useRef({});
    const highlightTimerRef = useRef(null);

    // Use ref for processTagsForNode to avoid stale closures in callbacks
    const processTagsRef = useRef(null);
    const autoStartedRef = useRef(false);

    // VFX System
    const { vfxState, triggerVFX, clearVFX } = useVFX({
        playSfx: (id) => console.log('[Preview SFX]', id),
        playMusic: (id) => console.log('[Preview Music]', id),
        stopMusic: () => console.log('[Preview Stop Music]')
    });

    // Read all variables from the inkjs story and detect changes
    const snapshotVariables = useCallback((story) => {
        if (!story?.variablesState) return;
        const vars = {};
        try {
            // Enumerate all global variables from the internal map
            const globalVars = story.variablesState._globalVariables;
            if (globalVars && typeof globalVars.forEach === 'function') {
                globalVars.forEach((value, name) => {
                    // Read through the public accessor to get the JS value
                    vars[name] = story.variablesState[name];
                });
            }
        } catch (e) {
            console.warn('[Preview] Could not read variables:', e.message);
            return;
        }

        // Detect which variables changed
        const prev = prevVarsRef.current;
        const changed = new Set();
        for (const key of Object.keys(vars)) {
            if (prev[key] !== vars[key]) {
                changed.add(key);
            }
        }

        prevVarsRef.current = vars;
        setInkVariables(vars);
        setChangedVars(changed);

        // Clear change highlights after animation duration
        if (changed.size > 0) {
            clearTimeout(highlightTimerRef.current);
            highlightTimerRef.current = setTimeout(() => setChangedVars(new Set()), 1200);
        }
    }, []);

    // Minigame result handler — uses ref to avoid stale closure
    const handleMinigameResult = useCallback((result) => {
        console.log('[Preview] Minigame result:', result);
        const story = simulatorRef.current;
        if (!story) return;

        // Store result in story variables
        try {
            story.variablesState['minigame_result'] = (result === true || result === 1) ? 1 : 0;
        } catch (e) {
            console.warn('[Preview] Could not set minigame_result variable:', e.message);
        }

        // Auto-continue story after minigame
        if (story.canContinue) {
            stateStackRef.current.push(story.state.toJson());
            const nextText = story.Continue();
            if (processTagsRef.current) processTagsRef.current(story.currentTags);
            setText(nextText);
            setChoices(story.currentChoices.map((c, i) => ({ text: c.text, index: i })));
            setCanContinue(story.canContinue);
            setIsEnded(!story.canContinue && story.currentChoices.length === 0);
            setHistory(prev => [...prev, { text: nextText, type: 'text' }]);
            snapshotVariables(story);
        }
    }, [snapshotVariables]);

    // Minigame Controller
    const minigameController = useMinigameController(handleMinigameResult);

    // Auto-start minigame when queued with autoStart (guarded against double-fire)
    // Cleanup highlight timer on unmount
    useEffect(() => {
        return () => clearTimeout(highlightTimerRef.current);
    }, []);

    useEffect(() => {
        if (minigameController.isPending && minigameController.config?.autoStart && !autoStartedRef.current) {
            autoStartedRef.current = true;
            minigameController.startGame();
        }
        if (!minigameController.isPending) {
            autoStartedRef.current = false;
        }
    }, [minigameController.isPending, minigameController.config?.autoStart, minigameController.startGame]);

    // Process tags — routes VFX and minigame tags
    const processTagsForNode = useCallback((tags) => {
        if (!tags || tags.length === 0) return;

        tags.forEach(tag => {
            const tagLower = tag.toLowerCase().trim();

            // KEY_MASH tag
            if (tagLower.startsWith('key_mash:')) {
                const countStr = tag.substring('KEY_MASH:'.length).trim();
                const count = parseInt(countStr) || 30;
                minigameController.queueGame({
                    type: 'keymash',
                    params: {
                        key: 'V',
                        count,
                        timeLimit: Math.max(10, count * 0.5),
                    },
                    autoStart: true,
                });
                return;
            }

            // MINIGAME tag
            if (tagLower.startsWith('minigame:') || tagLower.startsWith('minigame ')) {
                const config = parseMinigameTag(tag);
                if (config) {
                    minigameController.queueGame(config);
                }
                return;
            }

            // VFX — only if enabled
            if (vfxEnabled) {
                triggerVFX(tag);
            }
        });
    }, [triggerVFX, minigameController, vfxEnabled]);

    // Keep ref in sync so handleMinigameResult can use it without stale closure
    useEffect(() => {
        processTagsRef.current = processTagsForNode;
    }, [processTagsForNode]);

    // Sync story state to React state
    const syncSimState = useCallback((story) => {
        setChoices(story.currentChoices.map((c, i) => ({ text: c.text, index: i })));
        setCanContinue(story.canContinue);
        setIsEnded(!story.canContinue && story.currentChoices.length === 0);
    }, []);

    // Extract current knot name from story path
    const getCurrentKnot = useCallback((story) => {
        try {
            const path = story.state.currentPathString;
            if (path) return path.split('.')[0];
        } catch (e) { /* ignore */ }
        return '';
    }, []);

    // Collect text from canContinue until choices, end, or a "next" tag.
    // Saves ONE undo snapshot before draining, then updates currentKnotName.
    const drainText = useCallback((story) => {
        stateStackRef.current.push(story.state.toJson());

        let fullText = '';
        const allTags = [];
        while (story.canContinue) {
            const line = story.Continue();
            if (line.trim()) {
                fullText += (fullText ? '\n' : '') + line;
            }
            if (story.currentTags.length > 0) {
                allTags.push(...story.currentTags);

                const hasNext = story.currentTags.some(t => t.trim().toLowerCase().startsWith('next'));
                if (hasNext && story.canContinue) {
                    break;
                }
            }
        }
        setCurrentKnotName(getCurrentKnot(story));
        return { text: fullText, tags: allTags };
    }, [getCurrentKnot]);

    // Warp to a specific knot by name
    const warpToKnot = useCallback((knotName) => {
        const story = simulatorRef.current;
        if (!story || !knotName) return;
        clearVFX();
        stateStackRef.current.push(story.state.toJson());
        try {
            story.ChoosePathString(knotName, true);
        } catch (e) {
            console.warn('[Preview] Warp failed:', e.message);
            return;
        }

        let fullText = '';
        const allTags = [];
        while (story.canContinue) {
            const line = story.Continue();
            if (line.trim()) fullText += (fullText ? '\n' : '') + line;
            if (story.currentTags.length > 0) {
                allTags.push(...story.currentTags);
                const hasNext = story.currentTags.some(t => t.trim().toLowerCase().startsWith('next'));
                if (hasNext && story.canContinue) break;
            }
        }
        processTagsRef.current?.(allTags);
        setText(fullText);
        syncSimState(story);
        setHistory([{ text: `>> Warped to ${knotName}`, type: 'system' }, { text: fullText, type: 'text' }]);
        snapshotVariables(story);
        setCurrentKnotName(knotName);
    }, [clearVFX, syncSimState, snapshotVariables]);

    // Initialize/Restart with real Ink compilation
    const initStory = useCallback(async (overrideStartNodeId = null) => {
        minigameController.reset();
        setCompileError(null);
        setIsCompiling(true);

        try {
            // Build ID map for node-to-knot resolution
            const idMap = buildIdMap(nodes);
            idMapRef.current = idMap;
            const knots = Array.from(idMap.values()).sort();
            setKnotList(knots);
            if (knots.length > 0) setSelectedWarpKnot(knots[0]);

            const inkSource = generateInk(nodes, edges, variables);

            // Yield to UI before heavy compilation
            await new Promise(r => setTimeout(r, 0));

            const { Compiler } = await import('inkjs/compiler/Compiler');
            const compiler = new Compiler(inkSource);
            const compiled = compiler.Compile();
            const jsonStr = compiled.ToJson();
            const story = new Story(jsonStr);

            simulatorRef.current = story;
            stateStackRef.current = [];

            // If starting at a specific node, warp there
            const targetNodeId = overrideStartNodeId || startAtNodeId;
            if (targetNodeId) {
                const knotName = idMap.get(targetNodeId);
                if (knotName) {
                    try {
                        story.ChoosePathString(knotName, true);
                        setCurrentKnotName(knotName);
                    } catch (e) {
                        console.warn('[Preview] Start-at warp failed:', e.message);
                    }
                }
            }

            // Drain initial text
            const { text: firstText, tags } = drainText(story);
            processTagsForNode(tags);
            setText(firstText);
            syncSimState(story);
            setHistory([{ text: firstText, type: 'text' }]);
            prevVarsRef.current = {};
            snapshotVariables(story);
        } catch (err) {
            setCompileError(err.message || 'Failed to compile Ink');
            simulatorRef.current = null;
        } finally {
            setIsCompiling(false);
        }
    }, [nodes, edges, variables, startAtNodeId, processTagsForNode, minigameController, syncSimState, drainText, snapshotVariables]);

    useEffect(() => {
        initStory();
    }, []); // Only on mount. Manual restart via button.

    const handleContinue = useCallback(() => {
        const story = simulatorRef.current;
        if (!story || minigameController.isPlaying) return;
        clearVFX();

        const { text: nextText, tags } = drainText(story);
        processTagsForNode(tags);
        setText(nextText);
        syncSimState(story);
        setHistory(prev => [...prev, { text: nextText, type: 'text' }]);
        snapshotVariables(story);
    }, [processTagsForNode, clearVFX, minigameController.isPlaying, syncSimState, drainText, snapshotVariables]);

    const handleChoice = useCallback((index) => {
        const story = simulatorRef.current;
        if (!story || minigameController.isPlaying) return;
        const choiceText = choices[index]?.text;
        story.ChooseChoiceIndex(index);
        clearVFX();

        const { text: nextText, tags } = drainText(story);
        processTagsForNode(tags);
        setText(nextText);
        syncSimState(story);

        setHistory(prev => [
            ...prev,
            { text: `> ${choiceText}`, type: 'choice' },
            { text: nextText, type: 'text' }
        ]);
        snapshotVariables(story);
    }, [choices, processTagsForNode, clearVFX, minigameController.isPlaying, syncSimState, drainText, snapshotVariables]);

    const handleBack = useCallback(() => {
        const story = simulatorRef.current;
        if (!story || minigameController.isPlaying) return;
        if (stateStackRef.current.length === 0) return;

        clearVFX();
        const snapshot = stateStackRef.current.pop();
        story.state.LoadJson(snapshot);

        // Re-read current state after restoring
        if (story.canContinue) {
            const { text: restoredText, tags } = drainText(story);
            processTagsForNode(tags);
            setText(restoredText);
        }
        syncSimState(story);
        snapshotVariables(story);
    }, [processTagsForNode, clearVFX, minigameController.isPlaying, syncSimState, drainText, snapshotVariables]);

    // Compiling state
    if (isCompiling) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0b0c10] flex flex-col animate-fade-in">
                <div className="h-12 bg-[#1c1f27] border-b border-[#282e39] flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Compiling</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#282e39] text-[#9da6b9] hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                        <p className="text-[#9da6b9] text-sm">Compiling {nodes.length} knots...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Compile error view
    if (compileError) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0b0c10] flex flex-col animate-fade-in">
                <div className="h-12 bg-[#1c1f27] border-b border-[#282e39] flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Compile Error</span>
                        </div>
                        <div className="w-px h-4 bg-[#282e39]"></div>
                        <button
                            onClick={initStory}
                            className="text-[#9da6b9] hover:text-white flex items-center gap-1.5 transition-colors"
                            title="Retry compilation"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            <span className="text-[10px] uppercase font-bold">Retry</span>
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#282e39] text-[#9da6b9] hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-xl w-full bg-[#1c1f27] rounded-lg border border-red-500/30 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-red-400">error</span>
                            <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider">Ink Compilation Failed</h3>
                        </div>
                        <pre className="text-red-300/80 text-xs font-mono whitespace-pre-wrap bg-[#0b0c10] rounded p-4 max-h-64 overflow-auto">
                            {compileError}
                        </pre>
                        <p className="text-[#9da6b9] text-xs mt-4">
                            Close the preview, fix the issue in your nodes, then try again.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#0b0c10] flex flex-col animate-fade-in">
            {/* Preview Toolbar */}
            <div className="h-12 bg-[#1c1f27] border-b border-[#282e39] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Live Preview</span>
                    </div>
                    <div className="w-px h-4 bg-[#282e39]"></div>
                    <button
                        onClick={initStory}
                        className="text-[#9da6b9] hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Restart from beginning"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span className="text-[10px] uppercase font-bold">Restart</span>
                    </button>
                    <button
                        onClick={handleBack}
                        className="text-[#9da6b9] hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Step back to previous state"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span className="text-[10px] uppercase font-bold">Back</span>
                    </button>

                    {/* Knot Warp */}
                    <div className="w-px h-4 bg-[#282e39]"></div>
                    <div className="flex items-center gap-1.5">
                        <select
                            value={selectedWarpKnot}
                            onChange={(e) => setSelectedWarpKnot(e.target.value)}
                            className="h-7 px-2 bg-[#0b0c10] border border-[#282e39] rounded text-[10px] text-[#9da6b9] focus:outline-none focus:border-[#2b6cee] font-mono max-w-[160px]"
                            title="Select knot to warp to"
                        >
                            {knotList.map(k => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => warpToKnot(selectedWarpKnot)}
                            className="text-[#9da6b9] hover:text-yellow-400 flex items-center gap-1 transition-colors"
                            title="Warp to selected knot"
                        >
                            <span className="material-symbols-outlined text-sm">flight</span>
                            <span className="text-[10px] uppercase font-bold">Warp</span>
                        </button>
                    </div>

                    {/* Current knot indicator */}
                    {currentKnotName && (
                        <>
                            <div className="w-px h-4 bg-[#282e39]"></div>
                            <span className="text-[10px] font-mono text-yellow-400/80 bg-yellow-400/10 px-2 py-0.5 rounded" title="Current knot">
                                {currentKnotName}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setVfxEnabled(prev => !prev)}
                        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            vfxEnabled
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-[#282e39] text-[#9da6b9] hover:text-white'
                        }`}
                        title="Toggle VFX (shake, flash, etc.)"
                    >
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        <span className="text-[10px]">VFX</span>
                    </button>
                    <button
                        onClick={() => setShowVarPanel(prev => !prev)}
                        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            showVarPanel
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-[#282e39] text-[#9da6b9] hover:text-white'
                        }`}
                        title="Toggle variable inspector"
                    >
                        <span className="material-symbols-outlined text-sm">data_object</span>
                        <span className="text-[10px]">Vars</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#282e39] text-[#9da6b9] hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            {/* Flash Overlay — only when VFX enabled */}
            {vfxEnabled && vfxState.flash && (
                <div
                    className="absolute inset-0 z-[200] pointer-events-none animate-flash-fade"
                    style={{ backgroundColor: vfxState.flash }}
                />
            )}

            {/* Minigame Overlay */}
            <MinigameOverlay
                isPlaying={minigameController.isPlaying}
                config={minigameController.config}
                onFinish={minigameController.finishGame}
                onCancel={minigameController.cancelGame}
                showResultScreen={true}
            />

            {/* Main content area: Player + Variable Inspector */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Simulated Player */}
                <div className={`flex-1 relative overflow-hidden transition-transform ${vfxEnabled && vfxState.shake ? 'animate-shake' : ''}`}>
                    <Player
                        text={text}
                        choices={choices}
                        canContinue={canContinue}
                        isEnded={isEnded}
                        onContinue={handleContinue}
                        onChoice={handleChoice}
                        onRestart={initStory}
                        onBack={onClose}
                        typewriterDelay={10}
                    />
                </div>

                {/* Variable Inspector Sidebar */}
                {showVarPanel && (
                    <div className="w-64 bg-[#101622] border-l border-[#282e39] flex flex-col shrink-0 overflow-hidden">
                        <div className="h-10 bg-[#1c1f27] border-b border-[#282e39] flex items-center justify-between px-3 shrink-0">
                            <span className="text-[#9da6b9] text-[10px] font-bold uppercase tracking-wider">Variables</span>
                            <span className="text-[#565e70] text-[10px]">
                                {Object.keys(inkVariables).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {Object.keys(inkVariables).length === 0 ? (
                                <div className="text-[#565e70] text-xs text-center mt-8">
                                    No variables defined
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {Object.entries(inkVariables)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([name, value]) => {
                                            const isChanged = changedVars.has(name);
                                            const valueType = typeof value;
                                            // Color by type: numbers=cyan, strings=green, booleans=amber
                                            let valueColorClass = 'text-[#9da6b9]';
                                            if (valueType === 'number') valueColorClass = 'text-cyan-400';
                                            else if (valueType === 'string') valueColorClass = 'text-green-400';
                                            else if (valueType === 'boolean') valueColorClass = 'text-amber-400';

                                            // Format display value
                                            let displayValue = String(value);
                                            if (valueType === 'boolean') displayValue = value ? 'true' : 'false';
                                            else if (valueType === 'string') displayValue = `"${value}"`;

                                            return (
                                                <div
                                                    key={name}
                                                    className="flex items-center justify-between px-2 py-1 rounded text-xs font-mono transition-colors duration-1000"
                                                    style={{
                                                        backgroundColor: isChanged ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
                                                    }}
                                                >
                                                    <span className="text-[#9da6b9] truncate mr-2" title={name}>
                                                        {name}
                                                    </span>
                                                    <span className={`${valueColorClass} shrink-0 font-semibold`} title={displayValue}>
                                                        {displayValue}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
