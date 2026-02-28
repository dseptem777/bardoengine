/**
 * Vitest Setup File
 * Global test configuration and mocks for BardoEngine
 */

import '@testing-library/jest-dom'

// ============================================
// LocalStorage Mock
// ============================================
const localStorageMock = (() => {
    let store = {}
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { store = {} },
        get length() { return Object.keys(store).length },
        key: (i) => Object.keys(store)[i] || null
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// ============================================
// Clipboard Mock
// ============================================
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue('')
    },
    writable: true
})

// ============================================
// ResizeObserver Mock
// ============================================
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// ============================================
// Console Cleanup (optional: silence test output)
// ============================================
// Uncomment to silence console during tests:
// vi.spyOn(console, 'log').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})

// ============================================
// Reset mocks before each test
// ============================================
beforeEach(() => {
    localStorage.clear()
})

// ============================================
// Audio Mock (Howler.js)
// ============================================
vi.mock('howler', () => {
    // Must use regular function (not arrow) so it can be called with `new`
    const MockHowl = vi.fn(function () {
        this.play = vi.fn()
        this.pause = vi.fn()
        this.stop = vi.fn()
        this.fade = vi.fn()
        this.volume = vi.fn().mockReturnValue(0.5)
        this.unload = vi.fn()
        this.on = vi.fn()
        this.playing = vi.fn().mockReturnValue(false)
    })

    return {
        Howl: MockHowl,
        Howler: {
            volume: vi.fn()
        }
    }
})
