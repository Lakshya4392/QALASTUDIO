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
        // Gemini API key for frontend AI service
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    admin: [
                      './components/admin/AdminDashboard',
                      './components/admin/AdminBookingsPage',
                      './components/admin/AdminStudiosPage',
                      './components/admin/AdminProjectsPage',
                      './components/admin/AdminEnquiriesPage',
                      './components/admin/AdminContentPage',
                      './components/admin/AdminSettingsPage',
                      './components/admin/AdminLayout',
                      './components/admin/AdminLogin',
                    ],
                },
            },
        },
        // Increase chunk size warning limit slightly for admin bundle
        chunkSizeWarningLimit: 600,
      },
    };
});
