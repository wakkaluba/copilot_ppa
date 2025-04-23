import * as vscode from 'vscode';
import { SecurityScanResult, SecurityIssue } from '../types';

export class CodeSecurityScanner {
    private readonly supportedLanguages = ['javascript', 'typescript', 'python', 'java'];

    public async scanWorkspace(
        progressCallback?: (message: string) => void
    ): Promise<SecurityScanResult> {
        const issues: SecurityIssue[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        let scannedFiles = 0;

        if (!workspaceFolders) {
            return { issues, scannedFiles: 0, timestamp: Date.now() };
        }

        for (const folder of workspaceFolders) {
            for (const lang of this.supportedLanguages) {
                const pattern = this.getLanguagePattern(lang);
                const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
                
                for (const file of files) {
                    progressCallback?.(`Scanning ${file.fsPath}...`);
                    const document = await vscode.workspace.openTextDocument(file);
                    const fileIssues = await this.scanFile(document.uri);
                    issues.push(...fileIssues);
                    scannedFiles++;
                }
            }
        }

        return {
            issues,
            scannedFiles,
            timestamp: Date.now()
        };
    }

    public async scanFile(uri: vscode.Uri): Promise<SecurityIssue[]> {
        const document = await vscode.workspace.openTextDocument(uri);
        const issues: SecurityIssue[] = [];
        const text = document.getText();

        switch (document.languageId) {
            case 'javascript':
            case 'typescript':
                await this.scanJavaScriptFile(text, document, issues);
                break;
            case 'python':
                await this.scanPythonFile(text, document, issues);
                break;
            case 'java':
                await this.scanJavaFile(text, document, issues);
                break;
        }

        return issues;
    }

    private getLanguagePattern(language: string): string {
        switch (language) {
            case 'javascript':
                return '**/*.{js,jsx}';
            case 'typescript':
                return '**/*.{ts,tsx}';
            case 'python':
                return '**/*.py';
            case 'java':
                return '**/*.java';
            default:
                return '';
        }
    }

    private async scanJavaScriptFile(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): Promise<void> {
        // Check for common JavaScript security issues
        this.checkUnsafeEval(text, document, issues);
        this.checkXSSVulnerabilities(text, document, issues);
        this.checkUnsafeJsonParse(text, document, issues);
        this.checkUnsafeRegex(text, document, issues);
        this.checkHardcodedSecrets(text, document, issues);
        await this.checkSecurityMiddleware(text, document, issues);
    }

    private async scanPythonFile(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): Promise<void> {
        // Check for common Python security issues
        this.checkShellInjection(text, document, issues);
        this.checkSQLInjection(text, document, issues);
        this.checkUnsafeDeserialization(text, document, issues);
        this.checkUnsafeYAMLLoad(text, document, issues);
        this.checkHardcodedSecrets(text, document, issues);
        await this.checkSecurityMiddleware(text, document, issues);
    }

    private async scanJavaFile(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): Promise<void> {
        // Check for common Java security issues
        this.checkXXEVulnerability(text, document, issues);
        this.checkUnsafeDeserialization(text, document, issues);
        this.checkSQLInjection(text, document, issues);
        this.checkUnsafeReflection(text, document, issues);
        this.checkHardcodedSecrets(text, document, issues);
        await this.checkSecurityMiddleware(text, document, issues);
    }

    private checkUnsafeEval(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const evalRegex = /eval\s*\(/g;
        let match;
        while ((match = evalRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                id: 'SEC001',
                name: 'Unsafe eval() Usage',
                description: 'Using eval() can lead to code injection vulnerabilities',
                severity: 'high',
                location: {
                    file: document.uri.fsPath,
                    line: position.line,
                    column: position.character
                },
                recommendation: 'Consider using safer alternatives like JSON.parse() for data parsing'
            });
        }
    }

    private checkXSSVulnerabilities(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const dangerousPatterns = [
            /innerHTML\s*=/g,
            /outerHTML\s*=/g,
            /document\.write\s*\(/g
        ];

        for (const pattern of dangerousPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC002',
                    name: 'Potential XSS Vulnerability',
                    description: 'Direct DOM manipulation can lead to XSS vulnerabilities',
                    severity: 'high',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Use safe DOM APIs or sanitize input before rendering'
                });
            }
        }
    }

    private checkSQLInjection(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const sqlPatterns = [
            /executeQuery\s*\(\s*["'].*\$\{.*\}/g, // Template literals in queries
            /executeQuery\s*\(\s*["'].*\+/g,        // String concatenation in queries
            /\.query\s*\(\s*["'].*\+/g,            // Node.js style queries
            /cursor\.execute\s*\(\s*["'].*%/g       // Python style queries
        ];

        for (const pattern of sqlPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC003',
                    name: 'Potential SQL Injection',
                    description: 'Dynamic SQL queries can lead to SQL injection vulnerabilities',
                    severity: 'critical',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Use parameterized queries or an ORM'
                });
            }
        }
    }

    private checkHardcodedSecrets(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const secretPatterns = [
            {
                pattern: /(?:password|secret|key|token|auth).*['"]\w{16,}/gi,
                name: 'Hardcoded Secret'
            },
            {
                pattern: /(?:aws|firebase|stripe)\s*.\s*['"][A-Za-z0-9_\-]{20,}/gi,
                name: 'Hardcoded API Key'
            }
        ];

        for (const { pattern, name } of secretPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC004',
                    name,
                    description: 'Hardcoded secrets can lead to security breaches',
                    severity: 'critical',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Use environment variables or a secure secrets manager'
                });
            }
        }
    }

    private async checkSecurityMiddleware(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): Promise<void> {
        // Check for missing security middleware in web frameworks
        if (text.includes('express')) {
            if (!text.includes('helmet') && !text.includes('security-middleware')) {
                issues.push({
                    id: 'SEC005',
                    name: 'Missing Security Middleware',
                    description: 'Web application lacks essential security middleware',
                    severity: 'high',
                    location: {
                        file: document.uri.fsPath,
                        line: 0,
                        column: 0
                    },
                    recommendation: 'Add security middleware like Helmet.js for Express applications'
                });
            }
        }
    }

    private checkUnsafeDeserialization(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        const patterns = [
            /JSON\.parse\s*\(\s*.*\)/g,
            /pickle\.loads\s*\(\s*.*\)/g,
            /ObjectInputStream\s*\(\s*.*\)/g
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC006',
                    name: 'Unsafe Deserialization',
                    description: 'Deserializing untrusted data can lead to remote code execution',
                    severity: 'high',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Validate and sanitize data before deserialization'
                });
            }
        }
    }
}