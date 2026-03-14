import { useRef, useState } from 'react'
import { version as engineVersion } from '../../package.json'

export default function StorySelector({ stories, onSelect, hasSave, onOpenEditor, onImportInk, onRemoveStory }) {
    const fileInputRef = useRef(null)
    const [importError, setImportError] = useState(null)

    const extractTitle = (inkSource) => {
        const lines = inkSource.split('\n').slice(0, 10)
        for (const line of lines) {
            const match = line.match(/\/\/\s*PROYECTO:\s*(?:.*?-\s*)?(.+)/i)
            if (match) return match[1].trim()
        }
        return null
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        fileInputRef.current.value = ''
        setImportError(null)

        try {
            const inkSource = await file.text()
            const name = file.name.replace(/\.ink$/i, '')

            let title = extractTitle(inkSource)
            if (!title) {
                title = prompt('Story title:')
                if (!title) return
            }

            await onImportInk(name, title, inkSource)
        } catch (err) {
            setImportError(err.message || 'Failed to import .ink file')
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            {/* Logo */}
            <div className="text-center mb-12">
                <h1 className="font-mono text-4xl md:text-6xl text-bardo-accent mb-2 tracking-tight">
                    BARDO<span className="text-bardo-text">ENGINE</span>
                </h1>
                <p className="font-mono text-bardo-muted text-sm">
                    Motor de Aventuras Interactivas v{engineVersion}
                </p>
            </div>

            {/* Story list */}
            <div className="w-full max-w-md space-y-4">
                <h2 className="font-mono text-bardo-muted text-sm uppercase tracking-wider mb-4">
                    Seleccionar Historia
                </h2>

                {stories.map((story) => (
                    <div key={story.id} className="relative group/story">
                        <button
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
                        {onRemoveStory && (
                            <button
                                onClick={() => onRemoveStory(story.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover/story:opacity-100 transition-opacity
                               w-6 h-6 flex items-center justify-center rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 text-xs font-mono"
                                title="Remove story"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}

                {stories.length === 0 && (
                    <p className="font-mono text-bardo-muted/50 text-sm text-center py-8">
                        No stories yet. Import an .ink file to get started.
                    </p>
                )}

                {/* Import .ink button */}
                {onImportInk && (
                    <div className="mt-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".ink"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-4 border border-dashed border-bardo-muted/30 rounded-lg
                           hover:border-bardo-accent/50 hover:bg-bardo-accent/5
                           transition-all duration-300 text-center font-mono text-sm text-bardo-muted hover:text-bardo-accent"
                        >
                            + Import .ink
                        </button>
                        {importError && (
                            <p className="font-mono text-red-400 text-xs mt-2 text-center">{importError}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="mt-12 font-mono text-bardo-muted/50 text-xs text-center">
                Powered by Ink &bull; Built with React
            </p>

            {/* Editor Button (Dev) */}
            {onOpenEditor && (
                <button
                    onClick={onOpenEditor}
                    className="absolute bottom-4 right-4 z-20 text-bardo-accent hover:text-white transition-colors font-mono text-xs uppercase tracking-widest border border-bardo-accent/30 px-3 py-1 rounded hover:bg-bardo-accent/20"
                >
                    [BardoEditor]
                </button>
            )}
        </div>
    )
}
