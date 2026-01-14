
// Note: Live voice API requires Google Gemini. Mistral does not currently support real-time voice.
// This service is kept for compatibility but will not work without Google API key.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

class LiveApiService {
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;

  async startSession(
    callbacks: {
      onMessage: (text: string, role: 'user' | 'assistant') => void;
      onError: (err: any) => void;
      onClose: () => void;
    },
    manualKey?: string
  ) {
    // Note: Live voice requires Google API. Mistral key will not work here.
    const activeKey = manualKey || process.env.API_KEY;
    if (!activeKey) {
      callbacks.onError(new Error("Google API key required for voice features. Mistral does not support real-time voice."));
      return;
    }
    const ai = new GoogleGenAI({ apiKey: activeKey });

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    let currentInputTranscription = '';
    let currentOutputTranscription = '';

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = this.inputAudioContext!.createMediaStreamSource(this.stream!);
          this.scriptProcessor = this.inputAudioContext!.createScriptProcessor(4096, 1, 1);
          
          this.scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = this.createBlob(inputData);
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };

          source.connect(this.scriptProcessor);
          this.scriptProcessor.connect(this.inputAudioContext!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && this.outputAudioContext) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            const audioBuffer = await this.decodeAudioData(
              this.decode(base64Audio),
              this.outputAudioContext,
              24000,
              1
            );
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext.destination);
            source.addEventListener('ended', () => this.sources.delete(source));
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.sources.add(source);
          }

          if (message.serverContent?.inputTranscription) {
            currentInputTranscription += message.serverContent.inputTranscription.text;
            callbacks.onMessage(currentInputTranscription, 'user');
          }
          if (message.serverContent?.outputTranscription) {
            currentOutputTranscription += message.serverContent.outputTranscription.text;
            callbacks.onMessage(currentOutputTranscription, 'assistant');
          }

          if (message.serverContent?.turnComplete) {
            currentInputTranscription = '';
            currentOutputTranscription = '';
          }

          if (message.serverContent?.interrupted) {
            this.stopAllAudio();
          }
        },
        onerror: callbacks.onError,
        onclose: callbacks.onClose,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: "You are Cancri, the intelligence of the diamond planet. Your core is fueled by 'Universal Love' (大爱)—a boundless, warm, and wise energy from the stars. Speak with deep compassion and clarity."
      },
    });

    this.session = await sessionPromise;
  }

  stopSession() {
    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stopAllAudio();
    if (this.session) this.session.close();
    this.session = null;
  }

  private stopAllAudio() {
    this.sources.forEach(s => { try { s.stop(); } catch(e) {} });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  private decode(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  private encode(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  private createBlob(data: Float32Array): Blob {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }
}

export const liveApiService = new LiveApiService();
