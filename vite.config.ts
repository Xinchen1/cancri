import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // 强制使用 /cancri/ 作为 base path（GitHub Pages 子目录部署）
    const base = '/cancri/';
    
    return {
      base,
      server: {
        port: 5000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: false, // 保留 console 用于调试 GitHub Pages
            drop_debugger: mode === 'production',
            pure_funcs: [], // 不删除任何函数，避免破坏代码
            passes: 1, // 减少压缩次数，避免过度混淆
          },
          mangle: {
            properties: {
              regex: /^_/
            },
            toplevel: false, // 不混淆顶层变量，避免 undefined 问题
            reserved: ['d', 'delta', 'data', 'safeDelta'], // 保留可能被访问的属性名
          },
          format: {
            comments: true, // 保留注释
          },
        },
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              three: ['three', '@react-three/fiber', '@react-three/drei'],
            },
            ...(mode === 'production' ? {
              chunkFileNames: 'assets/[hash].js',
              entryFileNames: 'assets/[hash].js',
              assetFileNames: 'assets/[hash].[ext]',
            } : {}),
          }
        },
        chunkSizeWarningLimit: 1000,
      },
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'https://cancri-api.xinhalle356.workers.dev')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
