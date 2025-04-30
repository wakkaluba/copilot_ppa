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
exports.SecurityManager = void 0;
const vscode = __importStar(require("vscode"));
const SecurityWebviewService_1 = require("../services/security/SecurityWebviewService");
const SecurityScanService_1 = require("../services/security/SecurityScanService");
const logger_1 = require("../utils/logger");
class SecurityManager {
    context;
    static instance;
    panel;
    logger;
    webviewService;
    scanService;
    statusBarItem;
    disposables = [];
    lastResult;
    constructor(context) {
        this.context = context;
        this.logger = logger_1.Logger.getInstance();
        this.webviewService = new SecurityWebviewService_1.SecurityWebviewService();
        this.scanService = new SecurityScanService_1.SecurityScanService(context);
        // Initialize status bar
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = '$(shield) Security';
        this.statusBarItem.tooltip = 'Run security analysis';
        this.statusBarItem.command = 'copilot-ppa.security.showPanel';
        this.statusBarItem.show();
        this.disposables.push(this.statusBarItem);
        this.registerCommands();
    }
    static getInstance(context) {
        if (!SecurityManager.instance) {
            SecurityManager.instance = new SecurityManager(context);
        }
        return SecurityManager.instance;
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.security.showPanel', () => {
            this.show();
        }), vscode.commands.registerCommand('copilot-ppa.security.runScan', async () => {
            await this.runScan();
        }), vscode.commands.registerCommand('copilot-ppa.security.showIssueDetails', (issueId) => {
            this.showIssueDetails(issueId);
        }));
    }
    async show() {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }
            this.panel = vscode.window.createWebviewPanel('securityPanel', 'Security Analysis', vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            });
            if (this.panel) {
                this.panel.webview.html = this.webviewService.generateWebviewContent(this.panel.webview, this.lastResult);
                this.registerWebviewMessageHandlers();
                this.panel.onDidDispose(() => {
                    this.panel = undefined;
                }, null, this.disposables);
                if (!this.lastResult) {
                    await this.runScan();
                }
            }
        }
        catch (error) {
            this.logger.error('Error showing security panel', error);
            throw error;
        }
    }
    registerWebviewMessageHandlers() {
        if (!this.panel) {
            return;
        }
        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                let issueId;
                switch (message.command) {
                    case 'refresh':
                        await this.runScan();
                        break;
                    case 'showDetails':
                        issueId = message.issueId;
                        await this.showIssueDetails(issueId);
                        break;
                    default:
                        this.logger.warn(`Unknown command received: ${message.command}`);
                }
            }
            catch (error) {
                this.logger.error('Error handling security panel message', error);
                this.showErrorMessage('Failed to process command');
            }
        }, undefined, this.disposables);
    }
    async runScan() {
        if (!this.panel) {
            return;
        }
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Running security analysis...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });
                this.lastResult = await this.scanService.runFullScan();
                progress.report({ increment: 100 });
                this.updateWebviewContent();
            });
        }
        catch (error) {
            this.logger.error('Error running security scan', error);
            this.showErrorMessage('Failed to complete security scan');
        }
    }
    updateWebviewContent() {
        if (!this.panel) {
            return;
        }
        try {
            this.panel.webview.html = this.webviewService.generateWebviewContent(this.panel.webview, this.lastResult);
        }
        catch (error) {
            this.logger.error('Error updating security panel content', error);
            this.showErrorMessage('Failed to update panel content');
        }
    }
    async showIssueDetails(issueId) {
        if (!this.panel || !this.lastResult) {
            return;
        }
        try {
            const issue = this.lastResult.issues.find(issue => issue.id === issueId);
            if (!issue) {
                this.logger.warn(`Issue with ID ${issueId} not found`);
                this.showErrorMessage(`Issue with ID ${issueId} not found`);
                return;
            }
            // Get detailed information about the issue
            const detailedInfo = await this.scanService.getIssueDetails(issueId);
            // Send the detailed information to the webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'showIssueDetails',
                    issue: detailedInfo
                });
            }
        }
        catch (error) {
            this.logger.error(`Error showing issue details for ${issueId}`, error);
            this.showErrorMessage('Failed to retrieve issue details');
        }
    }
    showErrorMessage(message) {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                message
            });
        }
    }
    dispose() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.scanService.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
exports.SecurityManager = SecurityManager;
//# sourceMappingURL=securityManager.js.map