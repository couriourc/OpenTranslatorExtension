import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
// See https://wxt.dev/api/config.html
export default defineConfig({
  dev: {
    reloadCommand: 'Alt+T',
  },
  manifest: {
    permissions: ['storage'],
  },
  vite: () => ({
    plugins: [
      react(),
    ],
  }),

});
