import { TestResult, TestRunnerOptions } from './testRunnerTypes';
import { StaticAnalysisOptions } from './staticAnalysisService';
import { CodeCoverageOptions } from './codeCoverageService';
import { SecurityTestOptions } from './securityTestingService';
/**
 * Service for running various types of tests within the VS Code environment
 */
export declare class TestRunnerService {
    private unitService;
    private integrationService;
    private e2eService;
    private performanceService;
    private staticService;
    private coverageService;
    private securityService;
    constructor();
    /**
     * Run unit tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    runUnitTests(options: TestRunnerOptions): Promise<TestResult>;
    /**
     * Run integration tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    runIntegrationTests(options: TestRunnerOptions): Promise<TestResult>;
    /**
     * Run end-to-end tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    runE2ETests(options: TestRunnerOptions): Promise<TestResult>;
    /**
     * Run performance tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    runPerformanceTests(options: TestRunnerOptions): Promise<TestResult>;
    /**
     * Run static code analysis on the workspace
     */
    runStaticAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    /**
     * Run ESLint analysis
     */
    runESLintAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    /**
     * Run Prettier analysis
     */
    runPrettierAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    /**
     * Run code coverage analysis
     */
    runCodeCoverage(options: CodeCoverageOptions): Promise<TestResult>;
    /**
     * Run security testing
     */
    runSecurityTest(options: SecurityTestOptions): Promise<TestResult>;
    /**
     * Dispose of resources used by the test runner
     */
    dispose(): void;
}
