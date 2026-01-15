
import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../types';
import { Terminal, CheckCircle2, AlertCircle, Cpu, ChevronRight, ChevronLeft } from 'lucide-react';

interface LogsOverlayProps {
  logs: LogEntry[];
}

export const LogsOverlay: React.FC<LogsOverlayProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  if (logs.length === 0) return null;

  return (
    <div className={`fixed top-24 right-6 transition-all duration-500 z-40 flex flex-col items-end ${isExpanded ? 'w-80' : 'w-12'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-3 rounded-full border backdrop-blur-md transition-all duration-300 shadow-lg ${
          isExpanded ? 'bg-purple-900/40 border-purple-500/50 text-white' : 'bg-black/60 border-white/10 text-white/40 hover:text-white'
        }`}
      >
        {isExpanded ? <ChevronRight size={18} /> : <Terminal size={18} />}
      </button>

      <div className={`mt-4 w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 font-mono text-[10px] overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${
        isExpanded ? 'h-[60vh] opacity-100 scale-100' : 'h-0 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between mb-3 text-white/60 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
              <Terminal size={12} />
              <span className="uppercase tracking-widest text-[9px]">Neural Streams</span>
          </div>
          <span className="text-[8px] opacity-40">ACTIVE_CORE</span>
        </div>
        
        <div className="overflow-y-auto no-scrollbar flex-1 space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="mt-0.5 shrink-0">
                 {log.status === 'success' && <CheckCircle2 size={12} className="text-emerald-400" />}
                 {log.status === 'warning' && <Cpu size={12} className="text-amber-400" />}
                 {log.status === 'error' && <AlertCircle size={12} className="text-rose-500" />}
                 {log.status === 'info' && <div className="w-2.5 h-2.5 rounded-full border border-white/30" />}
               </div>
               <div>
                 <div className="flex items-center gap-2">
                   <span className={`uppercase font-bold ${
                     log.status === 'success' ? 'text-emerald-400' : 
                     log.status === 'warning' ? 'text-amber-400' :
                     log.status === 'error' ? 'text-rose-400' : 'text-blue-300'
                   }`}>{log.step}</span>
                 </div>
                 <p className="text-white/70 leading-tight mt-0.5">{log.details}</p>
               </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
