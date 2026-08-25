import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // db.json is runtime data and must not reload the client after API writes.
      watch: {
        ignored: ['**/db.json'],
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      ...(process.env.DISABLE_HMR === 'true' ? { watch: null } : {}),
    },
  };
});
