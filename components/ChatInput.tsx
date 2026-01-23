
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, Mic, MicOff, Brain } from 'lucide-react';
import { AgentStatus } from '../types';
import { speechToTextService } from '../services/speechToTextService';
import { DiamondIcon } from './DiamondIcon';

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload: (file: File) => void;
  onVoiceToggle: () => void;
  status: AgentStatus;
  enableDeepThinking: boolean;
  attachmentCount?: number;
  onToggleDeepThinking: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onFileUpload, onVoiceToggle, status, enableDeepThinking, attachmentCount = 0, onToggleDeepThinking }) => {
  const [value, setValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = status !== AgentStatus.IDLE && status !== AgentStatus.VOICE_ACTIVE;
  const isIndexing = status === AgentStatus.INDEXING;
  const isVoice = status === AgentStatus.VOICE_ACTIVE;

  const handleSend = () => {
    if (value.trim() && !isBusy) {
      const textToSend = value.trim();
      onSend(textToSend);
      setValue('');
      
      // 移动端：发送后失焦输入框，关闭键盘
      if (inputRef.current) {
        inputRef.current.blur();
      }
      
      // 防止移动端页面缩放
      // 确保 viewport 保持固定
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleVoiceClick = () => {
    if (isBusy || isIndexing) return;
    
    if (isRecording) {
      // 如果正在录音，停止录音并发送
      speechToTextService.stopListening();
      const finalText = speechToTextService.getCurrentTranscript();
      setIsRecording(false);
      setVoiceText('');
      if (finalText.trim()) {
        onSend(finalText);
        // 移动端：发送后失焦，关闭键盘
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    } else {
      // 如果未在录音，开始录音
      setIsRecording(true);
      setVoiceText('');
      
      // 移动端：开始录音时，确保输入框失焦
      if (inputRef.current) {
        inputRef.current.blur();
      }
      
      speechToTextService.startListening(
        (interimText) => {
          setVoiceText(interimText);
        },
        (finalText) => {
          setIsRecording(false);
          setVoiceText('');
          if (finalText.trim()) {
            onSend(finalText);
            // 移动端：发送后失焦，关闭键盘
            if (inputRef.current) {
              inputRef.current.blur();
            }
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsRecording(false);
          setVoiceText('');
        }
      );
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
    <div className="fixed bottom-4 sm:bottom-8 md:bottom-10 left-0 right-0 flex justify-center z-20 px-2 sm:px-6">
      <div className="w-full max-w-2xl">
      <div className={`relative group transition-all duration-500 ${isBusy && !isIndexing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-30 group-hover:opacity-70 blur transition duration-500 ${(isIndexing || isRecording) ? 'animate-pulse opacity-100' : ''}`}></div>
        <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-2 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-3 shadow-2xl w-full">
          
          <button 
            disabled={isBusy || isRecording}
            onClick={() => fileInputRef.current?.click()}
            className={`relative mr-1 sm:mr-2 md:mr-3 p-1.5 sm:p-2 rounded-full transition-all hover:bg-white/10 shrink-0 ${isBusy || isRecording ? 'opacity-20' : 'text-white/50 hover:text-white'}`}
            title="Upload file"
          >
            {isIndexing ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-cyan-400" /> : <Paperclip size={16} className="sm:w-5 sm:h-5" />}
            {attachmentCount > 0 && !isIndexing && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-purple-500 text-white text-[10px] font-bold rounded-full border-2 border-black/60">
                {attachmentCount}
              </span>
            )}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])} 
            className="hidden" 
            accept=".txt,.md,.json,.doc,.docx,image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp" 
          />

          {/* 深度思考开关按钮 - 移动端和桌面端都显示 */}
          <button
            onClick={onToggleDeepThinking}
            disabled={isBusy || isRecording}
            className={`mr-1 sm:mr-1.5 md:mr-2 p-2 sm:p-1.5 md:p-2 rounded-full transition-all duration-300 shrink-0 flex items-center justify-center ${
              enableDeepThinking
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-white/30 hover:text-white/50 hover:bg-white/5 border border-transparent'
            } ${isBusy || isRecording ? 'opacity-20 cursor-not-allowed' : ''}`}
            title={enableDeepThinking ? "深度思考已开启" : "点击开启深度思考"}
          >
            <Brain size={18} className="sm:w-4 sm:h-4" />
          </button>

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
              <div className={`mr-1.5 sm:mr-2 md:mr-3 shrink-0 transition-all duration-300 ${isBusy ? 'opacity-100' : 'opacity-50'}`}>
                <DiamondIcon status={status} size={14} className="sm:w-4 sm:h-4" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isIndexing ? "Indexing..." : isBusy ? "Cancri is processing..." : "Initialize command..."}
                disabled={isBusy || isRecording}
                className="bg-transparent border-none outline-none text-white placeholder-white/30 flex-1 min-w-0 font-light tracking-wide text-xs sm:text-sm md:text-base px-1"
              />
            </>
          )}
          
          <button 
            onClick={handleVoiceClick}
            disabled={isBusy || isIndexing}
            className={`ml-1 sm:ml-1.5 md:ml-2 p-2.5 sm:p-2 rounded-full transition-all duration-300 shrink-0 ${
              isRecording 
                ? 'bg-rose-500/30 text-rose-400 border-2 border-rose-500/70 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]' 
                : 'text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]'
            } sm:${isRecording ? 'bg-rose-500/20 border border-rose-500/50' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
            title={isRecording ? "Tap to stop" : "Tap to speak"}
          >
            {isRecording ? (
              <MicOff size={20} className="sm:w-5 sm:h-5" />
            ) : (
              <Mic size={20} className="sm:w-5 sm:h-5" />
            )}
          </button>

          {/* 桌面端显示发送按钮，移动端隐藏 */}
          <button 
            onClick={handleSend}
            disabled={(!value.trim() && !voiceText.trim()) || isBusy || isRecording}
            className={`hidden sm:flex ml-1.5 md:ml-2 p-1.5 sm:p-2 rounded-full transition-all duration-300 shrink-0 ${
              ((value.trim() || voiceText.trim()) && !isBusy && !isRecording) 
                ? 'bg-white text-black hover:bg-cyan-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send size={14} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
