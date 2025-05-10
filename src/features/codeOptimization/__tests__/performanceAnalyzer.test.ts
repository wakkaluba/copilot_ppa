import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { ILogger } from '../../../logging/ILogger';
import { PerformanceAnalyzer } from '../performanceAnalyzer';
import { PerformanceIssueService } from '../services/PerformanceIssueService';
import { PerformanceMetricsService } from '../services/PerformanceMetricsService';
import { PerformanceProgressService } from '../services/PerformanceProgressService';
import { PerformanceReportService } from '../services/PerformanceReportService';

// Mock services
jest.mock('../services/PerformanceMetricsService');
jest.mock('../services/PerformanceIssueService');
jest.mock('../services/PerformanceReportService');
jest.mock('../services/PerformanceProgressService');
jest.mock('../../../logging/ILogger');

describe('PerformanceAnalyzer', () => {
    let analyzer: PerformanceAnalyzer;
    let mockLogger: jest.Mocked<ILogger>;
    let mockMetricsService: jest.Mocked<PerformanceMetricsService>;
    let mockIssueService: jest.Mocked<PerformanceIssueService>;
    let mockReportService: jest.Mocked<PerformanceReportService>;
    let mockProgressService: jest.Mocked<PerformanceProgressService>;

    beforeEach(() => {
        // Create mock implementations
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            log: jest.fn()
        } as unknown as jest.Mocked<ILogger>;

        mockMetricsService = new PerformanceMetricsService() as jest.Mocked<PerformanceMetricsService>;
        mockMetricsService.analyzeFile = jest.fn().mockResolvedValue({
            executionTime: 100,
            memoryUsage: 50,
            complexityScore: 75,
            bottlenecks: [{ line: 10, severity: 'high', description: 'Test bottleneck' }]
        });

        mockIssueService = new PerformanceIssueService() as jest.Mocked<PerformanceIssueService>;
        mockIssueService.detectIssues = jest.fn().mockResolvedValue([
            { id: 'issue1', severity: 'high', description: 'Performance issue', line: 10, column: 5 }
        ]);

        mockReportService = new PerformanceReportService() as jest.Mocked<PerformanceReportService>;
        mockReportService.generateReport = jest.fn().mockResolvedValue(undefined);

        mockProgressService = new PerformanceProgressService() as jest.Mocked<PerformanceProgressService>;
        mockProgressService.withProgress = jest.fn().mockImplementation((message, callback) => {
            return callback({ report: jest.fn() });
        });

        // Extend the mocks with EventEmitter
        Object.setPrototypeOf(mockMetricsService, EventEmitter.prototype);
        Object.setPrototypeOf(mockIssueService, EventEmitter.prototype);
        Object.setPrototypeOf(mockReportService, EventEmitter.prototype);

        // Create the analyzer instance
        analyzer = new PerformanceAnalyzer(
            mockLogger,
            mockMetricsService,
            mockIssueService,
            mockReportService,
            mockProgressService
        );
    });

    test('getInstance returns a singleton instance', () => {
        const instance1 = PerformanceAnalyzer.getInstance(
            mockLogger,
            mockMetricsService,
            mockIssueService,
            mockReportService,
            mockProgressService
        );

        const instance2 = PerformanceAnalyzer.getInstance(
            mockLogger,
            mockMetricsService,
            mockIssueService,
            mockReportService,
            mockProgressService
        );

        expect(instance1).toBe(instance2);
    });

    test('analyzeCurrentFile analyzes the active editor document', async () => {
        // Mock vscode.window.activeTextEditor
        const mockDocument = { uri: { fsPath: 'test.js' } } as vscode.TextDocument;
        const mockEditor = { document: mockDocument } as vscode.TextEditor;
        Object.defineProperty(vscode.window, 'activeTextEditor', {
            get: jest.fn().mockReturnValue(mockEditor),
            configurable: true
        });

        const spy = jest.spyOn(analyzer, 'analyzeFile').mockResolvedValue([]);

        await analyzer.analyzeCurrentFile();

        expect(spy).toHaveBeenCalledWith(mockDocument.uri);
    });

    test('analyzeCurrentFile throws error when no active editor', async () => {
        // Mock no active editor
        Object.defineProperty(vscode.window, 'activeTextEditor', {
            get: jest.fn().mockReturnValue(undefined),
            configurable: true
        });

        await expect(analyzer.analyzeCurrentFile()).rejects.toThrow('No active editor found');
    });

    test('analyzeFile processes a file and detects issues', async () => {
        const mockUri = { fsPath: 'test.js' } as vscode.Uri;
        const mockDocument = { uri: mockUri } as vscode.TextDocument;

        // Mock workspace.openTextDocument
        jest.spyOn(vscode.workspace, 'openTextDocument').mockResolvedValue(mockDocument);

        // Add spy for event emission
        const emitSpy = jest.spyOn(analyzer, 'emit');

        const issues = await analyzer.analyzeFile(mockUri);

        // Verify the workflow
        expect(mockProgressService.withProgress).toHaveBeenCalled();
        expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(mockUri);
        expect(mockMetricsService.analyzeFile).toHaveBeenCalledWith(mockDocument, expect.anything());
        expect(mockIssueService.detectIssues).toHaveBeenCalled();
        expect(mockReportService.generateReport).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith('analysisComplete', expect.any(Object));
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('high');
    });

    test('analyzeFile handles errors gracefully', async () => {
        const mockUri = { fsPath: 'test.js' } as vscode.Uri;
        const error = new Error('Test error');

        // Force an error
        jest.spyOn(vscode.workspace, 'openTextDocument').mockRejectedValue(error);
        const errorSpy = jest.spyOn(analyzer, 'handleError');

        const issues = await analyzer.analyzeFile(mockUri);

        expect(errorSpy).toHaveBeenCalled();
        expect(issues).toEqual([]);
    });

    test('analyzeWorkspace processes all files in workspace', async () => {
        // Mock workspace folders and file search
        const mockFolders = [{ uri: { fsPath: '/test' } }] as vscode.WorkspaceFolder[];
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            get: jest.fn().mockReturnValue(mockFolders),
            configurable: true
        });

        const mockFiles = [
            { fsPath: 'file1.js' },
            { fsPath: 'file2.js' }
        ] as vscode.Uri[];

        jest.spyOn(vscode.workspace, 'findFiles').mockResolvedValue(mockFiles);

        // Mock analyzeFile to track calls
        const analyzeFileSpy = jest.spyOn(analyzer, 'analyzeFile').mockResolvedValue([
            { id: 'issue1', severity: 'medium', description: 'Issue in file' }
        ]);

        // Mock event emission
        const emitSpy = jest.spyOn(analyzer, 'emit');

        await analyzer.analyzeWorkspace();

        expect(vscode.workspace.findFiles).toHaveBeenCalled();
        expect(analyzeFileSpy).toHaveBeenCalledTimes(2);
        expect(analyzeFileSpy).toHaveBeenCalledWith(mockFiles[0]);
        expect(analyzeFileSpy).toHaveBeenCalledWith(mockFiles[1]);
        expect(mockReportService.generateWorkspaceReport).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith('workspaceAnalysisComplete', expect.anything());
    });

    test('analyzeWorkspace throws error when no workspace', async () => {
        // Mock no workspace folders
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            get: jest.fn().mockReturnValue(undefined),
            configurable: true
        });

        await expect(analyzer.analyzeWorkspace()).rejects.toThrow('No workspace folder open');
    });

    test('handleError logs errors correctly', () => {
        const error = new Error('Test error');
        analyzer.handleError(error);

        expect(mockLogger.error).toHaveBeenCalledWith('[PerformanceAnalyzer]', error);
    });

    test('dispose cleans up resources', () => {
        const metricsDisposeSpy = jest.spyOn(mockMetricsService, 'dispose');
        const issueDisposeSpy = jest.spyOn(mockIssueService, 'dispose');
        const reportDisposeSpy = jest.spyOn(mockReportService, 'dispose');
        const removeAllListenersSpy = jest.spyOn(analyzer, 'removeAllListeners');

        analyzer.dispose();

        expect(metricsDisposeSpy).toHaveBeenCalled();
        expect(issueDisposeSpy).toHaveBeenCalled();
        expect(reportDisposeSpy).toHaveBeenCalled();
        expect(removeAllListenersSpy).toHaveBeenCalled();
    });

    test('loadConfiguration loads settings correctly', () => {
        // Mock vscode configuration
        const mockConfig = {
            get: jest.fn().mockImplementation((key, defaultValue) => {
                const values: Record<string, any> = {
                    'enableDeepAnalysis': true,
                    'analysisTimeout': 60000,
                    'maxIssues': 50,
                    'severityThreshold': 'low',
                    'excludePatterns': ['node_modules/**', 'dist/**']
                };
                return values[key] || defaultValue;
            })
        };

        jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue(mockConfig as any);

        // Call method via any to access private method
        (analyzer as any).loadConfiguration();

        // Assert configuration values
        expect((analyzer as any).config).toEqual({
            enableDeepAnalysis: true,
            analysisTimeout: 60000,
            maxIssues: 50,
            severityThreshold: 'low',
            excludePatterns: ['node_modules/**', 'dist/**']
        });
    });

    test('loadConfiguration handles errors', () => {
        // Force an error in configuration loading
        jest.spyOn(vscode.workspace, 'getConfiguration').mockImplementation(() => {
            throw new Error('Config error');
        });

        const errorSpy = jest.spyOn(analyzer, 'handleError');

        // Call method via any to access private method
        (analyzer as any).loadConfiguration();

        expect(errorSpy).toHaveBeenCalled();
    });
});
