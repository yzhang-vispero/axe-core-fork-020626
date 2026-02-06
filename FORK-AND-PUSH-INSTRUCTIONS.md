# Fork and Push Instructions

All your accessibility scanning work has been committed to the local `develop` branch in the axe-core repository.

**Commit:** `e27aa5ba - Add accessibility scanning tools and comparative analysis`

## What Was Changed

✅ **ARC-RulesEngine**: No changes (only used CLI)  
✅ **axe-core**: All new files committed (11 files, 38,054 insertions)

## Files Added to axe-core

**Scanning Scripts:**
- `live-scan.js` - Full browser-based scanning using system Chrome
- `jsdom-scan.js` - Static HTML scanning for restricted environments
- `compare-scanners.js` - Statistical comparison tool

**Documentation:**
- `SCANNING-README.md` - Quick start guide
- `SCANNING-GUIDE.md` - Detailed usage guide
- `GRANT-CHROMIUM-ACCESS.md` - Firewall configuration guide
- `SCANNER-COMPARISON-DETAILED.md` - Complete scanner comparison analysis

**Sample Results:**
- `axe-results-live.json` - Live scan results (945 KB)
- `axe-results.json` - JSDOM scan results (52 KB)
- `arc-results.json` - ARC scan results (48 KB)
- `scanner-comparison.json` - Comparison metrics

## Step 1: Fork the Repository on GitHub

1. Go to: https://github.com/dequelabs/axe-core
2. Click the **Fork** button (top right)
3. Select your personal GitHub account as the destination
4. Wait for the fork to complete

## Step 2: Add Your Fork as a Remote

```bash
cd c:/repos/axe-core

# Add your fork (replace YOUR_USERNAME with your actual GitHub username)
git remote add myfork https://github.com/YOUR_USERNAME/axe-core.git

# Verify the remote was added
git remote -v
```

You should see:
```
origin    https://github.com/dequelabs/axe-core.git (fetch)
origin    https://github.com/dequelabs/axe-core.git (push)
myfork    https://github.com/YOUR_USERNAME/axe-core.git (fetch)
myfork    https://github.com/YOUR_USERNAME/axe-core.git (push)
```

## Step 3: Push to Your Fork

```bash
# Push the develop branch to your fork
git push myfork develop
```

If you want to create a separate branch for this work:

```bash
# Create a new branch from develop
git checkout -b accessibility-scanning-tools

# Push the new branch to your fork
git push -u myfork accessibility-scanning-tools
```

## Step 4: Verify on GitHub

1. Go to your fork: `https://github.com/YOUR_USERNAME/axe-core`
2. Switch to the `develop` branch (or your custom branch)
3. Verify all 11 files are present
4. Check the commit message appears correctly

## Alternative: Use GitHub CLI

If you have [GitHub CLI](https://cli.github.com/) installed:

```bash
cd c:/repos/axe-core

# Create fork (if not already forked)
gh repo fork dequelabs/axe-core --remote-name myfork

# Push to your fork
git push myfork develop
```

## Why Only axe-core?

- **axe-core**: Contains all your custom scanning scripts, documentation, and comparison work
- **ARC-RulesEngine**: Unchanged - you only used the existing CLI tool

You only need to fork and save the axe-core repository.

## What's Preserved

Your work is now saved locally and ready to push:

✅ Two working scan scripts (live + JSDOM)  
✅ Complete documentation suite  
✅ Scanner comparison analysis with metrics  
✅ Sample scan results from Bank of America  
✅ Network troubleshooting guide  

## Need to Make More Changes?

If you want to add or modify files before pushing:

```bash
# Make your changes, then:
git add <files>
git commit -m "Your commit message"
git push myfork develop
```

## Questions?

- **Which branch?** Your changes are on `develop` (the current branch)
- **Multiple commits?** All changes are in a single commit: `e27aa5ba`
- **Large files?** The JSON results are big but under GitHub's limits
- **Private fork?** You can make your fork private in GitHub settings after creation
