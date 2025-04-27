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
exports.SecurityCommandService = void 0;
var vscode = require("vscode");
/**
 * Service for registering and handling security-related commands
 */
var SecurityCommandService = /** @class */ (function () {
    function SecurityCommandService(analysisSvc, dependencySvc, recommendationSvc, reportSvc) {
        this.analysisSvc = analysisSvc;
        this.dependencySvc = dependencySvc;
        this.recommendationSvc = recommendationSvc;
        this.reportSvc = reportSvc;
        this.disposables = [];
        this.registerCommands();
    }
    /**
     * Register all security-related commands
     */
    SecurityCommandService.prototype.registerCommands = function () {
        var _this = this;
        this.disposables.push(vscode.commands.registerCommand('vscode-local-llm-agent.security.scanActiveFile', function () { return _this.scanActiveFile(); }), vscode.commands.registerCommand('vscode-local-llm-agent.security.scanWorkspace', function () { return _this.scanWorkspace(); }), vscode.commands.registerCommand('vscode-local-llm-agent.security.checkDependencies', function () { return _this.checkDependencies(); }), vscode.commands.registerCommand('vscode-local-llm-agent.security.generateRecommendations', function () { return _this.generateRecommendations(); }), vscode.commands.registerCommand('vscode-local-llm-agent.security.runFullAnalysis', function () { return _this.runFullAnalysis(); }), vscode.commands.registerCommand('vscode-local-llm-agent.security.showSecurityIssues', function (issueId) { return _this.showSecurityIssues(issueId); }), vscode.commands.registerCommand('vscode-local-llm-agent.security.fixAll', function () { return _this.fixAllIssues(); }), vscode.commands.registerCommand('vscode-local-llm-agent.security.applyFix', function (issue) { return _this.applyFix(issue); }));
    };
    /**
     * Scan the active file for security issues
     */
    SecurityCommandService.prototype.scanActiveFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.analysisSvc.scanActiveFile()];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.reportSvc.showCodeIssues(result)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Error scanning file: ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Scan the entire workspace for security issues
     */
    SecurityCommandService.prototype.scanWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Scanning workspace for security issues",
                            cancellable: true
                        }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                            var result, error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, this.analysisSvc.scanWorkspace(function (message) { return progress.report({ message: message }); })];
                                    case 1:
                                        result = _a.sent();
                                        return [4 /*yield*/, this.reportSvc.showCodeIssues(result)];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_2 = _a.sent();
                                        vscode.window.showErrorMessage("Error scanning workspace: ".concat(error_2));
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check dependencies for vulnerabilities
     */
    SecurityCommandService.prototype.checkDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Checking dependencies for vulnerabilities",
                            cancellable: true
                        }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                            var result, error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, this.dependencySvc.scanDependencies(function (message) { return progress.report({ message: message }); })];
                                    case 1:
                                        result = _a.sent();
                                        return [4 /*yield*/, this.reportSvc.showDependencyReport(result)];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_3 = _a.sent();
                                        vscode.window.showErrorMessage("Error checking dependencies: ".concat(error_3));
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate security recommendations
     */
    SecurityCommandService.prototype.generateRecommendations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Generating security recommendations",
                            cancellable: false
                        }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                            var result, error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        progress.report({ message: "Analyzing current security state..." });
                                        return [4 /*yield*/, this.recommendationSvc.generate()];
                                    case 1:
                                        result = _a.sent();
                                        return [4 /*yield*/, this.reportSvc.showFullReport({ issues: [], scannedFiles: 0, timestamp: new Date() }, { vulnerabilities: [], totalDependencies: 0, hasVulnerabilities: false, timestamp: new Date() }, result)];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_4 = _a.sent();
                                        vscode.window.showErrorMessage("Error generating recommendations: ".concat(error_4));
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run a full security analysis
     */
    SecurityCommandService.prototype.runFullAnalysis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Running full security analysis",
                            cancellable: true
                        }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                            var codeResult, dependencyResult, recommendationsResult, error_5;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 5, , 6]);
                                        // Step 1: Code analysis
                                        progress.report({ message: "Scanning code for security issues...", increment: 0 });
                                        return [4 /*yield*/, this.analysisSvc.scanWorkspace(function (message) { return progress.report({ message: message }); })];
                                    case 1:
                                        codeResult = _a.sent();
                                        // Step 2: Dependency analysis
                                        progress.report({ message: "Checking dependencies for vulnerabilities...", increment: 33 });
                                        return [4 /*yield*/, this.dependencySvc.scanDependencies(function (message) { return progress.report({ message: message }); })];
                                    case 2:
                                        dependencyResult = _a.sent();
                                        // Step 3: Generate recommendations
                                        progress.report({ message: "Generating security recommendations...", increment: 66 });
                                        return [4 /*yield*/, this.recommendationSvc.generate()];
                                    case 3:
                                        recommendationsResult = _a.sent();
                                        // Show full report
                                        progress.report({ message: "Preparing report...", increment: 90 });
                                        return [4 /*yield*/, this.reportSvc.showFullReport(codeResult, dependencyResult, recommendationsResult)];
                                    case 4:
                                        _a.sent();
                                        return [3 /*break*/, 6];
                                    case 5:
                                        error_5 = _a.sent();
                                        vscode.window.showErrorMessage("Error during security analysis: ".concat(error_5));
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show security issues of a specific type
     */
    SecurityCommandService.prototype.showSecurityIssues = function (issueId) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.analysisSvc.getIssuesByType(issueId)];
                    case 1:
                        issues = _a.sent();
                        return [4 /*yield*/, this.reportSvc.showFilteredIssues(issues, issueId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        vscode.window.showErrorMessage("Error showing security issues: ".concat(error_6));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fix all security issues that have automated fixes
     */
    SecurityCommandService.prototype.fixAllIssues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Fixing security issues",
                            cancellable: true
                        }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                            var result, fixableIssues, total, i, issue, error_7;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 6, , 7]);
                                        return [4 /*yield*/, this.analysisSvc.scanWorkspace()];
                                    case 1:
                                        result = _a.sent();
                                        fixableIssues = result.issues.filter(function (issue) { return issue.hasFix; });
                                        if (fixableIssues.length === 0) {
                                            vscode.window.showInformationMessage('No automated fixes available');
                                            return [2 /*return*/];
                                        }
                                        total = fixableIssues.length;
                                        i = 0;
                                        _a.label = 2;
                                    case 2:
                                        if (!(i < total)) return [3 /*break*/, 5];
                                        issue = fixableIssues[i];
                                        progress.report({
                                            message: "Fixing ".concat(issue.name, " (").concat(i + 1, "/").concat(total, ")"),
                                            increment: (100 / total)
                                        });
                                        return [4 /*yield*/, this.applyFix(issue)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        i++;
                                        return [3 /*break*/, 2];
                                    case 5:
                                        vscode.window.showInformationMessage("Fixed ".concat(total, " security issues"));
                                        return [3 /*break*/, 7];
                                    case 6:
                                        error_7 = _a.sent();
                                        vscode.window.showErrorMessage("Error fixing issues: ".concat(error_7));
                                        return [3 /*break*/, 7];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply a security fix to a specific issue
     */
    SecurityCommandService.prototype.applyFix = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.commands.executeCommand('vscode-local-llm-agent.security.fix', issue)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage("Fixed ".concat(issue.name, " issue"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        vscode.window.showErrorMessage("Error applying fix: ".concat(error_8));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SecurityCommandService.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return SecurityCommandService;
}());
exports.SecurityCommandService = SecurityCommandService;
