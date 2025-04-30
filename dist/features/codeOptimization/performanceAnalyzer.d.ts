import * as vscode from 'vscode';
import { ILogger } from '../../logging/ILogger';
import { PerformanceMetricsService } from './services/PerformanceMetricsService';
import { PerformanceIssueService } from './services/PerformanceIssueService';
import { PerformanceReportService } from './services/PerformanceReportService';
import { PerformanceProgressService } from './services/PerformanceProgressService';
import { PerformanceIssue } from './types';
import { EventEmitter } from 'events';
export declare class PerformanceAnalyzer extends EventEmitter {
    private readonly logger;
    private readonly metricsService;
    private readonly issueService;
    private readonly reportService;
    private readonly progressService;
    private static instance;
    private config;
    constructor(logger: ILogger, metricsService: PerformanceMetricsService, issueService: PerformanceIssueService, reportService: PerformanceReportService, progressService: PerformanceProgressService);
    static getInstance(logger: ILogger, metricsService: PerformanceMetricsService, issueService: PerformanceIssueService, reportService: PerformanceReportService, progressService: PerformanceProgressService): PerformanceAnalyzer;
    private setupEventListeners;
    private loadConfiguration;
    analyzeCurrentFile(): Promise<PerformanceIssue[]>;
    analyzeFile(fileUri: vscode.Uri): Promise<PerformanceIssue[]>;
    analyzeWorkspace(): Promise<void>;
    private handleError;
    dispose(): void;
}
