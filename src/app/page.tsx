import Link from "next/link";
import { FileText, Shield, Zap, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              ContractGuard
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Understand Your Contracts
            <span className="block text-blue-600 mt-2">Before You Sign</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload any legal contract and get AI-powered insights in plain
            English. Identify risks, missing terms, and hidden obligations
            instantly.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            <FileText className="h-5 w-5" />
            Analyze Contract Now
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Free to use • No signup required
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Privacy-First
            </h3>
            <p className="text-gray-600 text-center">
              Your documents are processed locally in your browser. No files are
              stored on our servers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              AI-Powered Analysis
            </h3>
            <p className="text-gray-600 text-center">
              GPT-5 provides plain-English summaries and identifies risks you
              might miss in your contracts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Instant Results
            </h3>
            <p className="text-gray-600 text-center">
              Upload PDF, Word, or image files. Get a full and comprehensive
              analysis in under a minute.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Upload Contract
              </h4>
              <p className="text-sm text-gray-700">
                Drag and drop your PDF or image file
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                OCR Extraction
              </h4>
              <p className="text-sm text-gray-700">
                Text is extracted from your document
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-700">
                Risks, obligations, and missing terms identified
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Review Results
              </h4>
              <p className="text-sm text-gray-700">
                Get actionable insights and recommendations
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600 text-sm">
        <p>
          ContractGuard is for informational purposes only and does not
          constitute legal advice.
        </p>
        <p className="mt-2">
          Always consult with a qualified attorney for legal matters.
        </p>
      </footer>
    </div>
  );
}
