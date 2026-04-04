import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, '.', '');

    const plugins = [react()];

    // Add bundle analyzer when BUILD_ANALYZE is set
    if (env.BUILD_ANALYZE === 'true') {
        plugins.push(
            visualizer({
                filename: 'dist/bundle-analysis.html',
                gzipSize: true,
                brotliSize: true,
                open: false,
            })
        );
    }

    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins,
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || env.API_URL || 'http://localhost:3001/api')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
            output: {
                // Ensure clean output for better analysis
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
      },
    };
});
