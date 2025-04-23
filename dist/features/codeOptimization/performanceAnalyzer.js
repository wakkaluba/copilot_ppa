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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let PerformanceAnalyzer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var PerformanceAnalyzer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PerformanceAnalyzer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
            if (!PerformanceAnalyzer.instance) {
                PerformanceAnalyzer.instance = new PerformanceAnalyzer(logger, metricsService, issueService, reportService, progressService);
            }
            return PerformanceAnalyzer.instance;
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
    return PerformanceAnalyzer = _classThis;
})();
exports.PerformanceAnalyzer = PerformanceAnalyzer;
//# sourceMappingURL=performanceAnalyzer.js.map