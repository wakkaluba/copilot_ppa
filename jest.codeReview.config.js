module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/unit/codeReview'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/codeReview/**/*.js',
    'src/codeReview/**/*.ts',
    '!src/codeReview/**/*.d.ts'
  ],
  coverageDirectory: 'coverage/codeReview',
  testMatch: [
    '**/test/unit/codeReview/**/*.test.js',
    '**/test/unit/codeReview/**/*.test.ts'
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true
}
