
// Admin service for recording user access logs with encryption
interface AccessLog {
  id: string;
  timestamp: number;
  ip: string;
  userIdentifier: string; // Unique identifier for each user terminal
  userQuestion: string;
  modelResponse: string;
  encrypted: boolean;
}

class AdminService {
  private readonly ADMIN_PASSWORD = '0571';
  private readonly STORAGE_KEY = 'cancri_admin_logs';
  private readonly ENCRYPTION_KEY = 'cancri_encryption_key_v1';

  // Simple encryption (XOR cipher for basic obfuscation)
  // Support Unicode characters by encoding to UTF-8 first
  // No console output to keep it hidden
  private encrypt(text: string): string {
    try {
      const key = this.ENCRYPTION_KEY;
      // Convert string to UTF-8 bytes
      const utf8Bytes = new TextEncoder().encode(text);
      const keyBytes = new TextEncoder().encode(key);
      
      // XOR encryption
      const encrypted = new Uint8Array(utf8Bytes.length);
      for (let i = 0; i < utf8Bytes.length; i++) {
        encrypted[i] = utf8Bytes[i] ^ keyBytes[i % keyBytes.length];
      }
      
      // Convert to Base64 (safe for Unicode)
      const binaryString = String.fromCharCode(...encrypted);
      return btoa(binaryString);
    } catch (e) {
      // Silent fallback: simple encoding for error cases
      return btoa(unescape(encodeURIComponent(text)));
    }
  }

  private decrypt(encryptedText: string): string {
    try {
      const key = this.ENCRYPTION_KEY;
      // Decode Base64
      const binaryString = atob(encryptedText);
      const encrypted = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encrypted[i] = binaryString.charCodeAt(i);
      }
      
      // XOR decryption
      const keyBytes = new TextEncoder().encode(key);
      const decrypted = new Uint8Array(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
      }
      
      // Convert back to UTF-8 string
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      // Silent fallback: simple decoding for error cases
      try {
        return decodeURIComponent(escape(atob(encryptedText)));
      } catch (e2) {
        return '[Decryption Error]';
      }
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

  // Record access log (silently, without console output)
  async recordAccess(userQuestion: string, modelResponse: string, userIdentifier?: string): Promise<void> {
    try {
      // Get user identifier if not provided
      let uid = userIdentifier;
      if (!uid) {
        try {
          // Dynamically import to avoid exposing the function
          const { generateUserIdentifier } = await import('../utils/userIdentifier');
          uid = generateUserIdentifier();
        } catch (e) {
          // Fallback: generate simple ID
          uid = sessionStorage.getItem('_ui') || `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('_ui', uid);
        }
      }

      const ip = await this.getUserIP();
      const log: AccessLog = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ip: this.encrypt(ip),
        userIdentifier: this.encrypt(uid),
        userQuestion: this.encrypt(userQuestion),
        modelResponse: this.encrypt(modelResponse),
        encrypted: true
      };

      const existingLogs = this.getLogsRaw();
      existingLogs.push(log);
      
      // Keep only last 1000 logs
      const logsToSave = existingLogs.slice(-1000);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logsToSave));
      
      // NO console output - silent operation
    } catch (e) {
      // Silent fail - no console output
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
      userIdentifier: log.userIdentifier ? this.decrypt(log.userIdentifier) : 'unknown',
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

