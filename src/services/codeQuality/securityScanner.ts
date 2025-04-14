import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SecurityIssue {
    file: string;
    line: number;
    column: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}

export class SecurityScanner {
    private _context: vscode.ExtensionContext;
    private _diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('security-issues');
        context.subscriptions.push(this._diagnosticCollection);
    }

    /**
     * Scans workspace dependencies for known vulnerabilities
     */
    public async scanDependencies(): Promise<SecurityIssue[]> {
        const issues: SecurityIssue[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders) {
            return issues;
        }

        for (const folder of workspaceFolders) {
            const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
            
            try {
                // Use npm audit to check for vulnerabilities
                const { stdout } = await execAsync('npm audit --json', { 
                    cwd: folder.uri.fsPath 
                });
                
                const auditResult = JSON.parse(stdout);
                
                // Process npm audit results
                if (auditResult.vulnerabilities) {
                    for (const [pkgName, vuln] of Object.entries<any>(auditResult.vulnerabilities)) {
                        for (const info of vuln.via || []) {
                            if (typeof info === 'object') {
                                issues.push({
                                    file: packageJsonPath,
                                    line: 1, // Default to line 1 since we don't know exact line
                                    column: 1,
                                    severity: this.mapSeverity(info.severity || 'low'),
                                    description: `Vulnerability in dependency ${pkgName}: ${info.title || info.name}`,
                                    recommendation: `Update to version ${vuln.fixAvailable?.version || 'latest'} or newer`
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to run npm audit:', error);
            }
        }
        
        return issues;
    }

    /**
     * Scans current file for potential security issues in code
     */
    public async scanFileForIssues(document: vscode.TextDocument): Promise<SecurityIssue[]> {
        const issues: SecurityIssue[] = [];
        const text = document.getText();
        const filePath = document.uri.fsPath;
        const fileExtension = path.extname(filePath).toLowerCase();
        
        // Check for common security issues based on file type
        if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
            this.checkJavaScriptSecurity(text, document, issues);
        } else if (['.py'].includes(fileExtension)) {
            this.checkPythonSecurity(text, document, issues);
        } else if (['.java'].includes(fileExtension)) {
            this.checkJavaSecurity(text, document, issues);
        }
        
        // Update diagnostics
        this.updateDiagnostics(document, issues);
        
        return issues;
    }
    
    /**
     * Provides proactive security recommendations
     */
    public getSecurityRecommendations(document: vscode.TextDocument): string[] {
        const recommendations: string[] = [
            'Keep all dependencies up to date',
            'Implement proper input validation',
            'Use parameterized queries instead of string concatenation for database queries',
            'Implement proper authentication and authorization mechanisms',
            'Avoid storing sensitive information in code or configuration files'
        ];
        
        return recommendations;
    }
    
    private checkJavaScriptSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Check for eval usage
        this.findPatternInDocument(document, /eval\s*\(/g, {
            severity: 'high',
            description: 'Potentially unsafe use of eval()',
            recommendation: 'Avoid using eval() as it can lead to code injection vulnerabilities'
        }, issues);
        
        // Check for innerHTML
        this.findPatternInDocument(document, /\.innerHTML\s*=/g, {
            severity: 'medium',
            description: 'Use of innerHTML could lead to XSS vulnerabilities',
            recommendation: 'Consider using textContent, innerText, or DOM methods instead'
        }, issues);
        
        // Check for setTimeout with string argument
        this.findPatternInDocument(document, /setTimeout\s*\(\s*["']/g, {
            severity: 'medium',
            description: 'setTimeout with string argument can act like eval()',
            recommendation: 'Use a function reference instead of a string'
        }, issues);
    }
    
    private checkPythonSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Check for exec usage
        this.findPatternInDocument(document, /exec\s*\(/g, {
            severity: 'high',
            description: 'Potentially unsafe use of exec()',
            recommendation: 'Avoid using exec() as it can lead to code injection vulnerabilities'
        }, issues);
        
        // Check for shell=True in subprocess
        this.findPatternInDocument(document, /subprocess\..*\(.*shell\s*=\s*True/g, {
            severity: 'high',
            description: 'Use of shell=True in subprocess can lead to command injection',
            recommendation: 'Avoid shell=True when possible'
        }, issues);
    }
    
    private checkJavaSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
        // Check for SQL injection vulnerabilities
        this.findPatternInDocument(document, /Statement.*\.execute.*\+/g, {
            severity: 'critical',
            description: 'Potential SQL injection vulnerability',
            recommendation: 'Use PreparedStatement with parameterized queries'
        }, issues);
        
        // Check for XSS vulnerabilities
        this.findPatternInDocument(document, /response\.getWriter\(\)\.print\(.*request\.getParameter/g, {
            severity: 'high',
            description: 'Potential XSS vulnerability',
            recommendation: 'Always validate and sanitize user input'
        }, issues);
    }
    
    private findPatternInDocument(
        document: vscode.TextDocument, 
        pattern: RegExp, 
        issueTemplate: {severity: SecurityIssue['severity'], description: string, recommendation: string},
        issues: SecurityIssue[]
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
                recommendation: issueTemplate.recommendation
            });
        }
    }
    
    private updateDiagnostics(document: vscode.TextDocument, issues: SecurityIssue[]): void {
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
            
            diagnostic.source = 'Security Scanner';
            return diagnostic;
        });
        
        this._diagnosticCollection.set(document.uri, diagnostics);
    }
    
    private mapSeverity(severity: string): SecurityIssue['severity'] {
        switch (severity.toLowerCase()) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'moderate': 
            case 'medium': return 'medium';
            default: return 'low';
        }
    }
    
    private mapSeverityToDiagnosticSeverity(severity: SecurityIssue['severity']): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical': return vscode.DiagnosticSeverity.Error;
            case 'high': return vscode.DiagnosticSeverity.Error;
            case 'medium': return vscode.DiagnosticSeverity.Warning;
            case 'low': return vscode.DiagnosticSeverity.Information;
        }
    }
}
