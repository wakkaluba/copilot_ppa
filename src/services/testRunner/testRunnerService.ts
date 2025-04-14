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

/**
 * Service for running various types of tests within the VS Code environment
 */
export class TestRunnerService {
    private outputChannel: vscode.OutputChannel;
    private e2eConfigService: E2ETestConfigService;
    private performanceConfigService: PerformanceTestConfigService;
    private staticAnalysisService: StaticAnalysisService;
    private codeCoverageService: CodeCoverageService;
    private securityTestingService: SecurityTestingService;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Test Runner');
        this.e2eConfigService = new E2ETestConfigService();
        this.performanceConfigService = new PerformanceTestConfigService();
        this.staticAnalysisService = new StaticAnalysisService();
        this.codeCoverageService = new CodeCoverageService();
        this.securityTestingService = new SecurityTestingService();
    }

    /**
     * Run unit tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runUnitTests(options: TestRunnerOptions): Promise<TestResult> {
        this.outputChannel.appendLine(`Running unit tests in ${options.path || 'current workspace'}`);
        this.outputChannel.show();

        try {
            // Determine the testing framework based on project configuration or options
            const testCommand = this.determineTestCommand(options, 'unit');

            // Execute the test command
            const result = await this.executeTestCommand(testCommand, options.path);
            
            this.outputChannel.appendLine('Unit tests completed');
            return result;
        } catch (error) {
            const errorMsg = `Error running unit tests: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Run integration tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runIntegrationTests(options: TestRunnerOptions): Promise<TestResult> {
        this.outputChannel.appendLine(`Running integration tests in ${options.path || 'current workspace'}`);
        this.outputChannel.show();

        try {
            // Determine the testing framework based on project configuration or options
            const testCommand = this.determineTestCommand(options, 'integration');

            // Execute the test command
            const result = await this.executeTestCommand(testCommand, options.path);
            
            this.outputChannel.appendLine('Integration tests completed');
            return result;
        } catch (error) {
            const errorMsg = `Error running integration tests: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Run end-to-end tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runE2ETests(options: TestRunnerOptions): Promise<TestResult> {
        this.outputChannel.appendLine(`Running E2E tests in ${options.path || 'current workspace'}`);
        this.outputChannel.show();

        try {
            const workingDir = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!workingDir) {
                throw new Error('No workspace folder found');
            }

            // Try to determine the E2E configuration
            let e2eConfig;
            if (options.command) {
                // If a command is provided in options, use that
                e2eConfig = { command: options.command };
            } else {
                // Otherwise detect or configure the E2E framework
                e2eConfig = await this.e2eConfigService.detectFramework(workingDir);
                
                // If no framework was detected or the user wants to configure manually
                if (!e2eConfig || options.configureE2E) {
                    e2eConfig = await this.e2eConfigService.configureE2E(workingDir);
                    if (!e2eConfig) {
                        throw new Error('E2E test configuration cancelled');
                    }
                }
            }

            // Execute the test command
            this.outputChannel.appendLine(`Using E2E framework: ${e2eConfig.framework || 'custom'}`);
            const result = await this.executeTestCommand(e2eConfig.command, workingDir);
            
            this.outputChannel.appendLine('E2E tests completed');
            return result;
        } catch (error) {
            const errorMsg = `Error running E2E tests: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Run performance tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    public async runPerformanceTests(options: TestRunnerOptions): Promise<TestResult> {
        this.outputChannel.appendLine(`Running performance tests in ${options.path || 'current workspace'}`);
        this.outputChannel.show();

        try {
            const workingDir = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!workingDir) {
                throw new Error('No workspace folder found');
            }

            // Determine the performance testing framework or command
            let perfCommand = options.command;
            if (!perfCommand) {
                perfCommand = await this.determinePerformanceTestCommand(workingDir, options);
            }

            if (!perfCommand) {
                throw new Error('Could not determine performance test command');
            }

            // Execute the test command with performance metrics
            this.outputChannel.appendLine(`Running performance test command: ${perfCommand}`);
            
            // For performance tests, we also capture metrics about the execution itself
            const startTime = Date.now();
            const result = await this.executeTestCommand(perfCommand, workingDir);
            const executionTime = Date.now() - startTime;
            
            // Add performance metrics to the result
            result.performanceMetrics = {
                executionTime,
                ...this.parsePerformanceOutput(result.stdout || '')
            };
            
            this.outputChannel.appendLine(`Performance tests completed in ${executionTime}ms`);
            this.outputChannel.appendLine(`Performance metrics: ${JSON.stringify(result.performanceMetrics, null, 2)}`);
            
            return result;
        } catch (error) {
            const errorMsg = `Error running performance tests: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Run static code analysis on the workspace
     */
    public async runStaticAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        this.outputChannel.appendLine(`Running static code analysis in ${options.path || 'current workspace'}`);
        this.outputChannel.show();

        try {
            return await this.staticAnalysisService.runAnalysis(options);
        } catch (error) {
            const errorMsg = `Error running static code analysis: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Run ESLint analysis
     */
    public async runESLintAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.staticAnalysisService.runESLint(options);
    }

    /**
     * Run Prettier analysis
     */
    public async runPrettierAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.staticAnalysisService.runPrettier(options);
    }

    /**
     * Run code coverage analysis
     */
    public async runCodeCoverage(options: CodeCoverageOptions): Promise<TestResult> {
        this.outputChannel.appendLine(`Running code coverage analysis in ${options.path || 'current workspace'}`);
        this.outputChannel.show();

        try {
            return await this.codeCoverageService.runCoverageAnalysis(options);
        } catch (error) {
            const errorMsg = `Error running code coverage analysis: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Run security testing
     */
    public async runSecurityTest(options: SecurityTestOptions): Promise<TestResult> {
        this.outputChannel.appendLine(`Running security tests in ${options.path || 'current workspace'}`);
        this.outputChannel.show();

        try {
            return await this.securityTestingService.runSecurityTest(options);
        } catch (error) {
            const errorMsg = `Error running security tests: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Determines the appropriate test command based on the project type and test type
     */
    private determineTestCommand(options: TestRunnerOptions, testType: TestType): string {
        const workspacePath = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
        
        // Look for package.json to detect npm scripts
        try {
            const packageJsonPath = path.join(workspacePath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = require(packageJsonPath);
                
                if (packageJson.scripts) {
                    // Common test script patterns
                    if (testType === 'unit' && packageJson.scripts.test) {
                        return 'npm test';
                    }
                    if (testType === 'unit' && packageJson.scripts['test:unit']) {
                        return 'npm run test:unit';
                    }
                    if (testType === 'integration' && packageJson.scripts['test:integration']) {
                        return 'npm run test:integration';
                    }
                    if (testType === 'integration' && packageJson.scripts['integration']) {
                        return 'npm run integration';
                    }
                    if (testType === 'e2e' && packageJson.scripts['test:e2e']) {
                        return 'npm run test:e2e';
                    }
                    if (testType === 'e2e' && packageJson.scripts['e2e']) {
                        return 'npm run e2e';
                    }
                    if (testType === 'e2e' && packageJson.scripts['cypress']) {
                        return 'npm run cypress';
                    }
                    if (testType === 'e2e' && packageJson.scripts['playwright']) {
                        return 'npm run playwright';
                    }
                }
            }
        } catch (error) {
            // No package.json or unable to parse it
            this.outputChannel.appendLine(`Couldn't analyze package.json: ${error}`);
        }

        // Look for specific E2E test frameworks
        if (testType === 'e2e') {
            if (fs.existsSync(path.join(workspacePath, 'cypress.json')) || 
                fs.existsSync(path.join(workspacePath, 'cypress.config.js')) ||
                fs.existsSync(path.join(workspacePath, 'cypress.config.ts'))) {
                return 'npx cypress run';
            }
            
            if (fs.existsSync(path.join(workspacePath, 'playwright.config.js')) || 
                fs.existsSync(path.join(workspacePath, 'playwright.config.ts'))) {
                return 'npx playwright test';
            }
            
            return options.command || 'npm run test:e2e';
        }
        
        // Default commands for other test types
        if (testType === 'integration') {
            return options.command || 'npm run test:integration';
        }
        
        return options.command || 'npm test';
    }

    /**
     * Determine the command to run performance tests based on project configuration
     */
    private async determinePerformanceTestCommand(workspacePath: string, options: TestRunnerOptions): Promise<string | undefined> {
        // First check if we should use the configuration wizard
        if (options.configurePerformance) {
            const config = await this.performanceConfigService.configurePerformanceTest(workspacePath);
            return config?.command;
        }
        
        // Otherwise, try to auto-detect
        const availableTools = await this.performanceConfigService.detectPerformanceTools(workspacePath);
        
        if (availableTools.length > 0) {
            // If multiple tools are available, ask the user which one to use
            if (availableTools.length > 1 && options.askForCustomCommand) {
                const selected = await vscode.window.showQuickPick(
                    availableTools.map(tool => ({ 
                        label: this.formatToolName(tool),
                        value: tool 
                    })),
                    { placeHolder: 'Select performance testing tool' }
                );
                
                if (selected) {
                    // Create a configuration for the selected tool
                    const config = await this.performanceConfigService.configurePerformanceTest(workspacePath);
                    return config?.command;
                }
            }
            
            // Use the first available tool if we shouldn't ask
            const tool = availableTools[0];
            switch (tool) {
                case 'lighthouse':
                    return 'npx lighthouse http://localhost:3000 --output json';
                case 'k6':
                    return 'k6 run performance/load-test.js';
                case 'autocannon':
                    return 'npx autocannon http://localhost:3000';
                case 'benchmark.js':
                    return 'node performance/benchmark.js';
                case 'jmeter':
                    return 'jmeter -n -t performance/test-plan.jmx -l results.jtl';
                case 'custom':
                    // Look for package.json scripts
                    try {
                        const packageJsonPath = path.join(workspacePath, 'package.json');
                        if (fs.existsSync(packageJsonPath)) {
                            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                            if (packageJson.scripts) {
                                if (packageJson.scripts['test:performance']) {
                                    return 'npm run test:performance';
                                }
                                if (packageJson.scripts['perf']) {
                                    return 'npm run perf';
                                }
                                if (packageJson.scripts['benchmark']) {
                                    return 'npm run benchmark';
                                }
                            }
                        }
                    } catch (error) {
                        // Ignore JSON parsing errors
                    }
                    break;
            }
        }
        
        // Ask user for a custom command if nothing was detected
        if (options.askForCustomCommand) {
            const customCommand = await vscode.window.showInputBox({
                prompt: 'Enter performance test command',
                placeHolder: 'e.g., npm run benchmark'
            });
            
            return customCommand || undefined;
        }
        
        // Default to a simple performance test using node's built-in performance hooks
        return 'node -e "const { performance } = require(\'perf_hooks\'); const start = performance.now(); require(\'./index.js\'); console.log(`Execution time: ${performance.now() - start}ms`);"';
    }

    /**
     * Format a tool name for display in UI
     */
    private formatToolName(tool: string): string {
        switch (tool) {
            case 'lighthouse': return 'Lighthouse (Web Performance)';
            case 'k6': return 'k6 (Load Testing)';
            case 'autocannon': return 'Autocannon (HTTP Benchmarking)';
            case 'benchmark.js': return 'Benchmark.js (JavaScript Benchmarking)';
            case 'jmeter': return 'JMeter (Load Testing)';
            case 'custom': return 'Custom Script (package.json)';
            default: return tool;
        }
    }

    /**
     * Check if a Node module is installed in the workspace
     */
    private hasNodeModule(workspacePath: string, moduleName: string): boolean {
        try {
            const modulePath = path.join(workspacePath, 'node_modules', moduleName);
            return fs.existsSync(modulePath);
        } catch (error) {
            return false;
        }
    }

    /**
     * Parse performance metrics from test output
     */
    private parsePerformanceOutput(output: string): Record<string, number> {
        const metrics: Record<string, number> = {};
        
        // Try to parse common performance metrics formats
        
        // Format: "Execution time: 123.45ms"
        const executionTimeMatch = output.match(/Execution time: ([\d.]+)ms/);
        if (executionTimeMatch) {
            metrics.executionTimeMs = parseFloat(executionTimeMatch[1]);
        }
        
        // Format: "Memory usage: 34.56 MB"
        const memoryMatch = output.match(/Memory usage: ([\d.]+) MB/);
        if (memoryMatch) {
            metrics.memoryUsageMB = parseFloat(memoryMatch[1]);
        }
        
        // Format: "Requests/sec: 789.01"
        const requestsMatch = output.match(/Requests\/sec: ([\d.]+)/);
        if (requestsMatch) {
            metrics.requestsPerSecond = parseFloat(requestsMatch[1]);
        }
        
        // Try to parse JSON output (common in tools like Lighthouse, k6, etc.)
        try {
            // Look for JSON-like content in the output
            const jsonMatch = output.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                const jsonData = JSON.parse(jsonMatch[0]);
                
                // Extract common metrics from JSON
                if (jsonData.timing && jsonData.timing.total) {
                    metrics.totalTimingMs = jsonData.timing.total;
                }
                
                if (jsonData.performance && jsonData.performance.score) {
                    metrics.performanceScore = jsonData.performance.score;
                }
            }
        } catch (error) {
            // JSON parsing failed, continue with other metrics
        }
        
        return metrics;
    }

    /**
     * Executes a test command in the specified directory
     */
    private async executeTestCommand(command: string, cwd?: string): Promise<TestResult> {
        return new Promise((resolve) => {
            const workingDir = cwd || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            
            if (!workingDir) {
                return resolve({
                    success: false,
                    message: 'No workspace folder found'
                });
            }

            this.outputChannel.appendLine(`Executing: ${command} in ${workingDir}`);
            
            const process = cp.exec(command, { cwd: workingDir });
            
            let stdout = '';
            let stderr = '';
            
            process.stdout?.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                this.outputChannel.append(output);
            });
            
            process.stderr?.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                this.outputChannel.append(output);
            });
            
            process.on('close', (code) => {
                const success = code === 0;
                const result: TestResult = {
                    success,
                    message: success ? 'Tests completed successfully' : 'Tests failed',
                    exitCode: code,
                    stdout,
                    stderr
                };
                
                resolve(result);
            });
        });
    }

    /**
     * Dispose of resources used by the test runner
     */
    public dispose(): void {
        this.outputChannel.dispose();
        this.staticAnalysisService.dispose();
        this.codeCoverageService.dispose();
        this.securityTestingService.dispose();
    }
}
