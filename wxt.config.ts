import {defineConfig} from 'wxt';
import react from '@vitejs/plugin-react';
import Unocss from "unocss/vite";
import tailwindcss from "tailwindcss";
// vite.config.js
// See https://wxt.dev/api/config.html
export default defineConfig({
    dev: {
        reloadCommand: 'Alt+T',
    },
    manifest: {
        name: '__MSG_extName__',
        description: '__MSG_extDescription__',
        default_locale: 'en',
        permissions: ['storage', "contextMenus", 'webRequest'],
        commands: {
            'open-option': {
                suggested_key: {
                    default: 'Ctrl+Shift+Y',
                    mac: 'Command+Shift+Y',
                },
                description: 'Open the option',
            },
        }
    },
    vite: () => ({
        plugins: [
            react(),
            Unocss({}),
        ],

        css: {
            postcss: {
                plugins: [
                    tailwindcss,
                ]
            }
        }
    }),

});
