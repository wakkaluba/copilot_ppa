import * as vscode from 'vscode';
import { SystemRequirementsChecker } from './systemRequirements';
import { Logger } from '../utils/logger';
/**
 * Interface for diagnostic report content
 */
export interface IDiagnosticReportContent {
    timestamp: string;
    extension: {
        name: string;
        version: string;
        environment: string;
    };
    system: {
        os: string;
        arch: string;
        cpuInfo: Record<string, unknown>;
        memoryInfo: Record<string, unknown>;
        diskInfo: Record<string, unknown>;
        gpuInfo: Record<string, unknown>;
    };
    configuration: {
        provider: string;
        model: string;
        endpoint: string;
        cacheEnabled: boolean;
        otherSettings: Record<string, unknown>;
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
export declare class DiagnosticReportGenerator {
    private readonly _logger;
    private readonly _outputChannel;
    private readonly _systemChecker;
    private _extensionContext;
    private _startTime;
    private _requestCount;
    private _errorCount;
    private _lastError;
    private _lastErrorTime;
    private _responseTimeHistory;
    private systemInfoSvc;
    private configSvc;
    private perfSvc;
    private runtimeTracker;
    private logService;
    constructor(logger: Logger, context: vscode.ExtensionContext, systemChecker: SystemRequirementsChecker);
    /**
     * Track a request to the LLM
     */
    trackRequest(responseTimeMs: number, isError?: boolean, errorMessage?: string): void;
    /**
     * Generate a diagnostic report
     */
    generateReport(): Promise<IDiagnosticReportContent>;
    /**
     * Save the report to a file
     */
    saveReportToFile(report: IDiagnosticReportContent): Promise<string>;
    /**
     * Display the report in a webview panel
     */
    displayReportInWebview(report: IDiagnosticReportContent): Promise<void>;
}
