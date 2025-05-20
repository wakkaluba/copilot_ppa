// Script: generate-test-report-summary.js
// Purpose: Collects test, coverage, and lint summaries and publishes to zzzbuild/test-report-summary.md

const fs = require('fs');
const path = require('path');

const summaryFile = path.join(__dirname, '../zzzbuild/test-report-summary.md');
const coverageSummary = path.join(__dirname, '../coverage/coverage-summary.json');
const lintReport = path.join(__dirname, '../lint-report.json');
const testReport = path.join(__dirname, '../test-reports/test-report.html');

function getCoverage() {
  if (!fs.existsSync(coverageSummary)) return 'No coverage summary found.';
  const data = JSON.parse(fs.readFileSync(coverageSummary, 'utf8'));
  const total = data.total || {};
  return `**Coverage**\n- Statements: ${total.statements?.pct ?? 'N/A'}%\n- Branches: ${total.branches?.pct ?? 'N/A'}%\n- Functions: ${total.functions?.pct ?? 'N/A'}%\n- Lines: ${total.lines?.pct ?? 'N/A'}%`;
}

function getLint() {
  if (!fs.existsSync(lintReport)) return 'No lint report found.';
  const data = JSON.parse(fs.readFileSync(lintReport, 'utf8'));
  return `**Lint**\n- Errors: ${data.errorCount}\n- Warnings: ${data.warningCount}`;
}

function getTest() {
  if (!fs.existsSync(testReport)) return 'No test report found.';
  const html = fs.readFileSync(testReport, 'utf8');
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>[\s\S]*?<div class="summary">([\s\S]*?)<\/div>/);
  if (!match) return 'No test summary found.';
  // Extract summary items
  const summary = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return `**Test Results**\n${summary}`;
}

function main() {
  const lines = [
    '# Test Report Summary',
    '',
    getCoverage(),
    '',
    getLint(),
    '',
    getTest(),
    '',
    `Generated: ${new Date().toISOString()}`
  ];
  fs.writeFileSync(summaryFile, lines.join('\n'));
  console.log(`Test report summary written to ${summaryFile}`);
}

if (require.main === module) main();
