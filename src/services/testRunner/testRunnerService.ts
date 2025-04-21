import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import { TestResult, TestType, TestRunnerOptions } from './testRunnerTypes';
import { E2ETestConfigService } from './e2eTestConfig';
import { PerformanceTestConfigService } from './performanceTestConfig';
import { StaticAnalysisService, StaticAnalysisOptions } from './staticAnalysisService';
import { CodeCoverageService, CodeCoverageOptions } from './codeCoverageService';
import { SecurityTestingService, SecurityTestOptions } from './securityTestingService';
import { UnitTestService } from './services/UnitTestService';
import { IntegrationTestService } from './services/IntegrationTestService';
import { E2ETestService } from './services/E2ETestService';
import { PerformanceTestService } from './services/PerformanceTestService';
import { StaticAnalysisService } from './services/StaticAnalysisService';
import { CodeCoverageService } from './services/CodeCoverageService';
import { SecurityTestingService } from './services/SecurityTestingService';

/**
 * Service for running various types of tests within the VS Code environment
 */
export class TestRunnerService {
    private unitService: UnitTestService;
    private integrationService: IntegrationTestService;
    private e2eService: E2ETestService;
    private performanceService: PerformanceTestService;
    private staticService: StaticAnalysisService;
    private coverageService: CodeCoverageService;
    private securityService: SecurityTestingService;

    constructor() {
        this.unitService = new UnitTestService();
        this.integrationService = new IntegrationTestService();
        this.e2eService = new E2ETestService();
        this.performanceService = new PerformanceTestService();
        this.staticService = new StaticAnalysisService();
        this.coverageService = new CodeCoverageService();
        this.securityService = new SecurityTestingService();
    }

    /**
     * Run unit tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runUnitTests(options: TestRunnerOptions): Promise<TestResult> {
        return this.unitService.run(options);
    }

    /**
     * Run integration tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runIntegrationTests(options: TestRunnerOptions): Promise<TestResult> {
        return this.integrationService.run(options);
    }

    /**
     * Run end-to-end tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runE2ETests(options: TestRunnerOptions): Promise<TestResult> {
        return this.e2eService.run(options);
    }

    /**
     * Run performance tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runPerformanceTests(options: TestRunnerOptions): Promise<TestResult> {
        return this.performanceService.run(options);
    }

    /**
     * Run static code analysis on the workspace
     */
    public async runStaticAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.staticService.runAnalysis(options);
    }

    /**
     * Run ESLint analysis
     */
    public async runESLintAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.staticService.runESLint(options);
    }

    /**
     * Run Prettier analysis
     */
    public async runPrettierAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.staticService.runPrettier(options);
    }

    /**
     * Run code coverage analysis
     */
    public async runCodeCoverage(options: CodeCoverageOptions): Promise<TestResult> {
        return this.coverageService.run(options);
    }

    /**
     * Run security testing
     */
    public async runSecurityTest(options: SecurityTestOptions): Promise<TestResult> {
        return this.securityService.run(options);
    }

    /**
     * Dispose of resources used by the test runner
     */
    public dispose(): void {
        this.unitService.dispose();
        this.integrationService.dispose();
        this.e2eService.dispose();
        this.performanceService.dispose();
        this.staticService.dispose();
        this.coverageService.dispose();
        this.securityService.dispose();
    }
}
