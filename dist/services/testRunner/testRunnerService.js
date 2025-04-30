"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunnerService = void 0;
const staticAnalysisService_1 = require("./staticAnalysisService");
const codeCoverageService_1 = require("./codeCoverageService");
const securityTestingService_1 = require("./securityTestingService");
const UnitTestService_1 = require("./services/UnitTestService");
const IntegrationTestService_1 = require("./services/IntegrationTestService");
const E2ETestService_1 = require("./services/E2ETestService");
const PerformanceTestService_1 = require("./services/PerformanceTestService");
/**
 * Service for running various types of tests within the VS Code environment
 */
class TestRunnerService {
    unitService;
    integrationService;
    e2eService;
    performanceService;
    staticService;
    coverageService;
    securityService;
    constructor() {
        this.unitService = new UnitTestService_1.UnitTestService();
        this.integrationService = new IntegrationTestService_1.IntegrationTestService();
        this.e2eService = new E2ETestService_1.E2ETestService();
        this.performanceService = new PerformanceTestService_1.PerformanceTestService();
        this.staticService = new staticAnalysisService_1.StaticAnalysisService();
        this.coverageService = new codeCoverageService_1.CodeCoverageService();
        this.securityService = new securityTestingService_1.SecurityTestingService();
    }
    /**
     * Run unit tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    async runUnitTests(options) {
        return this.unitService.run(options);
    }
    /**
     * Run integration tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    async runIntegrationTests(options) {
        return this.integrationService.run(options);
    }
    /**
     * Run end-to-end tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    async runE2ETests(options) {
        return this.e2eService.run(options);
    }
    /**
     * Run performance tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    async runPerformanceTests(options) {
        return this.performanceService.run(options);
    }
    /**
     * Run static code analysis on the workspace
     */
    async runStaticAnalysis(options) {
        return this.staticService.runAnalysis(options);
    }
    /**
     * Run ESLint analysis
     */
    async runESLintAnalysis(options) {
        return this.staticService.runESLint(options);
    }
    /**
     * Run Prettier analysis
     */
    async runPrettierAnalysis(options) {
        return this.staticService.runPrettier(options);
    }
    /**
     * Run code coverage analysis
     */
    async runCodeCoverage(options) {
        return this.coverageService.run(options);
    }
    /**
     * Run security testing
     */
    async runSecurityTest(options) {
        return this.securityService.run(options);
    }
    /**
     * Dispose of resources used by the test runner
     */
    dispose() {
        this.unitService.dispose();
        this.integrationService.dispose();
        this.e2eService.dispose();
        this.performanceService.dispose();
        this.staticService.dispose();
        this.coverageService.dispose();
        this.securityService.dispose();
    }
}
exports.TestRunnerService = TestRunnerService;
//# sourceMappingURL=testRunnerService.js.map