const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { BottleneckDetector } = require('../bottleneckDetector');

// Mock VSCode API
jest.mock('vscode', () => {
  const originalModule = jest.requireActual('vscode');

  return {
    ...originalModule,
    window: {
      createOutputChannel: jest.fn().mockReturnValue({
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn()
      }),
      showWarningMessage: jest.fn(),
      showInformationMessage: jest.fn().mockReturnValue({
        then: jest.fn()
      }),
      withProgress: jest.fn().mockImplementation((options, callback) => {
        return callback({
          report: jest.fn()
        }, {
          isCancellationRequested: false
        });
      }),
      activeTextEditor: {
        document: {
          uri: { fsPath: '/test/file.js' },
          getText: jest.fn().mockReturnValue('function test() { }')
        }
      }
    },
    workspace: {
      openTextDocument: jest.fn().mockResolvedValue({
        getText: jest.fn().mockReturnValue('function test() { }'),
        uri: { fsPath: '/test/file.js' }
      }),
      findFiles: jest.fn().mockResolvedValue([
        { fsPath: '/test/file1.js' },
        { fsPath: '/test/file2.ts' }
      ]),
      workspaceFolders: [{ uri: { fsPath: '/test' } }]
    },
    commands: {
      registerCommand: jest.fn(),
      executeCommand: jest.fn()
    },
    Uri: {
      file: jest.fn().mockImplementation((path) => ({ fsPath: path }))
    },
    ProgressLocation: {
      Notification: 1
    }
  };
});

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn()
}));

describe('BottleneckDetector (JavaScript)', () => {
  let detector;
  let mockContext;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a mock extension context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/extension',
      extensionUri: { fsPath: '/test/extension' },
      storageUri: null,
      globalStorageUri: null,
      logUri: null,
      extensionMode: 1, // Test mode
      environmentVariableCollection: {},
      asAbsolutePath: jest.fn().mockImplementation((relativePath) => path.join('/test/extension', relativePath)),
      workspaceState: {},
      globalState: {
        setKeysForSync: jest.fn()
      },
      secrets: {}
    };

    // Create detector instance
    detector = new BottleneckDetector(mockContext);
  });

  describe('Command Registration', () => {
    test('registers commands on initialization', () => {
      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(2);
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'vscode-local-llm-agent.detectBottlenecks',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'vscode-local-llm-agent.analyzeWorkspaceBottlenecks',
        expect.any(Function)
      );
    });
  });

  describe('detectBottlenecksInCurrentFile', () => {
    test('detects bottlenecks in current file', async () => {
      // Mock implementation of detectBottlenecks
      const mockBottlenecks = [
        {
          file: '/test/file.js',
          startLine: 10,
          endLine: 15,
          description: 'Test bottleneck',
          impact: 'high',
          suggestions: ['Fix this']
        }
      ];

      jest.spyOn(detector, 'detectBottlenecks').mockResolvedValue(mockBottlenecks);

      const result = await detector.detectBottlenecksInCurrentFile();

      expect(result).toEqual(mockBottlenecks);
      expect(detector.detectBottlenecks).toHaveBeenCalledWith(vscode.window.activeTextEditor.document.uri);
    });

    test('returns empty array when no active editor', async () => {
      // Mock active editor as undefined
      const originalActiveEditor = vscode.window.activeTextEditor;
      vscode.window.activeTextEditor = undefined;

      const result = await detector.detectBottlenecksInCurrentFile();

      expect(result).toEqual([]);
      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active file to analyze');

      // Restore original
      vscode.window.activeTextEditor = originalActiveEditor;
    });
  });

  describe('detectBottlenecks', () => {
    test('skips unsupported file extensions', async () => {
      // Setup a mock document with unsupported extension
      const mockFile = { fsPath: '/test/file.xyz' };
      vscode.workspace.openTextDocument.mockResolvedValueOnce({
        getText: jest.fn().mockReturnValue('test content'),
        uri: mockFile
      });

      const result = await detector.detectBottlenecks(mockFile);

      expect(result).toEqual([]);
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        'Bottleneck detection not supported for .xyz files'
      );
    });

    test('detects all types of bottlenecks and combines results', async () => {
      // Setup test data
      const mockFile = { fsPath: '/test/file.js' };
      const mockContent = 'test content';

      vscode.workspace.openTextDocument.mockResolvedValueOnce({
        getText: jest.fn().mockReturnValue(mockContent),
        uri: mockFile
      });

      // Mock the bottleneck detection methods
      const structuralBottlenecks = [
        {
          file: '',
          startLine: 5,
          endLine: 10,
          description: 'Structural bottleneck',
          impact: 'high',
          suggestions: ['Fix structural issue']
        }
      ];

      const algorithmicBottlenecks = [
        {
          file: '',
          startLine: 15,
          endLine: 20,
          description: 'Algorithmic bottleneck',
          impact: 'medium',
          suggestions: ['Fix algorithmic issue']
        }
      ];

      const resourceBottlenecks = [
        {
          file: '',
          startLine: 25,
          endLine: 30,
          description: 'Resource bottleneck',
          impact: 'low',
          suggestions: ['Fix resource issue']
        }
      ];

      jest.spyOn(detector, 'detectStructuralBottlenecks').mockReturnValue(structuralBottlenecks);
      jest.spyOn(detector, 'detectAlgorithmicBottlenecks').mockReturnValue(algorithmicBottlenecks);
      jest.spyOn(detector, 'detectResourceBottlenecks').mockReturnValue(resourceBottlenecks);
      jest.spyOn(detector, 'displayBottleneckResults').mockImplementation(() => {});

      const result = await detector.detectBottlenecks(mockFile);

      // Expected combined results with file path added
      const expectedResults = [
        { ...structuralBottlenecks[0], file: mockFile.fsPath },
        { ...algorithmicBottlenecks[0], file: mockFile.fsPath },
        { ...resourceBottlenecks[0], file: mockFile.fsPath }
      ];

      expect(result).toEqual(expectedResults);
      expect(detector.detectStructuralBottlenecks).toHaveBeenCalledWith(mockContent, 'js');
      expect(detector.detectAlgorithmicBottlenecks).toHaveBeenCalledWith(mockContent, 'js');
      expect(detector.detectResourceBottlenecks).toHaveBeenCalledWith(mockContent, 'js');
      expect(detector.displayBottleneckResults).toHaveBeenCalledWith(expectedResults);
    });

    test('handles cancellation during analysis', async () => {
      // Setup cancellation token
      vscode.window.withProgress.mockImplementationOnce((options, callback) => {
        return callback({
          report: jest.fn()
        }, {
          isCancellationRequested: true  // First check cancels
        });
      });

      const mockFile = { fsPath: '/test/file.js' };
      await detector.detectBottlenecks(mockFile);

      // Should not attempt to combine results
      expect(detector.displayBottleneckResults).not.toHaveBeenCalled();
    });
  });

  describe('analyzeWorkspaceBottlenecks', () => {
    test('generates report from all workspace files', async () => {
      // Mock file analysis results
      const mockBottlenecks1 = [
        {
          file: '/test/file1.js',
          startLine: 10,
          endLine: 15,
          description: 'Bottleneck in file 1',
          impact: 'high',
          suggestions: ['Fix file 1']
        }
      ];

      const mockBottlenecks2 = [
        {
          file: '/test/file2.ts',
          startLine: 20,
          endLine: 25,
          description: 'Bottleneck in file 2',
          impact: 'medium',
          suggestions: ['Fix file 2']
        }
      ];

      // Mock the bottleneck detection
      detector.detectBottlenecks = jest.fn()
        .mockResolvedValueOnce(mockBottlenecks1)
        .mockResolvedValueOnce(mockBottlenecks2);

      jest.spyOn(detector, 'generateBottleneckReport').mockImplementation(() => {});

      await detector.analyzeWorkspaceBottlenecks();

      // Should have analyzed both files
      expect(detector.detectBottlenecks).toHaveBeenCalledTimes(2);
      expect(detector.detectBottlenecks).toHaveBeenCalledWith({ fsPath: '/test/file1.js' });
      expect(detector.detectBottlenecks).toHaveBeenCalledWith({ fsPath: '/test/file2.ts' });

      // Should have generated report with combined bottlenecks
      expect(detector.generateBottleneckReport).toHaveBeenCalledWith([...mockBottlenecks1, ...mockBottlenecks2]);
    });

    test('shows warning when no workspace folder is open', async () => {
      // Mock no workspace folders
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
      vscode.workspace.workspaceFolders = undefined;

      await detector.analyzeWorkspaceBottlenecks();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No workspace folder open');
      expect(vscode.window.withProgress).not.toHaveBeenCalled();

      // Restore original
      vscode.workspace.workspaceFolders = originalWorkspaceFolders;
    });

    test('handles cancellation during workspace analysis', async () => {
      // Setup cancellation during analysis
      vscode.window.withProgress.mockImplementationOnce((options, callback) => {
        return callback({
          report: jest.fn()
        }, {
          isCancellationRequested: true
        });
      });

      jest.spyOn(detector, 'generateBottleneckReport').mockImplementation(() => {});

      await detector.analyzeWorkspaceBottlenecks();

      // Should not have analyzed any files or generated report
      expect(detector.detectBottlenecks).not.toHaveBeenCalled();
      expect(detector.generateBottleneckReport).not.toHaveBeenCalled();
    });
  });

  describe('detectStructuralBottlenecks', () => {
    test('detects deeply nested loops', () => {
      const code = `
        function test() {
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              for (let k = 0; k < 10; k++) {
                console.log(i, j, k);
              }
            }
          }
        }
      `;

      const bottlenecks = detector.detectStructuralBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks[0].description).toBe('Deeply nested loops detected');
      expect(bottlenecks[0].impact).toBe('high');
    });

    test('detects complex conditions', () => {
      const code = `
        function test() {
          if (a > 5 && b < 10 && c === 3 || d !== 2) {
            console.log('complex');
          }
        }
      `;

      const bottlenecks = detector.detectStructuralBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks[0].description).toBe('Complex condition with multiple logical operators');
      expect(bottlenecks[0].impact).toBe('medium');
    });

    test('returns empty array for clean code', () => {
      const code = `
        function test() {
          for (let i = 0; i < 10; i++) {
            console.log(i);
          }

          if (a > 5) {
            console.log('simple');
          }
        }
      `;

      const bottlenecks = detector.detectStructuralBottlenecks(code, 'js');

      expect(bottlenecks.length).toBe(0);
    });
  });

  describe('detectAlgorithmicBottlenecks', () => {
    test('detects inefficient sorting patterns', () => {
      const code = `
        function bubbleSort(arr) {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
              if (arr[j] > arr[j + 1]) {
                // Swap
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
              }
            }
          }
          return arr;
        }
      `;

      const bottlenecks = detector.detectAlgorithmicBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.description === 'Potentially inefficient sorting algorithm detected')).toBe(true);
    });

    test('detects linear search operations', () => {
      const code = `
        function findItem(arr, item) {
          return arr.indexOf(item) >= 0;
        }

        function findItem2(arr, item) {
          return arr.includes(item);
        }

        function findItem3(arr, item) {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] === item) return true;
          }
          return false;
        }
      `;

      const bottlenecks = detector.detectAlgorithmicBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.description === 'Potential linear search operation')).toBe(true);
    });

    test('detects excessive string concatenation', () => {
      const code = `
        function buildString() {
          let str = '';
          for (let i = 0; i < 1000; i++) {
            str += "item" + i + ",";
          }
          return str;
        }
      `;

      const bottlenecks = detector.detectAlgorithmicBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.description === 'Excessive string concatenation')).toBe(true);
    });
  });

  describe('detectResourceBottlenecks', () => {
    test('detects synchronous file operations', () => {
      const code = `
        function readFile() {
          const data = fs.readFileSync('/path/to/file.txt', 'utf8');
          return data;
        }
      `;

      const bottlenecks = detector.detectResourceBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.description === 'Synchronous file I/O operation')).toBe(true);
    });

    test('detects potential resource leaks', () => {
      const code = `
        function createConnection() {
          const connection = new Connection('localhost');
          connection.connect();
          // No close or dispose
        }
      `;

      const bottlenecks = detector.detectResourceBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.description === 'Potential resource leak detected')).toBe(true);
    });

    test('detects DOM operations in loops', () => {
      const code = `
        function updateElements() {
          for (let i = 0; i < 100; i++) {
            document.getElementById('item' + i).innerHTML = 'updated';
          }
        }
      `;

      const bottlenecks = detector.detectResourceBottlenecks(code, 'js');

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.description === 'DOM operations inside loops')).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    describe('isLoopStart', () => {
      test('detects JavaScript loop starts', () => {
        expect(detector.isLoopStart('for (let i = 0; i < 10; i++) {', 'js')).toBe(true);
        expect(detector.isLoopStart('while (condition) {', 'js')).toBe(true);
        expect(detector.isLoopStart('do {', 'js')).toBe(true);
        expect(detector.isLoopStart('array.forEach(item => {', 'js')).toBe(true);

        // Negatives
        expect(detector.isLoopStart('if (condition) {', 'js')).toBe(false);
        expect(detector.isLoopStart('function test() {', 'js')).toBe(false);
      });

      test('detects Python loop starts', () => {
        expect(detector.isLoopStart('for item in items:', 'py')).toBe(true);
        expect(detector.isLoopStart('while condition:', 'py')).toBe(true);

        // Negatives
        expect(detector.isLoopStart('if condition:', 'py')).toBe(false);
        expect(detector.isLoopStart('def function():', 'py')).toBe(false);
      });
    });

    describe('isBlockEnd', () => {
      test('detects JavaScript block ends', () => {
        expect(detector.isBlockEnd('}', 'js')).toBe(true);
        expect(detector.isBlockEnd('  }', 'js')).toBe(true);

        // Negatives
        expect(detector.isBlockEnd('};', 'js')).toBe(false);
        expect(detector.isBlockEnd('} else {', 'js')).toBe(false);
      });

      test('detects Python block ends', () => {
        expect(detector.isBlockEnd('    return result', 'py')).toBe(true);
        expect(detector.isBlockEnd('new_function()', 'py')).toBe(true);

        // Negatives
        expect(detector.isBlockEnd('', 'py')).toBe(false);
        expect(detector.isBlockEnd('    ', 'py')).toBe(false);
      });
    });

    describe('containsNestedLoop', () => {
      test('detects nested loops', () => {
        const code = `
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              console.log(i, j);
            }
          }
        `;

        expect(detector.containsNestedLoop(code, 'js')).toBe(true);
      });

      test('returns false for single loop', () => {
        const code = `
          for (let i = 0; i < 10; i++) {
            console.log(i);
          }
        `;

        expect(detector.containsNestedLoop(code, 'js')).toBe(false);
      });
    });

    describe('findBlockEnd', () => {
      test('finds end of JavaScript block with braces', () => {
        const lines = [
          'function test() {',
          '  console.log("Hi");',
          '  if (x) {',
          '    console.log("x is true");',
          '  }',
          '}'
        ];

        expect(detector.findBlockEnd(lines, 0)).toBe(5); // The closing brace on line 5
      });
    });

    describe('getLoopBody', () => {
      test('extracts loop body correctly', () => {
        const lines = [
          'for (let i = 0; i < 10; i++) {',
          '  console.log("line 1");',
          '  console.log("line 2");',
          '}'
        ];

        const body = detector.getLoopBody(lines, 0);
        expect(body).toBe('  console.log("line 1");\n  console.log("line 2");');
      });
    });
  });

  describe('Output and Reporting', () => {
    describe('displayBottleneckResults', () => {
      test('displays bottleneck results in output channel', () => {
        const bottlenecks = [
          {
            file: '/test/file.js',
            startLine: 10,
            endLine: 15,
            description: 'Test bottleneck',
            impact: 'high',
            suggestions: ['Fix this', 'Or do that']
          }
        ];

        detector.displayBottleneckResults(bottlenecks);

        const outputChannel = vscode.window.createOutputChannel.mock.results[0].value;

        expect(outputChannel.clear).toHaveBeenCalled();
        expect(outputChannel.appendLine).toHaveBeenCalledWith('Found 1 potential bottlenecks:');
        expect(outputChannel.appendLine).toHaveBeenCalledWith('File: /test/file.js');
        expect(outputChannel.appendLine).toHaveBeenCalledWith('Location: Lines 11-16');
        expect(outputChannel.appendLine).toHaveBeenCalledWith('Impact: HIGH');
        expect(outputChannel.appendLine).toHaveBeenCalledWith('Issue: Test bottleneck');
        expect(outputChannel.appendLine).toHaveBeenCalledWith('Suggestions:');
        expect(outputChannel.appendLine).toHaveBeenCalledWith('  - Fix this');
        expect(outputChannel.appendLine).toHaveBeenCalledWith('  - Or do that');
        expect(outputChannel.show).toHaveBeenCalled();
      });

      test('handles case when no bottlenecks found', () => {
        detector.displayBottleneckResults([]);

        const outputChannel = vscode.window.createOutputChannel.mock.results[0].value;

        expect(outputChannel.clear).toHaveBeenCalled();
        expect(outputChannel.appendLine).toHaveBeenCalledWith('No bottlenecks detected.');
        expect(outputChannel.show).toHaveBeenCalled();
      });
    });

    describe('generateBottleneckReport', () => {
      test('generates report with impact summary and file findings', () => {
        const bottlenecks = [
          {
            file: '/test/file1.js',
            startLine: 10,
            endLine: 15,
            description: 'High impact issue',
            impact: 'high',
            suggestions: ['Fix high impact']
          },
          {
            file: '/test/file2.js',
            startLine: 20,
            endLine: 25,
            description: 'Medium impact issue',
            impact: 'medium',
            suggestions: ['Fix medium impact']
          }
        ];

        detector.generateBottleneckReport(bottlenecks);

        // Check that report was written to file
        expect(fs.writeFileSync).toHaveBeenCalled();

        // Get the report content
        const reportContent = fs.writeFileSync.mock.calls[0][1];

        // Check summary counts
        expect(reportContent).toContain('Total bottlenecks detected: 2');
        expect(reportContent).toContain('High impact issues: 1');
        expect(reportContent).toContain('Medium impact issues: 1');

        // Check file-based organization
        expect(reportContent).toContain('## Findings by File');
        expect(reportContent).toContain('### file1.js');
        expect(reportContent).toContain('### file2.js');

        // Check notification was shown
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
          'Bottleneck analysis report generated',
          'Open Report'
        );
      });
    });
  });
});
