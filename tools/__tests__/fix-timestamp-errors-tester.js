// filepath: d:\___coding\tools\copilot_ppa\tools\__tests__\fix-timestamp-errors-tester.js
/**
 * Simple test script for fix-timestamp-errors.js
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

console.log('🧪 Testing fix-timestamp-errors.js...');

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

// Test 1: Check basic timestamp replacements
runTest(1, "Check basic timestamp replacements work correctly", () => {
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

  // Mock fs.readFileSync to return content with timestamp errors
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });
    return `
      const testObject = {
        id: 'test123',
        name: 'Test Object',
        timestamp: new Date(),
        other: 'field'
      };
    `;
  };

  // Mock fs.writeFileSync to verify content
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });

    // Verify content has been updated correctly with Date.now()
    if (!content.includes('timestamp: Date.now()')) {
      throw new Error('Timestamp not correctly replaced with Date.now()');
    }

    // Verify the original timestamp was properly replaced
    if (content.includes('timestamp: new Date()')) {
      throw new Error('Original timestamp with new Date() still exists in the content');
    }
  };

  // Mock path.resolve to return a test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to suppress output
  console.log = function() {};
  console.error = function() {};

  // Run the script by evaluating its code directly
  const fixTimestampCode = originalFsReadFileSync('tools/fix-timestamp-errors.js', 'utf8');
  eval(fixTimestampCode);

  // Check that writeFileSync was called at least once
  if (mockCalls.writeFileSync.length === 0) {
    throw new Error('fs.writeFileSync was not called for any file');
  }

  // Verify that each of the files in the script were attempted to be fixed
  if (mockCalls.existsSync.length < 7) { // 7 files defined in the script
    throw new Error('Not all files were checked for existence');
  }
});

// Test 2: Check timestamp replacements with complex patterns
runTest(2, "Check complex timestamp pattern replacements work correctly", () => {
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

  // Mock fs.readFileSync to return different content based on the file
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });

    // Add various timestamp patterns based on filepath
    if (filePath.includes('ConversationMemory.test.ts')) {
      return `
        const testObject = {
          id: 'test123',
          name: 'Test Object',
          timestamp: new Date() + 1000, // Addition case
          other: 'field'
        };
      `;
    } else if (filePath.includes('component-performance.test.ts')) {
      return `
        const testObject = {
          id: 'test123',
          name: 'Test Object',
          timestamp: new Date() - 1000, // Subtraction case
          other: 'field'
        };
      `;
    } else {
      return `
        const testObject = {
          id: 'test123',
          name: 'Test Object',
          timestamp: new Date(),
          other: 'field'
        };
      `;
    }
  };

  // Mock fs.writeFileSync to verify content
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });

    // Different checks based on the file
    if (filePath.includes('ConversationMemory.test.ts')) {
      if (!content.includes('timestamp: Date.now() + 1000')) {
        throw new Error('Timestamp with addition not correctly replaced in ConversationMemory.test.ts');
      }
    } else if (filePath.includes('component-performance.test.ts')) {
      if (!content.includes('timestamp: Date.now() - 1000')) {
        throw new Error('Timestamp with subtraction not correctly replaced in component-performance.test.ts');
      }
    } else {
      if (!content.includes('timestamp: Date.now()')) {
        throw new Error('Basic timestamp not correctly replaced');
      }
    }
  };

  // Mock path.resolve to return a test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to suppress output
  console.log = function() {};
  console.error = function() {};

  // Run the script by evaluating its code directly
  const fixTimestampCode = originalFsReadFileSync('tools/fix-timestamp-errors.js', 'utf8');
  eval(fixTimestampCode);

  // Verify that each file had their specialized replacements
  const memoryFileFixed = mockCalls.writeFileSync.some(call =>
    call.filePath.includes('ConversationMemory.test.ts'));

  const performanceFileFixed = mockCalls.writeFileSync.some(call =>
    call.filePath.includes('component-performance.test.ts'));

  if (!memoryFileFixed) {
    throw new Error('ConversationMemory.test.ts file was not properly processed');
  }

  if (!performanceFileFixed) {
    throw new Error('component-performance.test.ts file was not properly processed');
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

  // Mock fs.existsSync to return false
  fs.existsSync = function(filePath) {
    mockCalls.existsSync.push(filePath);
    return false; // All files don't exist
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
    mockCalls.consoleLog.push(args);
  };

  // Run the script by evaluating its code directly
  const fixTimestampCode = originalFsReadFileSync('tools/fix-timestamp-errors.js', 'utf8');
  eval(fixTimestampCode);

  // Verify readFileSync was never called
  if (mockCalls.readFileSync.length > 0) {
    throw new Error('fs.readFileSync was called even though files do not exist');
  }

  // Verify writeFileSync was never called
  if (mockCalls.writeFileSync.length > 0) {
    throw new Error('fs.writeFileSync was called even though files do not exist');
  }

  // Verify the "does not exist" message was logged
  const nonExistentMessages = mockCalls.consoleLog.filter(args =>
    args[0] && args[0].includes && args[0].includes('does not exist'));

  if (nonExistentMessages.length < 7) { // 7 files in the script
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
    return `
      const testObject = {
        id: 'test123',
        name: 'Test Object',
        timestamp: Date.now(), // Already correct
        other: 'field'
      };
    `;
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
    mockCalls.consoleLog.push(args);
  };

  // Run the script by evaluating its code directly
  const fixTimestampCode = originalFsReadFileSync('tools/fix-timestamp-errors.js', 'utf8');
  eval(fixTimestampCode);

  // Verify readFileSync was called for all files
  if (mockCalls.readFileSync.length < 7) { // 7 files in the script
    throw new Error('Not all files were read');
  }

  // Verify writeFileSync was never called (no changes needed)
  if (mockCalls.writeFileSync.length > 0) {
    throw new Error('fs.writeFileSync was called even though no changes were needed');
  }

  // Verify the "no changes needed" message was logged
  const noChangesMessages = mockCalls.consoleLog.filter(args =>
    args[0] && args[0].includes && args[0].includes('No changes needed for'));

  if (noChangesMessages.length < 7) { // 7 files in the script
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
    mockCalls.consoleError.push(args);
  };

  // Mock path.resolve to return test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to suppress output
  console.log = function() {};

  // Run the script by evaluating its code directly
  const fixTimestampCode = originalFsReadFileSync('tools/fix-timestamp-errors.js', 'utf8');
  eval(fixTimestampCode);

  // Verify error messages were logged
  if (mockCalls.consoleError.length === 0) {
    throw new Error('No error messages were logged');
  }

  // Check for specific error messages
  const readErrorMessages = mockCalls.consoleError.filter(args =>
    args[0] && args[0].includes && args[0].includes('Failed to fix timestamp errors'));

  if (readErrorMessages.length === 0) {
    throw new Error('File read errors were not properly reported');
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

  // Mock fs.readFileSync to return content with timestamp errors
  fs.readFileSync = function() {
    return `
      const testObject = {
        id: 'test123',
        timestamp: new Date()
      };
    `;
  };

  // Mock fs.writeFileSync to throw an error
  fs.writeFileSync = function() {
    throw new Error('Mock write error');
  };

  // Mock console.error to track errors
  console.error = function(...args) {
    mockCalls.consoleError.push(args);
  };

  // Mock path.resolve to return test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to suppress output
  console.log = function() {};

  // Run the script by evaluating its code directly
  const fixTimestampCode = originalFsReadFileSync('tools/fix-timestamp-errors.js', 'utf8');
  eval(fixTimestampCode);

  // Verify error messages were logged
  if (mockCalls.consoleError.length === 0) {
    throw new Error('No error messages were logged');
  }

  // Check for specific error messages
  const writeErrorMessages = mockCalls.consoleError.filter(args =>
    args[0] && args[0].includes && args[0].includes('Failed to fix timestamp errors'));

  if (writeErrorMessages.length === 0) {
    throw new Error('File write errors were not properly reported');
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
