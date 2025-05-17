/**
 * Comprehensive Test Runner for VSCode Local LLM Agent
 *
 * This script automates the process of running various tests for the VSCode extension:
 * - Unit tests
 * - Integration tests
 * - Linting
 * - Code coverage analysis
 * - Performance benchmarks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Configuration
const config = {
  coverage: {
    threshold: 70, // Minimum acceptable code coverage percentage
    outputDir: './coverage'
  },
  linting: {
    tsconfig: './tsconfig.json',
    eslintConfig: './.eslintrc.json'
  },
  reporting: {
    outputDir: './test-reports',
    summaryFile: 'test-summary.json'
  }
};

// Ensure directories exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Run all tests and generate report
function runTests() {
  const startTime = Date.now();
  const results = {
    unitTests: { passed: 0, failed: 0, skipped: 0 },
    integrationTests: { passed: 0, failed: 0, skipped: 0 },
    linting: { errors: 0, warnings: 0 },
    coverage: { percentage: 0, files: {} },
    performance: { runtime: 0 }
  };

  try {
    logger.log('🧪 Running unit tests...');
    const unitTestOutput = execSync('npm run test:unit', { encoding: 'utf8' });
    logger.log(unitTestOutput);

    // Parse unit test results
    const unitTestMatches = unitTestOutput.match(/(\d+) passing, (\d+) failing, (\d+) skipped/);
    if (unitTestMatches) {
      results.unitTests.passed = parseInt(unitTestMatches[1]);
      results.unitTests.failed = parseInt(unitTestMatches[2]);
      results.unitTests.skipped = parseInt(unitTestMatches[3]);
    }

    logger.log('🔄 Running integration tests...');
    const integrationTestOutput = execSync('npm run test:integration', { encoding: 'utf8' });
    logger.log(integrationTestOutput);

    // Parse integration test results
    const integrationTestMatches = integrationTestOutput.match(/(\d+) passing, (\d+) failing, (\d+) skipped/);
    if (integrationTestMatches) {
      results.integrationTests.passed = parseInt(integrationTestMatches[1]);
      results.integrationTests.failed = parseInt(integrationTestMatches[2]);
      results.integrationTests.skipped = parseInt(integrationTestMatches[3]);
    }

    logger.log('🔍 Running linter...');
    try {
      const lintOutput = execSync('npm run lint', { encoding: 'utf8' });
      logger.log(lintOutput);

      // Parse lint results
      const errorMatch = lintOutput.match(/(\d+) errors/);
      const warningMatch = lintOutput.match(/(\d+) warnings/);
      results.linting.errors = errorMatch ? parseInt(errorMatch[1]) : 0;
      results.linting.warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
    } catch (error) {
      logger.error('Linting failed with errors:', error.stdout.toString());
      const errorMatch = error.stdout.toString().match(/(\d+) errors/);
      const warningMatch = error.stdout.toString().match(/(\d+) warnings/);
      results.linting.errors = errorMatch ? parseInt(errorMatch[1]) : 1;
      results.linting.warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
    }

    logger.log('📊 Generating code coverage...');
    try {
      const coverageOutput = execSync('npm run test:coverage', { encoding: 'utf8' });
      logger.log(coverageOutput);

      // Parse coverage results
      const coverageMatch = coverageOutput.match(/All files[^\n]*?\s(\d+\.?\d*)%/);
      if (coverageMatch) {
        results.coverage.percentage = parseFloat(coverageMatch[1]);
      }

      // Read detailed coverage data if available
      const coverageFile = path.join(config.coverage.outputDir, 'coverage-summary.json');
      if (fs.existsSync(coverageFile)) {
        const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        for (const file in coverageData) {
          if (file !== 'total') {
            results.coverage.files[file] = coverageData[file].statements.pct;
          }
        }
      }
    } catch (error) {
      logger.error('Coverage generation failed:', error.stdout ? error.stdout.toString() : error);
      results.coverage.percentage = 0;
    }

    // Calculate overall results
    const endTime = Date.now();
    results.performance.runtime = (endTime - startTime) / 1000; // in seconds

    // Generate report
    ensureDirectoryExists(config.reporting.outputDir);
    fs.writeFileSync(
      path.join(config.reporting.outputDir, config.reporting.summaryFile),
      JSON.stringify(results, null, 2)
    );

    // Print summary
    logger.log('\n📋 Test Summary:');
    logger.log('================');
    logger.log(`Unit Tests: ${results.unitTests.passed} passed, ${results.unitTests.failed} failed, ${results.unitTests.skipped} skipped`);
    logger.log(`Integration Tests: ${results.integrationTests.passed} passed, ${results.integrationTests.failed} failed, ${results.integrationTests.skipped} skipped`);
    logger.log(`Linting: ${results.linting.errors} errors, ${results.linting.warnings} warnings`);
    logger.log(`Code Coverage: ${results.coverage.percentage}%`);
    logger.log(`Total Runtime: ${results.performance.runtime.toFixed(2)} seconds`);

    // Check if we meet the coverage threshold
    if (results.coverage.percentage < config.coverage.threshold) {
      logger.warn(`⚠️ Code coverage is below the threshold of ${config.coverage.threshold}%`);
    }

    // Calculate overall success
    const totalTestsPassed = results.unitTests.passed + results.integrationTests.passed;
    const totalTestsFailed = results.unitTests.failed + results.integrationTests.failed;
    const totalTests = totalTestsPassed + totalTestsFailed;
    const successRate = totalTests > 0 ? (totalTestsPassed / totalTests) * 100 : 0;

    logger.log(`Overall Success Rate: ${successRate.toFixed(2)}%`);

    if (totalTestsFailed > 0 || results.linting.errors > 0) {
      logger.error('❌ Tests completed with issues');
      process.exit(1);
    } else {
      logger.log('✅ All tests passed successfully!');
    }

  } catch (error) {
    logger.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
