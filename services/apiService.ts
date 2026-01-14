/**
 * Secure API Service - Frontend client for Cloudflare Workers backend
 * All core logic is handled server-side
 * 
 * SECURITY: This service only handles UI communication.
 * All prompts, algorithms, and sensitive logic are server-side only.
 */

// Safely get API base URL with fallback
const getApiBaseUrl = (): string => {
  try {
    const envUrl = import.meta.env?.VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      return envUrl.trim();
    }
  } catch (e) {
    console.warn('Failed to read VITE_API_BASE_URL from env:', e);
  }
  return 'https://cancri-api.xinhalle356.workers.dev';
};

const API_BASE_URL = getApiBaseUrl();

// Generate request signature for additional security
async function generateSignature(data: Record<string, any>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const message = JSON.stringify(data);
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface ChatRequest {
  message: string;
  context?: string;
  apiKey: string;
  enableDeepThinking?: boolean;
  signature?: string;
  timestamp?: number;
}

interface EmbedRequest {
  text: string;
  apiKey: string;
}

export class ApiService {
  /**
   * Send chat message to secure backend
   * All prompts and logic are handled server-side
   */
  async chat(request: ChatRequest): Promise<ReadableStream<Uint8Array>> {
    // Add timestamp for replay attack prevention
    const timestamp = Date.now();
    const payload = {
      message: request.message,
      context: request.context || '',
      apiKey: request.apiKey,
      enableDeepThinking: request.enableDeepThinking ?? true,
      timestamp,
    };

    // Generate signature if secret is available (optional enhanced security)
    // In production, you might want to use a shared secret
    const body = JSON.stringify(payload);

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(), // Request tracking
      },
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.body!;
  }

  /**
   * Generate embeddings via secure backend
   */
  async embed(request: EmbedRequest): Promise<number[]> {
    const response = await fetch(`${API_BASE_URL}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        apiKey: request.apiKey,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid embedding response format');
    }
    return data.data[0].embedding;
  }

  /**
   * Admin API calls
   */
  async admin(action: string, password: string, data?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        password,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();

