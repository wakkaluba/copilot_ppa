// filepath: d:\___coding\tools\copilot_ppa\tools\__tests__\fix-imports-tester.js
/**
 * Simple test script for fix-imports.js
 * This is a standalone test runner that avoids issues with the project's Jest configuration
 */

// Original implementations that we'll mock
const fs = require('fs');
const path = require('path');

// Save original implementations
const originalFsReaddirSync = fs.readdirSync;
const originalFsStatSync = fs.statSync;
const originalFsReadFileSync = fs.readFileSync;
const originalFsWriteFileSync = fs.writeFileSync;
const originalPathResolve = path.resolve;
const originalPathJoin = path.join;
const originalPathRelative = path.relative;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Test result tracking
let passedTests = 0;
let failedTests = 0;
let testResults = new Map();

console.log('🧪 Testing fix-imports.js...');

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
    fs.readdirSync = originalFsReaddirSync;
    fs.statSync = originalFsStatSync;
    fs.readFileSync = originalFsReadFileSync;
    fs.writeFileSync = originalFsWriteFileSync;
    path.resolve = originalPathResolve;
    path.join = originalPathJoin;
    path.relative = originalPathRelative;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }
}

// Test 1: Check import regex replacements
runTest(1, "Check that import regex replacements work correctly", () => {
  // Mock implementations
  let mockCalls = {
    readFileSync: [],
    writeFileSync: []
  };

  // Mock fs.readFileSync to return content with imports to fix
  fs.readFileSync = function(path, encoding) {
    mockCalls.readFileSync.push({ path, encoding });
    if (path.includes('fix-imports.js')) {
      return originalFsReadFileSync(path, encoding);
    }

    // Return content with problematic imports
    return `
      import { Logger } from '../utils/logger';
      import * as LoggerModule from '../utils/logger';
      import { ConversationManager } from './conversationManager';
      import * as ConversationManagerModule from './conversationManager';
      import { CoreAgent } from '../services/coreAgent';
      import * as CoreAgentModule from '../services/coreAgent';
    `;
  };

  // Mock fs.writeFileSync to verify content
  fs.writeFileSync = function(path, content, encoding) {
    mockCalls.writeFileSync.push({ path, content, encoding });

    // Verify content has been updated correctly
    if (!content.includes('../utils/logger') ||
        !content.includes('./conversationManager') ||
        !content.includes('../services/coreAgent')) {
      throw new Error('Import paths not correctly updated');
    }

    // Check if all imports were properly fixed
    const importPatterns = [
      "import { Logger } from '../utils/logger';",
      "import * as LoggerModule from '../utils/logger';",
      "import { ConversationManager } from './conversationManager';",
      "import * as ConversationManagerModule from './conversationManager';",
      "import { CoreAgent } from '../services/coreAgent';",
      "import * as CoreAgentModule from '../services/coreAgent';"
    ];

    const allPatternsPresent = importPatterns.every(pattern =>
      content.includes(pattern.replace(/\s+/g, ' ').trim()));

    if (!allPatternsPresent) {
      throw new Error('Not all import patterns were correctly replaced');
    }
  };

  // Mock file discovery to return just one mock file
  fs.readdirSync = function(dir) {
    return ['mockFile.ts'];
  };

  fs.statSync = function(path) {
    return {
      isDirectory: () => false
    };
  };

  path.join = function(dir, file) {
    return `${dir}/${file}`;
  };

  path.resolve = function(...args) {
    return args.join('/');
  };

  path.relative = function(from, to) {
    return to.replace(from + '/', '');
  };

  // Run the script by evaluating its code directly
  const fixImportsCode = originalFsReadFileSync('tools/fix-imports.js', 'utf8');
  eval(fixImportsCode);

  // Check that writeFileSync was called
  if (mockCalls.writeFileSync.length === 0) {
    throw new Error('fs.writeFileSync was not called for import fixes');
  }
});

// Test 2: Check file discovery excludes node_modules and .git
runTest(2, "Check that file discovery excludes node_modules and .git", () => {
  // Mock implementations
  let mockCalls = {
    readdirSync: [],
    statSync: [],
    readFileSync: [],
    writeFileSync: []
  };

  // Create a mock directory structure
  const mockDirs = {
    'root': ['src', 'node_modules', '.git', 'regular.ts'],
    'root/src': ['components', 'utils', 'file.ts'],
    'root/node_modules': ['package'],
    'root/.git': ['config'],
    'root/src/components': ['Component.ts', 'index.js', 'types.d.ts']
  };

  // Track which directories are processed
  const processedDirs = new Set();

  // Mock fs.readdirSync to return mock directory contents
  fs.readdirSync = function(dir) {
    const normalizedDir = dir.replace(/\\/g, '/');
    processedDirs.add(normalizedDir);

    mockCalls.readdirSync.push(dir);

    // Extract the relative path from our mock structure
    for (const [mockDir, contents] of Object.entries(mockDirs)) {
      if (normalizedDir.endsWith(mockDir)) {
        return contents;
      }
    }

    return [];
  };

  // Mock fs.statSync to identify directories vs files
  fs.statSync = function(path) {
    mockCalls.statSync.push(path);
    const normalizedPath = path.replace(/\\/g, '/');

    // Check if this path is a directory in our mock structure
    let isDir = false;
    for (const mockDir of Object.keys(mockDirs)) {
      if (normalizedPath.endsWith(mockDir) || Object.keys(mockDirs).some(dir =>
        normalizedPath === `${dir.replace(/\\/g, '/')}/${dir.split('/').pop()}`)) {
        isDir = true;
        break;
      }
    }

    return {
      isDirectory: () => isDir
    };
  };

  // Mock fs.readFileSync to return content with imports to fix
  fs.readFileSync = function(path, encoding) {
    mockCalls.readFileSync.push({ path, encoding });
    if (path.includes('fix-imports.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return 'import { Logger } from '../utils/logger';';
  };

  // Mock fs.writeFileSync to track calls
  fs.writeFileSync = function(path, content, encoding) {
    mockCalls.writeFileSync.push({ path, content, encoding });
  };

  // Mock path methods
  path.join = function(dir, file) {
    return `${dir}/${file}`;
  };

  path.resolve = function(...args) {
    return args.join('/');
  };

  path.relative = function(from, to) {
    return to.replace(from + '/', '');
  };

  // Run the script by evaluating its code directly
  const fixImportsCode = originalFsReadFileSync('tools/fix-imports.js', 'utf8');
  eval(fixImportsCode);

  // Verify node_modules was not processed
  if (processedDirs.has('root/node_modules')) {
    throw new Error('node_modules directory was processed');
  }

  // Verify .git was not processed
  if (processedDirs.has('root/.git')) {
    throw new Error('.git directory was processed');
  }

  // Verify that .d.ts files were not processed
  const dtsFile = mockCalls.readFileSync.find(call => call.path && call.path.includes('types.d.ts'));
  if (dtsFile) {
    throw new Error('.d.ts file was processed');
  }
});

// Test 3: Check file reporting
runTest(3, "Check reporting of fixed files", () => {
  // Mock implementations
  let mockCalls = {
    consoleLog: []
  };

  // Mock console.log
  console.log = function(...args) {
    mockCalls.consoleLog.push(args);
  };

  // Mock fs.readFileSync to return content with imports to fix
  fs.readFileSync = function(path, encoding) {
    if (path.includes('fix-imports.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    return 'import { Logger } from '../utils/logger';';
  };

  // Mock fs.writeFileSync to do nothing
  fs.writeFileSync = function(path, content, encoding) {
    // Do nothing
  };

  // Create a mock directory structure with only TS files
  fs.readdirSync = function(dir) {
    return ['file1.ts', 'file2.ts', 'file3.ts'];
  };

  fs.statSync = function(path) {
    return {
      isDirectory: () => false
    };
  };

  path.join = function(dir, file) {
    return `${dir}/${file}`;
  };

  path.resolve = function(...args) {
    return args.join('/');
  };

  path.relative = function(from, to) {
    return to.replace(from + '/', '');
  };

  // Run the script by evaluating its code directly
  const fixImportsCode = originalFsReadFileSync('tools/fix-imports.js', 'utf8');
  eval(fixImportsCode);

  // Check for the report of fixed files
  const fixedFilesReport = mockCalls.consoleLog.find(args =>
    args[0] && args[0].includes && args[0].includes('Fixed imports in'));

  if (!fixedFilesReport) {
    throw new Error('Missing report of fixed files');
  }

  // Check for the list of modified files
  const modifiedFilesHeader = mockCalls.consoleLog.find(args =>
    args[0] === 'Modified files:');

  if (!modifiedFilesHeader) {
    throw new Error('Missing list of modified files');
  }

  // Check for the completion message
  const completionMsg = mockCalls.consoleLog.find(args =>
    args[0] === 'Import fix script completed');

  if (!completionMsg) {
    throw new Error('Missing completion message');
  }
});

// Test 4: Check error handling for file operations
runTest(4, "Check error handling for file operations", () => {
  // Mock implementations
  let mockCalls = {
    consoleError: []
  };

  // Mock console.error
  console.error = function(...args) {
    mockCalls.consoleError.push(args);
  };

  // Mock fs.readFileSync to throw error for specific file
  fs.readFileSync = function(path, encoding) {
    if (path.includes('fix-imports.js')) {
      return originalFsReadFileSync(path, encoding);
    }
    if (path.includes('error.ts')) {
      throw new Error('Mock read error');
    }
    return 'import { Logger } from '../utils/logger';';
  };

  // Create a mock directory structure with a file that causes error
  fs.readdirSync = function(dir) {
    return ['normal.ts', 'error.ts'];
  };

  fs.statSync = function(path) {
    return {
      isDirectory: () => false
    };
  };

  path.join = function(dir, file) {
    return `${dir}/${file}`;
  };

  path.resolve = function(...args) {
    return args.join('/');
  };

  // Run the script by evaluating its code directly
  const fixImportsCode = originalFsReadFileSync('tools/fix-imports.js', 'utf8');
  eval(fixImportsCode);

  // Check for error message for the problematic file
  const fileErrorMsg = mockCalls.consoleError.find(args =>
    args[0] && args[0].includes && args[0].includes('Error processing file') && args[0].includes('Mock read error'));

  if (!fileErrorMsg) {
    throw new Error('Missing error message for file processing');
  }
});

// Test 5: Check handling of files with no needed changes
runTest(5, "Check handling of files with no needed changes", () => {
  // Mock implementations
  let mockCalls = {
    readFileSync: [],
    writeFileSync: []
  };

  // Mock fs.readFileSync to return content with already correct imports
  fs.readFileSync = function(path, encoding) {
    mockCalls.readFileSync.push({ path, encoding });
    if (path.includes('fix-imports.js')) {
      return originalFsReadFileSync(path, encoding);
    }

    // Return content with already correct imports
    return `
      import { Logger } from '../utils/logger';
      import { ConversationManager } from './conversationManager';
      import { CoreAgent } from '../services/coreAgent';
    `;
  };

  // Mock fs.writeFileSync to track calls
  fs.writeFileSync = function(path, content, encoding) {
    mockCalls.writeFileSync.push({ path, content, encoding });
  };

  // Create a mock directory structure
  fs.readdirSync = function(dir) {
    return ['file.ts'];
  };

  fs.statSync = function(path) {
    return {
      isDirectory: () => false
    };
  };

  path.join = function(dir, file) {
    return `${dir}/${file}`;
  };

  path.resolve = function(...args) {
    return args.join('/');
  };

  // Run the script by evaluating its code directly
  const fixImportsCode = originalFsReadFileSync('tools/fix-imports.js', 'utf8');
  eval(fixImportsCode);

  // Check that writeFileSync was NOT called (no changes needed)
  if (mockCalls.writeFileSync.length > 0) {
    throw new Error('fs.writeFileSync was called when no changes were needed');
  }
});

// Test 6: Check script error handling
runTest(6, "Check script error handling", () => {
  // Mock implementations
  let mockCalls = {
    consoleError: []
  };

  // Mock console.error
  console.error = function(...args) {
    mockCalls.consoleError.push(args);
  };

  // Mock fs.readdirSync to throw an error
  fs.readdirSync = function(dir) {
    throw new Error('Mock directory read error');
  };

  // Run the script by evaluating its code directly
  const fixImportsCode = originalFsReadFileSync('tools/fix-imports.js', 'utf8');
  eval(fixImportsCode);

  // Check for error message for the script execution
  const scriptErrorMsg = mockCalls.consoleError.find(args =>
    args[0] && args[0].includes && args[0].includes('Error:') && args[0].includes('Mock directory read error'));

  if (!scriptErrorMsg) {
    throw new Error('Missing error message for script execution');
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
