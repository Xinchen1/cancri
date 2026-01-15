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
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: false, // 保留 console 用于调试 GitHub Pages
            drop_debugger: mode === 'production',
            pure_funcs: [], // 不删除任何函数，避免破坏代码
            passes: 1, // 减少压缩次数，避免过度混淆
            unsafe: false, // 禁用不安全的优化，避免破坏 Three.js
            unsafe_comps: false, // 禁用不安全的比较优化
            unsafe_math: false, // 禁用不安全的数学优化
            unsafe_methods: false, // 禁用不安全的方法优化
          },
          mangle: {
            properties: {
              regex: /^_/
            },
            toplevel: false, // 不混淆顶层变量，避免 undefined 问题
            reserved: ['d', 'delta', 'data', 'safeDelta', 'choices', 'content', 'json', 'state', 'clock', 'gl', 'scene', 'camera'], // 保留可能被访问的属性名
            keep_classnames: true, // 保留类名，避免 Three.js 相关问题
            keep_fnames: true, // 保留函数名，便于调试
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
