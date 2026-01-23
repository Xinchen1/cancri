
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Bot, User, FileText, ChevronDown, ChevronUp, Scale, Zap, Loader2 } from 'lucide-react';
import { formatMessage } from './MessageFormatter';

interface ConversationProps {
  messages: Message[];
}

export const Conversation: React.FC<ConversationProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.map(m => m.content + (m.metadata?.debate?.critique || '')).join('')]); 

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-0 right-0 flex justify-center bottom-32 sm:bottom-40 md:bottom-32 z-10 overflow-hidden pointer-events-none px-2 sm:px-6">
      <div className="w-full max-w-2xl">
      <div className="absolute inset-0 pointer-events-auto overflow-y-auto no-scrollbar px-4 sm:px-6 space-y-6 [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_90%,transparent)]">
        <div className="h-6 sm:h-4" /> 
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Bot size={16} className="text-purple-300" />
              </div>
            )}
            
            <div className={`max-w-[85%] sm:max-w-[90%] space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
              {/* Debate Metadata Display - NOW DYNAMIC */}
              {msg.metadata?.debate && <DebateBox debate={msg.metadata.debate} isGenerating={!msg.content} />}

              <div className={`p-3 sm:p-4 rounded-2xl backdrop-blur-md border text-sm font-light leading-relaxed shadow-lg tracking-wide ${
                msg.role === 'user' 
                  ? 'bg-white/5 border-white/10 text-white/90 rounded-tr-none whitespace-pre-wrap' 
                  : msg.role === 'system'
                  ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-100 font-mono text-[11px] whitespace-pre-wrap'
                  : 'bg-black/60 border-purple-500/30 text-purple-50 rounded-tl-none shadow-[0_0_20px_rgba(126,34,206,0.1)]'
              }`}>
                {msg.role === 'assistant' && msg.content ? (
                  <div className="prose prose-invert prose-purple max-w-none">
                    {formatMessage(msg.content)}
                  </div>
                ) : (
                  <>
                {msg.content}
                {msg.role === 'assistant' && !msg.content && !msg.metadata?.debate && (
                  <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse align-middle" />
                    )}
                  </>
                )}
              </div>
              
              {msg.metadata?.modelUsed && (
                <div className="text-[10px] text-white/20 font-mono pl-1 flex items-center gap-2">
                   <span>❖ {msg.metadata.isDeepThinking ? 'CANCRI-LARGE' : 'CANCRI-FAST'}</span> 
                   {msg.metadata.provider === 'Mistral' && (
                     <span className={`uppercase tracking-tighter text-[8px] border px-1 rounded ${
                       msg.metadata.isDeepThinking 
                         ? 'text-purple-400 border-purple-400/50 bg-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.3)]' 
                         : 'text-purple-500/60 border-purple-500/20'
                     }`}>
                       {msg.metadata.isDeepThinking ? 'CANCRI-LARGE' : 'CANCRI-FAST'}
                     </span>
                   )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-sm">
                <User size={16} className="text-white/60" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} className="h-12 sm:h-8" />
      </div>
      </div>
    </div>
  );
};

const DebateBox = ({ debate, isGenerating }: { debate: Message['metadata']['debate'], isGenerating: boolean }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [debate?.critique, debate?.draft, isGenerating]);

  // 进度动画：根据阶段显示不同进度
  useEffect(() => {
    if (!isGenerating) {
      setProgress(100);
      return;
    }
    
    let currentProgress = 0;
    const progressMap = {
      drafting: 33,
      critiquing: 66,
      refining: 90,
      completed: 100
    };
    const targetProgress = progressMap[debate?.stage || 'drafting'] || 0;
    
    const interval = setInterval(() => {
      if (currentProgress < targetProgress) {
        currentProgress = Math.min(currentProgress + 2, targetProgress);
        setProgress(currentProgress);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [debate?.stage, isGenerating]);

  const stageLabel = {
    drafting: "Phase 1: Deep Thinking...",
    critiquing: "Phase 2: Critical Reflection...",
    refining: "Phase 3: Synthesis...",
    completed: "Deep Thinking Complete"
  }[debate.stage || 'completed'];

  return (
    <div className={`w-full bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-lg overflow-hidden mb-3 animate-in fade-in transition-all ${
      isGenerating 
        ? 'border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
        : 'border-purple-500/10'
    }`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors relative"
      >
        <div className="flex items-center gap-2.5 text-xs font-mono text-purple-300/90 uppercase tracking-wider">
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin text-purple-400" />
          ) : (
            <Scale size={12} className="text-purple-400/70" />
          )}
          <span className="font-medium">
            {stageLabel}
          </span>
          {isGenerating && (
            <span className="text-[10px] text-purple-400/60 font-normal ml-1">
              {Math.round(progress)}%
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
      </button>
      
      {/* 进度条 */}
      {isGenerating && (
        <div className="h-0.5 bg-white/5 relative overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-purple-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500"
            style={{ width: `${progress}%`, transform: `translateX(${progress}%)` }}
          />
        </div>
      )}

      {isOpen && (
        <div ref={scrollRef} className="p-3 space-y-3 border-t border-white/5 bg-black/20 max-h-48 overflow-y-auto no-scrollbar">
          {debate.draft && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[9px] text-purple-400/80 uppercase font-medium tracking-wider">
                <Zap size={9} /> Phase 1: Deep Thinking {debate.stage === 'drafting' && '...'}
              </div>
              <div className="text-[11px] text-white/60 font-light leading-relaxed pl-3.5">
                {debate.draft}
              </div>
            </div>
          )}
          {debate.critique && (
            <div className="space-y-1.5 animate-in fade-in duration-700">
              <div className="flex items-center gap-1.5 text-[9px] text-amber-400/80 uppercase font-medium tracking-wider">
                <Scale size={9} /> Phase 2: Critical Reflection {debate.stage === 'critiquing' && '...'}
              </div>
              <div className="text-[11px] text-amber-100/60 font-light leading-relaxed pl-3.5">
                {debate.critique}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
