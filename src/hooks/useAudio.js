import { useCallback, useRef, useEffect, useMemo } from 'react'
import { Howl, Howler } from 'howler'

// Audio paths are resolved dynamically from the ID:
// SFX: /sounds/{id}.mp3
// Music: /music/{id}.mp3
// No hardcoded registry needed — just place .mp3 files in public/sounds/ or public/music/

// Default volumes (used as fallback)
const DEFAULT_SFX_VOLUME = 0.7
const DEFAULT_MUSIC_VOLUME = 0.4
const FADE_DURATION = 1000 // ms

export function useAudio({ sfxVolume = DEFAULT_SFX_VOLUME, musicVolume = DEFAULT_MUSIC_VOLUME } = {}) {
    const soundsRef = useRef({})
    const musicRef = useRef(null)
    const currentTrackRef = useRef(null)
    const pendingMusicRef = useRef(null)
    const fadeTimeoutRef = useRef(null)
    const audioUnlockedRef = useRef(false)
    const ambientLayersRef = useRef(new Map()) // name → Howl

    // Store current volumes in refs for real-time updates
    const sfxVolumeRef = useRef(sfxVolume)
    const musicVolumeRef = useRef(musicVolume)

    // Update volume refs when props change
    useEffect(() => {
        sfxVolumeRef.current = sfxVolume
        // Update existing sound instances
        Object.values(soundsRef.current).forEach(sound => {
            sound.volume(sfxVolume)
        })
    }, [sfxVolume])

    useEffect(() => {
        musicVolumeRef.current = musicVolume
        // Update current music if playing
        if (musicRef.current && musicRef.current.playing()) {
            musicRef.current.volume(musicVolume)
        }
    }, [musicVolume])

    // Unlock audio context on first user interaction (fixes autoplay policy)
    const unlockAudio = useCallback(() => {
        if (audioUnlockedRef.current) return

        // Create and play a silent sound to unlock the audio context
        const silentSound = new Howl({
            src: ['data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+9DEAAAIAANIAAAAQAAAaQAAAAEMAAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UMQbg8AAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1DEJIPAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'],
            volume: 0,
            onend: () => silentSound.unload()
        })
        silentSound.play()

        audioUnlockedRef.current = true
        console.log('[Audio] Audio context unlocked')

        // Remove the event listeners after unlocking
        document.removeEventListener('click', unlockAudio)
        document.removeEventListener('touchstart', unlockAudio)
        document.removeEventListener('keydown', unlockAudio)
    }, [])

    // Set up unlock listeners on mount
    useEffect(() => {
        document.addEventListener('click', unlockAudio, { once: true })
        document.addEventListener('touchstart', unlockAudio, { once: true })
        document.addEventListener('keydown', unlockAudio, { once: true })

        return () => {
            document.removeEventListener('click', unlockAudio)
            document.removeEventListener('touchstart', unlockAudio)
            document.removeEventListener('keydown', unlockAudio)
        }
    }, [unlockAudio])

    // Cleanup all Howl instances on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            Object.values(soundsRef.current).forEach(sound => sound.unload())
            soundsRef.current = {}
            if (pendingMusicRef.current) {
                pendingMusicRef.current.unload()
                pendingMusicRef.current = null
            }
            if (musicRef.current) {
                musicRef.current.unload()
                musicRef.current = null
            }
            currentTrackRef.current = null
            ambientLayersRef.current.forEach(layer => layer.unload())
            ambientLayersRef.current.clear()
        }
    }, [])

    // ==================
    // SFX Functions
    // ==================

    // Maps base SFX id → array of variant filenames (without .mp3).
    // Resolves multi-take rotation and file naming mismatches.
    const SFX_VARIANTS = {
        golpe:             ['golpe_a', 'golpe_b', 'golpe_c', 'golpe_d'],
        rugido_monstruo:   ['rugido_monstruo_a', 'rugido_monstruo_b', 'rugido_monstruo_c', 'rugido_monstruo_d'],
        susurro_multiple:  ['susurro_multiple_a', 'susurro_multiple_b', 'susurro_multiple_c', 'susurro_multiple_d'],
        canto_gutural:     ['canto_gutural_a', 'canto_gutural_b', 'canto_gutural_c'],
        tension:           ['tension_a', 'tension_b', 'tension_c'],
        magia_oscura:      ['magia_oscura_a', 'magia_oscura_b', 'magia_oscura_c'],
        trueno_cercano:    ['trueno_cercano_a', 'trueno_cercano_b', 'trueno_cercano_c'],
        vidrio_roto:       ['vidrio_roto_a', 'vidrio_roto_b'],
        aterrizaje:        ['aterrizaje_a', 'aterrizaje_b'],
        caja_fuerte:       ['caja_fuerte_a', 'caja_fuerte_b'],
        clic_arma:         ['clic_arma_a', 'clic_arma_b'],
        crasheo:           ['crasheo_a', 'crasheo_b'],
        disparo:           ['disparo_a', 'disparo_b'],
        jumpscare:         ['jumpscare_a', 'jumpscare_b'],
        magia_hex:         ['magia_hex_a', 'magia_hex_b'],
        mochila_caer:      ['mochila_caer_a', 'mochila_caer_b'],
        pasos_monstruo:    ['pasos_monstruo_a', 'pasos_monstruo_b'],
        puerta:            ['puerta_a', 'puerta_b'],
        puerta_destruida:  ['puerta_destruida_a', 'puerta_destruida_b'],
        puerta_secreta:    ['puerta_secreta_a', 'puerta_secreta_b'],
        sal_romperse:      ['sal_romperse_a', 'sal_romperse_b'],
        trueno_lejano:     ['trueno_lejano_a', 'trueno_lejano_b'],
        boladefuego:       ['boladefuego_a', 'boladefuego_b'],
        // Naming mismatches: ink tag → actual filenames
        disparos_escopeta: ['escopeta_a', 'escopeta_b'],
        explosion_magica:  ['magiexplosion_a', 'magiexplosion_b'],
        // Block 3 fallbacks — replace with dedicated assets when produced
        escape_sting:      ['jumpscare_a', 'jumpscare_b'],        // TODO: replace with escape_sting.mp3
        spider_screech:    ['rugido_monstruo_a', 'rugido_monstruo_b'], // TODO: replace with spider_screech.mp3
        roar_amplified:    ['rugido_monstruo_c', 'rugido_monstruo_d'], // TODO: replace with roar_amplified.mp3
        relief_sting:      ['sting_moral'],                        // TODO: replace with relief_sting.mp3
        vampiro_appear:    ['groan_long'],                         // TODO: replace with vampiro_appear.mp3
    }

    const playSfx = useCallback((id, options = {}) => {
        const variants = SFX_VARIANTS[id]
        const resolvedId = variants
            ? variants[Math.floor(Math.random() * variants.length)]
            : id

        // Allow callers to override volume (e.g. UI sounds at 0.18)
        const vol = options.volume !== undefined
            ? options.volume * sfxVolumeRef.current
            : sfxVolumeRef.current

        console.log(`[Audio] Play SFX: ${id}${resolvedId !== id ? ` → ${resolvedId}` : ''}`)

        const sfxSrc = `/sounds/${resolvedId}.mp3`

        if (!soundsRef.current[resolvedId]) {
            soundsRef.current[resolvedId] = new Howl({
                src: [sfxSrc],
                volume: vol,
                onloaderror: (soundId, error) => {
                    console.warn(`[Audio] Failed to load SFX ${resolvedId}:`, error)
                },
                onplayerror: (soundId, error) => {
                    console.error(`[Audio] Failed to play SFX ${resolvedId}:`, error)
                }
            })
        } else {
            soundsRef.current[resolvedId].volume(vol)
        }

        soundsRef.current[resolvedId].play()
    }, [])

    const stopAllSfx = useCallback(() => {
        Object.values(soundsRef.current).forEach(sound => sound.stop())
    }, [])

    // ==================
    // Music Functions
    // ==================
    const playMusic = useCallback((id, fadeIn = true) => {
        console.log(`[Audio] Play Music: ${id}`)

        // If same track is already playing, do nothing
        if (currentTrackRef.current === id && musicRef.current?.playing()) {
            return
        }

        // Cancel any pending fade-out from a previous stopMusic call
        if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current)
            fadeTimeoutRef.current = null
        }

        // Cancel any pending load to prevent orphaned Howl instances
        if (pendingMusicRef.current) {
            pendingMusicRef.current.unload()
            pendingMusicRef.current = null
        }

        const musicSrc = `/music/${id}.mp3`

        // Create new music instance — only kill old track once new one loads
        const newMusic = new Howl({
            src: [musicSrc],
            volume: fadeIn ? 0 : musicVolumeRef.current,
            loop: true,
            onload: () => {
                pendingMusicRef.current = null
                // New track loaded OK — now fade out the old one
                const oldMusic = musicRef.current
                if (oldMusic) {
                    oldMusic.fade(oldMusic.volume(), 0, FADE_DURATION)
                    setTimeout(() => oldMusic.unload(), FADE_DURATION)
                }
                musicRef.current = newMusic
                currentTrackRef.current = id
                newMusic.play()
                if (fadeIn) {
                    newMusic.fade(0, musicVolumeRef.current, FADE_DURATION)
                }
            },
            onloaderror: (soundId, error) => {
                console.warn(`[Audio] Failed to load music ${id}, keeping current track:`, error)
                pendingMusicRef.current = null
                newMusic.unload()
            },
            onplayerror: (soundId, error) => {
                console.error(`[Audio] Failed to play music ${id}:`, error)
            }
        })
        pendingMusicRef.current = newMusic
    }, [])

    const stopMusic = useCallback((fadeOut = true) => {
        console.log('[Audio] Stop Music')

        if (!musicRef.current) return

        const currentMusic = musicRef.current
        musicRef.current = null
        currentTrackRef.current = null

        if (fadeOut) {
            currentMusic.fade(currentMusic.volume(), 0, FADE_DURATION)
            fadeTimeoutRef.current = setTimeout(() => {
                currentMusic.stop()
                currentMusic.unload()
            }, FADE_DURATION)
        } else {
            currentMusic.stop()
            currentMusic.unload()
        }
    }, [])

    const setMusicVolume = useCallback((volume) => {
        if (musicRef.current) {
            musicRef.current.volume(volume)
        }
    }, [])

    // ==================
    // Duck / Unduck Music
    // ==================
    const duckMusic = useCallback((level = 0.3, durationMs = 300) => {
        if (!musicRef.current) return
        musicRef.current.fade(musicRef.current.volume(), level, durationMs)
    }, [])

    const unduckMusic = useCallback((durationMs = 400) => {
        if (!musicRef.current) return
        musicRef.current.fade(musicRef.current.volume(), musicVolumeRef.current, durationMs)
    }, [])

    // ==================
    // Stingers (one-shot, no loop)
    // ==================
    const playStinger = useCallback((name) => {
        const stingerSrc = `/sounds/${name}.mp3`
        const stinger = new Howl({
            src: [stingerSrc],
            volume: Math.min(sfxVolumeRef.current * 1.2, 1.0),
            loop: false,
            onloaderror: (id, err) => {
                console.warn(`[Audio] Stinger not found: ${name}`, err)
            },
            onend: () => stinger.unload(),
        })
        stinger.play()
    }, [])

    // ==================
    // Ambient Layers (additive over music)
    // ==================
    const playAmbientLayer = useCallback((name, vol = 0.4) => {
        if (ambientLayersRef.current.has(name)) return // already playing

        const src = `/sounds/${name}.mp3`
        const layer = new Howl({
            src: [src],
            volume: 0,
            loop: true,
            onloaderror: (id, err) => {
                console.warn(`[Audio] Ambient layer not found: ${name}`, err)
                ambientLayersRef.current.delete(name)
            },
            onload: () => {
                layer.play()
                layer.fade(0, vol, FADE_DURATION)
            },
        })
        ambientLayersRef.current.set(name, layer)
    }, [])

    const stopAmbientLayer = useCallback((name, fadeMs = 400) => {
        const layer = ambientLayersRef.current.get(name)
        if (!layer) return
        layer.fade(layer.volume(), 0, fadeMs)
        setTimeout(() => {
            layer.unload()
            ambientLayersRef.current.delete(name)
        }, fadeMs)
    }, [])

    // ==================
    // Global Controls
    // ==================
    const stopAllAmbientLayers = useCallback((fadeMs = 400) => {
        ambientLayersRef.current.forEach((layer, name) => {
            layer.fade(layer.volume(), 0, fadeMs)
            setTimeout(() => {
                layer.unload()
                ambientLayersRef.current.delete(name)
            }, fadeMs)
        })
    }, [])

    const stopAll = useCallback(() => {
        stopAllSfx()
        stopMusic(false)
        ambientLayersRef.current.forEach(layer => { layer.stop(); layer.unload() })
        ambientLayersRef.current.clear()
    }, [stopAllSfx, stopMusic])

    const setMasterVolume = useCallback((volume) => {
        Howler.volume(volume)
    }, [])

    return useMemo(() => ({
        // SFX
        playSfx,
        stopAllSfx,
        // Music
        playMusic,
        stopMusic,
        setMusicVolume,
        // Duck / Unduck
        duckMusic,
        unduckMusic,
        // Stingers
        playStinger,
        // Ambient layers
        playAmbientLayer,
        stopAmbientLayer,
        stopAllAmbientLayers,
        // Global
        stopAll,
        setMasterVolume
    }), [
        playSfx,
        stopAllSfx,
        playMusic,
        stopMusic,
        setMusicVolume,
        duckMusic,
        unduckMusic,
        playStinger,
        playAmbientLayer,
        stopAmbientLayer,
        stopAllAmbientLayers,
        stopAll,
        setMasterVolume
    ])
}
