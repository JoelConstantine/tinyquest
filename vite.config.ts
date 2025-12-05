/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
export default defineConfig({
    base: '/tinyquest/',
    plugins: [
        vue(),
        vueDevTools(),
    ],
    resolve: {
        alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        open: true,
        host: true
    },
    test: {
        include: ['src/**/__tests__/**/*.tests.ts'],
    }
})