import React, { useEffect, useState } from 'react';

export const LoadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [neuralActivity, setNeuralActivity] = useState('');

  const phases = [
    { name: 'Neural Core', percent: 20 },
    { name: 'Quantum Sync', percent: 45 },
    { name: 'Memory Matrix', percent: 70 },
    { name: 'Consciousness Link', percent: 90 },
    { name: 'Ready', percent: 100 },
  ];

  useEffect(() => {
    // 智能加载进度模拟
    let currentProgress = 0;
    let currentPhase = 0;
    
    const progressInterval = setInterval(() => {
      if (currentPhase < phases.length) {
        const targetPercent = phases[currentPhase].percent;
        const increment = Math.random() * 2 + 0.5; // 随机增量，模拟智能加载
        
        currentProgress = Math.min(currentProgress + increment, targetPercent);
        setProgress(currentProgress);
        
        // 检查是否达到当前阶段目标
        if (currentProgress >= targetPercent - 1) {
          currentProgress = targetPercent;
          setProgress(currentProgress);
          setPhase(currentPhase);
          
          if (currentPhase < phases.length - 1) {
            currentPhase++;
            // 阶段切换时稍作停顿，模拟智能处理
            setTimeout(() => {
              setPhase(currentPhase);
            }, 200);
          }
        }
      } else {
        clearInterval(progressInterval);
      }
    }, 50);

    // 神经活动动画
    const neuralPatterns = ['◉', '◈', '◊', '◉', '◈'];
    const neuralInterval = setInterval(() => {
      setNeuralActivity(neuralPatterns[Math.floor(Math.random() * neuralPatterns.length)]);
    }, 300);

    return () => {
      clearInterval(progressInterval);
      clearInterval(neuralInterval);
    };
  }, []);

  const currentPhaseName = phases[phase]?.name || phases[0].name;

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

      {/* 进度条容器 */}
      <div className="w-[85vw] sm:w-96 md:w-[500px] max-w-[90vw]">
        {/* 当前阶段显示 */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-purple-400 text-lg sm:text-xl animate-pulse">{neuralActivity}</span>
            <p className="text-xs sm:text-sm text-purple-400/90 font-mono tracking-widest uppercase">
              {currentPhaseName}
            </p>
          </div>
        </div>

        {/* 进度条背景 */}
        <div className="relative h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
          {/* 进度条填充 - 渐变效果 */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-cyan-400 via-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundSize: '300% 100%',
              animation: progress < 100 ? 'shimmer 3s infinite' : 'none',
              boxShadow: `0 0 ${progress * 0.2}px rgba(168, 85, 247, 0.6), 0 0 ${progress * 0.4}px rgba(34, 211, 238, 0.4)`,
            }}
          />
          {/* 发光光晕 */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full blur-md"
            style={{
              width: `${progress}%`,
              transform: `translateX(${Math.max(0, progress - 10)}%)`,
              transition: 'transform 0.5s ease-out',
            }}
          />
          {/* 进度点 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500"
            style={{
              left: `${progress}%`,
              transform: `translate(calc(-50% + ${progress}%), -50%)`,
            }}
          />
        </div>

        {/* 进度百分比和状态 */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-lg sm:text-xl text-white font-mono font-light mb-1">
            {Math.round(progress)}<span className="text-white/40 text-sm">%</span>
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {phases.map((p, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i <= phase
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                    : 'bg-white/20'
                }`}
              />
            ))}
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

