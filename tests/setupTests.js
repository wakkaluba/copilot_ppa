// Jest global setup for all tests.
// Add global mocks or setup code here if needed.

// Mock Node.js 'fs' module methods commonly used in tests
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn().mockReturnValue({ isDirectory: () => false }),
}));

// Ensure VS Code APIs are always mocked
try {
  require('test/__mocks__/vscode');
} catch (e) {
  // Ignore if already mocked or not needed
}

// Mock logger globally for all tests
jest.mock('../src/utils/logger', () => {
  return {
    DummyLogger: class {
      error = jest.fn();
      info = jest.fn();
      warn = jest.fn();
    },
    // Optionally export a default logger instance if used in codebase
    logger: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn()
    }
  };
});
