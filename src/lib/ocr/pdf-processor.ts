/**
 * PDF Processor
 * Converts PDF pages to images for OCR processing
 */

// PDF.js will be dynamically imported when needed
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfjsLib() {
  if (!pdfjsLib && typeof window !== 'undefined') {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjsLib!;
}

export interface PDFPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

export class PDFProcessor {
  /**
   * Convert PDF file to array of image URLs
   */
  static async convertToImages(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<PDFPage[]> {
    const pdfjs = await getPdfjsLib();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const pages: PDFPage[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      // Convert canvas to image URL
      const imageUrl = canvas.toDataURL('image/png');

      pages.push({
        pageNumber: pageNum,
        imageUrl,
        width: viewport.width,
        height: viewport.height,
      });

      // Report progress
      if (onProgress) {
        onProgress((pageNum / numPages) * 100);
      }
    }

    return pages;
  }

  /**
   * Get number of pages in PDF
   */
  static async getPageCount(file: File): Promise<number> {
    const pdfjs = await getPdfjsLib();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  }
}
