const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { RefactoringTools } = require('../../../src/codeTools/refactoringTools');

describe('RefactoringTools - JavaScript', () => {
  let refactoringTools;
  let sandbox;
  let mockSimplificationService;
  let mockUnusedCodeAnalyzer;
  let mockDiffService;
  let mockOutputService;
  let mockLlmService;
  let mockWindow;
  let mockWorkspace;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock services
    mockSimplificationService = {
      initialize: sandbox.stub().resolves(),
      getEditorContent: sandbox.stub().resolves({
        text: 'const test = 1 + 2;',
        selection: new vscode.Selection(0, 0, 0, 10)
      }),
      simplifyCode: sandbox.stub().resolves('const test = 3;')
    };

    mockUnusedCodeAnalyzer = {
      initialize: sandbox.stub().resolves(),
      removeUnusedCode: sandbox.stub().resolves('const test = 1 + 2;')
    };

    mockDiffService = {
      showDiff: sandbox.stub().resolves()
    };

    mockOutputService = {
      startOperation: sandbox.stub(),
      logSuccess: sandbox.stub(),
      logError: sandbox.stub()
    };

    mockLlmService = {
      initialize: sandbox.stub().resolves(),
      refactorCode: sandbox.stub().resolves('const sum = 3;')
    };

    // Mock VS Code window
    mockWindow = {
      activeTextEditor: {
        document: {
          uri: vscode.Uri.file('/path/to/file.js'),
          getText: sandbox.stub().returns('const test = 1 + 2;'),
          languageId: 'javascript',
          lineCount: 1
        },
        edit: sandbox.stub().resolves(true),
        selection: new vscode.Selection(0, 0, 0, 10)
      },
      showWarningMessage: sandbox.stub().resolves(),
      showInformationMessage: sandbox.stub().resolves('Replace'),
      showTextDocument: sandbox.stub().resolves({
        edit: sandbox.stub().callsFake(callback => {
          const editBuilder = { replace: sandbox.stub() };
          callback(editBuilder);
          return Promise.resolve(true);
        })
      })
    };
    sandbox.stub(vscode, 'window').value(mockWindow);

    // Mock VS Code workspace
    mockWorkspace = {
      openTextDocument: sandbox.stub().resolves({
        getText: sandbox.stub().returns('const test = 1 + 2;'),
        lineCount: 1
      })
    };
    sandbox.stub(vscode, 'workspace').value(mockWorkspace);

    // Create instance of RefactoringTools
    refactoringTools = new RefactoringTools();

    // Replace internal services with mocks
    refactoringTools.simplificationService = mockSimplificationService;
    refactoringTools.unusedCodeAnalyzer = mockUnusedCodeAnalyzer;
    refactoringTools.diffService = mockDiffService;
    refactoringTools.outputService = mockOutputService;
    refactoringTools.llmService = mockLlmService;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize', () => {
    it('should initialize all services', async () => {
      // Execute
      await refactoringTools.initialize();

      // Verify
      expect(mockSimplificationService.initialize.calledOnce).to.be.true;
      expect(mockUnusedCodeAnalyzer.initialize.calledOnce).to.be.true;
      expect(mockLlmService.initialize.calledOnce).to.be.true;
    });

    it('should handle errors during initialization', async () => {
      // Setup
      const error = new Error('Initialization error');
      mockSimplificationService.initialize.rejects(error);

      // Add a spy to console.error
      const consoleErrorSpy = sandbox.spy(console, 'error');

      // Execute
      try {
        await refactoringTools.initialize();
      } catch (e) {
        // Expecting error to be caught by the method
      }

      // Verify
      expect(mockSimplificationService.initialize.calledOnce).to.be.true;
    });
  });

  describe('simplifyCode', () => {
    it('should simplify code from the active editor', async () => {
      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockOutputService.startOperation.calledWith('Analyzing code for simplification...')).to.be.true;
      expect(mockSimplificationService.getEditorContent.calledOnce).to.be.true;
      expect(mockSimplificationService.simplifyCode.calledWith('const test = 1 + 2;', 'javascript')).to.be.true;
      expect(mockDiffService.showDiff.calledOnce).to.be.true;
      expect(mockOutputService.logSuccess.calledWith('Code successfully simplified')).to.be.true;
    });

    it('should handle empty selection in editor', async () => {
      // Setup
      mockSimplificationService.getEditorContent.resolves({
        text: 'const test = 1 + 2;',
        selection: new vscode.Selection(0, 0, 0, 0)
      });

      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockDiffService.showDiff.calledWith(
        sinon.match.any,
        'const test = 1 + 2;',
        'const test = 3;',
        "Entire File",
        'Apply the simplified code?'
      )).to.be.true;
    });

    it('should handle non-empty selection in editor', async () => {
      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockDiffService.showDiff.calledWith(
        sinon.match.any,
        'const test = 1 + 2;',
        'const test = 3;',
        "Selected Code",
        'Apply the simplified code?'
      )).to.be.true;
    });

    it('should show warning when no active editor', async () => {
      // Setup
      mockWindow.activeTextEditor = undefined;

      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockWindow.showWarningMessage.calledWith('No active editor found')).to.be.true;
      expect(mockOutputService.startOperation.called).to.be.false;
    });

    it('should handle errors during simplification', async () => {
      // Setup
      const error = new Error('Simplification error');
      mockSimplificationService.getEditorContent.rejects(error);

      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockOutputService.logError.calledWith('Error simplifying code:', error)).to.be.true;
    });
  });

  describe('removeUnusedCode', () => {
    it('should remove unused code from the active editor', async () => {
      // Setup
      const originalCode = 'const test = 1 + 2;\nconst unused = 42;';
      mockWindow.activeTextEditor.document.getText.returns(originalCode);

      // Execute
      await refactoringTools.removeUnusedCode();

      // Verify
      expect(mockOutputService.startOperation.calledWith('Analyzing code to detect unused elements...')).to.be.true;
      expect(mockUnusedCodeAnalyzer.removeUnusedCode.calledWith(originalCode, 'javascript')).to.be.true;
      expect(mockDiffService.showDiff.calledOnce).to.be.true;
      expect(mockOutputService.logSuccess.calledWith('Unused code successfully removed')).to.be.true;
    });

    it('should show warning when no active editor', async () => {
      // Setup
      mockWindow.activeTextEditor = undefined;

      // Execute
      await refactoringTools.removeUnusedCode();

      // Verify
      expect(mockWindow.showWarningMessage.calledWith('No active editor found')).to.be.true;
      expect(mockOutputService.startOperation.called).to.be.false;
    });

    it('should handle errors during unused code removal', async () => {
      // Setup
      const error = new Error('Unused code analysis error');
      mockUnusedCodeAnalyzer.removeUnusedCode.rejects(error);

      // Execute
      await refactoringTools.removeUnusedCode();

      // Verify
      expect(mockOutputService.logError.calledWith('Error removing unused code:', error)).to.be.true;
    });
  });

  describe('refactorWithLLM', () => {
    it('should refactor code using LLM from the active editor', async () => {
      // Setup
      const instructions = 'Rename variable to be more descriptive';

      // Execute
      await refactoringTools.refactorWithLLM(instructions);

      // Verify
      expect(mockOutputService.startOperation.calledWith('Processing code with LLM...')).to.be.true;
      expect(mockSimplificationService.getEditorContent.calledOnce).to.be.true;
      expect(mockLlmService.refactorCode.calledWith('const test = 1 + 2;', 'javascript', instructions)).to.be.true;
      expect(mockDiffService.showDiff.calledOnce).to.be.true;
      expect(mockOutputService.logSuccess.calledWith('Code successfully refactored')).to.be.true;
    });

    it('should show warning when no active editor', async () => {
      // Setup
      mockWindow.activeTextEditor = undefined;
      const instructions = 'Rename variable to be more descriptive';

      // Execute
      await refactoringTools.refactorWithLLM(instructions);

      // Verify
      expect(mockWindow.showWarningMessage.calledWith('No active editor found')).to.be.true;
      expect(mockOutputService.startOperation.called).to.be.false;
    });

    it('should handle errors during LLM refactoring', async () => {
      // Setup
      const error = new Error('LLM refactoring error');
      const instructions = 'Rename variable to be more descriptive';
      mockSimplificationService.getEditorContent.rejects(error);

      // Execute
      await refactoringTools.refactorWithLLM(instructions);

      // Verify
      expect(mockOutputService.logError.calledWith('Error during LLM refactoring:', error)).to.be.true;
    });
  });

  describe('showAndApplyChanges', () => {
    it('should not show diff when original and new code are identical', async () => {
      // Setup
      const uri = vscode.Uri.file('/path/to/file.js');
      const code = 'const test = 1 + 2;';
      const title = 'Test Diff';
      const prompt = 'Apply changes?';

      // Execute
      await refactoringTools.showAndApplyChanges(uri, code, code, title, prompt);

      // Verify
      expect(mockDiffService.showDiff.called).to.be.false;
      expect(mockOutputService.logSuccess.calledWith('No changes needed, code is already optimized')).to.be.true;
    });

    it('should show diff and apply changes when user confirms', async () => {
      // Setup
      const uri = vscode.Uri.file('/path/to/file.js');
      const originalCode = 'const test = 1 + 2;';
      const newCode = 'const test = 3;';
      const title = 'Test Diff';
      const prompt = 'Apply changes?';

      mockWindow.showInformationMessage.resolves('Replace');

      // Execute
      await refactoringTools.showAndApplyChanges(uri, originalCode, newCode, title, prompt);

      // Verify
      expect(mockDiffService.showDiff.calledWith(uri, originalCode, newCode, title)).to.be.true;
      expect(mockWindow.showInformationMessage.calledWith(prompt, 'Replace', 'Cancel')).to.be.true;
      expect(mockWorkspace.openTextDocument.calledWith(uri)).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
    });

    it('should not apply changes when user cancels', async () => {
      // Setup
      const uri = vscode.Uri.file('/path/to/file.js');
      const originalCode = 'const test = 1 + 2;';
      const newCode = 'const test = 3;';
      const title = 'Test Diff';
      const prompt = 'Apply changes?';

      mockWindow.showInformationMessage.resolves('Cancel');

      // Execute
      await refactoringTools.showAndApplyChanges(uri, originalCode, newCode, title, prompt);

      // Verify
      expect(mockDiffService.showDiff.calledWith(uri, originalCode, newCode, title)).to.be.true;
      expect(mockWindow.showInformationMessage.calledWith(prompt, 'Replace', 'Cancel')).to.be.true;
      expect(mockWorkspace.openTextDocument.called).to.be.false;
      expect(mockWindow.showTextDocument.called).to.be.false;
    });
  });

  describe('dispose', () => {
    it('should call the base class dispose method', () => {
      // Setup
      const originalDispose = Object.getPrototypeOf(RefactoringTools.prototype).dispose;
      Object.getPrototypeOf(RefactoringTools.prototype).dispose = sandbox.stub();

      // Execute
      refactoringTools.dispose();

      // Verify
      expect(Object.getPrototypeOf(RefactoringTools.prototype).dispose.calledOnce).to.be.true;

      // Restore original
      Object.getPrototypeOf(RefactoringTools.prototype).dispose = originalDispose;
    });
  });
});
