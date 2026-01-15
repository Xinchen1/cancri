import React from 'react';
import { AgentStatus } from '../types';

interface DiamondIconProps {
  status: AgentStatus;
  className?: string;
  size?: number;
}

export const DiamondIcon: React.FC<DiamondIconProps> = ({ status, className = '', size = 20 }) => {
  // 根据状态设置颜色和动画
  const getStatusConfig = () => {
    switch (status) {
      case AgentStatus.VOICE_ACTIVE:
        return { color: '#22d3ee', pulse: true, rotate: true };
      case AgentStatus.ROUTING:
        return { color: '#c084fc', pulse: true, rotate: false };
      case AgentStatus.THINKING:
        return { color: '#7e22ce', pulse: true, rotate: true };
      case AgentStatus.REFLECTING:
        return { color: '#fbbf24', pulse: true, rotate: false };
      case AgentStatus.EVOLVING:
        return { color: '#f0abfc', pulse: true, rotate: true };
      case AgentStatus.SPEAKING:
        return { color: '#22d3ee', pulse: true, rotate: true };
      case AgentStatus.INDEXING:
        return { color: '#06b6d4', pulse: true, rotate: true };
      case AgentStatus.IDLE:
      default:
        return { color: '#a855f7', pulse: false, rotate: false };
    }
  };

  const config = getStatusConfig();
  const isBusy = status !== AgentStatus.IDLE && status !== AgentStatus.VOICE_ACTIVE;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${className} ${config.pulse ? 'animate-pulse' : ''} ${config.rotate ? 'animate-spin' : ''}`}
      style={{
        animationDuration: config.rotate ? '3s' : '2s',
        animationTimingFunction: 'ease-in-out',
      }}
    >
      {/* 钻石形状 */}
      <path
        d="M12 2 L18 8 L12 22 L6 8 Z"
        fill={config.color}
        fillOpacity={isBusy ? 0.8 : 0.5}
        stroke={config.color}
        strokeWidth="1"
        strokeOpacity={0.6}
        style={{
          filter: isBusy ? `drop-shadow(0 0 4px ${config.color})` : 'none',
          transition: 'all 0.3s ease',
        }}
      />
      {/* 内部高光 */}
      <path
        d="M12 4 L16 8 L12 18 L8 8 Z"
        fill="white"
        fillOpacity={isBusy ? 0.3 : 0.1}
        style={{
          transition: 'all 0.3s ease',
        }}
      />
    </svg>
  );
};

