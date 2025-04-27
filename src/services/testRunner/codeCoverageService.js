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
exports.CodeCoverageService = void 0;
var vscode = require("vscode");
var CoverageToolService_1 = require("./services/CoverageToolService");
var CommandExecutorService_1 = require("./services/CommandExecutorService");
var CoverageReportService_1 = require("./services/CoverageReportService");
var CoverageParserService_1 = require("./services/CoverageParserService");
var CoverageThresholdService_1 = require("./services/CoverageThresholdService");
/**
 * Service for analyzing code coverage
 */
var CodeCoverageService = /** @class */ (function () {
    function CodeCoverageService() {
        this.toolService = new CoverageToolService_1.CoverageToolService();
        this.executor = new CommandExecutorService_1.CommandExecutorService();
        this.reportService = new CoverageReportService_1.CoverageReportService();
        this.parser = new CoverageParserService_1.CoverageParserService();
        this.thresholdService = new CoverageThresholdService_1.CoverageThresholdService();
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Code Coverage');
    }
    /**
     * Run code coverage analysis
     */
    CodeCoverageService.prototype.runCoverageAnalysis = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath, tool, command, result, reportPath, coverageData, passes;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        workspacePath = options.path || ((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath);
                        if (!workspacePath) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'No workspace folder found'
                                }];
                        }
                        this.outputChannel.appendLine("Running code coverage analysis on ".concat(workspacePath));
                        this.outputChannel.show();
                        return [4 /*yield*/, this.toolService.detectTool(options, workspacePath)];
                    case 1:
                        tool = _b.sent();
                        if (!tool) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'No code coverage tool detected'
                                }];
                        }
                        command = options.command || this.toolService.buildCommand(tool, options);
                        this.outputChannel.appendLine("Running command: ".concat(command));
                        return [4 /*yield*/, this.executor.execute(command, workspacePath, this.outputChannel)];
                    case 2:
                        result = _b.sent();
                        reportPath = options.reportPath || this.reportService.findReport(workspacePath, tool, options.reportFormat);
                        if (!reportPath) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.parser.parse(reportPath, tool, options.reportFormat)];
                    case 3:
                        coverageData = _b.sent();
                        if (coverageData) {
                            result.codeCoverage = coverageData;
                            passes = this.thresholdService.check(coverageData, options.threshold);
                            result.success = result.success && passes.success;
                            result.message = passes.message;
                        }
                        _b.label = 4;
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Clean up resources
     */
    CodeCoverageService.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return CodeCoverageService;
}());
exports.CodeCoverageService = CodeCoverageService;
