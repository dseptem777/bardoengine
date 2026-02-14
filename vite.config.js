import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Detect Tauri mobile environment
const isTauriMobile = process.env.TAURI_ENV_PLATFORM === 'android' || process.env.TAURI_ENV_PLATFORM === 'ios'

export default defineConfig({
    plugins: [
        react()
    ],

    // Prevent Vite from clearing Tauri's log output
    clearScreen: false,

    server: {
        // Required for Tauri Android: dev server must be accessible from device/emulator
        host: isTauriMobile ? '0.0.0.0' : 'localhost',
        port: 5173,
        strictPort: true,
    },

    // Set env prefix for Tauri env vars
    envPrefix: ['VITE_', 'TAURI_ENV_*'],

    build: {
        // Tauri uses Chromium on Windows/Linux and WebKit on macOS/Android
        // Targeting ES2021 for good mobile browser support
        target: process.env.TAURI_ENV_PLATFORM === 'android' ? 'es2021' : 'modules',
        // Don't produce sourcemaps for production mobile builds
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'framer-motion', 'howler'],
                    inkjs: ['inkjs']
                }
            }
        }
    }
})
