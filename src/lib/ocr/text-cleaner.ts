/**
 * Text Cleaner
 * Post-OCR text cleanup and normalization
 */

export class TextCleaner {
  /**
   * Clean and normalize OCR-extracted text
   */
  static clean(text: string): string {
    let cleaned = text;

    // Remove excessive whitespace
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // Normalize line breaks (max 2 consecutive)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Fix common OCR errors
    cleaned = this.fixCommonErrors(cleaned);

    // Remove page numbers and headers/footers patterns
    cleaned = this.removePageArtifacts(cleaned);

    // Trim each line
    cleaned = cleaned
      .split('\n')
      .map((line) => line.trim())
      .join('\n');

    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Fix common OCR recognition errors
   */
  private static fixCommonErrors(text: string): string {
    let fixed = text;

    // Common character substitutions
    const substitutions: Record<string, string> = {
      '\\b0\\b': 'O', // Zero to letter O
      '\\bl\\b': 'I', // lowercase L to I in isolation
      '\\|': 'I', // Pipe to I
      '\u2018': "'", // Smart quote to regular
      '\u2019': "'", // Smart quote to regular
      '\u201C': '"', // Smart quote to regular
      '\u201D': '"', // Smart quote to regular
      '\u2014': '-', // Em dash to hyphen
      '\u2013': '-', // En dash to hyphen
    };

    for (const [pattern, replacement] of Object.entries(substitutions)) {
      fixed = fixed.replace(new RegExp(pattern, 'g'), replacement);
    }

    return fixed;
  }

  /**
   * Remove page numbers and common header/footer patterns
   */
  private static removePageArtifacts(text: string): string {
    let cleaned = text;

    // Remove standalone page numbers
    cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');

    // Remove "Page X of Y" patterns
    cleaned = cleaned.replace(/^\s*Page\s+\d+\s+of\s+\d+\s*$/gim, '');

    // Remove common footer patterns
    cleaned = cleaned.replace(/^\s*[-_=]{3,}\s*$/gm, '');

    return cleaned;
  }

  /**
   * Extract meaningful sentences (min length filter)
   */
  static extractSentences(text: string, minLength: number = 10): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences
      .map((s) => s.trim())
      .filter((s) => s.length >= minLength);
  }

  /**
   * Get word count
   */
  static getWordCount(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Calculate text quality score (0-100)
   */
  static assessQuality(text: string): number {
    let score = 100;

    // Penalize if too short
    if (text.length < 100) {
      score -= 30;
    }

    // Penalize high rate of special characters (indicates poor OCR)
    const specialChars = (text.match(/[^\w\s.,;:'"!?-]/g) || []).length;
    const specialCharRate = specialChars / text.length;
    if (specialCharRate > 0.05) {
      score -= 30;
    }

    // Penalize high rate of single characters (poor OCR)
    const words = text.split(/\s+/);
    const singleChars = words.filter((w) => w.length === 1).length;
    const singleCharRate = singleChars / words.length;
    if (singleCharRate > 0.1) {
      score -= 20;
    }

    // Reward presence of legal terms
    const legalTerms = [
      'agreement',
      'contract',
      'party',
      'shall',
      'terms',
      'conditions',
      'liability',
    ];
    const foundTerms = legalTerms.filter((term) =>
      text.toLowerCase().includes(term)
    ).length;
    score += foundTerms * 2;

    return Math.max(0, Math.min(100, score));
  }
}
