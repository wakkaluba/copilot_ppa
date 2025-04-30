module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setupTests.js'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/coverage/**/*.test.[jt]s?(x)'
  ]
};
