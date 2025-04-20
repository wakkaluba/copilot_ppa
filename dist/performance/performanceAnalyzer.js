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
exports.PerformanceAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Class responsible for analyzing code performance and identifying bottlenecks
 */
class PerformanceAnalyzer {
    context;
    statusBarItem;
    analysisResults;
    disposables = [];
    constructor(context) {
        this.context = context;
        this.analysisResults = new Map();
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.statusBarItem.text = '$(dashboard) Performance';
        this.statusBarItem.tooltip = 'Analyze code performance';
        this.statusBarItem.command = 'vscode-local-llm-agent.performance.analyzeActiveFile';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);
    }
    /**
     * Clean up event listeners and resources
     */
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.analysisResults.clear();
    }
    /**
     * Register an event listener with automatic cleanup
     */
    registerDisposable(disposable) {
        this.disposables.push(disposable);
    }
    /**
     * Analyze the active file for performance issues
     */
    async analyzeActiveFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active file to analyze');
            return null;
        }
        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Analyzing code performance",
            cancellable: true
        }, async () => {
            const fileUri = editor.document.uri;
            const filePath = fileUri.fsPath;
            const fileContent = editor.document.getText();
            const fileName = path.basename(filePath);
            const fileExtension = path.extname(filePath).toLowerCase();
            // Check if we have cached results
            if (this.analysisResults.has(filePath)) {
                const cachedResult = this.analysisResults.get(filePath);
                if (cachedResult && this.isCacheValid(cachedResult, fileContent)) {
                    return cachedResult;
                }
            }
            // Analyze based on file type
            let result;
            switch (fileExtension) {
                case '.js':
                case '.jsx':
                case '.ts':
                case '.tsx':
                    result = this.analyzeJavaScript(fileContent, filePath);
                    break;
                case '.py':
                    result = this.analyzePython(fileContent, filePath);
                    break;
                case '.java':
                    result = this.analyzeJava(fileContent, filePath);
                    break;
                case '.cs':
                    result = this.analyzeCSharp(fileContent, filePath);
                    break;
                default:
                    result = this.analyzeGeneric(fileContent, filePath);
            }
            // Cache the results
            this.analysisResults.set(filePath, result);
            return result;
        });
    }
    /**
     * Analyze multiple files in a workspace
     */
    async analyzeWorkspace() {
        let totalIssues = 0;
        let filesAnalyzed = 0;
        let criticalIssues = 0;
        let highIssues = 0;
        let mediumIssues = 0;
        let lowIssues = 0;
        const fileResults = [];
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Analyzing workspace performance",
            cancellable: true
        }, async (progress) => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                return;
            }
            // Find all relevant files
            const jsFiles = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx}', '**/node_modules/**');
            const pyFiles = await vscode.workspace.findFiles('**/*.py', '**/venv/**');
            const javaFiles = await vscode.workspace.findFiles('**/*.java', '**/build/**');
            const csFiles = await vscode.workspace.findFiles('**/*.cs', '**/bin/**');
            const allFiles = [...jsFiles, ...pyFiles, ...javaFiles, ...csFiles];
            const totalFiles = allFiles.length;
            // Analyze files
            for (let i = 0; i < allFiles.length; i++) {
                const fileUri = allFiles[i];
                const fileName = path.basename(fileUri.fsPath);
                progress.report({
                    message: `Analyzing ${fileName} (${i + 1}/${totalFiles})`,
                    increment: (100 / totalFiles)
                });
                try {
                    const document = await vscode.workspace.openTextDocument(fileUri);
                    const filePath = fileUri.fsPath;
                    const fileContent = document.getText();
                    const fileExtension = path.extname(filePath).toLowerCase();
                    // Analyze based on file type
                    let result;
                    switch (fileExtension) {
                        case '.js':
                        case '.jsx':
                        case '.ts':
                        case '.tsx':
                            result = this.analyzeJavaScript(fileContent, filePath);
                            break;
                        case '.py':
                            result = this.analyzePython(fileContent, filePath);
                            break;
                        case '.java':
                            result = this.analyzeJava(fileContent, filePath);
                            break;
                        case '.cs':
                            result = this.analyzeCSharp(fileContent, filePath);
                            break;
                        default:
                            result = this.analyzeGeneric(fileContent, filePath);
                    }
                    // Cache the results
                    this.analysisResults.set(filePath, result);
                    fileResults.push(result);
                    // Update counters
                    filesAnalyzed++;
                    totalIssues += result.issues.length;
                    // Count by severity
                    result.issues.forEach(issue => {
                        switch (issue.severity) {
                            case 'critical':
                                criticalIssues++;
                                break;
                            case 'high':
                                highIssues++;
                                break;
                            case 'medium':
                                mediumIssues++;
                                break;
                            case 'low':
                                lowIssues++;
                                break;
                        }
                    });
                }
                catch (error) {
                    console.error(`Error analyzing ${fileName}:`, error);
                }
            }
        });
        return {
            fileResults,
            summary: {
                filesAnalyzed,
                totalIssues,
                criticalIssues,
                highIssues,
                mediumIssues,
                lowIssues
            }
        };
    }
    /**
     * Show a report for a specific file's performance analysis
     */
    showFileAnalysisReport(result) {
        const panel = vscode.window.createWebviewPanel('performanceAnalysis', `Performance Analysis: ${path.basename(result.filePath)}`, vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(this.context.extensionPath)]
        });
        // Queue to handle messages in order
        const messageQueue = [];
        let processing = false;
        const processMessageQueue = async () => {
            if (processing)
                return;
            processing = true;
            while (messageQueue.length > 0) {
                const handler = messageQueue.shift();
                if (handler) {
                    try {
                        await handler();
                    }
                    catch (error) {
                        console.error('Error processing message:', error);
                    }
                }
            }
            processing = false;
        };
        panel.webview.onDidReceiveMessage(async (message) => {
            messageQueue.push(async () => {
                if (message.command === 'openFile') {
                    try {
                        const document = await vscode.workspace.openTextDocument(message.filePath);
                        const editor = await vscode.window.showTextDocument(document);
                        if (message.line) {
                            const position = new vscode.Position(message.line - 1, 0);
                            editor.selection = new vscode.Selection(position, position);
                            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                        }
                    }
                    catch (error) {
                        console.error('Error opening file:', error);
                        vscode.window.showErrorMessage(`Failed to open file: ${error}`);
                    }
                }
            });
            processMessageQueue();
        }, undefined, this.disposables);
        panel.webview.html = this.generateFileReportHtml(result);
        // Clean up when the panel is closed
        panel.onDidDispose(() => {
            messageQueue.length = 0;
            processing = false;
        }, null, this.disposables);
    }
    /**
     * Show a comprehensive workspace performance report
     */
    showWorkspaceAnalysisReport(result) {
        const panel = vscode.window.createWebviewPanel('workspacePerformanceAnalysis', 'Workspace Performance Analysis', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.generateWorkspaceReportHtml(result);
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'openFile') {
                const document = await vscode.workspace.openTextDocument(message.filePath);
                const editor = await vscode.window.showTextDocument(document);
                // Navigate to the specific line
                if (message.line) {
                    const position = new vscode.Position(message.line - 1, 0);
                    editor.selection = new vscode.Selection(position, position);
                    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                }
            }
            else if (message.command === 'showFileReport') {
                // Find the file result
                const fileResult = result.fileResults.find(fr => fr.filePath === message.filePath);
                if (fileResult) {
                    this.showFileAnalysisReport(fileResult);
                }
            }
        }, undefined, this.context.subscriptions);
    }
    /**
     * Generate HTML for a file performance report
     */
    generateFileReportHtml(result) {
        const fileName = path.basename(result.filePath);
        // Sort issues by severity
        const sortedIssues = [...result.issues].sort((a, b) => {
            const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
        // Generate issues HTML
        const issuesHtml = sortedIssues.map(issue => {
            return `
                <div class="issue ${issue.severity}">
                    <div class="issue-header">
                        <h3>${issue.title}</h3>
                        <span class="severity-tag ${issue.severity}">${issue.severity}</span>
                    </div>
                    <p>${issue.description}</p>
                    <div class="code-section">
                        <h4>Code:</h4>
                        <pre><code>${this.escapeHtml(issue.code)}</code></pre>
                    </div>
                    <div class="location">Line: ${issue.line}</div>
                    ${issue.solution ? `
                    <div class="solution">
                        <h4>Suggested Solution:</h4>
                        <p>${issue.solution}</p>
                        ${issue.solutionCode ? `<pre><code>${this.escapeHtml(issue.solutionCode)}</code></pre>` : ''}
                    </div>
                    ` : ''}
                    <button class="action-button" data-file="${result.filePath}" data-line="${issue.line}">Go to Location</button>
                </div>
            `;
        }).join('');
        // Generate HTML for metrics
        const metricsHtml = Object.entries(result.metrics).map(([key, value]) => {
            return `
                <tr>
                    <td>${this.formatMetricName(key)}</td>
                    <td>${value}</td>
                    <td>${this.getMetricRating(key, value)}</td>
                </tr>
            `;
        }).join('');
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Performance Analysis: ${fileName}</title>
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
                        margin: 20px 0;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .metrics-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .metrics-table th, .metrics-table td {
                        padding: 8px;
                        border: 1px solid var(--vscode-panel-border);
                        text-align: left;
                    }
                    .metrics-table th {
                        background-color: var(--vscode-panel-background);
                    }
                    .issue {
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .issue.critical {
                        border-left: 4px solid var(--vscode-errorForeground);
                    }
                    .issue.high {
                        border-left: 4px solid var(--vscode-editorWarning-foreground);
                    }
                    .issue.medium {
                        border-left: 4px solid var(--vscode-editorInfo-foreground);
                    }
                    .issue.low {
                        border-left: 4px solid var(--vscode-textLink-foreground);
                    }
                    .issue-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .severity-tag {
                        padding: 3px 8px;
                        border-radius: 3px;
                        font-size: 12px;
                        text-transform: uppercase;
                    }
                    .severity-tag.critical {
                        background-color: var(--vscode-errorForeground);
                        color: var(--vscode-editor-background);
                    }
                    .severity-tag.high {
                        background-color: var(--vscode-editorWarning-foreground);
                        color: var(--vscode-editor-background);
                    }
                    .severity-tag.medium {
                        background-color: var(--vscode-editorInfo-foreground);
                        color: var (--vscode-editor-background);
                    }
                    .severity-tag.low {
                        background-color: var(--vscode-textLink-foreground);
                        color: var(--vscode-editor-background);
                    }
                    .code-section {
                        margin: 10px 0;
                    }
                    .code-section pre {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                    .solution {
                        margin-top: 10px;
                        padding: 10px;
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 5px;
                        border-left: 3px solid var(--vscode-textLink-foreground);
                    }
                    .location {
                        margin: 10px 0;
                        font-style: italic;
                    }
                    .action-button {
                        padding: 6px 12px;
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                        margin-top: 10px;
                    }
                    .action-button:hover {
                        opacity: 0.9;
                    }
                    .rating {
                        font-weight: bold;
                    }
                    .rating.good {
                        color: var(--vscode-terminal-ansiGreen);
                    }
                    .rating.average {
                        color: var(--vscode-terminal-ansiYellow);
                    }
                    .rating.poor {
                        color: var(--vscode-terminal-ansiRed);
                    }
                    .no-issues {
                        margin: 20px 0;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                        border-left: 4px solid var(--vscode-terminal-ansiGreen);
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <h1>Performance Analysis: ${fileName}</h1>
                
                <div class="summary">
                    <h2>Summary</h2>
                    <p>File: ${result.filePath}</p>
                    <p>Total Performance Issues: ${result.issues.length}</p>
                    <p>
                        Critical: ${result.issues.filter(i => i.severity === 'critical').length} | 
                        High: ${result.issues.filter(i => i.severity === 'high').length} | 
                        Medium: ${result.issues.filter(i => i.severity === 'medium').length} | 
                        Low: ${result.issues.filter(i => i.severity === 'low').length}
                    </p>
                </div>
                
                <h2>Performance Metrics</h2>
                <table class="metrics-table">
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Rating</th>
                    </tr>
                    ${metricsHtml}
                </table>
                
                <h2>Performance Issues</h2>
                ${result.issues.length > 0 ? issuesHtml : '<div class="no-issues"><p>No performance issues detected in this file.</p></div>'}
                
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        // Handle "Go to Location" buttons
                        document.addEventListener('click', (e) => {
                            if (e.target.classList.contains('action-button')) {
                                const filePath = e.target.getAttribute('data-file');
                                const line = parseInt(e.target.getAttribute('data-line'));
                                
                                vscode.postMessage({
                                    command: 'openFile',
                                    filePath: filePath,
                                    line: line
                                });
                            }
                        });
                    })();
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Generate HTML for workspace performance report
     */
    generateWorkspaceReportHtml(result) {
        // Sort files by number of issues (most issues first)
        const sortedFiles = [...result.fileResults].sort((a, b) => {
            return b.issues.length - a.issues.length;
        });
        // Generate file list HTML
        const fileListHtml = sortedFiles.map(file => {
            const fileName = path.basename(file.filePath);
            const criticalCount = file.issues.filter(i => i.severity === 'critical').length;
            const highCount = file.issues.filter(i => i.severity === 'high').length;
            const mediumCount = file.issues.filter(i => i.severity === 'medium').length;
            const lowCount = file.issues.filter(i => i.severity === 'low').length;
            let severityClass = 'good';
            if (criticalCount > 0) {
                severityClass = 'critical';
            }
            else if (highCount > 0) {
                severityClass = 'high';
            }
            else if (mediumCount > 0) {
                severityClass = 'medium';
            }
            else if (lowCount > 0) {
                severityClass = 'low';
            }
            return `
                <tr class="${severityClass}">
                    <td><a href="#" class="file-link" data-path="${file.filePath}">${fileName}</a></td>
                    <td>${file.issues.length}</td>
                    <td>${criticalCount}</td>
                    <td>${highCount}</td>
                    <td>${mediumCount}</td>
                    <td>${lowCount}</td>
                    <td>
                        <button class="view-button" data-path="${file.filePath}">View Details</button>
                    </td>
                </tr>
            `;
        }).join('');
        // Generate common issues HTML
        const commonIssueTypes = this.identifyCommonIssueTypes(result.fileResults);
        const commonIssuesHtml = Object.entries(commonIssueTypes)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([issueType, data]) => {
            return `
                <div class="common-issue ${data.severity}">
                    <h3>${issueType}</h3>
                    <p>Found in ${data.count} locations across ${data.files.length} files</p>
                    <p>${data.description}</p>
                    <div class="solution">
                        <h4>General Solution:</h4>
                        <p>${data.solution}</p>
                    </div>
                </div>
            `;
        }).join('');
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Workspace Performance Analysis</title>
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
                        margin: 20px 0;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .summary-stats {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin-top: 15px;
                    }
                    .stat-box {
                        flex: 1;
                        min-width: 120px;
                        padding: 15px;
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 5px;
                        text-align: center;
                    }
                    .stat-box h3 {
                        margin-top: 0;
                    }
                    .files-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .files-table th, .files-table td {
                        padding: 8px;
                        border: 1px solid var(--vscode-panel-border);
                        text-align: left;
                    }
                    .files-table th {
                        background-color: var(--vscode-panel-background);
                    }
                    .files-table tr.critical td:first-child {
                        border-left: 4px solid var(--vscode-errorForeground);
                    }
                    .files-table tr.high td:first-child {
                        border-left: 4px solid var(--vscode-editorWarning-foreground);
                    }
                    .files-table tr.medium td:first-child {
                        border-left: 4px solid var (--vscode-editorInfo-foreground);
                    }
                    .files-table tr.low td:first-child {
                        border-left: 4px solid var (--vscode-textLink-foreground);
                    }
                    .files-table tr.good td:first-child {
                        border-left: 4px solid var(--vscode-terminal-ansiGreen);
                    }
                    .file-link {
                        color: var(--vscode-textLink-foreground);
                        text-decoration: none;
                    }
                    .file-link:hover {
                        text-decoration: underline;
                    }
                    .view-button {
                        padding: 3px 8px;
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                    }
                    .view-button:hover {
                        opacity: 0.9;
                    }
                    .common-issue {
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                    }
                    .common-issue.critical {
                        border-left: 4px solid var(--vscode-errorForeground);
                    }
                    .common-issue.high {
                        border-left: 4px solid var (--vscode-editorWarning-foreground);
                    }
                    .common-issue.medium {
                        border-left: 4px solid var (--vscode-editorInfo-foreground);
                    }
                    .common-issue.low {
                        border-left: 4px solid var (--vscode-textLink-foreground);
                    }
                    .solution {
                        margin-top: 10px;
                        padding: 10px;
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 5px;
                    }
                    .solution h4 {
                        margin-top: 0;
                    }
                    .chart-container {
                        width: 100%;
                        height: 300px;
                        margin: 20px 0;
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 5px;
                        padding: 15px;
                        box-sizing: border-box;
                    }
                </style>
            </head>
            <body>
                <h1>Workspace Performance Analysis</h1>
                
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Analyzed ${result.summary.filesAnalyzed} files for performance issues</p>
                    
                    <div class="summary-stats">
                        <div class="stat-box">
                            <h3>Total Issues</h3>
                            <p class="stat-value">${result.summary.totalIssues}</p>
                        </div>
                        <div class="stat-box" style="border-top: 3px solid var(--vscode-errorForeground);">
                            <h3>Critical</h3>
                            <p class="stat-value">${result.summary.criticalIssues}</p>
                        </div>
                        <div class="stat-box" style="border-top: 3px solid var(--vscode-editorWarning-foreground);">
                            <h3>High</h3>
                            <p class="stat-value">${result.summary.highIssues}</p>
                        </div>
                        <div class="stat-box" style="border-top: 3px solid var(--vscode-editorInfo-foreground);">
                            <h3>Medium</h3>
                            <p class="stat-value">${result.summary.mediumIssues}</p>
                        </div>
                        <div class="stat-box" style="border-top: 3px solid var(--vscode-textLink-foreground);">
                            <h3>Low</h3>
                            <p class="stat-value">${result.summary.lowIssues}</p>
                        </div>
                    </div>
                </div>
                
                <h2>Files with Performance Issues</h2>
                <table class="files-table">
                    <tr>
                        <th>File</th>
                        <th>Total Issues</th>
                        <th>Critical</th>
                        <th>High</th>
                        <th>Medium</th>
                        <th>Low</th>
                        <th>Action</th>
                    </tr>
                    ${fileListHtml}
                </table>
                
                <h2>Common Performance Issues</h2>
                ${commonIssuesHtml}
                
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        // Handle file links
                        document.addEventListener('click', (e) => {
                            if (e.target.classList.contains('file-link')) {
                                e.preventDefault();
                                const filePath = e.target.getAttribute('data-path');
                                
                                vscode.postMessage({
                                    command: 'openFile',
                                    filePath: filePath
                                });
                            }
                            
                            if (e.target.classList.contains('view-button')) {
                                const filePath = e.target.getAttribute('data-path');
                                
                                vscode.postMessage({
                                    command: 'showFileReport',
                                    filePath: filePath
                                });
                            }
                        });
                    })();
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Identify common types of issues across files
     */
    identifyCommonIssueTypes(fileResults) {
        const issueTypes = {};
        fileResults.forEach(fileResult => {
            fileResult.issues.forEach(issue => {
                if (!issueTypes[issue.title]) {
                    issueTypes[issue.title] = {
                        count: 0,
                        files: [],
                        severity: issue.severity,
                        description: issue.description,
                        solution: issue.solution || 'Analyze each occurrence individually.'
                    };
                }
                issueTypes[issue.title].count++;
                if (!issueTypes[issue.title].files.includes(fileResult.filePath)) {
                    issueTypes[issue.title].files.push(fileResult.filePath);
                }
                // Upgrade severity if needed
                const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
                if (severityOrder[issue.severity] < severityOrder[issueTypes[issue.title].severity]) {
                    issueTypes[issue.title].severity = issue.severity;
                }
            });
        });
        return issueTypes;
    }
    /**
     * Check if cached result is still valid
     */
    isCacheValid(cachedResult, currentContent) {
        // Simple check: has the file content changed?
        return cachedResult.fileHash === this.calculateContentHash(currentContent);
    }
    /**
     * Calculate a hash of the file content using a MurmurHash3-like algorithm
     */
    calculateContentHash(content) {
        const seed = 0x1234;
        const c1 = 0xcc9e2d51;
        const c2 = 0x1b873593;
        let h1 = seed;
        const chunks = Math.floor(content.length / 4);
        for (let i = 0; i < chunks; i++) {
            let k1 = 0;
            for (let j = 0; j < 4; j++) {
                k1 |= content.charCodeAt(i * 4 + j) << (j * 8);
            }
            k1 = Math.imul(k1, c1);
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = Math.imul(k1, c2);
            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1 = Math.imul(h1, 5) + 0xe6546b64;
        }
        // Handle remaining bytes
        let k1 = 0;
        const rem = content.length & 3;
        for (let i = 0; i < rem; i++) {
            k1 |= content.charCodeAt(chunks * 4 + i) << (i * 8);
        }
        k1 = Math.imul(k1, c1);
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = Math.imul(k1, c2);
        h1 ^= k1;
        // Finalization
        h1 ^= content.length;
        h1 ^= h1 >>> 16;
        h1 = Math.imul(h1, 0x85ebca6b);
        h1 ^= h1 >>> 13;
        h1 = Math.imul(h1, 0xc2b2ae35);
        h1 ^= h1 >>> 16;
        return h1 >>> 0; // Convert to unsigned 32-bit
    }
    /**
     * Format metric name for display
     */
    formatMetricName(key) {
        return key
            .split(/(?=[A-Z])/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    /**
     * Get a rating for a metric
     */
    getMetricRating(key, value) {
        // Define thresholds for different metrics
        const thresholds = {
            cyclomaticComplexity: [10, 20],
            nestedBlockDepth: [3, 5],
            functionLength: [100, 200],
            parameterCount: [4, 7],
            maintainabilityIndex: [65, 85], // Higher is better for this one
            commentRatio: [10, 20] // Higher is better for this one
        };
        if (!thresholds[key]) {
            return 'N/A';
        }
        // For metrics where higher is better
        if (key === 'maintainabilityIndex' || key === 'commentRatio') {
            if (value > thresholds[key][1]) {
                return '<span class="rating good">Good</span>';
            }
            else if (value > thresholds[key][0]) {
                return '<span class="rating average">Average</span>';
            }
            else {
                return '<span class="rating poor">Poor</span>';
            }
        }
        // For metrics where lower is better
        else {
            if (value < thresholds[key][0]) {
                return '<span class="rating good">Good</span>';
            }
            else if (value < thresholds[key][1]) {
                return '<span class="rating average">Average</span>';
            }
            else {
                return '<span class="rating poor">Poor</span>';
            }
        }
    }
    /**
     * Analyze JavaScript/TypeScript code for performance issues
     */
    analyzeJavaScript(fileContent, filePath) {
        const issues = [];
        const fileHash = this.calculateContentHash(fileContent);
        const lines = fileContent.split('\n');
        // Check for inefficient loops
        const inefficientLoopRegex = /for\s*\(.+\)\s*{[\s\S]*?array\s*\.push|for\s*\(.+\)\s*{[\s\S]*?array\s*\[.+\]\s*=/g;
        let match;
        while ((match = inefficientLoopRegex.exec(fileContent)) !== null) {
            const matchedText = match[0];
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient Array Modification in Loop',
                description: 'Modifying arrays in loops can be inefficient due to potential reallocations.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 5),
                solution: 'Consider pre-allocating arrays or using map/filter/reduce instead of push in loops.',
                solutionCode: 'const results = Array(inputArray.length);\nfor (let i = 0; i < inputArray.length; i++) {\n  results[i] = transform(inputArray[i]);\n}\n\n// Or better yet:\nconst results = inputArray.map(item => transform(item));'
            });
        }
        // Check for deeply nested callbacks
        const deepCallbackRegex = /\.then\s*\(\s*(?:function\s*\([^)]*\)|[^=()]+=>)/g;
        const callbackMatches = fileContent.match(deepCallbackRegex) || [];
        // Find sections with multiple then() calls
        const thenChainRegex = /(\.\s*then\s*\([^)]+\)\s*){3,}/g;
        if (thenChainRegex.test(fileContent)) {
            const lineIndex = this.findLineNumber(fileContent, fileContent.search(thenChainRegex));
            issues.push({
                title: 'Promise Chain Too Long',
                description: 'Long promise chains can make code hard to follow and debug.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 5),
                solution: 'Consider using async/await for better readability and error handling.',
                solutionCode: 'async function fetchData() {\n  try {\n    const result1 = await step1();\n    const result2 = await step2(result1);\n    return await step3(result2);\n  } catch (error) {\n    console.error(\'Error:\', error);\n  }\n}'
            });
        }
        // Check for array access in tight loops
        const arrayAccessInLoopRegex = /for\s*\(.+\)\s*{[\s\S]{0,100}?(\w+)\[(\w+)\][\s\S]{0,100}?}/g;
        while ((match = arrayAccessInLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Repetitive Array Access in Loop',
                description: 'Repeatedly accessing array elements inside loops can be inefficient.',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 5),
                solution: 'For repeated access to the same element, cache it in a variable outside the inner loop.',
                solutionCode: 'const len = array.length; // Cache length\nfor (let i = 0; i < len; i++) {\n  const item = array[i]; // Cache element\n  // Use item instead of array[i]\n}'
            });
        }
        // Check for inefficient DOM operations
        const domOperationsRegex = /document\.getElementById|document\.querySelector|document\.getElementsBy|document\.querySelectorAll/g;
        const domOperations = [];
        while ((match = domOperationsRegex.exec(fileContent)) !== null) {
            domOperations.push({
                operation: match[0],
                index: match.index
            });
        }
        // Check for DOM operations in loops
        const domInLoopRegex = /for\s*\([^)]+\)\s*{[\s\S]{0,200}?(document\.get|document\.query)/g;
        while ((match = domInLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'DOM Operation in Loop',
                description: 'DOM operations inside loops can cause layout thrashing and significant performance issues.',
                severity: 'critical',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 5),
                solution: 'Cache DOM references outside loops and batch DOM updates using DocumentFragment.',
                solutionCode: '// Cache DOM references outside loop\nconst container = document.getElementById(\'container\');\nconst fragment = document.createDocumentFragment();\n\nfor (let i = 0; i < items.length; i++) {\n  const element = document.createElement(\'div\');\n  element.textContent = items[i];\n  fragment.appendChild(element);\n}\n\n// Single DOM update\ncontainer.appendChild(fragment);'
            });
        }
        // Check for multiple consecutive DOM updates
        if (domOperations.length > 5) {
            let consecutiveCount = 1;
            let consecutiveStart = 0;
            for (let i = 1; i < domOperations.length; i++) {
                const prevIndex = domOperations[i - 1].index;
                const currIndex = domOperations[i].index;
                // If operations are close to each other (within ~200 chars)
                if (currIndex - prevIndex < 200) {
                    if (consecutiveCount === 1) {
                        consecutiveStart = prevIndex;
                    }
                    consecutiveCount++;
                }
                else {
                    consecutiveCount = 1;
                }
                if (consecutiveCount >= 3) {
                    const lineIndex = this.findLineNumber(fileContent, consecutiveStart);
                    issues.push({
                        title: 'Multiple Consecutive DOM Updates',
                        description: 'Multiple DOM updates in sequence can cause layout thrashing as each update may trigger a reflow.',
                        severity: 'high',
                        line: lineIndex + 1,
                        code: this.extractCodeSnippet(lines, lineIndex, 5),
                        solution: 'Batch DOM updates to minimize reflows and repaints.',
                        solutionCode: '// Instead of:\nelement1.className = \'new-class\';\nelement1.style.color = \'red\';\nelement2.textContent = \'New text\';\n\n// Use:\nrequestAnimationFrame(() => {\n  element1.className = \'new-class\';\n  element1.style.color = \'red\';\n  element2.textContent = \'New text\';\n});'
                    });
                    break;
                }
            }
        }
        // Check for recursive functions without terminal conditions
        const recursiveRegex = /function\s+(\w+)[^{]*{[\s\S]*?\1\s*\([^)]*\)/g;
        while ((match = recursiveRegex.exec(fileContent)) !== null) {
            const functionName = match[1];
            const functionBody = this.extractFunctionBody(fileContent, match.index);
            // Check if there's a clear terminal condition
            if (!functionBody.includes('if') && !functionBody.includes('return')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Potential Infinite Recursion',
                    description: 'Recursive function without clear terminal condition may cause stack overflow.',
                    severity: 'critical',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 5),
                    solution: 'Ensure recursive functions have a clear terminal condition to prevent stack overflow.',
                    solutionCode: 'function recursiveFunction(param, depth = 0) {\n  // Terminal condition\n  if (depth > MAX_DEPTH || !param) {\n    return defaultValue;\n  }\n  \n  // Recursive call with explicit tracking\n  return recursiveFunction(newParam, depth + 1);\n}'
                });
            }
        }
        // Calculate metrics
        const metrics = this.calculateJavaScriptMetrics(fileContent);
        return {
            filePath,
            fileHash,
            issues,
            metrics
        };
    }
    /**
     * Calculate JavaScript/TypeScript code metrics
     */
    calculateJavaScriptMetrics(fileContent) {
        const metrics = {};
        // Calculate cyclomatic complexity (very simple approximation)
        const conditionalsCount = (fileContent.match(/if|else|for|while|switch|case|&&|\|\||\?/g) || []).length;
        metrics.cyclomaticComplexity = conditionalsCount;
        // Calculate lines of code
        const linesOfCode = fileContent.split('\n').filter(line => line.trim().length > 0).length;
        metrics.linesOfCode = linesOfCode;
        // Calculate comment ratio
        const commentLines = (fileContent.match(/\/\/|\/\*|\*\//g) || []).length;
        metrics.commentRatio = Math.round((commentLines / linesOfCode) * 100);
        // Calculate function count
        const functionCount = (fileContent.match(/function|\=>/g) || []).length;
        metrics.functionCount = functionCount;
        // Estimate maintainability index (simplified version)
        // Scale from 0-100, higher is better
        const avgLineLength = fileContent.length / linesOfCode;
        metrics.maintainabilityIndex = Math.min(100, Math.max(0, 100 - (conditionalsCount / 10) - (avgLineLength / 2) + (metrics.commentRatio / 2)));
        // Estimate function length
        const functionLengthTotal = this.estimateAverageFunctionLength(fileContent);
        metrics.functionLength = functionLengthTotal > 0 ? Math.round(functionLengthTotal / Math.max(1, functionCount)) : 0;
        // Estimate nested block depth
        metrics.nestedBlockDepth = this.estimateMaxNestedDepth(fileContent);
        // Estimate parameter count
        metrics.parameterCount = this.estimateAverageParameterCount(fileContent);
        return metrics;
    }
    /**
     * Estimate the average function length
     */
    estimateAverageFunctionLength(content) {
        const functionStartRegex = /function\s+\w+\s*\([^)]*\)\s*{|(?:const|let|var)\s+\w+\s*=\s*(?:function\s*\([^)]*\)|(?:\([^)]*\)|\w+)\s*=>)\s*{/g;
        const matches = Array.from(content.matchAll(functionStartRegex));
        if (matches.length === 0) {
            return 0;
        }
        let totalLines = 0;
        for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index;
            const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
            const functionContent = content.substring(start, end);
            const lines = functionContent.split('\n').length;
            totalLines += lines;
        }
        return totalLines / matches.length;
    }
    /**
     * Estimate the maximum nested depth
     */
    estimateMaxNestedDepth(content) {
        const lines = content.split('\n');
        let maxDepth = 0;
        let currentDepth = 0;
        for (const line of lines) {
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            currentDepth += openBraces - closeBraces;
            maxDepth = Math.max(maxDepth, currentDepth);
        }
        return maxDepth;
    }
    /**
     * Estimate the average parameter count
     */
    estimateAverageParameterCount(content) {
        const paramRegex = /function\s+\w+\s*\(([^)]*)\)|(?:const|let|var)\s+\w+\s*=\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)|\w+)\s*=>)/g;
        const matches = Array.from(content.matchAll(paramRegex));
        if (matches.length === 0) {
            return 0;
        }
        let totalParams = 0;
        let functionCount = 0;
        for (const match of matches) {
            functionCount++;
            // Find which capture group has the parameters
            const params = match[1] || match[2] || match[3] || '';
            if (params.trim()) {
                totalParams += params.split(',').length;
            }
        }
        return Math.round(totalParams / functionCount);
    }
    /**
     * Analyze Python code for performance issues
     */
    analyzePython(fileContent, filePath) {
        const issues = [];
        const fileHash = this.calculateContentHash(fileContent);
        const lines = fileContent.split('\n');
        // Check for inefficient list operations
        const listAppendRegex = /for\s+\w+\s+in\s+.+:\s*\n\s*.+\.append/g;
        let match;
        while ((match = listAppendRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient List Building',
                description: 'Using .append() in a loop to build a list is less efficient than list comprehensions.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use list comprehensions for better performance.',
                solutionCode: '# Instead of:\nresult = []\nfor item in items:\n    result.append(transform(item))\n\n# Use:\nresult = [transform(item) for item in items]'
            });
        }
        // Check for inefficient string concatenation
        const strConcatRegex = /\+\s*=\s*['"]/g;
        while ((match = strConcatRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient String Concatenation',
                description: 'Using += for string concatenation in loops can be inefficient.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use str.join() or f-strings for string concatenation.',
                solutionCode: '# Instead of:\nresult = ""\nfor item in items:\n    result += str(item)\n\n# Use:\nresult = "".join(str(item) for item in items)\n\n# Or with f-strings:\nresult = f"${item1}${item2}${item3}"'
            });
        }
        // Check for global variable usage
        const globalVarRegex = /global\s+\w+/g;
        while ((match = globalVarRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Global Variable Usage',
                description: 'Using global variables can lead to maintenance issues and potential performance impacts.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Pass variables as parameters instead of using global variables.',
                solutionCode: '# Instead of:\nglobal counter\ndef increment():\n    global counter\n    counter += 1\n\n# Use:\ndef increment(counter):\n    return counter + 1'
            });
        }
        // Check for expensive copy operations
        const expensiveCopyRegex = /\blist\s*\([^)]*\)|\b\w+\.copy\s*\(\)|\b\w+\[:\]/g;
        while ((match = expensiveCopyRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Expensive Copy Operation',
                description: 'Creating unnecessary copies of lists or other sequences can be memory-intensive.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider if a copy is really needed, or use itertools or generators.',
                solutionCode: '# Instead of:\nfor item in list(expensive_generator):\n    process(item)\n\n# Use:\nfor item in expensive_generator:\n    process(item)\n\n# Instead of list copy:\nfrom itertools import islice\nresult = islice(original, 0, None)'
            });
        }
        // Check for repeated dictionary access
        const dictAccessRegex = /for\s+\w+\s+in\s+.+:\s*\n\s*.*?(\w+)\[\w+\]/g;
        while ((match = dictAccessRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Repeated Dictionary Access',
                description: 'Repeatedly accessing dictionary values in a loop can be inefficient.',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use dict.get() with default value or cache the lookup result.',
                solutionCode: '# Instead of:\nfor key in keys:\n    if key in mydict:\n        value = mydict[key]\n        # process value\n\n# Use:\nfor key in keys:\n    value = mydict.get(key)\n    if value is not None:\n        # process value'
            });
        }
        // Check for inefficient exception handling
        const broadExceptRegex = /except\s*:/g;
        while ((match = broadExceptRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Broad Exception Clause',
                description: 'Using bare except clause can catch and hide important exceptions, impacting debugging.',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Specify the exceptions you expect to handle.',
                solutionCode: '# Instead of:\ntry:\n    do_something()\nexcept:\n    handle_error()\n\n# Use:\ntry:\n    do_something()\nexcept ValueError as e:\n    handle_value_error(e)\nexcept KeyError as e:\n    handle_key_error(e)'
            });
        }
        // Check for inefficient range() usage
        const rangeRegex = /range\(len\((\w+)\)\)/g;
        while ((match = rangeRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient Range Usage',
                description: 'Using range(len(x)) is less readable and efficient than directly iterating.',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Directly iterate over the sequence',
                solutionCode: '# Instead of:\nfor i in range(len(items)):\n    item = items[i]\n\n# Use:\nfor item in items:'
            });
        }
        // Check for inefficient list comprehension filters
        const listCompFilterRegex = /\[\s*x\s+for\s+x\s+in\s+\w+\s+if\s+x\s+in\s+\w+\s*\]/g;
        while ((match = listCompFilterRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient List Comprehension Filter',
                description: 'Using "if x in list" in a list comprehension can be O(n^2)',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Convert the lookup sequence to a set first',
                solutionCode: '# Instead of:\n[x for x in items if x in lookup_list]\n\n# Use:\nlookup_set = set(lookup_list)\n[x for x in items if x in lookup_set]'
            });
        }
        // Check for repeated method lookups in loops
        const methodLookupRegex = /for\s+\w+\s+in\s+.+:\s*\n\s*.*?(\w+)\.\w+\s*\(/g;
        while ((match = methodLookupRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Repeated Method Lookup',
                description: 'Looking up object methods inside loops can be inefficient',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Cache method lookup outside the loop',
                solutionCode: '# Instead of:\nfor item in items:\n    item.expensive_method()\n\n# Use:\nmethod = items[0].expensive_method.__get__(items[0])\nfor item in items:\n    method()'
            });
        }
        // Check for inefficient default dict usage
        const defaultDictRegex = /if\s+(\w+)\s+not\s+in\s+(\w+):\s*\n\s*\2\[\1\]\s*=\s*\{?\[?\]/g;
        while ((match = defaultDictRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Manual Default Dict Implementation',
                description: 'Manual dictionary default value checking can be replaced with defaultdict',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use collections.defaultdict',
                solutionCode: '# Instead of:\nif key not in d:\n    d[key] = []\nd[key].append(value)\n\n# Use:\nfrom collections import defaultdict\nd = defaultdict(list)\nd[key].append(value)'
            });
        }
        // Check for inefficient list comprehensions
        const listComprehensionRegex = /\[\s*for\s+.*?\s+in\s+.*?\s+for\s+.*?\]/g;
        while ((match = listComprehensionRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Complex List Comprehension',
                description: 'Nested list comprehensions can be memory intensive',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using generator expressions or breaking into steps',
                solutionCode: '# Instead of:\n[x + y for x in range(1000) for y in range(1000)]\n\n# Use:\n((x, y) for x in range(1000) for y in range(1000))'
            });
        }
        // Check for inefficient database operations
        const dbOperationsRegex = /cursor\.(execute|executemany)\s*\([^)]+\)/g;
        while ((match = dbOperationsRegex.exec(fileContent)) !== null) {
            if (fileContent.includes('for') && fileContent.includes('commit')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Inefficient Database Operations',
                    description: 'Multiple database operations in a loop can be slow',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use batch operations with executemany()',
                    solutionCode: '# Instead of:\nfor item in items:\n    cursor.execute("INSERT INTO table VALUES (?)", (item,))\n\n# Use:\ncursor.executemany("INSERT INTO table VALUES (?)", [(item,) for item in items])'
                });
            }
        }
        // Check for inefficient file operations
        const fileOpsRegex = /open\([^)]+\)/g;
        while ((match = fileOpsRegex.exec(fileContent)) !== null) {
            if (!fileContent.includes('with')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Unsafe File Operations',
                    description: 'Files should be handled using context managers',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use with statement for file operations',
                    solutionCode: '# Instead of:\nf = open("file.txt")\ntry:\n    content = f.read()\nfinally:\n    f.close()\n\n# Use:\nwith open("file.txt") as f:\n    content = f.read()'
                });
            }
        }
        // Check for inefficient set/dict comprehensions
        const setDictCompRegex = /\{[^}]+for\s+.*?\s+in\s+.*?\}/g;
        while ((match = setDictCompRegex.exec(fileContent)) !== null) {
            if (fileContent.includes('if') && fileContent.includes('else')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Complex Dictionary/Set Comprehension',
                    description: 'Complex comprehensions can be hard to read and maintain',
                    severity: 'low',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Break complex comprehensions into multiple steps',
                    solutionCode: '# Instead of:\n{k: v1 if cond else v2 for k, v1, v2 in data}\n\n# Use:\nresult = {}\nfor k, v1, v2 in data:\n    result[k] = v1 if cond else v2'
                });
            }
        }
        // Calculate Python-specific metrics
        const metrics = {
            linesOfCode: lines.length,
            cyclomaticComplexity: this.calculatePythonComplexity(fileContent),
            importCount: (fileContent.match(/^import\s+|^from\s+\w+\s+import/gm) || []).length,
            classCount: (fileContent.match(/^class\s+\w+/gm) || []).length,
            functionCount: (fileContent.match(/^def\s+\w+/gm) || []).length,
            commentRatio: this.calculateCommentRatio(fileContent),
            avgFunctionLength: this.calculateAveragePythonFunctionLength(fileContent),
            nestedDepth: this.calculatePythonNestedDepth(fileContent),
            generatorExprCount: (fileContent.match(/\([\w\s.,]+for\s+\w+\s+in\s+[\w\s.,]+\)/g) || []).length,
            listCompCount: (fileContent.match(/\[[\w\s.,]+for\s+\w+\s+in\s+[\w\s.,]+\]/g) || []).length,
            asyncFunctionCount: (fileContent.match(/async\s+def\s+/g) || []).length,
            contextManagerCount: (fileContent.match(/with\s+/g) || []).length,
            decoratorCount: (fileContent.match(/^@\w+/gm) || []).length,
            withStatementCount: (fileContent.match(/with\s+/g) || []).length,
            listComprehensionCount: (fileContent.match(/\[.*?for.*?\]/g) || []).length,
            generatorExprCount: (fileContent.match(/\(.*?for.*?\)/g) || []).length,
            contextManagerCount: (fileContent.match(/class\s+\w+.*?:\s*\n\s*def\s+__enter__/gs) || []).length,
            asyncioUsage: (fileContent.match(/import\s+asyncio|from\s+asyncio\s+import/g) || []).length
        };
        return { filePath, fileHash, issues, metrics };
    }
    /**
     * Calculate Python-specific comment ratio
     */
    calculateCommentRatio(content) {
        const lines = content.split('\n');
        const commentLines = lines.filter(line => line.trim().startsWith('#') ||
            line.trim().startsWith('"""') ||
            line.trim().startsWith("'''")).length;
        return Math.round((commentLines / lines.length) * 100);
    }
    /**
     * Calculate average Python function length
     */
    calculateAveragePythonFunctionLength(content) {
        const functionMatches = Array.from(content.matchAll(/^def\s+\w+/gm));
        if (functionMatches.length === 0)
            return 0;
        let totalLines = 0;
        for (let i = 0; i < functionMatches.length; i++) {
            const start = functionMatches[i].index;
            const end = i < functionMatches.length - 1 ? functionMatches[i + 1].index : content.length;
            const functionContent = content.substring(start, end);
            totalLines += functionContent.split('\n').length;
        }
        return Math.round(totalLines / functionMatches.length);
    }
    /**
     * Calculate Python nested block depth
     */
    calculatePythonNestedDepth(content) {
        const lines = content.split('\n');
        let maxDepth = 0;
        let currentDepth = 0;
        for (const line of lines) {
            const indentation = line.match(/^(\s*)/)[0].length;
            const depth = Math.floor(indentation / 4); // Python uses 4 spaces for indentation
            currentDepth = depth;
            maxDepth = Math.max(maxDepth, currentDepth);
        }
        return maxDepth;
    }
    /**
     * Analyze Java code for performance issues
     */
    analyzeJava(fileContent, filePath) {
        const issues = [];
        const fileHash = this.calculateContentHash(fileContent);
        const lines = fileContent.split('\n');
        // Check for inefficient string concatenation
        const stringConcatRegex = /String\s+(\w+)\s*=\s*"[^"]*";\s*(?:\n|\r\n?)[^}]*\1\s*\+=/g;
        let match;
        while ((match = stringConcatRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient String Concatenation',
                description: 'Using the += operator for string concatenation in a loop creates many temporary objects.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use StringBuilder for string concatenation operations.',
                solutionCode: '// Instead of:\nString result = "";\nfor (String item : items) {\n    result += item;\n}\n\n// Use:\nStringBuilder sb = new StringBuilder();\nfor (String item : items) {\n    sb.append(item);\n}\nString result = sb.toString();'
            });
        }
        // Check for inefficient collection iteration
        const inefficientIterationRegex = /for\s*\(\s*int\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*(\w+)\.size\(\)\s*;/g;
        while ((match = inefficientIterationRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient Collection Iteration',
                description: 'Calling .size() in every loop iteration is inefficient.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Cache the collection size before the loop.',
                solutionCode: '// Instead of:\nfor (int i = 0; i < list.size(); i++) {\n    // loop body\n}\n\n// Use:\nint size = list.size();\nfor (int i = 0; i < size; i++) {\n    // loop body\n}'
            });
        }
        // Check for inefficient exception handling
        const catchBlockRegex = /catch\s*\(\s*(Exception|Throwable)\s+\w+\s*\)\s*\{/g;
        while ((match = catchBlockRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Generic Exception Handling',
                description: 'Catching generic exceptions can mask errors and impact performance.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Catch specific exceptions instead of using generic Exception or Throwable.',
                solutionCode: '// Instead of:\ntry {\n    // risky operation\n} catch (Exception e) {\n    // handle error\n}\n\n// Use:\ntry {\n    // risky operation\n} catch (IOException e) {\n    // handle IO error\n} catch (SQLException e) {\n    // handle SQL error\n}'
            });
        }
        // Check for inefficient stream usage
        const repeatedStreamRegex = /(\w+)\.stream\(\)[^\n]+\.stream\(\)/g;
        while ((match = repeatedStreamRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient Stream Usage',
                description: 'Creating multiple streams in sequence is inefficient.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Chain stream operations instead of creating multiple streams.',
                solutionCode: '// Instead of:\nlist.stream().filter(x -> x > 0).collect(Collectors.toList()).stream().map(String::valueOf)\n\n// Use:\nlist.stream()\n    .filter(x -> x > 0)\n    .map(String::valueOf)'
            });
        }
        // Check for synchronized collection usage
        const synchronizedCollectionRegex = /Collections\.synchronized\w+|Vector<|Hashtable</g;
        while ((match = synchronizedCollectionRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Legacy Synchronized Collections',
                description: 'Using legacy synchronized collections can cause unnecessary blocking.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use concurrent collections from java.util.concurrent package.',
                solutionCode: '// Instead of:\nList<String> list = Collections.synchronizedList(new ArrayList<>());\nMap<String, Integer> map = new Hashtable<>();\n\n// Use:\nList<String> list = new CopyOnWriteArrayList<>();\nMap<String, Integer> map = new ConcurrentHashMap<>();'
            });
        }
        // Check for inefficient string operations in loops
        const stringOpInLoopRegex = /for\s*\([^{]+\{\s*[^}]*?String\s+\w+\s*=\s*[^;]+?\.substring\(/g;
        while ((match = stringOpInLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'String Operations in Loop',
                description: 'Performing string operations in loops can create many temporary objects.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use StringBuilder for string operations in loops.',
                solutionCode: '// Instead of:\nString result = "";\nfor (String s : strings) {\n    result += s.substring(1);\n}\n\n// Use:\nStringBuilder result = new StringBuilder();\nfor (String s : strings) {\n    result.append(s.substring(1));\n}'
            });
        }
        // Check for inefficient String concatenation in loops
        const stringConcatRegex = /for\s*\([^)]+\)\s*\{[^}]*\+\s*=\s*[^}]+\}/g;
        while ((match = stringConcatRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient String Concatenation',
                description: 'String concatenation in loops creates many temporary objects',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use StringBuilder instead of String concatenation',
                solutionCode: '// Instead of:\nString result = "";\nfor (String item : items) {\n    result += item;\n}\n\n// Use:\nStringBuilder result = new StringBuilder();\nfor (String item : items) {\n    result.append(item);\n}'
            });
        }
        // Check for manual array copying
        const arrayCopyRegex = /for\s*\([^)]+\)\s*\{[^}]*\[\s*i\s*\]\s*=\s*[^}]+\[\s*i\s*\][^}]*\}/g;
        while ((match = arrayCopyRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Manual Array Copy',
                description: 'Manual array copying is less efficient than System.arraycopy',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use System.arraycopy or Arrays.copyOf',
                solutionCode: '// Instead of:\nfor (int i = 0; i < arr.length; i++) {\n    newArr[i] = arr[i];\n}\n\n// Use:\nSystem.arraycopy(arr, 0, newArr, 0, arr.length);\n// Or:\nnewArr = Arrays.copyOf(arr, arr.length);'
            });
        }
        // Check for inefficient collection size checks
        const sizeCheckRegex = /if\s*\([^)]*\.size\s*\(\)\s*==\s*0\)/g;
        while ((match = sizeCheckRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient Collection Size Check',
                description: 'Checking collection.size() == 0 is less readable than isEmpty()',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use isEmpty() method',
                solutionCode: '// Instead of:\nif (collection.size() == 0)\n\n// Use:\nif (collection.isEmpty())'
            });
        }
        // Check for non-final static fields
        const nonFinalStaticRegex = /static\s+(?!final\s+)\w+\s+\w+/g;
        while ((match = nonFinalStaticRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Non-final Static Field',
                description: 'Non-final static fields can cause thread safety issues',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider making the field final if it does not need to be modified',
                solutionCode: '// Instead of:\nstatic int counter;\n\n// Use:\nstatic final int COUNTER;'
            });
        }
        // Check for inefficient Stream operations
        const streamOpsRegex = /\.stream\(\).*?\.collect\(/gs;
        while ((match = streamOpsRegex.exec(fileContent)) !== null) {
            if (match[0].includes('.forEach(') || match[0].includes('.parallel()')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Potentially Inefficient Stream Operation',
                    description: 'Complex stream operations might be less performant than traditional loops',
                    severity: 'medium',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Consider using traditional loops for simple operations or ensure parallel streams are used appropriately',
                    solutionCode: '// Instead of:\nlist.stream().forEach(item -> process(item));\n\n// Use:\nfor (Item item : list) {\n    process(item);\n}'
                });
            }
        }
        // Check for inefficient String operations in loops
        const stringConcatRegex = /for\s*\([^)]+\)\s*{[^}]*?\+=/gs;
        while ((match = stringConcatRegex.exec(fileContent)) !== null) {
            if (!match[0].includes('StringBuilder')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Inefficient String Concatenation',
                    description: 'String concatenation in loops should use StringBuilder',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use StringBuilder for string concatenation in loops',
                    solutionCode: '// Instead of:\nString result = "";\nfor (String s : strings) {\n    result += s;\n}\n\n// Use:\nStringBuilder result = new StringBuilder();\nfor (String s : strings) {\n    result.append(s);\n}'
                });
            }
        }
        // Check for synchronized collection usage
        const syncCollectionRegex = /Collections\.synchronized(Map|List|Set)/g;
        while ((match = syncCollectionRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Synchronized Collection Usage',
                description: 'Synchronized collections can be a performance bottleneck',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using concurrent collections from java.util.concurrent',
                solutionCode: '// Instead of:\nMap<K,V> map = Collections.synchronizedMap(new HashMap<>());\n\n// Use:\nMap<K,V> map = new ConcurrentHashMap<>();'
            });
        }
        // Calculate Java-specific metrics
        const metrics = {
            linesOfCode: lines.length,
            classCount: (fileContent.match(/\bclass\s+\w+/g) || []).length,
            methodCount: (fileContent.match(/\b(public|private|protected)\s+\w+\s+\w+\s*\(/g) || []).length,
            importCount: (fileContent.match(/^import\s+/gm) || []).length,
            commentRatio: Math.round(((fileContent.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length / lines.length) * 100),
            averageMethodLength: this.calculateJavaAverageMethodLength(fileContent),
            nestingDepth: this.estimateMaxNestedDepth(fileContent),
            lambdaCount: (fileContent.match(/\s*->\s*{/g) || []).length,
            tryBlockCount: (fileContent.match(/\btry\s*{/g) || []).length,
            synchronizedCount: (fileContent.match(/\bsynchronized\s*\(/g) || []).length,
            streamApiUsage: (fileContent.match(/\.stream\(\)/g) || []).length,
            finalFieldCount: (fileContent.match(/final\s+\w+/g) || []).length,
            genericTypeCount: (fileContent.match(/<[^>]+>/g) || []).length,
            streamOperationsCount: (fileContent.match(/\.stream\(\)/g) || []).length,
            parallelStreamCount: (fileContent.match(/\.parallelStream\(\)/g) || []).length,
            stringBuilderUsage: (fileContent.match(/StringBuilder|StringBuffer/g) || []).length,
            synchronizedBlockCount: (fileContent.match(/synchronized\s*\([^)]*\)/g) || []).length,
            concurrentUtilsCount: (fileContent.match(/java\.util\.concurrent/g) || []).length
        };
        return { filePath, fileHash, issues, metrics };
    }
    /**
     * Calculate average method length for Java code
     */
    calculateJavaAverageMethodLength(content) {
        const methodMatches = content.match(/\b(public|private|protected)\s+\w+\s+\w+\s*\([^{]*\{(?:\{[^}]*\}|[^}])*?\n\s*\}/g) || [];
        if (methodMatches.length === 0)
            return 0;
        const totalLines = methodMatches.reduce((sum, method) => sum + method.split('\n').length, 0);
        return Math.round(totalLines / methodMatches.length);
    }
    /**
     * Analyze C# code for performance issues
     */
    analyzeCSharp(fileContent, filePath) {
        const issues = [];
        const fileHash = this.calculateContentHash(fileContent);
        const lines = fileContent.split('\n');
        // Check for inefficient string concatenation
        const stringConcatRegex = /string\s+(\w+)\s*=\s*"[^"]*";\s*(?:\n|\r\n?)[^}]*\1\s*\+=/g;
        let match;
        while ((match = stringConcatRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient String Concatenation',
                description: 'Using += for string concatenation creates unnecessary temporary string objects.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use StringBuilder for string concatenation operations.',
                solutionCode: '// Instead of:\nstring result = "";\nforeach (var item in items)\n    result += item;\n\n// Use:\nvar sb = new StringBuilder();\nforeach (var item in items)\n    sb.Append(item);\nstring result = sb.ToString();'
            });
        }
        // Check for inefficient LINQ usage
        const repeatedLinqRegex = /\.(Where|Select)\([^)]+\)\.(ToList|ToArray)\(\)[^.]*\.(Where|Select)\(/g;
        while ((match = repeatedLinqRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient LINQ Chaining',
                description: 'Converting to List/Array mid-chain breaks the deferred execution and can impact performance.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Chain LINQ operations without intermediate materialization.',
                solutionCode: '// Instead of:\nvar result = items.Where(x => x > 0).ToList().Select(x => x * 2);\n\n// Use:\nvar result = items.Where(x => x > 0).Select(x => x * 2);'
            });
        }
        // Check for allocation in loops
        const newInLoopRegex = /(?:for|foreach)\s*\([^{]+\{\s*[^}]*?new\s+(?!Exception|StringBuilder|DateTime)\w+/g;
        while ((match = newInLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Object Allocation in Loop',
                description: 'Creating new objects inside loops can cause memory pressure.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider object pooling or moving object creation outside the loop.',
                solutionCode: '// Instead of:\nforeach (var item in items) {\n    var processor = new DataProcessor();\n    processor.Process(item);\n}\n\n// Use:\nvar processor = new DataProcessor();\nforeach (var item in items) {\n    processor.Process(item);\n}'
            });
        }
        // Check for async void usage
        const asyncVoidRegex = /async\s+void\s+\w+\s*\(/g;
        while ((match = asyncVoidRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Async Void Method',
                description: 'async void methods can\'t be awaited and can cause unhandled exceptions.',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use async Task instead of async void except for event handlers.',
                solutionCode: '// Instead of:\npublic async void ProcessData() {\n    await Task.Delay(1000);\n}\n\n// Use:\npublic async Task ProcessData() {\n    await Task.Delay(1000);\n}'
            });
        }
        // Check for disposable resource usage
        const disposableRegex = /new\s+(SqlConnection|StreamReader|StreamWriter|FileStream)/g;
        while ((match = disposableRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            const surroundingCode = this.extractCodeSnippet(lines, lineIndex, 5);
            if (!surroundingCode.includes("using")) {
                issues.push({
                    title: 'Undisposed Resource',
                    description: 'IDisposable resources should be properly disposed.',
                    severity: 'critical',
                    line: lineIndex + 1,
                    code: surroundingCode,
                    solution: 'Use using statement or using declaration.',
                    solutionCode: '// Instead of:\nvar reader = new StreamReader(path);\ntry {\n    // use reader\n} finally {\n    reader.Dispose();\n}\n\n// Use:\nusing var reader = new StreamReader(path);\n// use reader // automatically disposed'
                });
            }
        }
        // Check for LINQ usage in performance-critical loops
        const linqInLoopsRegex = /for\s*\([^)]+\)\s*\{[^}]*\.(Where|Select|FirstOrDefault|ToList)\([^}]+\}/g;
        while ((match = linqInLoopsRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'LINQ in Performance-Critical Loop',
                description: 'LINQ operations inside loops can create unnecessary allocations',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using traditional loops for performance-critical sections',
                solutionCode: '// Instead of:\nfor (int i = 0; i < items.Count; i++) {\n    var filtered = items.Where(x => x.IsValid);\n}\n\n// Use:\nfor (int i = 0; i < items.Count; i++) {\n    if (items[i].IsValid) {\n        // Process item\n    }\n}'
            });
        }
        // Check for async void methods
        const asyncVoidRegex = /async\s+void\s+\w+\s*\(/g;
        while ((match = asyncVoidRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Async Void Method',
                description: 'Async void methods cannot be awaited and can cause unhandled exceptions',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use async Task instead of async void',
                solutionCode: '// Instead of:\nasync void ProcessData() {\n    await Task.Delay(1000);\n}\n\n// Use:\nasync Task ProcessData() {\n    await Task.Delay(1000);\n}'
            });
        }
        // Check for inefficient string operations
        const stringConcatRegex = /string\.Concat|(\s*\+\s*(?!"\s*\+))/g;
        while ((match = stringConcatRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient String Operation',
                description: 'Multiple string concatenations create unnecessary temporary objects',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use StringBuilder for multiple concatenations',
                solutionCode: '// Instead of:\nstring result = "";\nfor (int i = 0; i < 100; i++) {\n    result += i.ToString();\n}\n\n// Use:\nvar sb = new StringBuilder();\nfor (int i = 0; i < 100; i++) {\n    sb.Append(i);\n}'
            });
        }
        // Check for disposable resources without using
        const disposableRegex = /new\s+(SqlConnection|FileStream|StreamReader|StreamWriter)/g;
        while ((match = disposableRegex.exec(fileContent)) !== null) {
            if (!fileContent.includes("using") && !fileContent.includes("IDisposable")) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Unmanaged Disposable Resource',
                    description: 'Disposable resources should be properly disposed using using statement',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Wrap disposable objects in using statements',
                    solutionCode: '// Instead of:\nvar reader = new StreamReader(path);\n\n// Use:\nusing (var reader = new StreamReader(path)) {\n    // Use reader\n}'
                });
            }
        }
        // Check for inefficient LINQ usage
        const linqRegex = /\.Select\(.*?\)\.Where\(|\.Where\(.*?\)\.Select\(/gs;
        while ((match = linqRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Inefficient LINQ Operation Order',
                description: 'Where should typically come before Select for better performance',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Reorder LINQ operations to filter data before transforming it',
                solutionCode: '// Instead of:\nitems.Select(x => Transform(x)).Where(x => Filter(x))\n\n// Use:\nitems.Where(x => Filter(x)).Select(x => Transform(x))'
            });
        }
        // Check for inefficient string operations in loops
        const stringBuilderRegex = /for\s*\([^)]+\)\s*{[^}]*?\+=/gs;
        while ((match = stringBuilderRegex.exec(fileContent)) !== null) {
            if (!match[0].includes('StringBuilder')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'String Concatenation in Loop',
                    description: 'String concatenation in loops should use StringBuilder',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use StringBuilder for string concatenation in loops',
                    solutionCode: '// Instead of:\nstring result = "";\nforeach (var item in items) {\n    result += item;\n}\n\n// Use:\nvar sb = new StringBuilder();\nforeach (var item in items) {\n    sb.Append(item);\n}'
                });
            }
        }
        // Check for async void usage
        const asyncVoidRegex = /async\s+void\s+\w+\s*\(/g;
        while ((match = asyncVoidRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Async Void Usage',
                description: 'Async void methods can lead to unobserved exceptions and are harder to test',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use async Task instead of async void except for event handlers',
                solutionCode: '// Instead of:\nasync void DoWorkAsync()\n\n// Use:\nasync Task DoWorkAsync()'
            });
        }
        // Enhance metrics
        const metrics = {
            linesOfCode: lines.length,
            classCount: (fileContent.match(/\bclass\s+\w+/g) || []).length,
            methodCount: (fileContent.match(/\b(public|private|protected)\s+[\w<>]+\s+\w+\s*\(/g) || []).length,
            usingCount: (fileContent.match(/^using\s+/gm) || []).length,
            commentRatio: Math.round(((fileContent.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length / lines.length) * 100),
            averageMethodLength: this.calculateCSharpAverageMethodLength(fileContent),
            nestingDepth: this.estimateMaxNestedDepth(fileContent),
            lambdaCount: (fileContent.match(/=>\s*{|\)\s*=>/g) || []).length,
            asyncMethodCount: (fileContent.match(/\basync\s+/g) || []).length,
            linqUsageCount: (fileContent.match(/\.(Where|Select|OrderBy|GroupBy|Join|Skip|Take)\(/g) || []).length,
            asyncMethodCount: (fileContent.match(/async\s+\w+/g) || []).length,
            usingStatementCount: (fileContent.match(/using\s*\(/g) || []).length,
            linqUsageCount: (fileContent.match(/\.(Where|Select|FirstOrDefault|ToList)\(/g) || []).length,
            disposableUsageCount: (fileContent.match(/IDisposable/g) || []).length,
            linqOperationsCount: (fileContent.match(/\.(Select|Where|OrderBy|GroupBy)\(/g) || []).length,
            stringBuilderUsage: (fileContent.match(/StringBuilder/g) || []).length,
            lockStatementCount: (fileContent.match(/lock\s*\([^)]*\)/g) || []).length,
            disposableUsageCount: (fileContent.match(/using\s*\([^)]*\)/g) || []).length
        };
        return { filePath, fileHash, issues, metrics };
    }
    /**
     * Calculate average method length for C# code
     */
    calculateCSharpAverageMethodLength(content) {
        const methodMatches = content.match(/\b(public|private|protected)\s+[\w<>]+\s+\w+\s*\([^{]*\{(?:\{[^}]*\}|[^}])*?\n\s*\}/g) || [];
        if (methodMatches.length === 0)
            return 0;
        const totalLines = methodMatches.reduce((sum, method) => sum + method.split('\n').length, 0);
        return Math.round(totalLines / methodMatches.length);
    }
    /**
     * Analyze any code with generic patterns
     */
    analyzeGeneric(fileContent, filePath) {
        const issues = [];
        const fileHash = this.calculateContentHash(fileContent);
        const lines = fileContent.split('\n');
        // Generic analysis for any type of code file
        // Check for very long lines
        lines.forEach((line, index) => {
            if (line.length > 120) {
                issues.push({
                    title: 'Very Long Line',
                    description: 'Excessively long lines can impact readability and may indicate overly complex logic.',
                    severity: 'low',
                    line: index + 1,
                    code: line.length > 150 ? line.substring(0, 147) + '...' : line,
                    solution: 'Break into multiple lines for better readability and maintainability.'
                });
            }
        });
        // Check for large functions/methods (simplistic approach)
        let inFunction = false;
        let functionStart = 0;
        let bracketCount = 0;
        let currentLine = 0;
        for (const line of lines) {
            currentLine++;
            if (line.match(/\bfunction\b|\bdef\b|[a-zA-Z_]\w*\s*\([^)]*\)\s*\{/)) {
                if (!inFunction) {
                    inFunction = true;
                    functionStart = currentLine;
                }
            }
            if (inFunction) {
                bracketCount += (line.match(/{/g) || []).length;
                bracketCount -= (line.match(/}/g) || []).length;
                if (bracketCount === 0 && line.includes('}')) {
                    inFunction = false;
                    const functionLength = currentLine - functionStart;
                    if (functionLength > 50) {
                        issues.push({
                            title: 'Large Function',
                            description: `Function starting at line ${functionStart} is ${functionLength} lines long. Large functions are harder to understand and maintain.`,
                            severity: functionLength > 100 ? 'high' : 'medium',
                            line: functionStart,
                            code: `// Function starts at line ${functionStart} and ends at line ${currentLine}\n// Length: ${functionLength} lines`,
                            solution: 'Break large functions into smaller, more focused functions that each do one thing well.'
                        });
                    }
                }
            }
        }
        return {
            filePath,
            fileHash,
            issues,
            metrics: { linesOfCode: lines.length }
        };
    }
    /**
     * Extract a snippet of code around a specific line
     */
    extractCodeSnippet(lines, centerLine, contextLines) {
        const startLine = Math.max(0, centerLine - Math.floor(contextLines / 2));
        const endLine = Math.min(lines.length - 1, centerLine + Math.ceil(contextLines / 2));
        return lines.slice(startLine, endLine + 1).join('\n');
    }
    /**
     * Find the line number for a specific position in file content
     */
    findLineNumber(content, position) {
        const textBefore = content.substring(0, position);
        return textBefore.split('\n').length - 1;
    }
    /**
     * Extract the function body for analysis
     */
    extractFunctionBody(content, position) {
        let bracketCount = 0;
        let startPos = position;
        // Find the opening brace
        while (startPos < content.length && content[startPos] !== '{') {
            startPos++;
        }
        if (startPos >= content.length) {
            return '';
        }
        let endPos = startPos;
        // Find the matching closing brace
        do {
            if (content[endPos] === '{')
                bracketCount++;
            if (content[endPos] === '}')
                bracketCount--;
            endPos++;
        } while (bracketCount > 0 && endPos < content.length);
        return content.substring(startPos, endPos);
    }
    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
exports.PerformanceAnalyzer = PerformanceAnalyzer;
//# sourceMappingURL=performanceAnalyzer.js.map