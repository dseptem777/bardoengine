import { useCallback } from 'react'

// UI sound names → actual files in public/sounds/
// hover: pasos_monstruo variant (short, organic tap feel)
// click: clic_arma variant (crisp mechanical click)
// menu_open: puerta variant (brief door creak)
// save: clic_arma variant (same as click, slightly different take)
const UI_VOLUME = 0.18

/**
 * useUiSounds - Thin wrapper that fires low-volume SFX on UI interactions.
 * Requires the audio object from useAudio (or subsystems.audio from useBardoEngine).
 */
export function useUiSounds(audio) {
    const onChoiceHover = useCallback(() => {
        if (!audio?.playSfx) return
        // pasos_monstruo has two takes — the hook uses the variant resolver
        audio.playSfx('pasos_monstruo', { volume: UI_VOLUME })
    }, [audio])

    const onChoiceClick = useCallback(() => {
        if (!audio?.playSfx) return
        audio.playSfx('clic_arma', { volume: UI_VOLUME })
    }, [audio])

    const onMenuOpen = useCallback(() => {
        if (!audio?.playSfx) return
        audio.playSfx('puerta', { volume: UI_VOLUME })
    }, [audio])

    const onSave = useCallback(() => {
        if (!audio?.playSfx) return
        audio.playSfx('clic_arma', { volume: UI_VOLUME })
    }, [audio])

    return { onChoiceHover, onChoiceClick, onMenuOpen, onSave }
}
