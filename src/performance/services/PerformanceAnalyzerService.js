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
exports.PerformanceAnalyzerService = void 0;
var vscode = require("vscode");
var analyzerFactory_1 = require("../analyzers/analyzerFactory");
var PerformanceAnalyzerService = /** @class */ (function () {
    function PerformanceAnalyzerService(configService) {
        this.configService = configService;
        this.analyzerFactory = analyzerFactory_1.AnalyzerFactory.getInstance();
    }
    PerformanceAnalyzerService.prototype.analyzeFile = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var analyzer;
            return __generator(this, function (_a) {
                try {
                    analyzer = this.analyzerFactory.getAnalyzer(document.fileName, this.configService.getAnalyzerOptions());
                    return [2 /*return*/, analyzer.analyze(document.getText(), document.fileName)];
                }
                catch (error) {
                    console.error("Analysis failed for ".concat(document.fileName, ":"), error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    PerformanceAnalyzerService.prototype.analyzeWorkspace = function (files, progress, token) {
        return __awaiter(this, void 0, void 0, function () {
            var results, increment, i, file, document_1, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        increment = 100 / files.length;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < files.length && !token.isCancellationRequested)) return [3 /*break*/, 8];
                        file = files[i];
                        if (!file) {
                            return [3 /*break*/, 7];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(file.fsPath)];
                    case 3:
                        document_1 = _a.sent();
                        return [4 /*yield*/, this.analyzeFile(document_1)];
                    case 4:
                        result = _a.sent();
                        if (result) {
                            results.push(result);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error("Failed to analyze ".concat(file.fsPath, ":"), error_1);
                        return [3 /*break*/, 6];
                    case 6:
                        progress.report({
                            increment: increment,
                            message: "Analyzed ".concat(i + 1, " of ").concat(files.length, " files")
                        });
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, {
                            fileResults: results,
                            summary: this.generateSummary(results)
                        }];
                }
            });
        });
    };
    PerformanceAnalyzerService.prototype.generateSummary = function (results) {
        return {
            filesAnalyzed: results.length,
            totalIssues: results.reduce(function (sum, r) { return sum + r.issues.length; }, 0),
            criticalIssues: results.reduce(function (sum, r) { return sum + r.issues.filter(function (i) { return i.severity === 'critical'; }).length; }, 0),
            highIssues: results.reduce(function (sum, r) { return sum + r.issues.filter(function (i) { return i.severity === 'high'; }).length; }, 0),
            mediumIssues: results.reduce(function (sum, r) { return sum + r.issues.filter(function (i) { return i.severity === 'medium'; }).length; }, 0),
            lowIssues: results.reduce(function (sum, r) { return sum + r.issues.filter(function (i) { return i.severity === 'low'; }).length; }, 0)
        };
    };
    return PerformanceAnalyzerService;
}());
exports.PerformanceAnalyzerService = PerformanceAnalyzerService;
