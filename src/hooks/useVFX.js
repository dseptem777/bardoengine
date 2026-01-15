import { useState, useCallback } from 'react'

export function useVFX(audioCallbacks = {}, vfxEnabled = true) {
    const { playSfx = null, playMusic = null, stopMusic = null } = audioCallbacks

    const [vfxState, setVfxState] = useState({
        shake: false,
        flash: null,
        background: null
    })

    const triggerVFX = useCallback((tag) => {
        // Visual effects - only trigger if VFX enabled
        if (vfxEnabled) {
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
        }

        // Background always works (not really a disruptive VFX)
        if (tag.startsWith('bg:')) {
            const bg = tag.replace('bg:', '')
            setVfxState(prev => ({ ...prev, background: bg }))
        }

        // SFX: play_sfx:sound_id
        if (tag.startsWith('play_sfx:')) {
            const sfxId = tag.replace('play_sfx:', '')
            if (playSfx) {
                playSfx(sfxId)
            } else {
                console.log(`[SFX] Would play: ${sfxId}`)
            }
        }

        // MUSIC: music:track_id (starts looping track with fade-in)
        if (tag.startsWith('music:')) {
            const musicId = tag.replace('music:', '')
            if (musicId === 'stop') {
                if (stopMusic) {
                    stopMusic()
                } else {
                    console.log('[Music] Would stop')
                }
            } else if (playMusic) {
                playMusic(musicId)
            } else {
                console.log(`[Music] Would play: ${musicId}`)
            }
        }

        if (tag === 'pitch_high') {
            console.log('[VFX] Pitch high effect triggered')
        }
    }, [playSfx, playMusic, stopMusic, vfxEnabled])

    const clearVFX = useCallback(() => {
        setVfxState(prev => ({ ...prev, shake: false, flash: null }))
    }, [])

    return { vfxState, triggerVFX, clearVFX }
}
