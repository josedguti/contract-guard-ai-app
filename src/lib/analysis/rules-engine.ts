import { Rule, RuleMatch, RulePattern } from '@/types/rules';
import { ContractType, ContractTemplate } from '@/types/contract';
import {
  AnalysisResult,
  DetectedClause,
  MissingTerm,
  Obligation,
  RiskScore,
} from '@/types/analysis';
import { DateParser } from '@/lib/utils/date-parser';

// Import reference data
import unfairTerms from '@/data/reference/red-flags/unfair-terms.json';
import saasTemplate from '@/data/reference/templates/saas-contract.json';
import employmentTemplate from '@/data/reference/templates/employment-contract.json';
import ndaTemplate from '@/data/reference/templates/nda.json';

/**
 * Rules Engine
 * Core analysis orchestrator for detecting clauses, risks, and missing terms
 */
export class RulesEngine {
  private text: string;
  private textLower: string;
  private rules: Rule[];
  private templates: Map<ContractType, ContractTemplate>;

  constructor(text: string) {
    this.text = text;
    this.textLower = text.toLowerCase();
    this.rules = unfairTerms.rules as Rule[];

    // Load templates
    this.templates = new Map();
    this.templates.set('saas', saasTemplate as ContractTemplate);
    this.templates.set('employment', employmentTemplate as ContractTemplate);
    this.templates.set('nda', ndaTemplate as ContractTemplate);
  }

  /**
   * Run complete analysis
   */
  async analyze(): Promise<AnalysisResult> {
    const contractType = this.detectContractType();
    const detectedClauses = this.detectClauses();
    const missingTerms = this.checkMissingTerms(contractType);
    const obligations = this.parseObligations();
    const riskScore = this.calculateRiskScore(detectedClauses, missingTerms);

    return {
      metadata: {
        detectedType: contractType,
        confidence: this.getTypeConfidence(contractType),
        wordCount: this.text.split(/\s+/).length,
        extractedAt: new Date(),
      },
      riskScore,
      detectedClauses,
      missingTerms,
      obligations,
      analyzedAt: new Date(),
    };
  }

  /**
   * Detect contract type based on keywords
   */
  private detectContractType(): ContractType | null {
    let maxMatches = 0;
    let detectedType: ContractType | null = null;

    for (const [type, template] of this.templates) {
      let matches = 0;
      for (const identifier of template.identifiers) {
        if (this.textLower.includes(identifier.toLowerCase())) {
          matches++;
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        detectedType = type;
      }
    }

    return maxMatches > 0 ? detectedType : null;
  }

  /**
   * Get confidence score for contract type detection
   */
  private getTypeConfidence(type: ContractType | null): number {
    if (!type) return 0;

    const template = this.templates.get(type);
    if (!template) return 0;

    let matches = 0;
    for (const identifier of template.identifiers) {
      if (this.textLower.includes(identifier.toLowerCase())) {
        matches++;
      }
    }

    return Math.min(100, (matches / template.identifiers.length) * 100);
  }

  /**
   * Detect risky clauses using pattern matching
   */
  private detectClauses(): DetectedClause[] {
    const detectedClauses: DetectedClause[] = [];

    for (const rule of this.rules) {
      const matches = this.matchRule(rule);
      if (matches.length > 0) {
        detectedClauses.push({
          id: rule.id,
          rule,
          matches,
          severity: rule.severity,
        });
      }
    }

    return detectedClauses;
  }

  /**
   * Match a single rule against the text
   */
  private matchRule(rule: Rule): Array<{ text: string; position: number; context: string }> {
    const matches: Array<{ text: string; position: number; context: string }> = [];

    for (const pattern of rule.patterns) {
      const patternMatches = this.matchPattern(pattern);
      matches.push(...patternMatches);
    }

    // Remove duplicates
    const unique = matches.filter(
      (match, index, self) =>
        index === self.findIndex((m) => m.position === match.position)
    );

    return unique;
  }

  /**
   * Match a pattern against the text
   */
  private matchPattern(
    pattern: RulePattern
  ): Array<{ text: string; position: number; context: string }> {
    const matches: Array<{ text: string; position: number; context: string }> = [];

    switch (pattern.type) {
      case 'keyword':
      case 'phrase': {
        const values = Array.isArray(pattern.value) ? pattern.value : [pattern.value];
        for (const value of values) {
          const regex = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          let match;
          while ((match = regex.exec(this.text)) !== null) {
            matches.push({
              text: match[0],
              position: match.index,
              context: this.getContext(match.index, pattern.context || 200),
            });
          }
        }
        break;
      }

      case 'regex': {
        const regex = new RegExp(pattern.value as string, 'gi');
        let match;
        while ((match = regex.exec(this.text)) !== null) {
          matches.push({
            text: match[0],
            position: match.index,
            context: this.getContext(match.index, pattern.context || 200),
          });
        }
        break;
      }

      case 'proximity': {
        if (Array.isArray(pattern.value) && pattern.value.length >= 2) {
          const [term1, term2] = pattern.value;
          const proximity = pattern.proximity || 100;

          // Find all occurrences of term1
          const regex1 = new RegExp(term1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          let match1;

          while ((match1 = regex1.exec(this.text)) !== null) {
            // Look for term2 within proximity
            const searchStart = Math.max(0, match1.index - proximity);
            const searchEnd = Math.min(this.text.length, match1.index + match1[0].length + proximity);
            const searchText = this.text.slice(searchStart, searchEnd);

            if (searchText.toLowerCase().includes(term2.toLowerCase())) {
              matches.push({
                text: match1[0],
                position: match1.index,
                context: this.getContext(match1.index, pattern.context || 200),
              });
            }
          }
        }
        break;
      }
    }

    return matches;
  }

  /**
   * Get context around a position
   */
  private getContext(position: number, contextLength: number): string {
    const start = Math.max(0, position - contextLength / 2);
    const end = Math.min(this.text.length, position + contextLength / 2);
    let context = this.text.slice(start, end);

    // Add ellipsis if truncated
    if (start > 0) context = '...' + context;
    if (end < this.text.length) context = context + '...';

    return context.trim();
  }

  /**
   * Check for missing required terms
   */
  private checkMissingTerms(contractType: ContractType | null): MissingTerm[] {
    if (!contractType) return [];

    const template = this.templates.get(contractType);
    if (!template) return [];

    const missingTerms: MissingTerm[] = [];

    for (const section of template.requiredSections) {
      const found = section.keywords.some((keyword) =>
        this.textLower.includes(keyword.toLowerCase())
      );

      if (!found) {
        missingTerms.push({
          id: section.id,
          name: section.name,
          importance: section.importance,
          description: section.description || `Missing ${section.name} section`,
          recommendation: `Add a ${section.name} section to the contract`,
        });
      }
    }

    return missingTerms;
  }

  /**
   * Parse obligations and deadlines from text
   */
  private parseObligations(): Obligation[] {
    const obligations: Obligation[] = [];

    // Obligation patterns
    const obligationPatterns = [
      // "shall", "must", "will" followed by action
      /\b(?:shall|must|will|required to|obligated to)\s+([^.;]{10,200})/gi,
      // "responsible for"
      /\b(?:responsible for|responsibility to)\s+([^.;]{10,200})/gi,
      // Payment obligations
      /\b(?:pay|payment of|fee of|charge of)\s+([^.;]{10,200})/gi,
    ];

    for (const pattern of obligationPatterns) {
      let match;
      while ((match = pattern.exec(this.text)) !== null) {
        const text = match[0];
        const description = match[1].trim();

        // Determine obligation type
        let type: Obligation['type'] = 'other';
        if (/\b(?:pay|payment|fee|charge|invoice)\b/i.test(text)) {
          type = 'payment';
        } else if (/\b(?:deliver|provide|submit|send)\b/i.test(text)) {
          type = 'delivery';
        } else if (/\b(?:notice|notify|inform)\b/i.test(text)) {
          type = 'notice';
        } else if (/\b(?:deadline|due|within|before)\b/i.test(text)) {
          type = 'deadline';
        }

        // Try to extract dates
        const dates = DateParser.extractDates(text);
        const relativeTimes = DateParser.extractRelativeTime(text);

        obligations.push({
          id: `obligation-${obligations.length + 1}`,
          type,
          description,
          party: 'unknown', // Could be enhanced with NLP
          deadline: dates[0]?.date ||
                   (relativeTimes[0] ?
                    DateParser.calculateFutureDate(relativeTimes[0].amount, relativeTimes[0].unit) :
                    undefined),
          extractedText: text,
          position: match.index,
        });
      }
    }

    return obligations.slice(0, 20); // Limit to 20 most relevant
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(
    clauses: DetectedClause[],
    missingTerms: MissingTerm[]
  ): RiskScore {
    let score = 0;
    const breakdown = {
      criticalIssues: 0,
      highRiskClauses: 0,
      mediumRiskClauses: 0,
      lowRiskClauses: 0,
      missingTerms: 0,
    };

    // Score detected risky clauses
    for (const clause of clauses) {
      switch (clause.severity) {
        case 'critical':
          score += 25;
          breakdown.criticalIssues++;
          break;
        case 'high':
          score += 15;
          breakdown.highRiskClauses++;
          break;
        case 'medium':
          score += 8;
          breakdown.mediumRiskClauses++;
          break;
        case 'low':
          score += 3;
          breakdown.lowRiskClauses++;
          break;
      }
    }

    // Score missing terms
    for (const term of missingTerms) {
      switch (term.importance) {
        case 'critical':
          score += 15;
          breakdown.missingTerms++;
          break;
        case 'high':
          score += 10;
          breakdown.missingTerms++;
          break;
        case 'medium':
          score += 5;
          breakdown.missingTerms++;
          break;
        case 'low':
          score += 2;
          breakdown.missingTerms++;
          break;
      }
    }

    // Cap at 100
    score = Math.min(100, score);

    // Determine risk level
    let riskLevel: RiskScore['riskLevel'];
    if (score >= 70) {
      riskLevel = 'critical';
    } else if (score >= 50) {
      riskLevel = 'high';
    } else if (score >= 30) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      overall: score,
      breakdown,
      riskLevel,
    };
  }
}
