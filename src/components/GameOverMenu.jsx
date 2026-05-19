import { motion } from 'framer-motion'

/**
 * GameOverMenu — shown after the muerte CHAPTER_BREAK overlay is dismissed.
 * Gives the player 3 options: continue from last save, open the save/load menu,
 * or return to the main menu.
 *
 * Props:
 *   onContinue      — loads the last autosave (same flow as Start Screen "Continue")
 *   onLoadMenu      — opens the SaveLoadModal in 'load' mode
 *   onMainMenu      — navigates back to the story selector / start screen
 */
export default function GameOverMenu({ onContinue, onLoadMenu, onMainMenu }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="flex flex-col items-center gap-4 px-8 py-10 rounded-lg border border-bardo-accent/20 bg-bardo-bg/95 shadow-xl min-w-[280px]"
            >
                <h2 className="text-bardo-accent font-bold text-xl tracking-widest uppercase mb-2">
                    Fin del juego
                </h2>

                <button
                    onClick={onContinue}
                    className="w-full py-3 px-6 rounded border border-bardo-accent/40 text-bardo-accent hover:bg-bardo-accent/10 hover:border-bardo-accent transition-all text-sm font-medium tracking-wide"
                >
                    Continuar último save
                </button>

                <button
                    onClick={onLoadMenu}
                    className="w-full py-3 px-6 rounded border border-white/20 text-white/70 hover:bg-white/5 hover:border-white/40 transition-all text-sm font-medium tracking-wide"
                >
                    Cargar partida
                </button>

                <button
                    onClick={onMainMenu}
                    className="w-full py-3 px-6 rounded border border-white/10 text-white/40 hover:bg-white/5 hover:border-white/20 hover:text-white/60 transition-all text-sm font-medium tracking-wide"
                >
                    Menú principal
                </button>
            </motion.div>
        </motion.div>
    )
}
