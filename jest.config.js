/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleNameMapper: {
    "^vscode$": "<rootDir>/src/__mocks__/vscode.js",
    // Handle case sensitivity issues
    "\\.\\./(services|Services)/(C|c)onversationManager": "<rootDir>/src/services/conversationManager.ts",
    "\\./(C|c)onversationManager": "<rootDir>/src/services/conversationManager.ts"
  },
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/tests/unit/**/*.test.ts",
    "**/tests/integration/**/*.test.ts"
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover", "json"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/__mocks__/**",
    "!src/__tests__/**",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
