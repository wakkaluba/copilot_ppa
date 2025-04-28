module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
        diagnostics: {
          warnOnly: false,
          ignoreCodes: ['TS151001']
        }
      }
    ]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/'
  ],
  collectCoverage: false,
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  testTimeout: 5000,
  maxWorkers: '50%',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: 'tsconfig.test.json'
    }
  },
  verbose: false,
  bail: 0,
  cache: true,
  maxConcurrency: 5
}
