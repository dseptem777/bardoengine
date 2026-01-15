import { motion } from 'framer-motion'

/**
 * StartScreen - Main menu for standalone games
 * Shows: New Game, Continue (always visible but disabled if no save), Load Game
 */
export default function StartScreen({
    gameTitle = 'BardoEngine',
    hasAnySave = false,
    hasContinue = false,
    onNewGame,
    onContinue,
    onLoadGame,
    onBack = null // For dev mode: back to story selector
}) {
    return (
        <div className="min-h-screen bg-bardo-bg flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-radial from-bardo-accent/5 to-transparent" />

            {/* Scanlines effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                }}
            />

            {/* Back button (dev mode) */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 z-20 text-gray-500 hover:text-bardo-accent transition-colors font-mono text-sm"
                >
                    ← Elegir otra historia
                </button>
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* Game Title */}
                <h1
                    className="text-5xl md:text-7xl font-bold text-bardo-accent tracking-wider text-center"
                    style={{ textShadow: '0 0 30px rgba(250, 204, 21, 0.5)' }}
                >
                    {gameTitle}
                </h1>

                {/* Menu Buttons */}
                <div className="flex flex-col gap-4 w-72">
                    {/* New Game */}
                    <MenuButton onClick={onNewGame}>
                        NUEVA PARTIDA
                    </MenuButton>

                    {/* Continue - always visible, disabled if no save */}
                    <MenuButton
                        onClick={onContinue}
                        secondary
                        disabled={!hasContinue}
                    >
                        {hasContinue ? '✓ ' : ''}CONTINUAR
                    </MenuButton>

                    {/* Load Game - only if any saves exist */}
                    {hasAnySave && (
                        <MenuButton onClick={onLoadGame} secondary>
                            CARGAR PARTIDA
                        </MenuButton>
                    )}
                </div>

                {/* Version */}
                <p className="text-gray-600 text-sm mt-8">
                    Powered by BardoEngine v1.0
                </p>
            </div>
        </div>
    )
}

/**
 * MenuButton - Styled button for the start screen (no animations)
 */
function MenuButton({ children, onClick, secondary = false, disabled = false }) {
    return (
        <motion.button
            className={`
                w-full py-4 px-6 text-lg font-bold tracking-wider
                border-2 transition-all duration-200
                ${disabled
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                    : secondary
                        ? 'border-gray-600 text-gray-400 hover:border-bardo-accent hover:text-bardo-accent'
                        : 'border-bardo-accent text-bardo-accent hover:bg-bardo-accent hover:text-black'
                }
            `}
            onClick={disabled ? undefined : onClick}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
        >
            {children}
        </motion.button>
    )
}
