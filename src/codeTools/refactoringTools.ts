import * as vscode from 'vscode';
import { CodeSimplificationService } from './services/CodeSimplificationService';
import { UnusedCodeAnalyzerService } from './services/UnusedCodeAnalyzerService';
import { CodeDiffService } from './services/CodeDiffService';
import { RefactoringOutputService } from './services/RefactoringOutputService';
import { LLMRefactoringService } from './services/LLMRefactoringService';
import { EventEmitter } from '../common/eventEmitter';

/**
 * Provides refactoring tools for code improvements
 */
export class RefactoringTools extends EventEmitter {
    private simplificationService: CodeSimplificationService;
    private unusedCodeAnalyzer: UnusedCodeAnalyzerService;
    private diffService: CodeDiffService;
    private outputService: RefactoringOutputService;
    private llmService: LLMRefactoringService;

    constructor() {
        super();
        this.simplificationService = new CodeSimplificationService();
        this.unusedCodeAnalyzer = new UnusedCodeAnalyzerService();
        this.diffService = new CodeDiffService();
        this.outputService = new RefactoringOutputService();
        this.llmService = new LLMRefactoringService();
    }

    /**
     * Initialize the refactoring tools
     */
    public async initialize(): Promise<void> {
        await Promise.all([
            this.simplificationService.initialize(),
            this.unusedCodeAnalyzer.initialize(),
            this.llmService.initialize()
        ]);
    }

    /**
     * Simplify code in the current editor
     */
    public async simplifyCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        try {
            this.outputService.startOperation('Analyzing code for simplification...');
            
            const { text, selection } = await this.simplificationService.getEditorContent(editor);
            const simplifiedCode = await this.simplificationService.simplifyCode(text, editor.document.languageId);
            
            await this.showAndApplyChanges(
                editor.document.uri,
                text,
                simplifiedCode,
                selection.isEmpty ? "Entire File" : "Selected Code",
                'Apply the simplified code?'
            );

            this.outputService.logSuccess('Code successfully simplified');
        } catch (error) {
            this.outputService.logError('Error simplifying code:', error);
        }
    }
    
    /**
     * Remove unused code (dead code) in the current editor
     */
    public async removeUnusedCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        try {
            this.outputService.startOperation('Analyzing code to detect unused elements...');
            
            const cleanedCode = await this.unusedCodeAnalyzer.removeUnusedCode(
                editor.document.getText(),
                editor.document.languageId
            );
            
            await this.showAndApplyChanges(
                editor.document.uri,
                editor.document.getText(),
                cleanedCode,
                "Entire File (Unused Code Removed)",
                'Apply the code with unused elements removed?'
            );

            this.outputService.logSuccess('Unused code successfully removed');
        } catch (error) {
            this.outputService.logError('Error removing unused code:', error);
        }
    }
    
    /**
     * Refactor code using LLM in the current editor
     * @param instructions Instructions for the refactoring
     */
    public async refactorWithLLM(instructions: string): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        try {
            this.outputService.startOperation('Processing code with LLM...');
            
            const { text, selection } = await this.simplificationService.getEditorContent(editor);
            const refactoredCode = await this.llmService.refactorCode(
                text,
                editor.document.languageId,
                instructions
            );
            
            await this.showAndApplyChanges(
                editor.document.uri,
                text,
                refactoredCode,
                "LLM Refactoring",
                'Apply the LLM refactored code?'
            );

            this.outputService.logSuccess('Code successfully refactored');
        } catch (error) {
            this.outputService.logError('Error during LLM refactoring:', error);
        }
    }
    
    /**
     * Show diff and apply changes if user confirms
     * @param uri Document URI
     * @param originalCode Original code
     * @param newCode New code
     * @param title Diff title
     * @param prompt Confirmation prompt
     */
    private async showAndApplyChanges(
        uri: vscode.Uri,
        originalCode: string,
        newCode: string,
        title: string,
        prompt: string
    ): Promise<void> {
        if (originalCode === newCode) {
            this.outputService.logSuccess('No changes needed, code is already optimized');
            return;
        }
        
        await this.diffService.showDiff(uri, originalCode, newCode, title);
        
        const shouldReplace = await vscode.window.showInformationMessage(prompt, 'Replace', 'Cancel');
        if (shouldReplace === 'Replace') {
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document);
            await editor.edit(editBuilder => {
                const range = new vscode.Range(0, 0, document.lineCount, 0);
                editBuilder.replace(range, newCode);
            });
        }
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        super.dispose(); // Call base class dispose to clean up event listeners
    }
}
