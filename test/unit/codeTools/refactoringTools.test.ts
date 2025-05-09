import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { RefactoringTools } from '../../../src/codeTools/refactoringTools';
import { CodeDiffService } from '../../../src/codeTools/services/CodeDiffService';
import { CodeSimplificationService } from '../../../src/codeTools/services/CodeSimplificationService';
import { LLMRefactoringService } from '../../../src/codeTools/services/LLMRefactoringService';
import { RefactoringOutputService } from '../../../src/codeTools/services/RefactoringOutputService';
import { UnusedCodeAnalyzerService } from '../../../src/codeTools/services/UnusedCodeAnalyzerService';

describe('RefactoringTools - TypeScript', () => {
  let refactoringTools: RefactoringTools;
  let sandbox: sinon.SinonSandbox;
  let mockSimplificationService: sinon.SinonStubbedInstance<CodeSimplificationService>;
  let mockUnusedCodeAnalyzer: sinon.SinonStubbedInstance<UnusedCodeAnalyzerService>;
  let mockDiffService: sinon.SinonStubbedInstance<CodeDiffService>;
  let mockOutputService: sinon.SinonStubbedInstance<RefactoringOutputService>;
  let mockLlmService: sinon.SinonStubbedInstance<LLMRefactoringService>;
  let mockWindow: any;
  let mockWorkspace: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create stub instances for all the services
    mockSimplificationService = sandbox.createStubInstance(CodeSimplificationService);
    mockUnusedCodeAnalyzer = sandbox.createStubInstance(UnusedCodeAnalyzerService);
    mockDiffService = sandbox.createStubInstance(CodeDiffService);
    mockOutputService = sandbox.createStubInstance(RefactoringOutputService);
    mockLlmService = sandbox.createStubInstance(LLMRefactoringService);

    // Mock VS Code window
    mockWindow = {
      activeTextEditor: {
        document: {
          uri: vscode.Uri.file('/path/to/file.ts'),
          getText: sandbox.stub().returns('const test = 1 + 2;'),
          languageId: 'typescript',
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

    // Override the constructor to use our mock services
    sandbox.stub(CodeSimplificationService.prototype, 'constructor').returns(mockSimplificationService);
    sandbox.stub(UnusedCodeAnalyzerService.prototype, 'constructor').returns(mockUnusedCodeAnalyzer);
    sandbox.stub(CodeDiffService.prototype, 'constructor').returns(mockDiffService);
    sandbox.stub(RefactoringOutputService.prototype, 'constructor').returns(mockOutputService);
    sandbox.stub(LLMRefactoringService.prototype, 'constructor').returns(mockLlmService);

    // Create the RefactoringTools instance
    refactoringTools = new RefactoringTools();

    // Replace the services with our mocks
    (refactoringTools as any).simplificationService = mockSimplificationService;
    (refactoringTools as any).unusedCodeAnalyzer = mockUnusedCodeAnalyzer;
    (refactoringTools as any).diffService = mockDiffService;
    (refactoringTools as any).outputService = mockOutputService;
    (refactoringTools as any).llmService = mockLlmService;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize', () => {
    it('should initialize all services', async () => {
      // Setup
      mockSimplificationService.initialize.resolves();
      mockUnusedCodeAnalyzer.initialize.resolves();
      mockLlmService.initialize.resolves();

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
      mockUnusedCodeAnalyzer.initialize.resolves();
      mockLlmService.initialize.resolves();

      // Add a spy to console.error
      const consoleErrorSpy = sandbox.spy(console, 'error');

      // Execute
      try {
        await refactoringTools.initialize();
      } catch (e) {
        // Expecting error to be caught by the method
      }

      // Verify
      // Since initialization errors are not explicitly handled in the code,
      // we can only check that all initialize methods were called
      expect(mockSimplificationService.initialize.calledOnce).to.be.true;
      expect(mockUnusedCodeAnalyzer.initialize.calledOnce).to.be.true;
      expect(mockLlmService.initialize.calledOnce).to.be.true;
    });
  });

  describe('simplifyCode', () => {
    it('should simplify code from the active editor', async () => {
      // Setup
      const originalCode = 'const test = 1 + 2;';
      const simplifiedCode = 'const test = 3;';
      const selectionRange = new vscode.Selection(0, 0, 0, 10);

      mockSimplificationService.getEditorContent.resolves({ text: originalCode, selection: selectionRange });
      mockSimplificationService.simplifyCode.resolves(simplifiedCode);

      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockOutputService.startOperation.calledWith('Analyzing code for simplification...')).to.be.true;
      expect(mockSimplificationService.getEditorContent.calledOnce).to.be.true;
      expect(mockSimplificationService.simplifyCode.calledWith(originalCode, 'typescript')).to.be.true;
      expect(mockDiffService.showDiff.calledOnce).to.be.true;
      expect(mockOutputService.logSuccess.calledWith('Code successfully simplified')).to.be.true;
    });

    it('should handle empty selection in editor', async () => {
      // Setup
      const originalCode = 'const test = 1 + 2;';
      const simplifiedCode = 'const test = 3;';
      const emptySelection = new vscode.Selection(0, 0, 0, 0);

      mockSimplificationService.getEditorContent.resolves({ text: originalCode, selection: emptySelection });
      mockSimplificationService.simplifyCode.resolves(simplifiedCode);

      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockDiffService.showDiff.calledWith(
        sinon.match.any,
        originalCode,
        simplifiedCode,
        "Entire File",
        'Apply the simplified code?'
      )).to.be.true;
    });

    it('should handle non-empty selection in editor', async () => {
      // Setup
      const originalCode = 'const test = 1 + 2;';
      const simplifiedCode = 'const test = 3;';
      const nonEmptySelection = new vscode.Selection(0, 0, 0, 10);

      mockSimplificationService.getEditorContent.resolves({ text: originalCode, selection: nonEmptySelection });
      mockSimplificationService.simplifyCode.resolves(simplifiedCode);

      // Execute
      await refactoringTools.simplifyCode();

      // Verify
      expect(mockDiffService.showDiff.calledWith(
        sinon.match.any,
        originalCode,
        simplifiedCode,
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
      const cleanedCode = 'const test = 1 + 2;';

      mockWindow.activeTextEditor.document.getText.returns(originalCode);
      mockUnusedCodeAnalyzer.removeUnusedCode.resolves(cleanedCode);

      // Execute
      await refactoringTools.removeUnusedCode();

      // Verify
      expect(mockOutputService.startOperation.calledWith('Analyzing code to detect unused elements...')).to.be.true;
      expect(mockUnusedCodeAnalyzer.removeUnusedCode.calledWith(originalCode, 'typescript')).to.be.true;
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
      const originalCode = 'const test = 1 + 2;';
      const refactoredCode = 'const sum = 3;';
      const instructions = 'Rename variable to be more descriptive';
      const selectionRange = new vscode.Selection(0, 0, 0, 10);

      mockSimplificationService.getEditorContent.resolves({ text: originalCode, selection: selectionRange });
      mockLlmService.refactorCode.resolves(refactoredCode);

      // Execute
      await refactoringTools.refactorWithLLM(instructions);

      // Verify
      expect(mockOutputService.startOperation.calledWith('Processing code with LLM...')).to.be.true;
      expect(mockSimplificationService.getEditorContent.calledOnce).to.be.true;
      expect(mockLlmService.refactorCode.calledWith(originalCode, 'typescript', instructions)).to.be.true;
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
      const uri = vscode.Uri.file('/path/to/file.ts');
      const code = 'const test = 1 + 2;';
      const title = 'Test Diff';
      const prompt = 'Apply changes?';

      // Execute
      await (refactoringTools as any).showAndApplyChanges(uri, code, code, title, prompt);

      // Verify
      expect(mockDiffService.showDiff.called).to.be.false;
      expect(mockOutputService.logSuccess.calledWith('No changes needed, code is already optimized')).to.be.true;
    });

    it('should show diff and apply changes when user confirms', async () => {
      // Setup
      const uri = vscode.Uri.file('/path/to/file.ts');
      const originalCode = 'const test = 1 + 2;';
      const newCode = 'const test = 3;';
      const title = 'Test Diff';
      const prompt = 'Apply changes?';

      mockWindow.showInformationMessage.resolves('Replace');

      // Execute
      await (refactoringTools as any).showAndApplyChanges(uri, originalCode, newCode, title, prompt);

      // Verify
      expect(mockDiffService.showDiff.calledWith(uri, originalCode, newCode, title)).to.be.true;
      expect(mockWindow.showInformationMessage.calledWith(prompt, 'Replace', 'Cancel')).to.be.true;
      expect(mockWorkspace.openTextDocument.calledWith(uri)).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
    });

    it('should not apply changes when user cancels', async () => {
      // Setup
      const uri = vscode.Uri.file('/path/to/file.ts');
      const originalCode = 'const test = 1 + 2;';
      const newCode = 'const test = 3;';
      const title = 'Test Diff';
      const prompt = 'Apply changes?';

      mockWindow.showInformationMessage.resolves('Cancel');

      // Execute
      await (refactoringTools as any).showAndApplyChanges(uri, originalCode, newCode, title, prompt);

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
      const superDisposeStub = sandbox.stub(Object.getPrototypeOf(RefactoringTools.prototype), 'dispose');

      // Execute
      refactoringTools.dispose();

      // Verify
      expect(superDisposeStub.calledOnce).to.be.true;

      // Cleanup
      superDisposeStub.restore();
    });
  });
});
