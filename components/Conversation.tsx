
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
                   <span>❖ {msg.metadata.modelUsed.toUpperCase()}</span> 
                   {msg.metadata.provider === 'Mistral' && <span className="text-purple-500/60 uppercase tracking-tighter text-[8px] border border-purple-500/20 px-1 rounded">Neural Core</span>}
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [debate?.critique, debate?.draft, isGenerating]);

  const stageLabel = {
    drafting: "Phase 1: Deep Thinking...",
    critiquing: "Phase 2: Critical Reflection...",
    refining: "Phase 3: Synthesis...",
    completed: "Deep Thinking Complete"
  }[debate.stage || 'completed'];

  return (
    <div className={`w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-2 animate-in fade-in transition-all ${isGenerating ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : ''}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
          {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Scale size={12} />}
          <span>{stageLabel}</span>
        </div>
        {isOpen ? <ChevronUp size={12} className="text-white/40" /> : <ChevronDown size={12} className="text-white/40" />}
      </button>

      {isOpen && (
        <div ref={scrollRef} className="p-3 space-y-4 border-t border-white/10 bg-black/40 max-h-48 overflow-y-auto no-scrollbar">
          {debate.draft && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] text-purple-400 uppercase font-bold">
                <Zap size={10} /> Phase 1: Deep Thinking {debate.stage === 'drafting' && '...'}
              </div>
              <div className="text-[11px] text-white/50 font-light border-l border-purple-500/30 pl-3">
                {debate.draft}
              </div>
            </div>
          )}
          {debate.critique && (
            <div className="space-y-1 animate-in fade-in duration-700">
              <div className="flex items-center gap-1.5 text-[9px] text-amber-500 uppercase font-bold">
                <Scale size={10} /> Phase 2: Critical Reflection {debate.stage === 'critiquing' && '...'}
              </div>
              <div className="text-[11px] text-amber-100/60 font-mono border-l border-amber-500/30 pl-3 italic">
                {debate.critique}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
