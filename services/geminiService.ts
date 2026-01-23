// Gemini API service for chat completions
// Supports gemini-1.5-flash (fast) and gemini-1.5-pro (deep thinking)

interface GeminiStreamChunk {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Determine which Gemini model to use based on enableDeepThinking
   */
  private getModel(enableDeepThinking: boolean): string {
    return enableDeepThinking ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
  }

  /**
   * Stream chat completion from Gemini API
   */
  async streamChat(
    systemPrompt: string,
    userPrompt: string,
    enableDeepThinking: boolean = false,
    onChunk: (text: string) => void,
    timeout: number = 120000 // 2 minutes timeout
  ): Promise<string> {
    const model = this.getModel(enableDeepThinking);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nUser: ${userPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(`Gemini API Error (${response.status}): ${error.error?.message || response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Gemini API Error: No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let lastChunkTime = Date.now();
      const chunkTimeout = 30000; // 30 seconds between chunks

      try {
        while (true) {
          const now = Date.now();
          if (now - lastChunkTime > chunkTimeout) {
            throw new Error("Stream timeout: No data received for 30 seconds");
          }

          const { done, value } = await reader.read();
          if (done) break;

          lastChunkTime = Date.now();
          buffer += decoder.decode(value, { stream: true });
          
          // Gemini returns newline-delimited JSON
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;
            
            try {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              if (jsonStr === '[DONE]') {
                continue;
              }

              const chunk: GeminiStreamChunk = JSON.parse(jsonStr);
              
              if (chunk.error) {
                throw new Error(`Gemini API Error: ${chunk.error.message}`);
              }

              if (chunk.candidates && chunk.candidates.length > 0) {
                const candidate = chunk.candidates[0];
                if (candidate.content?.parts) {
                  for (const part of candidate.content.parts) {
                    if (part.text) {
                      fullText += part.text;
                      onChunk(part.text);
                      lastChunkTime = Date.now();
                    }
                  }
                }

                // Check if stream is finished
                if (candidate.finishReason) {
                  return fullText;
                }
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return fullText;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Request timeout: API took too long to respond");
      }
      throw error;
    }
  }

  /**
   * Non-streaming chat completion (for simple requests)
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    enableDeepThinking: boolean = false
  ): Promise<string> {
    const model = this.getModel(enableDeepThinking);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser: ${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Gemini API Error (${response.status}): ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content?.parts) {
      throw new Error("Gemini API Error: Empty response");
    }

    const parts = data.candidates[0].content.parts;
    const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text);
    
    return textParts.join('');
  }
}

export default GeminiService;


