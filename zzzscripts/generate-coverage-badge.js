/**
 * Script to generate a Markdown coverage badge and summary from Jest/Istanbul output.
 * Outputs to coverage/coverage-badge.md.
 */
const fs = require('fs');
const path = require('path');

const COVERAGE_SUMMARY_PATH = path.join(__dirname, '../coverage/coverage-summary.json');
const OUTPUT_MD_PATH = path.join(__dirname, '../coverage/coverage-badge.md');

function getCoverageData() {
  if (!fs.existsSync(COVERAGE_SUMMARY_PATH)) {
    throw new Error('coverage-summary.json not found. Run tests with coverage first.');
  }
  const data = JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf8'));
  return data.total || data;
}

function getBadgeUrl(percentage) {
  let color = 'red';
  if (percentage >= 90) color = 'brightgreen';
  else if (percentage >= 80) color = 'green';
  else if (percentage >= 70) color = 'yellowgreen';
  else if (percentage >= 60) color = 'yellow';
  else if (percentage >= 50) color = 'orange';
  return `https://img.shields.io/badge/coverage-${percentage}%25-${color}.svg`;
}

function generateMarkdown(coverage) {
  const pct = Math.round(coverage.lines.pct);
  const badgeUrl = getBadgeUrl(pct);
  return `# Code Coverage

![Coverage Badge](${badgeUrl})

| Metric      | % Covered | Covered / Total |
|-------------|-----------|-----------------|
| Lines       | ${coverage.lines.pct}% | ${coverage.lines.covered} / ${coverage.lines.total} |
| Statements  | ${coverage.statements.pct}% | ${coverage.statements.covered} / ${coverage.statements.total} |
| Functions   | ${coverage.functions.pct}% | ${coverage.functions.covered} / ${coverage.functions.total} |
| Branches    | ${coverage.branches.pct}% | ${coverage.branches.covered} / ${coverage.branches.total} |

_Last updated: ${new Date().toISOString()}_
`;
}

function main() {
  try {
    const coverage = getCoverageData();
    const markdown = generateMarkdown(coverage);
    fs.writeFileSync(OUTPUT_MD_PATH, markdown);
    console.log(`✅ Coverage badge and summary written to ${OUTPUT_MD_PATH}`);
  } catch (err) {
    console.error('❌ Failed to generate coverage badge:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getCoverageData,
  getBadgeUrl,
  generateMarkdown,
  main
};
