// TEMP DEBUG — remove before merge
import { useEffect, useState } from 'react'

export default function DebugViewportOverlay() {
    const [info, setInfo] = useState(() => collectInfo())

    useEffect(() => {
        const update = () => setInfo(collectInfo())
        window.addEventListener('resize', update)
        window.addEventListener('orientationchange', update)
        const interval = setInterval(update, 500)
        return () => {
            window.removeEventListener('resize', update)
            window.removeEventListener('orientationchange', update)
            clearInterval(interval)
        }
    }, [])

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 99999,
                background: 'rgba(255, 0, 255, 0.85)',
                color: 'white',
                fontSize: '10px',
                fontFamily: 'monospace',
                padding: '4px 6px',
                pointerEvents: 'none',
                lineHeight: 1.3,
                maxWidth: '70vw'
            }}
        >
            <div>w={info.innerWidth} h={info.innerHeight}</div>
            <div>dpr={info.dpr}</div>
            <div>portrait={String(info.portrait)} | mobile639={String(info.mobile639)}</div>
            <div>portraitDev={String(info.portraitDevice)}</div>
            <div>UA={info.uaShort}</div>
        </div>
    )
}

function collectInfo() {
    return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        dpr: window.devicePixelRatio,
        portrait: window.matchMedia('(orientation: portrait)').matches,
        mobile639: window.matchMedia('(max-width: 639px)').matches,
        portraitDevice: window.matchMedia('(orientation: portrait) and (max-width: 1023px)').matches,
        uaShort: navigator.userAgent.slice(0, 50)
    }
}
