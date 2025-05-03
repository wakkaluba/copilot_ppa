/**
 * Jest configuration focused specifically on the reviewChecklist.js file
 * to improve code coverage reporting
 */
module.exports = {
  // Use node test environment for non-DOM tests
  testEnvironment: 'node',

  // Limit tests to only reviewChecklist tests
  testMatch: [
    '**/reviewChecklist.test.js',
    '**/reviewChecklist.test.ts'
  ],

  // Collect coverage information
  collectCoverage: true,

  // Focus coverage specifically on the reviewChecklist files
  collectCoverageFrom: [
    '**/codeReview/reviewChecklist.js',
    '**/codeReview/reviewChecklist.ts'
  ],

  // Output coverage report to a specific directory
  coverageDirectory: './coverage/reviewChecklist',

  // Add verbose output for better debugging
  verbose: true,

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
