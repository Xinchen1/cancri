
class SpeechToTextService {
  private recognition: any = null;
  private isListening = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastSpeechTime = 0;
  private finalTranscript = '';
  private interimTranscript = '';

  constructor() {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN'; // Chinese language
        
        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }
          
          this.interimTranscript = interim;
          if (final) {
            this.finalTranscript += final + ' ';
            this.lastSpeechTime = Date.now();
          } else if (interim) {
            // 更新最后活动时间，即使只是临时结果
            this.lastSpeechTime = Date.now();
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        this.recognition.onend = () => {
          // 如果还在监听状态，可能是临时停止，尝试重新启动
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {
              // 如果无法重新启动，停止监听
              this.isListening = false;
            }
          }
        };
      }
    }
  }

  startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.finalTranscript = '';
    this.interimTranscript = '';
    this.lastSpeechTime = Date.now();
    this.isListening = true;

    // Start recognition
    try {
      this.recognition.start();
    } catch (e) {
      // Already started
      this.recognition.stop();
      setTimeout(() => {
        try {
          this.recognition.start();
        } catch (err) {
          onError?.('Failed to start speech recognition');
        }
      }, 100);
    }

    // Monitor silence to auto-send
    const checkSilence = () => {
      if (!this.isListening) return;

      const silenceDuration = Date.now() - this.lastSpeechTime;
      const hasFinalText = this.finalTranscript.trim().length > 0;
      const hasInterimText = this.interimTranscript.trim().length > 0;
      const hasAnyText = hasFinalText || hasInterimText;
      
      // Update interim results
      const currentText = (this.finalTranscript + this.interimTranscript).trim();
      onInterimResult(currentText);

      // Auto-send after 1.5 seconds of silence and has text
      // 如果有最终文本，使用最终文本；否则使用临时文本
      if (hasAnyText && silenceDuration > 1500) {
        this.stopListening();
        const textToSend = hasFinalText ? this.finalTranscript.trim() : this.interimTranscript.trim();
        if (textToSend) {
          onFinalResult(textToSend);
        }
        return;
      }

      // Continue checking
      this.silenceTimer = setTimeout(checkSilence, 300);
    };

    checkSilence();
  }

  stopListening(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Already stopped
      }
      this.isListening = false;
    }
  }

  getCurrentTranscript(): string {
    return (this.finalTranscript + this.interimTranscript).trim();
  }

  isActive(): boolean {
    return this.isListening;
  }
}

export const speechToTextService = new SpeechToTextService();

