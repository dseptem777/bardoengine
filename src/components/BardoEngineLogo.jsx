import { motion } from 'framer-motion'

/**
 * BardoEngineLogo - Chaos Star + Sol de Mayo fusion
 * 8 rays like the chaos star, solar aesthetic from Argentine flag
 * Retro-futuristic with glitch effects
 */
export default function BardoEngineLogo({
    size = 200,
    animated = true,
    showText = true,
    className = ''
}) {
    const rays = 8
    const innerRadius = size * 0.15
    const outerRadius = size * 0.45
    const arrowLength = size * 0.12
    const center = size / 2

    // Generate ray paths (chaos star style with arrow tips)
    const generateRays = () => {
        const paths = []
        for (let i = 0; i < rays; i++) {
            const angle = (i * 360 / rays) - 90 // Start from top
            const radians = angle * Math.PI / 180

            // Main ray line
            const x1 = center + Math.cos(radians) * innerRadius
            const y1 = center + Math.sin(radians) * innerRadius
            const x2 = center + Math.cos(radians) * outerRadius
            const y2 = center + Math.sin(radians) * outerRadius

            // Arrow head points
            const arrowAngle1 = (angle + 150) * Math.PI / 180
            const arrowAngle2 = (angle - 150) * Math.PI / 180
            const ax1 = x2 + Math.cos(arrowAngle1) * arrowLength
            const ay1 = y2 + Math.sin(arrowAngle1) * arrowLength
            const ax2 = x2 + Math.cos(arrowAngle2) * arrowLength
            const ay2 = y2 + Math.sin(arrowAngle2) * arrowLength

            paths.push(
                <g key={i}>
                    {/* Main ray */}
                    <motion.line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        strokeWidth={size * 0.02}
                        strokeLinecap="round"
                        initial={animated ? { pathLength: 0, opacity: 0 } : {}}
                        animate={animated ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{
                            duration: 0.5,
                            delay: i * 0.08,
                            ease: "easeOut"
                        }}
                    />
                    {/* Arrow head */}
                    <motion.path
                        d={`M ${ax1} ${ay1} L ${x2} ${y2} L ${ax2} ${ay2}`}
                        stroke="currentColor"
                        strokeWidth={size * 0.02}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={animated ? { opacity: 0 } : {}}
                        animate={animated ? { opacity: 1 } : {}}
                        transition={{
                            duration: 0.3,
                            delay: 0.4 + i * 0.08,
                            ease: "easeOut"
                        }}
                    />
                </g>
            )
        }
        return paths
    }

    // Secondary rays (Sol de Mayo wavy style, between main rays)
    const generateSecondaryRays = () => {
        const paths = []
        for (let i = 0; i < rays; i++) {
            const angle = (i * 360 / rays) + (180 / rays) - 90 // Offset between main rays
            const radians = angle * Math.PI / 180

            const x1 = center + Math.cos(radians) * (innerRadius * 1.2)
            const y1 = center + Math.sin(radians) * (innerRadius * 1.2)
            const x2 = center + Math.cos(radians) * (outerRadius * 0.7)
            const y2 = center + Math.sin(radians) * (outerRadius * 0.7)

            paths.push(
                <motion.line
                    key={`secondary-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth={size * 0.012}
                    strokeLinecap="round"
                    opacity={0.6}
                    initial={animated ? { pathLength: 0, opacity: 0 } : { opacity: 0.6 }}
                    animate={animated ? { pathLength: 1, opacity: 0.6 } : {}}
                    transition={{
                        duration: 0.4,
                        delay: 0.6 + i * 0.05,
                        ease: "easeOut"
                    }}
                />
            )
        }
        return paths
    }

    return (
        <div className={`flex flex-col items-center gap-6 ${className}`}>
            {/* SVG Logo */}
            <motion.svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="text-bardo-accent"
                style={{
                    filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.5))'
                }}
                initial={animated ? { scale: 0.8, opacity: 0 } : {}}
                animate={animated ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Glow filter */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <g filter="url(#glow)">
                    {/* Center circle (Sol de Mayo face simplified) */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={innerRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={size * 0.02}
                        initial={animated ? { scale: 0, opacity: 0 } : {}}
                        animate={animated ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    />

                    {/* Inner dot */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={innerRadius * 0.4}
                        fill="currentColor"
                        initial={animated ? { scale: 0, opacity: 0 } : {}}
                        animate={animated ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    />

                    {/* Main chaos star rays */}
                    {generateRays()}

                    {/* Secondary wavy rays (Sol de Mayo tribute) */}
                    {generateSecondaryRays()}
                </g>
            </motion.svg>

            {/* Text */}
            {showText && (
                <motion.div
                    className="text-center"
                    initial={animated ? { opacity: 0, y: 20 } : {}}
                    animate={animated ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1 }}
                >
                    <h1
                        className="text-3xl md:text-4xl font-bold text-bardo-accent tracking-[0.3em] font-mono"
                        style={{
                            textShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
                            letterSpacing: '0.3em'
                        }}
                    >
                        BARDOENGINE
                    </h1>
                </motion.div>
            )}
        </div>
    )
}
