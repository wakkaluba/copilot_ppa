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
exports.DependencyScanner = void 0;
var vscode = require("vscode");
var VulnerabilityService_1 = require("./services/VulnerabilityService");
var DependencyScanService_1 = require("./services/DependencyScanService");
var VulnerabilityReportService_1 = require("./services/VulnerabilityReportService");
var logger_1 = require("../utils/logger");
/**
 * Class responsible for scanning project dependencies for known vulnerabilities
 */
var DependencyScanner = /** @class */ (function () {
    function DependencyScanner(context) {
        this.vulnerabilityCache = new Map();
        this.logger = logger_1.Logger.getInstance();
        this.vulnerabilityService = new VulnerabilityService_1.VulnerabilityService();
        this.scanService = new DependencyScanService_1.DependencyScanService(this.vulnerabilityService);
        this.reportService = new VulnerabilityReportService_1.VulnerabilityReportService(context);
    }
    DependencyScanner.getInstance = function (context) {
        if (!DependencyScanner.instance) {
            DependencyScanner.instance = new DependencyScanner(context);
        }
        return DependencyScanner.instance;
    };
    /**
     * Scans the workspace for dependency files and checks for vulnerabilities
     */
    DependencyScanner.prototype.scanWorkspaceDependencies = function () {
        return __awaiter(this, arguments, void 0, function (silent) {
            var error_1;
            var _this = this;
            if (silent === void 0) { silent = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Scanning dependencies for vulnerabilities...",
                                cancellable: true
                            }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.scanService.scanWorkspace()];
                                        case 1:
                                            result = _a.sent();
                                            // Cache vulnerabilities for later retrieval
                                            result.vulnerabilities.forEach(function (vuln) {
                                                vuln.vulnerabilityInfo.forEach(function (info) {
                                                    _this.vulnerabilityCache.set(info.id, info);
                                                });
                                            });
                                            if (!silent) {
                                                this.reportService.updateStatusBar(result.hasVulnerabilities, result.vulnerabilities.length);
                                            }
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error scanning workspace dependencies', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get detailed information about a specific vulnerability
     * @param vulnId The ID of the vulnerability to retrieve details for
     * @returns Detailed vulnerability information, or undefined if not found
     */
    DependencyScanner.prototype.getVulnerabilityDetails = function (vulnId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.vulnerabilityCache.get(vulnId);
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.vulnerabilityService.getVulnerabilityDetails(vulnId)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2: return [2 /*return*/, _a];
                }
            });
        });
    };
    /**
     * Shows a detailed vulnerability report
     */
    DependencyScanner.prototype.showVulnerabilityReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.scanWorkspaceDependencies()];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.reportService.showReport(result)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Error showing vulnerability report', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DependencyScanner.prototype.dispose = function () {
        this.reportService.dispose();
        this.vulnerabilityCache.clear();
    };
    return DependencyScanner;
}());
exports.DependencyScanner = DependencyScanner;
