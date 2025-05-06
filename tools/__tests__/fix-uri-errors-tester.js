// filepath: d:\___coding\tools\copilot_ppa\tools\__tests__\fix-uri-errors-tester.js
/**
 * Simple test script for fix-uri-errors.js
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

console.log('🧪 Testing fix-uri-errors.js...');

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

// Test 1: Check WorkspaceManager.ts URI fixes - Method Signatures
runTest(1, "Check WorkspaceManager method signature fixes", () => {
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

  // Mock fs.readFileSync to return content with URI type errors
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });

    if (filePath.includes('WorkspaceManager.ts')) {
      return `
        import * as vscode from 'vscode';

        export class WorkspaceManager {
          private fs: vscode.FileSystem;

          constructor(fs: vscode.FileSystem) {
            this.fs = fs;
          }

          public async readFile(uri: vscode.Uri): Promise<string> {
            const data = await this.fs.readFile(uri);
            return new TextDecoder().decode(data);
          }

          public async writeFile(uri: vscode.Uri, content: string): Promise<void> {
            await this.fs.writeFile(uri, new TextEncoder().encode(content));
          }

          public async deleteFile(uri: vscode.Uri): Promise<void> {
            await this.fs.delete(uri, { recursive: true });
          }

          public async createDirectory(uri: vscode.Uri): Promise<void> {
            await this.fs.createDirectory(uri);
          }
        }
      `;
    }
    return '';
  };

  // Mock fs.writeFileSync to verify content
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });

    // Verify method signatures were properly updated
    if (filePath.includes('WorkspaceManager.ts')) {
      const expectedSignatures = [
        'public async readFile(uri: vscode.Uri | string): Promise<string>',
        'public async writeFile(uri: vscode.Uri | string, content: string): Promise<void>',
        'public async deleteFile(uri: vscode.Uri | string): Promise<void>',
        'public async createDirectory(uri: vscode.Uri | string): Promise<void>'
      ];

      const missingSignatures = expectedSignatures.filter(signature => !content.includes(signature));

      if (missingSignatures.length > 0) {
        throw new Error(`Method signatures not properly updated:\n${missingSignatures.join('\n')}`);
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
  const fixUriErrorsCode = originalFsReadFileSync('tools/fix-uri-errors.js', 'utf8');
  eval(fixUriErrorsCode);

  // Check that writeFileSync was called for the WorkspaceManager.ts file
  const workspaceManagerFileWritten = mockCalls.writeFileSync.some(call =>
    call.filePath.includes('WorkspaceManager.ts'));

  if (!workspaceManagerFileWritten) {
    throw new Error('fs.writeFileSync was not called for the WorkspaceManager.ts file');
  }
});

// Test 2: Check WorkspaceManager.ts URI fixes - Method Implementations
runTest(2, "Check WorkspaceManager method implementation fixes", () => {
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

  // Mock fs.readFileSync to return content with URI type errors
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });

    if (filePath.includes('WorkspaceManager.ts')) {
      return `
        import * as vscode from 'vscode';

        export class WorkspaceManager {
          private fs: vscode.FileSystem;

          constructor(fs: vscode.FileSystem) {
            this.fs = fs;
          }

          public async readFile(uri: vscode.Uri): Promise<string> {
            const data = await this.fs.readFile(uri);
            return new TextDecoder().decode(data);
          }

          public async writeFile(uri: vscode.Uri, content: string): Promise<void> {
            await this.fs.writeFile(uri, new TextEncoder().encode(content));
          }

          public async deleteFile(uri: vscode.Uri): Promise<void> {
            await this.fs.delete(uri, { recursive: true });
          }

          public async createDirectory(uri: vscode.Uri): Promise<void> {
            await this.fs.createDirectory(uri);
          }
        }
      `;
    }
    return '';
  };

  // Mock fs.writeFileSync to verify content
  fs.writeFileSync = function(filePath, content) {
    mockCalls.writeFileSync.push({ filePath, content });

    // Verify Uri conversion code was properly added to each method
    if (filePath.includes('WorkspaceManager.ts')) {
      const expectedUriConversions = [
        'const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;',
        'await this.fs.readFile(uriObj)',
        'await this.fs.writeFile(uriObj,',
        'await this.fs.delete(uriObj,',
        'await this.fs.createDirectory(uriObj);'
      ];

      const missingConversions = expectedUriConversions.filter(conversion => !content.includes(conversion));

      if (missingConversions.length > 0) {
        throw new Error(`Uri conversion code not properly added:\n${missingConversions.join('\n')}`);
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
  const fixUriErrorsCode = originalFsReadFileSync('tools/fix-uri-errors.js', 'utf8');
  eval(fixUriErrorsCode);

  // Check that writeFileSync was called for the WorkspaceManager.ts file
  const workspaceManagerFileWritten = mockCalls.writeFileSync.some(call =>
    call.filePath.includes('WorkspaceManager.ts'));

  if (!workspaceManagerFileWritten) {
    throw new Error('fs.writeFileSync was not called for the WorkspaceManager.ts file');
  }
});

// Test 3: Check ConversationManager URI fixes
runTest(3, "Check ConversationManager URI fixes", () => {
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

  // Mock fs.readFileSync to return content with URI type errors
  fs.readFileSync = function(filePath, encoding) {
    mockCalls.readFileSync.push({ filePath, encoding });

    if (filePath.includes('conversationManager.ts')) {
      return `
        import * as vscode from 'vscode';

        export class ConversationManager {
          private workspaceManager: WorkspaceManager;
          private historyPath: string;

          constructor(workspaceManager: WorkspaceManager) {
            this.workspaceManager = workspaceManager;
            this.historyPath = '/path/to/history';
          }

          public async loadConversation(id: string): Promise<any> {
            const filePath = \`\${this.historyPath}/\${id}.json\`;
            const content = await this.workspaceManager.readFile(filePath);
            return JSON.parse(content);
          }

          public async saveConversation(conversation: any): Promise<void> {
            await this.workspaceManager.createDirectory(this.historyPath);
            const filePath = \`\${this.historyPath}/\${conversation.id}.json\`;
            await this.workspaceManager.writeFile(
              filePath,
              JSON.stringify(conversation)
            );
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

  // Mock path.resolve to return a test path
  path.resolve = function(...args) {
    return args.join('/');
  };

  // Mock console.log to track output
  console.log = function(...args) {
    mockCalls.consoleLog.push(args.join(' '));
  };

  // Run the script by evaluating its code directly
  const fixUriErrorsCode = originalFsReadFileSync('tools/fix-uri-errors.js', 'utf8');
  eval(fixUriErrorsCode);

  // Check that the script attempted to process the conversationManager.ts file
  const conversationManagerProcessed = mockCalls.consoleLog.some(log =>
    log.includes('Fixing URI errors in') && log.includes('conversationManager.ts'));

  // It's valid for conversationManager.ts to have "No changes needed"
  const noChangesNeeded = mockCalls.consoleLog.some(log =>
    log.includes('No changes needed for') && log.includes('conversationManager.ts'));

  if (!conversationManagerProcessed) {
    throw new Error('conversationManager.ts was not processed by the script');
  }

  // Either we should have written to the file OR the script should have reported no changes needed
  const writeFileOrNoChanges = mockCalls.writeFileSync.some(call =>
    call.filePath.includes('conversationManager.ts')) || noChangesNeeded;

  if (!writeFileOrNoChanges) {
    throw new Error('conversationManager.ts should either be updated or reported as not needing changes');
  }
});

// Test 4: Check handling of files that do not exist
runTest(4, "Check handling of non-existent files", () => {
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
  const fixUriErrorsCode = originalFsReadFileSync('tools/fix-uri-errors.js', 'utf8');
  eval(fixUriErrorsCode);

  // Verify readFileSync was never called
  if (mockCalls.readFileSync.length > 0) {
    throw new Error('fs.readFileSync was called even though files do not exist');
  }

  // Verify writeFileSync was never called
  if (mockCalls.writeFileSync.length > 0) {
    throw new Error('fs.writeFileSync was called even though files do not exist');
  }

  // Verify the "does not exist" message was logged for both files
  const nonExistentWorkspaceManagerMessage = mockCalls.consoleLog.some(log =>
    log.includes('does not exist') && log.includes('WorkspaceManager.ts'));

  const nonExistentConversationManagerMessage = mockCalls.consoleLog.some(log =>
    log.includes('does not exist') && log.includes('conversationManager.ts'));

  if (!nonExistentWorkspaceManagerMessage || !nonExistentConversationManagerMessage) {
    throw new Error('Not all non-existent files were properly reported');
  }
});

// Test 5: Check handling files that don't need changes
runTest(5, "Check handling of files that don't need changes", () => {
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

    if (filePath.includes('WorkspaceManager.ts')) {
      return `
        import * as vscode from 'vscode';

        export class WorkspaceManager {
          private fs: vscode.FileSystem;

          constructor(fs: vscode.FileSystem) {
            this.fs = fs;
          }

          public async readFile(uri: vscode.Uri | string): Promise<string> {
            const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;
            const data = await this.fs.readFile(uriObj);
            return new TextDecoder().decode(data);
          }

          public async writeFile(uri: vscode.Uri | string, content: string): Promise<void> {
            const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;
            await this.fs.writeFile(uriObj, new TextEncoder().encode(content));
          }

          public async deleteFile(uri: vscode.Uri | string): Promise<void> {
            const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;
            await this.fs.delete(uriObj, { recursive: true });
          }

          public async createDirectory(uri: vscode.Uri | string): Promise<void> {
            const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;
            await this.fs.createDirectory(uriObj);
          }
        }
      `;
    } else if (filePath.includes('conversationManager.ts')) {
      return `
        import * as vscode from 'vscode';

        export class ConversationManager {
          private workspaceManager: WorkspaceManager;
          private historyPath: string;

          constructor(workspaceManager: WorkspaceManager) {
            this.workspaceManager = workspaceManager;
            this.historyPath = '/path/to/history';
          }

          public async loadConversation(id: string): Promise<any> {
            const filePath = \`\${this.historyPath}/\${id}.json\`;
            const content = await this.workspaceManager.readFile(filePath);
            return JSON.parse(content);
          }

          public async saveConversation(conversation: any): Promise<void> {
            await this.workspaceManager.createDirectory(this.historyPath);
            const filePath = \`\${this.historyPath}/\${conversation.id}.json\`;
            await this.workspaceManager.writeFile(
              filePath,
              JSON.stringify(conversation)
            );
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
  const fixUriErrorsCode = originalFsReadFileSync('tools/fix-uri-errors.js', 'utf8');
  eval(fixUriErrorsCode);

  // Verify writeFileSync was never called (no changes needed)
  if (mockCalls.writeFileSync.length > 0) {
    throw new Error('fs.writeFileSync was called even though no changes were needed');
  }

  // Verify the "no changes needed" message was logged for both files
  const noChangesWorkspaceManagerMessage = mockCalls.consoleLog.some(log =>
    log.includes('No changes needed for') && log.includes('WorkspaceManager.ts'));

  const noChangesConversationManagerMessage = mockCalls.consoleLog.some(log =>
    log.includes('No changes needed for') && log.includes('conversationManager.ts'));

  if (!noChangesWorkspaceManagerMessage || !noChangesConversationManagerMessage) {
    throw new Error('Not all unchanged files were properly reported');
  }
});

// Test 6: Check error handling when reading files
runTest(6, "Check error handling when reading files", () => {
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
  const fixUriErrorsCode = originalFsReadFileSync('tools/fix-uri-errors.js', 'utf8');
  eval(fixUriErrorsCode);

  // Verify error messages were logged
  if (mockCalls.consoleError.length === 0) {
    throw new Error('No error messages were logged');
  }

  // Check for specific error messages
  const readErrorMessages = mockCalls.consoleError.filter(log =>
    log.includes('Failed to fix URI errors') && log.includes('Mock read error'));

  if (readErrorMessages.length < 2) { // Should have errors for both files
    throw new Error('File read errors were not properly reported for all files');
  }
});

// Test 7: Check error handling when writing files
runTest(7, "Check error handling when writing files", () => {
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
    if (filePath.includes('WorkspaceManager.ts')) {
      return `
        import * as vscode from 'vscode';

        export class WorkspaceManager {
          private fs: vscode.FileSystem;

          constructor(fs: vscode.FileSystem) {
            this.fs = fs;
          }

          public async readFile(uri: vscode.Uri): Promise<string> {
            const data = await this.fs.readFile(uri);
            return new TextDecoder().decode(data);
          }
        }
      `;
    } else if (filePath.includes('conversationManager.ts')) {
      return `
        import * as vscode from 'vscode';

        export class ConversationManager {
          private workspaceManager: WorkspaceManager;

          constructor(workspaceManager: WorkspaceManager) {
            this.workspaceManager = workspaceManager;
          }
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
  const fixUriErrorsCode = originalFsReadFileSync('tools/fix-uri-errors.js', 'utf8');
  eval(fixUriErrorsCode);

  // Verify error messages were logged
  if (mockCalls.consoleError.length === 0) {
    throw new Error('No error messages were logged');
  }

  // Check for specific error messages
  const writeErrorMessages = mockCalls.consoleError.filter(log =>
    log.includes('Failed to fix URI errors') && log.includes('Mock write error'));

  // At least one write error should have been logged - only files that needed changes trigger writes
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
