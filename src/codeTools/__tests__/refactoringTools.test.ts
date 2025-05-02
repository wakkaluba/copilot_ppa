import * as vscode from 'vscode';
import { RefactoringTools } from '../../codeTools/refactoringTools';
import { CodeDiffService } from '../../codeTools/services/CodeDiffService';
import { CodeSimplificationService } from '../../codeTools/services/CodeSimplificationService';
import { LLMRefactoringService } from '../../codeTools/services/LLMRefactoringService';
import { RefactoringOutputService } from '../../codeTools/services/RefactoringOutputService';
import { UnusedCodeAnalyzerService } from '../../codeTools/services/UnusedCodeAnalyzerService';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../codeTools/services/CodeSimplificationService');
jest.mock('../../codeTools/services/UnusedCodeAnalyzerService');
jest.mock('../../codeTools/services/CodeDiffService');
jest.mock('../../codeTools/services/RefactoringOutputService');
jest.mock('../../codeTools/services/LLMRefactoringService');

describe('RefactoringTools', () => {
  let refactoringTools: RefactoringTools;
  let mockSimplificationService: jest.Mocked<CodeSimplificationService>;
  let mockUnusedCodeAnalyzer: jest.Mocked<UnusedCodeAnalyzerService>;
  let mockDiffService: jest.Mocked<CodeDiffService>;
  let mockOutputService: jest.Mocked<RefactoringOutputService>;
  let mockLLMService: jest.Mocked<LLMRefactoringService>;
  let mockEditor: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock for active text editor
    mockEditor = {
      document: {
        uri: { fsPath: 'test/file.ts' },
        getText: jest.fn().mockReturnValue('original code'),
        languageId: 'typescript',
        lineCount: 10
      },
      edit: jest.fn().mockResolvedValue(true),
      selection: { isEmpty: true }
    };

    // Setup VSCode mocks
    (vscode.window.activeTextEditor as any) = mockEditor;
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

    // Get access to mocked implementations
    mockSimplificationService = CodeSimplificationService.prototype as jest.Mocked<CodeSimplificationService>;
    mockUnusedCodeAnalyzer = UnusedCodeAnalyzerService.prototype as jest.Mocked<UnusedCodeAnalyzerService>;
    mockDiffService = CodeDiffService.prototype as jest.Mocked<CodeDiffService>;
    mockOutputService = RefactoringOutputService.prototype as jest.Mocked<RefactoringOutputService>;
    mockLLMService = LLMRefactoringService.prototype as jest.Mocked<LLMRefactoringService>;

    // Setup mock implementations
    mockSimplificationService.getEditorContent = jest.fn().mockResolvedValue({
      text: 'original code',
      selection: { isEmpty: true }
    });
    mockSimplificationService.simplifyCode = jest.fn().mockResolvedValue('simplified code');
    mockSimplificationService.initialize = jest.fn().mockResolvedValue(undefined);

    mockUnusedCodeAnalyzer.removeUnusedCode = jest.fn().mockResolvedValue('cleaned code');
    mockUnusedCodeAnalyzer.initialize = jest.fn().mockResolvedValue(undefined);

    mockDiffService.showDiff = jest.fn().mockResolvedValue(undefined);

    mockOutputService.startOperation = jest.fn();
    mockOutputService.logSuccess = jest.fn();
    mockOutputService.logError = jest.fn();

    mockLLMService.refactorCode = jest.fn().mockResolvedValue('llm refactored code');
    mockLLMService.initialize = jest.fn().mockResolvedValue(undefined);

    // Create instance of RefactoringTools
    refactoringTools = new RefactoringTools();
  });

  describe('initialize', () => {
    it('should initialize all services', async () => {
      await refactoringTools.initialize();

      expect(mockSimplificationService.initialize).toHaveBeenCalled();
      expect(mockUnusedCodeAnalyzer.initialize).toHaveBeenCalled();
      expect(mockLLMService.initialize).toHaveBeenCalled();
    });

    it('should handle errors during initialization', async () => {
      mockSimplificationService.initialize.mockRejectedValue(new Error('Init error'));

      await expect(refactoringTools.initialize()).rejects.toThrow('Init error');
    });
  });

  describe('simplifyCode', () => {
    it('should simplify code in the active editor', async () => {
      await refactoringTools.simplifyCode();

      expect(mockOutputService.startOperation).toHaveBeenCalledWith('Analyzing code for simplification...');
      expect(mockSimplificationService.getEditorContent).toHaveBeenCalled();
      expect(mockSimplificationService.simplifyCode).toHaveBeenCalledWith('original code', 'typescript');
      expect(mockDiffService.showDiff).toHaveBeenCalledWith(
        mockEditor.document.uri,
        'original code',
        'simplified code',
        'Entire File',
        expect.any(String)
      );
      expect(mockOutputService.logSuccess).toHaveBeenCalledWith('Code successfully simplified');
    });

    it('should handle no active editor', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await refactoringTools.simplifyCode();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found');
      expect(mockSimplificationService.simplifyCode).not.toHaveBeenCalled();
    });

    it('should handle errors in simplification', async () => {
      mockSimplificationService.simplifyCode.mockRejectedValue(new Error('Simplify error'));

      await refactoringTools.simplifyCode();

      expect(mockOutputService.logError).toHaveBeenCalledWith('Error simplifying code:', expect.any(Error));
    });

    it('should handle case when code is already optimized', async () => {
      mockSimplificationService.simplifyCode.mockResolvedValue('original code');

      await refactoringTools.simplifyCode();

      expect(mockOutputService.logSuccess).toHaveBeenCalledWith('No changes needed, code is already optimized');
      expect(mockDiffService.showDiff).not.toHaveBeenCalled();
    });

    it('should handle user cancellation of replacement', async () => {
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Cancel');

      await refactoringTools.simplifyCode();

      expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
      expect(vscode.window.showTextDocument).not.toHaveBeenCalled();
    });
  });

  describe('removeUnusedCode', () => {
    it('should remove unused code in the active editor', async () => {
      await refactoringTools.removeUnusedCode();

      expect(mockOutputService.startOperation).toHaveBeenCalledWith('Analyzing code to detect unused elements...');
      expect(mockUnusedCodeAnalyzer.removeUnusedCode).toHaveBeenCalledWith(
        'original code',
        'typescript'
      );
      expect(mockDiffService.showDiff).toHaveBeenCalledWith(
        mockEditor.document.uri,
        'original code',
        'cleaned code',
        'Entire File (Unused Code Removed)',
        expect.any(String)
      );
      expect(mockOutputService.logSuccess).toHaveBeenCalledWith('Unused code successfully removed');
    });

    it('should handle no active editor', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await refactoringTools.removeUnusedCode();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found');
      expect(mockUnusedCodeAnalyzer.removeUnusedCode).not.toHaveBeenCalled();
    });

    it('should handle errors in unused code removal', async () => {
      mockUnusedCodeAnalyzer.removeUnusedCode.mockRejectedValue(new Error('Removal error'));

      await refactoringTools.removeUnusedCode();

      expect(mockOutputService.logError).toHaveBeenCalledWith('Error removing unused code:', expect.any(Error));
    });
  });

  describe('refactorWithLLM', () => {
    it('should refactor code using LLM', async () => {
      await refactoringTools.refactorWithLLM('Make code more readable');

      expect(mockOutputService.startOperation).toHaveBeenCalledWith('Processing code with LLM...');
      expect(mockSimplificationService.getEditorContent).toHaveBeenCalled();
      expect(mockLLMService.refactorCode).toHaveBeenCalledWith(
        'original code',
        'typescript',
        'Make code more readable'
      );
      expect(mockDiffService.showDiff).toHaveBeenCalledWith(
        mockEditor.document.uri,
        'original code',
        'llm refactored code',
        'LLM Refactoring',
        expect.any(String)
      );
      expect(mockOutputService.logSuccess).toHaveBeenCalledWith('Code successfully refactored');
    });

    it('should handle no active editor', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await refactoringTools.refactorWithLLM('Make code more readable');

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found');
      expect(mockLLMService.refactorCode).not.toHaveBeenCalled();
    });

    it('should handle errors in LLM refactoring', async () => {
      mockLLMService.refactorCode.mockRejectedValue(new Error('LLM error'));

      await refactoringTools.refactorWithLLM('Make code more readable');

      expect(mockOutputService.logError).toHaveBeenCalledWith('Error during LLM refactoring:', expect.any(Error));
    });
  });

  describe('showAndApplyChanges', () => {
    it('should apply changes if user confirms', async () => {
      // This is indirectly tested in the other tests
      // But we can test directly by accessing the private method
      await (refactoringTools as any).showAndApplyChanges(
        mockEditor.document.uri,
        'original code',
        'modified code',
        'Test',
        'Confirm?'
      );

      expect(mockDiffService.showDiff).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
      expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
      expect(vscode.window.showTextDocument).toHaveBeenCalled();
      expect(mockEditor.edit).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should dispose resources', () => {
      const spy = jest.spyOn(refactoringTools as any, 'dispose');

      refactoringTools.dispose();

      expect(spy).toHaveBeenCalled();
    });
  });
});
