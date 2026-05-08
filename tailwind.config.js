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
                    bg: 'var(--bardo-bg)',
                    accent: 'var(--bardo-accent)',
                    text: 'var(--bardo-text)',
                    muted: 'var(--bardo-muted)'
                }
            },
            fontFamily: {
                narrative: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
                mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'ui-monospace', 'monospace']
            },
            transitionTimingFunction: {
                'bardo-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
                'bardo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'bardo-elastic': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
            },
            transitionDuration: {
                '350': '350ms',
                '450': '450ms',
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
    plugins: [require('./tailwind.bardo.plugin.js')],
}
