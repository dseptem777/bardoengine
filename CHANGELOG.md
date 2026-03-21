# Changelog — BardoEngine

## v0.13.0 (2026-03-21)

### Features
- **Typewriter skip progresivo**: 2-phase skip system. First press fast-forwards text (8 chars/frame via rAF), second press shows all text instantly. Short text (<100 chars) skips instantly on first press.
- Floating indicator updates during fast-forward: "Presioná de nuevo para saltar"

### Fixes
- **QTE countdown race condition**: Countdown got stuck at "Ready? 2" due to `setGameState` being called inside `setReadyCountdown` updater. Separated state transition into its own effect.

## v0.12.1

- merge(feature/capitulo-2b): Capítulo 2B, arañas, apnea virtual knot (v0.8.0)

## v0.12.0

- feat(centinelas): ApneaGame como knot virtual + fix resultado minigame
