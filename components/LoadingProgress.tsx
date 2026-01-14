import React, { useEffect, useState } from 'react';

export const LoadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // 快速加载到 90%
    setProgress(90);
    
    // 模拟加载进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return prev; // 保持在 95%，等待实际加载完成
        }
        return prev + Math.random() * 3;
      });
    }, 300);

    // 动画点
    const dotInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]">
      {/* 主标题 */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-extralight tracking-[0.2em] text-white mb-2">
          CANCRI
        </h1>
        <p className="text-[10px] text-purple-400 font-mono tracking-widest opacity-80">
          // 55-E
        </p>
      </div>

      {/* 进度条容器 */}
      <div className="w-64 sm:w-96 max-w-[90vw]">
        {/* 进度条背景 */}
        <div className="relative h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          {/* 进度条填充 */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              backgroundSize: '200% 100%',
              animation: progress < 100 ? 'shimmer 2s infinite' : 'none',
            }}
          />
          {/* 发光效果 */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full blur-sm"
            style={{
              width: `${progress}%`,
              transform: `translateX(${progress}%)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </div>

        {/* 进度百分比 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-white/60 font-mono">
            {Math.round(progress)}%
          </p>
        </div>

        {/* 加载文字 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-purple-400/80 font-mono tracking-widest uppercase">
            Initializing Neural Core{dots}
          </p>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

