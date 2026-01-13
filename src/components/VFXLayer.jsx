import { motion, AnimatePresence } from 'framer-motion'

const FLASH_COLORS = {
    red: 'rgba(239, 68, 68, 0.6)',
    blue: 'rgba(59, 130, 246, 0.6)',
    yellow: 'rgba(250, 204, 21, 0.6)',
    green: 'rgba(34, 197, 94, 0.6)',
    purple: 'rgba(168, 85, 247, 0.6)',
    white: 'rgba(255, 255, 255, 0.8)'
}

export default function VFXLayer({ vfxState }) {
    const { shake, flash } = vfxState

    return (
        <>
            {/* Shake effect - applied to body */}
            {shake && (
                <style>{`
          #root {
            animation: shake 0.5s ease-in-out;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px) rotate(-1deg); }
            40% { transform: translateX(10px) rotate(1deg); }
            60% { transform: translateX(-6px) rotate(-0.5deg); }
            80% { transform: translateX(6px) rotate(0.5deg); }
          }
        `}</style>
            )}

            {/* Flash overlay */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 pointer-events-none z-50"
                        style={{ backgroundColor: FLASH_COLORS[flash] || FLASH_COLORS.white }}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
