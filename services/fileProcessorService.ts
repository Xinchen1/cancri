
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

export interface ProcessedFile {
  name: string;
  content: string;
  type: 'text' | 'image' | 'word';
}

class FileProcessorService {
  /**
   * 处理上传的文件，提取文本内容
   */
  async processFile(file: File, onProgress?: (progress: number) => void): Promise<ProcessedFile> {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // 判断文件类型
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)) {
      // 图片文件 - 使用 OCR
      onProgress?.(10);
      const text = await this.extractTextFromImage(file, onProgress);
      return {
        name: file.name,
        content: text,
        type: 'image'
      };
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      /\.(docx|doc)$/i.test(fileName)
    ) {
      // Word 文档
      onProgress?.(10);
      const text = await this.extractTextFromWord(file, onProgress);
      return {
        name: file.name,
        content: text,
        type: 'word'
      };
    } else {
      // 文本文件（txt, md, json 等）
      onProgress?.(50);
      const text = await file.text();
      onProgress?.(100);
      return {
        name: file.name,
        content: text,
        type: 'text'
      };
    }
  }

  /**
   * 从图片中提取文本（OCR）
   */
  private async extractTextFromImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(20);
      
      // 使用 Tesseract.js 进行 OCR
      // 支持中文和英文
      const { data: { text } } = await Tesseract.recognize(file, 'chi_sim+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // 进度从 20% 到 90%
            const progress = 20 + (m.progress * 70);
            onProgress?.(Math.min(progress, 90));
          }
        }
      });

      onProgress?.(100);
      return text.trim() || `[图片识别完成，但未检测到文字内容]`;
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error(`图片识别失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 从 Word 文档中提取文本
   */
  private async extractTextFromWord(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(30);
      
      // 读取文件为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      onProgress?.(50);
      
      // 使用 mammoth 提取文本
      // mammoth 只支持 .docx，不支持旧的 .doc 格式
      const result = await mammoth.extractRawText({ arrayBuffer });
      onProgress?.(90);
      
      let text = result.value.trim();
      
      // 如果有警告，记录但不阻止处理
      if (result.messages.length > 0) {
        console.warn('Word document parsing warnings:', result.messages);
        // 可以在文本末尾添加警告信息
        if (text) {
          text += '\n\n[注意: 文档解析过程中有一些格式可能未完全保留]';
        }
      }
      
      onProgress?.(100);
      return text || `[Word 文档解析完成，但未检测到文字内容]`;
    } catch (error) {
      console.error('Word parsing error:', error);
      
      // 如果是 .doc 格式（旧格式），提示用户
      if (file.name.toLowerCase().endsWith('.doc')) {
        throw new Error('不支持旧的 .doc 格式，请转换为 .docx 格式后重试');
      }
      
      throw new Error(`Word 文档解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const fileProcessorService = new FileProcessorService();



