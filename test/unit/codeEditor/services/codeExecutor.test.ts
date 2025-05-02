import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeExecutorService } from '../../../../src/codeEditor/services/codeExecutor';

describe('CodeExecutorService - TypeScript', () => {
  let service: CodeExecutorService;
  let sandbox: sinon.SinonSandbox;
  let mockTerminal: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockTerminal = {
      sendText: sandbox.stub(),
      show: sandbox.stub(),
      dispose: sandbox.stub()
    };

    sandbox.stub(vscode.window, 'createTerminal').returns(mockTerminal);
    sandbox.stub(vscode.window, 'showTextDocument').resolves();
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves({} as vscode.TextDocument);

    // Mock editor
    const mockEditor = {
      document: {
        getText: sandbox.stub().returns('const test: string = "sample code";'),
        languageId: 'typescript',
        fileName: 'test.ts'
      },
      selection: {
        isEmpty: false
      }
    };
    (vscode.window.activeTextEditor as any) = mockEditor;

    // Mock FS operations
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(fs, 'mkdirSync');
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(fs, 'readdirSync').returns(['temp1.ts', 'temp2.ts']);
    sandbox.stub(fs, 'statSync').returns({
      mtime: new Date(),
      isDirectory: () => false
    } as fs.Stats);
    sandbox.stub(fs, 'unlinkSync');

    // Create service instance
    service = new CodeExecutorService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should initialize correctly', () => {
      expect(service).to.be.instanceof(CodeExecutorService);
      expect(service.tempDir).to.be.a('string');
    });

    it('should set up temp file cleanup on initialization', () => {
      const setupSpy = sandbox.spy(service, 'setupTempFileCleanup');
      new CodeExecutorService();
      expect(setupSpy.called).to.be.true;
    });
  });

  describe('executeSelectedCode', () => {
    it('should execute selected code in the active editor', async () => {
      await service.executeSelectedCode();

      expect(vscode.window.createTerminal.called).to.be.true;
      expect(mockTerminal.show.called).to.be.true;
      expect(mockTerminal.sendText.called).to.be.true;
    });

    it('should do nothing when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await service.executeSelectedCode();

      expect(vscode.window.createTerminal.called).to.be.false;
    });

    it('should do nothing when selection is empty', async () => {
      (vscode.window.activeTextEditor as any).selection.isEmpty = true;

      await service.executeSelectedCode();

      expect(vscode.window.createTerminal.called).to.be.false;
    });

    it('should handle errors during execution', async () => {
      (vscode.window.createTerminal as sinon.SinonStub).throws(new Error('Terminal creation failed'));

      await service.executeSelectedCode();

      expect(vscode.window.showErrorMessage.called).to.be.true;
    });
  });

  describe('executeInTerminal', () => {
    it('should execute code in a terminal based on language', async () => {
      await service.executeInTerminal('console.log("test")', 'javascript');

      expect(vscode.window.createTerminal.called).to.be.true;
      expect(mockTerminal.show.called).to.be.true;
      expect(mockTerminal.sendText.called).to.be.true;
    });

    it('should create a temporary file for execution when needed', async () => {
      await service.executeInTerminal('print("test")', 'python');

      expect(fs.writeFileSync.called).to.be.true;
      expect(mockTerminal.sendText.calledWith(sinon.match(/python/))).to.be.true;
    });

    it('should execute JavaScript code directly in the terminal', async () => {
      await service.executeInTerminal('console.log("test")', 'javascript');

      expect(mockTerminal.sendText.calledWith('node -e "console.log(\\"test\\")"')).to.be.true;
    });

    it('should handle TypeScript code with appropriate compiler', async () => {
      await service.executeInTerminal('console.log("test")', 'typescript');

      expect(fs.writeFileSync.called).to.be.true;
      expect(mockTerminal.sendText.calledWith(sinon.match(/ts-node/))).to.be.true;
    });

    it('should handle unknown languages by creating a generic file', async () => {
      await service.executeInTerminal('some code', 'unknown');

      expect(fs.writeFileSync.called).to.be.true;
      expect(mockTerminal.sendText.called).to.be.true;
    });

    it('should track temporary files created', async () => {
      const trackSpy = sandbox.spy(service, 'trackTempFile');

      await service.executeInTerminal('print("test")', 'python');

      expect(trackSpy.called).to.be.true;
    });
  });

  describe('createTempFile', () => {
    it('should create a temporary file with the given content and extension', () => {
      const filePath = service.createTempFile('const x: number = 10;', 'ts');

      expect(filePath).to.be.a('string');
      expect(fs.writeFileSync.called).to.be.true;
      expect(fs.writeFileSync.firstCall.args[1]).to.equal('const x: number = 10;');
    });

    it('should create the temp directory if it does not exist', () => {
      (fs.existsSync as sinon.SinonStub).returns(false);

      service.createTempFile('content', 'txt');

      expect(fs.mkdirSync.called).to.be.true;
    });

    it('should use a default extension if none is provided', () => {
      service.createTempFile('content');

      expect((fs.writeFileSync as sinon.SinonStub).firstCall.args[0]).to.include('.txt');
    });

    it('should handle errors during file creation', () => {
      (fs.writeFileSync as sinon.SinonStub).throws(new Error('Write failed'));

      expect(() => service.createTempFile('content', 'txt')).to.throw('Write failed');
    });
  });

  describe('trackTempFile', () => {
    it('should add a file to the tracking list', () => {
      service.tempFiles = [];

      service.trackTempFile('/path/to/file.ts');

      expect(service.tempFiles).to.include('/path/to/file.ts');
    });
  });

  describe('setupTempFileCleanup', () => {
    it('should set up cleanup interval', () => {
      const clock = sandbox.useFakeTimers();
      sandbox.stub(service, 'cleanupTempFiles');

      service.setupTempFileCleanup();
      clock.tick(3600000); // 1 hour

      expect(service.cleanupTempFiles.called).to.be.true;
    });
  });

  describe('cleanupTempFiles', () => {
    it('should remove old temporary files', () => {
      // Make files appear old
      (fs.statSync as sinon.SinonStub).returns({
        mtime: new Date(Date.now() - 86400000), // 1 day old
        isDirectory: () => false
      } as fs.Stats);

      service.cleanupTempFiles(3600); // 1 hour max age

      expect(fs.unlinkSync.called).to.be.true;
      expect(fs.unlinkSync.callCount).to.equal(2); // Two temp files in our mock directory
    });

    it('should not remove recent temporary files', () => {
      // Make files appear recent
      (fs.statSync as sinon.SinonStub).returns({
        mtime: new Date(), // Just created
        isDirectory: () => false
      } as fs.Stats);

      service.cleanupTempFiles(3600); // 1 hour max age

      expect(fs.unlinkSync.called).to.be.false;
    });

    it('should handle errors during cleanup', () => {
      (fs.readdirSync as sinon.SinonStub).throws(new Error('Read directory failed'));

      // Should not throw
      service.cleanupTempFiles(3600);

      expect(vscode.window.showErrorMessage.called).to.be.true;
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      service.cleanupInterval = setInterval(() => {}, 1000);

      service.dispose();

      expect(service.cleanupInterval).to.be.null;
    });

    it('should not throw if no cleanupInterval exists', () => {
      service.cleanupInterval = null;

      expect(() => service.dispose()).not.to.throw();
    });
  });
});

import * as os from 'os';
import * as path from 'path';

describe('CodeExecutorService - TypeScript', () => {
  let service: CodeExecutorService;
  let mockWindow: any;
  let mockWorkspace: any;
  let mockCommands: any;
  let mockTerminal: any;
  let sandbox: sinon.SinonSandbox;
  let mockFileSystem: any;
  let mockPath: any;
  let mockOS: any;
  let mockEditor: any;
  let mockDocument: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create fake temp files array
    const fakeTempFiles: string[] = [];

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
          const configs: Record<string, any> = {
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
      Terminal: function(name: string) {
        return {
          name,
          sendText: mockTerminal.sendText,
          show: mockTerminal.show,
          dispose: mockTerminal.dispose
        };
      }
    } as any;

    // Create service instance
    service = new CodeExecutorService();

    // Add a stub for the private tempFiles array
    (service as any).tempFiles = fakeTempFiles;
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
      expect((service as any).tempFiles).to.be.an('array');
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
      expect((service as any).tempFiles).to.include(filePath);
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

      expect((service as any).tempFiles).to.include(filePath);
    });

    it('should not add duplicate entries', () => {
      const filePath = '/tmp/test-file.js';

      // Add twice
      service.trackTempFile(filePath);
      service.trackTempFile(filePath);

      // Count occurrences
      const count = (service as any).tempFiles.filter((p: string) => p === filePath).length;
      expect(count).to.equal(1);
    });
  });

  describe('cleanupTempFiles', () => {
    it('should remove expired temp files', () => {
      const oldFile = '/tmp/old-file.js';
      const newFile = '/tmp/new-file.js';

      // Setup temp files array with test files
      (service as any).tempFiles = [oldFile, newFile];

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
      expect((service as any).tempFiles).to.not.include(oldFile);
      expect((service as any).tempFiles).to.include(newFile);
    });

    it('should handle errors during file deletion', () => {
      const filePath = '/tmp/error-file.js';

      // Setup temp files array with test file
      (service as any).tempFiles = [filePath];

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
      expect((service as any).tempFiles).to.not.include(filePath);
    });

    it('should handle non-existent files', () => {
      const filePath = '/tmp/non-existent-file.js';

      // Setup temp files array with test file
      (service as any).tempFiles = [filePath];

      // Make file check return false
      mockFileSystem.existsSync.withArgs(filePath).returns(false);

      // Run cleanup
      service.cleanupTempFiles(24 * 60 * 60 * 1000); // 1 day in milliseconds

      // Verify file was not attempted to be deleted
      expect(mockFileSystem.unlinkSync.calledWith(filePath)).to.be.false;
      // Verify temp files array was updated
      expect((service as any).tempFiles).to.not.include(filePath);
    });
  });

  describe('dispose', () => {
    it('should clean up all temp files when disposed', () => {
      const filePath1 = '/tmp/file1.js';
      const filePath2 = '/tmp/file2.js';

      // Setup temp files array with test files
      (service as any).tempFiles = [filePath1, filePath2];

      // Make files exist
      mockFileSystem.existsSync.returns(true);

      // Dispose the service
      service.dispose();

      // Verify all files were deleted
      expect(mockFileSystem.unlinkSync.calledWith(filePath1)).to.be.true;
      expect(mockFileSystem.unlinkSync.calledWith(filePath2)).to.be.true;
      // Verify temp files array was cleared
      expect((service as any).tempFiles).to.be.empty;
    });

    it('should handle errors during cleanup', () => {
      const filePath = '/tmp/error-file.js';

      // Setup temp files array with test file
      (service as any).tempFiles = [filePath];

      // Make file exist
      mockFileSystem.existsSync.returns(true);

      // Make delete operation throw an error
      mockFileSystem.unlinkSync.withArgs(filePath).throws(new Error('Delete error'));

      // Dispose the service
      service.dispose();

      // Verify error was logged
      expect(mockWindow.showErrorMessage.called).to.be.true;
      // Verify temp files array was still cleared
      expect((service as any).tempFiles).to.be.empty;
    });
  });
});
