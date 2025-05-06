// filepath: d:\___coding\tools\copilot_ppa\tools\__tests__\fix-type-errors-tester.js
/**
 * Simple test script for fix-type-errors.js
 * This is a standalone test runner that avoids issues with the project's Jest configuration
 */

// Original implementations that we'll mock
const fs = require('fs');
const path = require('path');

// Save original implementations
const originalFsExistsSync = fs.existsSync;
const originalFsReadFileSync = fs.readFileSync;
const originalFsWriteFileSync = fs.writeFileSync;
const originalPathResolve = path.resolve;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Test result tracking
let passedTests = 0;
let failedTests = 0;
let testResults = new Map();

console.log('🧪 Testing fix-type-errors.js...');

function runTest(testNumber, testName, testFunction) {
  console.log(`\n🔍 Test ${testNumber}: ${testName}`);
  try {
    testFunction();
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
    testResults.set(testNumber, { passed: true, name: testName });
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    console.log(`   Stack: ${error.stack.split('\n')[1]}`);
    failedTests++;
    testResults.set(testNumber, { passed: false, name: testName, error: error.message });
  } finally {
    // Restore original implementations
    fs.existsSync = originalFsExistsSync;
    fs.readFileSync = originalFsReadFileSync;
    fs.writeFileSync = originalFsWriteFileSync;
    path.resolve = originalPathResolve;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }
}

// Test 1: Check timestamp type replacements
runTest(1, "Check timestamp type replacements work correctly", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    readFileSync: [],
    writeFileSync: []
  };

  // Mock fs.existsSync to return true
  fs.existsSync = function(filePath) {
    mockCalls.existsSync.push(filePath);
    return true;
  };

  // Mock fs.readFileSync to return content with timestamp type errors
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });
    if (filePath.includes('advancedLogger.test.ts')) {
      return `
        const testObj = {
          id: 'test123',
          name: 'Test Object',
          timestamp: Date.now(), // This should be a Date type
          other: 'field'
        };
      `;
    }
    return '';
  };

  // Mock fs.writeFileSync to verify content
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });

    if (filePath.includes('advancedLogger.test.ts')) {
      // Verify content has been updated correctly with new Date()
      if (!content.includes('timestamp: new Date()')) {
        throw new Error('Timestamp not correctly replaced with new Date()');
      }

      // Verify the original timestamp was properly replaced
      if (content.includes('timestamp: Date.now()')) {
        throw new Error('Original timestamp with Date.now() still exists in the content');
      }
    }
  };

  // Mock path.resolve to return a test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log and console.error to suppress output
  console.log = function() {};
  console.error = function() {};

  // Run the script by evaluating its code directly
  const fixTypeErrorsCode = originalFsReadFileSync('tools/fix-type-errors.js', 'utf8');
  eval(fixTypeErrorsCode);

  // Check that write was called for the timestamp file
  const timestampFileWritten = mockCalls.writeFileSync.some(call =>
    call.filePath.includes('advancedLogger.test.ts'));

  if (!timestampFileWritten) {
    throw new Error('fs.writeFileSync was not called for the timestamp file');
  }
});

// Test 2: Check function parameter type fixes
runTest(2, "Check function parameter type fixes work correctly", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    readFileSync: [],
    writeFileSync: []
  };

  // Mock fs.existsSync to return true
  fs.existsSync = function(filePath) {
    mockCalls.existsSync.push(filePath);
    return true;
  };

  // Mock fs.readFileSync to return content with parameter type errors
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });

    if (filePath.includes('logger.ts')) {
      return `
        export class Logger {
          log(message: string, context: Record<string, unknown> | undefined) {
            // Log implementation
          }
        }
      `;
    }
    return '';
  };

  // Mock fs.writeFileSync to verify content
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });

    if (filePath.includes('logger.ts')) {
      // Verify content has been updated correctly with optional parameter syntax
      if (!content.includes('context?: Record<string, unknown>')) {
        throw new Error('Parameter type not correctly replaced with optional parameter syntax');
      }

      // Verify the original union with undefined was properly replaced
      if (content.includes('context: Record<string, unknown> | undefined')) {
        throw new Error('Original union type with undefined still exists in the content');
      }
    }
  };

  // Mock path.resolve to return a test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log and console.error to suppress output
  console.log = function() {};
  console.error = function() {};

  // Run the script by evaluating its code directly
  const fixTypeErrorsCode = originalFsReadFileSync('tools/fix-type-errors.js', 'utf8');
  eval(fixTypeErrorsCode);

  // Check that write was called for the logger file
  const loggerFileWritten = mockCalls.writeFileSync.some(call =>
    call.filePath.includes('logger.ts'));

  if (!loggerFileWritten) {
    throw new Error('fs.writeFileSync was not called for the logger file');
  }
});

// Test 3: Check handling of files that do not exist
runTest(3, "Check handling of non-existent files", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    readFileSync: [],
    writeFileSync: [],
    consoleLog: []
  };

  // Mock fs.existsSync to return false (files don't exist)
  fs.existsSync = function(filePath) {
    mockCalls.existsSync.push(filePath);
    return false;
  };

  // Mock fs.readFileSync to track calls
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });
    return '';
  };

  // Mock fs.writeFileSync to track calls
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });
  };

  // Mock path.resolve to return test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to track output
  console.log = function(...args) {
    mockCalls.consoleLog.push(args.join(' '));
  };

  // Run the script by evaluating its code directly
  const fixTypeErrorsCode = originalFsReadFileSync('tools/fix-type-errors.js', 'utf8');
  eval(fixTypeErrorsCode);

  // Verify readFileSync was never called
  if (mockCalls.readFileSync.length > 0) {
    throw new Error('fs.readFileSync was called even though files do not exist');
  }

  // Verify writeFileSync was never called
  if (mockCalls.writeFileSync.length > 0) {
    throw new Error('fs.writeFileSync was called even though files do not exist');
  }

  // Verify the "does not exist" message was logged for both files
  const nonExistentLoggerMessage = mockCalls.consoleLog.some(log =>
    log.includes('does not exist') && log.includes('logger.ts'));

  const nonExistentAdvancedLoggerMessage = mockCalls.consoleLog.some(log =>
    log.includes('does not exist') && log.includes('advancedLogger.test.ts'));

  if (!nonExistentLoggerMessage || !nonExistentAdvancedLoggerMessage) {
    throw new Error('Not all non-existent files were properly reported');
  }
});

// Test 4: Check handling files that don't need changes
runTest(4, "Check handling of files that don't need changes", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    readFileSync: [],
    writeFileSync: [],
    consoleLog: []
  };

  // Mock fs.existsSync to return true
  fs.existsSync = function(filePath) {
    mockCalls.existsSync.push(filePath);
    return true;
  };

  // Mock fs.readFileSync to return already correct content
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });

    if (filePath.includes('advancedLogger.test.ts')) {
      return `
        const testObj = {
          id: 'test123',
          name: 'Test Object',
          timestamp: new Date(), // Already using the correct type
          other: 'field'
        };
      `;
    } else if (filePath.includes('logger.ts')) {
      return `
        export class Logger {
          log(message: string, context?: Record<string, unknown>) {
            // Log implementation
          }
        }
      `;
    }

    return '';
  };

  // Mock fs.writeFileSync to track calls
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });
  };

  // Mock path.resolve to return test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to track output
  console.log = function(...args) {
    mockCalls.consoleLog.push(args.join(' '));
  };

  // Run the script by evaluating its code directly
  const fixTypeErrorsCode = originalFsReadFileSync('tools/fix-type-errors.js', 'utf8');
  eval(fixTypeErrorsCode);

  // Verify readFileSync was called for both files
  if (mockCalls.readFileSync.length !== 2) {
    throw new Error('Not all files were read');
  }

  // Verify writeFileSync was never called (no changes needed)
  if (mockCalls.writeFileSync.length > 0) {
    throw new Error('fs.writeFileSync was called even though no changes were needed');
  }

  // Verify the "no changes needed" message was logged for both files
  const noChangesLoggerMessage = mockCalls.consoleLog.some(log =>
    log.includes('No changes needed for') && log.includes('logger.ts'));

  const noChangesAdvancedLoggerMessage = mockCalls.consoleLog.some(log =>
    log.includes('No changes needed for') && log.includes('advancedLogger.test.ts'));

  if (!noChangesLoggerMessage || !noChangesAdvancedLoggerMessage) {
    throw new Error('Not all unchanged files were properly reported');
  }
});

// Test 5: Check error handling when reading files
runTest(5, "Check error handling when reading files", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    consoleError: []
  };

  // Mock fs.existsSync to return true
  fs.existsSync = function(filePath) {
    mockCalls.existsSync.push(filePath);
    return true;
  };

  // Mock fs.readFileSync to throw an error
  fs.readFileSync = function() {
    throw new Error('Mock read error');
  };

  // Mock console.error to track errors
  console.error = function(...args) {
    mockCalls.consoleError.push(args.join(' '));
  };

  // Mock path.resolve to return test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to suppress output
  console.log = function() {};

  // Run the script by evaluating its code directly
  const fixTypeErrorsCode = originalFsReadFileSync('tools/fix-type-errors.js', 'utf8');
  eval(fixTypeErrorsCode);

  // Verify error messages were logged
  if (mockCalls.consoleError.length === 0) {
    throw new Error('No error messages were logged');
  }

  // Check for specific error messages
  const readErrorMessages = mockCalls.consoleError.filter(log =>
    log.includes('Failed to fix type errors') && log.includes('Mock read error'));

  if (readErrorMessages.length < 2) { // Should have errors for both files
    throw new Error('File read errors were not properly reported for all files');
  }
});

// Test 6: Check error handling when writing files
runTest(6, "Check error handling when writing files", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    consoleError: []
  };

  // Mock fs.existsSync to return true
  fs.existsSync = function(filePath) {
    mockCalls.existsSync.push(filePath);
    return true;
  };

  // Mock fs.readFileSync to return content that needs fixes
  fs.readFileSync = function(filePath) {
    if (filePath.includes('advancedLogger.test.ts')) {
      return `
        const testObj = {
          timestamp: Date.now()
        };
      `;
    } else if (filePath.includes('logger.ts')) {
      return `
        export class Logger {
          log(message: string, context: Record<string, unknown> | undefined) {}
        }
      `;
    }
    return '';
  };

  // Mock fs.writeFileSync to throw an error
  fs.writeFileSync = function() {
    throw new Error('Mock write error');
  };

  // Mock console.error to track errors
  console.error = function(...args) {
    mockCalls.consoleError.push(args.join(' '));
  };

  // Mock path.resolve to return test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to suppress output
  console.log = function() {};

  // Run the script by evaluating its code directly
  const fixTypeErrorsCode = originalFsReadFileSync('tools/fix-type-errors.js', 'utf8');
  eval(fixTypeErrorsCode);

  // Verify error messages were logged
  if (mockCalls.consoleError.length === 0) {
    throw new Error('No error messages were logged');
  }

  // Check for specific error messages
  const writeErrorMessages = mockCalls.consoleError.filter(log =>
    log.includes('Failed to fix type errors') && log.includes('Mock write error'));

  if (writeErrorMessages.length < 2) { // Should have errors for both files
    throw new Error('File write errors were not properly reported for all files');
  }
});

// Report results
console.log('\n📊 Test Results:');
for (const [testNum, result] of testResults.entries()) {
  console.log(`Test ${testNum}: ${result.passed ? '✅ PASS' : '❌ FAIL'} - ${result.name}`);
  if (!result.passed) {
    console.log(`   Error: ${result.error}`);
  }
}
console.log(`\n📈 Summary: ${passedTests} passed, ${failedTests} failed.`);

if (failedTests > 0) {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
}
