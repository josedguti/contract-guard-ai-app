/**
 * Contract Types
 */
export type ContractType = 'saas' | 'employment' | 'nda' | 'service-agreement' | 'general';

export interface ContractTemplate {
  contractType: ContractType;
  displayName: string;
  identifiers: string[]; // Keywords to identify this contract type
  requiredSections: RequiredSection[];
}

export interface RequiredSection {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  description?: string;
}

/**
 * Contract Metadata
 */
export interface ContractMetadata {
  detectedType: ContractType | null;
  confidence: number; // 0-100
  pageCount?: number;
  wordCount: number;
  extractedAt: Date;
}
