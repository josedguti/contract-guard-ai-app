import { Rule, RuleMatch } from './rules';
import { ContractType, ContractMetadata } from './contract';

/**
 * Detected Clause
 */
export interface DetectedClause {
  id: string;
  rule: Rule;
  matches: Array<{
    text: string;
    position: number;
    context: string;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Missing Term
 */
export interface MissingTerm {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

/**
 * Obligation
 */
export interface Obligation {
  id: string;
  type: 'payment' | 'delivery' | 'notice' | 'deadline' | 'other';
  description: string;
  party: 'you' | 'them' | 'both' | 'unknown';
  deadline?: Date | string;
  extractedText: string;
  position: number;
}

/**
 * Risk Score Breakdown
 */
export interface RiskScore {
  overall: number; // 0-100
  breakdown: {
    criticalIssues: number;
    highRiskClauses: number;
    mediumRiskClauses: number;
    lowRiskClauses: number;
    missingTerms: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * AI Insights
 */
export interface AIInsights {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  warnings: string[];
}

/**
 * Complete Analysis Result
 */
export interface AnalysisResult {
  metadata: ContractMetadata;
  riskScore: RiskScore;
  detectedClauses: DetectedClause[];
  missingTerms: MissingTerm[];
  obligations: Obligation[];
  aiInsights?: AIInsights;
  analyzedAt: Date;
}

/**
 * Analysis Progress
 */
export interface AnalysisProgress {
  stage: 'ocr' | 'rules' | 'ai' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}
