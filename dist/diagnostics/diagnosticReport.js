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
exports.DiagnosticReportGenerator = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const SystemInfoService_1 = require("./services/SystemInfoService");
const ConfigService_1 = require("./services/ConfigService");
const PerformanceMetricsService_1 = require("./services/PerformanceMetricsService");
const RuntimeTracker_1 = require("./services/RuntimeTracker");
const LogService_1 = require("./services/LogService");
const DiagnosticReportHtmlProvider_1 = require("./providers/DiagnosticReportHtmlProvider");
/**
 * Class to generate diagnostic reports for the extension
 */
class DiagnosticReportGenerator {
    _logger;
    _outputChannel;
    _systemChecker;
    _extensionContext;
    // Performance tracking
    _startTime;
    _requestCount = 0;
    _errorCount = 0;
    _lastError = null;
    _lastErrorTime = null;
    _responseTimeHistory = [];
    systemInfoSvc;
    configSvc;
    perfSvc;
    runtimeTracker;
    logService;
    constructor(logger, context, systemChecker) {
        this._logger = logger;
        this._extensionContext = context;
        this._systemChecker = systemChecker;
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA Diagnostics');
        this._startTime = Date.now();
        this.systemInfoSvc = new SystemInfoService_1.SystemInfoService(systemChecker);
        this.configSvc = new ConfigService_1.ConfigService(vscode.workspace.getConfiguration());
        this.perfSvc = new PerformanceMetricsService_1.PerformanceMetricsService();
        this.runtimeTracker = new RuntimeTracker_1.RuntimeTracker();
        this.logService = new LogService_1.LogService(logger);
    }
    /**
     * Track a request to the LLM
     */
    trackRequest(responseTimeMs, isError = false, errorMessage) {
        this._requestCount++;
        if (responseTimeMs > 0) {
            this._responseTimeHistory.push(responseTimeMs);
            // Keep only the last 100 response times for memory efficiency
            if (this._responseTimeHistory.length > 100) {
                this._responseTimeHistory.shift();
            }
        }
        if (isError) {
            this._errorCount++;
            this._lastError = errorMessage || "Unknown error";
            this._lastErrorTime = new Date().toISOString();
        }
    }
    /**
     * Generate a diagnostic report
     */
    async generateReport() {
        this._logger.info('Generating diagnostic report');
        try {
            // Get system information
            const systemInfo = await this.systemInfoSvc.collect();
            // Get extension configuration
            const config = this.configSvc.flatten();
            // Get performance metrics
            const performance = this.perfSvc.getMetrics(this._responseTimeHistory);
            // Get runtime information
            const runtime = this.runtimeTracker.getInfo();
            // Get recent logs
            const logs = this.logService.getRecent();
            // Create the report content
            const report = {
                timestamp: new Date().toISOString(),
                extension: {
                    name: vscode.extensions.getExtension('copilot-ppa')?.packageJSON.name || 'copilot-ppa',
                    version: vscode.extensions.getExtension('copilot-ppa')?.packageJSON.version || '1.0.0',
                    environment: vscode.env.appName
                },
                system: systemInfo,
                configuration: config,
                performance: performance,
                runtime: runtime,
                logs: logs
            };
            return report;
        }
        catch (error) {
            this._logger.error('Error generating diagnostic report', error);
            throw error;
        }
    }
    /**
     * Save the report to a file
     */
    async saveReportToFile(report) {
        try {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const downloadsFolder = path.join(os.homedir(), 'Downloads');
            const filePath = path.join(downloadsFolder, `copilot-ppa-diagnostic-${timestamp}.json`);
            // Convert report to JSON string
            const reportJson = JSON.stringify(report, null, 2);
            // Write to file
            fs.writeFileSync(filePath, reportJson);
            this._logger.info(`Diagnostic report saved to ${filePath}`);
            return filePath;
        }
        catch (error) {
            this._logger.error('Error saving diagnostic report', error);
            throw error;
        }
    }
    /**
     * Display the report in a webview panel
     */
    async displayReportInWebview(report) {
        // Create and show webview panel
        const panel = vscode.window.createWebviewPanel('copilotPpaDiagnostics', 'Copilot PPA Diagnostic Report', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        // Generate HTML content
        panel.webview.html = DiagnosticReportHtmlProvider_1.DiagnosticReportHtmlProvider.getHtml(report);
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'saveReport':
                    try {
                        const filePath = await this.saveReportToFile(report);
                        vscode.window.showInformationMessage(`Diagnostic report saved to ${filePath}`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Error saving report: ${error}`);
                    }
                    break;
            }
        }, undefined, this._extensionContext.subscriptions);
    }
}
exports.DiagnosticReportGenerator = DiagnosticReportGenerator;
//# sourceMappingURL=diagnosticReport.js.map