const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Mock child_process.execSync
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('fix-all script', () => {
  // Store original methods before mocking
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalProcessExit = process.exit;
  const originalPathResolve = path.resolve;
  const originalRequire = jest.requireActual('../fix-all');

  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();

    // Mock process.exit
    process.exit = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();

    // Reset execSync behavior for each test
    execSync.mockReset();
  });

  afterAll(() => {
    // Restore original methods after all tests
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    path.resolve = originalPathResolve;
  });

  test('should run all fix scripts in the correct order', () => {
    // Execute the script
    jest.isolateModules(() => {
      require('../fix-all');
    });

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

  test('should handle errors in the first script and exit the process', () => {
    // Setup execSync to throw an error on the first call
    execSync.mockImplementationOnce(() => {
      throw new Error('Error in fix-casing script');
    });

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-all');
    });

    // Verify console.error was called with the error message
    expect(console.error).toHaveBeenCalledWith('Fix process failed: Error in fix-casing script');

    // Verify process.exit was called with code 1
    expect(process.exit).toHaveBeenCalledWith(1);

    // Verify execSync was called only once before failing
    expect(execSync).toHaveBeenCalledTimes(1);
  });

  test('should handle errors in a middle script and exit the process', () => {
    // Setup execSync to throw an error on the third call
    execSync.mockImplementationOnce(() => {/* fix-casing success */});
    execSync.mockImplementationOnce(() => {/* fix-imports success */});
    execSync.mockImplementationOnce(() => {
      throw new Error('Error in fix-timestamp-errors script');
    });

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-all');
    });

    // Verify console.error was called with the error message
    expect(console.error).toHaveBeenCalledWith('Fix process failed: Error in fix-timestamp-errors script');

    // Verify process.exit was called with code 1
    expect(process.exit).toHaveBeenCalledWith(1);

    // Verify execSync was called 3 times before failing
    expect(execSync).toHaveBeenCalledTimes(3);
  });

  test('should handle errors in the last script and exit the process', () => {
    // Setup execSync to throw an error on the last call
    execSync.mockImplementationOnce(() => {/* fix-casing success */});
    execSync.mockImplementationOnce(() => {/* fix-imports success */});
    execSync.mockImplementationOnce(() => {/* fix-timestamp-errors success */});
    execSync.mockImplementationOnce(() => {/* fix-uri-errors success */});
    execSync.mockImplementationOnce(() => {
      throw new Error('Error in fix-type-errors script');
    });

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-all');
    });

    // Verify console.error was called with the error message
    expect(console.error).toHaveBeenCalledWith('Fix process failed: Error in fix-type-errors script');

    // Verify process.exit was called with code 1
    expect(process.exit).toHaveBeenCalledWith(1);

    // Verify execSync was called 5 times before failing
    expect(execSync).toHaveBeenCalledTimes(5);
  });

  test('should handle error details in the error object', () => {
    // Setup execSync to throw an error with stderr details
    const errorWithDetails = new Error('Command failed');
    errorWithDetails.stderr = 'Detailed error information from script execution';

    execSync.mockImplementationOnce(() => {
      throw errorWithDetails;
    });

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-all');
    });

    // Verify console.error was called with the error message
    expect(console.error).toHaveBeenCalledWith('Fix process failed: Command failed');

    // Verify execSync was called only once before failing
    expect(execSync).toHaveBeenCalledTimes(1);

    // Verify process.exit was called with code 1
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
