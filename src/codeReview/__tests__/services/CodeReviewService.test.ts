import * as vscode from 'vscode';
import { ILogger } from '../../../logging/ILogger';
import { PullRequestIntegration } from '../../pullRequestIntegration';
import { ReviewChecklist } from '../../reviewChecklist';
import { CodeReviewService } from '../../services/CodeReviewService';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../pullRequestIntegration');
jest.mock('../../reviewChecklist');

describe('CodeReviewService', () => {
    let service: CodeReviewService;
    let mockLogger: ILogger;
    let mockContext: vscode.ExtensionContext;
    let mockWebview: vscode.Webview;
    let mockExtensionUri: vscode.Uri;

    beforeEach(() => {
        // Mock logger
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as unknown as ILogger;

        // Mock extension context
        mockContext = {
            extensionPath: '/test/extension/path',
            subscriptions: [],
        } as unknown as vscode.ExtensionContext;

        // Mock webview
        mockWebview = {
            asWebviewUri: jest.fn().mockImplementation(uri => ({ uri, toString: () => uri.path })),
            cspSource: 'test-csp-source',
            html: '',
            onDidReceiveMessage: jest.fn(),
            postMessage: jest.fn(),
        } as unknown as vscode.Webview;

        // Mock extension URI
        mockExtensionUri = {
            path: '/test/extension/path',
            fsPath: '/test/extension/path',
            toString: jest.fn().mockReturnValue('/test/extension/path'),
        } as unknown as vscode.Uri;

        // Mock vscode.Uri.joinPath
        (vscode.Uri.joinPath as jest.Mock).mockImplementation((uri, ...segments) => {
            return {
                path: `${uri.path}/${segments.join('/')}`,
                fsPath: `${uri.path}/${segments.join('/')}`,
                toString: () => `${uri.path}/${segments.join('/')}`,
            };
        });

        // Create service instance
        service = new CodeReviewService(mockLogger, mockContext);

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('getWebviewHtml', () => {
        it('should generate HTML with correct resources', () => {
            const html = service.getWebviewHtml(mockWebview, mockExtensionUri);

            // Verify asWebviewUri was called with correct paths
            expect(mockWebview.asWebviewUri).toHaveBeenCalledWith(
                expect.objectContaining({ path: expect.stringContaining('media/codeReview/codeReview.js') })
            );
            expect(mockWebview.asWebviewUri).toHaveBeenCalledWith(
                expect.objectContaining({ path: expect.stringContaining('media/codeReview/codeReview.css') })
            );

            // Verify HTML content
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('<title>Code Review</title>');
            expect(html).toContain('Code Review Tools');
            expect(html).toContain('Pull Requests');
            expect(html).toContain('Review Checklists');
            expect(html).toContain('Recent Reviews');
        });

        it('should include CSP with correct nonce', () => {
            // Replace the crypto API with a mock
            const originalCrypto = global.crypto;
            const mockRandomValues = jest.fn().mockReturnValue(new Uint8Array(Array(16).fill(1)));

            global.crypto = {
                getRandomValues: mockRandomValues,
            } as any;

            const html = service.getWebviewHtml(mockWebview, mockExtensionUri);

            expect(html).toContain('Content-Security-Policy');
            expect(html).toContain(`script-src 'nonce-`);
            expect(html).toContain(`style-src ${mockWebview.cspSource}`);

            // Restore the original crypto
            global.crypto = originalCrypto;
        });
    });

    describe('handleWebviewMessage', () => {
        it('should handle refreshPullRequests command', async () => {
            const mockPullRequests = [{ id: 'pr1', title: 'Test PR' }];
            (PullRequestIntegration.prototype.getOpenPullRequests as jest.Mock).mockResolvedValue(mockPullRequests);

            const result = await service.handleWebviewMessage({ command: 'refreshPullRequests' });

            expect(result).toEqual({
                command: 'pullRequestsRefreshed',
                pullRequests: mockPullRequests,
            });
        });

        it('should handle createPullRequest command', async () => {
            const mockResult = { success: true, pullRequest: { id: 'pr2', title: 'New PR' } };

            // Mock the expected implementation of handleCreatePullRequest
            const mockCreatePR = jest.spyOn(service as any, 'handleCreatePullRequest');
            mockCreatePR.mockResolvedValue(mockResult);

            const result = await service.handleWebviewMessage({ command: 'createPullRequest' });

            expect(mockCreatePR).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });

        it('should handle getChecklists command', async () => {
            const mockChecklists = ['General', 'Security', 'Performance'];
            (ReviewChecklist.prototype.getAvailableChecklists as jest.Mock).mockReturnValue(mockChecklists);

            // Mock the expected implementation of handleGetChecklists
            const mockGetChecklists = jest.spyOn(service as any, 'handleGetChecklists');
            mockGetChecklists.mockReturnValue({
                command: 'checklistsLoaded',
                checklists: mockChecklists,
            });

            const result = await service.handleWebviewMessage({ command: 'getChecklists' });

            expect(mockGetChecklists).toHaveBeenCalled();
            expect(result).toEqual({
                command: 'checklistsLoaded',
                checklists: mockChecklists,
            });
        });

        it('should handle startReview command', async () => {
            const mockChecklistName = 'General';
            const mockFilePaths = ['/path/to/file1.ts', '/path/to/file2.ts'];
            const mockReport = { id: 'report1', checklistName: mockChecklistName, filePaths: mockFilePaths };

            // Mock the expected implementation of handleStartReview
            const mockStartReview = jest.spyOn(service as any, 'handleStartReview');
            mockStartReview.mockResolvedValue({
                command: 'reviewStarted',
                report: mockReport,
            });

            const result = await service.handleWebviewMessage({
                command: 'startReview',
                checklistName: mockChecklistName
            });

            expect(mockStartReview).toHaveBeenCalledWith(mockChecklistName);
            expect(result).toEqual({
                command: 'reviewStarted',
                report: mockReport,
            });
        });

        it('should handle createChecklist command', async () => {
            // Mock the expected implementation of handleCreateChecklist
            const mockCreateChecklist = jest.spyOn(service as any, 'handleCreateChecklist');
            mockCreateChecklist.mockResolvedValue({
                command: 'checklistCreated',
                success: true,
            });

            const result = await service.handleWebviewMessage({ command: 'createChecklist' });

            expect(mockCreateChecklist).toHaveBeenCalled();
            expect(result).toEqual({
                command: 'checklistCreated',
                success: true,
            });
        });

        it('should handle submitReview command', async () => {
            const mockReportId = 'report1';
            const mockResults = [
                { itemId: 'item1', passed: true, comments: 'Good' },
                { itemId: 'item2', passed: false, comments: 'Needs work' },
            ];
            const mockSummary = 'Test review summary';
            const mockApproved = false;

            // Mock the expected implementation of handleSubmitReview
            const mockSubmitReview = jest.spyOn(service as any, 'handleSubmitReview');
            mockSubmitReview.mockResolvedValue({
                command: 'reviewSubmitted',
                success: true,
            });

            const result = await service.handleWebviewMessage({
                command: 'submitReview',
                reportId: mockReportId,
                results: mockResults,
                summary: mockSummary,
                approved: mockApproved,
            });

            expect(mockSubmitReview).toHaveBeenCalledWith(
                mockReportId, mockResults, mockSummary, mockApproved
            );
            expect(result).toEqual({
                command: 'reviewSubmitted',
                success: true,
            });
        });

        it('should handle getReportHistory command', async () => {
            const mockReports = [
                { id: 'report1', summary: 'Test report 1' },
                { id: 'report2', summary: 'Test report 2' },
            ];
            (ReviewChecklist.prototype.getReportHistory as jest.Mock).mockReturnValue(mockReports);

            // Mock the expected implementation of handleGetReportHistory
            const mockGetReportHistory = jest.spyOn(service as any, 'handleGetReportHistory');
            mockGetReportHistory.mockReturnValue({
                command: 'reportHistoryLoaded',
                reports: mockReports,
            });

            const result = await service.handleWebviewMessage({ command: 'getReportHistory' });

            expect(mockGetReportHistory).toHaveBeenCalled();
            expect(result).toEqual({
                command: 'reportHistoryLoaded',
                reports: mockReports,
            });
        });

        it('should handle viewReport command', async () => {
            const mockReportId = 'report1';
            const mockReport = { id: mockReportId, summary: 'Test report' };

            // Mock the expected implementation of handleViewReport
            const mockViewReport = jest.spyOn(service as any, 'handleViewReport');
            mockViewReport.mockResolvedValue({
                command: 'reportLoaded',
                report: mockReport,
            });

            const result = await service.handleWebviewMessage({
                command: 'viewReport',
                reportId: mockReportId
            });

            expect(mockViewReport).toHaveBeenCalledWith(mockReportId);
            expect(result).toEqual({
                command: 'reportLoaded',
                report: mockReport,
            });
        });

        it('should handle exportReport command', async () => {
            const mockReportId = 'report1';
            const mockHtml = '<html><body>Report content</body></html>';

            // Mock the expected implementation of handleExportReport
            const mockExportReport = jest.spyOn(service as any, 'handleExportReport');
            mockExportReport.mockResolvedValue({
                command: 'reportExported',
                html: mockHtml,
            });

            const result = await service.handleWebviewMessage({
                command: 'exportReport',
                reportId: mockReportId
            });

            expect(mockExportReport).toHaveBeenCalledWith(mockReportId);
            expect(result).toEqual({
                command: 'reportExported',
                html: mockHtml,
            });
        });

        it('should handle unknown commands', async () => {
            const result = await service.handleWebviewMessage({ command: 'unknownCommand' });

            expect(mockLogger.warn).toHaveBeenCalledWith('Unknown command received: unknownCommand');
            expect(result).toBeNull();
        });

        it('should handle errors', async () => {
            const error = new Error('Test error');
            (PullRequestIntegration.prototype.getOpenPullRequests as jest.Mock).mockRejectedValue(error);

            await expect(
                service.handleWebviewMessage({ command: 'refreshPullRequests' })
            ).rejects.toThrow(error);

            expect(mockLogger.error).toHaveBeenCalledWith('Error handling webview message:', error);
        });
    });

    describe('handleRefreshPullRequests', () => {
        it('should return pull requests', async () => {
            const mockPullRequests = [{ id: 'pr1', title: 'Test PR' }];
            (PullRequestIntegration.prototype.getOpenPullRequests as jest.Mock).mockResolvedValue(mockPullRequests);

            const result = await (service as any).handleRefreshPullRequests();

            expect(result).toEqual({
                command: 'pullRequestsRefreshed',
                pullRequests: mockPullRequests,
            });
        });

        it('should handle errors', async () => {
            const error = new Error('Test error');
            (PullRequestIntegration.prototype.getOpenPullRequests as jest.Mock).mockRejectedValue(error);

            await expect((service as any).handleRefreshPullRequests()).rejects.toThrow(error);

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to refresh pull requests:', error);
        });
    });

    describe('generateNonce', () => {
        it('should generate a valid nonce string', () => {
            // Replace the crypto API with a mock
            const originalCrypto = global.crypto;

            // Mock random values to return a predictable array
            const mockValues = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
            global.crypto = {
                getRandomValues: jest.fn().mockReturnValue(mockValues),
            } as any;

            const nonce = (service as any).generateNonce();

            // Each byte becomes a 2-char hex string, so 16 bytes = 32 chars
            expect(nonce.length).toBe(32);
            expect(nonce).toBe('000102030405060708090a0b0c0d0e0f');

            // Restore the original crypto
            global.crypto = originalCrypto;
        });
    });
});
