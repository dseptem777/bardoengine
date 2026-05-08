import { useEffect, useRef } from 'react'

/**
 * SvgFilters — Global SVG filter library for BardoEngine VFX.
 *
 * Mount once near the top of the render tree (in App.jsx).
 * All filters become available globally via CSS `filter: url(#bardo-*)`.
 *
 * Filters:
 *   #bardo-noise    — fractal noise (TV static), baseFrequency animated via RAF
 *   #bardo-displace — low-freq turbulence displacement map (environmental warping)
 *   #bardo-glitch   — RGB channel split (R/G/B offset via feColorMatrix + feOffset + feMerge)
 *   #bardo-bleed    — Gaussian blur + red boost + composite (ink bleed on paper)
 */
export default function SvgFilters() {
    const noiseTurbulenceRef = useRef(null)
    const rafRef = useRef(null)
    const phaseRef = useRef(0)

    // Animate bardo-noise baseFrequency via requestAnimationFrame
    // Oscillates between 0.60 and 0.90 for a live TV-static feel
    useEffect(() => {
        const animate = () => {
            phaseRef.current += 0.008
            const freq = 0.60 + Math.sin(phaseRef.current) * 0.15
            if (noiseTurbulenceRef.current) {
                noiseTurbulenceRef.current.setAttribute('baseFrequency', freq.toFixed(4))
            }
            rafRef.current = requestAnimationFrame(animate)
        }
        rafRef.current = requestAnimationFrame(animate)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <svg
            width={0}
            height={0}
            style={{ position: 'absolute', pointerEvents: 'none', overflow: 'hidden' }}
            aria-hidden="true"
        >
            <defs>
                {/* ── bardo-noise ─────────────────────────────────────────────
                    Monochrome fractal noise for TV static / mental interference.
                    Apply: filter: url(#bardo-noise)
                    The baseFrequency attribute is driven by the RAF loop above.
                ─────────────────────────────────────────────────────────── */}
                <filter id="bardo-noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
                    <feTurbulence
                        ref={noiseTurbulenceRef}
                        type="fractalNoise"
                        baseFrequency="0.65"
                        numOctaves="2"
                        stitchTiles="stitch"
                        result="noise"
                    />
                    {/* Convert to monochrome using luminance weights */}
                    <feColorMatrix
                        in="noise"
                        type="matrix"
                        values="0.2126 0.7152 0.0722 0 0
                                0.2126 0.7152 0.0722 0 0
                                0.2126 0.7152 0.0722 0 0
                                0      0      0      1 0"
                    />
                </filter>

                {/* ── bardo-displace ──────────────────────────────────────────
                    Low-frequency displacement for subtle environmental warping.
                    Apply: filter: url(#bardo-displace)
                    Override scale with CSS custom property or inline style on
                    the filtered element (feDisplacementMap scale is fixed here;
                    for variable scale, clone the filter with a different id).
                ─────────────────────────────────────────────────────────── */}
                <filter id="bardo-displace" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.012"
                        numOctaves="3"
                        seed="42"
                        stitchTiles="stitch"
                        result="dispNoise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="dispNoise"
                        scale="10"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* ── bardo-displace-boss ─────────────────────────────────────
                    Identical to bardo-displace but scale=4 for subtle viewport
                    warp during spider infestation.
                ─────────────────────────────────────────────────────────── */}
                <filter id="bardo-displace-boss" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.012"
                        numOctaves="3"
                        seed="42"
                        stitchTiles="stitch"
                        result="dispNoiseBoss"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="dispNoiseBoss"
                        scale="4"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* ── bardo-glitch ────────────────────────────────────────────
                    RGB channel separation — classic VHS / data corruption look.
                    R shifts left+up, G stays, B shifts right+down.
                    Apply: filter: url(#bardo-glitch)
                ─────────────────────────────────────────────────────────── */}
                <filter id="bardo-glitch" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                    {/* Extract red channel */}
                    <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="1 0 0 0 0
                                0 0 0 0 0
                                0 0 0 0 0
                                0 0 0 1 0"
                        result="r"
                    />
                    <feOffset in="r" dx="-3" dy="-2" result="rShift" />

                    {/* Extract green channel */}
                    <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="0 0 0 0 0
                                0 1 0 0 0
                                0 0 0 0 0
                                0 0 0 1 0"
                        result="g"
                    />
                    {/* Green stays at origin — no offset */}

                    {/* Extract blue channel */}
                    <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="0 0 0 0 0
                                0 0 0 0 0
                                0 0 1 0 0
                                0 0 0 1 0"
                        result="b"
                    />
                    <feOffset in="b" dx="3" dy="2" result="bShift" />

                    {/* Additive merge of shifted channels */}
                    <feMerge>
                        <feMergeNode in="rShift" />
                        <feMergeNode in="g" />
                        <feMergeNode in="bShift" />
                    </feMerge>
                </filter>

                {/* ── bardo-bleed ─────────────────────────────────────────────
                    Ink bleed effect: Gaussian blur + red boost + composite back
                    onto the original for a bloody-paper feel.
                    Apply: filter: url(#bardo-bleed)
                ─────────────────────────────────────────────────────────── */}
                <filter id="bardo-bleed" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" />
                    {/* Boost reds in the blurred layer */}
                    <feColorMatrix
                        in="blurred"
                        type="matrix"
                        values="1.5 0   0   0   0.05
                                0   0.5 0   0   0
                                0   0   0.5 0   0
                                0   0   0   1   0"
                        result="reddened"
                    />
                    {/* Composite bleed behind the original */}
                    <feComposite in="SourceGraphic" in2="reddened" operator="over" />
                </filter>
            </defs>
        </svg>
    )
}
