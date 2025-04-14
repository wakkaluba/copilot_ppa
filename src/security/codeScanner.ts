import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Class responsible for scanning code for potential security issues
 */
export class CodeSecurityScanner {
    private context: vscode.ExtensionContext;
    private securityPatterns: SecurityPattern[];
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('securityIssues');
        this.context.subscriptions.push(this.diagnosticCollection);
        this.securityPatterns = this.loadSecurityPatterns();
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
        try {
            const document = await vscode.workspace.openTextDocument(fileUri);
            const languageId = document.languageId;
            const text = document.getText();
            const fileName = path.basename(fileUri.fsPath);
            
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
                        file: fileUri.fsPath,
                        line: startPos.line + 1,
                        column: startPos.character + 1,
                        code: match[0],
                        severity: this.severityToString(pattern.severity),
                        fix: pattern.fix
                    });
                }
            }
            
            // Update diagnostics for this file
            this.diagnosticCollection.set(fileUri, diagnostics);
            
            return { issues, scannedFiles: 1 };
        } catch (error) {
            console.error(`Error scanning file ${fileUri.fsPath}:`, error);
            return { issues: [], scannedFiles: 0 };
        }
    }

    /**
     * Scan entire workspace for security issues
     */
    public async scanWorkspace(progressCallback?: (message: string) => void): Promise<CodeScanResult> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { issues: [], scannedFiles: 0 };
        }
        
        let allIssues: SecurityIssue[] = [];
        let scannedFiles = 0;
        
        // Clear previous diagnostics
        this.diagnosticCollection.clear();
        
        for (const folder of workspaceFolders) {
            const files = await this.findFiles(folder.uri);
            
            for (const file of files) {
                if (progressCallback) {
                    progressCallback(`Scanning ${path.basename(file.fsPath)}`);
                }
                
                const result = await this.scanFile(file);
                allIssues = [...allIssues, ...result.issues];
                scannedFiles += result.scannedFiles;
            }
        }
        
        return { issues: allIssues, scannedFiles };
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

        panel.webview.html = this.generateReportHtml(result);
        
        // Handle message from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'openFile') {
                    const document = await vscode.workspace.openTextDocument(message.file);
                    const editor = await vscode.window.showTextDocument(document);
                    
                    // Navigate to the issue location
                    const position = new vscode.Position(message.line - 1, message.column - 1);
                    editor.selection = new vscode.Selection(position, position);
                    editor.revealRange(
                        new vscode.Range(position, position),
                        vscode.TextEditorRevealType.InCenter
                    );
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Generate HTML for security report
     */
    private generateReportHtml(result: CodeScanResult): string {
        const issuesBySeverity = {
            'Error': result.issues.filter(issue => issue.severity === 'Error'),
            'Warning': result.issues.filter(issue => issue.severity === 'Warning'),
            'Information': result.issues.filter(issue => issue.severity === 'Information'),
            'Hint': result.issues.filter(issue => issue.severity === 'Hint')
        };

        let issuesHtml = '';
        
        if (result.issues.length > 0) {
            // Generate HTML for each severity level
            for (const [severity, issues] of Object.entries(issuesBySeverity)) {
                if (issues.length === 0) continue;
                
                const severityClass = severity.toLowerCase();
                const issuesContent = issues.map(issue => {
                    const filePath = issue.file;
                    const fileName = path.basename(filePath);
                    
                    return `
                        <div class="issue ${severityClass}">
                            <h3>[${issue.id}] ${issue.name}</h3>
                            <p>${issue.description}</p>
                            <div class="issue-details">
                                <p><strong>File:</strong> <a href="#" class="file-link" data-file="${filePath}" data-line="${issue.line}" data-column="${issue.column}">${fileName}</a></p>
                                <p><strong>Line:</strong> ${issue.line}, <strong>Column:</strong> ${issue.column}</p>
                                <div class="code-snippet">
                                    <pre><code>${this.escapeHtml(issue.code)}</code></pre>
                                </div>
                                <div class="fix-suggestion">
                                    <p><strong>Suggested Fix:</strong> ${issue.fix}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                issuesHtml += `
                    <div class="severity-section">
                        <h2>${severity} (${issues.length})</h2>
                        ${issuesContent}
                    </div>
                `;
            }
        } else {
            issuesHtml = '<div class="success-message"><p>No security issues found in scanned files.</p></div>';
        }

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code Security Issues Report</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    h1, h2, h3, h4 {
                        color: var(--vscode-editor-foreground);
                    }
                    .summary {
                        margin-bottom: 20px;
                        padding: 10px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .severity-section {
                        margin-bottom: 30px;
                    }
                    .issue {
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .issue.error {
                        border-left: 4px solid var(--vscode-errorForeground);
                    }
                    .issue.warning {
                        border-left: 4px solid var(--vscode-editorWarning-foreground);
                    }
                    .issue.information {
                        border-left: 4px solid var(--vscode-editorInfo-foreground);
                    }
                    .issue.hint {
                        border-left: 4px solid var(--vscode-textLink-foreground);
                    }
                    .issue-details {
                        margin-top: 10px;
                        padding: 10px;
                        background-color: var(--vscode-editor-background);
                        border-radius: 5px;
                    }
                    .code-snippet {
                        margin: 10px 0;
                        padding: 10px;
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 3px;
                        overflow-x: auto;
                    }
                    .fix-suggestion {
                        margin-top: 10px;
                        padding: 10px;
                        background-color: var(--vscode-editorInlayHint-background);
                        border-radius: 3px;
                    }
                    .success-message {
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-left: 4px solid var(--vscode-terminal-ansiGreen);
                        border-radius: 5px;
                    }
                    .file-link {
                        color: var(--vscode-textLink-foreground);
                        text-decoration: none;
                        cursor: pointer;
                    }
                    .file-link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>Code Security Issues Report</h1>
                
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Files scanned: ${result.scannedFiles}</p>
                    <p>Total issues found: ${result.issues.length}</p>
                    <p>Error: ${issuesBySeverity.Error.length} | Warning: ${issuesBySeverity.Warning.length} | Information: ${issuesBySeverity.Information.length} | Hint: ${issuesBySeverity.Hint.length}</p>
                </div>
                
                ${issuesHtml}
                
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    document.addEventListener('click', (event) => {
                        const element = event.target;
                        if (element.classList.contains('file-link')) {
                            const file = element.getAttribute('data-file');
                            const line = parseInt(element.getAttribute('data-line'));
                            const column = parseInt(element.getAttribute('data-column'));
                            
                            vscode.postMessage({
                                command: 'openFile',
                                file: file,
                                line: line,
                                column: column
                            });
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Escape HTML special characters
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
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
