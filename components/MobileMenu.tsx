import React, { useState, useEffect, useRef } from 'react';
import { Download, Trash2, Settings, Info, Menu, X } from 'lucide-react';

interface MobileMenuProps {
  onExport: () => void;
  onClear: () => void;
  onSettings: () => void;
  onManual: () => void;
  canExport: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ onExport, onClear, onSettings, onManual, canExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="pointer-events-auto fixed top-4 right-4 z-50 sm:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 bg-black/60 border border-white/20 rounded-full flex items-center justify-center transition-all ${
          isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-white/60'
        }`}
        title={isOpen ? "Close" : "Menu"}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 flex flex-col gap-2 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
          <button 
            onClick={() => { onExport(); setIsOpen(false); }} 
            disabled={!canExport}
            className={`w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-lg flex items-center justify-center gap-2 transition-all ${
              canExport ? 'hover:bg-cyan-900/40 text-white/60 active:bg-cyan-900/60' : 'opacity-20 text-white/30 cursor-not-allowed'
            }`}
            title="Export"
          >
            <Download size={14}/> <span className="text-xs font-medium">Export</span>
          </button>
          <button 
            onClick={() => { onClear(); setIsOpen(false); }} 
            className="w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-lg flex items-center justify-center gap-2 hover:bg-rose-900/40 active:bg-rose-900/60 text-white/60 transition-all"
            title="Clear All"
          >
            <Trash2 size={14}/> <span className="text-xs font-medium">Clear</span>
          </button>
          <button 
            onClick={() => { onSettings(); setIsOpen(false); }}
            className="w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 active:bg-white/20 text-white/60 transition-all"
            title="Settings"
          >
            <Settings size={14}/> <span className="text-xs font-medium">Settings</span>
          </button>
          <button 
            onClick={() => { onManual(); setIsOpen(false); }} 
            className="w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 active:bg-white/20 text-white/60 transition-all"
            title="Manual"
          >
            <Info size={14}/> <span className="text-xs font-medium">Manual</span>
          </button>
        </div>
      )}
    </div>
  );
};

