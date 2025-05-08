import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DependencyScanner } from '../../../src/security/dependencyScanner';
import { Logger } from '../../../src/utils/logger';

// Mock types
interface VulnerabilityInfo {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    cvssScore: number;
    remediationAvailable: boolean;
    fixedVersion?: string;
    references: string[];
}

interface Vulnerability {
    packageName: string;
    packageVersion: string;
    vulnerabilityInfo: VulnerabilityInfo[];
}

interface DependencyScanResult {
    hasVulnerabilities: boolean;
    vulnerabilities: Vulnerability[];
    scannedPackages: number;
    scannedFiles: number;
}

// Mock implementations
class MockLogger {
    static instance: MockLogger;

    info = sinon.stub();
    error = sinon.stub();
    warn = sinon.stub();
    debug = sinon.stub();

    static getInstance(): MockLogger {
        if (!this.instance) {
            this.instance = new MockLogger();
        }
        return this.instance;
    }
}

class MockVulnerabilityService {
    getVulnerabilityDetails = sinon.stub().resolves({
        id: 'CVE-2023-1234',
        title: 'Test vulnerability',
        description: 'A mock vulnerability for testing',
        severity: 'high',
        cvssScore: 8.5,
        remediationAvailable: true,
        fixedVersion: '2.0.0',
        references: ['https://example.com/cve-2023-1234']
    });
}

class MockDependencyScanService {
    constructor(private vulnerabilityService: any) {}

    scanWorkspace = sinon.stub().resolves({
        hasVulnerabilities: true,
        vulnerabilities: [
            {
                packageName: 'vulnerable-package',
                packageVersion: '1.0.0',
                vulnerabilityInfo: [
                    {
                        id: 'CVE-2023-1234',
                        title: 'Test vulnerability',
                        description: 'A mock vulnerability for testing',
                        severity: 'high',
                        cvssScore: 8.5,
                        remediationAvailable: true,
                        fixedVersion: '2.0.0',
                        references: ['https://example.com/cve-2023-1234']
                    }
                ]
            }
        ],
        scannedPackages: 10,
        scannedFiles: 5
    });
}

class MockVulnerabilityReportService {
    constructor(private context: vscode.ExtensionContext) {}

    updateStatusBar = sinon.stub();
    showReport = sinon.stub().resolves();
    dispose = sinon.stub();
}

describe('DependencyScanner Tests', () => {
    let scanner: DependencyScanner;
    let extensionContext: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;
    let mockVulnerabilityService: MockVulnerabilityService;
    let mockScanService: MockDependencyScanService;
    let mockReportService: MockVulnerabilityReportService;
    let mockLogger: MockLogger;
    let withProgressStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create mock extension context
        extensionContext = {
            subscriptions: [],
            extensionPath: '/mock/path',
            workspaceState: {
                get: () => undefined,
                update: () => Promise.resolve()
            },
            globalState: {
                get: () => undefined,
                update: () => Promise.resolve()
            },
            asAbsolutePath: (path: string) => `/mock/path/${path}`,
            storagePath: '/mock/storage',
            globalStoragePath: '/mock/global-storage',
            logPath: '/mock/log'
        } as unknown as vscode.ExtensionContext;

        // Create mock services
        mockVulnerabilityService = new MockVulnerabilityService();
        mockLogger = MockLogger.getInstance();
        mockScanService = new MockDependencyScanService(mockVulnerabilityService);
        mockReportService = new MockVulnerabilityReportService(extensionContext);

        // Stub the vscode.window.withProgress function
        withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(
            async (options, task) => task({
                report: () => {}
            }, { isCancellationRequested: false })
        );

        // Stub the Logger.getInstance method
        sandbox.stub(Logger, 'getInstance').returns(mockLogger as unknown as Logger);

        // Override the constructor to use our mocks
        const originalDependencyScanner = require('../../../src/security/dependencyScanner').DependencyScanner;
        const DependencyScannerProxy = function(context: vscode.ExtensionContext) {
            // @ts-ignore - Private constructor access
            const instance = originalDependencyScanner.getInstance(context);

            // Set our mocks
            (instance as any).vulnerabilityService = mockVulnerabilityService;
            (instance as any).scanService = mockScanService;
            (instance as any).reportService = mockReportService;
            (instance as any).logger = mockLogger;

            return instance;
        };

        // Get instance of scanner
        scanner = DependencyScannerProxy(extensionContext);
    });

    afterEach(() => {
        sandbox.restore();

        // Reset singleton instance for each test
        (DependencyScanner as any).instance = undefined;
    });

    test('Should be implemented as a singleton', () => {
        const instance1 = DependencyScanner.getInstance(extensionContext);
        const instance2 = DependencyScanner.getInstance(extensionContext);

        assert.strictEqual(instance1, instance2, 'getInstance should always return the same instance');
    });

    test('Should scan workspace dependencies and update status bar', async () => {
        const result = await scanner.scanWorkspaceDependencies();

        // Verify withProgress was called with correct options
        sinon.assert.calledOnce(withProgressStub);
        assert.strictEqual(
            withProgressStub.args[0][0].title,
            'Scanning dependencies for vulnerabilities...'
        );

        // Verify scan service was called
        sinon.assert.calledOnce(mockScanService.scanWorkspace);

        // Verify status bar was updated
        sinon.assert.calledOnce(mockReportService.updateStatusBar);
        sinon.assert.calledWith(
            mockReportService.updateStatusBar,
            true, // hasVulnerabilities
            1     // vulnerabilitiesCount
        );

        // Verify correct result was returned
        assert.strictEqual(result.hasVulnerabilities, true);
        assert.strictEqual(result.vulnerabilities.length, 1);
        assert.strictEqual(result.scannedPackages, 10);
        assert.strictEqual(result.scannedFiles, 5);

        // Verify vulnerabilities were cached
        const cachedVuln = await scanner.getVulnerabilityDetails('CVE-2023-1234');
        assert.strictEqual(cachedVuln?.id, 'CVE-2023-1234');
        assert.strictEqual(cachedVuln?.title, 'Test vulnerability');
    });

    test('Should scan workspace dependencies silently', async () => {
        const result = await scanner.scanWorkspaceDependencies(true);

        // Verify scan service was called
        sinon.assert.calledOnce(mockScanService.scanWorkspace);

        // Verify status bar was NOT updated when silent=true
        sinon.assert.notCalled(mockReportService.updateStatusBar);

        // Verify correct result was returned
        assert.strictEqual(result.hasVulnerabilities, true);
        assert.strictEqual(result.vulnerabilities.length, 1);
    });

    test('Should log and re-throw errors during dependency scanning', async () => {
        // Make scan service throw an error
        const error = new Error('Scan failed');
        mockScanService.scanWorkspace.rejects(error);

        // Verify the error is re-thrown
        await assert.rejects(
            () => scanner.scanWorkspaceDependencies(),
            (err: Error) => err === error
        );

        // Verify error was logged
        sinon.assert.calledOnce(mockLogger.error);
        sinon.assert.calledWith(
            mockLogger.error,
            'Error scanning workspace dependencies',
            error
        );
    });

    test('Should get vulnerability details from cache', async () => {
        // First scan to populate cache
        await scanner.scanWorkspaceDependencies();

        // Reset stubs to verify they aren't called again
        mockVulnerabilityService.getVulnerabilityDetails.resetHistory();

        // Get cached vulnerability
        const vuln = await scanner.getVulnerabilityDetails('CVE-2023-1234');

        // Verify vulnerability service was NOT called (result came from cache)
        sinon.assert.notCalled(mockVulnerabilityService.getVulnerabilityDetails);

        // Verify the returned vulnerability matches expected data
        assert.strictEqual(vuln?.id, 'CVE-2023-1234');
        assert.strictEqual(vuln?.title, 'Test vulnerability');
    });

    test('Should get vulnerability details from service when not in cache', async () => {
        // Get non-cached vulnerability
        const vulnId = 'NON-CACHED-ID';

        // Configure vulnerability service to return a specific result for this ID
        mockVulnerabilityService.getVulnerabilityDetails.withArgs(vulnId).resolves({
            id: vulnId,
            title: 'Non-cached vulnerability',
            description: 'This was not in the cache',
            severity: 'medium',
            cvssScore: 5.5,
            remediationAvailable: false,
            references: []
        });

        const vuln = await scanner.getVulnerabilityDetails(vulnId);

        // Verify vulnerability service was called with the right ID
        sinon.assert.calledOnce(mockVulnerabilityService.getVulnerabilityDetails);
        sinon.assert.calledWith(mockVulnerabilityService.getVulnerabilityDetails, vulnId);

        // Verify the returned vulnerability matches expected data
        assert.strictEqual(vuln?.id, vulnId);
        assert.strictEqual(vuln?.title, 'Non-cached vulnerability');
    });

    test('Should show vulnerability report', async () => {
        await scanner.showVulnerabilityReport();

        // Verify scanning was performed
        sinon.assert.calledOnce(mockScanService.scanWorkspace);

        // Verify report service was called with scan results
        sinon.assert.calledOnce(mockReportService.showReport);
        sinon.assert.calledWith(
            mockReportService.showReport,
            sinon.match.has('hasVulnerabilities', true)
        );
    });

    test('Should log and re-throw errors during report generation', async () => {
        // Make scan service throw an error
        const error = new Error('Report generation failed');
        mockReportService.showReport.rejects(error);

        // Verify the error is re-thrown
        await assert.rejects(
            () => scanner.showVulnerabilityReport(),
            (err: Error) => err === error
        );

        // Verify error was logged
        sinon.assert.calledWith(
            mockLogger.error,
            'Error showing vulnerability report',
            error
        );
    });

    test('Should dispose resources correctly', () => {
        // Populate cache
        (scanner as any).vulnerabilityCache.set('test-id', { id: 'test-id' });

        scanner.dispose();

        // Verify report service was disposed
        sinon.assert.calledOnce(mockReportService.dispose);

        // Verify cache was cleared
        assert.strictEqual((scanner as any).vulnerabilityCache.size, 0);
    });
});
