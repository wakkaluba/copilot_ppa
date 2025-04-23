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
exports.SecurityCommandService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Service for registering and handling security-related commands
 */
class SecurityCommandService {
    analysisSvc;
    dependencySvc;
    recommendationSvc;
    reportSvc;
    disposables = [];
    constructor(analysisSvc, dependencySvc, recommendationSvc, reportSvc) {
        this.analysisSvc = analysisSvc;
        this.dependencySvc = dependencySvc;
        this.recommendationSvc = recommendationSvc;
        this.reportSvc = reportSvc;
        this.registerCommands();
    }
    /**
     * Register all security-related commands
     */
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('vscode-local-llm-agent.security.scanActiveFile', () => this.scanActiveFile()), vscode.commands.registerCommand('vscode-local-llm-agent.security.scanWorkspace', () => this.scanWorkspace()), vscode.commands.registerCommand('vscode-local-llm-agent.security.checkDependencies', () => this.checkDependencies()), vscode.commands.registerCommand('vscode-local-llm-agent.security.generateRecommendations', () => this.generateRecommendations()), vscode.commands.registerCommand('vscode-local-llm-agent.security.runFullAnalysis', () => this.runFullAnalysis()), vscode.commands.registerCommand('vscode-local-llm-agent.security.showSecurityIssues', (issueId) => this.showSecurityIssues(issueId)), vscode.commands.registerCommand('vscode-local-llm-agent.security.fixAll', () => this.fixAllIssues()), vscode.commands.registerCommand('vscode-local-llm-agent.security.applyFix', (issue) => this.applyFix(issue)));
    }
    /**
     * Scan the active file for security issues
     */
    async scanActiveFile() {
        try {
            const result = await this.analysisSvc.scanActiveFile();
            await this.reportSvc.showCodeIssues(result);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error scanning file: ${error}`);
        }
    }
    /**
     * Scan the entire workspace for security issues
     */
    async scanWorkspace() {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Scanning workspace for security issues",
            cancellable: true
        }, async (progress) => {
            try {
                const result = await this.analysisSvc.scanWorkspace(message => progress.report({ message }));
                await this.reportSvc.showCodeIssues(result);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error scanning workspace: ${error}`);
            }
        });
    }
    /**
     * Check dependencies for vulnerabilities
     */
    async checkDependencies() {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Checking dependencies for vulnerabilities",
            cancellable: true
        }, async (progress) => {
            try {
                const result = await this.dependencySvc.scanDependencies(message => progress.report({ message }));
                await this.reportSvc.showDependencyReport(result);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error checking dependencies: ${error}`);
            }
        });
    }
    /**
     * Generate security recommendations
     */
    async generateRecommendations() {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating security recommendations",
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: "Analyzing current security state..." });
                const result = await this.recommendationSvc.generate();
                await this.reportSvc.showFullReport({ issues: [], scannedFiles: 0, timestamp: Date.now() }, { vulnerabilities: [], totalDependencies: 0, hasVulnerabilities: false, timestamp: Date.now() }, result);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error generating recommendations: ${error}`);
            }
        });
    }
    /**
     * Run a full security analysis
     */
    async runFullAnalysis() {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running full security analysis",
            cancellable: true
        }, async (progress) => {
            try {
                // Step 1: Code analysis
                progress.report({ message: "Scanning code for security issues...", increment: 0 });
                const codeResult = await this.analysisSvc.scanWorkspace(message => progress.report({ message }));
                // Step 2: Dependency analysis
                progress.report({ message: "Checking dependencies for vulnerabilities...", increment: 33 });
                const dependencyResult = await this.dependencySvc.scanDependencies(message => progress.report({ message }));
                // Step 3: Generate recommendations
                progress.report({ message: "Generating security recommendations...", increment: 66 });
                const recommendationsResult = await this.recommendationSvc.generate();
                // Show full report
                progress.report({ message: "Preparing report...", increment: 90 });
                await this.reportSvc.showFullReport(codeResult, dependencyResult, recommendationsResult);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error during security analysis: ${error}`);
            }
        });
    }
    /**
     * Show security issues of a specific type
     */
    async showSecurityIssues(issueId) {
        try {
            const issues = await this.analysisSvc.getIssuesByType(issueId);
            await this.reportSvc.showFilteredIssues(issues, issueId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error showing security issues: ${error}`);
        }
    }
    /**
     * Fix all security issues that have automated fixes
     */
    async fixAllIssues() {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Fixing security issues",
            cancellable: true
        }, async (progress) => {
            try {
                const result = await this.analysisSvc.scanWorkspace();
                const fixableIssues = result.issues.filter(issue => issue.hasFix);
                if (fixableIssues.length === 0) {
                    vscode.window.showInformationMessage('No automated fixes available');
                    return;
                }
                const total = fixableIssues.length;
                for (let i = 0; i < total; i++) {
                    const issue = fixableIssues[i];
                    progress.report({
                        message: `Fixing ${issue.name} (${i + 1}/${total})`,
                        increment: (100 / total)
                    });
                    await this.applyFix(issue);
                }
                vscode.window.showInformationMessage(`Fixed ${total} security issues`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error fixing issues: ${error}`);
            }
        });
    }
    /**
     * Apply a security fix to a specific issue
     */
    async applyFix(issue) {
        try {
            await vscode.commands.executeCommand('vscode-local-llm-agent.security.fix', issue);
            vscode.window.showInformationMessage(`Fixed ${issue.name} issue`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error applying fix: ${error}`);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.SecurityCommandService = SecurityCommandService;
//# sourceMappingURL=SecurityCommandService.js.map