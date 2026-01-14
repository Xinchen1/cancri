import React, { useState, useEffect } from 'react';
import { X, Trash2, Download, Shield, Calendar, Globe, MessageSquare, Bot } from 'lucide-react';
import { adminService } from '../services/adminService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DecryptedLog {
  id: string;
  timestamp: number;
  ip: string;
  userQuestion: string;
  modelResponse: string;
  encrypted: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<DecryptedLog[]>([]);
  const [stats, setStats] = useState<{ totalLogs: number; uniqueIPs: number; dateRange: { start: number; end: number } } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIP, setFilterIP] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Auto-load data without password
      loadLogs();
      loadStats();
    } else {
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen]);

  const loadLogs = () => {
    // Use default password for admin access
    const adminPassword = '0571';
    const decryptedLogs = adminService.getLogs(adminPassword);
    if (decryptedLogs) {
      setLogs(decryptedLogs.reverse()); // Most recent first
    }
  };

  const loadStats = () => {
    // Use default password for admin access
    const adminPassword = '0571';
    const statsData = adminService.getStats(adminPassword);
    setStats(statsData);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      const adminPassword = '0571';
      if (adminService.clearLogs(adminPassword)) {
        setLogs([]);
        setStats(null);
        alert('All logs cleared');
      }
    }
  };

  const handleExport = () => {
    if (logs.length === 0) return;
    
    const dateStr = new Date().toISOString().split('T')[0];
    let csvContent = 'ID,Timestamp,IP,User Question,Model Response\n';
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const question = `"${log.userQuestion.replace(/"/g, '""')}"`;
      const response = `"${log.modelResponse.replace(/"/g, '""')}"`;
      csvContent += `${log.id},${timestamp},${log.ip},${question},${response}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cancri_admin_logs_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.userQuestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.modelResponse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIP = !filterIP || log.ip.includes(filterIP);
    return matchesSearch && matchesIP;
  });

  if (!visible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/95 backdrop-blur-md opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`w-full max-w-6xl bg-[#080808] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.2)] overflow-hidden transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} max-h-[90vh] flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-400" size={20} />
            <h2 className="text-lg font-light tracking-[0.2em] text-white">
              ADMIN PANEL <span className="text-white/40 font-mono text-sm">// Access Logs</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Admin Dashboard - Direct access */}
          <div className="flex-1 flex flex-col overflow-hidden">
              {/* Stats Bar */}
              {stats && (
                <div className="p-4 bg-black/40 border-b border-white/5 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats.totalLogs}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Total Logs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{stats.uniqueIPs}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Unique IPs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-mono text-white/60">
                      {stats.dateRange.start > 0 ? new Date(stats.dateRange.start).toLocaleDateString() : 'N/A'} - {stats.dateRange.end > 0 ? new Date(stats.dateRange.end).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Date Range</div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="p-4 bg-black/20 border-b border-white/5 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search questions or responses..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 outline-none"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="text"
                    value={filterIP}
                    onChange={(e) => setFilterIP(e.target.value)}
                    placeholder="Filter by IP..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 outline-none"
                  />
                </div>
                <button
                  onClick={handleExport}
                  disabled={logs.length === 0}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all text-xs uppercase tracking-wider disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download size={14} /> Export
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-4 py-2 bg-rose-500/20 border border-rose-500/50 text-rose-300 rounded-lg hover:bg-rose-500/30 transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Trash2 size={14} /> Clear
                </button>
              </div>

              {/* Logs List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    {logs.length === 0 ? 'No logs found' : 'No logs match your filters'}
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-white/40">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Globe size={12} />
                                <span className="font-mono">{log.ip}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MessageSquare size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider mb-1">User Question</div>
                                <div className="text-sm text-white/80 break-words">{log.userQuestion}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Bot size={14} className="text-purple-400 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-purple-400/60 uppercase tracking-wider mb-1">Model Response</div>
                                <div className="text-sm text-white/70 break-words line-clamp-3">{log.modelResponse}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                  ))
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

