import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SecurityPatternService } from './services/SecurityPatternService';
import { SecurityAnalyzerService } from './services/SecurityAnalyzerService';
import { SecurityDiagnosticService } from './services/SecurityDiagnosticService';
import { SecurityFixService } from './services/SecurityFixService';
import { SecurityReportHtmlProvider } from '../providers/SecurityReportHtmlProvider';

/**
 * Class responsible for scanning code for potential security issues
 */
export class CodeSecurityScanner {
    private context: vscode.ExtensionContext;
    private securityPatterns: SecurityPattern[];
    private diagnosticCollection: vscode.DiagnosticCollection;
    private messageQueue: Array<() => Promise<void>> = [];
    private isProcessing: boolean = false;
    private disposables: vscode.Disposable[] = [];
    private webviewMap = new Map<string, vscode.Webview>();
    private patternService: SecurityPatternService;
    private analyzerService: SecurityAnalyzerService;
    private diagnosticService: SecurityDiagnosticService;
    private fixService: SecurityFixService;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('securityIssues');
        this.context.subscriptions.push(this.diagnosticCollection);
        this.securityPatterns = this.loadSecurityPatterns();
        this.patternService = new SecurityPatternService();
        this.analyzerService = new SecurityAnalyzerService(this.patternService);
        this.diagnosticService = new SecurityDiagnosticService(context);
        this.fixService = new SecurityFixService(context);
    }

    /**
     * Loads security patterns from predefined rules
     */
    private loadSecurityPatterns(): SecurityPattern[] {
        return [
            // JavaScript/TypeScript patterns
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
            {
                id: 'SEC003',
                name: 'Insecure Direct Object Reference',
                description: 'Potential Insecure Direct Object Reference (IDOR)',
                pattern: /(req\.params\.\w+|req\.query\.\w+)\s*(?=\w+\.findById|\w+\.getById|\w+\.load|\w+\.get)/g,
                severity: vscode.DiagnosticSeverity.Warning,
                languages: ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
                fix: 'Validate user input and check authorization before fetching objects'
            },
            {
                id: 'SEC004',
                name: 'Hardcoded Credentials',
                description: 'Hardcoded credentials or secrets',
                pattern: /(password|secret|token|key|api[_-]?key|access[_-]?token)\s*[:=]\s*["'`][^"'`]{8,}["'`]/gi,
                severity: vscode.DiagnosticSeverity.Error,
                languages: ['javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'php'],
                fix: 'Use environment variables or a secret manager instead of hardcoding credentials'
            },
            {
                id: 'SEC005',
                name: 'Weak Cryptography',
                description: 'Use of weak cryptographic algorithms',
                pattern: /(createHash\s*\(\s*["'`]md5["'`]\s*\)|createHash\s*\(\s*["'`]sha1["'`]\s*\))/g,
                severity: vscode.DiagnosticSeverity.Warning,
                languages: ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
                fix: 'Use stronger algorithms like SHA-256 or SHA-3'
            },
            {
                id: 'SEC006',
                name: 'Potential Path Traversal',
                description: 'Path traversal vulnerability',
                pattern: /(\breadFile|\bwriteFile|\bappendFile|\bexists|\bstat|\bunlink|\bmkdir|\breaddir)\s*\(\s*.*?\+/g,
                severity: vscode.DiagnosticSeverity.Warning,
                languages: ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
                fix: 'Use path.normalize or path.resolve to sanitize file paths'
            },
            // Python patterns
            {
                id: 'SEC007',
                name: 'Python SQL Injection',
                description: 'Potential SQL injection in Python',
                pattern: /cursor\.(execute|executemany)\s*\(\s*f["'`].*?{.*?}.*?["'`]/g,
                severity: vscode.DiagnosticSeverity.Error,
                languages: ['python'],
                fix: 'Use parameterized queries with placeholder values'
            },
            // Java patterns
            {
                id: 'SEC008',
                name: 'Java Unsafe Deserialization',
                description: 'Potential unsafe deserialization',
                pattern: /new\s+ObjectInputStream|readObject\s*\(\s*\)/g,
                severity: vscode.DiagnosticSeverity.Warning,
                languages: ['java'],
                fix: 'Use safe alternatives like JSON deserialization or validate input before deserialization'
            }
        ];
    }

    /**
     * Scan active file for security issues
     */
    public async scanActiveFile(): Promise<CodeScanResult> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { issues: [], scannedFiles: 0 };
        }

        return this.scanFile(editor.document.uri);
    }

    /**
     * Scan a specific file for security issues
     */
    public async scanFile(fileUri: vscode.Uri): Promise<CodeScanResult> {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const result = await this.analyzerService.scanDocument(document);
        this.diagnosticService.report(fileUri, result.diagnostics);
        return { issues: result.issues, scannedFiles: 1 };
    }

    private updateDiagnostics(fileUri: vscode.Uri, diagnostics: vscode.Diagnostic[]): void {
        // Queue diagnostic updates to prevent race conditions
        this.messageQueue.push(async () => {
            this.diagnosticCollection.set(fileUri, diagnostics);
        });
        this.processMessageQueue();
    }

    private async scanFileContent(document: vscode.TextDocument): Promise<{ diagnostics: vscode.Diagnostic[], issues: SecurityIssue[] }> {
        const languageId = document.languageId;
        const text = document.getText();
        const diagnostics: vscode.Diagnostic[] = [];
        const issues: SecurityIssue[] = [];
        
        // Filter for patterns relevant to this file type
        const relevantPatterns = this.securityPatterns.filter(pattern => 
            pattern.languages.includes(languageId));
            
        for (const pattern of relevantPatterns) {
            const regex = pattern.pattern;
            let match;
            
            // Reset regex for new file
            regex.lastIndex = 0;
            
            while ((match = regex.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `${pattern.name}: ${pattern.description}`,
                    pattern.severity
                );
                
                diagnostic.code = pattern.id;
                diagnostic.source = 'VSCode Local LLM Agent - Security Scanner';
                
                diagnostics.push(diagnostic);
                
                issues.push({
                    id: pattern.id,
                    name: pattern.name,
                    description: pattern.description,
                    file: document.uri.fsPath,
                    line: startPos.line + 1,
                    column: startPos.character + 1,
                    code: match[0],
                    severity: this.severityToString(pattern.severity),
                    fix: pattern.fix
                });
            }
        }

        return { diagnostics, issues };
    }

    /**
     * Scan entire workspace for security issues
     */
    public async scanWorkspace(progressCallback?: (message: string) => void): Promise<CodeScanResult> {
        const result = await this.analyzerService.scanWorkspace(progressCallback);
        result.issues.forEach(issue => {
            this.diagnosticService.report(vscode.Uri.file(issue.file), []);
        });
        return result;
    }
    
    /**
     * Find all relevant files in the workspace
     */
    private async findFiles(folderUri: vscode.Uri): Promise<vscode.Uri[]> {
        // Get list of file extensions to scan based on languages in patterns
        const languages = new Set<string>();
        this.securityPatterns.forEach(pattern => 
            pattern.languages.forEach(lang => languages.add(lang)));
        
        // Map languages to glob patterns
        const globPatterns: string[] = [];
        languages.forEach(lang => {
            switch (lang) {
                case 'javascript':
                    globPatterns.push('**/*.js');
                    break;
                case 'typescript':
                    globPatterns.push('**/*.ts');
                    break;
                case 'javascriptreact':
                    globPatterns.push('**/*.jsx');
                    break;
                case 'typescriptreact':
                    globPatterns.push('**/*.tsx');
                    break;
                case 'python':
                    globPatterns.push('**/*.py');
                    break;
                case 'java':
                    globPatterns.push('**/*.java');
                    break;
                case 'csharp':
                    globPatterns.push('**/*.cs');
                    break;
                case 'go':
                    globPatterns.push('**/*.go');
                    break;
                case 'php':
                    globPatterns.push('**/*.php');
                    break;
                case 'html':
                    globPatterns.push('**/*.html', '**/*.htm');
                    break;
            }
        });
        
        // Create glob pattern for all extensions
        const globalPattern = `{${globPatterns.join(',')}}`;
        
        // Exclude node_modules, .git, etc.
        const excludePattern = '{**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/out/**}';
        
        return await vscode.workspace.findFiles(globalPattern, excludePattern);
    }
    
    /**
     * Convert VSCode severity to string
     */
    private severityToString(severity: vscode.DiagnosticSeverity): string {
        switch (severity) {
            case vscode.DiagnosticSeverity.Error:
                return 'Error';
            case vscode.DiagnosticSeverity.Warning:
                return 'Warning';
            case vscode.DiagnosticSeverity.Information:
                return 'Information';
            case vscode.DiagnosticSeverity.Hint:
                return 'Hint';
            default:
                return 'Unknown';
        }
    }

    /**
     * Show a detailed report of security issues
     */
    public async showSecurityReport(result: CodeScanResult): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'securityIssuesReport',
            'Code Security Issues Report',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        panel.webview.html = SecurityReportHtmlProvider.getHtml(result);
    }

    private async processMessageQueue(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.messageQueue.length > 0) {
            const handler = this.messageQueue.shift();
            if (handler) {
                try {
                    await handler();
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        }

        this.isProcessing = false;
    }

    private handleWebviewMessage(webview: vscode.Webview, message: any): void {
        this.messageQueue.push(async () => {
            try {
                switch (message.command) {
                    case 'openFile':
                        const document = await vscode.workspace.openTextDocument(message.path);
                        await vscode.window.showTextDocument(document);
                        break;
                    case 'fixIssue':
                        await this.applySecurityFix(message.issueId, message.path);
                        break;
                }
            } catch (error) {
                console.error('Error handling webview message:', error);
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        });
        this.processMessageQueue();
    }

    public registerWebview(id: string, webview: vscode.Webview): void {
        this.webviewMap.set(id, webview);
        
        const disposable = webview.onDidReceiveMessage(
            message => this.handleWebviewMessage(webview, message),
            undefined,
            this.disposables
        );
        
        this.disposables.push(disposable);
    }

    public unregisterWebview(id: string): void {
        this.webviewMap.delete(id);
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.webviewMap.clear();
        this.messageQueue = [];
        this.isProcessing = false;
    }

    /**
     * Apply security fix for a specific issue
     */
    private async applySecurityFix(issueId: string, filePath: string): Promise<void> {
        await this.fixService.applyFix(issueId, filePath);
    }
}

/**
 * Interface representing a security pattern to scan for
 */
interface SecurityPattern {
    id: string;
    name: string;
    description: string;
    pattern: RegExp;
    severity: vscode.DiagnosticSeverity;
    languages: string[];
    fix: string;
}

/**
 * Interface representing a security issue found in code
 */
export interface SecurityIssue {
    id: string;
    name: string;
    description: string;
    file: string;
    line: number;
    column: number;
    code: string;
    severity: string;
    fix: string;
}

/**
 * Interface for the overall result of a code security scan
 */
export interface CodeScanResult {
    issues: SecurityIssue[];
    scannedFiles: number;
}
