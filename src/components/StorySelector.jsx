export default function StorySelector({ stories, onSelect, hasSave }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="text-center mb-12">
                <h1 className="font-mono text-4xl md:text-6xl text-bardo-accent mb-2 tracking-tight">
                    BARDO<span className="text-bardo-text">ENGINE</span>
                </h1>
                <p className="font-mono text-bardo-muted text-sm">
                    Motor de Aventuras Interactivas v1.0
                </p>
            </div>

            {/* Story list */}
            <div className="w-full max-w-md space-y-4">
                <h2 className="font-mono text-bardo-muted text-sm uppercase tracking-wider mb-4">
                    Seleccionar Historia
                </h2>

                {stories.map((story) => (
                    <button
                        key={story.id}
                        onClick={() => onSelect(story)}
                        className="w-full p-6 bg-bardo-bg border border-bardo-accent/30 rounded-lg
                       hover:border-bardo-accent hover:bg-bardo-accent/5
                       transition-all duration-300 text-left group glow-hover"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-narrative text-xl text-bardo-text group-hover:text-bardo-accent transition-colors">
                                    {story.title}
                                </h3>
                                <p className="font-mono text-bardo-muted text-xs mt-1 uppercase">
                                    ID: {story.id}
                                </p>
                            </div>

                            {hasSave(story.id) && (
                                <span className="px-2 py-1 bg-bardo-accent/20 text-bardo-accent text-xs font-mono rounded">
                                    CONTINUAR
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <p className="mt-12 font-mono text-bardo-muted/50 text-xs text-center">
                Powered by Ink • Built with React
            </p>
        </div>
    )
}
