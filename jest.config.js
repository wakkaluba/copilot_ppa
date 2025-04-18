/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      // Enhanced TypeScript integration with improved source map support
      diagnostics: {
        warnOnly: true,
        ignoreCodes: [2307, 2345, 2322]
      },
      astTransformers: {
        before: [
          {
            path: '<rootDir>/src/test/transformers/vscodeApiTransformer.js',
            options: {
              mockVSCodeApis: true
            }
          }
        ]
      }
    }]
  },
  moduleNameMapper: {
    "^vscode$": "<rootDir>/src/__mocks__/vscode.js",
    // Handle case sensitivity issues
    "\\.\\./(services|Services)/(C|c)onversationManager": "<rootDir>/src/services/conversationManager.ts",
    "\\./(C|c)onversationManager": "<rootDir>/src/services/conversationManager.ts",
    // Additional module path mappings for better module resolution
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/tests/$1"
  },
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/tests/unit/**/*.test.ts",
    "**/tests/integration/**/*.test.ts"
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html", "json-summary"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/__mocks__/**",
    "!src/test/helpers/**"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Performance optimization settings
  maxWorkers: "70%", // Utilize 70% of available CPU cores
  testTimeout: 15000, // Increase timeout for complex tests
  maxConcurrency: 5, // Limit concurrent test suites
  cacheDirectory: "<rootDir>/.jest-cache", // Enable test caching
  // Verbose reporting options for CI/CD environments
  verbose: true,
  // Test sharding for parallel execution
  shard: process.env.JEST_SHARD || undefined,
  // Report test results incrementally
  bail: 0,
  // Custom reporters for better CI integration
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: "test-results",
      outputName: "jest-junit.xml"
    }]
  ]
}
