// filepath: d:\\___coding\\tools\\copilot_ppa\\tools\\__tests__\\fix-all.test.js
const { execSync } = require('child_process');
const path = require('path');

// Mock child_process.execSync
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('fix-all script', () => {
  // Save original console methods and mock them
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeAll(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  test('should run all fix scripts in the correct order', () => {
    // Execute the script
    require('../fix-all');

    // Verify console.log was called with the correct messages
    expect(console.log).toHaveBeenCalledWith('Starting comprehensive fix script...');
    expect(console.log).toHaveBeenCalledWith('\n==== STEP 1: Fixing file casing ====');
    expect(console.log).toHaveBeenCalledWith('\n==== STEP 2: Fixing imports ====');
    expect(console.log).toHaveBeenCalledWith('\n==== STEP 3: Fixing timestamp errors ====');
    expect(console.log).toHaveBeenCalledWith('\n==== STEP 4: Fixing URI errors ====');
    expect(console.log).toHaveBeenCalledWith('\n==== STEP 5: Fixing other type errors ====');
    expect(console.log).toHaveBeenCalledWith('\nAll fixes completed successfully!');
    expect(console.log).toHaveBeenCalledWith('Please restart VS Code and run "npm run compile" to check for any remaining issues.');

    // Verify execSync was called with the correct commands in the right order
    expect(execSync).toHaveBeenNthCalledWith(1, 'node tools/fix-casing.js', { stdio: 'inherit' });
    expect(execSync).toHaveBeenNthCalledWith(2, 'node tools/fix-imports.js', { stdio: 'inherit' });
    expect(execSync).toHaveBeenNthCalledWith(3, 'node tools/fix-timestamp-errors.js', { stdio: 'inherit' });
    expect(execSync).toHaveBeenNthCalledWith(4, 'node tools/fix-uri-errors.js', { stdio: 'inherit' });
    expect(execSync).toHaveBeenNthCalledWith(5, 'node tools/fix-type-errors.js', { stdio: 'inherit' });

    // Verify total number of execSync calls
    expect(execSync).toHaveBeenCalledTimes(5);
  });

  test('should handle errors and exit the process', () => {
    // Mock process.exit
    const originalProcessExit = process.exit;
    process.exit = jest.fn();

    // Setup execSync to throw an error
    execSync.mockImplementationOnce(() => {
      throw new Error('Mocked error');
    });

    // Execute the script
    require('../fix-all');

    // Verify console.error was called with the error message
    expect(console.error).toHaveBeenCalledWith('Fix process failed: Mocked error');

    // Verify process.exit was called with code 1
    expect(process.exit).toHaveBeenCalledWith(1);

    // Restore original process.exit
    process.exit = originalProcessExit;
  });
});
