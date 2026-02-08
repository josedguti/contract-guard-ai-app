'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Upload, ArrowLeft, FileText, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useOCR } from '@/hooks/useOCR';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function AnalyzePage() {
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const fileUpload = useFileUpload();
  const ocr = useOCR();
  const analysis = useAnalysis();

  const handleAnalyze = async () => {
    if (!fileUpload.file) return;

    try {
      setStep('processing');

      // Run OCR
      const text = await ocr.processFile(fileUpload.file);

      // Run analysis
      await analysis.analyze(text);

      setStep('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert({ children: 'Analysis failed. Please try again.', variant: 'error' });
    }
  };

  const handleReset = () => {
    fileUpload.clearFile();
    ocr.reset();
    analysis.reset();
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">ContractGuard</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyze Contract</h1>
            <p className="text-gray-600 mb-8">
              Upload your contract to get AI-powered insights and risk analysis
            </p>

            {/* Upload Zone */}
            <Card>
              <CardContent className="p-8">
                <div
                  onDrop={fileUpload.handleDrop}
                  onDragOver={fileUpload.handleDragOver}
                  onDragLeave={fileUpload.handleDragLeave}
                  className={`
                    border-2 border-dashed rounded-lg p-12 text-center transition-colors
                    ${fileUpload.isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${fileUpload.file ? 'bg-green-50 border-green-300' : ''}
                  `}
                >
                  {!fileUpload.file ? (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Drop your contract here
                      </h3>
                      <p className="text-gray-600 mb-4">or</p>
                      <label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={fileUpload.handleFileInput}
                          className="hidden"
                        />
                        <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                          Browse Files
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-4">
                        PDF, JPG, or PNG • Max 10MB
                      </p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {fileUpload.file.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={handleAnalyze}>
                          Analyze Contract
                        </Button>
                        <Button variant="outline" onClick={fileUpload.clearFile}>
                          Remove
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {fileUpload.error && (
                  <Alert variant="error" className="mt-4">
                    {fileUpload.error}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'processing' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Processing Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* OCR Progress */}
                  {ocr.isProcessing && (
                    <div>
                      <Progress
                        value={ocr.progress}
                        label="Extracting text with OCR"
                        variant="default"
                      />
                      <p className="text-sm text-gray-600 mt-2">{ocr.status}</p>
                    </div>
                  )}

                  {/* Analysis Progress */}
                  {analysis.isAnalyzing && (
                    <div>
                      <Progress
                        value={analysis.stage === 'rules' ? 50 : 100}
                        label="Analyzing contract"
                        variant="default"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        {analysis.stage === 'rules' ? 'Running rules engine...' : 'Generating AI insights...'}
                      </p>
                    </div>
                  )}

                  {ocr.error && (
                    <Alert variant="error">{ocr.error}</Alert>
                  )}

                  {analysis.error && (
                    <Alert variant="error">{analysis.error}</Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'results' && analysis.result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
              <Button variant="outline" onClick={handleReset}>
                Analyze Another
              </Button>
            </div>

            {/* Risk Score */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Risk Score</h2>
                    <p className="text-sm text-gray-600">Overall contract risk assessment</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${
                      analysis.result.riskScore.riskLevel === 'critical' ? 'text-red-600' :
                      analysis.result.riskScore.riskLevel === 'high' ? 'text-orange-600' :
                      analysis.result.riskScore.riskLevel === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {analysis.result.riskScore.overall}
                    </div>
                    <Badge variant={
                      analysis.result.riskScore.riskLevel === 'critical' ? 'error' :
                      analysis.result.riskScore.riskLevel === 'high' ? 'warning' :
                      analysis.result.riskScore.riskLevel === 'medium' ? 'warning' :
                      'success'
                    }>
                      {analysis.result.riskScore.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analysis.result.riskScore.breakdown.criticalIssues}
                    </div>
                    <div className="text-xs text-gray-600">Critical Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {analysis.result.riskScore.breakdown.highRiskClauses}
                    </div>
                    <div className="text-xs text-gray-600">High Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analysis.result.riskScore.breakdown.mediumRiskClauses}
                    </div>
                    <div className="text-xs text-gray-600">Medium Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.result.riskScore.breakdown.missingTerms}
                    </div>
                    <div className="text-xs text-gray-600">Missing Terms</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            {analysis.result.aiInsights && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{analysis.result.aiInsights.summary}</p>
                  </div>

                  {analysis.result.aiInsights.keyFindings.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Key Findings</h3>
                      <ul className="space-y-2">
                        {analysis.result.aiInsights.keyFindings.map((finding, i) => (
                          <li key={i} className="flex gap-2 text-gray-700">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.result.aiInsights.warnings.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Warnings</h3>
                      <ul className="space-y-2">
                        {analysis.result.aiInsights.warnings.map((warning, i) => (
                          <li key={i} className="flex gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.result.aiInsights.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                      <ul className="space-y-2">
                        {analysis.result.aiInsights.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-gray-700">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Detected Risky Clauses */}
            {analysis.result.detectedClauses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detected Risky Clauses ({analysis.result.detectedClauses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.result.detectedClauses.map((clause) => (
                      <div key={clause.id} className="border-l-4 border-red-500 pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{clause.rule.name}</h4>
                          <Badge variant={
                            clause.severity === 'critical' ? 'error' :
                            clause.severity === 'high' ? 'warning' :
                            'info'
                          }>
                            {clause.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{clause.rule.description}</p>
                        {clause.rule.recommendation && (
                          <p className="text-sm text-blue-700">
                            <strong>Recommendation:</strong> {clause.rule.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Terms */}
            {analysis.result.missingTerms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Missing Important Terms ({analysis.result.missingTerms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.result.missingTerms.map((term) => (
                      <div key={term.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{term.name}</h4>
                          <Badge variant="warning">{term.importance}</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{term.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
