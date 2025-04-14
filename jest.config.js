/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  moduleNameMapper: {
    "^vscode$": "<rootDir>/src/__mocks__/vscode.js"
  },
  testMatch: [
    "**/src/__tests__/**/*.test.ts"
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: [
    "<rootDir>/tests/unit/",
    "<rootDir>/tests/integration/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/tests/performance/"
  ]
};
