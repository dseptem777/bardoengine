import { useState, useCallback, useMemo } from 'react'
import { parseVFXTag, VFX_TYPES } from '../config/vfxRegistry'

export function useVFX(audioCallbacks = {}, vfxEnabled = true) {
    const { playSfx = null, playMusic = null, stopMusic = null } = audioCallbacks

    const [vfxState, setVfxState] = useState({
        shake: false,
        flash: null,
        background: null,
        // Horror system additions
        horrorEffect: null,
        horrorIntensity: 1.0
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

            // Horror VFX handling
            case VFX_TYPES.UI_HORROR:
                if (vfxEnabled) {
                    console.log(`[VFX] Horror effect: ${effect.effect}`)
                    setVfxState(prev => ({
                        ...prev,
                        horrorEffect: effect.effect
                    }))
                }
                break
        }
    }, [playSfx, playMusic, stopMusic, vfxEnabled])

    const clearVFX = useCallback(() => {
        setVfxState(prev => ({
            ...prev,
            shake: false,
            flash: null,
            horrorEffect: null,
            horrorIntensity: 1.0
        }))
    }, [])

    // Specific horror effect controls
    const setHorrorEffect = useCallback((effect, intensity = 1.0) => {
        if (vfxEnabled) {
            setVfxState(prev => ({
                ...prev,
                horrorEffect: effect,
                horrorIntensity: intensity
            }))
        }
    }, [vfxEnabled])

    const clearHorrorEffect = useCallback(() => {
        setVfxState(prev => ({
            ...prev,
            horrorEffect: null,
            horrorIntensity: 1.0
        }))
    }, [])

    return useMemo(() => ({
        vfxState,
        triggerVFX,
        clearVFX,
        // Horror-specific exports
        setHorrorEffect,
        clearHorrorEffect
    }), [vfxState, triggerVFX, clearVFX, setHorrorEffect, clearHorrorEffect])
}

