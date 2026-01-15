
export enum AgentStatus {
  IDLE = 'idle',
  ROUTING = 'routing',
  THINKING = 'thinking',
  REFLECTING = 'reflecting',
  EVOLVING = 'evolving',
  SPEAKING = 'speaking',
  INDEXING = 'indexing',
  VOICE_ACTIVE = 'voice_active'
}

export enum AudioPreset {
  CELESTIAL = 'celestial',
  GROUNDING = 'grounding',
  FOCUS = 'focus',
  AWAKENING = 'awakening',
  LOVE = 'love',
  INTUITION = 'intuition'
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  timestamp: number;
  tokenCount?: number;
}

export interface CognitiveConfig {
  temperature: number;
  thinkingBudget: number;
  modelRoute: 'auto' | 'flash' | 'pro';
  enableDebate: boolean;
  mistralKey?: string; // Manual Mistral Key (required)
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    reflection?: string;
    debate?: {
      stage: 'drafting' | 'critiquing' | 'refining' | 'completed';
      draft?: string;
      critique?: string;
    };
    iterations?: number;
    modelUsed?: string;
    provider?: 'Mistral';
    fileProcessed?: string;
    isVoice?: boolean;
    isDeepThinking?: boolean;
  };
}

export interface LogEntry {
  id: string;
  timestamp: number;
  step: string;
  details: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface SemanticMemory {
  id: string;
  content: string;
  embedding: number[];
  timestamp: number;
  type: 'user_input' | 'agent_reflection' | 'fact' | 'document';
  source?: string;
  fileId?: string;
}
