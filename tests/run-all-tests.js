const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * Runs a command and returns the output
 * @param {string} command The command to run
 * @returns {string} The command output
 */
function runCommand(command) {
  console.log(`${colors.cyan}Running: ${colors.bright}${command}${colors.reset}`);
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    return output;
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    console.error(error.stdout || error.message);
    return error.stdout || '';
  }
}

/**
 * Creates a directory if it doesn't exist
 * @param {string} dir Directory path
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generates an HTML report with test results
 * @param {Object} results Test results
 */
function generateHTMLReport(results) {
  const reportDir = path.join(__dirname, '..', 'test-reports');
  ensureDirectoryExists(reportDir);
  
  const htmlPath = path.join(reportDir, 'test-report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copilot PPA Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { display: flex; gap: 20px; margin-bottom: 20px; }
    .summary-item { padding: 15px; border-radius: 5px; flex: 1; }
    .success { background-color: #d4edda; border: 1px solid #c3e6cb; }
    .warning { background-color: #fff3cd; border: 1px solid #ffeeba; }
    .danger { background-color: #f8d7da; border: 1px solid #f5c6cb; }
    .info { background-color: #d1ecf1; border: 1px solid #bee5eb; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; font-weight: bold; }
    tr:hover { background-color: #f1f1f1; }
    .pass { color: green; }
    .fail { color: red; }
    .chart-container { width: 100%; height: 400px; margin-bottom: 30px; }
  </style>
</head>
<body>
  <h1>Copilot PPA Test Results</h1>
  <div class="summary">
    <div class="summary-item ${results.unitTests.success ? 'success' : 'danger'}">
      <h3>Unit Tests</h3>
      <p>Passed: ${results.unitTests.passed} / ${results.unitTests.total}</p>
      <p>Coverage: ${results.unitTests.coverage}%</p>
    </div>
    <div class="summary-item ${results.integrationTests.success ? 'success' : 'danger'}">
      <h3>Integration Tests</h3>
      <p>Passed: ${results.integrationTests.passed} / ${results.integrationTests.total}</p>
    </div>
    <div class="summary-item ${results.e2eTests.success ? 'success' : 'danger'}">
      <h3>E2E Tests</h3>
      <p>Passed: ${results.e2eTests.passed} / ${results.e2eTests.total}</p>
    </div>
    <div class="summary-item ${results.lint.success ? 'success' : 'danger'}">
      <h3>Lint</h3>
      <p>Errors: ${results.lint.errors}</p>
      <p>Warnings: ${results.lint.warnings}</p>
    </div>
  </div>
  
  <h2>Coverage Details</h2>
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>Statements</th>
        <th>Branches</th>
        <th>Functions</th>
        <th>Lines</th>
      </tr>
    </thead>
    <tbody>
      ${results.coverageDetails.map(file => `
        <tr>
          <td>${file.file}</td>
          <td class="${file.statements >= 80 ? 'pass' : 'fail'}">${file.statements}%</td>
          <td class="${file.branches >= 80 ? 'pass' : 'fail'}">${file.branches}%</td>
          <td class="${file.functions >= 80 ? 'pass' : 'fail'}">${file.functions}%</td>
          <td class="${file.lines >= 80 ? 'pass' : 'fail'}">${file.lines}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Test Output</h2>
  <h3>Unit Tests</h3>
  <pre>${results.unitTestOutput}</pre>
  
  <h3>Integration Tests</h3>
  <pre>${results.integrationTestOutput}</pre>
  
  <h3>E2E Tests</h3>
  <pre>${results.e2eTestOutput}</pre>
  
  <h3>Lint Results</h3>
  <pre>${results.lintOutput}</pre>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Additional JavaScript for interactive features can be added here
    });
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(htmlPath, html);
  console.log(`${colors.green}HTML report generated at: ${htmlPath}${colors.reset}`);
  
  return htmlPath;
}

/**
 * Parses the ESLint output to extract error and warning counts
 * @param {string} output ESLint output
 * @returns {Object} Parsed results
 */
function parseLintOutput(output) {
  const errorMatch = output.match(/(\d+) errors?/);
  const warningMatch = output.match(/(\d+) warnings?/);
  
  return {
    errors: errorMatch ? parseInt(errorMatch[1], 10) : 0,
    warnings: warningMatch ? parseInt(warningMatch[1], 10) : 0,
    success: !(errorMatch && parseInt(errorMatch[1], 10) > 0)
  };
}

/**
 * Parses Jest test output to extract passed and total test counts
 * @param {string} output Jest output
 * @returns {Object} Parsed results
 */
function parseTestOutput(output) {
  const testResultMatch = output.match(/Tests:\s+(\d+) passed,\s+(\d+) total/);
  
  if (testResultMatch) {
    const passed = parseInt(testResultMatch[1], 10);
    const total = parseInt(testResultMatch[2], 10);
    return {
      passed,
      total,
      success: passed === total
    };
  }
  
  return {
    passed: 0,
    total: 0,
    success: false
  };
}

/**
 * Parses coverage output to extract overall coverage percentage
 * @param {string} output Coverage output
 * @returns {number} Coverage percentage
 */
function parseCoverage(output) {
  const coverageMatch = output.match(/All files.*?\s+(\d+\.\d+)/);
  return coverageMatch ? parseFloat(coverageMatch[1]) : 0;
}

/**
 * Parses coverage output to extract detailed file coverage
 * @param {string} output Coverage output
 * @returns {Array} Coverage details by file
 */
function parseCoverageDetails(output) {
  const lines = output.split('\n');
  const details = [];
  
  let inFileSection = false;
  
  for (const line of lines) {
    if (line.includes('----------|---------|----------|---------|')) {
      inFileSection = true;
      continue;
    }
    
    if (inFileSection && line.includes('All files')) {
      break;
    }
    
    if (inFileSection && line.trim() && !line.includes('----------|')) {
      const parts = line.trim().split('|').map(p => p.trim());
      if (parts.length >= 5) {
        details.push({
          file: parts[0],
          statements: parseFloat(parts[1]),
          branches: parseFloat(parts[2]),
          functions: parseFloat(parts[3]),
          lines: parseFloat(parts[4])
        });
      }
    }
  }
  
  return details;
}

/**
 * Runs all tests and generates reports
 */
async function runAllTests() {
  // Run ESLint
  console.log(`\n${colors.magenta}${colors.bright}Running ESLint...${colors.reset}`);
  const lintOutput = runCommand('npm run lint');
  const lintResults = parseLintOutput(lintOutput);
  
  // Run unit tests
  console.log(`\n${colors.magenta}${colors.bright}Running Unit Tests...${colors.reset}`);
  const unitTestOutput = runCommand('npm run test:unit -- --coverage');
  const unitTestResults = parseTestOutput(unitTestOutput);
  unitTestResults.coverage = parseCoverage(unitTestOutput);
  
  // Run integration tests
  console.log(`\n${colors.magenta}${colors.bright}Running Integration Tests...${colors.reset}`);
  const integrationTestOutput = runCommand('npm run test:integration');
  const integrationTestResults = parseTestOutput(integrationTestOutput);
  
  // Run E2E tests
  console.log(`\n${colors.magenta}${colors.bright}Running E2E Tests...${colors.reset}`);
  const e2eTestOutput = runCommand('npm run test:e2e');
  const e2eTestResults = parseTestOutput(e2eTestOutput);
  
  // Get detailed coverage information
  const coverageDetails = parseCoverageDetails(unitTestOutput);
  
  // Generate a final report
  const results = {
    unitTests: unitTestResults,
    integrationTests: integrationTestResults,
    e2eTests: e2eTestResults,
    lint: lintResults,
    coverageDetails,
    unitTestOutput,
    integrationTestOutput,
    e2eTestOutput,
    lintOutput
  };
  
  // Generate HTML report
  const reportPath = generateHTMLReport(results);
  
  // Print summary
  console.log(`\n${colors.bright}${colors.cyan}Test Summary:${colors.reset}`);
  console.log(`${colors.bright}Unit Tests:${colors.reset} ${unitTestResults.passed}/${unitTestResults.total} passed (${unitTestResults.coverage}% coverage)`);
  console.log(`${colors.bright}Integration Tests:${colors.reset} ${integrationTestResults.passed}/${integrationTestResults.total} passed`);
  console.log(`${colors.bright}E2E Tests:${colors.reset} ${e2eTestResults.passed}/${e2eTestResults.total} passed`);
  console.log(`${colors.bright}Lint:${colors.reset} ${lintResults.errors} errors, ${lintResults.warnings} warnings`);
  
  const success = unitTestResults.success && integrationTestResults.success && e2eTestResults.success && lintResults.success;
  if (success) {
    console.log(`\n${colors.green}${colors.bright}All tests passed successfully!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bright}Some tests failed. Check the report for details.${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}Report:${colors.reset} ${reportPath}`);
  
  return success;
}

// Run all tests
runAllTests().catch(error => {
  console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  process.exit(1);
});
