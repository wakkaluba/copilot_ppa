// zzzscripts/improve-code-coverage.js
// Script to identify files with low test coverage and suggest or scaffold new tests.
// Usage: node zzzscripts/improve-code-coverage.js

const fs = require('fs');
const path = require('path');

const COVERAGE_SUMMARY_PATH = path.join(__dirname, '../coverage/coverage-summary.json');
const TESTS_DIR = path.join(__dirname, '../tests');
const SRC_DIR = path.join(__dirname, '../src');
const LOW_COVERAGE_THRESHOLD = 80; // percent

function getCoverageSummary() {
  if (!fs.existsSync(COVERAGE_SUMMARY_PATH)) {
    console.error('Coverage summary not found:', COVERAGE_SUMMARY_PATH);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf-8'));
}

function findLowCoverageFiles(coverageSummary) {
  const lowCoverage = [];
  for (const [file, metrics] of Object.entries(coverageSummary)) {
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const statements = metrics.statements.pct;
      const branches = metrics.branches.pct;
      const functions = metrics.functions.pct;
      const lines = metrics.lines.pct;
      if (
        statements < LOW_COVERAGE_THRESHOLD ||
        branches < LOW_COVERAGE_THRESHOLD ||
        functions < LOW_COVERAGE_THRESHOLD ||
        lines < LOW_COVERAGE_THRESHOLD
      ) {
        lowCoverage.push({ file, statements, branches, functions, lines });
      }
    }
  }
  return lowCoverage;
}

function suggestTestFile(srcFile) {
  const rel = path.relative(SRC_DIR, srcFile);
  const testFile = path.join(TESTS_DIR, rel).replace(/\.(js|ts)$/, '.test.$1');
  return testFile;
}

function main() {
  const summary = getCoverageSummary();
  const lowCoverageFiles = findLowCoverageFiles(summary);
  if (lowCoverageFiles.length === 0) {
    console.log('All files meet the minimum coverage threshold.');
    return;
  }
  console.log('Files with low coverage:');
  for (const info of lowCoverageFiles) {
    console.log(
      `- ${info.file} (Statements: ${info.statements}%, Branches: ${info.branches}%, Functions: ${info.functions}%, Lines: ${info.lines}%)`
    );
    const testFile = suggestTestFile(info.file);
    if (!fs.existsSync(testFile)) {
      console.log(`  Suggest creating test: ${testFile}`);
    }
  }
}

if (require.main === module) {
  main();
}
