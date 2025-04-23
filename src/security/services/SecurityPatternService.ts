import * as vscode from 'vscode';
import { SecurityPattern, SecurityIssue } from '../types';

export class SecurityPatternService {
    private patterns: SecurityPattern[] = [];

    constructor() {
        this.loadDefaultPatterns();
    }

    public getPatterns(): SecurityPattern[] {
        return this.patterns;
    }

    public addPattern(pattern: SecurityPattern): void {
        this.patterns.push(pattern);
    }

    private loadDefaultPatterns(): void {
        this.patterns = [
            {
                id: 'SEC001',
                name: 'SQL Injection Risk',
                description: 'Potential SQL injection vulnerability detected',
                pattern: /(\bexec\s*\(\s*["'`].*?\$\{.*?\}.*?["'`]\s*\)|\bquery\s*\(\s*["'`].*?\$\{.*?\}.*?["'`]\s*\))/g,
                severity: vscode.DiagnosticSeverity.Error,
                languages: ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
                fix: 'Use parameterized queries or an ORM instead of string concatenation'
            },
            {
                id: 'SEC002',
                name: 'Cross-site Scripting (XSS) Risk',
                description: 'Potential XSS vulnerability',
                pattern: /(document\.write\s*\(\s*.*?\)|(innerHTML|outerHTML)\s*=\s*)/g,
                severity: vscode.DiagnosticSeverity.Warning,
                languages: ['javascript', 'typescript', 'html', 'javascriptreact', 'typescriptreact'],
                fix: 'Use textContent instead of innerHTML or use a framework with auto-escaping'
            },
            // ...more patterns...
        ];
    }
}
