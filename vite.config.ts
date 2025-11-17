/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
export default defineConfig({
    base: '/tinyquest/',
    test: {
        include: ['src/modules/__tests__/**/*.tests.ts'],
    }
})