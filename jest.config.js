module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        // Move the ts-jest config here from globals
        compiler: 'typescript',
        isolatedModules: true,
        tsconfig: {
          // Allow unused imports in test files
          noUnusedLocals: false
        }
      }
    ]
  },
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Ignore node_modules
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  // Enable ESM support
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // Handle missing modules
  modulePathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  // Set a reasonable timeout
  testTimeout: 30000
}
