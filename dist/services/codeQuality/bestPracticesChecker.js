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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestPracticesChecker = void 0;
const vscode = __importStar(require("vscode"));
const BestPracticesService_1 = require("./BestPracticesService");
/**
 * Checks and enforces best practices in code
 */
class BestPracticesChecker {
    constructor(context, logger) {
        this._logger = logger;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('best-practices');
        this._service = new BestPracticesService_1.BestPracticesService(context);
        context.subscriptions.push(this._diagnosticCollection);
    }
    /**
     * Detects anti-patterns in code
     */
    async detectAntiPatterns(document) {
        try {
            const issues = await this._service.detectAntiPatterns(document);
            this.updateDiagnostics(document, issues);
            return issues;
        }
        catch (error) {
            this._logger.error('Error detecting anti-patterns', error);
            return [];
        }
    }
    /**
     * Suggests design improvements
     */
    async suggestDesignImprovements(document) {
        try {
            const issues = await this._service.suggestDesignImprovements(document);
            this.updateDiagnostics(document, issues);
            return issues;
        }
        catch (error) {
            this._logger.error('Error suggesting design improvements', error);
            return [];
        }
    }
    /**
     * Checks code consistency
     */
    async checkCodeConsistency(document) {
        try {
            const issues = await this._service.checkCodeConsistency(document);
            this.updateDiagnostics(document, issues);
            return issues;
        }
        catch (error) {
            this._logger.error('Error checking code consistency', error);
            return [];
        }
    }
    /**
     * Run all checks at once
     */
    async checkAll(document) {
        try {
            const [antiPatterns, designImprovements, consistencyIssues] = await Promise.all([
                this.detectAntiPatterns(document),
                this.suggestDesignImprovements(document),
                this.checkCodeConsistency(document)
            ]);
            const allIssues = [...antiPatterns, ...designImprovements, ...consistencyIssues];
            this.updateDiagnostics(document, allIssues);
            return allIssues;
        }
        catch (error) {
            this._logger.error('Error running all checks', error);
            return [];
        }
    }
    /**
     * Update diagnostics for document
     */
    updateDiagnostics(document, issues) {
        const diagnostics = issues.map(issue => {
            const range = new vscode.Range(issue.line - 1, issue.column - 1, issue.line - 1, issue.column + 20);
            const diagnostic = new vscode.Diagnostic(range, `${issue.description}\n${issue.recommendation}`, this.mapSeverityToDiagnosticSeverity(issue.severity));
            diagnostic.source = 'Best Practices';
            return diagnostic;
        });
        this._diagnosticCollection.set(document.uri, diagnostics);
    }
    /**
     * Map severity to VS Code diagnostic severity
     */
    mapSeverityToDiagnosticSeverity(severity) {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'suggestion': return vscode.DiagnosticSeverity.Hint;
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this._diagnosticCollection.dispose();
        this._service.dispose();
    }
}
exports.BestPracticesChecker = BestPracticesChecker;
//# sourceMappingURL=bestPracticesChecker.js.map