import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Handles integration with various code linters
 */
export class LinterIntegration {
    private outputChannel: vscode.OutputChannel;
    private diagnosticCollection: vscode.DiagnosticCollection;
    
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Linter');
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('llm-agent-linter');
    }

    /**
     * Initialize the linter integration
     */
    public async initialize(): Promise<void> {
        // Initialization logic
    }

    /**
     * Run appropriate linter for the current file
     */
    public async runLinter(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const filePath = document.uri.fsPath;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

        if (!workspaceFolder) {
            vscode.window.showWarningMessage('File must be part of a workspace');
            return;
        }

        // Save document first
        await document.save();
        
        // Determine linter type based on file extension
        const fileExt = path.extname(filePath);
        
        switch (fileExt) {
            case '.js':
            case '.ts':
            case '.jsx':
            case '.tsx':
                await this.runESLint(filePath, workspaceFolder.uri.fsPath);
                break;
            case '.py':
                await this.runPylint(filePath, workspaceFolder.uri.fsPath);
                break;
            default:
                vscode.window.showInformationMessage(`No linter configured for ${fileExt} files`);
                break;
        }
    }

    /**
     * Run ESLint on a JavaScript/TypeScript file
     */
    private async runESLint(filePath: string, workspacePath: string): Promise<void> {
        try {
            const eslintPath = path.join(workspacePath, 'node_modules', '.bin', 'eslint');
            
            if (!fs.existsSync(eslintPath)) {
                vscode.window.showWarningMessage('ESLint not found in node_modules. Please install it first.');
                return;
            }

            this.outputChannel.clear();
            this.outputChannel.show();
            this.outputChannel.appendLine('Running ESLint...');

            const result = cp.execSync(`"${eslintPath}" "${filePath}" --format json`, { cwd: workspacePath }).toString();
            
            this.parseLintResults(filePath, result, 'eslint');
            this.outputChannel.appendLine('ESLint completed');
        } catch (error) {
            this.outputChannel.appendLine(`Error running ESLint: ${error}`);
            vscode.window.showErrorMessage(`Failed to run ESLint: ${error}`);
        }
    }

    /**
     * Run Pylint on a Python file
     */
    private async runPylint(filePath: string, workspacePath: string): Promise<void> {
        try {
            this.outputChannel.clear();
            this.outputChannel.show();
            this.outputChannel.appendLine('Running Pylint...');

            const result = cp.execSync(`pylint "${filePath}" --output-format=json`, { cwd: workspacePath }).toString();
            
            this.parseLintResults(filePath, result, 'pylint');
            this.outputChannel.appendLine('Pylint completed');
        } catch (error) {
            this.outputChannel.appendLine(`Error running Pylint: ${error}`);
            vscode.window.showErrorMessage(`Failed to run Pylint: ${error}`);
        }
    }

    /**
     * Parse lint results and convert to VS Code diagnostics
     */
    private parseLintResults(filePath: string, results: string, linterType: 'eslint' | 'pylint'): void {
        try {
            const diagnostics: vscode.Diagnostic[] = [];
            const fileUri = vscode.Uri.file(filePath);
            
            if (linterType === 'eslint') {
                const eslintResults = JSON.parse(results);
                
                for (const result of eslintResults) {
                    if (result.messages && result.messages.length > 0) {
                        for (const msg of result.messages) {
                            const range = new vscode.Range(
                                msg.line - 1, msg.column - 1,
                                msg.endLine ? msg.endLine - 1 : msg.line - 1, 
                                msg.endColumn ? msg.endColumn - 1 : msg.column
                            );
                            
                            const severity = this.mapESLintSeverity(msg.severity);
                            const diagnostic = new vscode.Diagnostic(range, msg.message, severity);
                            diagnostic.source = 'eslint';
                            diagnostic.code = msg.ruleId;
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            } else if (linterType === 'pylint') {
                const pylintResults = JSON.parse(results);
                
                for (const msg of pylintResults) {
                    const range = new vscode.Range(
                        msg.line - 1, msg.column, 
                        msg.line - 1, msg.column + 1
                    );
                    
                    const severity = this.mapPylintSeverity(msg.type);
                    const diagnostic = new vscode.Diagnostic(range, msg.message, severity);
                    diagnostic.source = 'pylint';
                    diagnostic.code = msg.symbol;
                    diagnostics.push(diagnostic);
                }
            }
            
            this.diagnosticCollection.set(fileUri, diagnostics);
            
            if (diagnostics.length === 0) {
                this.outputChannel.appendLine('No issues found');
            } else {
                this.outputChannel.appendLine(`Found ${diagnostics.length} issues`);
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error parsing lint results: ${error}`);
        }
    }

    /**
     * Map ESLint severity to VS Code DiagnosticSeverity
     */
    private mapESLintSeverity(severity: number): vscode.DiagnosticSeverity {
        switch (severity) {
            case 2: return vscode.DiagnosticSeverity.Error;
            case 1: return vscode.DiagnosticSeverity.Warning;
            default: return vscode.DiagnosticSeverity.Information;
        }
    }

    /**
     * Map Pylint severity to VS Code DiagnosticSeverity
     */
    private mapPylintSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'convention': return vscode.DiagnosticSeverity.Information;
            case 'refactor': return vscode.DiagnosticSeverity.Hint;
            default: return vscode.DiagnosticSeverity.Information;
        }
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.outputChannel.dispose();
        this.diagnosticCollection.dispose();
    }
}
