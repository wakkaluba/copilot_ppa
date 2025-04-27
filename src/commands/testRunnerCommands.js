"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.registerTestRunnerCommands = registerTestRunnerCommands;
var vscode = require("vscode");
var testRunnerService_1 = require("../services/testRunner/testRunnerService");
var path = require("path");
var securityVulnerabilityPanel_1 = require("../views/securityVulnerabilityPanel");
/**
 * Registers all test runner commands with VS Code
 */
function registerTestRunnerCommands(context) {
    var _this = this;
    var testRunnerService = new testRunnerService_1.TestRunnerService();
    // Register the test runner service for disposal when the extension is deactivated
    context.subscriptions.push(testRunnerService);
    // Register command to run unit tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runUnitTests', function () { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkspaceFolder()];
                case 1:
                    workspaceFolder = _a.sent();
                    if (!workspaceFolder) {
                        return [2 /*return*/];
                    }
                    // Show a loading notification
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Running unit tests",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var options, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    progress.report({ increment: 0 });
                                    options = {
                                        path: workspaceFolder.uri.fsPath
                                    };
                                    return [4 /*yield*/, testRunnerService.runUnitTests(options)];
                                case 1:
                                    result = _a.sent();
                                    progress.report({ increment: 100 });
                                    // Update the test explorer view
                                    vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'unit', result);
                                    // Show result notification
                                    if (result.success) {
                                        vscode.window.showInformationMessage('Unit tests completed successfully');
                                    }
                                    else {
                                        vscode.window.showErrorMessage("Unit tests failed: ".concat(result.message));
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to run integration tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runIntegrationTests', function () { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkspaceFolder()];
                case 1:
                    workspaceFolder = _a.sent();
                    if (!workspaceFolder) {
                        return [2 /*return*/];
                    }
                    // Show a loading notification
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Running integration tests",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var options, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    progress.report({ increment: 0 });
                                    options = {
                                        path: workspaceFolder.uri.fsPath
                                    };
                                    return [4 /*yield*/, testRunnerService.runIntegrationTests(options)];
                                case 1:
                                    result = _a.sent();
                                    progress.report({ increment: 100 });
                                    // Update the test explorer view
                                    vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'integration', result);
                                    // Show result notification
                                    if (result.success) {
                                        vscode.window.showInformationMessage('Integration tests completed successfully');
                                    }
                                    else {
                                        vscode.window.showErrorMessage("Integration tests failed: ".concat(result.message));
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to run E2E tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runE2ETests', function () { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder, configureOption, configureE2E;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkspaceFolder()];
                case 1:
                    workspaceFolder = _a.sent();
                    if (!workspaceFolder) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick(['Run with auto-detected settings', 'Configure E2E test settings'], { placeHolder: 'How do you want to run E2E tests?' })];
                case 2:
                    configureOption = _a.sent();
                    configureE2E = configureOption === 'Configure E2E test settings';
                    // Show a loading notification
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Running E2E tests",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var options, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    progress.report({ increment: 0 });
                                    options = {
                                        path: workspaceFolder.uri.fsPath,
                                        configureE2E: configureE2E
                                    };
                                    return [4 /*yield*/, testRunnerService.runE2ETests(options)];
                                case 1:
                                    result = _a.sent();
                                    progress.report({ increment: 100 });
                                    // Update the test explorer view
                                    vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'e2e', result);
                                    // Show result notification
                                    if (result.success) {
                                        vscode.window.showInformationMessage('E2E tests completed successfully');
                                    }
                                    else {
                                        vscode.window.showErrorMessage("E2E tests failed: ".concat(result.message));
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to run performance tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runPerformanceTests', function () { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder, configOption;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkspaceFolder()];
                case 1:
                    workspaceFolder = _a.sent();
                    if (!workspaceFolder) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Auto-detect performance testing tools', value: 'auto' },
                            { label: 'Configure performance test manually', value: 'manual' }
                        ], {
                            placeHolder: 'How do you want to run performance tests?'
                        })];
                case 2:
                    configOption = _a.sent();
                    if (!configOption) {
                        return [2 /*return*/]; // User cancelled
                    }
                    // Show a loading notification
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Running performance tests",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var options, result, metricsString;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    progress.report({ increment: 0 });
                                    options = {
                                        path: workspaceFolder.uri.fsPath,
                                        configurePerformance: configOption.value === 'manual',
                                        askForCustomCommand: true
                                    };
                                    return [4 /*yield*/, testRunnerService.runPerformanceTests(options)];
                                case 1:
                                    result = _a.sent();
                                    progress.report({ increment: 100 });
                                    // Update the test explorer view
                                    vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'performance', result);
                                    // Show result notification
                                    if (result.success) {
                                        vscode.window.showInformationMessage('Performance tests completed successfully');
                                        // If there are performance metrics, show them
                                        if (result.performanceMetrics && Object.keys(result.performanceMetrics).length > 0) {
                                            metricsString = Object.entries(result.performanceMetrics)
                                                .map(function (_a) {
                                                var key = _a[0], value = _a[1];
                                                return "".concat(key, ": ").concat(value);
                                            })
                                                .join('\n');
                                            vscode.window.showInformationMessage("Performance Metrics:\n".concat(metricsString));
                                        }
                                    }
                                    else {
                                        vscode.window.showErrorMessage("Performance tests failed: ".concat(result.message));
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to run static code analysis
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runStaticAnalysis', function () { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder, toolOption, command, tool, autoFix;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkspaceFolder()];
                case 1:
                    workspaceFolder = _a.sent();
                    if (!workspaceFolder) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Auto-detect', value: 'auto' },
                            { label: 'ESLint', value: 'eslint' },
                            { label: 'Prettier', value: 'prettier' },
                            { label: 'Stylelint', value: 'stylelint' },
                            { label: 'TSLint', value: 'tslint' },
                            { label: 'SonarQube', value: 'sonarqube' },
                            { label: 'Custom Command', value: 'custom' }
                        ], {
                            placeHolder: 'Select static analysis tool'
                        })];
                case 2:
                    toolOption = _a.sent();
                    if (!toolOption) {
                        return [2 /*return*/]; // User cancelled
                    }
                    if (!(toolOption.value === 'custom')) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: 'Enter static analysis command',
                            placeHolder: 'e.g., npx eslint . --fix'
                        })];
                case 3:
                    command = _a.sent();
                    if (!command) {
                        return [2 /*return*/]; // User cancelled
                    }
                    return [3 /*break*/, 5];
                case 4:
                    if (toolOption.value !== 'auto') {
                        tool = toolOption.value;
                    }
                    _a.label = 5;
                case 5: return [4 /*yield*/, vscode.window.showQuickPick(['Yes', 'No'], {
                        placeHolder: 'Automatically fix issues if possible?'
                    })];
                case 6:
                    autoFix = _a.sent();
                    // Show a loading notification
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Running static code analysis",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var options, result, issueCount;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    progress.report({ increment: 0 });
                                    options = {
                                        path: workspaceFolder.uri.fsPath,
                                        tool: tool,
                                        command: command,
                                        autoFix: autoFix === 'Yes'
                                    };
                                    return [4 /*yield*/, testRunnerService.runStaticAnalysis(options)];
                                case 1:
                                    result = _b.sent();
                                    progress.report({ increment: 100 });
                                    // Update the test explorer view
                                    vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'static', result);
                                    issueCount = ((_a = result.staticAnalysis) === null || _a === void 0 ? void 0 : _a.issueCount) || 0;
                                    if (result.success) {
                                        if (issueCount > 0) {
                                            vscode.window.showWarningMessage("Static analysis found ".concat(issueCount, " issues."));
                                        }
                                        else {
                                            vscode.window.showInformationMessage('Static analysis completed successfully with no issues.');
                                        }
                                    }
                                    else {
                                        vscode.window.showErrorMessage("Static analysis failed: ".concat(result.message));
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to run code coverage analysis
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runCodeCoverage', function () { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder, toolOption, command, tool, thresholdInput, threshold;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkspaceFolder()];
                case 1:
                    workspaceFolder = _a.sent();
                    if (!workspaceFolder) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Auto-detect', value: 'auto' },
                            { label: 'Jest', value: 'jest' },
                            { label: 'NYC / Istanbul', value: 'nyc' },
                            { label: 'C8', value: 'c8' },
                            { label: 'Custom Command', value: 'custom' }
                        ], {
                            placeHolder: 'Select code coverage tool'
                        })];
                case 2:
                    toolOption = _a.sent();
                    if (!toolOption) {
                        return [2 /*return*/]; // User cancelled
                    }
                    if (!(toolOption.value === 'custom')) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: 'Enter code coverage command',
                            placeHolder: 'e.g., npm run test:coverage'
                        })];
                case 3:
                    command = _a.sent();
                    if (!command) {
                        return [2 /*return*/]; // User cancelled
                    }
                    return [3 /*break*/, 5];
                case 4:
                    if (toolOption.value !== 'auto') {
                        tool = toolOption.value;
                    }
                    _a.label = 5;
                case 5: return [4 /*yield*/, vscode.window.showInputBox({
                        prompt: 'Enter minimum coverage threshold percentage (0-100)',
                        placeHolder: '80',
                        validateInput: function (input) {
                            var num = Number(input);
                            return (isNaN(num) || num < 0 || num > 100) ? 'Please enter a number between 0 and 100' : null;
                        }
                    })];
                case 6:
                    thresholdInput = _a.sent();
                    threshold = thresholdInput ? parseInt(thresholdInput) : 80;
                    // Show a loading notification
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Running code coverage analysis",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var options, result, enableHighlighting, coveragePercent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    progress.report({ increment: 0 });
                                    options = {
                                        path: workspaceFolder.uri.fsPath,
                                        tool: tool,
                                        command: command,
                                        threshold: threshold
                                    };
                                    return [4 /*yield*/, testRunnerService.runCodeCoverage(options)];
                                case 1:
                                    result = _a.sent();
                                    progress.report({ increment: 100 });
                                    // Update the test explorer view
                                    vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'coverage', result);
                                    if (!result.codeCoverage) return [3 /*break*/, 3];
                                    vscode.commands.executeCommand('localLLMAgent.updateCoverageDecorations', result.codeCoverage);
                                    return [4 /*yield*/, vscode.window.showInformationMessage('Enable coverage highlighting in the editor?', 'Yes', 'No')];
                                case 2:
                                    enableHighlighting = _a.sent();
                                    if (enableHighlighting === 'Yes') {
                                        vscode.commands.executeCommand('localLLMAgent.toggleCoverageHighlight');
                                    }
                                    _a.label = 3;
                                case 3:
                                    // Show result notification
                                    if (result.success) {
                                        if (result.codeCoverage) {
                                            coveragePercent = result.codeCoverage.overall.toFixed(2);
                                            vscode.window.showInformationMessage("Code coverage: ".concat(coveragePercent, "%"));
                                        }
                                        else {
                                            vscode.window.showInformationMessage('Code coverage analysis completed successfully');
                                        }
                                    }
                                    else {
                                        vscode.window.showErrorMessage("Code coverage analysis failed: ".concat(result.message));
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to run security tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runSecurityTest', function () { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder, toolOption, command, tool, severityThreshold, failOnVulnerabilities;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkspaceFolder()];
                case 1:
                    workspaceFolder = _a.sent();
                    if (!workspaceFolder) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Auto-detect', value: 'auto' },
                            { label: 'npm audit', value: 'npm-audit' },
                            { label: 'Snyk', value: 'snyk' },
                            { label: 'OWASP Dependency Check', value: 'owasp-dependency-check' },
                            { label: 'Trivy', value: 'trivy' },
                            { label: 'Custom Command', value: 'custom' }
                        ], {
                            placeHolder: 'Select security testing tool'
                        })];
                case 2:
                    toolOption = _a.sent();
                    if (!toolOption) {
                        return [2 /*return*/]; // User cancelled
                    }
                    if (!(toolOption.value === 'custom')) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: 'Enter security testing command',
                            placeHolder: 'e.g., npm audit --json'
                        })];
                case 3:
                    command = _a.sent();
                    if (!command) {
                        return [2 /*return*/]; // User cancelled
                    }
                    return [3 /*break*/, 5];
                case 4:
                    if (toolOption.value !== 'auto') {
                        tool = toolOption.value;
                    }
                    _a.label = 5;
                case 5: return [4 /*yield*/, vscode.window.showQuickPick([
                        { label: 'Info (All vulnerabilities)', value: 'info' },
                        { label: 'Low', value: 'low' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'High', value: 'high' },
                        { label: 'Critical', value: 'critical' }
                    ], {
                        placeHolder: 'Minimum severity level to report'
                    })];
                case 6:
                    severityThreshold = _a.sent();
                    return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Yes', value: true },
                            { label: 'No', value: false }
                        ], {
                            placeHolder: 'Fail test if vulnerabilities are found?'
                        })];
                case 7:
                    failOnVulnerabilities = _a.sent();
                    // Show a loading notification
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Running security tests",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var options, result, summary, criticalCount, highCount, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    progress.report({ increment: 0 });
                                    options = {
                                        path: workspaceFolder.uri.fsPath,
                                        tool: tool,
                                        command: command,
                                        severityThreshold: severityThreshold === null || severityThreshold === void 0 ? void 0 : severityThreshold.value,
                                        failOnVulnerabilities: failOnVulnerabilities === null || failOnVulnerabilities === void 0 ? void 0 : failOnVulnerabilities.value
                                    };
                                    return [4 /*yield*/, testRunnerService.runSecurityTest(options)];
                                case 1:
                                    result = _a.sent();
                                    progress.report({ increment: 100 });
                                    // Update the test explorer view
                                    vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'security', result);
                                    // Show result notification and offer to open detailed report
                                    if (result.securityTest && result.securityTest.vulnerabilities.length > 0) {
                                        summary = result.securityTest.summary;
                                        criticalCount = summary.critical;
                                        highCount = summary.high;
                                        message = void 0;
                                        if (criticalCount > 0 || highCount > 0) {
                                            message = "Security vulnerabilities found: ".concat(criticalCount, " critical, ").concat(highCount, " high, ").concat(summary.medium, " medium, ").concat(summary.low, " low");
                                            vscode.window.showErrorMessage(message, 'View Details').then(function (selection) {
                                                if (selection === 'View Details') {
                                                    securityVulnerabilityPanel_1.SecurityVulnerabilityPanel.createOrShow(context.extensionUri, result.securityTest.vulnerabilities.map(function (v) { return (__assign(__assign({}, v), { name: v.package || v.id // Use package name as the vulnerability name or fallback to ID
                                                     })); }), 'Security Vulnerabilities');
                                                }
                                            });
                                        }
                                        else if (summary.total > 0) {
                                            message = "Security vulnerabilities found: ".concat(summary.medium, " medium, ").concat(summary.low, " low, ").concat(summary.info, " info");
                                            vscode.window.showWarningMessage(message, 'View Details').then(function (selection) {
                                                if (selection === 'View Details') {
                                                    securityVulnerabilityPanel_1.SecurityVulnerabilityPanel.createOrShow(context.extensionUri, result.securityTest.vulnerabilities.map(function (v) { return (__assign(__assign({}, v), { name: v.package || v.id // Use package name as the vulnerability name or fallback to ID
                                                     })); }), 'Security Vulnerabilities');
                                                }
                                            });
                                        }
                                        else {
                                            vscode.window.showInformationMessage('No security vulnerabilities found');
                                        }
                                    }
                                    else if (result.success) {
                                        vscode.window.showInformationMessage('Security test completed successfully');
                                    }
                                    else {
                                        vscode.window.showErrorMessage("Security test failed: ".concat(result.message));
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to view security vulnerabilities
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.viewSecurityVulnerabilities', function (vulnerabilities) {
        securityVulnerabilityPanel_1.SecurityVulnerabilityPanel.createOrShow(context.extensionUri, vulnerabilities, 'Security Vulnerabilities');
    }));
    // Register command to open a file at a specific location
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.openFileAtLocation', function (filePath, line, column) { return __awaiter(_this, void 0, void 0, function () {
        var absolutePath, document_1, editor, position, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    absolutePath = filePath;
                    if (!path.isAbsolute(filePath) && vscode.workspace.workspaceFolders) {
                        absolutePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
                    }
                    return [4 /*yield*/, vscode.workspace.openTextDocument(absolutePath)];
                case 1:
                    document_1 = _a.sent();
                    return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                case 2:
                    editor = _a.sent();
                    // Move cursor to the specified position
                    if (line !== undefined) {
                        position = new vscode.Position(Math.max(0, line - 1), column !== undefined ? Math.max(0, column - 1) : 0);
                        // Move cursor and reveal the line
                        editor.selection = new vscode.Selection(position, position);
                        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    vscode.window.showErrorMessage("Failed to open file: ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }));
}
/**
 * Helper function to get the workspace folder to run tests in
 */
function getWorkspaceFolder() {
    return __awaiter(this, void 0, void 0, function () {
        var workspaceFolders, selected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders || workspaceFolders.length === 0) {
                        vscode.window.showErrorMessage('No workspace folder is open');
                        return [2 /*return*/, undefined];
                    }
                    // If there's only one workspace folder, use that
                    if (workspaceFolders.length === 1) {
                        return [2 /*return*/, workspaceFolders[0]];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick(workspaceFolders.map(function (folder) { return ({
                            label: folder.name,
                            description: folder.uri.fsPath,
                            folder: folder
                        }); }), { placeHolder: 'Select a workspace folder to run tests in' })];
                case 1:
                    selected = _a.sent();
                    return [2 /*return*/, selected === null || selected === void 0 ? void 0 : selected.folder];
            }
        });
    });
}
