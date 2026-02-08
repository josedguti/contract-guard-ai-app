import { NextRequest, NextResponse } from 'next/server';
import { OpenAIClient } from '@/lib/ai/openai-client';
import { AnalysisResult } from '@/types/analysis';

/**
 * Analyze contract with AI
 * POST /api/analyze
 *
 * Request body:
 * {
 *   extractedText: string,
 *   rulesAnalysis: Partial<AnalysisResult>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { extractedText, rulesAnalysis } = body;

    // Validate input
    if (!extractedText || typeof extractedText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: extractedText is required' },
        { status: 400 }
      );
    }

    if (extractedText.length < 50) {
      return NextResponse.json(
        { success: false, error: 'Text too short for analysis' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { success: false, error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Generate AI insights
    const openai = new OpenAIClient(apiKey);
    const aiInsights = await openai.generateInsights(extractedText, rulesAnalysis);

    return NextResponse.json({
      success: true,
      aiInsights,
    });
  } catch (error) {
    console.error('Error in analyze endpoint:', error);

    // Check if it's an OpenAI API error
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key configuration' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'AI service rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
