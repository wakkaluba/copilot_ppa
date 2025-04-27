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
exports.DiagnosticReportGenerator = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var os = require("os");
var SystemInfoService_1 = require("./services/SystemInfoService");
var ConfigService_1 = require("./services/ConfigService");
var PerformanceMetricsService_1 = require("./services/PerformanceMetricsService");
var RuntimeTracker_1 = require("./services/RuntimeTracker");
var LogService_1 = require("./services/LogService");
var DiagnosticReportHtmlProvider_1 = require("./providers/DiagnosticReportHtmlProvider");
/**
 * Class to generate diagnostic reports for the extension
 */
var DiagnosticReportGenerator = /** @class */ (function () {
    function DiagnosticReportGenerator(logger, context, systemChecker) {
        this._requestCount = 0;
        this._errorCount = 0;
        this._lastError = null;
        this._lastErrorTime = null;
        this._responseTimeHistory = [];
        this._logger = logger;
        this._extensionContext = context;
        this._systemChecker = systemChecker;
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA Diagnostics');
        this._startTime = Date.now();
        this.systemInfoSvc = new SystemInfoService_1.SystemInfoService(systemChecker);
        this.configSvc = new ConfigService_1.ConfigService(vscode.workspace.getConfiguration());
        this.perfSvc = new PerformanceMetricsService_1.PerformanceMetricsService();
        this.runtimeTracker = new RuntimeTracker_1.RuntimeTracker();
        this.logService = new LogService_1.LogService(logger);
    }
    /**
     * Track a request to the LLM
     */
    DiagnosticReportGenerator.prototype.trackRequest = function (responseTimeMs, isError, errorMessage) {
        if (isError === void 0) { isError = false; }
        this._requestCount++;
        if (responseTimeMs > 0) {
            this._responseTimeHistory.push(responseTimeMs);
            // Keep only the last 100 response times for memory efficiency
            if (this._responseTimeHistory.length > 100) {
                this._responseTimeHistory.shift();
            }
        }
        if (isError) {
            this._errorCount++;
            this._lastError = errorMessage || "Unknown error";
            this._lastErrorTime = new Date().toISOString();
        }
    };
    /**
     * Generate a diagnostic report
     */
    DiagnosticReportGenerator.prototype.generateReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var systemInfo, config, performance_1, runtime, logs, report, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._logger.info('Generating diagnostic report');
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.systemInfoSvc.collect()];
                    case 2:
                        systemInfo = _c.sent();
                        config = this.configSvc.flatten();
                        performance_1 = this.perfSvc.getMetrics(this._responseTimeHistory);
                        runtime = this.runtimeTracker.getInfo();
                        logs = this.logService.getRecent();
                        report = {
                            timestamp: new Date().toISOString(),
                            extension: {
                                name: ((_a = vscode.extensions.getExtension('copilot-ppa')) === null || _a === void 0 ? void 0 : _a.packageJSON.name) || 'copilot-ppa',
                                version: ((_b = vscode.extensions.getExtension('copilot-ppa')) === null || _b === void 0 ? void 0 : _b.packageJSON.version) || '1.0.0',
                                environment: vscode.env.appName
                            },
                            system: systemInfo,
                            configuration: config,
                            performance: performance_1,
                            runtime: runtime,
                            logs: logs
                        };
                        return [2 /*return*/, report];
                    case 3:
                        error_1 = _c.sent();
                        this._logger.error('Error generating diagnostic report', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save the report to a file
     */
    DiagnosticReportGenerator.prototype.saveReportToFile = function (report) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, downloadsFolder, filePath, reportJson;
            return __generator(this, function (_a) {
                try {
                    timestamp = new Date().toISOString().replace(/:/g, '-');
                    downloadsFolder = path.join(os.homedir(), 'Downloads');
                    filePath = path.join(downloadsFolder, "copilot-ppa-diagnostic-".concat(timestamp, ".json"));
                    reportJson = JSON.stringify(report, null, 2);
                    // Write to file
                    fs.writeFileSync(filePath, reportJson);
                    this._logger.info("Diagnostic report saved to ".concat(filePath));
                    return [2 /*return*/, filePath];
                }
                catch (error) {
                    this._logger.error('Error saving diagnostic report', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Display the report in a webview panel
     */
    DiagnosticReportGenerator.prototype.displayReportInWebview = function (report) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            var _this = this;
            return __generator(this, function (_a) {
                panel = vscode.window.createWebviewPanel('copilotPpaDiagnostics', 'Copilot PPA Diagnostic Report', vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true
                });
                // Generate HTML content
                panel.webview.html = DiagnosticReportHtmlProvider_1.DiagnosticReportHtmlProvider.getHtml(report);
                // Handle messages from the webview
                panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, filePath, error_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = message.command;
                                switch (_a) {
                                    case 'saveReport': return [3 /*break*/, 1];
                                }
                                return [3 /*break*/, 5];
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, this.saveReportToFile(report)];
                            case 2:
                                filePath = _b.sent();
                                vscode.window.showInformationMessage("Diagnostic report saved to ".concat(filePath));
                                return [3 /*break*/, 4];
                            case 3:
                                error_2 = _b.sent();
                                vscode.window.showErrorMessage("Error saving report: ".concat(error_2));
                                return [3 /*break*/, 4];
                            case 4: return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); }, undefined, this._extensionContext.subscriptions);
                return [2 /*return*/];
            });
        });
    };
    return DiagnosticReportGenerator;
}());
exports.DiagnosticReportGenerator = DiagnosticReportGenerator;
