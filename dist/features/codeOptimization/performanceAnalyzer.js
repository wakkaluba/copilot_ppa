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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PerformanceAnalyzer_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const PerformanceMetricsService_1 = require("./services/PerformanceMetricsService");
const PerformanceIssueService_1 = require("./services/PerformanceIssueService");
const PerformanceReportService_1 = require("./services/PerformanceReportService");
const PerformanceProgressService_1 = require("./services/PerformanceProgressService");
const events_1 = require("events");
let PerformanceAnalyzer = class PerformanceAnalyzer extends events_1.EventEmitter {
    static { PerformanceAnalyzer_1 = this; }
    logger;
    metricsService;
    issueService;
    reportService;
    progressService;
    static instance;
    config;
    constructor(logger, metricsService, issueService, reportService, progressService) {
        super();
        this.logger = logger;
        this.metricsService = metricsService;
        this.issueService = issueService;
        this.reportService = reportService;
        this.progressService = progressService;
        this.setupEventListeners();
        this.loadConfiguration();
    }
    static getInstance(logger, metricsService, issueService, reportService, progressService) {
        if (!PerformanceAnalyzer_1.instance) {
            PerformanceAnalyzer_1.instance = new PerformanceAnalyzer_1(logger, metricsService, issueService, reportService, progressService);
        }
        return PerformanceAnalyzer_1.instance;
    }
    setupEventListeners() {
        this.metricsService.on('error', this.handleError.bind(this));
        this.issueService.on('error', this.handleError.bind(this));
        this.reportService.on('error', this.handleError.bind(this));
    }
    loadConfiguration() {
        try {
            const config = vscode.workspace.getConfiguration('copilot-ppa.performance');
            this.config = {
                enableDeepAnalysis: config.get('enableDeepAnalysis', false),
                analysisTimeout: config.get('analysisTimeout', 30000),
                maxIssues: config.get('maxIssues', 100),
                severityThreshold: config.get('severityThreshold', 'medium'),
                excludePatterns: config.get('excludePatterns', [])
            };
        }
        catch (error) {
            this.handleError(new Error(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active editor found');
        }
        return this.analyzeFile(editor.document.uri);
    }
    async analyzeFile(fileUri) {
        try {
            return await this.progressService.withProgress(`Analyzing performance for ${fileUri.fsPath}`, async (progress) => {
                const document = await vscode.workspace.openTextDocument(fileUri);
                const metrics = await this.metricsService.analyzeFile(document, progress);
                const issues = await this.issueService.detectIssues(document, metrics);
                if (issues.length > 0) {
                    await this.reportService.generateReport(fileUri, issues, metrics);
                }
                this.emit('analysisComplete', { fileUri, issues, metrics });
                return issues;
            });
        }
        catch (error) {
            this.handleError(new Error(`Error analyzing file ${fileUri.fsPath}: ${error instanceof Error ? error.message : String(error)}`));
            return [];
        }
    }
    async analyzeWorkspace() {
        if (!vscode.workspace.workspaceFolders) {
            throw new Error('No workspace folder open');
        }
        try {
            await this.progressService.withProgress('Analyzing workspace performance', async (progress) => {
                const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx}', `{${this.config.excludePatterns.join(',')}}`);
                let processedFiles = 0;
                const totalFiles = files.length;
                const allIssues = [];
                for (const file of files) {
                    progress.report({
                        message: `Analyzed ${processedFiles} of ${totalFiles} files`,
                        increment: (100 / totalFiles)
                    });
                    const issues = await this.analyzeFile(file);
                    allIssues.push(...issues);
                    processedFiles++;
                }
                const report = await this.reportService.generateWorkspaceReport(allIssues);
                this.emit('workspaceAnalysisComplete', report);
            });
        }
        catch (error) {
            this.handleError(new Error(`Error analyzing workspace: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    handleError(error) {
        this.logger.error('[PerformanceAnalyzer]', error);
        this.emit('error', error);
    }
    dispose() {
        this.metricsService.dispose();
        this.issueService.dispose();
        this.reportService.dispose();
        this.removeAllListeners();
    }
};
exports.PerformanceAnalyzer = PerformanceAnalyzer;
exports.PerformanceAnalyzer = PerformanceAnalyzer = PerformanceAnalyzer_1 = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(PerformanceMetricsService_1.PerformanceMetricsService)),
    __param(2, (0, inversify_1.inject)(PerformanceIssueService_1.PerformanceIssueService)),
    __param(3, (0, inversify_1.inject)(PerformanceReportService_1.PerformanceReportService)),
    __param(4, (0, inversify_1.inject)(PerformanceProgressService_1.PerformanceProgressService)),
    __metadata("design:paramtypes", [Object, PerformanceMetricsService_1.PerformanceMetricsService, typeof (_a = typeof PerformanceIssueService_1.PerformanceIssueService !== "undefined" && PerformanceIssueService_1.PerformanceIssueService) === "function" ? _a : Object, typeof (_b = typeof PerformanceReportService_1.PerformanceReportService !== "undefined" && PerformanceReportService_1.PerformanceReportService) === "function" ? _b : Object, typeof (_c = typeof PerformanceProgressService_1.PerformanceProgressService !== "undefined" && PerformanceProgressService_1.PerformanceProgressService) === "function" ? _c : Object])
], PerformanceAnalyzer);
//# sourceMappingURL=performanceAnalyzer.js.map