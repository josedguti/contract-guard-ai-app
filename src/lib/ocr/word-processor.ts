/**
 * Word Document Processor
 * Extracts text from .docx files using mammoth
 */

import mammoth from 'mammoth';

export class WordProcessor {
  /**
   * Extract text from a Word document (.docx)
   */
  static async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const result = await mammoth.extractRawText({
        arrayBuffer: arrayBuffer
      });

      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text could be extracted from the Word document');
      }

      // Log any messages/warnings from mammoth
      if (result.messages.length > 0) {
        console.warn('Word processing messages:', result.messages);
      }

      return result.value;
    } catch (error) {
      console.error('Word processing error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }
}
