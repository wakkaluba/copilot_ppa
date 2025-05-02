const vscode = require('vscode');
const { RefactoringTools } = require('../../codeTools/refactoringTools');
const { CodeSimplificationService } = require('../../codeTools/services/CodeSimplificationService');
const { UnusedCodeAnalyzerService } = require('../../codeTools/services/UnusedCodeAnalyzerService');
const { CodeDiffService } = require('../../codeTools/services/CodeDiffService');
const { RefactoringOutputService } = require('../../codeTools/services/RefactoringOutputService');
const { LLMRefactoringService } = require('../../codeTools/services/LLMRefactoringService');

// Mock dependencies
jest.mock('vscode');
jest.mock('../../codeTools/services/CodeSimplificationService');
jest.mock('../../codeTools/services/UnusedCodeAnalyzerService');
jest.mock('../../codeTools/services/CodeDiffService');
jest.mock('../../codeTools/services/RefactoringOutputService');
jest.mock('../../codeTools/services/LLMRefactoringService');

describe('RefactoringTools - JavaScript', () => {
  let refactoringTools;
  let mockEditor;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock for active text editor
    mockEditor = {
      document: {
        uri: { fsPath: 'test/file.js' },
        getText: jest.fn().mockReturnValue('original code'),
        languageId: 'javascript',
        lineCount: 10
      },
      edit: jest.fn().mockResolvedValue(true),
      selection: { isEmpty: true }
    };

    // Setup VSCode mocks
    vscode.window.activeTextEditor = mockEditor;
    vscode.window.showWarningMessage = jest.fn();
    vscode.window.showInformationMessage = jest.fn().mockResolvedValue('Replace');
    vscode.workspace.openTextDocument = jest.fn().mockResolvedValue(mockEditor.document);
    vscode.window.showTextDocument = jest.fn().mockResolvedValue(mockEditor);
    vscode.Range = jest.fn().mockImplementation((startLine, startChar, endLine, endChar) => ({
      startLine,
      startChar,
      endLine,
      endChar
    }));

    // Setup mock implementations
    CodeSimplificationService.prototype.getEditorContent = jest.fn().mockResolvedValue({
      text: 'original code',
      selection: { isEmpty: true }
    });
    CodeSimplificationService.prototype.simplifyCode = jest.fn().mockResolvedValue('simplified code');
    CodeSimplificationService.prototype.initialize = jest.fn().mockResolvedValue(undefined);

    UnusedCodeAnalyzerService.prototype.removeUnusedCode = jest.fn().mockResolvedValue('cleaned code');
    UnusedCodeAnalyzerService.prototype.initialize = jest.fn().mockResolvedValue(undefined);

    CodeDiffService.prototype.showDiff = jest.fn().mockResolvedValue(undefined);

    RefactoringOutputService.prototype.startOperation = jest.fn();
    RefactoringOutputService.prototype.logSuccess = jest.fn();
    RefactoringOutputService.prototype.logError = jest.fn();

    LLMRefactoringService.prototype.refactorCode = jest.fn().mockResolvedValue('llm refactored code');
    LLMRefactoringService.prototype.initialize = jest.fn().mockResolvedValue(undefined);

    // Create instance of RefactoringTools
    refactoringTools = new RefactoringTools();
  });

  describe('initialize', () => {
    it('should initialize all services', async () => {
      await refactoringTools.initialize();

      expect(CodeSimplificationService.prototype.initialize).toHaveBeenCalled();
      expect(UnusedCodeAnalyzerService.prototype.initialize).toHaveBeenCalled();
      expect(LLMRefactoringService.prototype.initialize).toHaveBeenCalled();
    });

    it('should handle errors during initialization', async () => {
      CodeSimplificationService.prototype.initialize.mockRejectedValue(new Error('Init error'));

      await expect(refactoringTools.initialize()).rejects.toThrow('Init error');
    });
  });

  describe('simplifyCode', () => {
    it('should simplify code in the active editor', async () => {
      await refactoringTools.simplifyCode();

      expect(RefactoringOutputService.prototype.startOperation).toHaveBeenCalledWith('Analyzing code for simplification...');
      expect(CodeSimplificationService.prototype.getEditorContent).toHaveBeenCalled();
      expect(CodeSimplificationService.prototype.simplifyCode).toHaveBeenCalledWith('original code', 'javascript');
      expect(CodeDiffService.prototype.showDiff).toHaveBeenCalledWith(
        mockEditor.document.uri,
        'original code',
        'simplified code',
        'Entire File',
        expect.any(String)
      );
      expect(RefactoringOutputService.prototype.logSuccess).toHaveBeenCalledWith('Code successfully simplified');
    });

    it('should handle no active editor', async () => {
      vscode.window.activeTextEditor = undefined;

      await refactoringTools.simplifyCode();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found');
      expect(CodeSimplificationService.prototype.simplifyCode).not.toHaveBeenCalled();
    });

    it('should handle errors in simplification', async () => {
      CodeSimplificationService.prototype.simplifyCode.mockRejectedValue(new Error('Simplify error'));

      await refactoringTools.simplifyCode();

      expect(RefactoringOutputService.prototype.logError).toHaveBeenCalledWith('Error simplifying code:', expect.any(Error));
    });

    it('should handle case when code is already optimized', async () => {
      CodeSimplificationService.prototype.simplifyCode.mockResolvedValue('original code');

      await refactoringTools.simplifyCode();

      expect(RefactoringOutputService.prototype.logSuccess).toHaveBeenCalledWith('No changes needed, code is already optimized');
      expect(CodeDiffService.prototype.showDiff).not.toHaveBeenCalled();
    });

    it('should handle user cancellation of replacement', async () => {
      vscode.window.showInformationMessage.mockResolvedValue('Cancel');

      await refactoringTools.simplifyCode();

      expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
      expect(vscode.window.showTextDocument).not.toHaveBeenCalled();
    });
  });

  describe('removeUnusedCode', () => {
    it('should remove unused code in the active editor', async () => {
      await refactoringTools.removeUnusedCode();

      expect(RefactoringOutputService.prototype.startOperation).toHaveBeenCalledWith('Analyzing code to detect unused elements...');
      expect(UnusedCodeAnalyzerService.prototype.removeUnusedCode).toHaveBeenCalledWith(
        'original code',
        'javascript'
      );
      expect(CodeDiffService.prototype.showDiff).toHaveBeenCalledWith(
        mockEditor.document.uri,
        'original code',
        'cleaned code',
        'Entire File (Unused Code Removed)',
        expect.any(String)
      );
      expect(RefactoringOutputService.prototype.logSuccess).toHaveBeenCalledWith('Unused code successfully removed');
    });

    it('should handle no active editor', async () => {
      vscode.window.activeTextEditor = undefined;

      await refactoringTools.removeUnusedCode();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found');
      expect(UnusedCodeAnalyzerService.prototype.removeUnusedCode).not.toHaveBeenCalled();
    });

    it('should handle errors in unused code removal', async () => {
      UnusedCodeAnalyzerService.prototype.removeUnusedCode.mockRejectedValue(new Error('Removal error'));

      await refactoringTools.removeUnusedCode();

      expect(RefactoringOutputService.prototype.logError).toHaveBeenCalledWith('Error removing unused code:', expect.any(Error));
    });
  });

  describe('refactorWithLLM', () => {
    it('should refactor code using LLM', async () => {
      await refactoringTools.refactorWithLLM('Make code more readable');

      expect(RefactoringOutputService.prototype.startOperation).toHaveBeenCalledWith('Processing code with LLM...');
      expect(CodeSimplificationService.prototype.getEditorContent).toHaveBeenCalled();
      expect(LLMRefactoringService.prototype.refactorCode).toHaveBeenCalledWith(
        'original code',
        'javascript',
        'Make code more readable'
      );
      expect(CodeDiffService.prototype.showDiff).toHaveBeenCalledWith(
        mockEditor.document.uri,
        'original code',
        'llm refactored code',
        'LLM Refactoring',
        expect.any(String)
      );
      expect(RefactoringOutputService.prototype.logSuccess).toHaveBeenCalledWith('Code successfully refactored');
    });

    it('should handle no active editor', async () => {
      vscode.window.activeTextEditor = undefined;

      await refactoringTools.refactorWithLLM('Make code more readable');

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found');
      expect(LLMRefactoringService.prototype.refactorCode).not.toHaveBeenCalled();
    });

    it('should handle errors in LLM refactoring', async () => {
      LLMRefactoringService.prototype.refactorCode.mockRejectedValue(new Error('LLM error'));

      await refactoringTools.refactorWithLLM('Make code more readable');

      expect(RefactoringOutputService.prototype.logError).toHaveBeenCalledWith('Error during LLM refactoring:', expect.any(Error));
    });
  });

  describe('dispose', () => {
    it('should dispose resources', () => {
      const spy = jest.spyOn(refactoringTools, 'dispose');

      refactoringTools.dispose();

      expect(spy).toHaveBeenCalled();
    });
  });
});
