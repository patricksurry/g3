/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// The contrib gallery freezes time at 2025-12-28T12:34:56-05:00 and the clocks draw local time,
// so run tests in the timezone the SVG snapshots were generated in, whatever the machine's own.
process.env.TZ = 'America/New_York';

export default defineConfig({
  server: {
    open: '/src/index.html',
  },
  test: {
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.html'],
    },
  },
});
