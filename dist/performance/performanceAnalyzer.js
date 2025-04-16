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
    constructor(context) {
        this.disposables = [];
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
                        color: var(--vscode-editor-background);
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
                        border-left: 4px solid var(--vscode-editorInfo-foreground);
                    }
                    .files-table tr.low td:first-child {
                        border-left: 4px solid var(--vscode-textLink-foreground);
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
                        border-left: 4px solid var(--vscode-editorWarning-foreground);
                    }
                    .common-issue.medium {
                        border-left: 4px solid var(--vscode-editorInfo-foreground);
                    }
                    .common-issue.low {
                        border-left: 4px solid var(--vscode-textLink-foreground);
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
     * Calculate a hash of the file content
     */
    calculateContentHash(content) {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
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
        // This is a placeholder implementation - in a real system, you would have more sophisticated Python analysis
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
        return {
            filePath,
            fileHash,
            issues,
            metrics: { linesOfCode: lines.length } // Simple metric for placeholder
        };
    }
    /**
     * Analyze Java code for performance issues
     */
    analyzeJava(fileContent, filePath) {
        const issues = [];
        const fileHash = this.calculateContentHash(fileContent);
        const lines = fileContent.split('\n');
        // This is a placeholder implementation - in a real system, you would have more sophisticated Java analysis
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
        return {
            filePath,
            fileHash,
            issues,
            metrics: { linesOfCode: lines.length } // Simple metric for placeholder
        };
    }
    /**
     * Analyze C# code for performance issues
     */
    analyzeCSharp(fileContent, filePath) {
        const issues = [];
        const fileHash = this.calculateContentHash(fileContent);
        const lines = fileContent.split('\n');
        // This is a placeholder implementation - in a real system, you would have more sophisticated C# analysis
        return {
            filePath,
            fileHash,
            issues,
            metrics: { linesOfCode: lines.length } // Simple metric for placeholder
        };
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
                bracketCount += (line.match(/\{/g) || []).length;
                bracketCount -= (line.match(/\}/g) || []).length;
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