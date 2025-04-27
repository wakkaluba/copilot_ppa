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
exports.BestPracticesChecker = void 0;
var vscode = require("vscode");
var BestPracticesService_1 = require("./BestPracticesService");
/**
 * Checks and enforces best practices in code
 */
var BestPracticesChecker = /** @class */ (function () {
    function BestPracticesChecker(context, logger) {
        this._logger = logger;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('best-practices');
        this._service = new BestPracticesService_1.BestPracticesService(context);
        context.subscriptions.push(this._diagnosticCollection);
    }
    /**
     * Detects anti-patterns in code
     */
    BestPracticesChecker.prototype.detectAntiPatterns = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._service.detectAntiPatterns(document)];
                    case 1:
                        issues = _a.sent();
                        this.updateDiagnostics(document, issues);
                        return [2 /*return*/, issues];
                    case 2:
                        error_1 = _a.sent();
                        this._logger.error('Error detecting anti-patterns', error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Suggests design improvements
     */
    BestPracticesChecker.prototype.suggestDesignImprovements = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._service.suggestDesignImprovements(document)];
                    case 1:
                        issues = _a.sent();
                        this.updateDiagnostics(document, issues);
                        return [2 /*return*/, issues];
                    case 2:
                        error_2 = _a.sent();
                        this._logger.error('Error suggesting design improvements', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks code consistency
     */
    BestPracticesChecker.prototype.checkCodeConsistency = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._service.checkCodeConsistency(document)];
                    case 1:
                        issues = _a.sent();
                        this.updateDiagnostics(document, issues);
                        return [2 /*return*/, issues];
                    case 2:
                        error_3 = _a.sent();
                        this._logger.error('Error checking code consistency', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run all checks at once
     */
    BestPracticesChecker.prototype.checkAll = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, antiPatterns, designImprovements, consistencyIssues, allIssues, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.detectAntiPatterns(document),
                                this.suggestDesignImprovements(document),
                                this.checkCodeConsistency(document)
                            ])];
                    case 1:
                        _a = _b.sent(), antiPatterns = _a[0], designImprovements = _a[1], consistencyIssues = _a[2];
                        allIssues = __spreadArray(__spreadArray(__spreadArray([], antiPatterns, true), designImprovements, true), consistencyIssues, true);
                        this.updateDiagnostics(document, allIssues);
                        return [2 /*return*/, allIssues];
                    case 2:
                        error_4 = _b.sent();
                        this._logger.error('Error running all checks', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update diagnostics for document
     */
    BestPracticesChecker.prototype.updateDiagnostics = function (document, issues) {
        var _this = this;
        var diagnostics = issues.map(function (issue) {
            var range = new vscode.Range(issue.line - 1, issue.column - 1, issue.line - 1, issue.column + 20);
            var diagnostic = new vscode.Diagnostic(range, "".concat(issue.description, "\n").concat(issue.recommendation), _this.mapSeverityToDiagnosticSeverity(issue.severity));
            diagnostic.source = 'Best Practices';
            return diagnostic;
        });
        this._diagnosticCollection.set(document.uri, diagnostics);
    };
    /**
     * Map severity to VS Code diagnostic severity
     */
    BestPracticesChecker.prototype.mapSeverityToDiagnosticSeverity = function (severity) {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'suggestion': return vscode.DiagnosticSeverity.Hint;
        }
    };
    /**
     * Dispose of resources
     */
    BestPracticesChecker.prototype.dispose = function () {
        this._diagnosticCollection.dispose();
        this._service.dispose();
    };
    return BestPracticesChecker;
}());
exports.BestPracticesChecker = BestPracticesChecker;
