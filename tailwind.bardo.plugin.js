const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
    addUtilities({
        '.bardo-vignette': {
            'background': 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
            'pointer-events': 'none',
        },
        '.bardo-glitch-filter': {
            'filter': 'url(#bardo-glitch)',
        },
        '.bardo-bleed-filter': {
            'filter': 'url(#bardo-bleed)',
        },
        '.bardo-noise-filter': {
            'filter': 'url(#bardo-noise)',
        },
    });
});
