import { useCallback, useRef } from 'react'
// import { Howl } from 'howler'

// Sound registry - add sounds here when available
const SOUNDS = {
    // resaca: '/sounds/resaca.mp3',
    // paparazzi: '/sounds/paparazzi.mp3',
}

export function useAudio() {
    const soundsRef = useRef({})

    const playSfx = useCallback((id) => {
        console.log(`[Audio] Play SFX: ${id}`)

        // Uncomment when sounds are available:
        // if (SOUNDS[id] && !soundsRef.current[id]) {
        //   soundsRef.current[id] = new Howl({ src: [SOUNDS[id]] })
        // }
        // soundsRef.current[id]?.play()
    }, [])

    const stopAll = useCallback(() => {
        Object.values(soundsRef.current).forEach(sound => sound.stop())
    }, [])

    return { playSfx, stopAll }
}
