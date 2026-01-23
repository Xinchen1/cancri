
import React, { useState, useCallback, useEffect } from 'react';
import { Scene } from './components/Scene';
import { ChatInput } from './components/ChatInput';
import { Conversation } from './components/Conversation';
import { LogsOverlay } from './components/LogsOverlay';
import { AudioPlayer } from './components/AudioPlayer';
import { ManualModal } from './components/ManualModal';
import { SettingsModal } from './components/SettingsModal';
import { IndexingOverlay } from './components/IndexingOverlay';
import { AdminPanel } from './components/AdminPanel';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { adminService } from './services/adminService';
import { crystalService } from './services/mistralService';
import { vectorDbService } from './services/vectorDbService';
import { liveApiService } from './services/liveApiService';
import { AgentStatus, Message, LogEntry, AudioPreset, CognitiveConfig } from './types';
import { Info, Settings, Trash2, Download } from 'lucide-react';
import { MobileMenu } from './components/MobileMenu';

const App: React.FC = () => {
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [indexingStats, setIndexingStats] = useState({ current: 0, total: 0 });
  const [currentFileName, setCurrentFileName] = useState('');
  
  // 附件列表（单次对话使用，与设置中的记忆库不同）
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; content: string }>>([]);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioPreset, setAudioPreset] = useState<AudioPreset>(AudioPreset.CELESTIAL);
  const [enableDeepThinking, setEnableDeepThinking] = useState(false); // 默认关闭深度思考
  const [cognitiveConfig, setCognitiveConfig] = useState<CognitiveConfig>({
    temperature: 0.7,
    thinkingBudget: 4096,
    modelRoute: 'auto',
    enableDebate: false, // 默认关闭，由用户手动开启
    mistralKey: ''
  });

  useEffect(() => {
    try {
      console.log('[App] Initializing services...');
    const memory = crystalService.loadMemory();
    if (memory.messages.length > 0) setMessages(memory.messages);
    if (memory.logs.length > 0) setLogs(memory.logs);
    
    // 监听 localStorage 变化，用于控制台打开管理后台
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cancri_open_admin' && e.newValue === 'true') {
        setIsAdminOpen(true);
        localStorage.removeItem('cancri_open_admin');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // 检查初始值
    if (localStorage.getItem('cancri_open_admin') === 'true') {
      setIsAdminOpen(true);
      localStorage.removeItem('cancri_open_admin');
    }
    
    // 暴露全局函数供控制台使用
    (window as any).openAdminPanel = () => {
      const password = prompt('请输入管理后台密码：');
      if (!password) {
        console.log('❌ 已取消');
        return;
      }
      
      if (adminService.verifyPassword(password)) {
        setIsAdminOpen(true);
        console.log('✅ 密码正确，管理后台已打开');
      } else {
        console.log('❌ 密码错误，访问被拒绝');
        alert('密码错误，访问被拒绝');
      }
    };
    
    (window as any).closeAdminPanel = () => {
      setIsAdminOpen(false);
      console.log('✅ 管理后台已关闭');
    };

    // 控制台监听器：输入"模型"打开模型设置弹窗
    (window as any).模型 = () => {
      setIsModelSettingsOpen(true);
    };

    // 控制台监听器：输入"admini"打开管理后台（带密码验证）
    (window as any).admini = () => {
      const password = prompt('请输入管理后台密码：');
      if (!password) {
        console.log('❌ 已取消');
        return;
      }
      
      if (adminService.verifyPassword(password)) {
        setIsAdminOpen(true);
        console.log('✅ 密码正确，管理后台已打开');
      } else {
        console.log('❌ 密码错误，访问被拒绝');
        alert('密码错误，访问被拒绝');
      }
    };
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    
    // Load persisted keys from vault
    const savedMistral = localStorage.getItem('cancri_mistral_vault');
    
    setCognitiveConfig(prev => ({ 
      ...prev, 
        mistralKey: savedMistral || ''
      }));
      
      // VectorDbService now uses default API keys automatically
      console.log('[App] Services initialized successfully');
    } catch (error) {
      console.error('[App] Failed to initialize services:', error);
      // 不阻止应用加载，只记录错误
      try {
        addLog('SYSTEM', `初始化警告: ${error instanceof Error ? error.message : String(error)}`, 'warning');
      } catch (e) {
        // 如果 addLog 也失败，至少确保应用能显示
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 || logs.length > 0) {
        crystalService.saveMemory(messages, logs);
    }
  }, [messages, logs]);

  const addLog = useCallback((step: string, details: string, logStatus: 'info' | 'success' | 'warning' | 'error') => {
    setLogs(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        timestamp: Date.now(),
        step,
        details,
        status: logStatus
    }].slice(-50));
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() && attachments.length === 0) return;
    
    // 如果有附件，将附件内容附加到消息中
    let messageContent = text.trim();
    if (attachments.length > 0) {
      const attachmentContext = attachments.map(att => 
        `[ATTACHMENT: ${att.name}]\n${att.content}\n[END OF ATTACHMENT: ${att.name}]`
      ).join('\n\n');
      messageContent = messageContent 
        ? `${messageContent}\n\n${attachmentContext}`
        : attachmentContext;
      
      // 发送后清空附件列表
      setAttachments([]);
    }
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageContent, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now() }]);

    // 使用更新后的配置
    const currentConfig = { ...cognitiveConfig };

    await crystalService.processUserMessageStream(
        messageContent, 
        messages, 
        currentConfig,
        async (fullText, meta) => {
            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText, metadata: meta } : m));
            
            // Record access log when response is complete (silently, no console output)
            if (fullText && fullText.trim().length > 0) {
              try {
                // Get user identifier dynamically
                let userIdentifier: string | undefined;
                try {
                  const { generateUserIdentifier } = await import('./utils/userIdentifier');
                  userIdentifier = generateUserIdentifier();
                } catch (e) {
                  // Fallback: use sessionStorage
                  userIdentifier = sessionStorage.getItem('_ui') || undefined;
                }
                await adminService.recordAccess(text, fullText, userIdentifier);
              } catch (e) {
                // Silent fail for logging (no console output)
              }
            }
        },
        addLog, 
        setStatus,
        enableDeepThinking  // 直接传递手动开关状态
    );
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const dateStr = new Date().toISOString().split('T')[0];
    let mdContent = `# Cancri Session Log\nDate: ${dateStr}\n\n---\n\n`;
    messages.forEach((msg) => {
      mdContent += `### [${msg.role.toUpperCase()}] - ${new Date(msg.timestamp).toLocaleTimeString()}\n\n${msg.content}\n\n`;
    });
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cancri_Session_${dateStr}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog("SYSTEM", "Export complete.", "success");
  };

  const handleVoiceToggle = async () => {
    if (status === AgentStatus.VOICE_ACTIVE) {
      liveApiService.stopSession();
      setStatus(AgentStatus.IDLE);
    } else {
      try {
        setStatus(AgentStatus.VOICE_ACTIVE);
        await liveApiService.startSession({
          onMessage: (text, role) => {
            const id = role === 'user' ? 'voice-user' : 'voice-assistant';
            setMessages(prev => {
              const filtered = prev.filter(m => m.id !== id);
              return [...filtered, { id, role, content: text, timestamp: Date.now(), metadata: { isVoice: true } }];
            });
          },
          onError: (err) => { setStatus(AgentStatus.IDLE); },
          onClose: () => { setStatus(AgentStatus.IDLE); }
        }, undefined); // Voice requires Google API, not Mistral
      } catch (e: any) { setStatus(AgentStatus.IDLE); }
    }
  };

  const handleFileUpload = async (file: File) => {
    setStatus(AgentStatus.INDEXING);
    setIndexingProgress(0);
    setIndexingStats({ current: 0, total: 0 });
    setCurrentFileName(file.name);
    
    // 判断文件类型并显示相应的日志
    const fileName = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName);
    const isWord = /\.(docx|doc)$/i.test(fileName);
    
    if (isImage) {
      addLog("ATTACHMENT", `Processing image: ${file.name} (OCR识别中...)`, "info");
    } else if (isWord) {
      addLog("ATTACHMENT", `Processing Word document: ${file.name} (解析中...)`, "info");
    } else {
      addLog("ATTACHMENT", `Processing attachment: ${file.name}`, "info");
    }
    
    try {
      // 使用文件处理服务处理文件
      const { fileProcessorService } = await import('./services/fileProcessorService');
      const processed = await fileProcessorService.processFile(file, (progress) => {
        setIndexingProgress(progress);
      });
      
      // 将附件添加到附件列表（单次对话使用）
      const attachmentId = Date.now().toString() + Math.random();
      setAttachments(prev => [...prev, { id: attachmentId, name: processed.name, content: processed.content }]);
      
      const successMsg = isImage 
        ? `Image processed: ${processed.name} (OCR completed)`
        : isWord
        ? `Word document processed: ${processed.name}`
        : `Attachment added: ${processed.name}`;
      
      addLog("ATTACHMENT", successMsg, "success");
      setIndexingProgress(100);
      setTimeout(() => {
        setStatus(AgentStatus.IDLE);
        setIndexingProgress(0);
        setIndexingStats({ current: 0, total: 0 });
        setCurrentFileName('');
      }, 800);
    } catch (e: any) {
      const errorMsg = isImage
        ? `Image OCR failed: ${e.message}`
        : isWord
        ? `Word document parsing failed: ${e.message}`
        : `Attachment processing failed: ${e.message}`;
      
      addLog("SYSTEM", errorMsg, "error");
      setStatus(AgentStatus.IDLE);
      setIndexingProgress(0);
    }
  };

  console.log('[App] Rendering component, status:', status);
  console.log('[App] Messages count:', messages.length);
  console.log('[App] Logs count:', logs.length);
  
  // 如果 Scene 组件有问题，先渲染一个简单的占位符
  let sceneComponent;
  try {
    sceneComponent = <Scene status={status} />;
  } catch (sceneError) {
    console.error('[App] Scene component error:', sceneError);
    sceneComponent = (
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        <p className="text-white/40 text-sm">3D 场景加载失败</p>
      </div>
    );
  }
  
  try {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white selection:bg-purple-500/30">
      {sceneComponent}
      {status !== AgentStatus.VOICE_ACTIVE && <AudioPlayer isPlaying={audioEnabled} preset={audioPreset} />}

      <div className="relative z-10 w-full h-full pointer-events-none">
        <div className="absolute top-6 sm:top-8 left-6 sm:left-8">
             <div className="flex items-end gap-3">
               <h1 className="text-2xl sm:text-4xl font-extralight tracking-[0.2em] text-white">CANCRI</h1>
               <span className="text-[10px] text-purple-400 font-mono mb-2 tracking-widest opacity-80">// 55-E</span>
             </div>
             <div className="flex items-center gap-2 mt-2">
               <div className={`w-1.5 h-1.5 rounded-full ${status === AgentStatus.VOICE_ACTIVE ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
               <p className="text-[9px] text-white/40 uppercase tracking-[0.3em]">{status === AgentStatus.VOICE_ACTIVE ? 'Voice Active' : 'Core Online'}</p>
             </div>
        </div>

        {/* Desktop: Always visible buttons */}
        <div className="pointer-events-auto fixed top-6 right-6 z-50 hidden sm:flex gap-2">
             <button onClick={handleExport} disabled={messages.length === 0} className={`w-10 h-10 bg-black/60 border border-white/20 rounded-full flex items-center justify-center transition-all ${messages.length === 0 ? 'opacity-20' : 'hover:bg-cyan-900/40 text-white/60'}`} title="Export"><Download size={14}/></button>
             <button onClick={() => { crystalService.clearMemory(); setMessages([]); setLogs([]); }} className="w-10 h-10 bg-black/60 border border-white/20 rounded-full flex items-center justify-center hover:bg-rose-900/40 text-white/60" title="Clear All"><Trash2 size={14}/></button>
             <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 bg-black/60 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 text-white/60" title="Settings"><Settings size={14}/></button>
             <button onClick={() => setIsManualOpen(true)} className="px-4 h-10 bg-black/60 border border-white/20 rounded-full flex items-center gap-2 hover:bg-white/10 text-white/60" title="Manual"><Info size={14} /><span className="text-[10px] uppercase tracking-widest">Manual</span></button>
        </div>

        {/* Mobile: Collapsible menu */}
        <MobileMenu
          onExport={handleExport}
          onClear={() => { crystalService.clearMemory(); setMessages([]); setLogs([]); }}
          onSettings={() => setIsSettingsOpen(true)}
          onManual={() => setIsManualOpen(true)}
          canExport={messages.length > 0}
        />


        <div className="pointer-events-auto"><Conversation messages={messages} /></div>
        <LogsOverlay logs={logs} />
        <div className="pointer-events-auto">
          <ChatInput 
            onSend={handleSendMessage} 
            onFileUpload={handleFileUpload} 
            onVoiceToggle={handleVoiceToggle} 
            status={status}
            enableDeepThinking={enableDeepThinking}
            attachmentCount={attachments.length}
            onToggleDeepThinking={() => {
              setEnableDeepThinking(!enableDeepThinking);
              setCognitiveConfig(prev => ({ ...prev, enableDebate: !enableDeepThinking }));
            }}
          />
        </div>

        <div className="pointer-events-auto">
          <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            currentPreset={audioPreset} 
            onPresetChange={setAudioPreset}
            cognitiveConfig={cognitiveConfig}
            onConfigChange={setCognitiveConfig}
            onUpload={handleFileUpload}
          />
          <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
          <ModelSettingsModal 
            isOpen={isModelSettingsOpen} 
            onClose={() => setIsModelSettingsOpen(false)} 
            onSave={(key) => {
              localStorage.setItem('cancri_gemini_key', key);
              localStorage.setItem('cancri_model_provider', 'gemini');
            }}
            currentGeminiKey={localStorage.getItem('cancri_gemini_key') || ''}
          />
          <IndexingOverlay 
            isVisible={status === AgentStatus.INDEXING} 
            progress={indexingProgress} 
            fileName={currentFileName}
            stats={indexingStats}
          />
        </div>
      </div>
    </div>
  );
  } catch (renderError) {
    console.error('[App] Render error:', renderError);
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">渲染错误</h1>
          <p className="text-sm text-white/60">{renderError instanceof Error ? renderError.message : String(renderError)}</p>
        </div>
      </div>
    );
  }
};

export default App;
