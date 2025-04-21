import * as vscode from 'vscode';
import { CodeSimplificationService } from './services/CodeSimplificationService';
import { UnusedCodeAnalyzerService } from './services/UnusedCodeAnalyzerService';
import { CodeDiffService } from './services/CodeDiffService';
import { RefactoringOutputService } from './services/RefactoringOutputService';
import { LLMRefactoringService } from './services/LLMRefactoringService';

/**
 * Provides tools for code refactoring
 */
export class RefactoringTools {
    private readonly simplificationService: CodeSimplificationService;
    private readonly unusedCodeAnalyzer: UnusedCodeAnalyzerService;
    private readonly diffService: CodeDiffService;
    private readonly outputService: RefactoringOutputService;
    private readonly llmService: LLMRefactoringService;
    
    constructor() {
        this.outputService = new RefactoringOutputService();
        this.llmService = new LLMRefactoringService();
        this.simplificationService = new CodeSimplificationService(this.llmService);
        this.unusedCodeAnalyzer = new UnusedCodeAnalyzerService(this.llmService);
        this.diffService = new CodeDiffService();
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
    
    private async showAndApplyChanges(
        uri: vscode.Uri,
        originalCode: string,
        newCode: string,
        title: string,
        prompt: string
    ): Promise<void> {
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
        this.outputService.dispose();
        this.diffService.dispose();
    }
}
