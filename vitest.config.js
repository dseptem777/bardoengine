import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Ensure story-config.json exists for tests
const storyConfigPath = path.resolve('src/story-config.json');
if (!fs.existsSync(storyConfigPath)) {
    fs.writeFileSync(storyConfigPath, JSON.stringify({
        storyId: 'test',
        title: 'Test Story',
        encrypted: false,
        buildTime: new Date().toISOString()
    }));
}

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/tests/setup.js'],
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: [
                'node_modules/',
                'src/tests/',
                '*.config.js',
                'src/main.jsx'
            ]
        }
    },
    resolve: {
        alias: {
            '@': path.resolve('src')
        }
    }
})
