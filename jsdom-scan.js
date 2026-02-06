const { JSDOM } = require('jsdom');
const { execSync } = require('child_process');
const fs = require('fs');

// Create a temporary DOM for axe to load
const tempDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = tempDom.window;
global.document = tempDom.window.document;

// Now require axe after globals are set
const axe = require('axe-core');

(async () => {
  const url = process.argv[2] || 'https://www.bankofamerica.com';
  
  console.log(`\nFetching HTML from: ${url}`);
  
  try {
    // Fetch HTML using curl
    const html = execSync(`curl -s -L --max-time 15 "${url}"`, { 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 
    });
    
    if (!html || html.length < 100) {
      throw new Error('Failed to fetch HTML or HTML is too small');
    }
    
    console.log(`HTML fetched (${html.length} bytes)`);
    console.log('Running axe-core analysis...\n');
    
    // Create JSDOM instance
    const dom = new JSDOM(html, {
      url: url,
      contentType: 'text/html',
      includeNodeLocations: true
    });
    
    // Replace globals with the actual page
    global.window = dom.window;
    global.document = dom.window.document;
    
    // Configure axe
    const options = {
      rules: {
        // Disable rules that don't work well in JSDOM
        'color-contrast': { enabled: false },
        'link-in-text-block': { enabled: false }
      }
    };
    
    // Run axe - pass just document, axe will use the globals
    const results = await axe.run(options);
    
    // Clean up globals
    delete global.window;
    delete global.document;
    
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
    
    // Save full results to file
    const outputFile = 'axe-results.json';
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\n✓ Full results saved to: ${outputFile}`);
    console.log('\nNote: This scan is based on the initial HTML only and does not include JavaScript-rendered content.');
    console.log('Some rules (like color-contrast) are disabled as they require a real browser environment.');
    console.log('\n✓ Scan completed\n');
    
  } catch (error) {
    console.error('\n❌ Error during scan:', error.message);
    process.exit(1);
  }
})();
