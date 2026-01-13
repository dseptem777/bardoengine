import { motion } from 'framer-motion'

export default function ChoiceButton({ text, index, onClick }) {
    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onClick}
            className="w-full text-left p-4 md:p-5 
                 bg-bardo-bg border border-bardo-accent/40 rounded-lg
                 hover:border-bardo-accent hover:bg-bardo-accent/10
                 active:scale-[0.98]
                 transition-all duration-200
                 group glow-hover"
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
