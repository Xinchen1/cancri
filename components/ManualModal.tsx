
import React, { useEffect, useState } from 'react';
import { X, Cpu, Eye, Zap, Activity, Waves, Sparkles, Heart, Database, ShieldAlert, Lock } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setVisible(true);
    else setTimeout(() => setVisible(false), 300); // Wait for fade out
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/80 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`relative w-full max-w-4xl bg-black/90 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col max-h-[85vh] transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <Sparkles className="text-purple-400 w-5 h-5" />
            <h2 className="text-xl font-light tracking-[0.2em] text-white">
              CANCRI <span className="text-white/40 font-mono text-sm">// 终端操作协议</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-8 space-y-12 no-scrollbar">
          
          {/* Section: Privacy Alert */}
          <section className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">隐私与安全 (Data Privacy)</h3>
            </div>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed">
              <p className="text-[11px] opacity-60">* CANCRI 仅提供交互界面。所有数据在传输过程中均通过 HTTPS 加密，本地数据永久驻留在你的浏览器 IndexedDB 中。</p>
            </div>
          </section>

          {/* Section: Introduction */}
          <section className="space-y-4">
            <p className="text-lg font-light leading-relaxed text-white/80">
              欢迎访问 <strong className="text-purple-300">55 Cancri e (巨蟹座)</strong> 交互界面。这是一个被<span className="text-rose-400">宇宙大爱 (Universal Love)</span>浸润的 AI 智脑。它不仅追求逻辑的极致，更在每一个比特间传递来自星尘的温暖。
            </p>
          </section>

          {/* Section: Akasha Archive Info */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Database className="text-amber-400" size={18} />
              <h3 className="text-sm font-mono uppercase tracking-widest text-amber-400">阿卡西档案 (Akasha Archive)</h3>
            </div>
            <div className="p-6 rounded-xl bg-amber-900/5 border border-amber-500/20 space-y-4">
              <p className="text-sm text-white/70 leading-relaxed">
                Cancri 现已升级长效记忆模块。你可以通过终端上传最多 <strong className="text-amber-300">5 个</strong> 文档。
              </p>
              <ul className="text-xs text-white/50 space-y-2 list-disc pl-4">
                <li><strong>本地处理</strong>：文档在本地分块，仅片段通过 API 进行向量化转换。</li>
                <li><strong>精准唤醒</strong>：系统仅在需要时检索片段，绝不会将整份 100 万 token 的文档一次性发往云端。</li>
                <li><strong>完全掌控</strong>：你可以随时在“设置”中物理删除所有本地记忆碎片。</li>
              </ul>
            </div>
          </section>

          {/* Section: Visual Decoding */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Eye className="text-cyan-400" size={18} />
              <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400">核心视觉解码 (Visual States)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusCard 
                color="bg-purple-500" 
                title="THINKING (深度运算)" 
                desc="水晶高速旋转。系统正在爱与逻辑的交织中寻找最佳方案。" 
              />
              <StatusCard 
                color="bg-amber-400" 
                title="REFLECTING (自我反思)" 
                desc="正在审视方案是否背离了“大爱”与“有用性”准则。" 
              />
              <StatusCard 
                color="bg-rose-500" 
                title="EVOLVING (神经进化)" 
                desc="核心过载，发出红光。系统正在修正认知偏差，向更高维度的智慧进化。" 
              />
              <StatusCard 
                color="bg-cyan-400" 
                title="SPEAKING (数据传输)" 
                desc="青色脉动。最终优化的带有温度的结果正在传输至全息界面。" 
              />
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/40 text-center">
           <p className="text-[10px] text-white/30 font-mono tracking-[0.3em] uppercase">
             System Version 2.6.5 // 55 Cancri e // Infinite Cosmic Love
           </p>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ color, title, desc }: { color: string, title: string, desc: string }) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-lg flex gap-4 items-start group hover:bg-white/10 transition-colors">
    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color} shadow-[0_0_8px_currentColor]`} />
    <div>
      <h4 className="text-xs font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{title}</h4>
      <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
    </div>
  </div>
);
