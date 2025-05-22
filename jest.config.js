module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/coverage/**/*.test.[jt]s?(x)',
    '**/test/**/*.[jt]s?(x)',
    '**/tests/**/*.[jt]s?(x)',
    '**/zzzscripts/**/*.test.[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['/zzzbuild/', '/zzzdocs/', '/zzzrefactoring/', '/zzzscripts/'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};
