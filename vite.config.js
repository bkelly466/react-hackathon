import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jishoapi': {
        target: 'https://jisho.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jishoapi/, '/api/v1/search/words'),
      },
    },
  },
  // Vitest reads this `test` field. We only test pure logic (no DOM), so the
  // default Node environment is fine — no jsdom dependency needed.
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
  },
});