import { parse, isValid, addDays, addMonths, addYears } from 'date-fns';

/**
 * Date Parser Utility
 * Extracts and parses dates from contract text
 */

export interface ExtractedDate {
  date: Date;
  text: string;
  position: number;
  confidence: 'high' | 'medium' | 'low';
}

export class DateParser {
  // Common date patterns
  private static readonly DATE_PATTERNS = [
    // ISO format: 2024-01-15
    /\b\d{4}-\d{2}-\d{2}\b/g,
    // US format: 01/15/2024, 1/15/24
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    // European format: 15.01.2024
    /\b\d{1,2}\.\d{1,2}\.\d{4}\b/g,
    // Written format: January 15, 2024 or Jan 15, 2024
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi,
    // Day Month Year: 15 January 2024
    /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi,
  ];

  // Relative time patterns (e.g., "within 30 days", "14 days notice")
  private static readonly RELATIVE_PATTERNS = [
    /within\s+(\d+)\s+(days?|weeks?|months?|years?)/gi,
    /(\d+)\s+(days?|weeks?|months?|years?)\s+notice/gi,
    /(\d+)\s+(days?|weeks?|months?|years?)\s+prior/gi,
    /no\s+(?:less|fewer)\s+than\s+(\d+)\s+(days?|weeks?|months?|years?)/gi,
  ];

  /**
   * Extract all dates from text
   */
  static extractDates(text: string): ExtractedDate[] {
    const dates: ExtractedDate[] = [];

    // Extract absolute dates
    for (const pattern of this.DATE_PATTERNS) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const dateText = match[0];
        const parsedDate = this.parseDate(dateText);

        if (parsedDate) {
          dates.push({
            date: parsedDate,
            text: dateText,
            position: match.index || 0,
            confidence: 'high',
          });
        }
      }
    }

    return dates;
  }

  /**
   * Parse a date string into a Date object
   */
  static parseDate(dateStr: string): Date | null {
    // Try multiple date formats
    const formats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'M/d/yyyy',
      'MM/dd/yy',
      'M/d/yy',
      'dd.MM.yyyy',
      'MMMM d, yyyy',
      'MMM d, yyyy',
      'd MMMM yyyy',
      'd MMM yyyy',
    ];

    for (const format of formats) {
      try {
        const date = parse(dateStr, format, new Date());
        if (isValid(date)) {
          return date;
        }
      } catch {
        // Continue to next format
      }
    }

    return null;
  }

  /**
   * Extract relative time periods (e.g., "30 days", "3 months")
   */
  static extractRelativeTime(text: string): Array<{
    amount: number;
    unit: string;
    text: string;
    position: number;
  }> {
    const results: Array<{
      amount: number;
      unit: string;
      text: string;
      position: number;
    }> = [];

    for (const pattern of this.RELATIVE_PATTERNS) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        results.push({
          amount: parseInt(match[1]),
          unit: match[2].toLowerCase().replace(/s$/, ''), // Normalize to singular
          text: match[0],
          position: match.index || 0,
        });
      }
    }

    return results;
  }

  /**
   * Calculate future date from relative time
   */
  static calculateFutureDate(
    amount: number,
    unit: string,
    fromDate: Date = new Date()
  ): Date | null {
    try {
      switch (unit.toLowerCase()) {
        case 'day':
          return addDays(fromDate, amount);
        case 'week':
          return addDays(fromDate, amount * 7);
        case 'month':
          return addMonths(fromDate, amount);
        case 'year':
          return addYears(fromDate, amount);
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}
