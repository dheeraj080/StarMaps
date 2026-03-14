import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react(), tailwindcss()],
    esbuild: {
      target: 'es2022',
    },
    build: {
      target: 'es2022',
      // This increases the limit slightly to be more realistic for map apps
      chunkSizeWarningLimit: 1100, 
      rollupOptions: {
        output: {
          // Splitting heavy dependencies into their own chunks
          manualChunks: {
            'map-engine': ['maplibre-gl'],
            'vendor-ui': ['motion', 'lucide-react'],
          },
        },
      },
      commonjsOptions: {
        include: [/maplibre-gl/, /node_modules/],
      },
    },
    optimizeDeps: {
      include: ['maplibre-gl'],
      esbuildOptions: {
        target: 'es2022',
      }
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});