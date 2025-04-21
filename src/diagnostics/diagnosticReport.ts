import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SystemRequirementsChecker } from './systemRequirements';
import { Logger } from '../utils/logger';
import { SystemInfoService } from './services/SystemInfoService';
import { ConfigService } from './services/ConfigService';
import { PerformanceMetricsService } from './services/PerformanceMetricsService';
import { RuntimeTracker } from './services/RuntimeTracker';
import { LogService } from './services/LogService';
import { DiagnosticReportHtmlProvider } from './providers/DiagnosticReportHtmlProvider';

/**
 * Interface for diagnostic report content
 */
export interface DiagnosticReportContent {
    timestamp: string;
    extension: {
        name: string;
        version: string;
        environment: string;
    };
    system: {
        os: string;
        arch: string;
        cpuInfo: any;
        memoryInfo: any;
        diskInfo: any;
        gpuInfo: any;
    };
    configuration: {
        provider: string;
        model: string;
        endpoint: string;
        cacheEnabled: boolean;
        otherSettings: Record<string, any>;
    };
    performance: {
        lastLatencyMs: number | null;
        averageLatencyMs: number | null;
        peakMemoryUsageMB: number | null;
        responseTimeHistory: number[];
    };
    runtime: {
        uptime: number;
        requestCount: number;
        errorCount: number;
        lastError: string | null;
        lastErrorTime: string | null;
    };
    logs: {
        recentLogs: string[];
        errorCount: number;
        warningCount: number;
    };
}

/**
 * Class to generate diagnostic reports for the extension
 */
export class DiagnosticReportGenerator {
    private readonly _logger: Logger;
    private readonly _outputChannel: vscode.OutputChannel;
    private readonly _systemChecker: SystemRequirementsChecker;
    private _extensionContext: vscode.ExtensionContext;
    
    // Performance tracking
    private _startTime: number;
    private _requestCount: number = 0;
    private _errorCount: number = 0;
    private _lastError: string | null = null;
    private _lastErrorTime: string | null = null;
    private _responseTimeHistory: number[] = [];
    
    private systemInfoSvc: SystemInfoService;
    private configSvc: ConfigService;
    private perfSvc: PerformanceMetricsService;
    private runtimeTracker: RuntimeTracker;
    private logService: LogService;

    constructor(logger: Logger, context: vscode.ExtensionContext, systemChecker: SystemRequirementsChecker) {
        this._logger = logger;
        this._extensionContext = context;
        this._systemChecker = systemChecker;
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA Diagnostics');
        this._startTime = Date.now();
        this.systemInfoSvc = new SystemInfoService(systemChecker);
        this.configSvc = new ConfigService(vscode.workspace.getConfiguration());
        this.perfSvc = new PerformanceMetricsService();
        this.runtimeTracker = new RuntimeTracker();
        this.logService = new LogService(logger);
    }
    
    /**
     * Track a request to the LLM
     */
    public trackRequest(responseTimeMs: number, isError: boolean = false, errorMessage?: string): void {
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
    public async generateReport(): Promise<DiagnosticReportContent> {
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
            const report: DiagnosticReportContent = {
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
        } catch (error) {
            this._logger.error('Error generating diagnostic report', error);
            throw error;
        }
    }
    
    /**
     * Save the report to a file
     */
    public async saveReportToFile(report: DiagnosticReportContent): Promise<string> {
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
        } catch (error) {
            this._logger.error('Error saving diagnostic report', error);
            throw error;
        }
    }
    
    /**
     * Display the report in a webview panel
     */
    public async displayReportInWebview(report: DiagnosticReportContent): Promise<void> {
        // Create and show webview panel
        const panel = vscode.window.createWebviewPanel(
            'copilotPpaDiagnostics',
            'Copilot PPA Diagnostic Report',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        // Generate HTML content
        panel.webview.html = DiagnosticReportHtmlProvider.getHtml(report);
        
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'saveReport':
                        try {
                            const filePath = await this.saveReportToFile(report);
                            vscode.window.showInformationMessage(`Diagnostic report saved to ${filePath}`);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Error saving report: ${error}`);
                        }
                        break;
                }
            },
            undefined,
            this._extensionContext.subscriptions
        );
    }
}
