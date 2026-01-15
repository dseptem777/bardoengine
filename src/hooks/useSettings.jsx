import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ============================================
// DEFAULT SETTINGS
// ============================================
const DEFAULT_SETTINGS = {
    // Audio
    musicVolume: 40,    // 0-100
    sfxVolume: 70,      // 0-100

    // Text
    typewriterSpeed: 3, // 0=instant, 1=60ms, 2=45ms, 3=30ms, 4=20ms, 5=10ms
    autoAdvance: false,
    autoAdvanceDelay: 4, // seconds (2-10)

    // Accessibility
    vfxEnabled: true,
    fontSize: 'normal', // 'small' | 'normal' | 'large'
}

// Speed mapping: setting value -> milliseconds delay
const SPEED_MAP = {
    0: 0,    // Instant
    1: 60,   // Very slow
    2: 45,   // Slow
    3: 30,   // Normal (default)
    4: 20,   // Fast
    5: 10,   // Very fast
}

const STORAGE_KEY_PREFIX = 'bardoengine_settings'

// Helper to get storage key for a story
const getStorageKey = (storyId) => {
    if (!storyId) return STORAGE_KEY_PREFIX // Fallback for when no story is selected
    return `${STORAGE_KEY_PREFIX}_${storyId}`
}

// Helper to load settings from localStorage
const loadSettings = (storyId) => {
    try {
        const key = getStorageKey(storyId)
        const saved = localStorage.getItem(key)
        if (saved) {
            const parsed = JSON.parse(saved)
            return { ...DEFAULT_SETTINGS, ...parsed }
        }
    } catch (e) {
        console.warn('[Settings] Failed to load settings:', e)
    }
    return DEFAULT_SETTINGS
}

// ============================================
// CONTEXT
// ============================================
const SettingsContext = createContext(null)

// ============================================
// PROVIDER
// ============================================
export function SettingsProvider({ children, storyId }) {
    const [settings, setSettings] = useState(() => loadSettings(storyId))
    const [currentStoryId, setCurrentStoryId] = useState(storyId)

    const [isFullscreen, setIsFullscreen] = useState(false)

    // When storyId changes, load the new story's settings
    useEffect(() => {
        if (storyId !== currentStoryId) {
            console.log(`[Settings] Switching from '${currentStoryId}' to '${storyId}'`)
            setCurrentStoryId(storyId)
            setSettings(loadSettings(storyId))
        }
    }, [storyId, currentStoryId])

    // Persist to localStorage whenever settings change
    useEffect(() => {
        if (!currentStoryId) return // Don't save if no story is selected
        try {
            const key = getStorageKey(currentStoryId)
            localStorage.setItem(key, JSON.stringify(settings))
            console.log(`[Settings] Saved to ${key}`)
        } catch (e) {
            console.warn('[Settings] Failed to save settings:', e)
        }
    }, [settings, currentStoryId])

    // Track fullscreen state
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        // Initial check
        setIsFullscreen(!!document.fullscreenElement)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    // Update a single setting
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }, [])

    // Reset all settings to defaults
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS)
    }, [])

    // Toggle fullscreen
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen()
            } else {
                await document.exitFullscreen()
            }
        } catch (e) {
            console.warn('[Settings] Fullscreen toggle failed:', e)
        }
    }, [])

    // Get typewriter delay in ms from speed setting
    const getTypewriterDelay = useCallback(() => {
        return SPEED_MAP[settings.typewriterSpeed] ?? SPEED_MAP[3]
    }, [settings.typewriterSpeed])

    // Convert volume 0-100 to 0-1 for Howler
    const getMusicVolume = useCallback(() => {
        return settings.musicVolume / 100
    }, [settings.musicVolume])

    const getSfxVolume = useCallback(() => {
        return settings.sfxVolume / 100
    }, [settings.sfxVolume])

    const value = {
        settings,
        updateSetting,
        resetSettings,
        isFullscreen,
        toggleFullscreen,
        getTypewriterDelay,
        getMusicVolume,
        getSfxVolume,
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

// ============================================
// HOOK
// ============================================
export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
