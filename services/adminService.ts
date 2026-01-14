
// Admin service for recording user access logs with encryption
interface AccessLog {
  id: string;
  timestamp: number;
  ip: string;
  userQuestion: string;
  modelResponse: string;
  encrypted: boolean;
}

class AdminService {
  private readonly ADMIN_PASSWORD = '0571';
  private readonly STORAGE_KEY = 'cancri_admin_logs';
  private readonly ENCRYPTION_KEY = 'cancri_encryption_key_v1';

  // Simple encryption (XOR cipher for basic obfuscation)
  private encrypt(text: string): string {
    const key = this.ENCRYPTION_KEY;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  }

  private decrypt(encryptedText: string): string {
    try {
      const key = this.ENCRYPTION_KEY;
      const text = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (e) {
      return '[Decryption Error]';
    }
  }

  // Get user IP address
  private async getUserIP(): Promise<string> {
    try {
      // Try multiple IP detection methods
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'Unknown';
    } catch (e) {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.ip || 'Unknown';
      } catch (e2) {
        return 'Unknown';
      }
    }
  }

  // Record access log
  async recordAccess(userQuestion: string, modelResponse: string): Promise<void> {
    try {
      const ip = await this.getUserIP();
      const log: AccessLog = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ip: this.encrypt(ip),
        userQuestion: this.encrypt(userQuestion),
        modelResponse: this.encrypt(modelResponse),
        encrypted: true
      };

      const existingLogs = this.getLogsRaw();
      existingLogs.push(log);
      
      // Keep only last 1000 logs
      const logsToSave = existingLogs.slice(-1000);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (e) {
      console.error('Failed to record access log:', e);
    }
  }

  // Get raw logs (encrypted)
  private getLogsRaw(): AccessLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  // Verify admin password
  verifyPassword(password: string): boolean {
    return password === this.ADMIN_PASSWORD;
  }

  // Get decrypted logs (admin only)
  getLogs(password: string): AccessLog[] | null {
    if (!this.verifyPassword(password)) {
      return null;
    }

    const logs = this.getLogsRaw();
    return logs.map(log => ({
      ...log,
      ip: this.decrypt(log.ip),
      userQuestion: this.decrypt(log.userQuestion),
      modelResponse: this.decrypt(log.modelResponse),
      encrypted: false
    }));
  }

  // Clear all logs
  clearLogs(password: string): boolean {
    if (!this.verifyPassword(password)) {
      return false;
    }
    localStorage.removeItem(this.STORAGE_KEY);
    return true;
  }

  // Get statistics
  getStats(password: string): { totalLogs: number; uniqueIPs: number; dateRange: { start: number; end: number } } | null {
    if (!this.verifyPassword(password)) {
      return null;
    }

    const logs = this.getLogs(password);
    if (!logs) return null;

    const uniqueIPs = new Set(logs.map(log => log.ip));
    const timestamps = logs.map(log => log.timestamp);
    
    return {
      totalLogs: logs.length,
      uniqueIPs: uniqueIPs.size,
      dateRange: {
        start: timestamps.length > 0 ? Math.min(...timestamps) : 0,
        end: timestamps.length > 0 ? Math.max(...timestamps) : 0
      }
    };
  }
}

export const adminService = new AdminService();

