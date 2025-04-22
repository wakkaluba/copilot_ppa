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
exports.PerformanceManager = void 0;
const vscode = __importStar(require("vscode"));
const PerformanceAnalyzerService_1 = require("./services/PerformanceAnalyzerService");
const PerformanceStatusService_1 = require("./services/PerformanceStatusService");
const PerformanceDiagnosticsService_1 = require("./services/PerformanceDiagnosticsService");
const PerformanceFileMonitorService_1 = require("./services/PerformanceFileMonitorService");
const PerformanceConfigService_1 = require("./services/PerformanceConfigService");
const performanceProfiler_1 = require("./performanceProfiler");
const bottleneckDetector_1 = require("./bottleneckDetector");
const events_1 = require("events");
const cachingService_1 = require("./cachingService");
const asyncOptimizer_1 = require("./asyncOptimizer");
/**
 * Central manager for all performance-related functionality in the extension.
 * Coordinates analysis, profiling, monitoring and reporting of performance metrics.
 */
class PerformanceManager {
    static instance;
    analyzerService;
    statusService;
    diagnosticsService;
    fileMonitorService;
    configService;
    profiler;
    bottleneckDetector;
    cachingService;
    asyncOptimizer;
    eventEmitter;
    constructor(extensionContext) {
        this.eventEmitter = new events_1.EventEmitter();
        this.configService = new PerformanceConfigService_1.PerformanceConfigService();
        this.analyzerService = new PerformanceAnalyzerService_1.PerformanceAnalyzerService(this.configService);
        this.statusService = new PerformanceStatusService_1.PerformanceStatusService();
        this.diagnosticsService = new PerformanceDiagnosticsService_1.PerformanceDiagnosticsService();
        this.fileMonitorService = new PerformanceFileMonitorService_1.PerformanceFileMonitorService();
        this.profiler = performanceProfiler_1.PerformanceProfiler.getInstance(extensionContext);
        this.bottleneckDetector = bottleneckDetector_1.BottleneckDetector.getInstance();
        this.cachingService = cachingService_1.CachingService.getInstance();
        this.asyncOptimizer = asyncOptimizer_1.AsyncOptimizer.getInstance();
        this.setupEventListeners();
        this.initializeServices();
    }
    static getInstance(context) {
        if (!PerformanceManager.instance) {
            if (!context) {
                throw new Error('Context required for PerformanceManager initialization');
            }
            PerformanceManager.instance = new PerformanceManager(context);
        }
        return PerformanceManager.instance;
    }
    async initializeServices() {
        try {
            await this.configService.initialize();
            this.profiler.setEnabled(this.configService.isProfilingEnabled());
            this.bottleneckDetector.setEnabled(this.configService.isBottleneckDetectionEnabled());
            const cachingOptions = this.configService.getCachingOptions();
            this.cachingService.setMaxCacheSize(cachingOptions.maxSize);
            this.asyncOptimizer.setConfig(this.configService.getAsyncOptions());
        }
        catch (error) {
            console.error('Failed to initialize performance services:', error);
        }
    }
    dispose() {
        this.statusService.dispose();
        this.diagnosticsService.dispose();
        this.fileMonitorService.dispose();
        this.cachingService.dispose();
        this.asyncOptimizer.dispose();
        this.eventEmitter.removeAllListeners();
    }
    /**
     * Analyzes the performance of the entire workspace.
     * This includes analyzing all relevant files and collecting workspace-wide metrics.
     */
    async analyzeWorkspace() {
        if (!vscode.workspace.workspaceFolders) {
            throw new Error('No workspace folders found');
        }
        const operationId = 'workspace-analysis';
        this.profiler.startOperation(operationId);
        try {
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing workspace performance",
                cancellable: true
            }, async (progress, token) => {
                const files = await this.fileMonitorService.findAnalyzableFiles();
                const result = await this.analyzerService.analyzeWorkspace(files, progress, token);
                this.eventEmitter.emit('workspaceAnalysisComplete', result);
                return result;
            });
        }
        catch (error) {
            console.error('Workspace analysis failed:', error);
            throw error;
        }
        finally {
            this.profiler.endOperation(operationId);
        }
    }
    /**
     * Analyzes a specific file for performance issues.
     * @param document The document to analyze
     */
    async analyzeFile(document) {
        const operationId = `file-analysis-${document.uri.fsPath}`;
        this.profiler.startOperation(operationId);
        try {
            const result = await this.analyzerService.analyzeFile(document);
            if (result) {
                this.statusService.updateStatusBar(result);
                this.diagnosticsService.updateDiagnostics(document, result);
                this.bottleneckDetector.analyzeOperation(operationId);
                this.eventEmitter.emit('fileAnalysisComplete', result);
            }
            return result;
        }
        catch (error) {
            console.error(`File analysis failed for ${document.uri.fsPath}:`, error);
            return null;
        }
        finally {
            this.profiler.endOperation(operationId);
        }
    }
    /**
     * Analyzes the currently active file in the editor.
     */
    async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        return this.analyzeFile(editor.document);
    }
    /**
     * Generates a performance report with current metrics and bottleneck analysis.
     */
    generatePerformanceReport() {
        const operationStats = this.profiler.getStats('all');
        const bottleneckAnalysis = this.bottleneckDetector.analyzeAll();
        const cacheStats = this.cachingService.getCacheStats();
        const asyncStats = this.asyncOptimizer.getStats();
        console.info('Performance Report:');
        console.info(`Operations analyzed: ${operationStats?.length || 0}`);
        console.info(`Critical bottlenecks detected: ${bottleneckAnalysis.critical.length}`);
        console.info(`Performance warnings detected: ${bottleneckAnalysis.warnings.length}`);
        console.info(`Cache hits: ${cacheStats.hits}, misses: ${cacheStats.misses}, evictions: ${cacheStats.evictions}`);
        console.info(`Async operations optimized: ${asyncStats.optimizedCount}`);
        this.eventEmitter.emit('performanceReport', {
            operationStats,
            bottleneckAnalysis,
            cacheStats,
            asyncStats
        });
    }
    setupEventListeners() {
        this.fileMonitorService.onDocumentSaved((document) => this.handleDocumentChange(document));
        this.fileMonitorService.onActiveEditorChanged((editor) => {
            if (editor) {
                this.analyzeFile(editor.document);
            }
        });
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('performance')) {
                this.initializeServices();
            }
        });
    }
    handleDocumentChange(document) {
        this.fileMonitorService.throttleDocumentChange(document, async () => {
            const result = await this.analyzeFile(document);
            if (result) {
                this.statusService.updateStatusBar(result);
                this.diagnosticsService.updateDiagnostics(document, result);
            }
        });
    }
    getProfiler() {
        return this.profiler;
    }
    getBottleneckDetector() {
        return this.bottleneckDetector;
    }
    getCachingService() {
        return this.cachingService;
    }
    getAsyncOptimizer() {
        return this.asyncOptimizer;
    }
    on(event, listener) {
        this.eventEmitter.on(event, listener);
    }
    off(event, listener) {
        this.eventEmitter.off(event, listener);
    }
}
exports.PerformanceManager = PerformanceManager;
//# sourceMappingURL=performanceManager.js.map