"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.PerformanceAnalyzer = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var ILogger_1 = require("../../logging/ILogger");
var PerformanceMetricsService_1 = require("./services/PerformanceMetricsService");
var PerformanceIssueService_1 = require("./services/PerformanceIssueService");
var PerformanceReportService_1 = require("./services/PerformanceReportService");
var PerformanceProgressService_1 = require("./services/PerformanceProgressService");
var events_1 = require("events");
var PerformanceAnalyzer = /** @class */ (function (_super) {
    __extends(PerformanceAnalyzer, _super);
    function PerformanceAnalyzer(logger, metricsService, issueService, reportService, progressService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsService = metricsService;
        _this.issueService = issueService;
        _this.reportService = reportService;
        _this.progressService = progressService;
        _this.setupEventListeners();
        _this.loadConfiguration();
        return _this;
    }
    PerformanceAnalyzer_1 = PerformanceAnalyzer;
    PerformanceAnalyzer.getInstance = function (logger, metricsService, issueService, reportService, progressService) {
        if (!PerformanceAnalyzer_1.instance) {
            PerformanceAnalyzer_1.instance = new PerformanceAnalyzer_1(logger, metricsService, issueService, reportService, progressService);
        }
        return PerformanceAnalyzer_1.instance;
    };
    PerformanceAnalyzer.prototype.setupEventListeners = function () {
        this.metricsService.on('error', this.handleError.bind(this));
        this.issueService.on('error', this.handleError.bind(this));
        this.reportService.on('error', this.handleError.bind(this));
    };
    PerformanceAnalyzer.prototype.loadConfiguration = function () {
        try {
            var config = vscode.workspace.getConfiguration('copilot-ppa.performance');
            this.config = {
                enableDeepAnalysis: config.get('enableDeepAnalysis', false),
                analysisTimeout: config.get('analysisTimeout', 30000),
                maxIssues: config.get('maxIssues', 100),
                severityThreshold: config.get('severityThreshold', 'medium'),
                excludePatterns: config.get('excludePatterns', [])
            };
        }
        catch (error) {
            this.handleError(new Error("Failed to load configuration: ".concat(error instanceof Error ? error.message : String(error))));
        }
    };
    PerformanceAnalyzer.prototype.analyzeCurrentFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    throw new Error('No active editor found');
                }
                return [2 /*return*/, this.analyzeFile(editor.document.uri)];
            });
        });
    };
    PerformanceAnalyzer.prototype.analyzeFile = function (fileUri) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.progressService.withProgress("Analyzing performance for ".concat(fileUri.fsPath), function (progress) { return __awaiter(_this, void 0, void 0, function () {
                                var document, metrics, issues;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(fileUri)];
                                        case 1:
                                            document = _a.sent();
                                            return [4 /*yield*/, this.metricsService.analyzeFile(document, progress)];
                                        case 2:
                                            metrics = _a.sent();
                                            return [4 /*yield*/, this.issueService.detectIssues(document, metrics)];
                                        case 3:
                                            issues = _a.sent();
                                            if (!(issues.length > 0)) return [3 /*break*/, 5];
                                            return [4 /*yield*/, this.reportService.generateReport(fileUri, issues, metrics)];
                                        case 4:
                                            _a.sent();
                                            _a.label = 5;
                                        case 5:
                                            this.emit('analysisComplete', { fileUri: fileUri, issues: issues, metrics: metrics });
                                            return [2 /*return*/, issues];
                                    }
                                });
                            }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError(new Error("Error analyzing file ".concat(fileUri.fsPath, ": ").concat(error_1 instanceof Error ? error_1.message : String(error_1))));
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PerformanceAnalyzer.prototype.analyzeWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!vscode.workspace.workspaceFolders) {
                            throw new Error('No workspace folder open');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.progressService.withProgress('Analyzing workspace performance', function (progress) { return __awaiter(_this, void 0, void 0, function () {
                                var files, processedFiles, totalFiles, allIssues, _i, files_1, file, issues, report;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx}', "{".concat(this.config.excludePatterns.join(','), "}"))];
                                        case 1:
                                            files = _a.sent();
                                            processedFiles = 0;
                                            totalFiles = files.length;
                                            allIssues = [];
                                            _i = 0, files_1 = files;
                                            _a.label = 2;
                                        case 2:
                                            if (!(_i < files_1.length)) return [3 /*break*/, 5];
                                            file = files_1[_i];
                                            progress.report({
                                                message: "Analyzed ".concat(processedFiles, " of ").concat(totalFiles, " files"),
                                                increment: (100 / totalFiles)
                                            });
                                            return [4 /*yield*/, this.analyzeFile(file)];
                                        case 3:
                                            issues = _a.sent();
                                            allIssues.push.apply(allIssues, issues);
                                            processedFiles++;
                                            _a.label = 4;
                                        case 4:
                                            _i++;
                                            return [3 /*break*/, 2];
                                        case 5: return [4 /*yield*/, this.reportService.generateWorkspaceReport(allIssues)];
                                        case 6:
                                            report = _a.sent();
                                            this.emit('workspaceAnalysisComplete', report);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.handleError(new Error("Error analyzing workspace: ".concat(error_2 instanceof Error ? error_2.message : String(error_2))));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PerformanceAnalyzer.prototype.handleError = function (error) {
        this.logger.error('[PerformanceAnalyzer]', error);
        this.emit('error', error);
    };
    PerformanceAnalyzer.prototype.dispose = function () {
        this.metricsService.dispose();
        this.issueService.dispose();
        this.reportService.dispose();
        this.removeAllListeners();
    };
    var PerformanceAnalyzer_1;
    var _a, _b, _c, _d;
    PerformanceAnalyzer = PerformanceAnalyzer_1 = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(PerformanceMetricsService_1.PerformanceMetricsService)),
        __param(2, (0, inversify_1.inject)(PerformanceIssueService_1.PerformanceIssueService)),
        __param(3, (0, inversify_1.inject)(PerformanceReportService_1.PerformanceReportService)),
        __param(4, (0, inversify_1.inject)(PerformanceProgressService_1.PerformanceProgressService)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, PerformanceMetricsService_1.PerformanceMetricsService, typeof (_b = typeof PerformanceIssueService_1.PerformanceIssueService !== "undefined" && PerformanceIssueService_1.PerformanceIssueService) === "function" ? _b : Object, typeof (_c = typeof PerformanceReportService_1.PerformanceReportService !== "undefined" && PerformanceReportService_1.PerformanceReportService) === "function" ? _c : Object, typeof (_d = typeof PerformanceProgressService_1.PerformanceProgressService !== "undefined" && PerformanceProgressService_1.PerformanceProgressService) === "function" ? _d : Object])
    ], PerformanceAnalyzer);
    return PerformanceAnalyzer;
}(events_1.EventEmitter));
exports.PerformanceAnalyzer = PerformanceAnalyzer;
