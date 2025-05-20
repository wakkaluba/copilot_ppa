import * as vscode from 'vscode';

export interface ICodeAnalyzer {
    analyzeDocument(document: vscode.TextDocument): Promise<BestPracticeIssue[]>;
}

export interface BestPracticeIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'warning' | 'error';
    description: string;
    recommendation: string;
    category: 'antiPattern' | 'design' | 'consistency' | 'documentation' | 'naming';
    type?: string;
}

export class BestPracticesService implements vscode.Disposable {
    private readonly _context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    /**
     * Detects anti-patterns in code
     */
    public async detectAntiPatterns(document: vscode.TextDocument): Promise<BestPracticeIssue[]> {
        const issues: BestPracticeIssue[] = [];
        const fileExtension = document.uri.fsPath.toLowerCase();
        const text = document.getText();

        // Check for language-specific anti-patterns
        if (fileExtension.endsWith('.ts') || fileExtension.endsWith('.js')) {
            this.detectJavaScriptAntiPatterns(document, text, issues);
        } else if (fileExtension.endsWith('.py')) {
            this.detectPythonAntiPatterns(document, text, issues);
        } else if (fileExtension.endsWith('.java')) {
            this.detectJavaAntiPatterns(document, text, issues);
        }

        this.checkMethodLength(document, text, issues);
        this.checkParameterCount(document, text, issues);

        return issues;
    }

    /**
     * Suggests design improvements
     */
    public async suggestDesignImprovements(document: vscode.TextDocument): Promise<BestPracticeIssue[]> {
        const issues: BestPracticeIssue[] = [];
        const text = document.getText();
        this.checkComplexity(document, text, issues);
        this.checkNamingConventions(document, text, issues);
        return issues;
    }

    /**
     * Checks code consistency
     */
    public async checkCodeConsistency(document: vscode.TextDocument): Promise<BestPracticeIssue[]> {
        const issues: BestPracticeIssue[] = [];
        const text = document.getText();
        this.checkStyleConsistency(document, text, issues);
        this.checkCommentConsistency(document, text, issues);
        return issues;
    }

    private detectJavaScriptAntiPatterns(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        // Check for var usage
        this.findPatterns(document, text, /\bvar\s+/g, {
            severity: 'warning',
            description: 'Use of var keyword',
            recommendation: 'Use let or const instead of var',
            category: 'antiPattern'
        }, issues);
        // Check for console.log
        this.findPatterns(document, text, /console\.(log|debug|info)\(/g, {
            severity: 'warning',
            description: 'Console logging in production code',
            recommendation: 'Remove console logging or use a proper logging system',
            category: 'antiPattern'
        }, issues);
    }

    private detectPythonAntiPatterns(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        // Check for wildcard imports
        this.findPatterns(document, text, /from\s+\w+\s+import\s+\*/g, {
            severity: 'warning',
            description: 'Wildcard import usage',
            recommendation: 'Import specific names instead of using wildcard imports',
            category: 'antiPattern'
        }, issues);
    }

    private detectJavaAntiPatterns(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        // Check for raw exception catching
        this.findPatterns(document, text, /catch\s*\(\s*Exception\s+/g, {
            severity: 'warning',
            description: 'Catching raw Exception',
            recommendation: 'Catch specific exceptions instead of generic Exception',
            category: 'antiPattern'
        }, issues);
    }

    private checkMethodLength(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        const methodMatches = text.match(/(\b(function|class|def)\s+\w+|=>)\s*{[\s\S]*?}/g) || [];
        for (const method of methodMatches) {
            const lines = method.split('\n').length;
            if (lines > 30) {
                issues.push({
                    file: document.uri.fsPath,
                    line: text.indexOf(method),
                    column: 0,
                    severity: 'warning',
                    description: `Method is too long (${lines} lines)`,
                    recommendation: 'Break down into smaller methods',
                    category: 'design'
                });
            }
        }
    }

    private checkParameterCount(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        const paramMatches = text.match(/\([^)]*\)/g) || [];
        for (const params of paramMatches) {
            const count = params.split(',').length;
            if (count > 4) {
                issues.push({
                    file: document.uri.fsPath,
                    line: text.indexOf(params),
                    column: 0,
                    severity: 'suggestion',
                    description: `Too many parameters (${count})`,
                    recommendation: 'Use parameter object pattern',
                    category: 'design'
                });
            }
        }
    }

    private checkComplexity(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        // Check nesting depth
        const maxDepth = this.findMaxNestingDepth(text);
        if (maxDepth > 3) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'warning',
                description: `High nesting depth (${maxDepth} levels)`,
                recommendation: 'Reduce nesting by extracting methods',
                category: 'design'
            });
        }
    }

    private checkNamingConventions(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        // Mix of camelCase and snake_case
        const camelCase = text.match(/[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/g) || [];
        const snakeCase = text.match(/[a-z][a-z0-9]*_[a-z0-9_]*/g) || [];
        if (camelCase.length > 0 && snakeCase.length > 0) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: 'Mixed naming conventions',
                recommendation: 'Standardize on either camelCase or snake_case',
                category: 'consistency'
            });
        }
    }

    private checkStyleConsistency(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        // Check quote style consistency
        const singleQuotes = (text.match(/'/g) || []).length;
        const doubleQuotes = (text.match(/"/g) || []).length;
        if (singleQuotes > 0 && doubleQuotes > 0) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: 'Inconsistent quote style',
                recommendation: 'Standardize on single or double quotes',
                category: 'consistency'
            });
        }
    }

    private checkCommentConsistency(document: vscode.TextDocument, text: string, issues: BestPracticeIssue[]): void {
        // Check JSDoc style consistency
        const jsdocStyle = text.match(/\/\*\*[\s\S]*?\*\//g) || [];
        const lineComments = text.match(/\/\/.*$/mg) || [];
        if (jsdocStyle.length > 0 && lineComments.length > jsdocStyle.length * 2) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: 'Inconsistent comment style',
                recommendation: 'Use JSDoc for documentation comments',
                category: 'documentation'
            });
        }
    }

    private findPatterns(
        document: vscode.TextDocument,
        text: string,
        pattern: RegExp,
        issueTemplate: {
            severity: BestPracticeIssue['severity'],
            description: string,
            recommendation: string,
            category: BestPracticeIssue['category']
        },
        issues: BestPracticeIssue[]
    ): void {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
            const pos = document.positionAt(match.index);
            issues.push({
                file: document.uri.fsPath,
                line: pos.line + 1,
                column: pos.character + 1,
                ...issueTemplate
            });
        }
    }

    private findMaxNestingDepth(text: string): number {
        let maxDepth = 0;
        let currentDepth = 0;
        let inString = false;
        let stringChar = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // Handle strings
            if ((char === '"' || char === "'") && text[i-1] !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
                continue;
            }
            if (!inString) {
                if (char === '{') {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                } else if (char === '}') {
                    currentDepth--;
                }
            }
        }
        return maxDepth;
    }

    public dispose(): void {
        // Clean up any resources
    }
}
