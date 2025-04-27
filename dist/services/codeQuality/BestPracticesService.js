"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestPracticesService = void 0;
class BestPracticesService {
    constructor(context) {
        this._context = context;
    }
    /**
     * Detects anti-patterns in code
     */
    async detectAntiPatterns(document) {
        const issues = [];
        const fileExtension = document.uri.fsPath.toLowerCase();
        const text = document.getText();
        // Check for language-specific anti-patterns
        if (fileExtension.endsWith('.ts') || fileExtension.endsWith('.js')) {
            this.detectJavaScriptAntiPatterns(document, text, issues);
        }
        else if (fileExtension.endsWith('.py')) {
            this.detectPythonAntiPatterns(document, text, issues);
        }
        else if (fileExtension.endsWith('.java')) {
            this.detectJavaAntiPatterns(document, text, issues);
        }
        return issues;
    }
    /**
     * Suggests design improvements
     */
    async suggestDesignImprovements(document) {
        const issues = [];
        const text = document.getText();
        this.checkMethodLength(document, text, issues);
        this.checkParameterCount(document, text, issues);
        this.checkComplexity(document, text, issues);
        return issues;
    }
    /**
     * Checks code consistency
     */
    async checkCodeConsistency(document) {
        const issues = [];
        const text = document.getText();
        this.checkNamingConventions(document, text, issues);
        this.checkStyleConsistency(document, text, issues);
        this.checkCommentConsistency(document, text, issues);
        return issues;
    }
    detectJavaScriptAntiPatterns(document, text, issues) {
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
    detectPythonAntiPatterns(document, text, issues) {
        // Check for wildcard imports
        this.findPatterns(document, text, /from\s+\w+\s+import\s+\*/g, {
            severity: 'warning',
            description: 'Wildcard import usage',
            recommendation: 'Import specific names instead of using wildcard imports',
            category: 'antiPattern'
        }, issues);
    }
    detectJavaAntiPatterns(document, text, issues) {
        // Check for raw exception catching
        this.findPatterns(document, text, /catch\s*\(\s*Exception\s+/g, {
            severity: 'warning',
            description: 'Catching raw Exception',
            recommendation: 'Catch specific exceptions instead of generic Exception',
            category: 'antiPattern'
        }, issues);
    }
    checkMethodLength(document, text, issues) {
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
    checkParameterCount(document, text, issues) {
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
    checkComplexity(document, text, issues) {
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
    checkNamingConventions(document, text, issues) {
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
    checkStyleConsistency(document, text, issues) {
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
    checkCommentConsistency(document, text, issues) {
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
    findPatterns(document, text, pattern, issueTemplate, issues) {
        let match;
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
    findMaxNestingDepth(text) {
        let maxDepth = 0;
        let currentDepth = 0;
        let inString = false;
        let stringChar = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // Handle strings
            if ((char === '"' || char === "'") && text[i - 1] !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                }
                else if (char === stringChar) {
                    inString = false;
                }
                continue;
            }
            if (!inString) {
                if (char === '{') {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                }
                else if (char === '}') {
                    currentDepth--;
                }
            }
        }
        return maxDepth;
    }
    dispose() {
        // Clean up any resources
    }
}
exports.BestPracticesService = BestPracticesService;
//# sourceMappingURL=BestPracticesService.js.map