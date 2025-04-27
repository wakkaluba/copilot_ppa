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
exports.ComplexityAnalyzer = void 0;
var vscode = require("vscode");
var path = require("path");
var JavaScriptComplexityService_1 = require("./services/JavaScriptComplexityService");
var PythonComplexityService_1 = require("./services/PythonComplexityService");
var ComplexityReportService_1 = require("./services/ComplexityReportService");
/**
 * Analyzes code complexity using various tools
 */
var ComplexityAnalyzer = /** @class */ (function () {
    function ComplexityAnalyzer(context) {
        this.context = context;
        this.jsService = new JavaScriptComplexityService_1.JavaScriptComplexityService();
        this.pyService = new PythonComplexityService_1.PythonComplexityService();
        this.reportService = new ComplexityReportService_1.ComplexityReportService();
    }
    ComplexityAnalyzer.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.outputChannel = vscode.window.createOutputChannel('Code Complexity');
                this.outputChannel.clear();
                this.outputChannel.show();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Analyze the complexity of the current file
     */
    ComplexityAnalyzer.prototype.analyzeFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, document, filePath, workspaceFolder, ext, reportData, html, panel;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        document = editor.document;
                        filePath = document.uri.fsPath;
                        workspaceFolder = (_a = vscode.workspace.getWorkspaceFolder(document.uri)) === null || _a === void 0 ? void 0 : _a.uri.fsPath;
                        if (!workspaceFolder) {
                            vscode.window.showWarningMessage('File must be part of a workspace');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, document.save()];
                    case 1:
                        _b.sent();
                        ext = path.extname(filePath);
                        if (!/\.jsx?$|\.tsx?$/.test(ext)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.jsService.analyze(filePath, workspaceFolder)];
                    case 2:
                        reportData = _b.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!/\.py$/.test(ext)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.pyService.analyze(filePath, workspaceFolder)];
                    case 4:
                        reportData = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        vscode.window.showInformationMessage("No complexity analyzer configured for ".concat(ext, " files"));
                        return [2 /*return*/];
                    case 6:
                        html = this.reportService.renderReport(filePath, reportData);
                        panel = vscode.window.createWebviewPanel('complexityReport', "Complexity: ".concat(path.basename(filePath)), vscode.ViewColumn.Beside, { enableScripts: true });
                        panel.webview.html = html;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculates cyclomatic complexity for code
     * @param code The source code to analyze
     */
    ComplexityAnalyzer.prototype.calculateCyclomaticComplexity = function (code) {
        // Basic implementation - counting decision points
        var complexity = 1; // Base complexity
        var patterns = [
            /\bif\s*\(/g,
            /\belse\s+if\s*\(/g,
            /\bwhile\s*\(/g,
            /\bdo\s*\{/g,
            /\bfor\s*\(/g,
            /\bcase\s+[^:]+:/g,
            /\bcatch\s*\(/g,
            /\breturn\s+.+\?/g, // Ternary operators
            /\&\&|\|\|/g // Logical operators
        ];
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            var matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    };
    /**
     * Calculates maximum nesting depth in code
     * @param code The source code to analyze
     */
    ComplexityAnalyzer.prototype.calculateNestingDepth = function (code) {
        var lines = code.split('\n');
        var currentDepth = 0;
        var maxDepth = 0;
        // Simple implementation - count indentation
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (/[{(\[]/.test(line)) {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            if (/[})\]]/.test(line)) {
                currentDepth = Math.max(0, currentDepth - 1); // Prevent negative numbers
            }
        }
        return maxDepth;
    };
    /**
     * Analyzes a specific function in the code
     * @param code The source code to analyze
     * @param functionName The name of the function to analyze
     */
    ComplexityAnalyzer.prototype.analyzeFunction = function (code, functionName) {
        // Simple implementation - extract function and apply metrics
        var functionRegex = new RegExp("(?:function|class|const|let|var)\\s+".concat(functionName, "\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}"), 'g');
        var methodRegex = new RegExp("".concat(functionName, "\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}"), 'g');
        var functionMatch = functionRegex.exec(code) || methodRegex.exec(code);
        var functionCode = functionMatch ? functionMatch[0] : code;
        var complexity = this.calculateCyclomaticComplexity(functionCode);
        var nestingDepth = this.calculateNestingDepth(functionCode);
        var linesOfCode = functionCode.split('\n').length;
        var maintainabilityIndex = this.calculateMaintainabilityIndex(functionCode);
        return {
            name: functionName,
            complexity: complexity,
            nestingDepth: nestingDepth,
            linesOfCode: linesOfCode,
            maintainabilityIndex: maintainabilityIndex,
            grade: this.getComplexityGrade(complexity)
        };
    };
    /**
     * Analyzes multiple metrics for the code
     * @param code The source code to analyze
     */
    ComplexityAnalyzer.prototype.analyzeMetrics = function (code) {
        var cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
        var nestingDepth = this.calculateNestingDepth(code);
        var linesOfCode = code.split('\n').length;
        var maintainabilityIndex = this.calculateMaintainabilityIndex(code);
        // Calculate comment density
        var commentLines = (code.match(/\/\/.*$|\/\*[\s\S]*?\*\//gm) || []).length;
        var commentDensity = linesOfCode ? (commentLines / linesOfCode) * 100 : 0;
        return {
            cyclomaticComplexity: cyclomaticComplexity,
            nestingDepth: nestingDepth,
            maintainabilityIndex: maintainabilityIndex,
            linesOfCode: linesOfCode,
            commentDensity: commentDensity
        };
    };
    /**
     * Calculates a maintainability index (0-100 scale)
     * Using the Microsoft formula: MI = MAX(0, (171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)) * 100 / 171)
     * Simplified for this implementation
     * @param code The source code to analyze
     */
    ComplexityAnalyzer.prototype.calculateMaintainabilityIndex = function (code) {
        var complexity = this.calculateCyclomaticComplexity(code);
        var linesOfCode = code.split('\n').length;
        // Simplified approximation of the maintainability index
        var mi = 100 - (complexity * 0.25) - (Math.log(linesOfCode) * 15);
        // Adjust for very complex or very large files
        if (complexity > 30) {
            mi -= (complexity - 30) * 0.5;
        }
        if (linesOfCode > 1000) {
            mi -= (linesOfCode - 1000) * 0.01;
        }
        // Ensure the result is between 0 and 100
        return Math.max(0, Math.min(100, mi));
    };
    /**
     * Returns a grade (A-F) based on cyclomatic complexity
     * @param complexity The cyclomatic complexity value
     */
    ComplexityAnalyzer.prototype.getComplexityGrade = function (complexity) {
        if (complexity <= 5)
            return 'A';
        if (complexity <= 10)
            return 'B';
        if (complexity <= 20)
            return 'C';
        if (complexity <= 30)
            return 'D';
        return 'E';
    };
    /**
     * Dispose resources
     */
    ComplexityAnalyzer.prototype.dispose = function () {
        var _a;
        (_a = this.outputChannel) === null || _a === void 0 ? void 0 : _a.dispose();
        this.reportService.dispose();
    };
    return ComplexityAnalyzer;
}());
exports.ComplexityAnalyzer = ComplexityAnalyzer;
