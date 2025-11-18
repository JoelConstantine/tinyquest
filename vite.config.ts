/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
export default defineConfig({
    base: '/tinyquest/',
    server: {
        open: true,
        host: true
    },
    test: {
        include: ['src/**/__tests__/**/*.tests.ts'],
    }
})