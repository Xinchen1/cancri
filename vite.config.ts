import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Vercel 总是使用根路径，GitHub Pages 使用子目录
    // 检查多个可能的 Vercel 环境变量，或者通过 CI 环境判断
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL || 
                     (process.env.CI && !process.env.GITHUB_REPOSITORY);
    // 如果明确设置了 BASE_PATH，使用它；否则根据环境判断
    const base = process.env.BASE_PATH || (isVercel ? '/' : '/cancri/');
    
    // 开发环境输出 base path 用于调试
    if (mode === 'development') {
      console.log('[Vite Config] Base path:', base, 'Vercel:', isVercel, 'CI:', process.env.CI);
    }
    
    return {
      base,
      server: {
        port: 5000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss({
          minify: mode === 'production', // 生产环境启用压缩
        }),
      ],
      build: {
        // 完全禁用压缩，避免 Three.js 相关问题
        minify: false,
        terserOptions: {},
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
