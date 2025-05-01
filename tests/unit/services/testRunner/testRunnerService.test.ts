// filepath: d:\___coding\tools\copilot_ppa\tests\unit\services\testRunner\testRunnerService.test.ts
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CodeCoverageOptions } from '../../../../src/services/testRunner/codeCoverageService';
import { SecurityTestOptions } from '../../../../src/services/testRunner/securityTestingService';
import { StaticAnalysisOptions } from '../../../../src/services/testRunner/staticAnalysisService';
import { TestRunnerService } from '../../../../src/services/testRunner/testRunnerService';
import { TestRunnerOptions } from '../../../../src/services/testRunner/testRunnerTypes';

// Mock classes for service dependencies
class MockTestService {
    run = sinon.stub().resolves({ success: true, stdout: 'Test succeeded', stderr: '' });
    dispose = sinon.stub();
}

class MockStaticAnalysisService {
    runAnalysis = sinon.stub().resolves({ success: true, stdout: 'Analysis succeeded', stderr: '' });
    runESLint = sinon.stub().resolves({ success: true, stdout: 'ESLint succeeded', stderr: '' });
    runPrettier = sinon.stub().resolves({ success: true, stdout: 'Prettier succeeded', stderr: '' });
    dispose = sinon.stub();
}

class MockCodeCoverageService {
    run = sinon.stub().resolves({ success: true, stdout: 'Coverage report generated', stderr: '' });
    dispose = sinon.stub();
}

class MockSecurityTestingService {
    run = sinon.stub().resolves({ success: true, stdout: 'Security tests passed', stderr: '' });
    dispose = sinon.stub();
}

suite('TestRunnerService Tests', () => {
    let testRunnerService: TestRunnerService;
    let sandbox: sinon.SinonSandbox;

    // Service mocks
    let unitServiceMock: MockTestService;
    let integrationServiceMock: MockTestService;
    let e2eServiceMock: MockTestService;
    let performanceServiceMock: MockTestService;
    let staticServiceMock: MockStaticAnalysisService;
    let coverageServiceMock: MockCodeCoverageService;
    let securityServiceMock: MockSecurityTestingService;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Create fresh mocks for each test
        unitServiceMock = new MockTestService();
        integrationServiceMock = new MockTestService();
        e2eServiceMock = new MockTestService();
        performanceServiceMock = new MockTestService();
        staticServiceMock = new MockStaticAnalysisService();
        coverageServiceMock = new MockCodeCoverageService();
        securityServiceMock = new MockSecurityTestingService();

        // Create TestRunnerService instance
        testRunnerService = new TestRunnerService();

        // Replace service instances with mocks
        (testRunnerService as any).unitService = unitServiceMock;
        (testRunnerService as any).integrationService = integrationServiceMock;
        (testRunnerService as any).e2eService = e2eServiceMock;
        (testRunnerService as any).performanceService = performanceServiceMock;
        (testRunnerService as any).staticService = staticServiceMock;
        (testRunnerService as any).coverageService = coverageServiceMock;
        (testRunnerService as any).securityService = securityServiceMock;
    });

    teardown(() => {
        sandbox.restore();
    });

    // Unit Tests
    test('runUnitTests should call UnitTestService.run with correct parameters', async () => {
        const options: TestRunnerOptions = {
            testType: TestType.UNIT,
            testPath: '/test/path',
            testPattern: '*.test.ts'
        };

        const result = await testRunnerService.runUnitTests(options);

        assert.strictEqual(unitServiceMock.run.calledOnce, true);
        assert.deepStrictEqual(unitServiceMock.run.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Test succeeded', stderr: '' });
    });

    test('runUnitTests should handle exceptions and return failure result', async () => {
        const options: TestRunnerOptions = {
            testType: TestType.UNIT,
            testPath: '/test/path',
            testPattern: '*.test.ts'
        };

        const error = new Error('Test execution failed');
        unitServiceMock.run.rejects(error);

        try {
            await testRunnerService.runUnitTests(options);
            assert.fail('Should have thrown an exception');
        } catch (e) {
            assert.strictEqual(e, error);
        }

        assert.strictEqual(unitServiceMock.run.calledOnce, true);
    });

    // Integration Tests
    test('runIntegrationTests should call IntegrationTestService.run with correct parameters', async () => {
        const options: TestRunnerOptions = {
            testType: TestType.INTEGRATION,
            testPath: '/test/path',
            testPattern: '*.int.test.ts'
        };

        const result = await testRunnerService.runIntegrationTests(options);

        assert.strictEqual(integrationServiceMock.run.calledOnce, true);
        assert.deepStrictEqual(integrationServiceMock.run.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Test succeeded', stderr: '' });
    });

    // E2E Tests
    test('runE2ETests should call E2ETestService.run with correct parameters', async () => {
        const options: TestRunnerOptions = {
            testType: TestType.E2E,
            testPath: '/test/path',
            testPattern: '*.e2e.test.ts'
        };

        const result = await testRunnerService.runE2ETests(options);

        assert.strictEqual(e2eServiceMock.run.calledOnce, true);
        assert.deepStrictEqual(e2eServiceMock.run.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Test succeeded', stderr: '' });
    });

    // Performance Tests
    test('runPerformanceTests should call PerformanceTestService.run with correct parameters', async () => {
        const options: TestRunnerOptions = {
            testType: TestType.PERFORMANCE,
            testPath: '/test/path',
            testPattern: '*.perf.test.ts'
        };

        const result = await testRunnerService.runPerformanceTests(options);

        assert.strictEqual(performanceServiceMock.run.calledOnce, true);
        assert.deepStrictEqual(performanceServiceMock.run.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Test succeeded', stderr: '' });
    });

    // Static Analysis Tests
    test('runStaticAnalysis should call StaticAnalysisService.runAnalysis with correct parameters', async () => {
        const options: StaticAnalysisOptions = {
            tool: 'eslint',
            path: '/test/path',
            config: { extends: 'standard' }
        };

        const result = await testRunnerService.runStaticAnalysis(options);

        assert.strictEqual(staticServiceMock.runAnalysis.calledOnce, true);
        assert.deepStrictEqual(staticServiceMock.runAnalysis.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Analysis succeeded', stderr: '' });
    });

    test('runESLintAnalysis should call StaticAnalysisService.runESLint with correct parameters', async () => {
        const options: StaticAnalysisOptions = {
            tool: 'eslint',
            path: '/test/path'
        };

        const result = await testRunnerService.runESLintAnalysis(options);

        assert.strictEqual(staticServiceMock.runESLint.calledOnce, true);
        assert.deepStrictEqual(staticServiceMock.runESLint.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'ESLint succeeded', stderr: '' });
    });

    test('runPrettierAnalysis should call StaticAnalysisService.runPrettier with correct parameters', async () => {
        const options: StaticAnalysisOptions = {
            tool: 'prettier',
            path: '/test/path'
        };

        const result = await testRunnerService.runPrettierAnalysis(options);

        assert.strictEqual(staticServiceMock.runPrettier.calledOnce, true);
        assert.deepStrictEqual(staticServiceMock.runPrettier.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Prettier succeeded', stderr: '' });
    });

    // Code Coverage Tests
    test('runCodeCoverage should call CodeCoverageService.run with correct parameters', async () => {
        const options: CodeCoverageOptions = {
            testPath: '/test/path',
            outputPath: '/coverage',
            threshold: 80
        };

        const result = await testRunnerService.runCodeCoverage(options);

        assert.strictEqual(coverageServiceMock.run.calledOnce, true);
        assert.deepStrictEqual(coverageServiceMock.run.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Coverage report generated', stderr: '' });
    });

    // Security Testing Tests
    test('runSecurityTest should call SecurityTestingService.run with correct parameters', async () => {
        const options: SecurityTestOptions = {
            scanPath: '/test/path',
            tool: 'snyk'
        };

        const result = await testRunnerService.runSecurityTest(options);

        assert.strictEqual(securityServiceMock.run.calledOnce, true);
        assert.deepStrictEqual(securityServiceMock.run.firstCall.args[0], options);
        assert.deepStrictEqual(result, { success: true, stdout: 'Security tests passed', stderr: '' });
    });

    // Dispose Tests
    test('dispose should call dispose on all service instances', () => {
        testRunnerService.dispose();

        assert.strictEqual(unitServiceMock.dispose.calledOnce, true);
        assert.strictEqual(integrationServiceMock.dispose.calledOnce, true);
        assert.strictEqual(e2eServiceMock.dispose.calledOnce, true);
        assert.strictEqual(performanceServiceMock.dispose.calledOnce, true);
        assert.strictEqual(staticServiceMock.dispose.calledOnce, true);
        assert.strictEqual(coverageServiceMock.dispose.calledOnce, true);
        assert.strictEqual(securityServiceMock.dispose.calledOnce, true);
    });

    test('should handle errors during service initialization', () => {
        // Test service constructor error handling by forcing an error
        const errorMessage = 'Service initialization failed';
        const constructor = sinon.stub().throws(new Error(errorMessage));

        // Temporarily replace a constructor to test error handling
        const originalConstructor = (global as any).UnitTestService;
        (global as any).UnitTestService = constructor;

        try {
            const service = new TestRunnerService();
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.strictEqual((error as Error).message, errorMessage);
        } finally {
            // Restore original constructor
            (global as any).UnitTestService = originalConstructor;
        }
    });
});
