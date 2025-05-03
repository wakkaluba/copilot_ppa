module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test/unit/codeReview'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/codeReview/**/*.js',
    '<rootDir>/src/codeReview/**/*.ts',
    '!<rootDir>/src/codeReview/**/*.d.ts'
  ],
  coverageDirectory: '<rootDir>/coverage/unit/codeReview',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  testMatch: [
    '**/test/unit/codeReview/**/*.test.js',
    '**/test/unit/codeReview/**/*.test.ts'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
