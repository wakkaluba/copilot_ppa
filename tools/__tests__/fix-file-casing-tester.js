// filepath: d:\___coding\tools\copilot_ppa\tools\__tests__\fix-file-casing-tester.js
/**
 * Simple test script for fix-file-casing.js
 * This is a standalone test runner that avoids issues with the project's Jest configuration
 */

// Original implementations that we'll mock
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Save original implementations
const originalFsExistsSync = fs.existsSync;
const originalFsRenameSync = fs.renameSync;
const originalFsReadFileSync = fs.readFileSync;
const originalFsWriteFileSync = fs.writeFileSync;
const originalPathResolve = path.resolve;
const originalExecSync = childProcess.execSync;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Test result tracking
let passedTests = 0;
let failedTests = 0;
let testResults = new Map();

console.log('🧪 Testing fix-file-casing.js...');

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
    fs.renameSync = originalFsRenameSync;
    fs.readFileSync = originalFsReadFileSync;
    fs.writeFileSync = originalFsWriteFileSync;
    childProcess.execSync = originalExecSync;
    path.resolve = originalPathResolve;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }
}

// Test 1: Basic file renaming functionality
runTest(1, "Check that the script renames files with proper casing", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    execSync: [],
    renameSync: [],
    readFileSync: [],
    writeFileSync: [],
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

  // Mock fs.readFileSync to return dummy content
  fs.readFileSync = function(path, encoding) {
    mockCalls.readFileSync.push({ path, encoding });
    if (path.includes('fix-file-casing.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return 'import Logger from "../utils/Logger";\nimport ConversationManager from "./ConversationManager";';
  };

  // Mock fs.writeFileSync to do nothing
  fs.writeFileSync = function(path, content, encoding) {
    mockCalls.writeFileSync.push({ path, content, encoding });
  };

  // Mock path.resolve to return consistent paths
  path.resolve = function(dirName, parentDir, filePath) {
    mockCalls.pathResolve.push({ dirName, parentDir, filePath });
    // Make sure paths match except for casing
    if (filePath) {
      return `${dirName}/${parentDir}/${filePath}`.toLowerCase();
    }
    return `${dirName}/${parentDir || ''}`.toLowerCase();
  };

  // Run the script by evaluating its code directly
  const fixFileCasingCode = fs.readFileSync('tools/fix-file-casing.js', 'utf8');
  eval(fixFileCasingCode);

  // Verify we checked for file existence
  if (mockCalls.existsSync.length < 4) {
    throw new Error(`Expected at least 4 fs.existsSync calls, but got ${mockCalls.existsSync.length}`);
  }

  // Verify we tried to use git
  const gitCalls = mockCalls.execSync.filter(cmd => cmd.includes('git mv'));
  if (gitCalls.length < 4) {
    throw new Error(`Expected at least 4 git execSync calls, but got ${gitCalls.length}`);
  }

  // Verify readFileSync was called for import updates
  if (mockCalls.readFileSync.length < 2) {
    throw new Error(`Expected at least 2 fs.readFileSync calls, but got ${mockCalls.readFileSync.length}`);
  }

  // Verify writeFileSync was called for import updates
  if (mockCalls.writeFileSync.length < 2) {
    throw new Error(`Expected at least 2 fs.writeFileSync calls, but got ${mockCalls.writeFileSync.length}`);
  }

  // Check for start and completion messages
  const startMsg = mockCalls.consoleLog.some(args => args[0] === 'Starting file casing fix script...');
  const endMsg = mockCalls.consoleLog.some(args => args[0] === 'File casing fix script completed');

  if (!startMsg || !endMsg) {
    throw new Error('Missing start or completion messages');
  }
});

// Test 2: Non-existent files
runTest(2, "Check handling of non-existent files", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    consoleLog: []
  };

  // Mock console.log
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };

  // Mock fs.existsSync to return false for source files but true for import files
  fs.existsSync = function(path) {
    mockCalls.existsSync.push(path);
    // Return false specifically for the casing issue files
    return !path.toString().includes('Logger.ts') && !path.toString().includes('ConversationManager.ts');
  };

  // Mock child_process.execSync to do nothing
  childProcess.execSync = function(cmd) {
    // do nothing
  };

  // Mock path.resolve to return proper paths
  path.resolve = function(dirName, parentDir, filePath) {
    if (filePath) {
      return `${dirName}/${parentDir}/${filePath}`;
    }
    return `${dirName}/${parentDir || ''}`;
  };

  // Mock fs.readFileSync to return dummy content
  fs.readFileSync = function(path, encoding) {
    if (path.includes('fix-file-casing.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return 'import Logger from "../utils/Logger";\nimport ConversationManager from "./ConversationManager";';
  };

  // Mock fs.writeFileSync to do nothing
  fs.writeFileSync = function(path, content, encoding) {
    // Do nothing
  };

  // Run the script by evaluating its code directly
  const fixFileCasingCode = fs.readFileSync('tools/fix-file-casing.js', 'utf8');
  eval(fixFileCasingCode);

  // Check for the exact non-existent file message format
  const nonExistentMsg = mockCalls.consoleLog.some(args =>
    args[0] && typeof args[0] === 'string' &&
    (args[0].includes('does not exist') ||
     args[0].includes('File src/utils/Logger.ts does not exist') ||
     args[0].includes('File src/services/ConversationManager.ts does not exist')));

  if (!nonExistentMsg) {
    // If failing, log all console messages to help debug
    console.error('All console log messages:');
    mockCalls.consoleLog.forEach(args => {
      console.error(JSON.stringify(args));
    });
    throw new Error('Missing non-existent file message');
  }
});

// Test 3: Git error fallback
runTest(3, "Check fallback to fs operations when git fails", () => {
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

  // Mock path.resolve for consistent path comparison
  path.resolve = function(dirName, parentDir, filePath) {
    if (filePath) {
      return `${dirName}/${parentDir}/${filePath}`.toLowerCase();
    }
    return `${dirName}/${parentDir || ''}`.toLowerCase();
  };

  // Mock fs.renameSync to track calls
  fs.renameSync = function(from, to) {
    mockCalls.renameSync.push({ from, to });
  };

  // Mock fs.readFileSync
  fs.readFileSync = function(path, encoding) {
    if (path.includes('fix-file-casing.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return 'import Logger from "../utils/Logger";\nimport ConversationManager from "./ConversationManager";';
  };

  // Mock fs.writeFileSync to do nothing
  fs.writeFileSync = function(path, content, encoding) {
    // Do nothing
  };

  // Mock child_process.execSync to fail with git commands
  childProcess.execSync = function(cmd) {
    mockCalls.execSync.push(cmd);
    if (cmd.includes('git mv')) {
      throw new Error('Git error');
    }
  };

  // Run the script by evaluating its code directly
  const fixFileCasingCode = fs.readFileSync('tools/fix-file-casing.js', 'utf8');
  eval(fixFileCasingCode);

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
});

// Test 4: Filesystem error handling
runTest(4, "Check handling of filesystem errors", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    execSync: [],
    renameSync: [],
    readFileSync: [],
    writeFileSync: [],
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

  // Mock path.resolve for consistent path comparison
  path.resolve = function(dirName, parentDir, filePath) {
    if (filePath) {
      return `${dirName}/${parentDir}/${filePath}`.toLowerCase();
    }
    return `${dirName}/${parentDir || ''}`.toLowerCase();
  };

  // Mock fs.renameSync to throw error
  fs.renameSync = function(from, to) {
    mockCalls.renameSync.push({ from, to });
    throw new Error('FS error');
  };

  // Mock fs.readFileSync
  fs.readFileSync = function(path, encoding) {
    mockCalls.readFileSync.push({ path, encoding });
    if (path.includes('fix-file-casing.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return 'import Logger from "../utils/Logger";\nimport ConversationManager from "./ConversationManager";';
  };

  // Mock fs.writeFileSync to throw error
  fs.writeFileSync = function(path, content, encoding) {
    mockCalls.writeFileSync.push({ path, content, encoding });
    throw new Error('FS write error');
  };

  // Mock child_process.execSync to fail with git commands
  childProcess.execSync = function(cmd) {
    mockCalls.execSync.push(cmd);
    if (cmd.includes('git mv')) {
      throw new Error('Git error');
    }
  };

  // Run the script by evaluating its code directly
  const fixFileCasingCode = fs.readFileSync('tools/fix-file-casing.js', 'utf8');
  eval(fixFileCasingCode);

  // Check for git error message
  const gitErrorMsg = mockCalls.consoleError.some(args =>
    args[0] && args[0].includes && args[0].includes('Git error'));

  // Check for filesystem error message
  const fsErrorMsg = mockCalls.consoleError.some(args =>
    args[0] && args[0].includes && args[0].includes('Filesystem error'));

  // Check for write error message
  const writeErrorMsg = mockCalls.consoleError.some(args =>
    args[0] && args[0].includes && args[0].includes('Failed to update imports'));

  if (!gitErrorMsg) {
    throw new Error('Missing git error message');
  }

  if (!fsErrorMsg) {
    throw new Error('Missing filesystem error message');
  }

  if (!writeErrorMsg) {
    throw new Error('Missing write error message');
  }
});

// Test 5: Path mismatch
runTest(5, "Check skipping of files with paths that don't match except for casing", () => {
  // Mock implementations
  let mockCalls = {
    pathResolve: [],
    existsSync: [],
    consoleLog: []
  };

  // Mock console.log
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };

  // Mock child_process.execSync to do nothing
  childProcess.execSync = function(cmd) {
    // Do nothing
  };

  // Mock path.resolve for different paths
  path.resolve = function(dirName, parentDir, filePath) {
    mockCalls.pathResolve.push({ dirName, parentDir, filePath });

    // For Logger.ts paths - make different paths (not just casing)
    if (filePath === 'src/utils/Logger.ts') {
      return '/different/path/a/logger.ts';
    } else if (filePath === 'src/utils/logger.ts') {
      return '/different/path/b/logger.ts';
    }
    // For ConversationManager paths - make same except for casing
    else if (filePath === 'src/services/ConversationManager.ts') {
      return '/same/path/conversationmanager.ts';
    } else if (filePath === 'src/services/conversationManager.ts') {
      return '/same/path/conversationmanager.ts';
    }

    return `/default/${filePath || ''}`;
  };

  // Mock fs.existsSync
  fs.existsSync = function(path) {
    mockCalls.existsSync.push(path);
    return false;
  };

  // Mock fs.readFileSync
  fs.readFileSync = function(path, encoding) {
    if (path.includes('fix-file-casing.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return '';
  };

  // Run the script by evaluating its code directly
  const fixFileCasingCode = fs.readFileSync('tools/fix-file-casing.js', 'utf8');
  eval(fixFileCasingCode);

  // Check for path mismatch skip message for Logger.ts
  const skipMsg = mockCalls.consoleLog.find(args =>
    args[0] && args[0].includes && args[0].includes('Skipping'));

  if (!skipMsg) {
    throw new Error('Missing skip message for path mismatch');
  }
});

// Test 6: Import updates
runTest(6, "Check updating of imports in files", () => {
  // Mock implementations
  let mockCalls = {
    existsSync: [],
    readFileSync: [],
    writeFileSync: [],
    consoleLog: []
  };

  // Mock console.log
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };

  // Mock path.resolve for consistent path comparison
  path.resolve = function(dirName, parentDir, filePath) {
    // Just return a consistent path for comparisons
    if (filePath) {
      return `/test/${filePath}`;
    }
    return `/test`;
  };

  // Mock fs.existsSync to return true only for import update files
  fs.existsSync = function(path) {
    mockCalls.existsSync.push(path);
    // Return true for import files, false for the files to be renamed
    return path.includes('WorkspaceManager.ts') || path.includes('CoreAgent.ts');
  };

  // Mock fs.readFileSync to return content with imports to fix
  fs.readFileSync = function(path, encoding) {
    if (path.includes('fix-file-casing.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return 'import Logger from "../utils/Logger";\nimport ConversationManager from "./ConversationManager";';
  };

  // Mock fs.writeFileSync to check content changes
  fs.writeFileSync = function(path, content, encoding) {
    mockCalls.writeFileSync.push({ path, content, encoding });

    // Validate content has updated imports
    const hasLoggerUpdate = content.includes('../utils/logger');
    const hasConversationManagerUpdate = content.includes('./conversationManager');

    if (!hasLoggerUpdate || !hasConversationManagerUpdate) {
      throw new Error(`Import paths were not correctly updated: ${content}`);
    }
  };

  // Run the script by evaluating its code directly
  const fixFileCasingCode = fs.readFileSync('tools/fix-file-casing.js', 'utf8');
  eval(fixFileCasingCode);

  // Check for successful update messages
  const successMsg = mockCalls.consoleLog.some(args =>
    args[0] && args[0].includes && args[0].includes('Successfully updated imports'));

  if (!successMsg) {
    throw new Error('Missing success message for updates');
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
