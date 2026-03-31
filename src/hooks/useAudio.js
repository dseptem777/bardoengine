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
        }
    }, [])

    // ==================
    // SFX Functions
    // ==================
    const playSfx = useCallback((id) => {
        console.log(`[Audio] Play SFX: ${id}`)

        const sfxSrc = `/sounds/${id}.mp3`

        // Lazy-load: create Howl instance on first play
        if (!soundsRef.current[id]) {
            soundsRef.current[id] = new Howl({
                src: [sfxSrc],
                volume: sfxVolumeRef.current,
                onloaderror: (soundId, error) => {
                    console.warn(`[Audio] Failed to load SFX ${id}:`, error)
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
