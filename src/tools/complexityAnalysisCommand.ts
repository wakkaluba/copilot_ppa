import * as vscode from 'vscode';
import { CodeComplexityAnalyzer } from './codeComplexityAnalyzer';
import * as path from 'path';

export class ComplexityAnalysisCommand {
    private readonly complexityAnalyzer: CodeComplexityAnalyzer;
    private decorationDisposables: vscode.Disposable[] = [];
    
    constructor() {
        this.complexityAnalyzer = new CodeComplexityAnalyzer();
    }
    
    /**
     * Register all complexity analysis commands
     * @returns Disposable for the commands
     */
    public register(): vscode.Disposable {
        const subscriptions: vscode.Disposable[] = [];
        
        // Register commands
        subscriptions.push(vscode.commands.registerCommand(
            'vscodeLocalLLMAgent.analyzeFileComplexity',
            this.analyzeCurrentFile.bind(this)
        ));
        
        subscriptions.push(vscode.commands.registerCommand(
            'vscodeLocalLLMAgent.analyzeWorkspaceComplexity',
            this.analyzeWorkspace.bind(this)
        ));
        
        subscriptions.push(vscode.commands.registerCommand(
            'vscodeLocalLLMAgent.toggleComplexityVisualization',
            this.toggleComplexityVisualization.bind(this)
        ));
        
        // Watch for editor changes to update decorations
        subscriptions.push(vscode.window.onDidChangeActiveTextEditor(
            this.handleEditorChange.bind(this)
        ));
        
        return vscode.Disposable.from(...subscriptions);
    }
    
    /**
     * Analyze complexity of the current file in the editor
     */
    private async analyzeCurrentFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze.');
            return;
        }
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing file complexity...',
            cancellable: false
        }, async () => {
            const filePath = editor.document.uri.fsPath;
            const result = await this.complexityAnalyzer.analyzeFile(filePath);
            
            if (result) {
                // Show report
                const fileName = path.basename(filePath);
                const report = `# Complexity Analysis: ${fileName}\n\n` +
                    `- **Average complexity**: ${result.averageComplexity.toFixed(2)}\n` +
                    `- **Total functions**: ${result.functions.length}\n\n` +
                    this.generateFunctionsTable(result);
                
                const doc = await vscode.workspace.openTextDocument({
                    content: report,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
                
                // Apply decorations
                this.clearDecorations();
                this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
            } else {
                vscode.window.showInformationMessage('File type not supported for complexity analysis.');
            }
        });
    }
    
    /**
     * Analyze complexity of the entire workspace
     */
    private async analyzeWorkspace(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder open.');
            return;
        }
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing workspace complexity...',
            cancellable: false
        }, async (progress) => {
            try {
                // If multiple folders, let user pick one
                let folder: vscode.WorkspaceFolder;
                if (workspaceFolders.length === 1) {
                    folder = workspaceFolders[0];
                } else {
                    const selected = await vscode.window.showQuickPick(
                        workspaceFolders.map(folder => ({
                            label: folder.name,
                            folder
                        })),
                        { placeHolder: 'Select workspace folder to analyze' }
                    );
                    if (!selected) {
                        return; // User cancelled
                    }
                    folder = selected.folder;
                }
                
                progress.report({ message: `Analyzing files in ${folder.name}...` });
                const results = await this.complexityAnalyzer.analyzeWorkspace(folder);
                
                if (results.length === 0) {
                    vscode.window.showInformationMessage('No files found for complexity analysis.');
                    return;
                }
                
                const report = this.complexityAnalyzer.generateComplexityReport(results);
                
                const doc = await vscode.workspace.openTextDocument({
                    content: report,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc);
                
                vscode.window.showInformationMessage(`Complexity analysis completed for ${results.length} files.`);
            } catch (error) {
                console.error('Error analyzing workspace:', error);
                vscode.window.showErrorMessage(`Error analyzing workspace: ${error.message}`);
            }
        });
    }
    
    /**
     * Toggle complexity visualization in the editor
     */
    private async toggleComplexityVisualization(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor.');
            return;
        }
        
        if (this.decorationDisposables.length > 0) {
            // Decorations are active, remove them
            this.clearDecorations();
            vscode.window.showInformationMessage('Complexity visualization disabled.');
        } else {
            // No decorations, analyze and show
            const filePath = editor.document.uri.fsPath;
            const result = await this.complexityAnalyzer.analyzeFile(filePath);
            
            if (result) {
                this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
                vscode.window.showInformationMessage('Complexity visualization enabled.');
            } else {
                vscode.window.showInformationMessage('File type not supported for complexity analysis.');
            }
        }
    }
    
    /**
     * Handle editor change event to update decorations
     */
    private async handleEditorChange(editor?: vscode.TextEditor): Promise<void> {
        // Clear existing decorations
        this.clearDecorations();
        
        // If decorations were active and we have a new editor, reapply
        if (editor && this.decorationDisposables.length > 0) {
            const filePath = editor.document.uri.fsPath;
            const result = await this.complexityAnalyzer.analyzeFile(filePath);
            
            if (result) {
                this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
            }
        }
    }
    
    /**
     * Clear all active decorations
     */
    private clearDecorations(): void {
        while (this.decorationDisposables.length > 0) {
            const disposable = this.decorationDisposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    
    /**
     * Generate a markdown table of functions sorted by complexity
     */
    private generateFunctionsTable(result: any): string {
        let table = '## Functions by Complexity\n\n';
        
        if (result.functions.length === 0) {
            return table + '*No functions found to analyze.*\n\n';
        }
        
        table += '| Function | Complexity | Lines |\n';
        table += '|----------|------------|-------|\n';
        
        result.functions
            .sort((a: any, b: any) => b.complexity - a.complexity)
            .forEach((fn: any) => {
                let complexityIndicator = '';
                if (fn.complexity > 15) {
                    complexityIndicator = '🔴 '; // High complexity
                } else if (fn.complexity > 10) {
                    complexityIndicator = '🟠 '; // Medium complexity
                } else {
                    complexityIndicator = '🟢 '; // Low complexity
                }
                
                table += `| ${fn.name} | ${complexityIndicator}${fn.complexity} | ${fn.startLine}-${fn.endLine} |\n`;
            });
        
        return table;
    }
}
