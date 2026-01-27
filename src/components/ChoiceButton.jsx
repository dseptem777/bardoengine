import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function ChoiceButton({ text, index, onClick, disabled = false }) {
    // Prevent accidental clicks right after button appears (e.g., from double-click on text)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 150)
        return () => clearTimeout(timer)
    }, [])

    const handleClick = () => {
        if (isReady && !disabled) {
            onClick()
        }
    }

    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={handleClick}
            disabled={disabled}
            className={`w-full text-left p-4 md:p-5 
                 rounded-lg border transition-all duration-200
                 ${disabled
                    ? 'bg-gray-900/50 border-gray-700 cursor-not-allowed opacity-50 grayscale'
                    : 'bg-bardo-bg border-bardo-accent/40 hover:border-bardo-accent hover:bg-bardo-accent/10 active:scale-[0.98] group glow-hover'
                 }
                 ${!isReady ? 'pointer-events-none' : ''}`}
        >
            <span className={`font-mono mr-3 opacity-60 ${disabled ? 'text-gray-500' : 'text-bardo-accent group-hover:opacity-100'}`}>
                [{index + 1}]
            </span>
            <span className={`font-narrative text-lg ${disabled ? 'text-gray-500 line-through decoration-gray-600' : 'text-bardo-text group-hover:text-bardo-accent'} transition-colors`}>
                {text}
            </span>
        </motion.button>
    )
}
