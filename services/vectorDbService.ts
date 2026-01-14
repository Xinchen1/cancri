
// Vector database uses embedding API for document indexing/retrieval
import { SemanticMemory, FileMetadata } from "../types";

const DB_NAME = "Cancri_Akasha_Records";
const STORE_MEMORIES = "semantic_vectors";
const STORE_FILES = "archive_metadata";
const DB_VERSION = 2;

export interface IngestionProgress {
  percent: number;
  currentChunk: number;
  totalChunks: number;
}

class VectorDbService {
  private db: IDBDatabase | null = null;
  private userProvidedKey: string | null = null;
  private currentKeyIndex = 0;
  
  // Default API keys with fallback mechanism (same as conversation service)
  private readonly DEFAULT_API_KEYS = [
    'DTgY0qu4RdlxToCnyLXQtSR2shuJSpqB',
    'pY7VYlkMd4YpVnZGiPKxRzoyRoWwCGf7',
    'YiKPvyRkLI9ahjwcSC1VSa6xIH5r3TXyAIzaS'
  ];

  constructor() {
    this.initDB();
    // Load user-provided key from localStorage
    this.loadUserKey();
  }

  private loadUserKey() {
    try {
      this.userProvidedKey = localStorage.getItem('cancri_mistral_vault');
    } catch (e) {
      console.error("Failed to load Mistral API key:", e);
    }
  }

  // Get active API key: user-provided takes priority, otherwise use default keys
  private getActiveApiKey(): string | null {
    if (this.userProvidedKey && this.userProvidedKey.trim().length > 10) {
      return this.userProvidedKey;
    }
    return this.DEFAULT_API_KEYS[this.currentKeyIndex] || this.DEFAULT_API_KEYS[0];
  }

  // Get all keys to try (user key first, then defaults)
  private getKeysToTry(): string[] {
    if (this.userProvidedKey && this.userProvidedKey.trim().length > 10) {
      return [this.userProvidedKey];
    }
    return this.DEFAULT_API_KEYS;
  }

  // Public method to update API key (called when user saves settings)
  public updateMistralApiKey(key: string | null) {
    this.userProvidedKey = key;
    this.currentKeyIndex = 0; // Reset to first default key
    if (key) {
      try {
        localStorage.setItem('cancri_mistral_vault', key);
      } catch (e) {
        console.error("Failed to save Mistral API key:", e);
      }
    } else {
      try {
        localStorage.removeItem('cancri_mistral_vault');
      } catch (e) {}
    }
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject();
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_MEMORIES)) {
          db.createObjectStore(STORE_MEMORIES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          db.createObjectStore(STORE_FILES, { keyPath: "id" });
        }
        const memoryStore = request.transaction?.objectStore(STORE_MEMORIES);
        if (memoryStore && !memoryStore.indexNames.contains('fileId')) {
          memoryStore.createIndex('fileId', 'fileId', { unique: false });
        }
      };
    });
  }

  private async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // Reload user key in case it was updated
    this.loadUserKey();
    
    const keysToTry = this.getKeysToTry();
    let lastError: any = null;

    for (let i = 0; i < keysToTry.length; i++) {
      const key = keysToTry[i];
      
      try {
        const response = await fetch('https://api.mistral.ai/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'mistral-embed',
            input: texts
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Mistral Embedding API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          const results: number[][] = [];
          for (const item of data.data) {
            if (item && item.embedding && Array.isArray(item.embedding)) {
              results.push(item.embedding);
            } else {
              console.warn("Empty embedding returned for text chunk");
              results.push([]);
            }
          }
          
          // Success - update current key index for future use
          if (!this.userProvidedKey) {
            this.currentKeyIndex = i;
          }
          
          return results;
        } else {
          throw new Error("Invalid response format from Mistral Embedding API");
        }
      } catch (e: any) {
        lastError = e;
        console.warn(`Embedding API key ${i + 1}/${keysToTry.length} failed:`, e.message);
        
        // If this is not the last key, try the next one
        if (i < keysToTry.length - 1) {
          continue;
        }
      }
    }
    
    // All keys failed
    throw lastError || new Error("All Mistral API keys failed for embeddings");
  }

  async getIngestedFiles(): Promise<FileMetadata[]> {
    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction([STORE_FILES], "readonly");
      const store = transaction.objectStore(STORE_FILES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.db) return;
    const fileTx = this.db.transaction([STORE_FILES], "readwrite");
    fileTx.objectStore(STORE_FILES).delete(fileId);

    const allMemories = await this.getAllMemories();
    const memTx = this.db.transaction([STORE_MEMORIES], "readwrite");
    const memStore = memTx.objectStore(STORE_MEMORIES);
    allMemories.forEach(mem => {
      if (mem.fileId === fileId) memStore.delete(mem.id);
    });
  }

  async ingestDocument(text: string, filename: string, onProgress?: (p: IngestionProgress) => void): Promise<void> {
    if (!text.trim()) return;

    const files = await this.getIngestedFiles();
    if (files.length >= 5) {
      throw new Error("Akasha Slots Exhausted (5/5). Remove an archive in Settings.");
    }

    // Check token limit: 1 million tokens = ~3,800,000 characters (1 token ≈ 3.8 chars)
    const MAX_TOKENS = 1000000;
    const MAX_CHARS = MAX_TOKENS * 3.8; // ~3,800,000 characters
    const tokenCount = Math.ceil(text.length / 3.8);
    
    if (tokenCount > MAX_TOKENS) {
      throw new Error(`File exceeds token limit. Maximum: 1,000,000 tokens (~3.8M chars). Your file: ${tokenCount.toLocaleString()} tokens (~${(text.length / 1000000).toFixed(2)}M chars).`);
    }

    const fileId = crypto.randomUUID();
    const fileMeta: FileMetadata = {
      id: fileId,
      name: filename,
      size: text.length,
      timestamp: Date.now(),
      tokenCount: tokenCount
    };

    // Smaller chunks and larger overlap for much higher retrieval accuracy
    const chunkSize = 1000; 
    const overlap = 500;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
      chunks.push(text.substring(i, i + chunkSize));
      if (i + chunkSize >= text.length) break;
    }

    const batchSize = 5;
    const totalChunks = chunks.length;

    let successCount = 0;
    for (let i = 0; i < totalChunks; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await this.generateBatchEmbeddings(batch);
      
      if (embeddings.length === 0 && i === 0) {
        // First batch failed - likely no API key
        throw new Error("Failed to generate embeddings. Please ensure API key is configured in Settings for document indexing.");
      }
      
      const transaction = this.db!.transaction([STORE_MEMORIES], "readwrite");
      const store = transaction.objectStore(STORE_MEMORIES);
      
      batch.forEach((content, idx) => {
        if (embeddings[idx] && embeddings[idx].length > 0) {
          const memory: SemanticMemory = {
            id: crypto.randomUUID(),
            content,
            embedding: embeddings[idx],
            timestamp: Date.now(),
            type: 'document',
            source: filename,
            fileId
          };
          store.add(memory);
          successCount++;
        } else {
          console.warn(`Failed to generate embedding for chunk ${i + idx + 1}`);
        }
      });

      if (onProgress) {
        onProgress({
          percent: ((i + batch.length) / totalChunks) * 100,
          currentChunk: Math.min(i + batch.length, totalChunks),
          totalChunks: totalChunks
        });
      }
      
      await new Promise(r => setTimeout(r, 20));
    }

    if (successCount === 0) {
        throw new Error("No embeddings were generated. Please check your API key configuration.");
    }

    const tx = this.db!.transaction([STORE_FILES], "readwrite");
    tx.objectStore(STORE_FILES).add(fileMeta);
    
    console.log(`Successfully indexed ${successCount} chunks from ${filename}`);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Reload user key in case it was updated
    this.loadUserKey();
    
    const keysToTry = this.getKeysToTry();
    let lastError: any = null;

    for (let i = 0; i < keysToTry.length; i++) {
      const key = keysToTry[i];
      
      try {
        const response = await fetch('https://api.mistral.ai/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'mistral-embed',
            input: [text]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Mistral Embedding API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0 && data.data[0] && data.data[0].embedding) {
          // Success - update current key index for future use
          if (!this.userProvidedKey) {
            this.currentKeyIndex = i;
          }
          return data.data[0].embedding;
        }
        
        throw new Error("Invalid response format from Mistral Embedding API");
      } catch (e: any) {
        lastError = e;
        console.warn(`Embedding API key ${i + 1}/${keysToTry.length} failed:`, e.message);
        
        // If this is not the last key, try the next one
        if (i < keysToTry.length - 1) {
          continue;
        }
      }
    }
    
    // All keys failed
    console.error("All Mistral API keys failed for embedding generation");
    return [];
  }

  async remember(text: string, type: SemanticMemory['type'], source?: string, fileId?: string): Promise<void> {
    if (!this.db || !text.trim()) return;
    try {
      const embedding = await this.generateEmbedding(text);
      if (embedding.length === 0) return;

      const memory: SemanticMemory = {
        id: crypto.randomUUID(),
        content: text,
        embedding,
        timestamp: Date.now(),
        type,
        source,
        fileId
      };
      const transaction = this.db.transaction([STORE_MEMORIES], "readwrite");
      transaction.objectStore(STORE_MEMORIES).add(memory);
    } catch (e) {}
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return (magA === 0 || magB === 0) ? 0 : dotProduct / (magA * magB);
  }

  async recall(query: string, limit: number = 20): Promise<string[]> {
    if (!this.db) {
      console.warn("Vector database not initialized");
      return [];
    }
    try {
      const qVec = await this.generateEmbedding(query);
      if (qVec.length === 0) {
        console.warn("Query embedding generation failed. Cannot retrieve memories.");
        return [];
      }

      const allMemories = await this.getAllMemories();
      if (allMemories.length === 0) {
        console.log("No memories found in database");
        return [];
      }

      console.log(`Searching ${allMemories.length} memories for query: "${query.substring(0, 50)}..."`);

      // Lowered threshold to 0.35 for more sensitive retrieval (was 0.45)
      const results = allMemories
        .map(mem => ({ 
          content: `[DATA SOURCE: ${mem.source || 'Archive'}] ${mem.content}`, 
          score: this.cosineSimilarity(qVec, mem.embedding),
          source: mem.source
        }))
        .sort((a, b) => b.score - a.score)
        .filter(m => m.score > 0.35) // Lower threshold for better recall
        .slice(0, limit);

      console.log(`Found ${results.length} relevant memories (scores: ${results.map(r => r.score.toFixed(3)).join(', ')})`);
      
      return results.map(m => m.content);
    } catch (e: any) {
      console.error("Memory recall failed:", e.message);
      return [];
    }
  }

  private getAllMemories(): Promise<SemanticMemory[]> {
    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction([STORE_MEMORIES], "readonly");
      const store = transaction.objectStore(STORE_MEMORIES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }
}

export const vectorDbService = new VectorDbService();
