import { assert } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { SecurityManager } from '../securityManager';
import { SecurityReportService } from '../services/SecurityReportService';
import { SecurityScanService } from '../services/SecurityScanService';
import { SecurityWebviewService } from '../services/SecurityWebviewService';
import { VulnerabilityService } from '../services/VulnerabilityService';

describe('SecurityManager', () => {
    let securityManager: SecurityManager;
    let mockWebviewService: sinon.SinonStubbedInstance<SecurityWebviewService>;
    let mockScanService: sinon.SinonStubbedInstance<SecurityScanService>;
    let mockReportService: sinon.SinonStubbedInstance<SecurityReportService>;
    let mockVulnerabilityService: sinon.SinonStubbedInstance<VulnerabilityService>;
    let mockLogger: sinon.SinonStubbedInstance<Logger>;
    let mockContext: vscode.ExtensionContext;
    let mockWorkspaceState: any;
    let mockGlobalState: any;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create mocks for all dependencies
        mockWebviewService = sinon.createStubInstance(SecurityWebviewService);
        mockScanService = sinon.createStubInstance(SecurityScanService);
        mockReportService = sinon.createStubInstance(SecurityReportService);
        mockVulnerabilityService = sinon.createStubInstance(VulnerabilityService);
        mockLogger = sinon.createStubInstance(Logger);

        // Set up mock extension context
        mockWorkspaceState = {
            get: sinon.stub().returns(undefined),
            update: sinon.stub().resolves()
        };

        mockGlobalState = {
            get: sinon.stub().returns(undefined),
            update: sinon.stub().resolves()
        };

        mockContext = {
            subscriptions: [],
            workspaceState: mockWorkspaceState,
            globalState: mockGlobalState,
            extensionPath: '/test/extension/path',
            extensionUri: vscode.Uri.file('/test/extension/path'),
            asAbsolutePath: (path: string) => `/test/extension/path/${path}`,
            storagePath: '/test/storage/path',
            storageUri: vscode.Uri.file('/test/storage/path'),
            globalStoragePath: '/test/global/storage/path',
            globalStorageUri: vscode.Uri.file('/test/global/storage/path'),
            logPath: '/test/log/path',
            logUri: vscode.Uri.file('/test/log/path'),
            extensionMode: vscode.ExtensionMode.Development,
            secrets: {
                get: sinon.stub().resolves(undefined),
                store: sinon.stub().resolves(),
                delete: sinon.stub().resolves(),
                onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
            }
        };

        // Initialize the SecurityManager with mocked dependencies
        securityManager = new SecurityManager(
            mockContext,
            mockWebviewService,
            mockScanService,
            mockReportService,
            mockVulnerabilityService,
            mockLogger
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getInstance', () => {
        it('should return the same instance when called multiple times', () => {
            const originalInstance = SecurityManager.getInstance(mockContext);
            const secondInstance = SecurityManager.getInstance(mockContext);

            assert.strictEqual(originalInstance, secondInstance);
        });
    });

    describe('initialize', () => {
        it('should register commands and initialize services', async () => {
            const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({ dispose: () => {} });

            await securityManager.initialize();

            // Verify commands are registered
            assert.isTrue(registerCommandStub.called);
            assert.isTrue(registerCommandStub.calledWith('copilot-ppa.scanWorkspaceSecurity'));
            assert.isTrue(registerCommandStub.calledWith('copilot-ppa.scanFileSecurity'));
            assert.isTrue(registerCommandStub.calledWith('copilot-ppa.showSecurityReport'));

            // Verify services are initialized
            assert.isTrue(mockWebviewService.initialize.calledOnce);
            assert.isTrue(mockScanService.initialize.calledOnce);
        });
    });

    describe('scanWorkspace', () => {
        it('should scan workspace and return results', async () => {
            const mockResults = [
                { id: 'vuln-1', title: 'Vulnerability 1', severity: 'high' },
                { id: 'vuln-2', title: 'Vulnerability 2', severity: 'medium' }
            ];

            mockScanService.scanWorkspace.resolves(mockResults);

            const results = await securityManager.scanWorkspace();

            assert.isTrue(mockScanService.scanWorkspace.calledOnce);
            assert.deepEqual(results, mockResults);
        });

        it('should log errors when scan fails', async () => {
            const testError = new Error('Scan failed');
            mockScanService.scanWorkspace.rejects(testError);

            try {
                await securityManager.scanWorkspace();
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.strictEqual(error, testError);
                assert.isTrue(mockLogger.error.calledOnce);
            }
        });
    });

    describe('scanFile', () => {
        it('should scan a single file and return results', async () => {
            const mockResults = [
                { id: 'vuln-1', title: 'File Vulnerability', severity: 'high', location: { file: 'test.ts', line: 10 } }
            ];

            const testDocument = {
                fileName: 'test.ts',
                uri: vscode.Uri.file('test.ts')
            } as vscode.TextDocument;

            mockScanService.scanFile.resolves(mockResults);

            const results = await securityManager.scanFile(testDocument);

            assert.isTrue(mockScanService.scanFile.calledOnce);
            assert.isTrue(mockScanService.scanFile.calledWith(testDocument));
            assert.deepEqual(results, mockResults);
        });

        it('should log errors when file scan fails', async () => {
            const testError = new Error('File scan failed');
            const testDocument = {
                fileName: 'test.ts',
                uri: vscode.Uri.file('test.ts')
            } as vscode.TextDocument;

            mockScanService.scanFile.rejects(testError);

            try {
                await securityManager.scanFile(testDocument);
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.strictEqual(error, testError);
                assert.isTrue(mockLogger.error.calledOnce);
            }
        });
    });

    describe('showReport', () => {
        it('should generate and show a security report', async () => {
            const mockIssues = [
                { id: 'vuln-1', title: 'Vulnerability 1', severity: 'high' },
                { id: 'vuln-2', title: 'Vulnerability 2', severity: 'medium' }
            ];

            mockVulnerabilityService.getIssues.returns(mockIssues);

            await securityManager.showReport();

            assert.isTrue(mockVulnerabilityService.getIssues.calledOnce);
            assert.isTrue(mockReportService.generateReport.calledOnce);
            assert.isTrue(mockReportService.generateReport.calledWith(mockIssues));
            assert.isTrue(mockWebviewService.showReport.calledOnce);
        });

        it('should log errors when showing report fails', async () => {
            const testError = new Error('Show report failed');
            mockReportService.generateReport.rejects(testError);

            try {
                await securityManager.showReport();
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.strictEqual(error, testError);
                assert.isTrue(mockLogger.error.calledOnce);
            }
        });
    });

    describe('clearCache', () => {
        it('should clear vulnerability cache', async () => {
            await securityManager.clearCache();

            assert.isTrue(mockVulnerabilityService.clearCache.calledOnce);
        });
    });

    describe('dispose', () => {
        it('should dispose all disposables', () => {
            const mockDisposable1 = { dispose: sinon.stub() };
            const mockDisposable2 = { dispose: sinon.stub() };

            mockContext.subscriptions.push(mockDisposable1, mockDisposable2);

            securityManager.dispose();

            assert.isTrue(mockDisposable1.dispose.calledOnce);
            assert.isTrue(mockDisposable2.dispose.calledOnce);
        });
    });
});
