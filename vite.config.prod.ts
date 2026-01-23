import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production build config with maximum obfuscation
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 3, // Multiple compression passes
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
        // Obfuscate chunk names
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});



