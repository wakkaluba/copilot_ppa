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
exports.SecurityScanner = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class SecurityScanner {
    constructor(context) {
        this._context = context;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('security-issues');
        context.subscriptions.push(this._diagnosticCollection);
    }
    /**
     * Scans workspace dependencies for known vulnerabilities
     */
    async scanDependencies() {
        const issues = [];
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
                    for (const [pkgName, vuln] of Object.entries(auditResult.vulnerabilities)) {
                        for (const info of vuln.via || []) {
                            if (typeof info === 'object') {
                                issues.push({
                                    file: packageJsonPath,
                                    line: 1,
                                    column: 1,
                                    severity: this.mapSeverity(info.severity || 'low'),
                                    description: `Vulnerability in dependency ${pkgName}: ${info.title || info.name}`,
                                    recommendation: `Update to version ${vuln.fixAvailable?.version || 'latest'} or newer`
                                });
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Failed to run npm audit:', error);
            }
        }
        return issues;
    }
    /**
     * Scans current file for potential security issues in code
     */
    async scanFileForIssues(document) {
        const issues = [];
        const text = document.getText();
        const filePath = document.uri.fsPath;
        const fileExtension = path.extname(filePath).toLowerCase();
        // Check for common security issues based on file type
        if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
            this.checkJavaScriptSecurity(text, document, issues);
        }
        else if (['.py'].includes(fileExtension)) {
            this.checkPythonSecurity(text, document, issues);
        }
        else if (['.java'].includes(fileExtension)) {
            this.checkJavaSecurity(text, document, issues);
        }
        // Update diagnostics
        this.updateDiagnostics(document, issues);
        return issues;
    }
    /**
     * Provides proactive security recommendations
     */
    getSecurityRecommendations(document) {
        const recommendations = [
            'Keep all dependencies up to date',
            'Implement proper input validation',
            'Use parameterized queries instead of string concatenation for database queries',
            'Implement proper authentication and authorization mechanisms',
            'Avoid storing sensitive information in code or configuration files'
        ];
        return recommendations;
    }
    checkJavaScriptSecurity(text, document, issues) {
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
    checkPythonSecurity(text, document, issues) {
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
    checkJavaSecurity(text, document, issues) {
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
                recommendation: issueTemplate.recommendation
            });
        }
    }
    updateDiagnostics(document, issues) {
        const diagnostics = issues.map(issue => {
            const range = new vscode.Range(issue.line - 1, issue.column - 1, issue.line - 1, issue.column + 20);
            const diagnostic = new vscode.Diagnostic(range, `${issue.description}\n${issue.recommendation}`, this.mapSeverityToDiagnosticSeverity(issue.severity));
            diagnostic.source = 'Security Scanner';
            return diagnostic;
        });
        this._diagnosticCollection.set(document.uri, diagnostics);
    }
    mapSeverity(severity) {
        switch (severity.toLowerCase()) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'moderate':
            case 'medium': return 'medium';
            default: return 'low';
        }
    }
    mapSeverityToDiagnosticSeverity(severity) {
        switch (severity) {
            case 'critical': return vscode.DiagnosticSeverity.Error;
            case 'high': return vscode.DiagnosticSeverity.Error;
            case 'medium': return vscode.DiagnosticSeverity.Warning;
            case 'low': return vscode.DiagnosticSeverity.Information;
        }
    }
}
exports.SecurityScanner = SecurityScanner;
//# sourceMappingURL=securityScanner.js.map