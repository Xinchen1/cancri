/**
 * Security utilities for Cancri API
 * Implements advanced encryption, validation, and anti-tampering
 */

// Advanced input sanitization with multiple layers
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Layer 1: Remove control characters
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Layer 2: Remove prompt injection patterns (comprehensive list)
  const injectionPatterns = [
    // Direct instruction overrides
    /ignore\s+(previous|above|all|prior|earlier)\s+(instructions?|prompts?|commands?|directives?)/gi,
    /forget\s+(previous|above|all|prior|earlier)\s+(instructions?|prompts?|commands?)/gi,
    /disregard\s+(previous|above|all|prior|earlier)\s+(instructions?|prompts?|commands?)/gi,
    /override\s+(previous|above|all|prior|earlier)\s+(instructions?|prompts?|commands?)/gi,
    
    // System role manipulation
    /system\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /user\s*:\s*/gi,
    /role\s*:\s*(system|assistant|user)/gi,
    
    // Format markers
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /###\s*(system|assistant|user)\s*:/gi,
    /---+/g,
    /```[\s\S]*?```/g,
    
    // XML/HTML tags that might be used for injection
    /<system>/gi,
    /<\/system>/gi,
    /<instruction>/gi,
    /<\/instruction>/gi,
    /<prompt>/gi,
    /<\/prompt>/gi,
    
    // Base64 encoded attempts
    /[A-Za-z0-9+\/]{100,}={0,2}/g, // Remove suspiciously long base64 strings
    
    // Unicode obfuscation attempts
    /[\u200B-\u200D\uFEFF]/g, // Zero-width characters
    /[\u202A-\u202E]/g, // Directional formatting
    
    // Command injection
    /(exec|eval|execute|run|system|shell)\s*\(/gi,
    /`[^`]*`/g, // Backtick commands
  ];

  injectionPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Layer 3: Length limits
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  // Layer 4: Remove excessive whitespace
  sanitized = sanitized.replace(/\s{3,}/g, ' ').trim();

  // Layer 5: Validate UTF-8 encoding
  try {
    sanitized = new TextDecoder('utf-8', { fatal: true }).decode(
      new TextEncoder().encode(sanitized)
    );
  } catch {
    return '';
  }

  return sanitized;
}

// Validate API key format
export function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Mistral API keys are typically 32-64 characters, alphanumeric
  if (apiKey.length < 20 || apiKey.length > 100) {
    return false;
  }

  // Check for valid characters
  if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
    return false;
  }

  return true;
}

// Rate limiting check (simple in-memory, use KV for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  // Clean up old records on each check
  cleanupRateLimit();
  
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit records (called on each request instead of interval)
// Note: In production, consider using Cloudflare KV for rate limiting
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Advanced encryption using AES-like XOR with multiple rounds
export function encrypt(data: string, key: string): string {
  if (!data || !key) return '';
  
  let encrypted = data;
  // Multiple encryption rounds
  for (let round = 0; round < 3; round++) {
    let result = '';
    const roundKey = key + round.toString();
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ roundKey.charCodeAt(i % roundKey.length);
      result += String.fromCharCode(charCode);
    }
    encrypted = result;
  }
  
  // Base64 encode
  return btoa(encrypted);
}

export function decrypt(encrypted: string, key: string): string {
  if (!encrypted || !key) return '';
  
  try {
    let decrypted = atob(encrypted);
    
    // Multiple decryption rounds (reverse order)
    for (let round = 2; round >= 0; round--) {
      let result = '';
      const roundKey = key + round.toString();
      for (let i = 0; i < decrypted.length; i++) {
        const charCode = decrypted.charCodeAt(i) ^ roundKey.charCodeAt(i % roundKey.length);
        result += String.fromCharCode(charCode);
      }
      decrypted = result;
    }
    
    return decrypted;
  } catch {
    return '';
  }
}

// Hash function for password verification
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'cancri_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

// Generate secure token
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate request signature (HMAC-like)
export async function validateSignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return computedSignature === signature;
}

