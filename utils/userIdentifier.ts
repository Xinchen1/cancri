// Generate unique user identifier based on browser fingerprint
// This is used to track different users without exposing personal information

export function generateUserIdentifier(): string {
  try {
    // Check if already exists in sessionStorage (per session)
    const sessionId = sessionStorage.getItem('_ui');
    if (sessionId) {
      return sessionId;
    }

    // Generate fingerprint based on browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.platform,
      (navigator as any).hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown'
    ].join('|');

    // Create a hash from fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex string
    const identifier = `u_${Math.abs(hash).toString(16).padStart(8, '0')}_${Date.now().toString(36)}`;
    
    // Store in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('_ui', identifier);
    
    return identifier;
  } catch (e) {
    // Fallback to timestamp-based ID
    return `u_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}


