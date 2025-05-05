// filepath: d:\___coding\tools\copilot_ppa\tools\__tests__\fix-casing-runner.js
/**
 * Simple standalone test runner for fix-casing.js
 * This avoids issues with the project's Jest configuration
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Get the actual path to fix-casing.js before we mock path.resolve
const fixCasingPath = path.join(__dirname, '..', 'fix-casing.js');

// Store originals before mocking
const originalExecSync = childProcess.execSync;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalPathResolve = path.resolve;
const originalFsExistsSync = fs.existsSync;
const originalFsRenameSync = fs.renameSync;

// Test results tracking
let passedTests = 0;
let failedTests = 0;
const failures = [];

// Simple test utility functions
function describe(name, fn) {
  console.log(`\n📋 Test Suite: ${name}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.error(`   Error: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n')[1]}`);
    }
    failures.push({ name, error });
    failedTests++;
  }
}

// The tests
describe('fix-casing script', () => {
  // Setup before each test
  function setupMocks() {
    // Mock console methods
    console.log = function(...args) {
      console.log.mock.calls.push(args);
    };
    console.log.mock = { calls: [] };

    console.error = function(...args) {
      console.error.mock.calls.push(args);
    };
    console.error.mock = { calls: [] };

    // Mock path.resolve
    path.resolve = function(dirName, parentDir, filePath) {
      path.resolve.mock.calls.push([dirName, parentDir, filePath]);

      // For fix-casing.js scripts, we handle specially to ensure paths match
      if (filePath && filePath.toLowerCase() === 'src/utils/logger.ts') {
        return `/mocked/path/${filePath.toLowerCase()}`;
      } else if (filePath && filePath.toLowerCase() === 'src/services/conversationmanager.ts') {
        return `/mocked/path/${filePath.toLowerCase()}`;
      } else if (filePath && filePath.toLowerCase() === 'src/services/coreagent.ts') {
        return `/mocked/path/${filePath.toLowerCase()}`;
      }

      return `/mocked/path/${filePath || ''}`;
    };
    path.resolve.mock = { calls: [] };

    // Mock fs methods
    fs.existsSync = function(path) {
      fs.existsSync.mock.calls.push([path]);
      return true;
    };
    fs.existsSync.mock = { calls: [] };

    fs.renameSync = function(src, dest) {
      fs.renameSync.mock.calls.push([src, dest]);
    };
    fs.renameSync.mock = { calls: [] };

    // Mock execSync to do nothing by default
    childProcess.execSync = function(cmd, options) {
      childProcess.execSync.mock.calls.push([cmd, options]);
    };
    childProcess.execSync.mock = { calls: [] };
  }

  // Cleanup after each test
  function restoreOriginals() {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    path.resolve = originalPathResolve;
    fs.existsSync = originalFsExistsSync;
    fs.renameSync = originalFsRenameSync;
    childProcess.execSync = originalExecSync;
  }

  // Function to clear Node's module cache for fix-casing.js
  function clearModuleCache() {
    // Clear the require cache to ensure fresh module loading
    if (require.cache[fixCasingPath]) {
      delete require.cache[fixCasingPath];
    }
  }

  it('should attempt to fix casing for all files in the list', () => {
    setupMocks();
    clearModuleCache();

    try {
      // Execute the script
      require(fixCasingPath);

      // Verify we logged the start message
      const startLogCall = console.log.mock.calls.find(call =>
        call[0] === 'Starting file casing fix script...');
      if (!startLogCall) {
        throw new Error('Expected start message to be logged');
      }

      // Verify we logged the completion message
      const completionLogCall = console.log.mock.calls.find(call =>
        call[0] === 'File casing fix script completed');
      if (!completionLogCall) {
        throw new Error('Expected completion message to be logged');
      }

      // Verify file existence checks happened
      if (fs.existsSync.mock.calls.length < 3) {
        throw new Error(`Expected fs.existsSync to be called at least 3 times but was called ${fs.existsSync.mock.calls.length} times`);
      }

      // Verify git commands were executed
      if (childProcess.execSync.mock.calls.length < 3) {
        throw new Error(`Expected childProcess.execSync to be called at least 3 times but was called ${childProcess.execSync.mock.calls.length} times`);
      }
    } finally {
      restoreOriginals();
    }
  });

  it('should handle non-existent files', () => {
    setupMocks();
    clearModuleCache();

    try {
      // Override fs.existsSync to return false for the first file
      fs.existsSync = function(path) {
        fs.existsSync.mock.calls.push([path]);
        // Make the first file (Logger.ts) not exist
        if (path.includes('Logger.ts')) {
          return false;
        }
        return true;
      };
      fs.existsSync.mock = { calls: [] };

      // Execute the script
      require(fixCasingPath);

      // Verify we logged that the file doesn't exist
      const nonExistentLogCalls = console.log.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0].includes('does not exist'));

      if (nonExistentLogCalls.length === 0) {
        throw new Error('Expected non-existent file message to be logged');
      }
    } finally {
      restoreOriginals();
    }
  });

  it('should fall back to fs operations if git fails', () => {
    setupMocks();
    clearModuleCache();

    try {
      // Override execSync to throw an error for git commands
      childProcess.execSync = function(cmd, options) {
        childProcess.execSync.mock.calls.push([cmd, options]);
        // If it's a git command, throw an error
        if (cmd.includes('git mv')) {
          throw new Error('Git error');
        }
      };
      childProcess.execSync.mock = { calls: [] };

      // Execute the script
      require(fixCasingPath);

      // Verify we logged the git error
      const gitErrorLogCalls = console.error.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0].includes('Git error'));

      if (gitErrorLogCalls.length === 0) {
        throw new Error('Expected git error message to be logged');
      }

      // Verify we used fs.renameSync as fallback
      if (fs.renameSync.mock.calls.length === 0) {
        throw new Error('Expected fs.renameSync to be called as fallback');
      }
    } finally {
      restoreOriginals();
    }
  });

  it('should handle fs errors when git fails', () => {
    setupMocks();
    clearModuleCache();

    try {
      // Override execSync to throw an error for git commands
      childProcess.execSync = function(cmd, options) {
        childProcess.execSync.mock.calls.push([cmd, options]);
        // If it's a git command, throw an error
        if (cmd.includes('git mv')) {
          throw new Error('Git error');
        }
      };
      childProcess.execSync.mock = { calls: [] };

      // Override fs.renameSync to throw an error
      fs.renameSync = function(src, dest) {
        fs.renameSync.mock.calls.push([src, dest]);
        throw new Error('FS error');
      };
      fs.renameSync.mock = { calls: [] };

      // Execute the script
      require(fixCasingPath);

      // Verify we logged the git error
      const gitErrorLogCalls = console.error.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0].includes('Git error'));

      if (gitErrorLogCalls.length === 0) {
        throw new Error('Expected git error message to be logged');
      }

      // Verify we logged the filesystem error
      const fsErrorLogCalls = console.error.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0].includes('Filesystem error'));

      if (fsErrorLogCalls.length === 0) {
        throw new Error('Expected filesystem error message to be logged');
      }
    } finally {
      restoreOriginals();
    }
  });

  it('should skip files with paths that don\'t match except for casing', () => {
    setupMocks();
    clearModuleCache();

    try {
      // Override path.resolve to return different paths for "from" and "to" files
      path.resolve = function(dirName, parentDir, filePath) {
        path.resolve.mock.calls.push([dirName, parentDir, filePath]);

        // For the first from/to pair, make paths different
        if (filePath === 'src/utils/Logger.ts') {
          return '/path/A/src/utils/Logger.ts';
        } else if (filePath === 'src/utils/logger.ts') {
          return '/path/B/src/utils/logger.ts';
        }

        // For other paths, make them consistent
        return `/mocked/path/${filePath}`;
      };
      path.resolve.mock = { calls: [] };

      // Execute the script
      require(fixCasingPath);

      // Verify we logged the skip message
      const skipLogCalls = console.log.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0].includes('Skipping') && call[0].includes('as it doesn\'t match'));

      if (skipLogCalls.length === 0) {
        throw new Error('Expected skip message to be logged');
      }
    } finally {
      restoreOriginals();
    }
  });
});

// Report results
console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed.`);

if (failures.length > 0) {
  console.log('\n❌ Failed Tests:');
  failures.forEach(({ name, error }, index) => {
    console.log(`${index + 1}. ${name}`);
    console.log(`   Error: ${error.message}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
}
