import React from 'react';
import { getRecentProjects, isTauriApp } from '../utils/fileManager';

export default function WelcomeScreen({ onNewProject, onOpenProject, onImportInk, onOpenRecent, onLoadExample, onRecoverCrashSave }) {
    const recentProjects = isTauriApp() ? getRecentProjects() : [];
    const hasCrashSave = (() => {
        try {
            const saved = localStorage.getItem('bardoeditor_project');
            if (!saved) return false;
            const project = JSON.parse(saved);
            return project.nodes && project.nodes.length > 0;
        } catch { return false; }
    })();

    return (
        <div className="fixed inset-0 bg-[#0b0c10] flex items-center justify-center z-50 font-display">
            <div className="w-full max-w-2xl px-8">
                {/* Logo / Title */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-[#2b6cee] text-5xl">hub</span>
                        <h1 className="text-white text-4xl font-bold tracking-tight">BardoEditor</h1>
                    </div>
                    <p className="text-[#6b7280] text-sm">Visual story editor for BardoEngine</p>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={onNewProject}
                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#151921] border border-[#282e39] hover:border-[#2b6cee] hover:bg-[#1a1f2e] transition-all group"
                    >
                        <span className="material-symbols-outlined text-3xl text-[#9da6b9] group-hover:text-[#2b6cee] transition-colors">note_add</span>
                        <span className="text-sm font-medium text-[#9da6b9] group-hover:text-white transition-colors">New Project</span>
                    </button>

                    <button
                        onClick={onOpenProject}
                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#151921] border border-[#282e39] hover:border-[#2b6cee] hover:bg-[#1a1f2e] transition-all group"
                    >
                        <span className="material-symbols-outlined text-3xl text-[#9da6b9] group-hover:text-[#2b6cee] transition-colors">folder_open</span>
                        <span className="text-sm font-medium text-[#9da6b9] group-hover:text-white transition-colors">Open Project</span>
                    </button>

                    <button
                        onClick={onImportInk}
                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#151921] border border-[#282e39] hover:border-yellow-500/50 hover:bg-[#1a1f2e] transition-all group"
                    >
                        <span className="material-symbols-outlined text-3xl text-[#9da6b9] group-hover:text-yellow-400 transition-colors">code</span>
                        <span className="text-sm font-medium text-[#9da6b9] group-hover:text-white transition-colors">Import .ink</span>
                    </button>
                </div>

                {/* Quick actions row */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={onLoadExample}
                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#151921] border border-[#282e39] hover:border-[#2b6cee]/50 hover:bg-[#1a1f2e] transition-all group"
                    >
                        <span className="material-symbols-outlined text-xl text-purple-400">menu_book</span>
                        <span className="text-sm text-[#9da6b9] group-hover:text-white transition-colors">Load Example Project</span>
                    </button>

                    {hasCrashSave && (
                        <button
                            onClick={onRecoverCrashSave}
                            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/20 transition-all group"
                        >
                            <span className="material-symbols-outlined text-xl text-yellow-400">restore</span>
                            <span className="text-sm text-yellow-300 group-hover:text-yellow-200 transition-colors">Recover Unsaved Work</span>
                        </button>
                    )}
                </div>

                {/* Recent projects */}
                {recentProjects.length > 0 && (
                    <div>
                        <h3 className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-3">Recent Projects</h3>
                        <div className="space-y-1">
                            {recentProjects.map((project, i) => (
                                <button
                                    key={i}
                                    onClick={() => onOpenRecent(project.path)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#151921] transition-all group text-left"
                                >
                                    <span className="material-symbols-outlined text-lg text-[#4b5563] group-hover:text-[#2b6cee] transition-colors">description</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-[#9da6b9] group-hover:text-white transition-colors truncate">
                                            {project.title}
                                        </div>
                                        <div className="text-xs text-[#4b5563] truncate">
                                            {project.path}
                                        </div>
                                    </div>
                                    <div className="text-xs text-[#4b5563] shrink-0">
                                        {formatDate(project.lastOpened)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Keyboard shortcuts hint */}
                <div className="mt-8 text-center">
                    <p className="text-[#4b5563] text-xs">
                        Ctrl+N New &middot; Ctrl+O Open &middot; Ctrl+S Save
                    </p>
                </div>
            </div>
        </div>
    );
}

function formatDate(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    } catch {
        return '';
    }
}
