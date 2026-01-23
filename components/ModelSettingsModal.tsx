import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Key, Sparkles } from 'lucide-react';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (geminiApiKey: string) => void;
  currentGeminiKey?: string;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentGeminiKey = ''
}) => {
  const [visible, setVisible] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Load saved key from localStorage
      const saved = localStorage.getItem('cancri_gemini_key');
      setGeminiKey(saved || currentGeminiKey);
      setTestStatus('idle');
      setTestMessage('');
    } else {
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen, currentGeminiKey]);

  const handleTest = async () => {
    if (!geminiKey.trim()) {
      setTestMessage('请输入 Gemini API Key');
      setTestStatus('error');
      return;
    }

    setTestStatus('testing');
    setTestMessage('测试连接中...');

    try {
      // Test Gemini API with a simple request
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: '测试'
            }]
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Invalid API key' } }));
        throw new Error(error.error?.message || 'API 测试失败');
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0]) {
        setTestStatus('success');
        setTestMessage('✅ API Key 验证成功！');
      } else {
        throw new Error('API 返回格式异常');
      }
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(`❌ 测试失败: ${error.message || '未知错误'}`);
    }
  };

  const handleSave = () => {
    if (!geminiKey.trim()) {
      setTestMessage('请输入 Gemini API Key');
      setTestStatus('error');
      return;
    }

    // Save to localStorage
    localStorage.setItem('cancri_gemini_key', geminiKey);
    localStorage.setItem('cancri_model_provider', 'gemini'); // Mark as using Gemini
    
    onSave(geminiKey);
    setTestStatus('idle');
    setTestMessage('');
    onClose();
  };

  const handleClear = () => {
    setGeminiKey('');
    localStorage.removeItem('cancri_gemini_key');
    localStorage.removeItem('cancri_model_provider');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-purple-900/95 via-black/95 to-purple-900/95 rounded-2xl border border-purple-500/30 shadow-2xl p-6 animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">模型设置</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="输入您的 Gemini API Key"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
              />
            </div>
            <p className="mt-2 text-xs text-white/50">
              设置后将使用 Gemini 模型（自动选择 gemini-1.5-flash 或 gemini-1.5-pro）
            </p>
          </div>

          {testMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              testStatus === 'success' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : testStatus === 'error'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {testMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleTest}
              disabled={testStatus === 'testing'}
              className="flex-1 px-4 py-2.5 bg-purple-600/40 hover:bg-purple-600/60 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testStatus === 'testing' ? '测试中...' : '测试连接'}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              保存设置
            </button>
          </div>

          <button
            onClick={handleClear}
            className="w-full px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            清除设置（恢复默认 Mistral 模型）
          </button>
        </div>
      </div>
    </div>
  );
};


