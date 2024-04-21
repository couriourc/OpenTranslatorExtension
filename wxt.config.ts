import {defineConfig} from 'wxt';
import react from '@vitejs/plugin-react';
import Unocss from "unocss/vite";
import tailwindcss from "tailwindcss";
import postcssPresetMantine from "postcss-preset-mantine";
import postcssSimpleVars from "postcss-simple-vars";
//import {replaceCodePlugin} from "vite-plugin-replace";
import pkg from "./package.json";
import replace from "vite-plugin-filter-replace";
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
            replace([
                {
                    filter: /\.html$/,
                    replace: [
                        {
                            from: /<%\s*VITE_APP_TITLE\s*\/>/,
                            to: pkg.name
                        }
                    ]
                }
            ]),
        ],

        css: {
            postcss: {
                plugins: [
                    tailwindcss,
                    postcssPresetMantine,
                    postcssSimpleVars({
                        variables: {
                            'mantine-breakpoint-xs': '36em',
                            'mantine-breakpoint-sm': '48em',
                            'mantine-breakpoint-md': '62em',
                            'mantine-breakpoint-lg': '75em',
                            'mantine-breakpoint-xl': '88em',
                        },
                    }),
                ]
            }
        }
    }),

});
