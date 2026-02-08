import OpenAI from "openai";
import { PromptTemplates } from "./prompt-templates";
import { AnalysisResult, AIInsights } from "@/types/analysis";

/**
 * OpenAI Client
 * Wrapper for OpenAI API calls
 */
export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generate AI insights for contract analysis
   */
  async generateInsights(
    contractText: string,
    rulesAnalysis: Partial<AnalysisResult>,
  ): Promise<AIInsights> {
    try {
      const systemPrompt = PromptTemplates.getSystemPrompt();
      const userPrompt = PromptTemplates.buildAnalysisPrompt(
        contractText,
        rulesAnalysis,
      );

      // Combine system and user prompts into single input for GPT-5
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

      // Use the new GPT-5 responses API
      const response = await this.client.responses.create({
        model: "gpt-5-mini",
        input: combinedPrompt,
      });

      const responseText = response.output_text || "";

      // Parse structured response
      const parsed = PromptTemplates.parseAIResponse(responseText);

      return {
        summary: parsed.summary || "AI analysis unavailable",
        keyFindings: parsed.keyFindings,
        recommendations: parsed.recommendations,
        warnings: parsed.warnings,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI insights. Please try again.");
    }
  }

  /**
   * Test API key validity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
