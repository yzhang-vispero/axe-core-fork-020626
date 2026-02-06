# Axe-Core Accessibility Scanning Scripts

This directory contains working scripts for scanning websites for accessibility issues using axe-core.

## Working Scripts

### 1. `live-scan.js` - Full Browser Scan (Recommended)

**Best for:** Complete accessibility testing with JavaScript-rendered content

Scans live URLs using your system Chrome browser with full page rendering.

**Usage:**
```bash
node live-scan.js <url>
```

**Examples:**
```bash
node live-scan.js https://www.bankofamerica.com
node live-scan.js https://www.example.com
```

**Features:**
- ✅ Full JavaScript execution
- ✅ Scans dynamically loaded content
- ✅ Complete color contrast testing
- ✅ All axe-core rules enabled
- ✅ Saves detailed JSON report

**Output:** `axe-results-live.json`

---

### 2. `jsdom-scan.js` - Static HTML Scan

**Best for:** Quick scans when browser automation is restricted

Fetches HTML and analyzes it without browser rendering.

**Usage:**
```bash
node jsdom-scan.js <url>
```

**Examples:**
```bash
node jsdom-scan.js https://www.bankofamerica.com
node jsdom-scan.js https://www.example.com
```

**Features:**
- ✅ Works without browser automation permissions
- ✅ Fast execution
- ✅ Scans initial HTML structure
- ⚠️  Limited to static HTML (no JavaScript rendering)
- ⚠️  Color contrast checks disabled

**Output:** `axe-results.json`

---

## Network Configuration Notes

Your environment has network policies that differentiate between:
- **Allowed:** System Chrome.exe (legitimate browser)
- **Blocked:** Bundled Chromium from npm packages (seen as automation)

This is why `live-scan.js` uses `executablePath` to point to system Chrome.

---

## How Results Are Presented

Both scripts display:
1. **Violations** - Accessibility issues found
2. **Passes** - Rules that passed
3. **Incomplete** - Items requiring manual review
4. **Inapplicable** - Rules that don't apply to the page

Each violation includes:
- Rule ID and description
- Impact level (Critical, Serious, Moderate, Minor)
- WCAG criteria
- Number of affected elements
- Example HTML snippet
- Link to documentation

---

## Comparison

| Feature | live-scan.js | jsdom-scan.js |
|---------|--------------|---------------|
| JavaScript execution | ✅ Yes | ❌ No |
| Color contrast testing | ✅ Yes | ❌ No |
| Dynamic content | ✅ Yes | ❌ No |
| Works without Chrome access | ❌ No | ✅ Yes |
| Speed | Slower | ⚡ Fast |
| Recommended for | Production testing | Quick checks |

---

## Troubleshooting

### If `live-scan.js` fails with "Could not find system Chrome"

Install Google Chrome from: https://www.google.com/chrome/

### If both scripts fail with network errors

Check your VPN/network connection. The scripts require internet access to fetch pages.

### If you get permission errors

Your firewall/security policy may have changed. Contact your IT administrator.
