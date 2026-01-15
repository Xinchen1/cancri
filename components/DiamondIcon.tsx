import React from 'react';
import { AgentStatus } from '../types';

interface DiamondIconProps {
  status: AgentStatus;
  className?: string;
  size?: number;
}

export const DiamondIcon: React.FC<DiamondIconProps> = ({ status, className = '', size = 16 }) => {
  // 根据状态设置颜色和发光效果
  const getStatusConfig = () => {
    switch (status) {
      case AgentStatus.VOICE_ACTIVE:
        return { color: '#22d3ee', glow: true, intensity: 'strong' };
      case AgentStatus.ROUTING:
        return { color: '#c084fc', glow: true, intensity: 'medium' };
      case AgentStatus.THINKING:
        return { color: '#7e22ce', glow: true, intensity: 'strong' };
      case AgentStatus.REFLECTING:
        return { color: '#fbbf24', glow: true, intensity: 'medium' };
      case AgentStatus.EVOLVING:
        return { color: '#f0abfc', glow: true, intensity: 'strong' };
      case AgentStatus.SPEAKING:
        return { color: '#22d3ee', glow: true, intensity: 'medium' };
      case AgentStatus.INDEXING:
        return { color: '#06b6d4', glow: true, intensity: 'medium' };
      case AgentStatus.IDLE:
      default:
        return { color: '#a855f7', glow: false, intensity: 'weak' };
    }
  };

  const config = getStatusConfig();
  const isBusy = status !== AgentStatus.IDLE && status !== AgentStatus.VOICE_ACTIVE;
  
  // 根据强度设置发光效果
  const getGlowFilter = () => {
    if (!config.glow) return 'none';
    const blur = config.intensity === 'strong' ? 6 : config.intensity === 'medium' ? 4 : 2;
    const spread = config.intensity === 'strong' ? 2 : config.intensity === 'medium' ? 1 : 0.5;
    return `drop-shadow(0 0 ${blur}px ${config.color}) drop-shadow(0 0 ${spread}px ${config.color})`;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${className} ${config.glow ? 'animate-pulse' : ''}`}
      style={{
        animationDuration: '2s',
        animationTimingFunction: 'ease-in-out',
      }}
    >
      {/* 钻石形状 - 外发光 */}
      <path
        d="M12 2 L18 8 L12 22 L6 8 Z"
        fill={config.color}
        fillOpacity={isBusy ? 0.7 : 0.4}
        stroke={config.color}
        strokeWidth="0.5"
        strokeOpacity={config.glow ? 0.8 : 0.4}
        style={{
          filter: getGlowFilter(),
          transition: 'all 0.3s ease',
        }}
      />
      {/* 内部高光 */}
      <path
        d="M12 4 L16 8 L12 18 L8 8 Z"
        fill="white"
        fillOpacity={config.glow ? 0.2 : 0.05}
        style={{
          transition: 'all 0.3s ease',
        }}
      />
    </svg>
  );
};

