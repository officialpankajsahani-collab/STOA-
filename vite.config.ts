import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // Ensure file system watchers properly detect changes in container environments
      watch: {
        usePolling: true,
        interval: 100,
      },
      // Refined HMR client configuration to better support cross-platform containerized environments
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        protocol: process.env.HMR_PROTOCOL || undefined,
        host: process.env.HMR_HOST || undefined,
        clientPort: process.env.HMR_CLIENT_PORT ? Number(process.env.HMR_CLIENT_PORT) : undefined,
        path: process.env.HMR_PATH || undefined,
        overlay: true,
      },
    },
  };
});
