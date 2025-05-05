// filepath: d:\___coding\tools\copilot_ppa\tools\__tests__\fix-casing-tester.js
/**
 * Simple test script for fix-casing.js
 */

// Original implementations that we'll mock
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Save original implementations
const originalFsExistsSync = fs.existsSync;
const originalFsRenameSync = fs.renameSync;
const originalPathResolve = path.resolve;
const originalExecSync = childProcess.execSync;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Test result tracking
let passedTests = 0;
let failedTests = 0;

console.log('🧪 Testing fix-casing.js...');

// Test 1: Basic functionality
console.log('\n🔍 Test 1: Check that the script processes all files');
try {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    execSync: [],
    renameSync: [],
    pathResolve: [],
    consoleLog: []
  };

  // Mock console.log
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };

  // Mock fs.existsSync to always return true
  fs.existsSync = function(path) {
    mockCalls.existsSync.push(path);
    return true;
  };

  // Mock child_process.execSync to do nothing
  childProcess.execSync = function(cmd) {
    mockCalls.execSync.push(cmd);
  };

  // Mock fs.renameSync to do nothing
  fs.renameSync = function(from, to) {
    mockCalls.renameSync.push({ from, to });
  };

  // Mock path.resolve to return consistent paths
  path.resolve = function(dirName, parentDir, filePath) {
    mockCalls.pathResolve.push({ dirName, parentDir, filePath });
    // Make sure paths match except for casing
    if (filePath) {
      return dirName + '/' + parentDir + '/' + filePath;
    }
    return dirName + '/' + (parentDir || '');
  };

  // Run the script by evaluating its code directly
  const fixCasingCode = fs.readFileSync('tools/fix-casing.js', 'utf8');
  eval(fixCasingCode);

  // Verify we checked for file existence
  if (mockCalls.existsSync.length < 3) {
    throw new Error(`Expected at least 3 fs.existsSync calls, but got ${mockCalls.existsSync.length}`);
  }

  // Verify we tried to use git
  const gitCalls = mockCalls.execSync.filter(cmd => cmd.includes('git mv'));
  if (gitCalls.length < 6) {
    throw new Error(`Expected at least 6 git execSync calls, but got ${gitCalls.length}`);
  }

  // Check for start and completion messages
  const startMsg = mockCalls.consoleLog.some(args => args[0] === 'Starting file casing fix script...');
  const endMsg = mockCalls.consoleLog.some(args => args[0] === 'File casing fix script completed');

  if (!startMsg || !endMsg) {
    throw new Error('Missing start or completion messages');
  }

  console.log('✅ PASS: Basic functionality test');
  passedTests++;
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  failedTests++;
} finally {
  // Restore original implementations
  fs.existsSync = originalFsExistsSync;
  fs.renameSync = originalFsRenameSync;
  childProcess.execSync = originalExecSync;
  path.resolve = originalPathResolve;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

// Test 2: Non-existent files
console.log('\n🔍 Test 2: Check handling of non-existent files');
try {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    execSync: [],
    consoleLog: []
  };

  // Mock console.log
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };

  // Mock fs.existsSync to return false for the first file
  fs.existsSync = function(path) {
    mockCalls.existsSync.push(path);
    return !path.includes('Logger.ts');
  };

  // Mock child_process.execSync to do nothing
  childProcess.execSync = function(cmd) {
    mockCalls.execSync.push(cmd);
  };

  // Run the script by evaluating its code directly
  const fixCasingCode = fs.readFileSync('tools/fix-casing.js', 'utf8');
  eval(fixCasingCode);

  // Check for non-existent file message
  const nonExistentMsg = mockCalls.consoleLog.some(args =>
    args[0] && args[0].includes && args[0].includes('does not exist'));

  if (!nonExistentMsg) {
    throw new Error('Missing non-existent file message');
  }

  console.log('✅ PASS: Non-existent files test');
  passedTests++;
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  failedTests++;
} finally {
  // Restore original implementations
  fs.existsSync = originalFsExistsSync;
  fs.renameSync = originalFsRenameSync;
  childProcess.execSync = originalExecSync;
  path.resolve = originalPathResolve;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

// Test 3: Git error fallback
console.log('\n🔍 Test 3: Check fallback to fs operations when git fails');
try {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    execSync: [],
    renameSync: [],
    consoleError: [],
    consoleLog: []
  };

  // Mock console methods
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };
  console.error = function(...args) {
    mockCalls.consoleError.push(args);
  };

  // Mock fs.existsSync to return true
  fs.existsSync = function(path) {
    mockCalls.existsSync.push(path);
    return true;
  };

  // Mock fs.renameSync to track calls
  fs.renameSync = function(from, to) {
    mockCalls.renameSync.push({ from, to });
  };

  // Mock child_process.execSync to fail with git commands
  childProcess.execSync = function(cmd) {
    mockCalls.execSync.push(cmd);
    if (cmd.includes('git mv')) {
      throw new Error('Git error');
    }
  };

  // Run the script by evaluating its code directly
  const fixCasingCode = fs.readFileSync('tools/fix-casing.js', 'utf8');
  eval(fixCasingCode);

  // Check for git error message
  const gitErrorMsg = mockCalls.consoleError.some(args =>
    args[0] && args[0].includes && args[0].includes('Git error'));

  if (!gitErrorMsg) {
    throw new Error('Missing git error message');
  }

  // Check that we used fs.renameSync as fallback
  if (mockCalls.renameSync.length === 0) {
    throw new Error('fs.renameSync was not called as fallback');
  }

  console.log('✅ PASS: Git error fallback test');
  passedTests++;
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  failedTests++;
} finally {
  // Restore original implementations
  fs.existsSync = originalFsExistsSync;
  fs.renameSync = originalFsRenameSync;
  childProcess.execSync = originalExecSync;
  path.resolve = originalPathResolve;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

// Test 4: Filesystem error
console.log('\n🔍 Test 4: Check handling of filesystem errors');
try {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    execSync: [],
    renameSync: [],
    consoleError: [],
    consoleLog: []
  };

  // Mock console methods
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };
  console.error = function(...args) {
    mockCalls.consoleError.push(args);
  };

  // Mock fs.existsSync to return true
  fs.existsSync = function(path) {
    mockCalls.existsSync.push(path);
    return true;
  };

  // Mock fs.renameSync to throw error
  fs.renameSync = function(from, to) {
    mockCalls.renameSync.push({ from, to });
    throw new Error('FS error');
  };

  // Mock child_process.execSync to fail with git commands
  childProcess.execSync = function(cmd) {
    mockCalls.execSync.push(cmd);
    if (cmd.includes('git mv')) {
      throw new Error('Git error');
    }
  };

  // Run the script by evaluating its code directly
  const fixCasingCode = fs.readFileSync('tools/fix-casing.js', 'utf8');
  eval(fixCasingCode);

  // Check for git error message
  const gitErrorMsg = mockCalls.consoleError.some(args =>
    args[0] && args[0].includes && args[0].includes('Git error'));

  // Check for filesystem error message
  const fsErrorMsg = mockCalls.consoleError.some(args =>
    args[0] && args[0].includes && args[0].includes('Filesystem error'));

  if (!gitErrorMsg || !fsErrorMsg) {
    throw new Error('Missing git or filesystem error messages');
  }

  console.log('✅ PASS: Filesystem error test');
  passedTests++;
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  failedTests++;
} finally {
  // Restore original implementations
  fs.existsSync = originalFsExistsSync;
  fs.renameSync = originalFsRenameSync;
  childProcess.execSync = originalExecSync;
  path.resolve = originalPathResolve;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

// Test 5: Path mismatch
console.log('\n🔍 Test 5: Check skipping of files with paths that don\'t match except for casing');
try {
  // Mock implementations
  let mockCalls = {
    pathResolve: [],
    consoleLog: []
  };

  // Mock console.log
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };

  // Mock path.resolve to return different paths for from/to
  path.resolve = function(dirName, parentDir, filePath) {
    mockCalls.pathResolve.push({ dirName, parentDir, filePath });
    if (filePath === 'src/utils/Logger.ts') {
      return '/path/A/src/utils/Logger.ts';
    } else if (filePath === 'src/utils/logger.ts') {
      return '/path/B/src/utils/logger.ts';
    }
    return `/path/C/${filePath || ''}`;
  };

  // Run the script by evaluating its code directly
  const fixCasingCode = fs.readFileSync('tools/fix-casing.js', 'utf8');
  eval(fixCasingCode);

  // Check for skip message
  const skipMsg = mockCalls.consoleLog.some(args =>
    args[0] && args[0].includes && args[0].includes('Skipping') && args[0].includes('doesn\'t match'));

  if (!skipMsg) {
    throw new Error('Missing skip message for path mismatch');
  }

  console.log('✅ PASS: Path mismatch test');
  passedTests++;
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  failedTests++;
} finally {
  // Restore original implementations
  fs.existsSync = originalFsExistsSync;
  fs.renameSync = originalFsRenameSync;
  childProcess.execSync = originalExecSync;
  path.resolve = originalPathResolve;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

// Report results
console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed.`);

if (failedTests > 0) {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
}
