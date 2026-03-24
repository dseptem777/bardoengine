/**
 * useWillpowerAudio
 *
 * Web Audio API synthesizer for the willpower / vampire system.
 * No mp3 files required — all sound is generated procedurally.
 *
 * Three layers:
 *   1. Heartbeat  — two detuned sines with gain-envelope "lub-dub" rhythm,
 *                   BPM and volume scale with intensity.
 *   2. Mental drone — two detuned sines (55 Hz / 58 Hz) + filtered white noise.
 *   3. Static bursts — random noise bursts above intensity 0.6, fires the
 *                      optional onStaticBurst callback on each burst.
 *
 * API:
 *   start()              — create AudioContext, build nodes, start oscillators
 *   setIntensity(0–1)    — update all gain / BPM values smoothly
 *   stop()               — fade master gain over 500 ms then close context
 */

import { useRef, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AudioNodes {
    ctx: AudioContext
    masterGain: GainNode

    // Heartbeat
    hbOsc1: OscillatorNode
    hbOsc2: OscillatorNode
    hbGain: GainNode

    // Drone
    droneOsc1: OscillatorNode
    droneOsc2: OscillatorNode
    droneGain: GainNode

    // Static bursts
    staticGain: GainNode
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create looping white-noise buffer source
// ─────────────────────────────────────────────────────────────────────────────

function createNoiseSource(ctx: AudioContext, durationSecs = 2): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * durationSecs
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    return source
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useWillpowerAudio(
    onStaticBurst?: () => void,
    volumeMultiplier = 1.0
) {
    const nodesRef = useRef<AudioNodes | null>(null)
    const intensityRef = useRef(0)
    const burstTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const stoppedRef = useRef(false)

    // ── Heartbeat scheduler ──────────────────────────────────────────────────
    // Schedules the gain envelope for a single "lub-dub" beat pair using
    // Web Audio parameter automation, then re-schedules itself via setTimeout.

    const scheduleHeartbeat = useCallback(() => {
        if (stoppedRef.current) return
        const nodes = nodesRef.current
        if (!nodes) return

        const { ctx, hbGain } = nodes
        const intensity = intensityRef.current
        const bpm = 60 + intensity * 100           // 60 – 160 BPM
        const beatInterval = 60 / bpm              // seconds per beat
        const peakGain = 0.05 + intensity * 0.55   // 0.05 – 0.60

        const now = ctx.currentTime
        const attackTime = 0.02
        const decayTime = 0.12

        // Lub
        hbGain.gain.cancelScheduledValues(now)
        hbGain.gain.setValueAtTime(0, now)
        hbGain.gain.linearRampToValueAtTime(peakGain, now + attackTime)
        hbGain.gain.linearRampToValueAtTime(0, now + attackTime + decayTime)

        // Dub (slightly softer, offset by 35% of the beat interval)
        const dubOffset = beatInterval * 0.35
        hbGain.gain.setValueAtTime(0, now + dubOffset)
        hbGain.gain.linearRampToValueAtTime(peakGain * 0.7, now + dubOffset + attackTime)
        hbGain.gain.linearRampToValueAtTime(0, now + dubOffset + attackTime + decayTime)

        // Re-schedule on the next beat (convert beat interval to ms)
        setTimeout(scheduleHeartbeat, beatInterval * 1000)
    }, [])

    // ── Static burst scheduler ───────────────────────────────────────────────

    const scheduleStaticBurst = useCallback(() => {
        if (stoppedRef.current) return
        const nodes = nodesRef.current
        if (!nodes) return

        const intensity = intensityRef.current

        if (intensity <= 0.6) {
            // Not yet active — check again in 500 ms
            burstTimeoutRef.current = setTimeout(scheduleStaticBurst, 500)
            return
        }

        const { ctx } = nodes

        // Duration: 50 – 150 ms
        const duration = 0.05 + Math.random() * 0.1

        // Build a one-shot noise buffer
        const burstBufferSize = Math.ceil(ctx.sampleRate * duration)
        const burstBuffer = ctx.createBuffer(1, burstBufferSize, ctx.sampleRate)
        const burstData = burstBuffer.getChannelData(0)
        for (let i = 0; i < burstBufferSize; i++) burstData[i] = Math.random() * 2 - 1

        const burstSource = ctx.createBufferSource()
        burstSource.buffer = burstBuffer

        // Volume: 0.05 – 0.2 scaled from intensity 0.6 – 1.0
        const t = (intensity - 0.6) / 0.4  // 0 → 1 within the range
        const burstVolume = (0.05 + t * 0.15) * volumeMultiplier
        const burstGain = ctx.createGain()
        burstGain.gain.value = burstVolume

        burstSource.connect(burstGain)
        burstGain.connect(nodes.masterGain)
        burstSource.start()

        onStaticBurst?.()

        // Next burst interval: 3000-8000 ms at intensity 0.6, 500-2000 ms at intensity 1.0
        const minInterval = 500 + (1 - t) * 2500       // 3000 → 500
        const maxInterval = 2000 + (1 - t) * 6000      // 8000 → 2000
        const nextInterval = minInterval + Math.random() * (maxInterval - minInterval)

        burstTimeoutRef.current = setTimeout(scheduleStaticBurst, nextInterval)
    }, [onStaticBurst, volumeMultiplier])

    // ── start ────────────────────────────────────────────────────────────────

    const start = useCallback(() => {
        if (nodesRef.current) return  // already running

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

            // Master gain
            const masterGain = ctx.createGain()
            masterGain.gain.value = volumeMultiplier
            masterGain.connect(ctx.destination)

            // ── Heartbeat ──────────────────────────────────────────────────
            const hbGain = ctx.createGain()
            hbGain.gain.value = 0
            hbGain.connect(masterGain)

            const hbOsc1 = ctx.createOscillator()
            hbOsc1.type = 'sine'
            hbOsc1.frequency.value = 1.0     // 1 Hz base
            hbOsc1.connect(hbGain)

            const hbOsc2 = ctx.createOscillator()
            hbOsc2.type = 'sine'
            hbOsc2.frequency.value = 1.02    // 1.02× slight detune
            hbOsc2.connect(hbGain)

            // ── Drone ──────────────────────────────────────────────────────
            const droneGain = ctx.createGain()
            droneGain.gain.value = 0         // starts silent
            droneGain.connect(masterGain)

            const droneOsc1 = ctx.createOscillator()
            droneOsc1.type = 'sine'
            droneOsc1.frequency.value = 55
            droneOsc1.connect(droneGain)

            const droneOsc2 = ctx.createOscillator()
            droneOsc2.type = 'sine'
            droneOsc2.frequency.value = 58
            droneOsc2.connect(droneGain)

            // Filtered noise for drone texture
            const droneNoise = createNoiseSource(ctx)
            const noiseFilter = ctx.createBiquadFilter()
            noiseFilter.type = 'lowpass'
            noiseFilter.frequency.value = 100
            noiseFilter.Q.value = 1
            const noiseGain = ctx.createGain()
            noiseGain.gain.value = 0.3       // noise sub-gain within drone
            droneNoise.connect(noiseFilter)
            noiseFilter.connect(noiseGain)
            noiseGain.connect(droneGain)

            // Static bursts will be created on demand; this gain anchors them
            const staticGain = ctx.createGain()
            staticGain.gain.value = 1
            staticGain.connect(masterGain)

            // Store nodes
            nodesRef.current = {
                ctx,
                masterGain,
                hbOsc1,
                hbOsc2,
                hbGain,
                droneOsc1,
                droneOsc2,
                droneGain,
                staticGain,
            }

            stoppedRef.current = false

            // Resume context if browser auto-suspended it
            if (ctx.state === 'suspended') ctx.resume()

            // Start oscillators
            hbOsc1.start()
            hbOsc2.start()
            droneOsc1.start()
            droneOsc2.start()
            droneNoise.start()

            // Kick off schedulers
            scheduleHeartbeat()
            scheduleStaticBurst()

        } catch {
            // Web Audio not available (SSR / old browser / headless test) — no-op
        }
    }, [scheduleHeartbeat, scheduleStaticBurst, volumeMultiplier])

    // ── setIntensity ─────────────────────────────────────────────────────────

    const setIntensity = useCallback((intensity: number) => {
        const v = Math.max(0, Math.min(1, intensity))
        intensityRef.current = v

        const nodes = nodesRef.current
        if (!nodes) return

        const { ctx, droneGain } = nodes
        const now = ctx.currentTime

        // Drone master gain: 0.0 → 0.35
        const droneTargetGain = v * 0.35 * volumeMultiplier
        droneGain.gain.setTargetAtTime(droneTargetGain, now, 0.3)

        // Note: heartbeat gain is driven by the scheduleHeartbeat envelope loop;
        // intensityRef is read fresh on each beat so BPM/volume update naturally.
    }, [volumeMultiplier])

    // ── stop ─────────────────────────────────────────────────────────────────

    const stop = useCallback(() => {
        stoppedRef.current = true

        // Cancel pending static burst
        if (burstTimeoutRef.current !== null) {
            clearTimeout(burstTimeoutRef.current)
            burstTimeoutRef.current = null
        }

        const nodes = nodesRef.current
        if (!nodes) return

        const { ctx, masterGain } = nodes

        // Fade master gain to 0 over 500 ms, then close context
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1)
        setTimeout(() => {
            try { ctx.close() } catch {}
            nodesRef.current = null
        }, 600)
    }, [])

    return { start, setIntensity, stop }
}
