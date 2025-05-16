// Jest test scaffold for tools/fix-casing.js
const fixCasing = require('../fix-casing');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Store original methods before mocking
const originalExecSync = childProcess.execSync;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalPathResolve = path.resolve;
const originalFsExistsSync = fs.existsSync;
const originalFsRenameSync = fs.renameSync;

describe('fix-casing script', () => {
  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();

    // Mock path.resolve
    path.resolve = jest.fn((dirName, parentDir, filePath) => {
      if (filePath && filePath.toLowerCase() === 'src/utils/logger.ts') {
        return `/mocked/path/${filePath}`;
      }
      return `/mocked/path/${filePath || ''}`;
    });

    // Mock fs methods
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.renameSync = jest.fn();

    // Mock execSync to do nothing by default
    childProcess.execSync = jest.fn();
  });

  afterEach(() => {
    // Restore all mocks
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    path.resolve = originalPathResolve;
    fs.existsSync = originalFsExistsSync;
    fs.renameSync = originalFsRenameSync;
    childProcess.execSync = originalExecSync;

    // Clear all mock data
    jest.clearAllMocks();
  });

  it('should attempt to fix casing for all files in the list', () => {
    // Execute the script directly
    jest.isolateModules(() => {
      require('../fix-casing');
    });

    // Verify we logged the start message
    expect(console.log).toHaveBeenCalledWith('Starting file casing fix script...');

    // Verify we checked if each file exists
    expect(fs.existsSync).toHaveBeenCalledTimes(3);

    // Verify we attempted to fix 3 files with git
    expect(childProcess.execSync).toHaveBeenCalledTimes(6); // 2 git commands per file (3 files)

    // Verify we logged the completion message
    expect(console.log).toHaveBeenCalledWith('File casing fix script completed');
  });

  it('should handle non-existent files', () => {
    // Setup mock to return false for the first file
    fs.existsSync = jest.fn(path => {
      return path !== '/mocked/path/src/utils/Logger.ts';
    });

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-casing');
    });

    // Verify we logged that the file doesn\'t exist
    expect(console.log).toHaveBeenCalledWith('File src/utils/Logger.ts does not exist, might already be fixed');
  });

  it('should fall back to fs operations if git fails', () => {
    // Setup execSync to throw an error on the first call
    childProcess.execSync = jest.fn()
      .mockImplementationOnce(() => {
        throw new Error('Git error');
      });

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-casing');
    });

    // Verify we logged the git error
    expect(console.error).toHaveBeenCalledWith('Git error: Git error');

    // Verify we fell back to fs.renameSync
    expect(fs.renameSync).toHaveBeenCalled();
  });

  it('should handle fs errors when git fails', () => {
    // Setup execSync to throw an error
    childProcess.execSync = jest.fn()
      .mockImplementationOnce(() => {
        throw new Error('Git error');
      });

    // Setup fs.renameSync to throw an error
    fs.renameSync = jest.fn()
      .mockImplementationOnce(() => {
        throw new Error('FS error');
      });

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-casing');
    });

    // Verify we logged both errors
    expect(console.error).toHaveBeenCalledWith('Git error: Git error');
    expect(console.error).toHaveBeenCalledWith('Filesystem error: FS error');
  });

  it('should skip files with paths that don\'t match except for casing', () => {
    // Override path.resolve specifically for this test
    path.resolve = jest.fn()
      .mockImplementationOnce(() => '/path/to/src/utils/Logger.ts')
      .mockImplementationOnce(() => '/different/path/to/src/utils/logger.ts');

    // Execute the script
    jest.isolateModules(() => {
      require('../fix-casing');
    });

    // Verify we logged the skip message for the first file
    expect(console.log).toHaveBeenCalledWith('Skipping src/utils/Logger.ts as it doesn\'t match src/utils/logger.ts except for casing');
  });
});
