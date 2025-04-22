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
/**
 * Main security manager class that coordinates security features through specialized services
 */
class SecurityManager {
    context;
    analysisSvc;
    dependencySvc;
    recommendationSvc;
    reportSvc;
    commandSvc;
    statusBarItem;
    disposables = [];
    constructor(context, analysisSvc, dependencySvc, recommendationSvc, reportSvc, commandSvc) {
        this.context = context;
        this.analysisSvc = analysisSvc;
        this.dependencySvc = dependencySvc;
        this.recommendationSvc = recommendationSvc;
        this.reportSvc = reportSvc;
        this.commandSvc = commandSvc;
        // Initialize status bar
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.initializeStatusBar();
        this.registerCommands();
    }
    initializeStatusBar() {
        this.statusBarItem.text = '$(shield) Security';
        this.statusBarItem.tooltip = 'Run security analysis';
        this.statusBarItem.command = 'vscode-local-llm-agent.security.runFullAnalysis';
        this.statusBarItem.show();
        this.disposables.push(this.statusBarItem);
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('vscode-local-llm-agent.security.scanActiveFile', () => this.scanActiveFile()), vscode.commands.registerCommand('vscode-local-llm-agent.security.scanWorkspace', () => this.scanWorkspace()), vscode.commands.registerCommand('vscode-local-llm-agent.security.runFullAnalysis', () => this.runFullSecurityAnalysis()), vscode.commands.registerCommand('vscode-local-llm-agent.security.checkDependencies', () => this.checkDependencies()), vscode.commands.registerCommand('vscode-local-llm-agent.security.generateRecommendations', () => this.generateSecurityRecommendations()), vscode.commands.registerCommand('vscode-local-llm-agent.securityIssues.showAll', (issueId) => this.showSecurityIssuesByType(issueId)));
    }
    async scanActiveFile() {
        try {
            const result = await this.analysisSvc.scanActiveFile();
            await this.reportSvc.showCodeIssues(result);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error scanning active file: ${error}`);
        }
    }
    async scanWorkspace() {
        try {
            const result = await this.analysisSvc.scanWorkspace();
            await this.reportSvc.showCodeIssues(result);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error scanning workspace: ${error}`);
        }
    }
    async checkDependencies() {
        try {
            const result = await this.dependencySvc.scanDependencies();
            await this.reportSvc.showDependencyReport(result);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error checking dependencies: ${error}`);
        }
    }
    async generateSecurityRecommendations() {
        try {
            const result = await this.recommendationSvc.generate();
            await this.reportSvc.showRecommendations(result);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating recommendations: ${error}`);
        }
    }
    async runFullSecurityAnalysis() {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running full security analysis",
            cancellable: true
        }, async (progress) => {
            try {
                progress.report({ message: "Scanning code...", increment: 0 });
                const codeResult = await this.analysisSvc.scanWorkspace();
                progress.report({ message: "Checking dependencies...", increment: 33 });
                const depResult = await this.dependencySvc.scanDependencies();
                progress.report({ message: "Generating recommendations...", increment: 66 });
                const recResult = await this.recommendationSvc.generate();
                progress.report({ message: "Preparing report...", increment: 90 });
                await this.reportSvc.showFullReport(codeResult, depResult, recResult);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error during security analysis: ${error}`);
            }
        });
    }
    async showSecurityIssuesByType(issueId) {
        try {
            const result = await this.analysisSvc.getIssuesByType(issueId);
            await this.reportSvc.showFilteredIssues(result, issueId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error showing security issues: ${error}`);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.analysisSvc.dispose();
        this.dependencySvc.dispose();
        this.recommendationSvc.dispose();
        this.reportSvc.dispose();
        this.commandSvc.dispose();
    }
}
exports.SecurityManager = SecurityManager;
//# sourceMappingURL=securityManager.js.map