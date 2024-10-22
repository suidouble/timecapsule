import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {
    console.log(command);
    console.log(mode);
    
    return {
            root: '',
            publicDir: '../public',
            resolve: {
                alias: {
                    components: path.join(__dirname, 'src/components'),
                    forms: path.join(__dirname, 'src/forms'),
                    classes: path.join(__dirname, 'src/classes'),
                    shared: path.join(__dirname, '../shared'),
                },
            },
            plugins: [
                    vue({
                        template: { transformAssetUrls }
                    }),
                    quasar({}),
                ],
            optimizeDeps: {
                force: true,
                // exclude: ['vue-sui', 'suidouble'],
            },
            // build: {
            //     rollupOptions: {
            //         output: {
            //             entryFileNames: `assets/[name].js`,
            //             chunkFileNames: `assets/[name].js`,
            //             assetFileNames: `assets/[name].[ext]`,
            //         },
            //     },
            // },
        };
});