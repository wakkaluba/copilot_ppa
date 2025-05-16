module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/coverage/**/*.test.[jt]s?(x)'
  ],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1'
  }
};
