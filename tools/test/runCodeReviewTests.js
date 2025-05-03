// Test runner specifically for codeReview module
const { runCLI } = require('jest');
const path = require('path');

async function runTests() {
  try {
    const config = {
      roots: [path.join(__dirname, '../../test/unit/codeReview')],
      collectCoverage: true,
      collectCoverageFrom: [
        '<rootDir>/src/codeReview/**/*.js',
        '<rootDir>/src/codeReview/**/*.ts',
        '!<rootDir>/src/codeReview/**/*.d.ts'
      ],
      coverageDirectory: path.join(__dirname, '../../coverage/codeReview'),
      testMatch: [
        '**/test/unit/codeReview/**/*.test.js',
        '**/test/unit/codeReview/**/*.test.ts'
      ],
      verbose: true
    };

    const result = await runCLI(config, [path.join(__dirname, '../..')]);

    if (result.results.success) {
      console.log('All tests passed!');
      process.exit(0);
    } else {
      console.error('Tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

runTests();
