import React, { useEffect, useState } from 'react';

export const LoadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [intelligence, setIntelligence] = useState(0);

  useEffect(() => {
    // 快速加载到 90%
    setProgress(90);
    
    // 模拟智能加载进度
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          return prev; // 保持在 98%，等待实际加载完成
        }
        // 智能进度：越接近完成越慢
        const remaining = 100 - prev;
        const increment = remaining > 5 ? Math.random() * 2 + 0.5 : Math.random() * 0.3 + 0.1;
        return Math.min(prev + increment, 98);
      });
    }, 200);

    // 智能指数动画（0-100）
    const intelligenceInterval = setInterval(() => {
      setIntelligence((prev) => {
        if (prev >= 100) return 0; // 循环显示
        return prev + Math.random() * 3 + 1;
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(intelligenceInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]">
      {/* 主标题 */}
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extralight tracking-[0.2em] text-white mb-2">
          CANCRI
        </h1>
        <p className="text-[9px] sm:text-[10px] text-purple-400 font-mono tracking-widest opacity-80">
          // 55-E
        </p>
      </div>

      {/* 智能进度条容器 */}
      <div className="w-[85vw] sm:w-96 max-w-[500px]">
        {/* 智能指数显示 */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-purple-500/30 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-cyan-400 font-mono tracking-wider">
              INTELLIGENCE: {Math.round(intelligence)}%
            </span>
          </div>
        </div>

        {/* 主进度条 */}
        <div className="relative mb-4">
          {/* 进度条背景 */}
          <div className="relative h-2 sm:h-2.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            {/* 进度条填充 - 渐变效果 */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-cyan-400 via-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundSize: '300% 100%',
                animation: progress < 100 ? 'shimmer 3s infinite' : 'none',
                boxShadow: `0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)`,
              }}
            />
            {/* 发光光晕 */}
            <div
              className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full blur-md"
              style={{
                transform: `translateX(calc(${progress}% - 1rem))`,
                transition: 'transform 0.5s ease-out',
              }}
            />
            {/* 粒子效果 */}
            <div
              className="absolute top-1/2 left-0 w-2 h-2 bg-cyan-400 rounded-full blur-sm"
              style={{
                transform: `translate(calc(${progress}% - 0.5rem), -50%)`,
                transition: 'transform 0.5s ease-out',
                boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
              }}
            />
          </div>
        </div>

        {/* 进度百分比和状态 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-left">
            <p className="text-xs sm:text-sm text-white/40 font-mono uppercase tracking-wider">
              Neural Core
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl text-cyan-400 font-mono font-light tabular-nums">
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        {/* 智能加载状态 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs text-purple-400/60 font-mono tracking-widest">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span>INITIALIZING</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2 + 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -300% 0;
          }
          100% {
            background-position: 300% 0;
          }
        }
      `}</style>
    </div>
  );
};

