import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function ChoiceButton({ text, index, onClick }) {
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
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={handleClick}
            className={`w-full text-left p-4 md:p-5 
                 bg-bardo-bg border border-bardo-accent/40 rounded-lg
                 hover:border-bardo-accent hover:bg-bardo-accent/10
                 active:scale-[0.98]
                 transition-all duration-200
                 group glow-hover ${!isReady ? 'pointer-events-none' : ''}`}
        >
            <span className="font-mono text-bardo-accent mr-3 opacity-60 group-hover:opacity-100">
                [{index + 1}]
            </span>
            <span className="font-narrative text-lg text-bardo-text group-hover:text-bardo-accent transition-colors">
                {text}
            </span>
        </motion.button>
    )
}
