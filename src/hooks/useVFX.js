import { useState, useCallback } from 'react'

export function useVFX() {
    const [vfxState, setVfxState] = useState({
        shake: false,
        flash: null,
        background: null
    })

    const triggerVFX = useCallback((tag) => {
        // Parse tag and trigger effect
        if (tag === 'shake') {
            setVfxState(prev => ({ ...prev, shake: true }))
            setTimeout(() => {
                setVfxState(prev => ({ ...prev, shake: false }))
            }, 500)
        }

        if (tag.startsWith('flash_')) {
            const color = tag.replace('flash_', '')
            setVfxState(prev => ({ ...prev, flash: color }))
            setTimeout(() => {
                setVfxState(prev => ({ ...prev, flash: null }))
            }, 400)
        }

        if (tag === 'flash_multi') {
            const colors = ['red', 'blue', 'yellow', 'purple', 'green']
            let i = 0
            const interval = setInterval(() => {
                setVfxState(prev => ({ ...prev, flash: colors[i % colors.length] }))
                i++
                if (i >= 5) {
                    clearInterval(interval)
                    setVfxState(prev => ({ ...prev, flash: null }))
                }
            }, 100)
        }

        if (tag.startsWith('bg:')) {
            const bg = tag.replace('bg:', '')
            setVfxState(prev => ({ ...prev, background: bg }))
        }

        if (tag.startsWith('play_sfx:')) {
            const sfxId = tag.replace('play_sfx:', '')
            console.log(`[SFX] Would play: ${sfxId}`)
            // TODO: Integrate Howler.js
        }

        if (tag === 'pitch_high') {
            console.log('[VFX] Pitch high effect triggered')
        }
    }, [])

    const clearVFX = useCallback(() => {
        setVfxState(prev => ({ ...prev, shake: false, flash: null }))
    }, [])

    return { vfxState, triggerVFX, clearVFX }
}
