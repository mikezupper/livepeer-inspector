import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [compression(), react(),],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@emotion/react', '@emotion/styled']
                },
            },
        },
    }
})
