
import { apiService } from "./apiService";
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
  
  // Default API keys with fallback mechanism (same as mistralService)
  private readonly DEFAULT_API_KEYS = [
    'DTgY0qu4RdlxToCnyLXQtSR2shuJSpqB',
    'pY7VYlkMd4YpVnZGiPKxRzoyRoWwCGf7',
    'YiKPvyRkLI9ahjwcSC1VSa6xIH5r3TXyAIzaS'
  ];

  constructor() {
    this.initDB();
  }
  
  private async tryWithFallback<T>(
    fn: (key: string) => Promise<T>,
    keys: string[],
    onError?: (error: Error, index: number) => void
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < keys.length; i++) {
      try {
        return await fn(keys[i]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (onError) {
          onError(lastError, i);
        }
        if (i < keys.length - 1) {
          // Wait a bit before trying next key
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    throw lastError || new Error("All API keys failed");
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
    // Use default API keys (no user key needed for document upload)
    const keysToTry = this.DEFAULT_API_KEYS;
    const results: number[][] = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.tryWithFallback(
          async (key) => {
            return await apiService.embed({ text, apiKey: key });
          },
          keysToTry,
          (error, index) => {
            if (index < keysToTry.length - 1) {
              console.warn(`Embedding API key ${index + 1} failed, trying next...`);
            }
          }
        );
        
        if (embedding && embedding.length > 0) {
          results.push(embedding);
        }
      } catch (e) {
        console.error("Embedding chunk failed", e);
        // Push empty array to maintain batch order
        results.push([]);
      }
    }
    return results;
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

    const fileId = crypto.randomUUID();
    const fileMeta: FileMetadata = {
      id: fileId,
      name: filename,
      size: text.length,
      timestamp: Date.now(),
      tokenCount: Math.ceil(text.length / 3.8)
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

    for (let i = 0; i < totalChunks; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await this.generateBatchEmbeddings(batch);
      
      const transaction = this.db!.transaction([STORE_MEMORIES], "readwrite");
      const store = transaction.objectStore(STORE_MEMORIES);
      
      batch.forEach((content, idx) => {
        if (embeddings[idx]) {
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

    const tx = this.db!.transaction([STORE_FILES], "readwrite");
    tx.objectStore(STORE_FILES).add(fileMeta);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Use default API keys (no user key needed for document recall)
    const keysToTry = this.DEFAULT_API_KEYS;
    
    try {
      return await this.tryWithFallback(
        async (key) => {
          return await apiService.embed({ text, apiKey: key });
        },
        keysToTry,
        (error, index) => {
          if (index < keysToTry.length - 1) {
            console.warn(`Embedding API key ${index + 1} failed, trying next...`);
          }
        }
      );
    } catch (e) {
      console.error("Embedding generation failed", e);
      return [];
    }
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
    if (!this.db) return [];
    try {
      const qVec = await this.generateEmbedding(query);
      if (qVec.length === 0) return [];

      const allMemories = await this.getAllMemories();
      // Lowered threshold to 0.45 for much more sensitive retrieval
      return allMemories
        .map(mem => ({ content: `[DATA SOURCE: ${mem.source || 'Archive'}] ${mem.content}`, score: this.cosineSimilarity(qVec, mem.embedding) }))
        .sort((a, b) => b.score - a.score)
        .filter(m => m.score > 0.45)
        .slice(0, limit)
        .map(m => m.content);
    } catch (e) { return []; }
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
