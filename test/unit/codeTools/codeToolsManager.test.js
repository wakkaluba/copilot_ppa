const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { CodeToolsManager } = require('../../../src/codeTools/codeToolsManager');
const { LinterIntegration } = require('../../../src/codeTools/linterIntegration');
const { RefactoringTools } = require('../../../src/codeTools/refactoringTools');

describe('CodeToolsManager - JavaScript', () => {
  let codeToolsManager;
  let sandbox;
  let mockContext;
  let mockLinterIntegration;
  let mockRefactoringTools;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code context
    mockContext = {
      subscriptions: [],
      extensionPath: '/path/to/extension',
      extensionUri: { fsPath: '/path/to/extension' },
      globalStorageUri: { fsPath: '/path/to/globalStorage' },
      logUri: { fsPath: '/path/to/logs' },
      storageUri: { fsPath: '/path/to/storage' },
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(true),
        setKeysForSync: sandbox.stub()
      },
      workspaceState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(true),
        setKeysForSync: sandbox.stub()
      },
      secrets: {
        get: sandbox.stub().resolves(''),
        store: sandbox.stub().resolves(),
        delete: sandbox.stub().resolves()
      },
      environmentVariableCollection: {},
      asAbsolutePath: (path) => `/path/to/extension/${path}`
    };

    // Create mock services
    mockLinterIntegration = sinon.createStubInstance(LinterIntegration);
    mockRefactoringTools = sinon.createStubInstance(RefactoringTools);

    // Create CodeToolsManager instance
    codeToolsManager = new CodeToolsManager(mockContext);

    // Replace dependencies with mocks
    codeToolsManager.linterIntegration = mockLinterIntegration;
    codeToolsManager.refactoringTools = mockRefactoringTools;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize', () => {
    it('should initialize all dependencies and register commands', async () => {
      // Stub the registerCommands method to verify it's called
      const registerCommandsStub = sandbox.stub(codeToolsManager, 'registerCommands');

      await codeToolsManager.initialize();

      expect(registerCommandsStub.calledOnce).to.be.true;
      // Verify dependencies were initialized
      expect(mockLinterIntegration.initialize.calledOnce).to.be.true;
      expect(mockRefactoringTools.initialize.calledOnce).to.be.true;
    });

    it('should handle errors during initialization', async () => {
      // Simulate an error in a dependency initialization
      mockLinterIntegration.initialize.rejects(new Error('Initialization error'));

      // Spy on console.error or a logger method if there's one
      const errorSpy = sandbox.spy(console, 'error');

      await codeToolsManager.initialize();

      expect(errorSpy.calledWith(sinon.match(/Failed to initialize CodeToolsManager/))).to.be.true;
    });
  });

  describe('registerCommands', () => {
    it('should register all commands with VS Code', () => {
      // Create stub for vscode.commands.registerCommand
      const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({
        dispose: sandbox.stub()
      });

      // Call the method
      codeToolsManager.registerCommands();

      // Verify appropriate number of commands were registered
      expect(registerCommandStub.called).to.be.true;
      expect(mockContext.subscriptions.length).to.be.greaterThan(0);
    });
  });

  describe('getLinterIntegration', () => {
    it('should return the linter integration instance', () => {
      const linterIntegration = codeToolsManager.getLinterIntegration();

      expect(linterIntegration).to.equal(mockLinterIntegration);
    });
  });

  describe('getRefactoringTools', () => {
    it('should return the refactoring tools instance', () => {
      const refactoringTools = codeToolsManager.getRefactoringTools();

      expect(refactoringTools).to.equal(mockRefactoringTools);
    });
  });

  describe('runLinterOnFile', () => {
    it('should run linter on the specified file', async () => {
      const filePath = '/path/to/file.js';
      const mockDiagnostics = [{ message: 'Test diagnostic' }];
      mockLinterIntegration.lintFile.resolves(mockDiagnostics);

      const diagnostics = await codeToolsManager.runLinterOnFile(filePath);

      expect(mockLinterIntegration.lintFile.calledWith(filePath)).to.be.true;
      expect(diagnostics).to.deep.equal(mockDiagnostics);
    });

    it('should handle errors when linting a file', async () => {
      const filePath = '/path/to/file.js';
      mockLinterIntegration.lintFile.rejects(new Error('Linting error'));

      const errorSpy = sandbox.spy(console, 'error');

      await codeToolsManager.runLinterOnFile(filePath);

      expect(errorSpy.calledWith(sinon.match(/Error running linter/))).to.be.true;
    });
  });

  describe('runLinterOnWorkspace', () => {
    it('should run linter on the entire workspace', async () => {
      const mockDiagnostics = { 'file1.js': [{ message: 'Test diagnostic' }] };
      mockLinterIntegration.lintWorkspace.resolves(mockDiagnostics);

      const diagnostics = await codeToolsManager.runLinterOnWorkspace();

      expect(mockLinterIntegration.lintWorkspace.calledOnce).to.be.true;
      expect(diagnostics).to.deep.equal(mockDiagnostics);
    });

    it('should handle errors when linting the workspace', async () => {
      mockLinterIntegration.lintWorkspace.rejects(new Error('Workspace linting error'));

      const errorSpy = sandbox.spy(console, 'error');

      await codeToolsManager.runLinterOnWorkspace();

      expect(errorSpy.calledWith(sinon.match(/Error running workspace linter/))).to.be.true;
    });
  });

  describe('runCodeSimplification', () => {
    it('should run code simplification on the specified file', async () => {
      const filePath = '/path/to/file.js';
      const mockSuggestions = [{ message: 'Simplify this code', range: {} }];
      mockRefactoringTools.simplifyCode.resolves(mockSuggestions);

      const suggestions = await codeToolsManager.runCodeSimplification(filePath);

      expect(mockRefactoringTools.simplifyCode.calledWith(filePath)).to.be.true;
      expect(suggestions).to.deep.equal(mockSuggestions);
    });

    it('should handle errors when simplifying code', async () => {
      const filePath = '/path/to/file.js';
      mockRefactoringTools.simplifyCode.rejects(new Error('Simplification error'));

      const errorSpy = sandbox.spy(console, 'error');

      await codeToolsManager.runCodeSimplification(filePath);

      expect(errorSpy.calledWith(sinon.match(/Error running code simplification/))).to.be.true;
    });
  });

  describe('showCodeDiff', () => {
    it('should show diff between original and refactored code', async () => {
      const original = 'function test() { return 1 + 2; }';
      const refactored = 'function test() { return 3; }';

      // Mock the method to show diff
      const showDiffStub = sandbox.stub(mockRefactoringTools, 'showDiff').resolves();

      await codeToolsManager.showCodeDiff(original, refactored, 'JavaScript');

      expect(showDiffStub.calledWith(original, refactored, 'JavaScript')).to.be.true;
    });

    it('should handle errors when showing code diff', async () => {
      const original = 'function test() { return 1 + 2; }';
      const refactored = 'function test() { return 3; }';

      mockRefactoringTools.showDiff.rejects(new Error('Diff error'));

      const errorSpy = sandbox.spy(console, 'error');

      await codeToolsManager.showCodeDiff(original, refactored, 'JavaScript');

      expect(errorSpy.calledWith(sinon.match(/Error showing code diff/))).to.be.true;
    });
  });

  describe('applyRefactoring', () => {
    it('should apply refactoring to the specified file', async () => {
      const filePath = '/path/to/file.js';
      const refactored = 'function test() { return 3; }';

      // Mock the file system write
      const writeFileStub = sandbox.stub(vscode.workspace.fs, 'writeFile').resolves();

      await codeToolsManager.applyRefactoring(filePath, refactored);

      expect(writeFileStub.calledOnce).to.be.true;
    });

    it('should handle errors when applying refactoring', async () => {
      const filePath = '/path/to/file.js';
      const refactored = 'function test() { return 3; }';

      // Mock filesystem error
      sandbox.stub(vscode.workspace.fs, 'writeFile').rejects(new Error('Write error'));

      const errorSpy = sandbox.spy(console, 'error');

      await codeToolsManager.applyRefactoring(filePath, refactored);

      expect(errorSpy.calledWith(sinon.match(/Error applying refactoring/))).to.be.true;
    });
  });

  describe('dispose', () => {
    it('should dispose all disposable resources', () => {
      // Set up mock disposables
      const mockDisposable1 = { dispose: sandbox.stub() };
      const mockDisposable2 = { dispose: sandbox.stub() };

      codeToolsManager.disposables = [mockDisposable1, mockDisposable2];

      codeToolsManager.dispose();

      expect(mockDisposable1.dispose.calledOnce).to.be.true;
      expect(mockDisposable2.dispose.calledOnce).to.be.true;
      expect(codeToolsManager.disposables.length).to.equal(0);
    });

    it('should dispose linter integration and refactoring tools', () => {
      codeToolsManager.dispose();

      expect(mockLinterIntegration.dispose.calledOnce).to.be.true;
      expect(mockRefactoringTools.dispose.calledOnce).to.be.true;
    });
  });
});
