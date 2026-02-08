'use client';

import { useState, useCallback } from 'react';
import { RulesEngine } from '@/lib/analysis/rules-engine';
import { AnalysisResult } from '@/types/analysis';

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'idle' | 'rules' | 'ai' | 'complete'>('idle');

  const analyze = useCallback(async (text: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setStage('rules');

      // Run rules engine analysis
      const engine = new RulesEngine(text);
      const rulesResult = await engine.analyze();

      setStage('ai');

      // Call AI analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractedText: text,
          rulesAnalysis: rulesResult,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Combine results
      const finalResult: AnalysisResult = {
        ...rulesResult,
        aiInsights: data.aiInsights,
      };

      setResult(finalResult);
      setStage('complete');
      setIsAnalyzing(false);

      return finalResult;
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
      setStage('idle');
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsAnalyzing(false);
    setError(null);
    setStage('idle');
  }, []);

  return {
    result,
    isAnalyzing,
    error,
    stage,
    analyze,
    reset,
  };
}
