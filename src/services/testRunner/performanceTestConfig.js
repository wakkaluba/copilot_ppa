"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTestConfigService = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
/**
 * Service for configuring performance tests
 */
var PerformanceTestConfigService = /** @class */ (function () {
    function PerformanceTestConfigService() {
    }
    /**
     * Create a performance test configuration using a wizard
     */
    PerformanceTestConfigService.prototype.configurePerformanceTest = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var framework, config, url, durationType, iterations, duration, customCommand, confirmOptions, editedCommand;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Lighthouse (Web Performance)', value: 'lighthouse' },
                            { label: 'k6 (Load Testing)', value: 'k6' },
                            { label: 'Autocannon (HTTP Benchmarking)', value: 'autocannon' },
                            { label: 'Benchmark.js (JavaScript Benchmarking)', value: 'benchmark.js' },
                            { label: 'JMeter (Load Testing)', value: 'jmeter' },
                            { label: 'Custom Command', value: 'custom' }
                        ], {
                            placeHolder: 'Select performance testing framework'
                        })];
                    case 1:
                        framework = _a.sent();
                        if (!framework) {
                            return [2 /*return*/, undefined]; // User cancelled
                        }
                        config = {
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
                        if (!['lighthouse', 'autocannon'].includes(config.framework)) return [3 /*break*/, 3];
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Enter target URL for performance testing',
                                placeHolder: 'http://localhost:3000',
                                value: config.framework === 'lighthouse' ? 'https://example.com' : 'http://localhost:3000'
                            })];
                    case 2:
                        url = _a.sent();
                        if (url) {
                            config.targetUrl = url;
                            // Update command with URL
                            if (config.framework === 'lighthouse') {
                                config.command = "npx lighthouse ".concat(url, " --output json");
                            }
                            else if (config.framework === 'autocannon') {
                                config.command = "npx autocannon ".concat(url);
                            }
                        }
                        _a.label = 3;
                    case 3:
                        if (!['k6', 'autocannon', 'jmeter'].includes(config.framework)) return [3 /*break*/, 8];
                        return [4 /*yield*/, vscode.window.showQuickPick([
                                { label: 'Number of Iterations', value: 'iterations' },
                                { label: 'Duration', value: 'duration' }
                            ], {
                                placeHolder: 'Configure test duration'
                            })];
                    case 4:
                        durationType = _a.sent();
                        if (!durationType) return [3 /*break*/, 8];
                        if (!(durationType.value === 'iterations')) return [3 /*break*/, 6];
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Enter number of iterations',
                                placeHolder: '100',
                                validateInput: function (input) { return /^\d+$/.test(input) ? null : 'Please enter a number'; }
                            })];
                    case 5:
                        iterations = _a.sent();
                        if (iterations) {
                            config.iterations = parseInt(iterations);
                            // Update command for iterations
                            if (config.framework === 'k6') {
                                config.command = "k6 run --iterations ".concat(iterations, " performance/load-test.js");
                            }
                            else if (config.framework === 'autocannon') {
                                config.command = "npx autocannon -c 10 -p 10 -n ".concat(iterations, " ").concat(config.targetUrl || 'http://localhost:3000');
                            }
                        }
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: 'Enter test duration in seconds',
                            placeHolder: '30',
                            validateInput: function (input) { return /^\d+$/.test(input) ? null : 'Please enter a number'; }
                        })];
                    case 7:
                        duration = _a.sent();
                        if (duration) {
                            config.duration = parseInt(duration);
                            // Update command for duration
                            if (config.framework === 'k6') {
                                config.command = "k6 run --duration ".concat(duration, "s performance/load-test.js");
                            }
                            else if (config.framework === 'autocannon') {
                                config.command = "npx autocannon -c 10 -p 10 -d ".concat(duration, " ").concat(config.targetUrl || 'http://localhost:3000');
                            }
                        }
                        _a.label = 8;
                    case 8:
                        if (!(config.framework === 'custom')) return [3 /*break*/, 10];
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Enter custom performance test command',
                                placeHolder: 'npm run benchmark',
                                value: config.command
                            })];
                    case 9:
                        customCommand = _a.sent();
                        if (customCommand) {
                            config.command = customCommand;
                        }
                        _a.label = 10;
                    case 10: return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Run Performance Test', value: 'run' },
                            { label: 'Edit Command', value: 'edit' },
                            { label: 'Cancel', value: 'cancel' }
                        ], {
                            placeHolder: "Ready to run: ".concat(config.command)
                        })];
                    case 11:
                        confirmOptions = _a.sent();
                        if (!confirmOptions || confirmOptions.value === 'cancel') {
                            return [2 /*return*/, undefined];
                        }
                        if (!(confirmOptions.value === 'edit')) return [3 /*break*/, 13];
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Edit performance test command',
                                value: config.command
                            })];
                    case 12:
                        editedCommand = _a.sent();
                        if (editedCommand) {
                            config.command = editedCommand;
                        }
                        _a.label = 13;
                    case 13: return [2 /*return*/, config];
                }
            });
        });
    };
    /**
     * Detect the performance testing tools available in the workspace
     */
    PerformanceTestConfigService.prototype.detectPerformanceTools = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var tools, packageJsonPath, packageJson;
            return __generator(this, function (_a) {
                tools = [];
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
                packageJsonPath = path.join(workspacePath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    try {
                        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
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
                return [2 /*return*/, tools];
            });
        });
    };
    PerformanceTestConfigService.prototype.hasNodeModule = function (workspacePath, moduleName) {
        try {
            var modulePath = path.join(workspacePath, 'node_modules', moduleName);
            return fs.existsSync(modulePath);
        }
        catch (error) {
            return false;
        }
    };
    return PerformanceTestConfigService;
}());
exports.PerformanceTestConfigService = PerformanceTestConfigService;
