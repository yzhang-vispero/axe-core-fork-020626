const puppeteer = require('puppeteer');
const axe = require('axe-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const url = process.argv[2] || 'https://www.bankofamerica.com';
  
  console.log(`\n🔍 Scanning: ${url}\n`);
  
  // Find system Chrome
  const possibleChromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe')
  ];
  
  let chromePath = null;
  for (const p of possibleChromePaths) {
    if (fs.existsSync(p)) {
      chromePath = p;
      break;
    }
  }
  
  if (!chromePath) {
    console.error('❌ Could not find system Chrome. Install Chrome or use jsdom-scan.js instead.');
    process.exit(1);
  }
  
  console.log(`✓ Using system Chrome: ${chromePath}\n`);
  
  let browser;
  try {
    // Launch with system Chrome (this works on your network!)
    browser = await puppeteer.launch({
      executablePath: chromePath,
      args: ['--disable-web-security']
    });
    
    const page = await browser.newPage();
    console.log('Loading page...');
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('Page loaded. Injecting axe-core...');
    
    // Inject axe-core
    await page.addScriptTag({ path: require.resolve('axe-core') });
    
    console.log('Running accessibility scan...\n');
    
    // Run axe
    const results = await page.evaluate(async () => {
      return await axe.run();
    });
    
    // Display results
    console.log('=== ACCESSIBILITY SCAN RESULTS ===\n');
    console.log(`URL: ${url}`);
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Test Engine: ${results.testEngine.name} ${results.testEngine.version}`);
    console.log(`\n--- SUMMARY ---`);
    console.log(`Violations: ${results.violations.length}`);
    console.log(`Passes: ${results.passes.length}`);
    console.log(`Incomplete: ${results.incomplete.length}`);
    console.log(`Inapplicable: ${results.inapplicable.length}`);
    
    if (results.violations.length > 0) {
      console.log(`\n--- VIOLATIONS (Top 15) ---`);
      results.violations.slice(0, 15).forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   Impact: ${violation.impact?.toUpperCase() || 'UNKNOWN'}`);
        console.log(`   WCAG: ${violation.tags.filter(t => t.startsWith('wcag')).join(', ')}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
        if (violation.nodes.length > 0 && violation.nodes[0].html) {
          const htmlSnippet = violation.nodes[0].html.length > 100 
            ? violation.nodes[0].html.substring(0, 100) + '...'
            : violation.nodes[0].html;
          console.log(`   Example: ${htmlSnippet}`);
        }
        console.log(`   More info: ${violation.helpUrl}`);
      });
      
      if (results.violations.length > 15) {
        console.log(`\n... and ${results.violations.length - 15} more violations`);
      }
    }
    
    if (results.incomplete.length > 0) {
      console.log(`\n--- INCOMPLETE (Needs manual review) - Top 5 ---`);
      results.incomplete.slice(0, 5).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.id} - ${item.help}`);
        console.log(`   Affected elements: ${item.nodes.length}`);
      });
      
      if (results.incomplete.length > 5) {
        console.log(`\n... and ${results.incomplete.length - 5} more incomplete checks`);
      }
    }
    
    // Save full results
    const outputFile = 'axe-results-live.json';
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\n✓ Full results saved to: ${outputFile}`);
    console.log('\n✓ Scan completed using system Chrome (full JS rendering included!)\n');
    
    await browser.close();
    
  } catch (error) {
    console.error('\n❌ Error during scan:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
