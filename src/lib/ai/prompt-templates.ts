import { AnalysisResult } from "@/types/analysis";

/**
 * Prompt Templates for OpenAI GPT-4
 */

export class PromptTemplates {
  /**
   * Build system prompt for legal analysis
   */
  static getSystemPrompt(): string {
    return `You are an expert legal analyst specializing in contract review. Your role is to:
1. Provide plain-English summaries of complex legal language
2. Identify key risks and red flags in contracts
3. Offer practical recommendations for negotiation
4. Explain legal implications in terms non-lawyers can understand

Guidelines:
- Be concise and actionable
- Focus on the most important issues first
- Use clear, simple language
- Provide specific recommendations
- Highlight critical risks prominently
- Be objective and balanced`;
  }

  /**
   * Build user prompt with contract text and rules analysis
   */
  static buildAnalysisPrompt(
    contractText: string,
    rulesAnalysis: Partial<AnalysisResult>,
  ): string {
    const { riskScore, detectedClauses, missingTerms, obligations } =
      rulesAnalysis;

    // Truncate contract text if too long (stay under token limits)
    const maxTextLength = 6000; // Approximately 1500 tokens
    const truncatedText =
      contractText.length > maxTextLength
        ? contractText.slice(0, maxTextLength) +
          "\n\n[...text truncated for length...]"
        : contractText;

    let prompt = `Please analyze this contract and provide insights:\n\n`;

    // Add risk score context
    if (riskScore) {
      prompt += `## Automated Risk Assessment\n`;
      prompt += `Overall Risk Score: ${riskScore.overall}/100 (${riskScore.riskLevel} risk)\n`;
      prompt += `- Critical Issues: ${riskScore.breakdown.criticalIssues}\n`;
      prompt += `- High Risk Clauses: ${riskScore.breakdown.highRiskClauses}\n`;
      prompt += `- Medium Risk Clauses: ${riskScore.breakdown.mediumRiskClauses}\n`;
      prompt += `- Missing Terms: ${riskScore.breakdown.missingTerms}\n\n`;
    }

    // Add detected risky clauses
    if (detectedClauses && detectedClauses.length > 0) {
      prompt += `## Detected Risky Clauses\n`;
      detectedClauses.slice(0, 5).forEach((clause) => {
        prompt += `- ${clause.rule.name} (${clause.severity}): ${clause.rule.description}\n`;
      });
      prompt += "\n";
    }

    // Add missing terms
    if (missingTerms && missingTerms.length > 0) {
      prompt += `## Missing Important Terms\n`;
      missingTerms.slice(0, 5).forEach((term) => {
        prompt += `- ${term.name} (${term.importance}): ${term.description}\n`;
      });
      prompt += "\n";
    }

    // Add obligations
    if (obligations && obligations.length > 0) {
      prompt += `## Key Obligations Found\n`;
      obligations.slice(0, 5).forEach((obligation) => {
        prompt += `- ${obligation.type}: ${obligation.description}\n`;
      });
      prompt += "\n";
    }

    prompt += `## Contract Text\n${truncatedText}\n\n`;

    prompt += `## Your Analysis\n`;
    prompt += `Please provide:\n`;
    prompt += `1. **Summary** (2-3 sentences): What is this contract about?\n`;
    prompt += `2. **Key Findings** (3-4 bullet points): Most important things to know\n`;
    prompt += `3. **Recommendations** (3-4 bullet points): Specific actions to take\n`;
    prompt += `4. **Critical Warnings** (if any): Urgent issues that need immediate attention\n\n`;
    prompt += `Keep your response concise and actionable. Focus on what matters most.`;

    return prompt;
  }

  /**
   * Parse AI response into structured format
   */
  static parseAIResponse(response: string): {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    warnings: string[];
  } {
    const sections = {
      summary: "",
      keyFindings: [] as string[],
      recommendations: [] as string[],
      warnings: [] as string[],
    };

    // Try numbered format with period: "1. Summary"
    const summaryMatch = response.match(
      /1\.\s*Summary[^\n]*\n(.*?)(?=\n\d\.|$)/is,
    );
    if (summaryMatch) {
      sections.summary = this.cleanSummaryText(summaryMatch[1].trim());
    } else {
      // Try with parenthesis: "1) Summary"
      const summaryMatchParen = response.match(
        /1\)\s*Summary[^\n]*\n(.*?)(?=\n\d\)|$)/is,
      );
      if (summaryMatchParen) {
        sections.summary = this.cleanSummaryText(summaryMatchParen[1].trim());
      } else {
        // Fallback to markdown format: "**Summary**"
        const summaryMatchMd = response.match(
          /\*\*Summary\*\*[:\s]*(.*?)(?=\*\*|$)/is,
        );
        if (summaryMatchMd) {
          sections.summary = this.cleanSummaryText(summaryMatchMd[1].trim());
        }
      }
    }

    // Extract Key Findings (case-insensitive)
    const keyFindingsMatch = response.match(
      /2\.\s*Key [Ff]indings[^\n]*\n(.*?)(?=\n\d\.|$)/is,
    );
    if (keyFindingsMatch) {
      sections.keyFindings = this.extractBulletPoints(keyFindingsMatch[1]);
    } else {
      const keyFindingsMatchParen = response.match(
        /2\)\s*Key [Ff]indings[^\n]*\n(.*?)(?=\n\d\)|$)/is,
      );
      if (keyFindingsMatchParen) {
        sections.keyFindings = this.extractBulletPoints(keyFindingsMatchParen[1]);
      } else {
        const keyFindingsMatchMd = response.match(
          /\*\*Key Findings\*\*[:\s]*(.*?)(?=\*\*|$)/is,
        );
        if (keyFindingsMatchMd) {
          sections.keyFindings = this.extractBulletPoints(keyFindingsMatchMd[1]);
        }
      }
    }

    // Extract Recommendations
    const recommendationsMatch = response.match(
      /3\.\s*Recommendations[^\n]*\n(.*?)(?=\n\d\.|$)/is,
    );
    if (recommendationsMatch) {
      sections.recommendations = this.extractBulletPoints(
        recommendationsMatch[1],
      );
    } else {
      const recommendationsMatchParen = response.match(
        /3\)\s*Recommendations[^\n]*\n(.*?)(?=\n\d\)|$)/is,
      );
      if (recommendationsMatchParen) {
        sections.recommendations = this.extractBulletPoints(
          recommendationsMatchParen[1],
        );
      } else {
        const recommendationsMatchMd = response.match(
          /\*\*Recommendations\*\*[:\s]*(.*?)(?=\*\*|$)/is,
        );
        if (recommendationsMatchMd) {
          sections.recommendations = this.extractBulletPoints(
            recommendationsMatchMd[1],
          );
        }
      }
    }

    // Extract Warnings (case-insensitive)
    const warningsMatch = response.match(
      /4\.\s*Critical [Ww]arnings[^\n]*\n(.*?)(?=\n\d\.|$)/is,
    );
    if (warningsMatch) {
      sections.warnings = this.extractBulletPoints(warningsMatch[1]);
    } else {
      const warningsMatchParen = response.match(
        /4\)\s*Critical [Ww]arnings[^\n]*\n(.*?)(?=\n\d\)|$)/is,
      );
      if (warningsMatchParen) {
        sections.warnings = this.extractBulletPoints(warningsMatchParen[1]);
      } else {
        const warningsMatchMd = response.match(
          /\*\*(?:Critical )?Warnings?\*\*[:\s]*(.*?)(?=\*\*|$)/is,
        );
        if (warningsMatchMd) {
          sections.warnings = this.extractBulletPoints(warningsMatchMd[1]);
        }
      }
    }

    return sections;
  }

  /**
   * Clean summary text by removing leading bullets/dashes
   */
  private static cleanSummaryText(text: string): string {
    // Remove leading dashes, bullets, or asterisks
    return text.replace(/^[-*•]\s*/, '').trim();
  }

  /**
   * Extract bullet points from text
   */
  private static extractBulletPoints(text: string): string[] {
    const lines = text.split("\n");
    const bullets: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Match lines starting with -, *, or numbers
      const match = trimmed.match(/^[-*•\d.]+\s*(.+)$/);
      if (match) {
        bullets.push(match[1].trim());
      } else if (trimmed.length > 0 && !trimmed.match(/^\*\*/)) {
        // Include non-empty lines that aren't section headers
        bullets.push(trimmed);
      }
    }

    return bullets.filter((b) => b.length > 0);
  }
}
