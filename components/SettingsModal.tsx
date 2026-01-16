
import { X, Save, Server, ShieldCheck, Music, Radio, Waves, Key, Sliders, Zap, Scale, Brain, Database, Trash2, FileText, Loader2, Plus, ShieldAlert, Heart, Sparkles } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { AudioPreset, CognitiveConfig, FileMetadata } from '../types';
import { vectorDbService } from '../services/vectorDbService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: AudioPreset;
  onPresetChange: (preset: AudioPreset) => void;
  cognitiveConfig: CognitiveConfig;
  onConfigChange: (config: CognitiveConfig) => void;
  onUpload?: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, currentPreset, onPresetChange, cognitiveConfig, onConfigChange, onUpload 
}) => {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');
  const [selectedAudio, setSelectedAudio] = useState<AudioPreset>(currentPreset);
  const [localConfig, setLocalConfig] = useState<CognitiveConfig>(cognitiveConfig);
  const [ingestedFiles, setIngestedFiles] = useState<FileMetadata[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setVisible(true);
        setSelectedAudio(currentPreset);
        setLocalConfig(cognitiveConfig);
        loadArchive();
    } else {
        setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen, currentPreset, cognitiveConfig]);

  const loadArchive = async () => {
    const files = await vectorDbService.getIngestedFiles();
    setIngestedFiles(files);
  };


  const handleDeleteFile = async (id: string) => {
    setIsDeleting(id);
    await vectorDbService.deleteFile(id);
    await loadArchive();
    setIsDeleting(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setUploadError('Only .md and .txt files are supported.');
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const text = await file.text();
      setUploadProgress(30);

      await vectorDbService.ingestDocument(text, file.name, (prog) => {
        setUploadProgress(30 + (prog.percent * 0.7));
      });

      setUploadProgress(100);
      await loadArchive();
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1000);
    } catch (error: any) {
      setUploadError(error.message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setUploadError(null), 5000);
    }
  };

  const handleSave = () => {
    onPresetChange(selectedAudio);
    onConfigChange(localConfig);
    
    // Persist keys to local storage
    // Note: vectorDbService now uses default API keys automatically, no need to update
    if (localConfig.mistralKey) {
      localStorage.setItem('cancri_mistral_vault', localConfig.mistralKey);
    } else {
      localStorage.removeItem('cancri_mistral_vault');
    }

    setStatus('saved');
    setTimeout(() => {
        setStatus('idle');
        onClose();
    }, 1000);
  };

  if (!visible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/90 backdrop-blur-md opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`w-full max-w-xl bg-[#080808] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.1)] overflow-hidden transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Server className="text-purple-400" size={18} />
            <h2 className="text-lg font-light tracking-[0.2em] text-white">CORE CONFIGURATION</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-10 overflow-y-auto max-h-[70vh] no-scrollbar">
            
            {/* Neural Core API Key Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                        <Key size={12} className="text-purple-400" /> Neural Core API Key
                    </div>
                    {localConfig.mistralKey && localConfig.mistralKey.trim().length > 10 ? (
                        <div className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[8px] uppercase font-mono">
                           Active
                        </div>
                    ) : (
                        <div className="px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/5 text-rose-400 text-[8px] uppercase font-mono">
                           Required
                        </div>
                    )}
                </div>
                
                <div className="p-5 bg-black border border-white/10 rounded-xl space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold block">API Key (Required)</label>
                    <div className="relative group">
                        <input 
                            type="password"
                            value={localConfig.mistralKey || ''}
                            onChange={(e) => setLocalConfig({...localConfig, mistralKey: e.target.value})}
                            placeholder="Enter your API key..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:border-purple-500/50 outline-none transition-all pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-purple-500/40 transition-colors">
                            <Key size={14} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Audio Energy Field Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                    <Music size={12} className="text-pink-400" /> Energy Vibration Field
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: AudioPreset.CELESTIAL, label: 'Celestial 432Hz', icon: <Sparkles size={14} />, desc: 'Universal Harmony' },
                    { id: AudioPreset.AWAKENING, label: 'Awakening 963Hz', icon: <Zap size={14} />, desc: 'Wisdom & Pineal' },
                    { id: AudioPreset.LOVE, label: 'Love 528Hz', icon: <Heart size={14} />, desc: 'Miracle & Healing' },
                    { id: AudioPreset.INTUITION, label: 'Intuition 852Hz', icon: <Waves size={14} />, desc: 'Spiritual Order' },
                    { id: AudioPreset.GROUNDING, label: 'Earth 7.83Hz', icon: <Radio size={14} />, desc: 'Schumann Resonance' },
                    { id: AudioPreset.FOCUS, label: 'Focus 10Hz', icon: <Brain size={14} />, desc: 'Alpha State' }
                  ].map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedAudio(p.id)}
                      className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${selectedAudio === p.id ? 'bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={selectedAudio === p.id ? 'text-pink-400' : 'text-white/40'}>{p.icon}</span>
                        <span className={`text-[10px] font-bold ${selectedAudio === p.id ? 'text-white' : 'text-white/60'}`}>{p.label}</span>
                      </div>
                      <span className="text-[8px] text-white/20 uppercase tracking-tighter">{p.desc}</span>
                    </button>
                  ))}
                </div>
            </section>

            {/* Akasha Archives Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                        <Database size={12} className="text-cyan-400" /> Akasha Archives
                    </div>
                    <div className="px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[8px] uppercase font-mono">
                        {ingestedFiles.length}/5 Files
                    </div>
                </div>
                
                <div className="p-5 bg-black border border-white/10 rounded-xl space-y-4">
                    {/* Upload Area */}
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold block">Upload MD/TXT Files</label>
                        <div className="relative">
                            <input 
                                ref={fileInputRef}
                                type="file"
                                accept=".md,.txt"
                                onChange={handleFileChange}
                                disabled={isUploading || ingestedFiles.length >= 5}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                    isUploading || ingestedFiles.length >= 5
                                        ? 'border-white/10 bg-white/5 cursor-not-allowed opacity-50'
                                        : 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                                }`}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} className="text-cyan-400 animate-spin" />
                                        <span className="text-xs text-cyan-400">Uploading... {Math.round(uploadProgress)}%</span>
                                    </>
                                ) : ingestedFiles.length >= 5 ? (
                                    <>
                                        <ShieldAlert size={16} className="text-rose-400" />
                                        <span className="text-xs text-rose-400">Maximum 5 files reached</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} className="text-cyan-400" />
                                        <span className="text-xs text-cyan-400">Click to upload (Max: 1M tokens/file)</span>
                                    </>
                                )}
                            </label>
                        </div>
                        
                        {uploadError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-2">
                                <p className="text-[10px] text-rose-400 font-bold">{uploadError}</p>
                                {uploadError.includes("API key") && (
                                    <p className="text-[9px] text-rose-300/80">
                                        Note: Document indexing requires API key. Please configure it above.
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {isUploading && uploadProgress > 0 && (
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className="h-full bg-cyan-400 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                        
                        <p className="text-[8px] text-white/20">Supports up to 5 files, each up to 1,000,000 tokens (~3.8M characters)</p>
                    </div>

                    {/* File List */}
                    {ingestedFiles.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Uploaded Files</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                                {ingestedFiles.map((file) => (
                                    <div 
                                        key={file.id}
                                        className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg group hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText size={14} className="text-cyan-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white truncate">{file.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[9px] text-white/40">
                                                        {file.tokenCount ? `${file.tokenCount.toLocaleString()} tokens` : `${(file.size / 1000).toFixed(1)} KB`}
                                                    </span>
                                                    <span className="text-[9px] text-white/30">
                                                        {new Date(file.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFile(file.id)}
                                            disabled={isDeleting === file.id}
                                            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all shrink-0"
                                        >
                                            {isDeleting === file.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                    <Sliders size={12} className="text-purple-400" /> Cognitive Engine
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Scale size={18} className="text-amber-400" />
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Deep Debate Mode</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setLocalConfig({...localConfig, enableDebate: !localConfig.enableDebate})}
                            className={`w-12 h-6 rounded-full transition-all relative ${localConfig.enableDebate ? 'bg-amber-500/40 border border-amber-500/50' : 'bg-white/5 border border-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${localConfig.enableDebate ? 'right-1 bg-amber-400' : 'left-1 bg-white/20'}`} />
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
            <button onClick={handleSave} className={`flex items-center gap-2 px-8 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${status === 'saved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white text-black hover:bg-cyan-200'}`}>
                {status === 'saved' ? <><ShieldCheck size={14} /> 已保存</> : <><Save size={14} /> 保存并提交</>}
            </button>
        </div>
      </div>
    </div>
  );
};
