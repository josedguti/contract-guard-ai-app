/**
 * File Validator
 * Validates uploaded files for type and size
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class FileValidator {
  static readonly ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
  ];

  static readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB

  static readonly ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

  /**
   * Validate file type and size
   */
  static validate(file: File): ValidationResult {
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      // Also check extension as fallback
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
        return {
          valid: false,
          error: 'Invalid file type. Please upload a PDF, Word document (DOC, DOCX), or image (JPG, PNG).',
        };
      }
    }

    // Check file size
    if (file.size > this.MAX_SIZE) {
      const maxSizeMB = this.MAX_SIZE / (1024 * 1024);
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit.`,
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty.',
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  static getExtension(filename: string): string {
    return filename.slice(filename.lastIndexOf('.')).toLowerCase();
  }

  /**
   * Check if file is PDF
   */
  static isPDF(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  /**
   * Check if file is image
   */
  static isImage(file: File): boolean {
    return (
      file.type.startsWith('image/') ||
      ['.jpg', '.jpeg', '.png'].includes(this.getExtension(file.name))
    );
  }

  /**
   * Check if file is Word document
   */
  static isWordDocument(file: File): boolean {
    return (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      ['.doc', '.docx'].includes(this.getExtension(file.name))
    );
  }
}
