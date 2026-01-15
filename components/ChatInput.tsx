
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, Loader2, Mic, MicOff, Waves } from 'lucide-react';
import { AgentStatus } from '../types';
import { speechToTextService } from '../services/speechToTextService';

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload: (file: File) => void;
  onVoiceToggle: () => void;
  status: AgentStatus;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onFileUpload, onVoiceToggle, status }) => {
  const [value, setValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBusy = status !== AgentStatus.IDLE && status !== AgentStatus.VOICE_ACTIVE;
  const isIndexing = status === AgentStatus.INDEXING;
  const isVoice = status === AgentStatus.VOICE_ACTIVE;

  const handleSend = () => {
    if (value.trim() && !isBusy) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleVoicePressStart = () => {
    if (isBusy || isRecording) return;
    
    setIsRecording(true);
    setVoiceText('');
    
    speechToTextService.startListening(
      (interimText) => {
        setVoiceText(interimText);
      },
      (finalText) => {
        setIsRecording(false);
        setVoiceText('');
        if (finalText.trim()) {
          onSend(finalText);
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsRecording(false);
        setVoiceText('');
      }
    );
  };

  const handleVoicePressEnd = () => {
    if (isRecording) {
      speechToTextService.stopListening();
      const finalText = speechToTextService.getCurrentTranscript();
      setIsRecording(false);
      setVoiceText('');
      if (finalText.trim()) {
        onSend(finalText);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        speechToTextService.stopListening();
      }
    };
  }, [isRecording]);

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-3rem)] sm:w-full max-w-2xl z-20">
      <div className={`relative group transition-all duration-500 ${isBusy && !isIndexing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-30 group-hover:opacity-70 blur transition duration-500 ${(isIndexing || isRecording) ? 'animate-pulse opacity-100' : ''}`}></div>
        <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-3 sm:px-4 py-3 sm:py-4 shadow-2xl w-full">
          
          <button 
            disabled={isBusy || isRecording}
            onClick={() => fileInputRef.current?.click()}
            className={`mr-1.5 sm:mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-full transition-all hover:bg-white/10 shrink-0 ${isBusy || isRecording ? 'opacity-20' : 'text-white/50 hover:text-white'}`}
          >
            {isIndexing ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-cyan-400" /> : <Paperclip size={18} className="sm:w-5 sm:h-5" />}
          </button>
          
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])} className="hidden" accept=".txt,.md,.json" />

          {isRecording ? (
            <div className="flex-1 flex items-center gap-2 sm:gap-4 px-2 min-w-0">
              <div className="flex gap-0.5 sm:gap-1 items-center h-4 sm:h-6 shrink-0">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-0.5 sm:w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <span className="text-cyan-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest animate-pulse truncate">
                {voiceText || 'Listening...'}
              </span>
            </div>
          ) : (
            <>
              <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-colors duration-300 shrink-0 ${isBusy ? 'text-purple-400 animate-pulse' : 'text-white/50'}`} />
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isIndexing ? "Indexing..." : isBusy ? "Cancri is processing..." : "Initialize command..."}
                disabled={isBusy || isRecording}
                className="bg-transparent border-none outline-none text-white placeholder-white/30 flex-1 min-w-0 font-light tracking-wide text-sm sm:text-base"
              />
            </>
          )}
          
          <button 
            onMouseDown={handleVoicePressStart}
            onMouseUp={handleVoicePressEnd}
            onMouseLeave={handleVoicePressEnd}
            onTouchStart={handleVoicePressStart}
            onTouchEnd={handleVoicePressEnd}
            disabled={isBusy || isIndexing}
            className={`ml-1.5 sm:ml-2 p-1.5 sm:p-2 rounded-full transition-all duration-300 shrink-0 ${
              isRecording 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse' 
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
            title="Hold to speak"
          >
            {isRecording ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className="sm:w-5 sm:h-5" />}
          </button>

          <button 
            onClick={handleSend}
            disabled={(!value.trim() && !voiceText.trim()) || isBusy || isRecording}
            className={`ml-1.5 sm:ml-2 p-1.5 sm:p-2 rounded-full transition-all duration-300 shrink-0 ${
              ((value.trim() || voiceText.trim()) && !isBusy && !isRecording) 
                ? 'bg-white text-black hover:bg-cyan-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
