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
        minify: mode === 'production' ? 'terser' : false, // 开发环境不压缩
        terserOptions: mode === 'production' ? {
          compress: {
            drop_console: false, // 保留 console 用于调试
            drop_debugger: false, // 保留 debugger
            pure_funcs: [], // 不删除任何函数
            passes: 1, // 只压缩一次，避免过度优化
            unsafe: false, // 禁用所有不安全优化
            unsafe_comps: false,
            unsafe_math: false,
            unsafe_methods: false,
            unsafe_proto: false,
            unsafe_regexp: false,
            unsafe_undefined: false,
            collapse_vars: false, // 不折叠变量，避免 Three.js 问题
            reduce_vars: false, // 不减少变量
          },
          mangle: {
            properties: {
              regex: /^_/ // 只混淆以下划线开头的属性
            },
            toplevel: false, // 不混淆顶层变量
            reserved: [
              'd', 'delta', 'data', 'safeDelta', 
              'choices', 'content', 'json', 
              'state', 'clock', 'gl', 'scene', 'camera',
              'getElapsedTime', 'lerp', 'getContext',
              'useFrame', 'Canvas', 'mesh', 'material'
            ], // 保留所有可能被访问的属性名和方法名
            keep_classnames: true, // 保留类名
            keep_fnames: true, // 保留函数名
          },
          format: {
            comments: true, // 保留注释
            beautify: false, // 不美化代码
          },
        } : {},
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
