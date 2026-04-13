import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { createRequire } from 'module'
import fs from 'fs'

const require = createRequire(import.meta.url)

function inkWatchPlugin() {
    function compileInk(inkPath, server) {
        const { Compiler } = require('inkjs/compiler/Compiler')
        const name = path.basename(inkPath, '.ink')
        const outPath = path.resolve(path.dirname(inkPath), `src/stories/${name}.json`)
        try {
            const source = fs.readFileSync(inkPath, 'utf8')
            const compiler = new Compiler(source)
            const story = compiler.Compile()
            fs.writeFileSync(outPath, story.ToJson())
            console.log(`\n[ink] ✅ ${name}.ink → src/stories/${name}.json`)
            server?.ws.send({ type: 'full-reload' })
        } catch (e) {
            console.error(`\n[ink] ❌ ${name}.ink: ${e.message}`)
        }
    }

    return {
        name: 'ink-watch',
        configureServer(server) {
            const inkGlob = path.resolve(__dirname, '*.ink')
            server.watcher.add(inkGlob)
            server.watcher.on('change', (file) => {
                if (file.endsWith('.ink')) compileInk(file, server)
            })
        }
    }
}

// Detect Tauri mobile environment
const isTauriMobile = process.env.TAURI_ENV_PLATFORM === 'android' || process.env.TAURI_ENV_PLATFORM === 'ios'
const isEditorStandalone = process.env.VITE_EDITOR_STANDALONE === '1'

export default defineConfig({
    plugins: [
        react(),
        inkWatchPlugin()
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

    // For standalone editor builds, swap main.jsx → editor-main.jsx
    resolve: isEditorStandalone ? {
        alias: {
            '/src/main.jsx': path.resolve(__dirname, 'src/editor-main.jsx')
        }
    } : {},

    build: {
        // Tauri uses Chromium on Windows/Linux and WebKit on macOS/Android
        // Targeting ES2021 for good mobile browser support
        target: process.env.TAURI_ENV_PLATFORM === 'android' ? 'es2021' : 'modules',
        // Don't produce sourcemaps for production mobile builds
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
        rollupOptions: {
            output: {
                manualChunks: isEditorStandalone
                    ? undefined
                    : {
                        vendor: ['react', 'react-dom', 'framer-motion', 'howler'],
                        inkjs: ['inkjs']
                    }
            }
        }
    }
})
