# Quick Start: Axe-Core Accessibility Scanning

## 🚀 Run a Scan (2 options)

### Option 1: Full Browser Scan (Recommended)
```bash
node live-scan.js https://www.example.com
```
- Uses system Chrome
- Full JavaScript rendering
- Complete accessibility testing
- Output: `axe-results-live.json`

### Option 2: Static HTML Scan (Fast)
```bash
node jsdom-scan.js https://www.example.com
```
- No browser needed
- Quick analysis
- Limited to initial HTML
- Output: `axe-results.json`

---

## 📚 Documentation

- **[SCANNING-GUIDE.md](SCANNING-GUIDE.md)** - Detailed usage guide and comparison
- **[GRANT-CHROMIUM-ACCESS.md](GRANT-CHROMIUM-ACCESS.md)** - How to grant firewall access to bundled Chromium

---

## ✅ What's Working

Both scripts are fully functional and ready to use.

**Why two scripts?**
- `live-scan.js` uses system Chrome (which your network allows)
- `jsdom-scan.js` doesn't need a browser (always works)

---

## 🔧 Troubleshooting

**"Could not find system Chrome"**
→ Install Chrome: https://www.google.com/chrome/

**Network/connection errors**
→ Check VPN/firewall settings

**Want to use bundled Chromium?**
→ See [GRANT-CHROMIUM-ACCESS.md](GRANT-CHROMIUM-ACCESS.md)

---

## 📊 Example Results

Bank of America scan found:
- 5 violations (including missing alt text, color contrast issues)
- 42 passes
- 4 incomplete (need manual review)

Results include:
- Impact level (Critical/Serious/Moderate/Minor)
- WCAG criteria
- Affected elements
- Code examples
- Fix recommendations
