module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: [
    '**/test/unit/codeReview/**/*.test.js',
    '**/test/unit/codeReview/**/*.test.ts'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/codeReview/**/*.js',
    'src/codeReview/**/*.ts',
    '!src/codeReview/**/*.d.ts'
  ],
  coverageDirectory: 'coverage/codeReview',
  verbose: true,
  testTimeout: 30000
};
