
import React from 'react';
import { Database, Loader2, Cpu, Brain, Zap } from 'lucide-react';

interface IndexingOverlayProps {
  isVisible: boolean;
  progress: number;
  fileName: string;
  stats?: { current: number, total: number };
}

export const IndexingOverlay: React.FC<IndexingOverlayProps> = ({ isVisible, progress, fileName, stats }) => {
  if (!isVisible) return null;

  const getStage = () => {
    if (progress < 15) return "Synchronizing Data Streams...";
    if (progress < 95) return "Neural Semantic Analysis...";
    return "Finalizing Akasha Integration...";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg p-10 space-y-10 text-center">
        
        {/* Holographic Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-cyan-500/10 blur-[100px] -z-10" />
        
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute -inset-6 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 bg-black/40 border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-hidden">
               {progress < 15 ? (
                 <Database className="text-cyan-400 animate-bounce" size={40} />
               ) : (
                 <Brain className="text-purple-400 animate-pulse" size={40} />
               )}
               <div className="absolute bottom-0 w-full bg-cyan-500/10 h-1/2 animate-[pulse_2s_infinite]" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-light tracking-[0.4em] text-white uppercase">Neural Archiving</h2>
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full mx-auto w-fit">
               <Zap size={10} className="text-amber-400" />
               <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono truncate max-w-[200px]">
                 {fileName}
               </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-end text-[10px] font-mono uppercase tracking-widest">
            <div className="flex flex-col items-start gap-1">
               <span className="text-white/30 text-[8px]">Current Matrix State</span>
               <span className="text-cyan-400 flex items-center gap-2">
                 <Cpu size={12} className="animate-spin-slow" /> {getStage()}
               </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-white/30 text-[8px]">Analysis Progress</span>
              <span className="text-purple-400 font-bold text-sm">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div 
              className="absolute inset-y-0.5 left-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              style={{ width: `calc(${progress}% - 4px)` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {stats && stats.total > 0 && (
            <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-white/30 uppercase tracking-widest pt-2">
               <div className="flex items-center gap-1.5">
                 <span className="text-white/60">Fragment:</span>
                 <span className="text-white/90 font-bold">{stats.current}</span>
                 <span className="opacity-40">/</span>
                 <span className="opacity-40">{stats.total}</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-white/10" />
               <div className="flex items-center gap-1.5">
                 <span className="text-white/60">Status:</span>
                 <span className={stats.current === stats.total ? 'text-emerald-400' : 'text-purple-400 animate-pulse'}>
                   {stats.current === stats.total ? 'Sync Complete' : 'Calculating Vectors'}
                 </span>
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 text-white/20 border-t border-white/5 pt-8">
          <Loader2 size={14} className="animate-spin text-purple-500/50" />
          <span className="text-[10px] uppercase tracking-[0.5em] font-light">Evolving Cosmic Memory</span>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
