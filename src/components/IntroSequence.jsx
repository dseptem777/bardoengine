import { useState, useCallback, useEffect } from 'react'
import EngineLogoScreen from './EngineLogoScreen'
import IntroMoviePlayer from './IntroMoviePlayer'
import TitleScreen from './TitleScreen'

/**
 * IntroSequence - Orchestrates the full intro flow
 * 
 * Flow: Engine Logo → Intro Movie (optional) → Title Screen → onComplete
 * 
 * Each step can be skipped by user interaction
 * Configuration comes from the game's config.json intro section
 * Supports music and SFX playback
 */

// Intro phases
const PHASES = {
    ENGINE_LOGO: 'engine_logo',
    INTRO_MOVIE: 'intro_movie',
    TITLE_SCREEN: 'title_screen',
    COMPLETE: 'complete'
}

export default function IntroSequence({
    gameTitle = 'BardoEngine',
    introConfig = {},
    audioHooks = null,
    onComplete
}) {
    // Default config values
    const {
        showEngineLogo = true,
        engineLogoDuration = 3000,
        introVideo = null,
        titleBackground = null,
        titleBackgroundVideo = null,
        titleSubtitle = null,
        titleMusic = null,
        hideTitle = false,
        skipEnabled = true,
        // SFX configuration
        transitionSfx = 'ui_transition',      // Sound when transitioning between screens
        startGameSfx = 'ui_confirm'           // Sound when starting game from title screen
    } = introConfig

    // Determine starting phase
    const getInitialPhase = () => {
        if (showEngineLogo) return PHASES.ENGINE_LOGO
        if (introVideo) return PHASES.INTRO_MOVIE
        return PHASES.TITLE_SCREEN
    }

    const [currentPhase, setCurrentPhase] = useState(getInitialPhase())

    // Helper to play SFX safely
    const playSfx = useCallback((sfxId) => {
        if (sfxId && audioHooks?.playSfx) {
            audioHooks.playSfx(sfxId)
        }
    }, [audioHooks])

    // Play title music when entering title screen
    useEffect(() => {
        if (currentPhase === PHASES.TITLE_SCREEN && titleMusic && audioHooks?.playMusic) {
            audioHooks.playMusic(titleMusic)
        }
    }, [currentPhase, titleMusic, audioHooks])

    // Phase transition with SFX
    const transitionTo = useCallback((nextPhase, sfxId = transitionSfx) => {
        playSfx(sfxId)
        setCurrentPhase(nextPhase)
    }, [playSfx, transitionSfx])

    // Phase transition handlers
    const handleEngineLogoComplete = useCallback(() => {
        if (introVideo) {
            transitionTo(PHASES.INTRO_MOVIE)
        } else {
            transitionTo(PHASES.TITLE_SCREEN)
        }
    }, [introVideo, transitionTo])

    const handleIntroMovieComplete = useCallback(() => {
        transitionTo(PHASES.TITLE_SCREEN)
    }, [transitionTo])

    // Start game from title screen
    const handleTitleScreenComplete = useCallback(() => {
        playSfx(startGameSfx)
        // Stop title music when entering the menu
        if (audioHooks?.stopMusic) {
            audioHooks.stopMusic(true) // fade out
        }
        setCurrentPhase(PHASES.COMPLETE)
        onComplete?.()
    }, [onComplete, playSfx, startGameSfx, audioHooks])

    // Render current phase
    switch (currentPhase) {
        case PHASES.ENGINE_LOGO:
            return (
                <EngineLogoScreen
                    duration={engineLogoDuration}
                    onComplete={handleEngineLogoComplete}
                    skipEnabled={skipEnabled}
                    playSfx={playSfx}
                />
            )

        case PHASES.INTRO_MOVIE:
            return (
                <IntroMoviePlayer
                    videoSrc={introVideo}
                    onComplete={handleIntroMovieComplete}
                    skipEnabled={skipEnabled}
                    playSfx={playSfx}
                />
            )

        case PHASES.TITLE_SCREEN:
            return (
                <TitleScreen
                    gameTitle={gameTitle}
                    subtitle={titleSubtitle}
                    backgroundImage={titleBackground}
                    backgroundVideo={titleBackgroundVideo}
                    hideTitle={hideTitle}
                    onStart={handleTitleScreenComplete}
                    playSfx={playSfx}
                />
            )

        case PHASES.COMPLETE:
        default:
            return null
    }
}
