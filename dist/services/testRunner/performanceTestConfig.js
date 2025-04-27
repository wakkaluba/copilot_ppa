"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTestConfigService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for configuring performance tests
 */
class PerformanceTestConfigService {
    /**
     * Create a performance test configuration using a wizard
     */
    async configurePerformanceTest(workspacePath) {
        // Step 1: Select the framework
        const framework = await vscode.window.showQuickPick([
            { label: 'Lighthouse (Web Performance)', value: 'lighthouse' },
            { label: 'k6 (Load Testing)', value: 'k6' },
            { label: 'Autocannon (HTTP Benchmarking)', value: 'autocannon' },
            { label: 'Benchmark.js (JavaScript Benchmarking)', value: 'benchmark.js' },
            { label: 'JMeter (Load Testing)', value: 'jmeter' },
            { label: 'Custom Command', value: 'custom' }
        ], {
            placeHolder: 'Select performance testing framework'
        });
        if (!framework) {
            return undefined; // User cancelled
        }
        const config = {
            framework: framework.value,
            command: ''
        };
        // Set default command based on selected framework
        switch (config.framework) {
            case 'lighthouse':
                config.command = 'npx lighthouse --output json';
                break;
            case 'k6':
                config.command = 'k6 run performance/load-test.js';
                break;
            case 'autocannon':
                config.command = 'npx autocannon http://localhost:3000';
                break;
            case 'benchmark.js':
                config.command = 'node performance/benchmark.js';
                break;
            case 'jmeter':
                config.command = 'jmeter -n -t performance/test-plan.jmx -l results.jtl';
                break;
            case 'custom':
                config.command = 'npm run performance';
                break;
        }
        // Step 2: Configure URL for web performance tools
        if (['lighthouse', 'autocannon'].includes(config.framework)) {
            const url = await vscode.window.showInputBox({
                prompt: 'Enter target URL for performance testing',
                placeHolder: 'http://localhost:3000',
                value: config.framework === 'lighthouse' ? 'https://example.com' : 'http://localhost:3000'
            });
            if (url) {
                config.targetUrl = url;
                // Update command with URL
                if (config.framework === 'lighthouse') {
                    config.command = `npx lighthouse ${url} --output json`;
                }
                else if (config.framework === 'autocannon') {
                    config.command = `npx autocannon ${url}`;
                }
            }
        }
        // Step 3: For load testing tools, configure iterations/duration
        if (['k6', 'autocannon', 'jmeter'].includes(config.framework)) {
            const durationType = await vscode.window.showQuickPick([
                { label: 'Number of Iterations', value: 'iterations' },
                { label: 'Duration', value: 'duration' }
            ], {
                placeHolder: 'Configure test duration'
            });
            if (durationType) {
                if (durationType.value === 'iterations') {
                    const iterations = await vscode.window.showInputBox({
                        prompt: 'Enter number of iterations',
                        placeHolder: '100',
                        validateInput: input => /^\d+$/.test(input) ? null : 'Please enter a number'
                    });
                    if (iterations) {
                        config.iterations = parseInt(iterations);
                        // Update command for iterations
                        if (config.framework === 'k6') {
                            config.command = `k6 run --iterations ${iterations} performance/load-test.js`;
                        }
                        else if (config.framework === 'autocannon') {
                            config.command = `npx autocannon -c 10 -p 10 -n ${iterations} ${config.targetUrl || 'http://localhost:3000'}`;
                        }
                    }
                }
                else {
                    const duration = await vscode.window.showInputBox({
                        prompt: 'Enter test duration in seconds',
                        placeHolder: '30',
                        validateInput: input => /^\d+$/.test(input) ? null : 'Please enter a number'
                    });
                    if (duration) {
                        config.duration = parseInt(duration);
                        // Update command for duration
                        if (config.framework === 'k6') {
                            config.command = `k6 run --duration ${duration}s performance/load-test.js`;
                        }
                        else if (config.framework === 'autocannon') {
                            config.command = `npx autocannon -c 10 -p 10 -d ${duration} ${config.targetUrl || 'http://localhost:3000'}`;
                        }
                    }
                }
            }
        }
        // Step 4: For custom commands, let user enter the command directly
        if (config.framework === 'custom') {
            const customCommand = await vscode.window.showInputBox({
                prompt: 'Enter custom performance test command',
                placeHolder: 'npm run benchmark',
                value: config.command
            });
            if (customCommand) {
                config.command = customCommand;
            }
        }
        // Confirm the configuration
        const confirmOptions = await vscode.window.showQuickPick([
            { label: 'Run Performance Test', value: 'run' },
            { label: 'Edit Command', value: 'edit' },
            { label: 'Cancel', value: 'cancel' }
        ], {
            placeHolder: `Ready to run: ${config.command}`
        });
        if (!confirmOptions || confirmOptions.value === 'cancel') {
            return undefined;
        }
        if (confirmOptions.value === 'edit') {
            const editedCommand = await vscode.window.showInputBox({
                prompt: 'Edit performance test command',
                value: config.command
            });
            if (editedCommand) {
                config.command = editedCommand;
            }
        }
        return config;
    }
    /**
     * Detect the performance testing tools available in the workspace
     */
    async detectPerformanceTools(workspacePath) {
        const tools = [];
        // Check for node_modules
        if (this.hasNodeModule(workspacePath, 'lighthouse')) {
            tools.push('lighthouse');
        }
        if (this.hasNodeModule(workspacePath, 'k6')) {
            tools.push('k6');
        }
        if (this.hasNodeModule(workspacePath, 'autocannon')) {
            tools.push('autocannon');
        }
        if (this.hasNodeModule(workspacePath, 'benchmark')) {
            tools.push('benchmark.js');
        }
        // Check for JMeter
        if (fs.existsSync(path.join(workspacePath, 'performance/test-plan.jmx'))) {
            tools.push('jmeter');
        }
        // Check package.json for performance scripts
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.scripts) {
                    if (packageJson.scripts['test:performance'] ||
                        packageJson.scripts['perf'] ||
                        packageJson.scripts['benchmark']) {
                        tools.push('custom');
                    }
                }
            }
            catch (error) {
                // Ignore JSON parsing errors
            }
        }
        return tools;
    }
    hasNodeModule(workspacePath, moduleName) {
        try {
            const modulePath = path.join(workspacePath, 'node_modules', moduleName);
            return fs.existsSync(modulePath);
        }
        catch (error) {
            return false;
        }
    }
}
exports.PerformanceTestConfigService = PerformanceTestConfigService;
//# sourceMappingURL=performanceTestConfig.js.map