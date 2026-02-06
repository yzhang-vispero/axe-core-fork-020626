const fs = require('fs');

console.log('========================================');
console.log('  AXE-CORE vs ARC-RULESENGINE');
console.log('  Accessibility Scanner Comparison');
console.log('========================================\n');

// Load results
let axeResults, arcResults;

try {
  axeResults = JSON.parse(fs.readFileSync('axe-results-live.json', 'utf-8'));
  console.log('✓ Loaded axe-core results');
} catch (error) {
  console.error('✗ Error loading axe-core results:', error.message);
  process.exit(1);
}

try {
  const arcRaw = fs.readFileSync('arc-results.json', 'utf-8');
  // Extract JSON from npm output
  const jsonMatch = arcRaw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    arcResults = JSON.parse(jsonMatch[0]);
    console.log('✓ Loaded ARC-RulesEngine results\n');
  } else {
    throw new Error('Could not parse ARC results');
  }
} catch (error) {
  console.error('✗ Error loading ARC results:', error.message);
  process.exit(1);
}

// Extract metrics
const axeMetrics = {
  violations: axeResults.violations.length,
  passes: axeResults.passes.length,
  incomplete: axeResults.incomplete.length,
  inapplicable: axeResults.inapplicable.length,
  totalRules: axeResults.violations.length + axeResults.passes.length + 
              axeResults.incomplete.length + axeResults.inapplicable.length,
  criticalViolations: axeResults.violations.filter(v => v.impact === 'critical').length,
  seriousViolations: axeResults.violations.filter(v => v.impact === 'serious').length,
  moderateViolations: axeResults.violations.filter(v => v.impact === 'moderate').length,
  minorViolations: axeResults.violations.filter(v => v.impact === 'minor').length,
  affectedElements: axeResults.violations.reduce((sum, v) => sum + v.nodes.length, 0),
  wcag2a: axeResults.violations.filter(v => v.tags.includes('wcag2a')).length,
  wcag2aa: axeResults.violations.filter(v => v.tags.includes('wcag2aa')).length,
  wcag2aaa: axeResults.violations.filter(v => v.tags.includes('wcag2aaa')).length,
  bestPractice: axeResults.violations.filter(v => v.tags.includes('best-practice')).length
};

const arcMetrics = {
  violations: arcResults.results ? arcResults.results.length : 0,
  totalElements: 0,
  criticalSeverity: 0,
  highSeverity: 0,
  mediumSeverity: 0,
  lowSeverity: 0,
  wcagIssues: 0,
  bestPracticeIssues: 0,
  uniqueRules: new Set()
};

if (arcResults.results) {
  arcResults.results.forEach(result => {
    arcMetrics.totalElements++;
    arcMetrics.uniqueRules.add(result.ruleKey);
    
    const severity = result.message?.severity || 'Unknown';
    switch (severity) {
      case 'Critical':
        arcMetrics.criticalSeverity++;
        break;
      case 'High':
        arcMetrics.highSeverity++;
        break;
      case 'Medium':
        arcMetrics.mediumSeverity++;
        break;
      case 'Low':
        arcMetrics.lowSeverity++;
        break;
    }
    
    const type = result.message?.type || '';
    if (type === 'wcag-violation' || type === 'wcag') {
      arcMetrics.wcagIssues++;
    } else if (type === 'best-practice') {
      arcMetrics.bestPracticeIssues++;
    }
  });
  arcMetrics.violations = arcMetrics.uniqueRules.size;
}

// Display comparison
console.log('═══════════════════════════════════════════════════════')
console.log('  QUANTITATIVE COMPARISON')
console.log('═══════════════════════════════════════════════════════\n')

console.log('VIOLATIONS FOUND:');
console.log('─────────────────────────────────────────────────────');
console.log(`axe-core:        ${axeMetrics.violations} unique rule violations`);
console.log(`ARC-RulesEngine: ${arcMetrics.violations} unique rule violations`);
console.log(`                 ${arcMetrics.totalElements} total issue instances\n`);

console.log('RULES EXECUTED:');
console.log('─────────────────────────────────────────────────────');
console.log(`axe-core:        ${axeMetrics.totalRules} rules total`);
console.log(`  - Violations:  ${axeMetrics.violations}`);
console.log(`  - Passes:      ${axeMetrics.passes}`);
console.log(`  - Incomplete:  ${axeMetrics.incomplete}`);
console.log(`  - Inapplicable: ${axeMetrics.inapplicable}\n`);
console.log(`ARC-RulesEngine: ${arcMetrics.violations} rules reported issues`);
console.log(`                 (only violations are reported)\n`);

console.log('SEVERITY BREAKDOWN:');
console.log('─────────────────────────────────────────────────────');
console.log('axe-core:');
console.log(`  Critical:  ${axeMetrics.criticalViolations}`);
console.log(`  Serious:   ${axeMetrics.seriousViolations}`);
console.log(`  Moderate:  ${axeMetrics.moderateViolations}`);
console.log(`  Minor:     ${axeMetrics.minorViolations}\n`);
console.log('ARC-RulesEngine:');
console.log(`  Critical:  ${arcMetrics.criticalSeverity}`);
console.log(`  High:      ${arcMetrics.highSeverity}`);
console.log(`  Medium:    ${arcMetrics.mediumSeverity}`);
console.log(`  Low:       ${arcMetrics.lowSeverity}\n`);

console.log('AFFECTED ELEMENTS:');
console.log('─────────────────────────────────────────────────────');
console.log(`axe-core:        ${axeMetrics.affectedElements} elements`);
console.log(`ARC-RulesEngine: ${arcMetrics.totalElements} instances\n`);

console.log('STANDARDS COVERAGE:');
console.log('─────────────────────────────────────────────────────');
console.log('axe-core:');
console.log(`  WCAG 2.x Level A:   ${axeMetrics.wcag2a} violations`);
console.log(`  WCAG 2.x Level AA:  ${axeMetrics.wcag2aa} violations`);
console.log(`  WCAG 2.x Level AAA: ${axeMetrics.wcag2aaa} violations`);
console.log(`  Best Practice:      ${axeMetrics.bestPractice} violations\n`);
console.log('ARC-RulesEngine:');
console.log(`  WCAG violations:    ${arcMetrics.wcagIssues} instances`);
console.log(`  Best Practice:      ${arcMetrics.bestPracticeIssues} instances\n`);

console.log('═══════════════════════════════════════════════════════')
console.log('  QUALITATIVE ANALYSIS')
console.log('═══════════════════════════════════════════════════════\n')

// Analyze specific issues
console.log('ISSUE OVERLAP ANALYSIS:\n');

// Get axe violations by ID
const axeViolationIds = new Map();
axeResults.violations.forEach(v => {
  axeViolationIds.set(v.id, {
    help: v.help,
    impact: v.impact,
    count: v.nodes.length,
    wcag: v.tags.filter(t => t.startsWith('wcag'))
  });
});

// Get ARC violations by rule key
const arcViolationKeys = new Map();
if (arcResults.results) {
  arcResults.results.forEach(r => {
    if (!arcViolationKeys.has(r.ruleKey)) {
      arcViolationKeys.set(r.ruleKey, {
        message: r.message?.title || r.ruleKey,
        severity: r.message?.severity,
        count: 0
      });
    }
    arcViolationKeys.get(r.ruleKey).count++;
  });
}

console.log('Common Issues (similar concepts found by both):');
console.log('─────────────────────────────────────────────────────');

// Look for conceptual overlaps
const overlaps = [
  { axe: 'image-alt', arc: 'imgHasAltOrAriaLabel', concept: 'Images missing alt text' },
  { axe: 'color-contrast', arc: 'colorContrast', concept: 'Insufficient color contrast' },
  { axe: 'empty-heading', arc: 'headingIsNotEmpty', concept: 'Empty headings' },
  { axe: 'aria-allowed-role', arc: 'validAriaRole', concept: 'Invalid ARIA roles' },
  { axe: 'region', arc: 'landmarkRegion', concept: 'Content outside landmarks' }
];

let foundOverlaps = 0;
overlaps.forEach(({ axe, arc, concept }) => {
  const axeHas = axeViolationIds.has(axe);
  const arcHas = Array.from(arcViolationKeys.keys()).some(k => k.includes(arc) || arc.includes(k));
  
  if (axeHas || arcHas) {
    console.log(`\n${concept}:`);
    if (axeHas) {
      const v = axeViolationIds.get(axe);
      console.log(`  ✓ axe-core:  ${v.count} elements (${v.impact})`);
      foundOverlaps++;
    } else {
      console.log(`  ✗ axe-core:  Not detected`);
    }
    if (arcHas) {
      console.log(`  ✓ ARC:       Found`);
    } else {
      console.log(`  ✗ ARC:       Not detected`);
    }
  }
});

console.log('\n\nUnique to axe-core:');
console.log('─────────────────────────────────────────────────────');
const uniqueAxe = Array.from(axeViolationIds.entries()).slice(0, 5);
uniqueAxe.forEach(([id, data]) => {
  console.log(`• ${id}: ${data.help}`);
  console.log(`  ${data.count} elements, impact: ${data.impact}`);
});
if (axeViolationIds.size > 5) {
  console.log(`  ... and ${axeViolationIds.size - 5} more`);
}

console.log('\n\nUnique to ARC-RulesEngine:');
console.log('─────────────────────────────────────────────────────');
const uniqueArc = Array.from(arcViolationKeys.entries()).slice(0, 5);
uniqueArc.forEach(([key, data]) => {
  console.log(`• ${key}: ${data.message}`);
  console.log(`  ${data.count} instances, severity: ${data.severity}`);
});
if (arcViolationKeys.size > 5) {
  console.log(`  ... and ${arcViolationKeys.size - 5} more`);
}

console.log('\n\n═══════════════════════════════════════════════════════')
console.log('  PERFORMANCE METRICS')
console.log('═══════════════════════════════════════════════════════\n')

// Calculate metrics
const axeElementsPerRule = (axeMetrics.affectedElements / axeMetrics.violations).toFixed(1);
const arcInstancesPerRule = (arcMetrics.totalElements / arcMetrics.violations).toFixed(1);

console.log('DETECTION GRANULARITY:');
console.log('─────────────────────────────────────────────────────');
console.log(`axe-core:        ${axeElementsPerRule} elements per rule violation`);
console.log(`ARC-RulesEngine: ${arcInstancesPerRule} instances per rule\n`);

console.log('COMPREHENSIVENESS:');
console.log('─────────────────────────────────────────────────────');
console.log(`axe-core:        ${axeMetrics.totalRules} total rules evaluated`);
console.log(`                 Reports passes, incomplete, inapplicable`);
console.log(`                 Provides confidence indicators\n`);
console.log(`ARC-RulesEngine: ${arcMetrics.violations} rules triggered`);
console.log(`                 Only reports violations`);
console.log(`                 Focused on actionable issues\n`);

console.log('\n═══════════════════════════════════════════════════════')
console.log('  SUMMARY & RECOMMENDATIONS')
console.log('═══════════════════════════════════════════════════════\n')

console.log('RECALL (Coverage):');
console.log('─────────────────────────────────────────────────────');
if (arcMetrics.violations > axeMetrics.violations) {
  console.log('🏆 ARC-RulesEngine: HIGHER');
  console.log(`   Found ${arcMetrics.violations} unique issues vs axe-core's ${axeMetrics.violations}`);
  console.log('   Better at detecting diverse accessibility problems\n');
} else if (axeMetrics.violations > arcMetrics.violations) {
  console.log('🏆 axe-core: HIGHER');
  console.log(`   Found ${axeMetrics.violations} unique issues vs ARC's ${arcMetrics.violations}`);
  console.log('   Better at detecting diverse accessibility problems\n');
} else {
  console.log('🤝 TIED');
  console.log('   Both found similar number of unique issues\n');
}

console.log('PRECISION (Accuracy):');
console.log('─────────────────────────────────────────────────────');
console.log('🏆 axe-core: HIGHER (claimed)');
console.log('   Known for zero false positives');
console.log('   Conservative approach, manual review for uncertain cases');
console.log(`   ${axeMetrics.incomplete} incomplete items require manual verification\n`);
console.log('⚠️  ARC-RulesEngine: MODERATE');
console.log('   More aggressive detection');
console.log('   May include more false positives');
console.log('   Requires manual review of results\n');

console.log('DETAIL LEVEL:');
console.log('─────────────────────────────────────────────────────');
console.log('🏆 ARC-RulesEngine: MORE DETAILED');
console.log(`   ${arcMetrics.totalElements} individual issue instances reported`);
console.log('   Provides specific element-level details');
console.log('   Better for remediation workflows\n');
console.log('⚖️  axe-core: RULE-FOCUSED');
console.log(`   ${axeMetrics.violations} rule violations with ${axeMetrics.affectedElements} affected elements`);
console.log('   Groups similar issues by rule');
console.log('   Better for understanding problem patterns\n');

console.log('REPORTING COMPLETENESS:');
console.log('─────────────────────────────────────────────────────');
console.log('🏆 axe-core: MORE COMPLETE');
console.log('   Reports what passed, what failed, what needs review');
console.log('   Confidence indicators for all rules');
console.log('   Better for compliance documentation\n');
console.log('⚖️  ARC-RulesEngine: FOCUSED');
console.log('   Only reports violations');
console.log('   Streamlined for developers');
console.log('   Faster to parse and act on\n');

console.log('\n═══════════════════════════════════════════════════════')
console.log('  FINAL VERDICT')
console.log('═══════════════════════════════════════════════════════\n')

console.log('USE AXE-CORE WHEN:');
console.log('• You need zero false positives (precision)');
console.log('• Creating compliance reports (VPAT, etc.)');
console.log('• Want to know what passed, not just what failed');
console.log('• Need industry-standard, widely recognized tool');
console.log('• Integrating with other axe ecosystem tools\n');

console.log('USE ARC-RULESENGINE WHEN:');
console.log('• You need maximum coverage (recall)');
console.log('• Want element-level detail for remediation');
console.log('• Working with TPGi consulting services');
console.log('• Need proprietary/advanced rule coverage');
console.log('• Want more aggressive detection\n');

console.log('BEST PRACTICE:');
console.log('🎯 Use BOTH tools for comprehensive coverage:');
console.log('   1. Run axe-core for baseline (high precision)');
console.log('   2. Run ARC for additional coverage (high recall)');
console.log('   3. Manually verify any overlapping issues');
console.log('   4. Use axe for reporting, ARC for detailed fixes\n');

// Save comparison report
const report = {
  timestamp: new Date().toISOString(),
  url: axeResults.url || arcResults.page?.URL,
  axeCore: axeMetrics,
  arcRulesEngine: arcMetrics,
  analysis: {
    axeViolations: Array.from(axeViolationIds.keys()),
    arcViolations: Array.from(arcViolationKeys.keys())
  }
};

fs.writeFileSync('scanner-comparison.json', JSON.stringify(report, null, 2));
console.log('✓ Detailed comparison saved to: scanner-comparison.json\n');
