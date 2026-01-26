import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function ChoiceButton({ text, index, onClick, isBurned = false }) {
    // Prevent accidental clicks right after button appears (e.g., from double-click on text)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 150)
        return () => clearTimeout(timer)
    }, [])

    const handleClick = () => {
        if (isReady) {
            onClick()
        }
    }

    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isBurned ? 0.5 : 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={handleClick}
            disabled={isBurned}
            className={`w-full text-left p-4 md:p-5 
                 bg-bardo-bg border border-bardo-accent/40 rounded-lg
                 ${isBurned
                    ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-50 grayscale'
                    : 'hover:border-bardo-accent hover:bg-bardo-accent/10 active:scale-[0.98] group glow-hover'}
                 transition-all duration-200
                 ${(!isReady || isBurned) ? 'pointer-events-none' : ''}`}
        >
            <span className={`font-mono mr-3 opacity-60 ${isBurned ? 'text-gray-500' : 'text-bardo-accent group-hover:opacity-100'}`}>
                {isBurned ? '[X]' : `[${index + 1}]`}
            </span>
            <span className={`font-narrative text-lg transition-colors ${isBurned ? 'text-gray-500 line-through' : 'text-bardo-text group-hover:text-bardo-accent'}`}>
                {text}
            </span>
        </motion.button>
    )
}
