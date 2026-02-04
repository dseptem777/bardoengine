import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Player from '../../components/Player';
import { StorySimulator } from '../utils/StorySimulator';
import { useVFX } from '../../hooks/useVFX';

export default function PreviewPanel({ nodes, edges, onClose }) {
    const [simulator, setSimulator] = useState(null);
    const [text, setText] = useState('');
    const [choices, setChoices] = useState([]);
    const [canContinue, setCanContinue] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [history, setHistory] = useState([]);

    // VFX System
    const { vfxState, triggerVFX, clearVFX } = useVFX({
        playSfx: (id) => console.log('[Preview SFX]', id),
        playMusic: (id) => console.log('[Preview Music]', id),
        stopMusic: () => console.log('[Preview Stop Music]')
    });

    const processTags = useCallback((tags) => {
        if (!tags || tags.length === 0) return;
        tags.forEach(tag => triggerVFX(tag));
    }, [triggerVFX]);

    // Initialize/Restart Simulator
    const initSimulator = useCallback(() => {
        const sim = new StorySimulator(nodes, edges);
        setSimulator(sim);

        // Initial state
        const firstText = sim.Continue();
        processTags(sim.currentTags);
        setText(firstText);
        setChoices(sim.currentChoices);
        setCanContinue(sim.canContinue);
        setIsEnded(!sim.canContinue && sim.currentChoices.length === 0);
        setHistory([{ text: firstText, type: 'text' }]);
    }, [nodes, edges, processTags]);

    useEffect(() => {
        initSimulator();
    }, []); // Only on mount. Manual restart handle for live updates.

    const handleContinue = useCallback(() => {
        if (!simulator) return;
        clearVFX();
        const nextText = simulator.Continue();
        processTags(simulator.currentTags);
        setText(nextText);
        setChoices(simulator.currentChoices);
        setCanContinue(simulator.canContinue);
        setIsEnded(!simulator.canContinue && simulator.currentChoices.length === 0);
        setHistory(prev => [...prev, { text: nextText, type: 'text' }]);
    }, [simulator, processTags, clearVFX]);

    const handleChoice = useCallback((index) => {
        if (!simulator) return;
        const choiceText = choices[index]?.text;
        simulator.ChooseChoiceIndex(index);
        clearVFX();

        const nextText = simulator.Continue();
        processTags(simulator.currentTags);
        setText(nextText);
        setChoices(simulator.currentChoices);
        setCanContinue(simulator.canContinue);
        setIsEnded(!simulator.canContinue && simulator.currentChoices.length === 0);

        setHistory(prev => [
            ...prev,
            { text: `> ${choiceText}`, type: 'choice' },
            { text: nextText, type: 'text' }
        ]);
    }, [simulator, choices, processTags, clearVFX]);

    const handleBack = useCallback(() => {
        if (!simulator) return;
        if (simulator.GoBack()) {
            clearVFX();
            const currentText = simulator.Continue();
            processTags(simulator.currentTags);
            setText(currentText);
            setChoices(simulator.currentChoices);
            setCanContinue(simulator.canContinue);
            setIsEnded(!simulator.canContinue && simulator.currentChoices.length === 0);
        }
    }, [simulator, processTags, clearVFX]);

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
                        onClick={initSimulator}
                        className="text-[#9da6b9] hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Restart from beginning"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span className="text-[10px] uppercase font-bold">Restart</span>
                    </button>
                    <button
                        onClick={handleBack}
                        className="text-[#9da6b9] hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Step back to previous node"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span className="text-[10px] uppercase font-bold">Back</span>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#282e39] text-[#9da6b9] hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Flash Overlay */}
            {vfxState.flash && (
                <div
                    className="absolute inset-0 z-[200] pointer-events-none animate-flash-fade"
                    style={{ backgroundColor: vfxState.flash }}
                />
            )}

            {/* Simulated Player */}
            <div className={`flex-1 relative overflow-hidden transition-transform ${vfxState.shake ? 'animate-shake' : ''}`}>
                <Player
                    text={text}
                    choices={choices}
                    canContinue={canContinue}
                    isEnded={isEnded}
                    onContinue={handleContinue}
                    onChoice={handleChoice}
                    onRestart={initSimulator}
                    onBack={onClose}
                    // Light theme overrides for the editor (optional)
                    typewriterDelay={20}
                />
            </div>
        </div>
    );
}
