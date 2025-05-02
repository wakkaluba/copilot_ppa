const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { CodeExecutorService } = require('../../../../src/codeEditor/services/codeExecutor');

describe('CodeExecutorService - JavaScript', () => {
  let service;
  let mockWindow;
  let mockWorkspace;
  let mockCommands;
  let mockTerminal;
  let sandbox;
  let mockFileSystem;
  let mockPath;
  let mockOS;
  let mockEditor;
  let mockDocument;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create fake temp files array
    const fakeTempFiles = [];

    // Mock file system operations
    mockFileSystem = {
      writeFileSync: sandbox.stub(fs, 'writeFileSync'),
      unlinkSync: sandbox.stub(fs, 'unlinkSync'),
      existsSync: sandbox.stub(fs, 'existsSync').returns(true),
      statSync: sandbox.stub(fs, 'statSync').returns({
        mtime: new Date(),
        isFile: () => true
      }),
      readdirSync: sandbox.stub(fs, 'readdirSync').returns(['temp1.js', 'temp2.py'])
    };

    // Mock path operations
    mockPath = {
      join: sandbox.stub(path, 'join').callsFake((...args) => args.join('/')),
      extname: sandbox.stub(path, 'extname').callsFake((filePath) => {
        const parts = filePath.split('.');
        return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
      })
    };

    // Mock OS operations
    mockOS = {
      tmpdir: sandbox.stub(os, 'tmpdir').returns('/tmp')
    };

    // Mock terminal
    mockTerminal = {
      sendText: sandbox.stub(),
      show: sandbox.stub(),
      dispose: sandbox.stub(),
      name: 'Code Execution'
    };

    // Mock document with selected text
    mockDocument = {
      getText: sandbox.stub().returns('console.log("Hello world");'),
      languageId: 'javascript',
      fileName: '/path/to/file.js'
    };

    // Mock editor with selection
    mockEditor = {
      document: mockDocument,
      selection: {
        isEmpty: false
      }
    };

    // Mock VS Code APIs
    mockWindow = {
      activeTextEditor: mockEditor,
      showInformationMessage: sandbox.stub(),
      showErrorMessage: sandbox.stub(),
      createTerminal: sandbox.stub().returns(mockTerminal),
      terminals: [mockTerminal],
      onDidCloseTerminal: sandbox.stub().returns({ dispose: sandbox.stub() })
    };

    mockWorkspace = {
      getConfiguration: sandbox.stub().returns({
        get: sandbox.stub().callsFake((key) => {
          const configs = {
            'codeExecution.cleanupTempFilesOnExit': true,
            'codeExecution.tempFileLifetime': 3600000 // 1 hour in milliseconds
          };
          return configs[key];
        })
      })
    };

    mockCommands = {
      executeCommand: sandbox.stub().resolves()
    };

    // Create mock VS Code namespace
    global.vscode = {
      window: mockWindow,
      workspace: mockWorkspace,
      commands: mockCommands,
      Terminal: function(name) {
        return {
          name,
          sendText: mockTerminal.sendText,
          show: mockTerminal.show,
          dispose: mockTerminal.dispose
        };
      }
    };

    // Create service instance
    service = new CodeExecutorService();

    // Add a stub for the private tempFiles array
    service.tempFiles = fakeTempFiles;
  });

  afterEach(() => {
    sandbox.restore();
    delete global.vscode;
  });

  describe('Initialization', () => {
    it('should initialize properly', () => {
      expect(service).to.be.instanceOf(CodeExecutorService);
    });

    it('should set up temp file cleanup on initialization', () => {
      expect(service.tempFiles).to.be.an('array');
    });
  });

  describe('executeSelectedCode', () => {
    it('should execute the selected code in the active editor', async () => {
      const result = await service.executeSelectedCode();

      expect(result).to.be.true;
      expect(mockWindow.createTerminal.called).to.be.true;
      expect(mockTerminal.sendText.called).to.be.true;
      expect(mockTerminal.show.called).to.be.true;
    });

    it('should handle no active editor', async () => {
      mockWindow.activeTextEditor = null;

      const result = await service.executeSelectedCode();

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle empty selection', async () => {
      mockEditor.selection.isEmpty = true;

      const result = await service.executeSelectedCode();

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should pass the correct language to executeInTerminal', async () => {
      const executeInTerminalSpy = sandbox.spy(service, 'executeInTerminal');

      await service.executeSelectedCode();

      expect(executeInTerminalSpy.calledWith(
        'console.log("Hello world");',
        'javascript'
      )).to.be.true;
    });
  });

  describe('executeInTerminal', () => {
    it('should execute JavaScript code in terminal directly', async () => {
      const code = 'console.log("Hello world");';
      const language = 'javascript';

      const result = await service.executeInTerminal(code, language);

      expect(result).to.be.true;
      expect(mockWindow.createTerminal.called).to.be.true;
      expect(mockTerminal.sendText.called).to.be.true;
      expect(mockTerminal.show.called).to.be.true;
    });

    it('should execute Python code in terminal directly', async () => {
      const code = 'print("Hello world")';
      const language = 'python';

      const result = await service.executeInTerminal(code, language);

      expect(result).to.be.true;
      expect(mockWindow.createTerminal.called).to.be.true;
      expect(mockTerminal.sendText.called).to.be.true;
      expect(mockTerminal.show.called).to.be.true;
    });

    it('should create a temp file for non-script languages', async () => {
      const code = 'public class Test { public static void main(String[] args) { System.out.println("Hello"); } }';
      const language = 'java';

      const createTempFileSpy = sandbox.spy(service, 'createTempFile');

      const result = await service.executeInTerminal(code, language);

      expect(result).to.be.true;
      expect(createTempFileSpy.called).to.be.true;
      expect(mockFileSystem.writeFileSync.called).to.be.true;
      expect(mockWindow.createTerminal.called).to.be.true;
    });

    it('should handle errors when creating temp files', async () => {
      const code = 'public class Test { public static void main(String[] args) { System.out.println("Hello"); } }';
      const language = 'java';

      mockFileSystem.writeFileSync.throws(new Error('File system error'));

      const result = await service.executeInTerminal(code, language);

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle unsupported languages gracefully', async () => {
      const code = 'Some unknown code';
      const language = 'unsupported';

      const result = await service.executeInTerminal(code, language);

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should reuse an existing terminal if available', async () => {
      // First call should create a terminal
      await service.executeInTerminal('console.log("First")', 'javascript');

      // Reset the stubs
      mockWindow.createTerminal.resetHistory();
      mockTerminal.sendText.resetHistory();

      // Second call should reuse the terminal
      await service.executeInTerminal('console.log("Second")', 'javascript');

      expect(mockWindow.createTerminal.called).to.be.false;
      expect(mockTerminal.sendText.called).to.be.true;
    });
  });

  describe('createTempFile', () => {
    it('should create a temporary file with the given content and extension', () => {
      const content = 'console.log("Test");';
      const extension = '.js';

      const filePath = service.createTempFile(content, extension);

      expect(filePath).to.be.a('string');
      expect(mockFileSystem.writeFileSync.called).to.be.true;
      expect(service.tempFiles).to.include(filePath);
    });

    it('should handle errors during file creation', () => {
      const content = 'console.log("Test");';
      const extension = '.js';

      mockFileSystem.writeFileSync.throws(new Error('File system error'));

      expect(() => service.createTempFile(content, extension)).to.throw();
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should use the system temp directory', () => {
      const content = 'console.log("Test");';
      const extension = '.js';

      service.createTempFile(content, extension);

      expect(mockOS.tmpdir.called).to.be.true;
      expect(mockPath.join.called).to.be.true;
    });
  });

  describe('trackTempFile', () => {
    it('should add the file path to the tracked temp files list', () => {
      const filePath = '/tmp/test-file.js';

      service.trackTempFile(filePath);

      expect(service.tempFiles).to.include(filePath);
    });

    it('should not add duplicate entries', () => {
      const filePath = '/tmp/test-file.js';

      // Add twice
      service.trackTempFile(filePath);
      service.trackTempFile(filePath);

      // Count occurrences
      const count = service.tempFiles.filter(p => p === filePath).length;
      expect(count).to.equal(1);
    });
  });

  describe('cleanupTempFiles', () => {
    it('should remove expired temp files', () => {
      const oldFile = '/tmp/old-file.js';
      const newFile = '/tmp/new-file.js';

      // Setup temp files array with test files
      service.tempFiles = [oldFile, newFile];

      // Make old file appear old
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days old

      mockFileSystem.statSync.withArgs(oldFile).returns({
        mtime: oldDate,
        isFile: () => true
      });

      mockFileSystem.statSync.withArgs(newFile).returns({
        mtime: new Date(), // Current date
        isFile: () => true
      });

      // Run cleanup with 1 day max age
      service.cleanupTempFiles(24 * 60 * 60 * 1000); // 1 day in milliseconds

      // Verify old file was deleted
      expect(mockFileSystem.unlinkSync.calledWith(oldFile)).to.be.true;
      // Verify new file was kept
      expect(mockFileSystem.unlinkSync.calledWith(newFile)).to.be.false;
      // Verify temp files array was updated
      expect(service.tempFiles).to.not.include(oldFile);
      expect(service.tempFiles).to.include(newFile);
    });

    it('should handle errors during file deletion', () => {
      const filePath = '/tmp/error-file.js';

      // Setup temp files array with test file
      service.tempFiles = [filePath];

      // Make file appear old
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days old

      mockFileSystem.statSync.withArgs(filePath).returns({
        mtime: oldDate,
        isFile: () => true
      });

      // Make delete operation throw an error
      mockFileSystem.unlinkSync.withArgs(filePath).throws(new Error('Delete error'));

      // Run cleanup with 1 day max age
      service.cleanupTempFiles(24 * 60 * 60 * 1000); // 1 day in milliseconds

      // Verify error was logged
      expect(mockWindow.showErrorMessage.called).to.be.true;
      // Verify temp files array still contains the file
      expect(service.tempFiles).to.not.include(filePath);
    });

    it('should handle non-existent files', () => {
      const filePath = '/tmp/non-existent-file.js';

      // Setup temp files array with test file
      service.tempFiles = [filePath];

      // Make file check return false
      mockFileSystem.existsSync.withArgs(filePath).returns(false);

      // Run cleanup
      service.cleanupTempFiles(24 * 60 * 60 * 1000); // 1 day in milliseconds

      // Verify file was not attempted to be deleted
      expect(mockFileSystem.unlinkSync.calledWith(filePath)).to.be.false;
      // Verify temp files array was updated
      expect(service.tempFiles).to.not.include(filePath);
    });
  });

  describe('dispose', () => {
    it('should clean up all temp files when disposed', () => {
      const filePath1 = '/tmp/file1.js';
      const filePath2 = '/tmp/file2.js';

      // Setup temp files array with test files
      service.tempFiles = [filePath1, filePath2];

      // Make files exist
      mockFileSystem.existsSync.returns(true);

      // Dispose the service
      service.dispose();

      // Verify all files were deleted
      expect(mockFileSystem.unlinkSync.calledWith(filePath1)).to.be.true;
      expect(mockFileSystem.unlinkSync.calledWith(filePath2)).to.be.true;
      // Verify temp files array was cleared
      expect(service.tempFiles).to.be.empty;
    });

    it('should handle errors during cleanup', () => {
      const filePath = '/tmp/error-file.js';

      // Setup temp files array with test file
      service.tempFiles = [filePath];

      // Make file exist
      mockFileSystem.existsSync.returns(true);

      // Make delete operation throw an error
      mockFileSystem.unlinkSync.withArgs(filePath).throws(new Error('Delete error'));

      // Dispose the service
      service.dispose();

      // Verify error was logged
      expect(mockWindow.showErrorMessage.called).to.be.true;
      // Verify temp files array was still cleared
      expect(service.tempFiles).to.be.empty;
    });
  });
});
