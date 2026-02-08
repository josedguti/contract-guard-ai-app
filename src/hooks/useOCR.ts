'use client';

import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { PDFProcessor } from '@/lib/ocr/pdf-processor';
import { TextCleaner } from '@/lib/ocr/text-cleaner';
import { FileValidator } from '@/lib/utils/file-validator';

export function useOCR() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setStatus('Preparing...');

      const isPDF = FileValidator.isPDF(file);
      let images: string[] = [];

      if (isPDF) {
        setStatus('Converting PDF to images...');
        const pdfPages = await PDFProcessor.convertToImages(file, (prog) => {
          setProgress(prog * 0.3); // PDF conversion is 30% of progress
        });
        images = pdfPages.map((page) => page.imageUrl);
      } else {
        images = [URL.createObjectURL(file)];
      }

      setStatus('Extracting text with OCR...');

      let fullText = '';
      for (let i = 0; i < images.length; i++) {
        const { data } = await Tesseract.recognize(images[i], 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pageProgress = m.progress / images.length;
              const totalProgress = 30 + (i / images.length) * 70 + pageProgress * 70;
              setProgress(totalProgress);
            }
          },
        });

        fullText += data.text + '\n\n';
      }

      setStatus('Cleaning text...');
      const cleanedText = TextCleaner.clean(fullText);

      if (cleanedText.length < 50) {
        throw new Error('Extracted text too short. The document may be unreadable or empty.');
      }

      const quality = TextCleaner.assessQuality(cleanedText);
      if (quality < 30) {
        console.warn('Low quality OCR result:', quality);
      }

      setExtractedText(cleanedText);
      setProgress(100);
      setStatus('Complete');
      setIsProcessing(false);

      return cleanedText;
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setExtractedText('');
    setProgress(0);
    setStatus('');
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    extractedText,
    progress,
    status,
    isProcessing,
    error,
    processFile,
    reset,
  };
}
