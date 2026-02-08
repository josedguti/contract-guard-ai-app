# Quick Start Guide

## Setup (5 minutes)

1. **Generate SESSION_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Update .env.local**:
```bash
# Copy the output from step 1
OPENAI_API_KEY=sk-your-key-here
SESSION_SECRET=paste-the-generated-secret-here
NODE_ENV=development
```

3. **Install and run**:
```bash
npm install
npm run dev
```

4. **Visit**: http://localhost:3000

## Test the Application

### Test Files Needed
Create a simple test contract (save as `test-contract.txt` then convert to PDF):

```
SERVICE AGREEMENT

This agreement is between Company A and Client B.

The client shall pay unlimited liability for any damages.
This contract automatically renews without notice.
The provider may modify terms at any time without consent.

Payment terms: Net 30 days
Service period: 12 months

The client shall indemnify and hold harmless the provider from any claims.
```

### Testing Steps

1. Go to http://localhost:3000
2. Click "Analyze Contract Now"
3. Upload your test PDF
4. Wait for OCR to complete (~10-30 seconds)
5. Review the analysis:
   - Should detect "Unlimited Liability" (CRITICAL)
   - Should detect "Auto-Renewal Without Notice" (HIGH)
   - Should detect "Unilateral Modification Rights" (HIGH)
   - Should show risk score > 60
   - Should display AI summary and recommendations

## What Gets Detected

The system currently detects 10+ types of risky clauses:

- ✅ Unlimited liability
- ✅ Auto-renewal without notice
- ✅ Unilateral modification rights
- ✅ Broad indemnification
- ✅ Broad IP assignment
- ✅ Severe penalties
- ✅ Inconvenient jurisdiction
- ✅ Difficult termination
- ✅ Perpetual confidentiality
- ✅ Complete warranty disclaimer

## Common Issues

### "OpenAI API error"
- Check your API key is valid
- Verify your OpenAI account has credits
- Check the key starts with `sk-`

### "OCR takes too long"
- Normal for multi-page PDFs (30-60 seconds)
- Try with a 1-page PDF first
- Check your internet connection (Tesseract loads from CDN)

### "Session limit reached"
- Clear browser cookies
- Or wait 24 hours for reset

### Build fails
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps

### Add More Detection Rules

Edit `src/data/reference/red-flags/unfair-terms.json`:

```json
{
  "id": "custom-001",
  "name": "Your Custom Rule",
  "category": "risk",
  "severity": "high",
  "patterns": [{
    "type": "phrase",
    "value": ["your search phrase"],
    "context": 200
  }],
  "description": "What this detects",
  "recommendation": "What to do"
}
```

### Customize Contract Templates

Edit files in `src/data/reference/templates/` to add required sections for different contract types.

### Deploy to Production

See README.md for Vercel deployment instructions.

## Support

- Documentation: README.md
- Issues: Open a GitHub issue
- Code structure: See "Project Structure" in README.md
