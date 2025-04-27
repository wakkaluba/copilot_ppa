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
exports.TestReporter = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs");
/**
 * Class responsible for test reporting, trend analysis, and export functionality
 */
var TestReporter = /** @class */ (function () {
    function TestReporter(context) {
        this.context = context;
        this.historicalData = new Map();
        this.outputChannel = vscode.window.createOutputChannel('Test Reports');
        this.loadHistoricalData();
    }
    /**
     * Format and display test results in the UI
     */
    TestReporter.prototype.formatAndDisplayResults = function (testResults) {
        var _this = this;
        this.outputChannel.clear();
        this.outputChannel.appendLine("# Test Results - ".concat(new Date().toLocaleString()));
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine("Total tests: ".concat(testResults.totalTests));
        this.outputChannel.appendLine("Passed: ".concat(testResults.passed, " (").concat(Math.round(testResults.passed / testResults.totalTests * 100), "%)"));
        this.outputChannel.appendLine("Failed: ".concat(testResults.failed));
        this.outputChannel.appendLine("Skipped: ".concat(testResults.skipped));
        this.outputChannel.appendLine("Duration: ".concat(testResults.duration, "ms"));
        this.outputChannel.appendLine('');
        testResults.suites.forEach(function (suite) {
            _this.displayTestSuite(suite, 0);
        });
        this.outputChannel.show();
        // Save historical data
        this.saveTestResultHistory(testResults);
    };
    /**
     * Display a test suite and its tests with proper indentation
     */
    TestReporter.prototype.displayTestSuite = function (suite, indentLevel) {
        var _this = this;
        var indent = '  '.repeat(indentLevel);
        this.outputChannel.appendLine("".concat(indent, "## ").concat(suite.name));
        suite.tests.forEach(function (test) {
            var status = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏩';
            _this.outputChannel.appendLine("".concat(indent, "  ").concat(status, " ").concat(test.name, " (").concat(test.duration, "ms)"));
            if (test.status === 'failed' && test.error) {
                _this.outputChannel.appendLine("".concat(indent, "    Error: ").concat(test.error));
                if (test.stackTrace) {
                    _this.outputChannel.appendLine("".concat(indent, "    Stack: ").concat(test.stackTrace));
                }
            }
        });
        suite.suites.forEach(function (childSuite) {
            _this.displayTestSuite(childSuite, indentLevel + 1);
        });
    };
    /**
     * Save test results to historical data
     */
    TestReporter.prototype.saveTestResultHistory = function (testResults) {
        var historyEntry = {
            timestamp: new Date(),
            totalTests: testResults.totalTests,
            passed: testResults.passed,
            failed: testResults.failed,
            skipped: testResults.skipped,
            duration: testResults.duration,
            passRate: testResults.passed / testResults.totalTests
        };
        var workspaceName = this.getWorkspaceName();
        if (!this.historicalData.has(workspaceName)) {
            this.historicalData.set(workspaceName, []);
        }
        var history = this.historicalData.get(workspaceName);
        history.push(historyEntry);
        // Keep only the last 100 entries to avoid excessive storage
        if (history.length > 100) {
            history.shift();
        }
        this.saveHistoricalData();
    };
    /**
     * Analyze historical test trends and display visualization
     */
    TestReporter.prototype.showHistoricalTrends = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceName, history, panel;
            return __generator(this, function (_a) {
                workspaceName = this.getWorkspaceName();
                if (!this.historicalData.has(workspaceName) || this.historicalData.get(workspaceName).length === 0) {
                    vscode.window.showInformationMessage('No historical test data available for trend analysis.');
                    return [2 /*return*/];
                }
                history = this.historicalData.get(workspaceName);
                panel = vscode.window.createWebviewPanel('testTrends', 'Test Trends Analysis', vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true
                });
                // Create HTML content with chart.js for visualization
                panel.webview.html = this.generateTrendHtml(history);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generate HTML for trend visualization
     */
    TestReporter.prototype.generateTrendHtml = function (history) {
        var passRateData = history.map(function (entry) { return ({
            x: entry.timestamp.getTime(),
            y: entry.passRate * 100
        }); });
        var durationData = history.map(function (entry) { return ({
            x: entry.timestamp.getTime(),
            y: entry.duration
        }); });
        var totalTestsData = history.map(function (entry) { return ({
            x: entry.timestamp.getTime(),
            y: entry.totalTests
        }); });
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>\n                <style>\n                    body { font-family: Arial, sans-serif; margin: 20px; }\n                    .chart-container { width: 100%; height: 300px; margin-bottom: 30px; }\n                    h1, h2 { color: #333; }\n                </style>\n            </head>\n            <body>\n                <h1>Test Trend Analysis</h1>\n                \n                <h2>Pass Rate Trend</h2>\n                <div class=\"chart-container\">\n                    <canvas id=\"passRateChart\"></canvas>\n                </div>\n                \n                <h2>Test Duration Trend</h2>\n                <div class=\"chart-container\">\n                    <canvas id=\"durationChart\"></canvas>\n                </div>\n                \n                <h2>Total Tests Trend</h2>\n                <div class=\"chart-container\">\n                    <canvas id=\"totalTestsChart\"></canvas>\n                </div>\n                \n                <script>\n                    const passRateData = ".concat(JSON.stringify(passRateData), ";\n                    const durationData = ").concat(JSON.stringify(durationData), ";\n                    const totalTestsData = ").concat(JSON.stringify(totalTestsData), ";\n                    \n                    function createChart(elementId, label, data, color, yAxisLabel) {\n                        const ctx = document.getElementById(elementId).getContext('2d');\n                        return new Chart(ctx, {\n                            type: 'line',\n                            data: {\n                                datasets: [{\n                                    label: label,\n                                    data: data,\n                                    borderColor: color,\n                                    backgroundColor: color + '33',\n                                    fill: true,\n                                    tension: 0.4\n                                }]\n                            },\n                            options: {\n                                scales: {\n                                    x: {\n                                        type: 'time',\n                                        time: {\n                                            unit: 'day'\n                                        },\n                                        title: {\n                                            display: true,\n                                            text: 'Date'\n                                        }\n                                    },\n                                    y: {\n                                        title: {\n                                            display: true,\n                                            text: yAxisLabel\n                                        }\n                                    }\n                                }\n                            }\n                        });\n                    }\n                    \n                    // Create charts when page loads\n                    window.addEventListener('load', () => {\n                        createChart('passRateChart', 'Pass Rate', passRateData, '#4CAF50', 'Pass Rate (%)');\n                        createChart('durationChart', 'Test Duration', durationData, '#2196F3', 'Duration (ms)');\n                        createChart('totalTestsChart', 'Total Tests', totalTestsData, '#FFC107', 'Number of Tests');\n                    });\n                </script>\n            </body>\n            </html>\n        ");
    };
    /**
     * Export test results to a file in different formats
     */
    TestReporter.prototype.exportTestResults = function (testResults) {
        return __awaiter(this, void 0, void 0, function () {
            var format, workspaceFolder, reportDir, timestamp, fileName, filePath, content, openFile, fileUri, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, vscode.window.showQuickPick(['JSON', 'HTML', 'Markdown', 'CSV'], {
                            placeHolder: 'Select export format'
                        })];
                    case 1:
                        format = _b.sent();
                        if (!format) {
                            return [2 /*return*/];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
                        if (!workspaceFolder) {
                            throw new Error('No workspace folder is open');
                        }
                        reportDir = path.join(workspaceFolder.uri.fsPath, 'test-reports');
                        if (!fs.existsSync(reportDir)) {
                            fs.mkdirSync(reportDir, { recursive: true });
                        }
                        timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
                        fileName = "test-report_".concat(timestamp, ".").concat(this.getFileExtension(format));
                        filePath = path.join(reportDir, fileName);
                        content = this.generateReportContent(testResults, format);
                        fs.writeFileSync(filePath, content);
                        return [4 /*yield*/, vscode.window.showInformationMessage("Test report exported to ".concat(fileName), 'Open File')];
                    case 3:
                        openFile = _b.sent();
                        if (openFile === 'Open File') {
                            fileUri = vscode.Uri.file(filePath);
                            vscode.commands.executeCommand('vscode.open', fileUri);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        vscode.window.showErrorMessage("Failed to export test results: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get file extension based on the selected format
     */
    TestReporter.prototype.getFileExtension = function (format) {
        switch (format) {
            case 'JSON': return 'json';
            case 'HTML': return 'html';
            case 'Markdown': return 'md';
            case 'CSV': return 'csv';
            default: return 'txt';
        }
    };
    /**
     * Generate report content in the selected format
     */
    TestReporter.prototype.generateReportContent = function (testResults, format) {
        switch (format) {
            case 'JSON':
                return JSON.stringify(testResults, null, 2);
            case 'HTML':
                return this.generateHtmlReport(testResults);
            case 'Markdown':
                return this.generateMarkdownReport(testResults);
            case 'CSV':
                return this.generateCsvReport(testResults);
            default:
                return JSON.stringify(testResults, null, 2);
        }
    };
    /**
     * Generate HTML report
     */
    TestReporter.prototype.generateHtmlReport = function (testResults) {
        var _this = this;
        var html = "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Test Report</title>\n                <style>\n                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }\n                    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }\n                    .pass { color: #4CAF50; }\n                    .fail { color: #F44336; }\n                    .skip { color: #FF9800; }\n                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }\n                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }\n                    th { background-color: #f2f2f2; }\n                    .error { background-color: #FFEBEE; padding: 10px; border-radius: 3px; margin-top: 5px; }\n                </style>\n            </head>\n            <body>\n                <h1>Test Report</h1>\n                <div class=\"summary\">\n                    <h2>Summary</h2>\n                    <p>Date: ".concat(new Date().toLocaleString(), "</p>\n                    <p>Total tests: ").concat(testResults.totalTests, "</p>\n                    <p>Passed: <span class=\"pass\">").concat(testResults.passed, " (").concat(Math.round(testResults.passed / testResults.totalTests * 100), "%)</span></p>\n                    <p>Failed: <span class=\"fail\">").concat(testResults.failed, "</span></p>\n                    <p>Skipped: <span class=\"skip\">").concat(testResults.skipped, "</span></p>\n                    <p>Duration: ").concat(testResults.duration, "ms</p>\n                </div>\n        ");
        // Add test suites
        testResults.suites.forEach(function (suite) {
            html += _this.generateHtmlForSuite(suite, 0);
        });
        html += "\n            </body>\n            </html>\n        ";
        return html;
    };
    /**
     * Generate HTML for a test suite recursively
     */
    TestReporter.prototype.generateHtmlForSuite = function (suite, depth) {
        var _this = this;
        var html = "<h".concat(Math.min(depth + 2, 6), ">").concat(suite.name, "</h").concat(Math.min(depth + 2, 6), ">");
        if (suite.tests.length > 0) {
            html += "\n                <table>\n                    <thead>\n                        <tr>\n                            <th>Status</th>\n                            <th>Test</th>\n                            <th>Duration</th>\n                            <th>Details</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n            ";
            suite.tests.forEach(function (test) {
                var statusClass = test.status === 'passed' ? 'pass' : test.status === 'failed' ? 'fail' : 'skip';
                var statusText = test.status === 'passed' ? '✅ Passed' : test.status === 'failed' ? '❌ Failed' : '⏩ Skipped';
                html += "\n                    <tr>\n                        <td class=\"".concat(statusClass, "\">").concat(statusText, "</td>\n                        <td>").concat(test.name, "</td>\n                        <td>").concat(test.duration, "ms</td>\n                        <td>\n                ");
                if (test.status === 'failed' && test.error) {
                    html += "<div class=\"error\">Error: ".concat(test.error);
                    if (test.stackTrace) {
                        html += "<pre>".concat(test.stackTrace, "</pre>");
                    }
                    html += "</div>";
                }
                html += "</td></tr>";
            });
            html += "\n                    </tbody>\n                </table>\n            ";
        }
        // Process child suites
        suite.suites.forEach(function (childSuite) {
            html += _this.generateHtmlForSuite(childSuite, depth + 1);
        });
        return html;
    };
    /**
     * Generate Markdown report
     */
    TestReporter.prototype.generateMarkdownReport = function (testResults) {
        var _this = this;
        var markdown = "# Test Report\n\n";
        markdown += "## Summary\n\n";
        markdown += "- Date: ".concat(new Date().toLocaleString(), "\n");
        markdown += "- Total tests: ".concat(testResults.totalTests, "\n");
        markdown += "- Passed: ".concat(testResults.passed, " (").concat(Math.round(testResults.passed / testResults.totalTests * 100), "%)\n");
        markdown += "- Failed: ".concat(testResults.failed, "\n");
        markdown += "- Skipped: ".concat(testResults.skipped, "\n");
        markdown += "- Duration: ".concat(testResults.duration, "ms\n\n");
        // Add test suites
        testResults.suites.forEach(function (suite) {
            markdown += _this.generateMarkdownForSuite(suite, 2);
        });
        return markdown;
    };
    /**
     * Generate Markdown for a test suite recursively
     */
    TestReporter.prototype.generateMarkdownForSuite = function (suite, depth) {
        var _this = this;
        var markdown = "".concat('#'.repeat(depth), " ").concat(suite.name, "\n\n");
        if (suite.tests.length > 0) {
            markdown += "| Status | Test | Duration | Details |\n";
            markdown += "| ------ | ---- | -------- | ------- |\n";
            suite.tests.forEach(function (test) {
                var status = test.status === 'passed' ? '✅ Pass' : test.status === 'failed' ? '❌ Fail' : '⏩ Skip';
                var details = '';
                if (test.status === 'failed' && test.error) {
                    details = "Error: ".concat(test.error);
                    if (test.stackTrace) {
                        // Limit stack trace to one line for markdown table
                        var firstLine = test.stackTrace.split('\n')[0];
                        details += " (".concat(firstLine, ")");
                    }
                }
                markdown += "| ".concat(status, " | ").concat(test.name, " | ").concat(test.duration, "ms | ").concat(details, " |\n");
            });
            markdown += '\n';
        }
        // Process child suites
        suite.suites.forEach(function (childSuite) {
            markdown += _this.generateMarkdownForSuite(childSuite, depth + 1);
        });
        return markdown;
    };
    /**
     * Generate CSV report
     */
    TestReporter.prototype.generateCsvReport = function (testResults) {
        var csv = "\"Suite\",\"Test\",\"Status\",\"Duration (ms)\",\"Error\"\n";
        var addTestsToCsv = function (suite, suitePath) {
            var currentPath = suitePath ? "".concat(suitePath, " > ").concat(suite.name) : suite.name;
            suite.tests.forEach(function (test) {
                var status = test.status;
                var error = test.error || '';
                // CSV escaping - double quotes in fields are escaped with double quotes
                var escapedTest = test.name.replace(/"/g, '""');
                var escapedPath = currentPath.replace(/"/g, '""');
                var escapedError = error.replace(/"/g, '""');
                csv += "\"".concat(escapedPath, "\",\"").concat(escapedTest, "\",\"").concat(status, "\",\"").concat(test.duration, "\",\"").concat(escapedError, "\"\n");
            });
            // Process child suites
            suite.suites.forEach(function (childSuite) {
                addTestsToCsv(childSuite, currentPath);
            });
        };
        // Start with top-level suites
        testResults.suites.forEach(function (suite) {
            addTestsToCsv(suite, '');
        });
        return csv;
    };
    /**
     * Get the name of the current workspace
     */
    TestReporter.prototype.getWorkspaceName = function () {
        var _a;
        var workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
        return workspaceFolder ? path.basename(workspaceFolder.uri.fsPath) : 'unknown-workspace';
    };
    /**
     * Load historical test data from storage
     */
    TestReporter.prototype.loadHistoricalData = function () {
        var _this = this;
        var data = this.context.globalState.get('testHistoricalData');
        if (data) {
            this.historicalData = new Map();
            Object.entries(data).forEach(function (_a) {
                var workspace = _a[0], entries = _a[1];
                _this.historicalData.set(workspace, entries.map(function (entry) { return (__assign(__assign({}, entry), { timestamp: new Date(entry.timestamp) })); }));
            });
        }
    };
    /**
     * Save historical test data to storage
     */
    TestReporter.prototype.saveHistoricalData = function () {
        var serializedData = {};
        this.historicalData.forEach(function (entries, workspace) {
            serializedData[workspace] = entries;
        });
        this.context.globalState.update('testHistoricalData', serializedData);
    };
    return TestReporter;
}());
exports.TestReporter = TestReporter;
