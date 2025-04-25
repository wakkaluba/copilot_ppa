import * as vscode from 'vscode';
import * as path from 'path';
import { JavaScriptComplexityService } from './services/JavaScriptComplexityService';
import { PythonComplexityService } from './services/PythonComplexityService';
import { ComplexityReportService } from './services/ComplexityReportService';

export interface CodeMetrics {
    cyclomaticComplexity: number;
    nestingDepth: number;
    maintainabilityIndex: number;
    linesOfCode: number;
    commentDensity?: number;
}

export interface FunctionAnalysis {
    name: string;
    complexity: number;
    nestingDepth: number;
    linesOfCode: number;
    maintainabilityIndex: number;
    grade: string;
}

/**
 * Analyzes code complexity using various tools
 */
export class ComplexityAnalyzer {
    private jsService: JavaScriptComplexityService;
    private pyService: PythonComplexityService;
    private reportService: ComplexityReportService;
    private outputChannel: vscode.OutputChannel;

    constructor(private context: vscode.ExtensionContext) {
        this.jsService = new JavaScriptComplexityService();
        this.pyService = new PythonComplexityService();
        this.reportService = new ComplexityReportService();
    }

    public async initialize(): Promise<void> {
        this.outputChannel = vscode.window.createOutputChannel('Code Complexity');
        this.outputChannel.clear();
        this.outputChannel.show();
    }

    /**
     * Analyze the complexity of the current file
     */
    public async analyzeFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const filePath = document.uri.fsPath;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('File must be part of a workspace');
            return;
        }
        await document.save();
        const ext = path.extname(filePath);
        let reportData;
        if (/\.jsx?$|\.tsx?$/.test(ext)) {
            reportData = await this.jsService.analyze(filePath, workspaceFolder);
        } else if (/\.py$/.test(ext)) {
            reportData = await this.pyService.analyze(filePath, workspaceFolder);
        } else {
            vscode.window.showInformationMessage(`No complexity analyzer configured for ${ext} files`);
            return;
        }
        const html = this.reportService.renderReport(filePath, reportData);
        const panel = vscode.window.createWebviewPanel('complexityReport', `Complexity: ${path.basename(filePath)}`, vscode.ViewColumn.Beside, { enableScripts: true });
        panel.webview.html = html;
    }

    /**
     * Calculates cyclomatic complexity for code
     * @param code The source code to analyze
     */
    public calculateCyclomaticComplexity(code: string): number {
        // Basic implementation - counting decision points
        let complexity = 1; // Base complexity
        
        const patterns = [
            /\bif\s*\(/g,
            /\belse\s+if\s*\(/g,
            /\bwhile\s*\(/g,
            /\bdo\s*\{/g,
            /\bfor\s*\(/g,
            /\bcase\s+[^:]+:/g,
            /\bcatch\s*\(/g,
            /\breturn\s+.+\?/g, // Ternary operators
            /\&\&|\|\|/g // Logical operators
        ];

        for (const pattern of patterns) {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }

        return complexity;
    }

    /**
     * Calculates maximum nesting depth in code
     * @param code The source code to analyze
     */
    public calculateNestingDepth(code: string): number {
        const lines = code.split('\n');
        let currentDepth = 0;
        let maxDepth = 0;
        
        // Simple implementation - count indentation
        for (const line of lines) {
            if (/[{(\[]/.test(line)) {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            if (/[})\]]/.test(line)) {
                currentDepth = Math.max(0, currentDepth - 1); // Prevent negative numbers
            }
        }
        
        return maxDepth;
    }

    /**
     * Analyzes a specific function in the code
     * @param code The source code to analyze
     * @param functionName The name of the function to analyze
     */
    public analyzeFunction(code: string, functionName: string): FunctionAnalysis {
        // Simple implementation - extract function and apply metrics
        const functionRegex = new RegExp(`(?:function|class|const|let|var)\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`, 'g');
        const methodRegex = new RegExp(`${functionName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`, 'g');
        
        const functionMatch = functionRegex.exec(code) || methodRegex.exec(code);
        const functionCode = functionMatch ? functionMatch[0] : code;
        
        const complexity = this.calculateCyclomaticComplexity(functionCode);
        const nestingDepth = this.calculateNestingDepth(functionCode);
        const linesOfCode = functionCode.split('\n').length;
        const maintainabilityIndex = this.calculateMaintainabilityIndex(functionCode);
        
        return {
            name: functionName,
            complexity,
            nestingDepth,
            linesOfCode,
            maintainabilityIndex,
            grade: this.getComplexityGrade(complexity)
        };
    }

    /**
     * Analyzes multiple metrics for the code
     * @param code The source code to analyze
     */
    public analyzeMetrics(code: string): CodeMetrics {
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
        const nestingDepth = this.calculateNestingDepth(code);
        const linesOfCode = code.split('\n').length;
        const maintainabilityIndex = this.calculateMaintainabilityIndex(code);
        
        // Calculate comment density
        const commentLines = (code.match(/\/\/.*$|\/\*[\s\S]*?\*\//gm) || []).length;
        const commentDensity = linesOfCode ? (commentLines / linesOfCode) * 100 : 0;
        
        return {
            cyclomaticComplexity,
            nestingDepth,
            maintainabilityIndex,
            linesOfCode,
            commentDensity
        };
    }

    /**
     * Calculates a maintainability index (0-100 scale)
     * Using the Microsoft formula: MI = MAX(0, (171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)) * 100 / 171)
     * Simplified for this implementation
     * @param code The source code to analyze
     */
    public calculateMaintainabilityIndex(code: string): number {
        const complexity = this.calculateCyclomaticComplexity(code);
        const linesOfCode = code.split('\n').length;
        
        // Simplified approximation of the maintainability index
        let mi = 100 - (complexity * 0.25) - (Math.log(linesOfCode) * 15);
        
        // Adjust for very complex or very large files
        if (complexity > 30) {
            mi -= (complexity - 30) * 0.5;
        }
        
        if (linesOfCode > 1000) {
            mi -= (linesOfCode - 1000) * 0.01;
        }
        
        // Ensure the result is between 0 and 100
        return Math.max(0, Math.min(100, mi));
    }

    /**
     * Returns a grade (A-F) based on cyclomatic complexity
     * @param complexity The cyclomatic complexity value
     */
    public getComplexityGrade(complexity: number): string {
        if (complexity <= 5) return 'A';
        if (complexity <= 10) return 'B';
        if (complexity <= 20) return 'C';
        if (complexity <= 30) return 'D';
        return 'E';
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.outputChannel?.dispose();
        this.reportService.dispose();
    }
}
