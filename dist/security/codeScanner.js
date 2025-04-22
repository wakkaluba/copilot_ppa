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
exports.CodeSecurityScanner = void 0;
const vscode = __importStar(require("vscode"));
const SecurityPatternService_1 = require("./services/SecurityPatternService");
const SecurityAnalyzerService_1 = require("./services/SecurityAnalyzerService");
const SecurityDiagnosticService_1 = require("./services/SecurityDiagnosticService");
const SecurityFixService_1 = require("./services/SecurityFixService");
const SecurityReportHtmlProvider_1 = require("../providers/SecurityReportHtmlProvider");
/**
 * Class responsible for scanning code for potential security issues
 */
class CodeSecurityScanner {
    context;
    securityPatterns;
    diagnosticCollection;
    messageQueue = [];
    isProcessing = false;
    disposables = [];
    webviewMap = new Map();
    patternService;
    analyzerService;
    diagnosticService;
    fixService;
    constructor(context) {
        this.context = context;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('securityIssues');
        this.context.subscriptions.push(this.diagnosticCollection);
        this.securityPatterns = this.loadSecurityPatterns();
        this.patternService = new SecurityPatternService_1.SecurityPatternService();
        this.analyzerService = new SecurityAnalyzerService_1.SecurityAnalyzerService(this.patternService);
        this.diagnosticService = new SecurityDiagnosticService_1.SecurityDiagnosticService(context);
        this.fixService = new SecurityFixService_1.SecurityFixService(context);
    }
    /**
     * Loads security patterns from predefined rules
     */
    loadSecurityPatterns() {
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
    async scanActiveFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { issues: [], scannedFiles: 0 };
        }
        return this.scanFile(editor.document.uri);
    }
    /**
     * Scan a specific file for security issues
     */
    async scanFile(fileUri) {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const result = await this.analyzerService.scanDocument(document);
        this.diagnosticService.report(fileUri, result.diagnostics);
        return { issues: result.issues, scannedFiles: 1 };
    }
    updateDiagnostics(fileUri, diagnostics) {
        // Queue diagnostic updates to prevent race conditions
        this.messageQueue.push(async () => {
            this.diagnosticCollection.set(fileUri, diagnostics);
        });
        this.processMessageQueue();
    }
    async scanFileContent(document) {
        const languageId = document.languageId;
        const text = document.getText();
        const diagnostics = [];
        const issues = [];
        // Filter for patterns relevant to this file type
        const relevantPatterns = this.securityPatterns.filter(pattern => pattern.languages.includes(languageId));
        for (const pattern of relevantPatterns) {
            const regex = pattern.pattern;
            let match;
            // Reset regex for new file
            regex.lastIndex = 0;
            while ((match = regex.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, `${pattern.name}: ${pattern.description}`, pattern.severity);
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
    async scanWorkspace(progressCallback) {
        const result = await this.analyzerService.scanWorkspace(progressCallback);
        result.issues.forEach(issue => {
            this.diagnosticService.report(vscode.Uri.file(issue.file), []);
        });
        return result;
    }
    /**
     * Find all relevant files in the workspace
     */
    async findFiles(folderUri) {
        // Get list of file extensions to scan based on languages in patterns
        const languages = new Set();
        this.securityPatterns.forEach(pattern => pattern.languages.forEach(lang => languages.add(lang)));
        // Map languages to glob patterns
        const globPatterns = [];
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
    severityToString(severity) {
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
    async showSecurityReport(result) {
        const panel = vscode.window.createWebviewPanel('securityIssuesReport', 'Code Security Issues Report', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = SecurityReportHtmlProvider_1.SecurityReportHtmlProvider.getHtml(result);
    }
    async processMessageQueue() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        while (this.messageQueue.length > 0) {
            const handler = this.messageQueue.shift();
            if (handler) {
                try {
                    await handler();
                }
                catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        }
        this.isProcessing = false;
    }
    handleWebviewMessage(webview, message) {
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
            }
            catch (error) {
                console.error('Error handling webview message:', error);
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        });
        this.processMessageQueue();
    }
    registerWebview(id, webview) {
        this.webviewMap.set(id, webview);
        const disposable = webview.onDidReceiveMessage(message => this.handleWebviewMessage(webview, message), undefined, this.disposables);
        this.disposables.push(disposable);
    }
    unregisterWebview(id) {
        this.webviewMap.delete(id);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.webviewMap.clear();
        this.messageQueue = [];
        this.isProcessing = false;
    }
    /**
     * Apply security fix for a specific issue
     */
    async applySecurityFix(issueId, filePath) {
        await this.fixService.applyFix(issueId, filePath);
    }
}
exports.CodeSecurityScanner = CodeSecurityScanner;
//# sourceMappingURL=codeScanner.js.map