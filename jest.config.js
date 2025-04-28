module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        "**/tests/**/*.test.ts",
        "**/tests/**/*.test.js",
        "**/__tests__/**/*.test.ts",
        "**/__tests__/**/*.test.js",
    ],
    testPathIgnorePatterns: ['/node_modules/', '/out/', '/dist/'],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!**/node_modules/**",
    ],
    coverageReporters: ["json", "lcov", "text", "clover"],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    moduleNameMapper: {
        '^vscode$': '<rootDir>/tests/vscode-mock.ts',
    },
    testTimeout: 10000,
    // Don't generate sourcemaps, it can cause issues with breakpoints
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {
            tsconfig: "tsconfig.json",
            sourceMap: false,
        }]
    },
    // Try to fix some memory issues
    maxWorkers: '50%',
    workerIdleMemoryLimit: '512MB',
}
