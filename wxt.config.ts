import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import Unocss from "unocss/vite";
// See https://wxt.dev/api/config.html
export default defineConfig({
  dev: {
    reloadCommand: 'Alt+T',
  },
  manifest: {
    permissions: ['storage', "contextMenus"],
  },
  vite: () => ({
    plugins: [
      react(),
      Unocss(),
    ],
  }),

});
