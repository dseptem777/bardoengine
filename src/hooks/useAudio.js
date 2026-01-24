import { useCallback, useRef, useEffect, useMemo } from 'react'
import { Howl, Howler } from 'howler'

// ============================================
// SFX REGISTRY - Short one-shot sound effects
// ============================================
const SOUNDS = {
    // Serruchín SFX
    serrucho: '/sounds/serrucho.mp3',
    serrucho_hueso: '/sounds/serrucho_hueso.mp3',
    grito: '/sounds/grito.mp3',
    carne: '/sounds/carne.mp3',

    // Shared SFX
    victory: '/sounds/victory.mp3',

    // Partuza SFX
    resaca: '/sounds/resaca.mp3',
    paparazzi: '/sounds/paparazzi.mp3',
    super_ambience: '/sounds/super_ambience.mp3',
    disco: '/sounds/disco.mp3',
    sirena_poli: '/sounds/sirena_poli.mp3',
    invitacion: '/sounds/invitacion.mp3',
}

// ============================================
// MUSIC REGISTRY - Looping background tracks
// ============================================
const MUSIC = {
    // Serruchín tracks
    horror_ambient: '/music/horror_ambient.mp3',
    tension_drone: '/music/tension_drone.mp3',

    // Partuza tracks
    morning_hangover: '/music/morning_hangover.mp3',
    supermarket_muzak: '/music/supermarket_muzak.mp3',
    rave_electronic: '/music/rave_electronic.mp3',

    // Shared/Generic
    victory_fanfare: '/music/victory_fanfare.mp3',
    game_over: '/music/game_over.mp3',
}

// Default volumes (used as fallback)
const DEFAULT_SFX_VOLUME = 0.7
const DEFAULT_MUSIC_VOLUME = 0.4
const FADE_DURATION = 1000 // ms

export function useAudio({ sfxVolume = DEFAULT_SFX_VOLUME, musicVolume = DEFAULT_MUSIC_VOLUME } = {}) {
    const soundsRef = useRef({})
    const musicRef = useRef(null)
    const currentTrackRef = useRef(null)
    const audioUnlockedRef = useRef(false)

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

    // ==================
    // SFX Functions
    // ==================
    const playSfx = useCallback((id) => {
        console.log(`[Audio] Play SFX: ${id}`)

        if (!SOUNDS[id]) {
            console.warn(`[Audio] Unknown SFX ID: ${id}`)
            return
        }

        // Lazy-load: create Howl instance on first play
        if (!soundsRef.current[id]) {
            soundsRef.current[id] = new Howl({
                src: [SOUNDS[id]],
                volume: sfxVolumeRef.current,
                onloaderror: (soundId, error) => {
                    console.error(`[Audio] Failed to load SFX ${id}:`, error)
                },
                onplayerror: (soundId, error) => {
                    console.error(`[Audio] Failed to play SFX ${id}:`, error)
                }
            })
        } else {
            // Update volume before playing
            soundsRef.current[id].volume(sfxVolumeRef.current)
        }

        soundsRef.current[id].play()
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

        // Stop current music with fade
        if (musicRef.current) {
            const oldMusic = musicRef.current
            oldMusic.fade(oldMusic.volume(), 0, FADE_DURATION)
            setTimeout(() => oldMusic.unload(), FADE_DURATION)
        }

        if (!MUSIC[id]) {
            console.warn(`[Audio] Unknown Music ID: ${id}`)
            return
        }

        // Create new music instance
        musicRef.current = new Howl({
            src: [MUSIC[id]],
            volume: fadeIn ? 0 : musicVolumeRef.current,
            loop: true,
            onloaderror: (soundId, error) => {
                console.error(`[Audio] Failed to load music ${id}:`, error)
            },
            onplayerror: (soundId, error) => {
                console.error(`[Audio] Failed to play music ${id}:`, error)
            }
        })

        currentTrackRef.current = id
        musicRef.current.play()

        if (fadeIn) {
            musicRef.current.fade(0, musicVolumeRef.current, FADE_DURATION)
        }
    }, [])

    const stopMusic = useCallback((fadeOut = true) => {
        console.log('[Audio] Stop Music')

        if (!musicRef.current) return

        if (fadeOut) {
            musicRef.current.fade(musicRef.current.volume(), 0, FADE_DURATION)
            setTimeout(() => {
                musicRef.current?.stop()
                musicRef.current?.unload()
                musicRef.current = null
                currentTrackRef.current = null
            }, FADE_DURATION)
        } else {
            musicRef.current.stop()
            musicRef.current.unload()
            musicRef.current = null
            currentTrackRef.current = null
        }
    }, [])

    const setMusicVolume = useCallback((volume) => {
        if (musicRef.current) {
            musicRef.current.volume(volume)
        }
    }, [])

    // ==================
    // Global Controls
    // ==================
    const stopAll = useCallback(() => {
        stopAllSfx()
        stopMusic(false)
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
        // Global
        stopAll,
        setMasterVolume
    }), [
        playSfx,
        stopAllSfx,
        playMusic,
        stopMusic,
        setMusicVolume,
        stopAll,
        setMasterVolume
    ])
}
