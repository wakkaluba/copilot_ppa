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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanService = void 0;
var logger_1 = require("../../utils/logger");
var security_1 = require("../../types/security");
var codeScanner_1 = require("../../security/codeScanner");
var dependencyScanner_1 = require("../../security/dependencyScanner");
var SecurityScanService = /** @class */ (function () {
    function SecurityScanService(context) {
        this.logger = logger_1.Logger.getInstance();
        this.codeScanner = new codeScanner_1.CodeSecurityScanner(context);
        // Use the getInstance method instead of direct constructor
        this.dependencyScanner = dependencyScanner_1.DependencyScanner.getInstance(context);
    }
    SecurityScanService.prototype.runFullScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, codeResult, dependencyResult, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.codeScanner.scanWorkspace(),
                                this.dependencyScanner.scanWorkspaceDependencies()
                            ])];
                    case 1:
                        _a = _b.sent(), codeResult = _a[0], dependencyResult = _a[1];
                        return [2 /*return*/, {
                                timestamp: new Date(),
                                issues: codeResult.issues,
                                scannedFiles: codeResult.scannedFiles || 0,
                                summary: this.generateSummary(codeResult.issues, dependencyResult.vulnerabilities),
                                metrics: {
                                    filesScanned: codeResult.filesScanned || codeResult.scannedFiles || 0,
                                    issuesFound: codeResult.issues.length + dependencyResult.vulnerabilities.length,
                                    scanDuration: codeResult.duration || 0
                                }
                            }];
                    case 2:
                        error_1 = _b.sent();
                        this.logger.error('Error during security scan', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get detailed information about a security issue
     * @param issueId ID of the issue to get details for
     * @returns Detailed information about the security issue
     */
    SecurityScanService.prototype.getIssueDetails = function (issueId) {
        return __awaiter(this, void 0, void 0, function () {
            var codeIssue, dependencyIssue, error_2;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ((_b = (_a = this.codeScanner).getIssueDetails) === null || _b === void 0 ? void 0 : _b.call(_a, issueId))];
                    case 1:
                        codeIssue = _e.sent();
                        if (codeIssue) {
                            // Make sure we have all required fields by mapping between types if needed
                            return [2 /*return*/, {
                                    id: codeIssue.id,
                                    name: codeIssue.name || "Issue ".concat(issueId),
                                    description: codeIssue.description,
                                    severity: codeIssue.severity,
                                    location: {
                                        file: codeIssue.file || '',
                                        line: codeIssue.line || 0,
                                        column: codeIssue.column || 0
                                    },
                                    recommendation: codeIssue.recommendation || 'No recommendation available',
                                    file: codeIssue.file || '',
                                    line: codeIssue.line || 0,
                                    column: codeIssue.column || 0
                                }];
                        }
                        return [4 /*yield*/, ((_d = (_c = this.dependencyScanner).getVulnerabilityDetails) === null || _d === void 0 ? void 0 : _d.call(_c, issueId))];
                    case 2:
                        dependencyIssue = _e.sent();
                        if (dependencyIssue) {
                            // Format the dependency vulnerability as a security issue
                            return [2 /*return*/, {
                                    id: dependencyIssue.id,
                                    name: dependencyIssue.title || "Vulnerability ".concat(issueId),
                                    description: dependencyIssue.description || 'No description available',
                                    severity: dependencyIssue.severity,
                                    location: {
                                        file: 'package.json',
                                        line: 0,
                                        column: 0
                                    },
                                    recommendation: "Update to version ".concat(dependencyIssue.fixedIn || 'latest'),
                                    file: 'package.json',
                                    line: 0,
                                    column: 0
                                }];
                        }
                        throw new Error("Issue with ID ".concat(issueId, " not found"));
                    case 3:
                        error_2 = _e.sent();
                        this.logger.error("Error getting issue details for ".concat(issueId), error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SecurityScanService.prototype.generateSummary = function (codeIssues, dependencyIssues) {
        var _a;
        var _this = this;
        var counts = (_a = {},
            _a[security_1.SecuritySeverity.CRITICAL] = 0,
            _a[security_1.SecuritySeverity.HIGH] = 0,
            _a[security_1.SecuritySeverity.MEDIUM] = 0,
            _a[security_1.SecuritySeverity.LOW] = 0,
            _a);
        __spreadArray(__spreadArray([], codeIssues, true), dependencyIssues, true).forEach(function (issue) {
            // Map the severity to a valid key
            var severityKey = _this.normalizeSeverity(issue.severity);
            if (counts.hasOwnProperty(severityKey)) {
                counts[severityKey]++;
            }
        });
        return counts;
    };
    SecurityScanService.prototype.normalizeSeverity = function (severity) {
        switch (severity === null || severity === void 0 ? void 0 : severity.toLowerCase()) {
            case 'critical': return security_1.SecuritySeverity.CRITICAL;
            case 'high': return security_1.SecuritySeverity.HIGH;
            case 'medium':
            case 'moderate': return security_1.SecuritySeverity.MEDIUM;
            case 'low':
            default: return security_1.SecuritySeverity.LOW;
        }
    };
    SecurityScanService.prototype.dispose = function () {
        this.codeScanner.dispose();
        this.dependencyScanner.dispose();
    };
    return SecurityScanService;
}());
exports.SecurityScanService = SecurityScanService;
