import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Cloudflare Pages 和 Vercel 使用根路径，GitHub Pages 使用子目录
    // 检查多个可能的环境变量
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL;
    const isCloudflare = process.env.CF_PAGES || process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_URL;
    const isGitHubPages = process.env.GITHUB_PAGES || (process.env.CI && process.env.GITHUB_REPOSITORY);
    // 如果明确设置了 BASE_PATH，使用它；否则根据环境判断
    const base = process.env.BASE_PATH || (isVercel || isCloudflare ? '/' : (isGitHubPages ? '/cancri/' : '/'));
    
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
          minify: false, // 禁用 Tailwind CSS 压缩，避免错误
          base: mode === 'production' ? false : undefined, // 生产环境禁用 CDN
        }),
      ],
      build: {
        // 完全禁用压缩，避免 Three.js 相关问题
        minify: false,
        terserOptions: {},
        cssMinify: false, // 禁用 CSS 压缩
        sourcemap: true, // 启用 sourcemap 以便调试
        rollupOptions: {
          output: {
            // 禁用所有代码转换和压缩
            compact: false,
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
