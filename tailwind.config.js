/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bardo: {
                    bg: '#0a0a0a',
                    accent: '#facc15',
                    text: '#f5f5f5',
                    muted: '#737373'
                }
            },
            fontFamily: {
                narrative: ['Playfair Display', 'Georgia', 'serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace']
            },
            animation: {
                shake: 'shake 0.5s ease-in-out',
                flash: 'flash 0.3s ease-out',
                typewriter: 'typewriter 0.05s steps(1)'
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-8px) rotate(-1deg)' },
                    '50%': { transform: 'translateX(8px) rotate(1deg)' },
                    '75%': { transform: 'translateX(-4px) rotate(-0.5deg)' }
                },
                flash: {
                    '0%': { opacity: '0.8' },
                    '100%': { opacity: '0' }
                }
            }
        },
    },
    plugins: [],
}
