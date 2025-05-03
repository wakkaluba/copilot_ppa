module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/../../../tsconfig.test.json'
    }]
  },
  testRegex: '.*\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['.'],
  collectCoverage: true,
  collectCoverageFrom: [
    '../../../src/codeReview/**/*.{js,ts}',
    '!../../../src/codeReview/**/*.d.ts'
  ],
  coverageDirectory: '../../../coverage/codeReview',
  testTimeout: 10000
};
