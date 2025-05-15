module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
<<<<<<< HEAD
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/coverage/**/*.test.[jt]s?(x)'
  ],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1'
  }
=======
    '<rootDir>/test/**/*.test.ts',
    '<rootDir>/tests/**/*.test.ts'
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '^vscode$': '<rootDir>/test/__mocks__/vscode.js'
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json'
    }
  },
  modulePathIgnorePatterns: [
    '<rootDir>/zzzbuild/',
    '<rootDir>/out/'
  ],
>>>>>>> cef1c76635fc36a1404b37471794ec45f6e9c2e4
};
