import { useState, useCallback, useMemo } from 'react'
import { parseVFXTag, VFX_TYPES } from '../config/vfxRegistry'

export function useVFX(audioCallbacks = {}, vfxEnabled = true) {
    const { playSfx = null, playMusic = null, stopMusic = null } = audioCallbacks

    const [vfxState, setVfxState] = useState({
        shake: false,
        flash: null,
        background: null
    })

    const triggerVFX = useCallback((tag) => {
        const effect = parseVFXTag(tag)
        if (!effect) return

        switch (effect.type) {
            case VFX_TYPES.SHAKE:
                if (vfxEnabled) {
                    setVfxState(prev => ({ ...prev, shake: true }))
                    setTimeout(() => {
                        setVfxState(prev => ({ ...prev, shake: false }))
                    }, 500)
                }
                break

            case VFX_TYPES.FLASH:
                if (vfxEnabled) {
                    const { color } = effect

                    if (color === 'multi') {
                        // Special multi-color flash sequence
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
                    } else {
                        // Single color flash
                        setVfxState(prev => ({ ...prev, flash: color }))
                        setTimeout(() => {
                            setVfxState(prev => ({ ...prev, flash: null }))
                        }, 400)
                    }
                }
                break

            case VFX_TYPES.BACKGROUND:
                setVfxState(prev => ({ ...prev, background: effect.id }))
                break

            case VFX_TYPES.SFX:
                if (playSfx) {
                    playSfx(effect.id)
                } else {
                    console.log(`[SFX] Would play: ${effect.id}`)
                }
                break

            case VFX_TYPES.MUSIC:
                if (effect.action === 'stop') {
                    if (stopMusic) {
                        stopMusic()
                    } else {
                        console.log('[Music] Would stop')
                    }
                } else {
                    if (playMusic) {
                        playMusic(effect.id)
                    } else {
                        console.log(`[Music] Would play: ${effect.id}`)
                    }
                }
                break

            case VFX_TYPES.CUSTOM:
                if (effect.id === 'pitch_high') {
                    console.log('[VFX] Pitch high effect triggered')
                }
                break
        }
    }, [playSfx, playMusic, stopMusic, vfxEnabled])

    const clearVFX = useCallback(() => {
        setVfxState(prev => ({ ...prev, shake: false, flash: null }))
    }, [])

    return useMemo(() => ({
        vfxState,
        triggerVFX,
        clearVFX
    }), [vfxState, triggerVFX, clearVFX])
}
