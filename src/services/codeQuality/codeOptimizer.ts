import * as vscode from 'vscode';
import * as path from 'path';

export interface OptimizationIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'minor' | 'major' | 'critical';
    description: string;
    recommendation: string;
    category: 'performance' | 'memory' | 'complexity' | 'other';
}

export class CodeOptimizer {
    private _context: vscode.ExtensionContext;
    private _diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('optimization-issues');
        context.subscriptions.push(this._diagnosticCollection);
    }

    /**
     * Analyzes a file for performance bottlenecks
     */
    public async analyzePerformance(document: vscode.TextDocument): Promise<OptimizationIssue[]> {
        const issues: OptimizationIssue[] = [];
        const text = document.getText();
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        
        // Analyze based on file type
        if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
            this.analyzeJavaScriptPerformance(text, document, issues);
        } else if (['.py'].includes(fileExtension)) {
            this.analyzePythonPerformance(text, document, issues);
        } else if (['.java'].includes(fileExtension)) {
            this.analyzeJavaPerformance(text, document, issues);
        }
        
        // Update diagnostics
        this.updateDiagnostics(document, issues);
        
        return issues;
    }

    /**
     * Analyzes memory usage optimization opportunities
     */
    public async analyzeMemoryUsage(document: vscode.TextDocument): Promise<OptimizationIssue[]> {
        const issues: OptimizationIssue[] = [];
        const text = document.getText();
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        
        // Analyze based on file type
        if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
            this.analyzeJavaScriptMemory(text, document, issues);
        } else if (['.py'].includes(fileExtension)) {
            this.analyzePythonMemory(text, document, issues);
        } else if (['.java'].includes(fileExtension)) {
            this.analyzeJavaMemory(text, document, issues);
        }
        
        return issues;
    }

    /**
     * Analyzes runtime complexity
     */
    public analyzeRuntimeComplexity(document: vscode.TextDocument): OptimizationIssue[] {
        const issues: OptimizationIssue[] = [];
        const text = document.getText();
        
        // Check for nested loops (potential O(n²) complexity)
        this.findNestedLoops(document, issues);
        
        // Check for recursive functions without base cases
        this.findPotentiallyUnboundedRecursion(document, issues);
        
        return issues;
    }
    
    private analyzeJavaScriptPerformance(text: string, document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        // Check for excessive DOM operations
        this.findPatternInDocument(document, /(document\.getElement|querySelector).*\n.*\s*for\s*\(/g, {
            severity: 'major',
            description: 'DOM operations inside loops can cause performance issues',
            recommendation: 'Cache DOM elements outside of loops',
            category: 'performance'
        }, issues);
        
        // Check for array methods that could be optimized
        this.findPatternInDocument(document, /\.filter\(.*\)\.map\(/g, {
            severity: 'minor',
            description: 'Chained array methods may cause unnecessary iterations',
            recommendation: 'Consider using a single .reduce() call or combining the operations',
            category: 'performance'
        }, issues);
        
        // Check for console.log in production code
        this.findPatternInDocument(document, /console\.log\(/g, {
            severity: 'suggestion',
            description: 'console.log statements in production code can impact performance',
            recommendation: 'Remove or disable console.log statements in production builds',
            category: 'performance'
        }, issues);
    }
    
    private analyzeJavaScriptMemory(text: string, document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        // Check for potential memory leaks in event listeners
        this.findPatternInDocument(document, /addEventListener\(/g, {
            severity: 'minor',
            description: 'Potential memory leak with event listeners',
            recommendation: 'Ensure event listeners are properly removed when components are destroyed',
            category: 'memory'
        }, issues);
        
        // Check for large object literals
        const matches = text.match(/\{(?:[^{}]|(\{(?:[^{}]|(\{[^{}]*\}))*\}))*\}/g) || [];
        for (const match of matches) {
            if (match.length > 500) { // Arbitrary threshold for demonstration
                const position = document.positionAt(text.indexOf(match));
                issues.push({
                    file: document.uri.fsPath,
                    line: position.line + 1,
                    column: position.character + 1,
                    severity: 'minor',
                    description: 'Large object literal may consume excessive memory',
                    recommendation: 'Consider breaking down large objects or using more efficient data structures',
                    category: 'memory'
                });
            }
        }
    }
    
    private analyzePythonPerformance(text: string, document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        // Check for inefficient list comprehensions
        this.findPatternInDocument(document, /\[.*for.*in.*if.*\]/g, {
            severity: 'minor',
            description: 'Complex list comprehension may be inefficient',
            recommendation: 'Consider using generator expressions for large datasets',
            category: 'performance'
        }, issues);
        
        // Check for repeated string concatenation
        this.findPatternInDocument(document, /(\w+\s*\+=\s*[\"\'])/g, {
            severity: 'minor',
            description: 'Repeated string concatenation in Python is inefficient',
            recommendation: 'Use string.join() or f-strings for building strings',
            category: 'performance'
        }, issues);
    }
    
    private analyzePythonMemory(text: string, document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        // Check for large list comprehensions
        this.findPatternInDocument(document, /\[.*for.*in.*range\([\d]+\)/g, {
            severity: 'minor',
            description: 'Large list comprehension may consume excessive memory',
            recommendation: 'Consider using generator expressions with "(" instead of "[" for large ranges',
            category: 'memory'
        }, issues);
    }
    
    private analyzeJavaPerformance(text: string, document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        // Check for string concatenation in loops
        this.findPatternInDocument(document, /for\s*\(.*\)\s*\{[^}]*\+\=\s*\"/g, {
            severity: 'major',
            description: 'String concatenation in loops is inefficient in Java',
            recommendation: 'Use StringBuilder for string concatenation in loops',
            category: 'performance'
        }, issues);
        
        // Check for excessive object creation in loops
        this.findPatternInDocument(document, /for\s*\(.*\)\s*\{[^}]*new\s+[A-Z]/g, {
            severity: 'minor',
            description: 'Object creation inside loops may affect performance',
            recommendation: 'Consider moving object creation outside of loops when possible',
            category: 'performance'
        }, issues);
    }
    
    private analyzeJavaMemory(text: string, document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        // Check for potential memory leaks
        this.findPatternInDocument(document, /static\s+(ArrayList|HashMap|List|Map|Set)/g, {
            severity: 'major',
            description: 'Static collections can lead to memory leaks',
            recommendation: 'Be cautious with static collections, ensure proper cleanup',
            category: 'memory'
        }, issues);
    }
    
    private findNestedLoops(document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        const text = document.getText();
        
        // Simple regex to find nested loops (not perfect but indicative)
        const nestedLoopRegex = /for\s*\([^{]*\)\s*\{[^{}]*for\s*\(/g;
        this.findPatternInDocument(document, nestedLoopRegex, {
            severity: 'major',
            description: 'Nested loops detected (possible O(n²) time complexity)',
            recommendation: 'Consider if this algorithm can be optimized to avoid nested iteration',
            category: 'complexity'
        }, issues);
    }
    
    private findPotentiallyUnboundedRecursion(document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        const text = document.getText();
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        
        // This is a simplified check and would need more sophisticated analysis in a real tool
        if (['.js', '.ts'].includes(fileExtension)) {
            // Find function declarations
            const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\1\s*\(/g;
            let match;
            while ((match = functionRegex.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    file: document.uri.fsPath,
                    line: position.line + 1,
                    column: position.character + 1,
                    severity: 'major',
                    description: `Potential unbounded recursion in function ${match[1]}`,
                    recommendation: 'Ensure recursive functions have proper base cases and termination conditions',
                    category: 'complexity'
                });
            }
        }
    }
    
    private findPatternInDocument(
        document: vscode.TextDocument, 
        pattern: RegExp, 
        issueTemplate: {
            severity: OptimizationIssue['severity'], 
            description: string, 
            recommendation: string,
            category: OptimizationIssue['category']
        },
        issues: OptimizationIssue[]
    ): void {
        const text = document.getText();
        let match: RegExpExecArray | null;
        
        while ((match = pattern.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                file: document.uri.fsPath,
                line: position.line + 1,
                column: position.character + 1,
                severity: issueTemplate.severity,
                description: issueTemplate.description,
                recommendation: issueTemplate.recommendation,
                category: issueTemplate.category
            });
        }
    }
    
    private updateDiagnostics(document: vscode.TextDocument, issues: OptimizationIssue[]): void {
        const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
            const range = new vscode.Range(
                issue.line - 1, issue.column - 1,
                issue.line - 1, issue.column + 20
            );
            
            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.description}\n${issue.recommendation}`,
                this.mapSeverityToDiagnosticSeverity(issue.severity)
            );
            
            diagnostic.source = 'Code Optimizer';
            return diagnostic;
        });
        
        this._diagnosticCollection.set(document.uri, diagnostics);
    }
    
    private mapSeverityToDiagnosticSeverity(severity: OptimizationIssue['severity']): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical': return vscode.DiagnosticSeverity.Error;
            case 'major': return vscode.DiagnosticSeverity.Warning;
            case 'minor': return vscode.DiagnosticSeverity.Information;
            case 'suggestion': return vscode.DiagnosticSeverity.Hint;
        }
    }
}
