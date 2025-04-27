"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinterIntegration = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Handles integration with various code linters
 */
class LinterIntegration {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Linter');
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('llm-agent-linter');
    }
    /**
     * Initialize the linter integration
     */
    async initialize() {
        // Initialization logic
    }
    /**
     * Run appropriate linter for the current file
     */
    async runLinter() {
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
    async runESLint(filePath, workspacePath) {
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
        }
        catch (error) {
            this.outputChannel.appendLine(`Error running ESLint: ${error}`);
            vscode.window.showErrorMessage(`Failed to run ESLint: ${error}`);
        }
    }
    /**
     * Run Pylint on a Python file
     */
    async runPylint(filePath, workspacePath) {
        try {
            this.outputChannel.clear();
            this.outputChannel.show();
            this.outputChannel.appendLine('Running Pylint...');
            const result = cp.execSync(`pylint "${filePath}" --output-format=json`, { cwd: workspacePath }).toString();
            this.parseLintResults(filePath, result, 'pylint');
            this.outputChannel.appendLine('Pylint completed');
        }
        catch (error) {
            this.outputChannel.appendLine(`Error running Pylint: ${error}`);
            vscode.window.showErrorMessage(`Failed to run Pylint: ${error}`);
        }
    }
    /**
     * Parse lint results and convert to VS Code diagnostics
     */
    parseLintResults(filePath, results, linterType) {
        try {
            const diagnostics = [];
            const fileUri = vscode.Uri.file(filePath);
            if (linterType === 'eslint') {
                const eslintResults = JSON.parse(results);
                for (const result of eslintResults) {
                    if (result.messages && result.messages.length > 0) {
                        for (const msg of result.messages) {
                            const range = new vscode.Range(msg.line - 1, msg.column - 1, msg.endLine ? msg.endLine - 1 : msg.line - 1, msg.endColumn ? msg.endColumn - 1 : msg.column);
                            const severity = this.mapESLintSeverity(msg.severity);
                            const diagnostic = new vscode.Diagnostic(range, msg.message, severity);
                            diagnostic.source = 'eslint';
                            diagnostic.code = msg.ruleId;
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            }
            else if (linterType === 'pylint') {
                const pylintResults = JSON.parse(results);
                for (const msg of pylintResults) {
                    const range = new vscode.Range(msg.line - 1, msg.column, msg.line - 1, msg.column + 1);
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
            }
            else {
                this.outputChannel.appendLine(`Found ${diagnostics.length} issues`);
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error parsing lint results: ${error}`);
        }
    }
    /**
     * Map ESLint severity to VS Code DiagnosticSeverity
     */
    mapESLintSeverity(severity) {
        switch (severity) {
            case 2: return vscode.DiagnosticSeverity.Error;
            case 1: return vscode.DiagnosticSeverity.Warning;
            default: return vscode.DiagnosticSeverity.Information;
        }
    }
    /**
     * Map Pylint severity to VS Code DiagnosticSeverity
     */
    mapPylintSeverity(severity) {
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
    dispose() {
        this.outputChannel.dispose();
        this.diagnosticCollection.dispose();
    }
}
exports.LinterIntegration = LinterIntegration;
//# sourceMappingURL=linterIntegration.js.map