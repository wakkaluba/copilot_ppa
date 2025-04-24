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
    patternService;
    analyzerService;
    diagnosticService;
    fixService;
    disposables = [];
    webviewMap = new Map();
    messageQueue = [];
    isProcessing = false;
    constructor(context) {
        this.patternService = new SecurityPatternService_1.SecurityPatternService();
        this.analyzerService = new SecurityAnalyzerService_1.SecurityAnalyzerService(this.patternService);
        this.diagnosticService = new SecurityDiagnosticService_1.SecurityDiagnosticService(context);
        this.fixService = new SecurityFixService_1.SecurityFixService(context);
    }
    async scanActiveFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { issues: [], scannedFiles: 0 };
        }
        return this.scanFile(editor.document.uri);
    }
    async scanFile(fileUri) {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const result = await this.analyzerService.scanDocument(document);
        this.diagnosticService.report(fileUri, result.diagnostics);
        return { issues: result.issues, scannedFiles: 1 };
    }
    async scanWorkspace(progressCallback) {
        return this.analyzerService.scanWorkspace(progressCallback);
    }
    async showSecurityReport(result) {
        const panel = vscode.window.createWebviewPanel('securityIssuesReport', 'Code Security Issues Report', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = SecurityReportHtmlProvider_1.SecurityReportHtmlProvider.getHtml(result);
    }
    registerWebview(id, webview) {
        this.webviewMap.set(id, webview);
        const disposable = webview.onDidReceiveMessage(message => this.handleWebviewMessage(webview, message), undefined, this.disposables);
        this.disposables.push(disposable);
    }
    unregisterWebview(id) {
        this.webviewMap.delete(id);
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
                        await this.fixService.applyFix(message.issueId, message.path);
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
    async processMessageQueue() {
        if (this.isProcessing) {
            return;
        }
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
    dispose() {
        this.diagnosticService.dispose();
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.webviewMap.clear();
        this.messageQueue = [];
        this.isProcessing = false;
    }
}
exports.CodeSecurityScanner = CodeSecurityScanner;
//# sourceMappingURL=codeScanner.js.map