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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestPracticesChecker = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class BestPracticesChecker {
    _context;
    _diagnosticCollection;
    constructor(context) {
        this._context = context;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('best-practices');
        context.subscriptions.push(this._diagnosticCollection);
    }
    /**
     * Detects anti-patterns in code
     */
    detectAntiPatterns(document) {
        const issues = [];
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        // Check based on file type
        if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
            this.detectJavaScriptAntiPatterns(document, issues);
        }
        else if (['.py'].includes(fileExtension)) {
            this.detectPythonAntiPatterns(document, issues);
        }
        else if (['.java'].includes(fileExtension)) {
            this.detectJavaAntiPatterns(document, issues);
        }
        // Update diagnostics
        this.updateDiagnostics(document, issues);
        return issues;
    }
    /**
     * Suggests design improvements
     */
    suggestDesignImprovements(document) {
        const issues = [];
        // Check for long methods/functions
        this.detectLongMethods(document, issues);
        // Check for high method parameters count
        this.detectHighParameterCount(document, issues);
        return issues;
    }
    /**
     * Checks for code consistency
     */
    checkCodeConsistency(document) {
        const issues = [];
        const text = document.getText();
        // Check for mixed coding styles
        this.checkMixedCodingStyles(document, issues);
        // Check for consistent naming conventions
        this.checkNamingConventions(document, issues);
        return issues;
    }
    detectJavaScriptAntiPatterns(document, issues) {
        const text = document.getText();
        // Check for deeply nested callbacks (callback hell)
        const callbackDepthPattern = /\)\s*=>\s*\{[^{}]*\}\)\s*=>\s*\{/g;
        this.findPatternInDocument(document, callbackDepthPattern, {
            severity: 'warning',
            description: 'Nested callbacks detected (callback hell)',
            recommendation: 'Consider using Promises, async/await, or refactoring to smaller functions',
            category: 'antiPattern'
        }, issues);
        // Check for using == instead of ===
        const looseEqualityPattern = /[^=!]=(?!=)/g;
        this.findPatternInDocument(document, looseEqualityPattern, {
            severity: 'warning',
            description: 'Using loose equality (==) instead of strict equality (===)',
            recommendation: 'Use === for strict type comparisons to avoid unexpected behavior',
            category: 'antiPattern'
        }, issues);
        // Check for magic numbers
        const magicNumberPattern = /(?<![a-zA-Z0-9_])[0-9]{3,}(?![a-zA-Z0-9_])/g;
        this.findPatternInDocument(document, magicNumberPattern, {
            severity: 'suggestion',
            description: 'Magic number detected',
            recommendation: 'Consider using named constants for better readability and maintenance',
            category: 'antiPattern'
        }, issues);
    }
    detectPythonAntiPatterns(document, issues) {
        // Check for wildcard imports
        const wildcardImportPattern = /from\s+\w+\s+import\s+\*/g;
        this.findPatternInDocument(document, wildcardImportPattern, {
            severity: 'warning',
            description: 'Wildcard import detected',
            recommendation: 'Explicitly import only what you need to avoid namespace pollution',
            category: 'antiPattern'
        }, issues);
        // Check for mutable default arguments
        const mutableDefaultPattern = /def\s+\w+\s*\(\s*\w+\s*=\s*(\[\]|\{\}|\(\))/g;
        this.findPatternInDocument(document, mutableDefaultPattern, {
            severity: 'error',
            description: 'Mutable default argument detected',
            recommendation: 'Use None as default and create the mutable object inside the function',
            category: 'antiPattern'
        }, issues);
    }
    detectJavaAntiPatterns(document, issues) {
        // Check for catching Exception
        const catchExceptionPattern = /catch\s*\(\s*Exception\s+/g;
        this.findPatternInDocument(document, catchExceptionPattern, {
            severity: 'warning',
            description: 'Catching generic Exception',
            recommendation: 'Catch specific exceptions or handle them separately',
            category: 'antiPattern'
        }, issues);
        // Check for using == with non-primitives
        const objectEqualityPattern = /(?<!\.equals\()([A-Z][a-zA-Z0-9_]*)\s*==\s*([A-Z][a-zA-Z0-9_]*)/g;
        this.findPatternInDocument(document, objectEqualityPattern, {
            severity: 'error',
            description: 'Using == with objects instead of .equals()',
            recommendation: 'Use .equals() for object comparison instead of ==',
            category: 'antiPattern'
        }, issues);
    }
    detectLongMethods(document, issues) {
        const text = document.getText();
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        // Define patterns for method/function declarations based on file type
        let methodPattern;
        if (['.js', '.ts'].includes(fileExtension)) {
            methodPattern = /(function\s+\w+\s*\([^)]*\)|(\w+|\(\))\s*=>\s*\{|\w+\s*\([^)]*\)\s*\{)/g;
        }
        else if (fileExtension === '.py') {
            methodPattern = /def\s+\w+\s*\([^)]*\)\s*:/g;
        }
        else if (fileExtension === '.java') {
            methodPattern = /(\w+\s+)+\w+\s*\([^)]*\)\s*(\{|throws)/g;
        }
        else {
            return;
        }
        let match;
        while ((match = methodPattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            // Find the closing bracket of the method (simplified approach)
            let openBrackets = 1;
            let closePosition = startPosition;
            let inString = false;
            let stringChar = '';
            for (let i = match.index + match[0].length; i < text.length; i++) {
                const char = text[i];
                // Handle string literals to avoid counting brackets inside strings
                if ((char === '"' || char === "'") && (i === 0 || text[i - 1] !== '\\')) {
                    if (!inString) {
                        inString = true;
                        stringChar = char;
                    }
                    else if (char === stringChar) {
                        inString = false;
                    }
                }
                if (!inString) {
                    if ((char === '{' && fileExtension !== '.py') ||
                        (fileExtension === '.py' && text.substring(i).match(/^\s*def/))) {
                        openBrackets++;
                    }
                    else if ((char === '}' && fileExtension !== '.py') ||
                        (fileExtension === '.py' && text.substring(i).match(/^\s*return|^\s*$/))) {
                        openBrackets--;
                    }
                }
                if (openBrackets === 0) {
                    closePosition = document.positionAt(i);
                    break;
                }
            }
            // Calculate method length
            const methodLength = closePosition.line - startPosition.line;
            // Flag methods that are too long (more than 30 lines for demonstration)
            if (methodLength > 30) {
                issues.push({
                    file: document.uri.fsPath,
                    line: startPosition.line + 1,
                    column: startPosition.character + 1,
                    severity: 'warning',
                    description: `Method is too long (${methodLength} lines)`,
                    recommendation: 'Consider breaking this method into smaller, more focused methods',
                    category: 'design'
                });
            }
        }
    }
    detectHighParameterCount(document, issues) {
        const text = document.getText();
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        // Define patterns for parameter lists based on file type
        let paramPattern;
        if (['.js', '.ts'].includes(fileExtension)) {
            paramPattern = /(function\s+\w+|\w+)\s*\(([^)]*)\)/g;
        }
        else if (fileExtension === '.py') {
            paramPattern = /def\s+\w+\s*\(([^)]*)\)/g;
        }
        else if (fileExtension === '.java') {
            paramPattern = /(\w+\s+)+\w+\s*\(([^)]*)\)/g;
        }
        else {
            return;
        }
        let match;
        while ((match = paramPattern.exec(text)) !== null) {
            const params = match[2].split(',').filter(p => p.trim().length > 0);
            if (params.length > 4) { // More than 4 parameters is often a code smell
                const position = document.positionAt(match.index);
                issues.push({
                    file: document.uri.fsPath,
                    line: position.line + 1,
                    column: position.character + 1,
                    severity: 'suggestion',
                    description: `Function has too many parameters (${params.length})`,
                    recommendation: 'Consider using an options object or breaking functionality into smaller functions',
                    category: 'design'
                });
            }
        }
    }
    checkMixedCodingStyles(document, issues) {
        const text = document.getText();
        // Check for mixed quotes
        const singleQuotes = (text.match(/'/g) || []).length;
        const doubleQuotes = (text.match(/"/g) || []).length;
        if (singleQuotes > 0 && doubleQuotes > 0 &&
            Math.min(singleQuotes, doubleQuotes) > Math.max(singleQuotes, doubleQuotes) * 0.1) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: 'Mixed quote styles detected in file',
                recommendation: 'Standardize on either single or double quotes for string literals',
                category: 'consistency'
            });
        }
        // Check for mixed indentation
        const tabIndents = (text.match(/^\t+/gm) || []).length;
        const spaceIndents = (text.match(/^ +/gm) || []).length;
        if (tabIndents > 0 && spaceIndents > 0 &&
            Math.min(tabIndents, spaceIndents) > Math.max(tabIndents, spaceIndents) * 0.1) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'warning',
                description: 'Mixed indentation styles (tabs and spaces) detected',
                recommendation: 'Standardize on either tabs or spaces for indentation',
                category: 'consistency'
            });
        }
    }
    checkNamingConventions(document, issues) {
        const text = document.getText();
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        if (['.js', '.ts'].includes(fileExtension)) {
            // Check for mixing camelCase and snake_case in variable names
            const camelCaseVars = text.match(/\blet\s+([a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)\b/g) || [];
            const snakeCaseVars = text.match(/\blet\s+([a-z][a-z0-9]*_[a-z0-9_]*)\b/g) || [];
            if (camelCaseVars.length > 0 && snakeCaseVars.length > 0) {
                issues.push({
                    file: document.uri.fsPath,
                    line: 1,
                    column: 1,
                    severity: 'suggestion',
                    description: 'Mixed variable naming conventions (camelCase and snake_case)',
                    recommendation: 'Standardize on a single naming convention for variables',
                    category: 'naming'
                });
            }
        }
        else if (fileExtension === '.py') {
            // Check for mixing snake_case and camelCase in function names
            const snakeCaseFuncs = text.match(/\bdef\s+([a-z][a-z0-9]*_[a-z0-9_]*)\s*\(/g) || [];
            const camelCaseFuncs = text.match(/\bdef\s+([a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)\s*\(/g) || [];
            if (snakeCaseFuncs.length > 0 && camelCaseFuncs.length > 0) {
                issues.push({
                    file: document.uri.fsPath,
                    line: 1,
                    column: 1,
                    severity: 'suggestion',
                    description: 'Mixed function naming conventions (snake_case and camelCase)',
                    recommendation: 'Follow PEP 8 guidelines: use snake_case for functions in Python',
                    category: 'naming'
                });
            }
        }
    }
    findPatternInDocument(document, pattern, issueTemplate, issues) {
        const text = document.getText();
        let match;
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
    updateDiagnostics(document, issues) {
        const diagnostics = issues.map(issue => {
            const range = new vscode.Range(issue.line - 1, issue.column - 1, issue.line - 1, issue.column + 20);
            const diagnostic = new vscode.Diagnostic(range, `${issue.description}\n${issue.recommendation}`, this.mapSeverityToDiagnosticSeverity(issue.severity));
            diagnostic.source = 'Best Practices';
            return diagnostic;
        });
        this._diagnosticCollection.set(document.uri, diagnostics);
    }
    mapSeverityToDiagnosticSeverity(severity) {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'suggestion': return vscode.DiagnosticSeverity.Hint;
        }
    }
}
exports.BestPracticesChecker = BestPracticesChecker;
//# sourceMappingURL=bestPracticesChecker.js.map