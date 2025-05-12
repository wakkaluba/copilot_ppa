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
        '../../../src/services/workspace/**/*.{js,ts}',
        '!../../../src/services/workspace/**/*.d.ts'
    ],
    coverageDirectory: '../../../coverage/workspace',
    testTimeout: 10000
};
