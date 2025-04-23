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
exports.SecurityReportService = void 0;
const vscode = __importStar(require("vscode"));
const SecurityReportHtmlProvider_1 = require("../providers/SecurityReportHtmlProvider");
/**
 * Service for generating and displaying security reports
 */
class SecurityReportService {
    context;
    reportProvider;
    lastReport;
    constructor(context) {
        this.context = context;
        this.reportProvider = new SecurityReportHtmlProvider_1.SecurityReportHtmlProvider(context);
    }
    /**
     * Show a report of code security issues
     */
    async showCodeIssues(result) {
        const panel = this.createReportPanel('Code Security Issues');
        await this.reportProvider.updateCodeReport(panel, result);
        this.lastReport = { uri: panel.webview.html, type: 'code' };
    }
    /**
     * Show a dependency vulnerability report
     */
    async showDependencyReport(result) {
        const panel = this.createReportPanel('Dependency Vulnerabilities');
        await this.reportProvider.updateDependencyReport(panel, result);
        this.lastReport = { uri: panel.webview.html, type: 'dependencies' };
    }
    /**
     * Show a filtered list of security issues
     */
    async showFilteredIssues(issues, issueId) {
        const panel = this.createReportPanel(`Security Issues - ${issueId}`);
        await this.reportProvider.updateFilteredReport(panel, issues);
        this.lastReport = { uri: panel.webview.html, type: 'filtered' };
    }
    /**
     * Show a complete security analysis report
     */
    async showFullReport(codeResult, dependencyResult, recommendationsResult) {
        const panel = this.createReportPanel('Security Analysis Report');
        await this.reportProvider.updateFullReport(panel, {
            codeResult,
            dependencyResult,
            recommendationsResult,
            timestamp: Date.now()
        });
        this.lastReport = { uri: panel.webview.html, type: 'full' };
    }
    /**
     * Create a new webview panel for displaying reports
     */
    createReportPanel(title) {
        const panel = vscode.window.createWebviewPanel('securityReport', title, vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true
        });
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'showIssue':
                    await this.showIssueInEditor(message.issue);
                    break;
                case 'applyFix':
                    await vscode.commands.executeCommand('vscode-local-llm-agent.security.applyFix', message.issue);
                    break;
                case 'exportReport':
                    await this.exportReport(message.format);
                    break;
            }
        });
        return panel;
    }
    /**
     * Show a security issue in the editor
     */
    async showIssueInEditor(issue) {
        const document = await vscode.workspace.openTextDocument(issue.file);
        const editor = await vscode.window.showTextDocument(document);
        // Highlight the relevant line
        const range = document.lineAt(issue.line).range;
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
    /**
     * Export the current report
     */
    async exportReport(format) {
        if (!this.lastReport)
            return;
        const filters = {
            'HTML Files': ['html'],
            'PDF Files': ['pdf'],
            'Markdown Files': ['md']
        }[`${format.toUpperCase()} Files`];
        const uri = await vscode.window.showSaveDialog({
            filters: { [format]: filters }
        });
        if (uri) {
            try {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(await this.reportProvider.exportReport(this.lastReport.type, format)));
                vscode.window.showInformationMessage(`Report exported successfully to ${uri.fsPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to export report: ${error}`);
            }
        }
    }
    dispose() {
        this.reportProvider.dispose();
    }
}
exports.SecurityReportService = SecurityReportService;
//# sourceMappingURL=SecurityReportService.js.map