const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { CodeExecutorService } = require('../../../../src/codeEditor/services/codeExecutor');

describe('CodeExecutorService - JavaScript', () => {
  let service;
  let sandbox;
  let mockTerminal;

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
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves({});

    // Mock editor
    const mockEditor = {
      document: {
        getText: sandbox.stub().returns('const test = "sample code";'),
        languageId: 'javascript',
        fileName: 'test.js'
      },
      selection: {
        isEmpty: false
      }
    };
    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);

    // Mock FS operations
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(fs, 'mkdirSync');
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(fs, 'readdirSync').returns(['temp1.js', 'temp2.js']);
    sandbox.stub(fs, 'statSync').returns({
      mtime: new Date(),
      isDirectory: () => false
    });
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
      vscode.window.activeTextEditor = undefined;

      await service.executeSelectedCode();

      expect(vscode.window.createTerminal.called).to.be.false;
    });

    it('should do nothing when selection is empty', async () => {
      vscode.window.activeTextEditor.selection.isEmpty = true;

      await service.executeSelectedCode();

      expect(vscode.window.createTerminal.called).to.be.false;
    });

    it('should handle errors during execution', async () => {
      vscode.window.createTerminal.throws(new Error('Terminal creation failed'));

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
      const filePath = service.createTempFile('const x = 10;', 'js');

      expect(filePath).to.be.a('string');
      expect(fs.writeFileSync.called).to.be.true;
      expect(fs.writeFileSync.firstCall.args[1]).to.equal('const x = 10;');
    });

    it('should create the temp directory if it does not exist', () => {
      fs.existsSync.returns(false);

      service.createTempFile('content', 'txt');

      expect(fs.mkdirSync.called).to.be.true;
    });

    it('should use a default extension if none is provided', () => {
      service.createTempFile('content');

      expect(fs.writeFileSync.firstCall.args[0]).to.include('.txt');
    });

    it('should handle errors during file creation', () => {
      fs.writeFileSync.throws(new Error('Write failed'));

      expect(() => service.createTempFile('content', 'txt')).to.throw('Write failed');
    });
  });

  describe('trackTempFile', () => {
    it('should add a file to the tracking list', () => {
      service.tempFiles = [];

      service.trackTempFile('/path/to/file.js');

      expect(service.tempFiles).to.include('/path/to/file.js');
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
      fs.statSync.returns({
        mtime: new Date(Date.now() - 86400000), // 1 day old
        isDirectory: () => false
      });

      service.cleanupTempFiles(3600); // 1 hour max age

      expect(fs.unlinkSync.called).to.be.true;
      expect(fs.unlinkSync.callCount).to.equal(2); // Two temp files in our mock directory
    });

    it('should not remove recent temporary files', () => {
      // Make files appear recent
      fs.statSync.returns({
        mtime: new Date(), // Just created
        isDirectory: () => false
      });

      service.cleanupTempFiles(3600); // 1 hour max age

      expect(fs.unlinkSync.called).to.be.false;
    });

    it('should handle errors during cleanup', () => {
      fs.readdirSync.throws(new Error('Read directory failed'));

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
