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
    "**/__tests__/**/*.test.ts"
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
