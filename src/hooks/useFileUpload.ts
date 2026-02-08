'use client';

import { useState, useCallback } from 'react';
import { FileValidator } from '@/lib/utils/file-validator';

export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((selectedFile: File) => {
    // Validate file
    const validation = FileValidator.validate(selectedFile);

    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    setError(null);
    return true;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return {
    file,
    error,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInput,
    clearFile,
  };
}
