# ContractGuard - Legal Contract Analysis Web Application

A privacy-first web application that helps users understand legal contracts by uploading documents (PDFs/images), extracting text via OCR, analyzing the content for risks and missing terms, and providing AI-powered plain-English summaries.

## Features

- **Privacy-First**: Files processed client-side with OCR, never permanently stored
- **AI-Powered Analysis**: OpenAI GPT-4 provides plain-English summaries and recommendations
- **Risk Detection**: Automatically detects unfair clauses, liability issues, and risky terms
- **Missing Terms Detection**: Identifies important clauses that should be present
- **Obligations Parser**: Extracts key obligations and deadlines
- **Session Limits**: 3 free scans per 24-hour session
- **Secure**: HTTPS enforced, HTTP-only cookies, no permanent data storage

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **OCR**: Tesseract.js (client-side) + pdfjs-dist
- **AI**: OpenAI GPT-4
- **Session Management**: JWT (jose library) in HTTP-only cookies
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key (get one at https://platform.openai.com)

## Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd legal-contract-analyzer
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:

Create a `.env.local` file in the root directory:

```env
# OpenAI API Key - REQUIRED
OPENAI_API_KEY=your-openai-api-key-here

# Session Secret for JWT signing (minimum 32 characters) - REQUIRED
SESSION_SECRET=your-minimum-32-character-random-secret-here

# Environment
NODE_ENV=development
```

**To generate a secure SESSION_SECRET**, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Visit the landing page and click "Analyze Contract Now"
2. Upload a PDF or image file (max 10MB)
3. Wait for OCR to extract text (progress bar shown)
4. Review the analysis results:
   - Overall risk score
   - AI-generated summary and recommendations
   - Detected risky clauses
   - Missing important terms
   - Key obligations and deadlines

## Project Structure

```
legal-contract-analyzer/
├── src/
│   ├── app/                      # Next.js app router pages
│   │   ├── page.tsx             # Landing page
│   │   ├── analyze/page.tsx     # Main analysis interface
│   │   └── api/                 # API routes
│   │       ├── analyze/         # OpenAI GPT-4 endpoint
│   │       └── session/         # Session management
│   ├── components/
│   │   └── ui/                  # Reusable UI components
│   ├── lib/
│   │   ├── ocr/                 # OCR processing (Tesseract)
│   │   ├── analysis/            # Rules engine
│   │   ├── ai/                  # OpenAI integration
│   │   ├── session/             # JWT session management
│   │   └── utils/               # Utilities
│   ├── data/reference/          # Detection rules (JSON)
│   │   ├── red-flags/           # Risky clause definitions
│   │   └── templates/           # Contract type templates
│   ├── types/                   # TypeScript definitions
│   └── hooks/                   # React custom hooks
├── .env.local                   # Environment variables (not committed)
├── next.config.ts
└── package.json
```

## How It Works

### 1. Upload & OCR
- User uploads PDF or image
- Client-side OCR extracts text using Tesseract.js
- For PDFs, each page is converted to an image first

### 2. Rules Engine Analysis (Client-Side)
- Pattern matching detects risky clauses
- Checks for missing required terms
- Extracts obligations and deadlines
- Calculates risk score (0-100)

### 3. AI Analysis (Server-Side)
- Sends extracted text + rules results to API
- OpenAI GPT-4 generates plain-English insights
- Returns summary, key findings, and recommendations

### 4. Session Management
- JWT token tracks scan count
- HTTP-only cookie, 24-hour expiration
- 3 scans per session limit

## Customization

### Adding New Detection Rules

Edit files in `src/data/reference/red-flags/`:

```json
{
  "rules": [
    {
      "id": "custom-rule-001",
      "name": "Your Rule Name",
      "category": "risk",
      "severity": "high",
      "patterns": [
        {
          "type": "phrase",
          "value": ["search phrase 1", "search phrase 2"],
          "context": 200
        }
      ],
      "description": "What this rule detects",
      "recommendation": "What to do about it"
    }
  ]
}
```

### Adding Contract Types

Edit files in `src/data/reference/templates/`:

```json
{
  "contractType": "custom-type",
  "displayName": "Custom Contract Type",
  "identifiers": ["keyword1", "keyword2"],
  "requiredSections": [
    {
      "id": "section-id",
      "name": "Section Name",
      "importance": "high",
      "keywords": ["term1", "term2"],
      "description": "Why this section matters"
    }
  ]
}
```

## Deployment to Vercel

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `SESSION_SECRET`
     - `NODE_ENV=production`
   - Deploy

3. **Post-Deployment**:
   - Verify HTTPS is working
   - Test with sample contract
   - Check session management
   - Verify security headers

## Security Features

- ✅ Client-side OCR (files never sent to server)
- ✅ HTTP-only session cookies
- ✅ JWT token signing with secret
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ File size and type validation
- ✅ No permanent data storage
- ✅ OpenAI API key server-side only

## Performance

- OCR: ~30 seconds for 5-page PDF
- Rules analysis: <2 seconds
- AI summary: ~10 seconds
- Total: ~45 seconds for typical contract

## Limitations

- Maximum file size: 10MB
- Supported formats: PDF, JPG, PNG
- OCR accuracy depends on document quality
- 3 scans per 24-hour session
- English language only (OCR and analysis)

## Troubleshooting

### OCR fails with "Worker not found"
- Ensure Tesseract CDN is accessible
- Check browser console for errors
- Try refreshing the page

### AI analysis fails
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has credits
- Review server logs for errors

### Session not working
- Verify `SESSION_SECRET` is set (min 32 chars)
- Clear browser cookies
- Check if cookies are enabled

### Build errors
- Run `npm install` again
- Delete `node_modules` and `.next`, then reinstall
- Check Node.js version (18+ required)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## License

This project is for educational and demonstration purposes. Not intended as a substitute for professional legal advice.

## Disclaimer

**ContractGuard is for informational purposes only and does not constitute legal advice. Always consult with a qualified attorney for legal matters.**

## Support

For issues or questions, please open an issue on GitHub.

---

Built with Next.js 15, TypeScript, and OpenAI GPT-4
