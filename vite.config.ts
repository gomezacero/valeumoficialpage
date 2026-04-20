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
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase-core': ['firebase/app'],
            'firebase-firestore': ['firebase/firestore'],
            'firebase-analytics': ['firebase/analytics'],
            'three': ['three', '@react-three/fiber', '@react-three/drei'],
            'motion': ['motion', 'motion/react'],
          },
        },
      },
    },
  };
});
