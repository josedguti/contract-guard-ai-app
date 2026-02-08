/**
 * Rule Pattern Types
 * Defines how the rules engine matches text patterns
 */
export type PatternType = 'keyword' | 'phrase' | 'regex' | 'proximity';

export interface RulePattern {
  type: PatternType;
  value: string | string[];
  context?: number; // characters before/after for context
  proximity?: number; // max distance between terms for 'proximity' type
}

/**
 * Rule Definition
 * Core structure for detection rules
 */
export type RuleCategory = 'risk' | 'missing' | 'obligation';
export type RuleSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Rule {
  id: string;
  name: string;
  category: RuleCategory;
  severity: RuleSeverity;
  patterns: RulePattern[];
  description: string;
  recommendation?: string;
}

/**
 * Rule Match Result
 */
export interface RuleMatch {
  rule: Rule;
  matches: Array<{
    text: string;
    position: number;
    context: string;
  }>;
}
