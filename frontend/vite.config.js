import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Strip console.* / debugger statements from the production bundle only —
  // `npm run dev` keeps them so local debugging still works normally.
  esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : {},
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
}));
