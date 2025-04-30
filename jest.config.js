module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',  // Changed from 'node' to 'jsdom'
    testMatch: [
        "**/tests/**/*.test.ts",
        "**/tests/**/*.test.js",
        "**/__tests__/**/*.test.ts",
        "**/__tests__/**/*.test.js",
        "**/media/**/*.test.js",  // Added to include media folder tests
        "**/media/**/*.test.ts"   // Added to include media folder tests
    ],
    testPathIgnorePatterns: ['/node_modules/', '/out/', '/dist/'],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!**/node_modules/**",
        "!src/**/*.test.ts",
        "!src/test/**",
        "!src/**/__mocks__/**",
    ],
    coverageReporters: [
        "json",
        "lcov",
        "text",
        "clover",
        "html",
        "cobertura"
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    moduleNameMapper: {
        '^vscode$': '<rootDir>/tests/vscode-mock.ts',
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@test/(.*)$': '<rootDir>/tests/$1'
    },
    modulePathIgnorePatterns: [
        '<rootDir>/dist/',
        '<rootDir>/out/'
    ],
    testTimeout: 15000,
    transform: {
        "^.+\\.tsx?$": ['ts-jest', {
            tsconfig: "tsconfig.json"
        }]
    },
    maxWorkers: '50%',
    workerIdleMemoryLimit: '512MB',
    detectOpenHandles: true,
    forceExit: true,
    errorOnDeprecated: true,
    verbose: true,
    testEnvironmentOptions: {
        url: 'http://localhost',
        resources: 'usable',  // Added for JSDOM resource handling
        runScripts: 'dangerously'  // Added for JSDOM script execution
    },
    reporters: [
        "default"
    ]
}
