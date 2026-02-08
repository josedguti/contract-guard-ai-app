/**
 * Tesseract.js Configuration
 * Setup and configuration for OCR processing
 */

export const TESSERACT_CONFIG = {
  workerPath: '/tesseract/worker.min.js',
  langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/src/lang-data',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
};

export const OCR_SETTINGS = {
  lang: 'eng',
  oem: 1, // LSTM only
  psm: 3, // Fully automatic page segmentation
};

export interface OCRProgress {
  status: string;
  progress: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
}
