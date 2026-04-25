import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    server: {
        port: 8080,
        headers: {
            "Content-Security-Policy": "script-src 'self' 'unsafe-eval';",
            "Cache-Control": "public, max-age=31536000, immutable"
        }
    }
});
