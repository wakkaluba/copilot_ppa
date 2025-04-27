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
exports.StaticAnalysisServiceImpl = void 0;
var mockLinters_1 = require("./mockLinters");
var fs = require("fs");
var eslint_1 = require("eslint");
var prettier = require("prettier");
var StaticAnalysisServiceImpl = /** @class */ (function () {
    function StaticAnalysisServiceImpl() {
        this.eslintInstance = new mockLinters_1.ESLintMock();
        this.useRealEslint = false;
        this.useRealPrettier = false;
        this.prettier = mockLinters_1.PrettierMock;
        this.initializeLinters();
    }
    StaticAnalysisServiceImpl.prototype.initializeLinters = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            this.eslintInstance = new eslint_1.ESLint();
                            this.useRealEslint = true;
                            console.log('Using real ESLint');
                        }
                        catch (error) {
                            console.log('ESLint not available, using mock implementation:', error);
                            this.eslintInstance = new mockLinters_1.ESLintMock();
                            this.useRealEslint = false;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Test if Prettier is available
                        return [4 /*yield*/, prettier.resolveConfig('test.js')];
                    case 2:
                        // Test if Prettier is available
                        _a.sent();
                        this.useRealPrettier = true;
                        this.prettier = prettier;
                        console.log('Using real Prettier');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.log('Prettier not available, using mock implementation:', error_1);
                        this.useRealPrettier = false;
                        this.prettier = mockLinters_1.PrettierMock;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StaticAnalysisServiceImpl.prototype.runESLintAnalysis = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var issues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.lintFiles(options.files)];
                    case 1:
                        issues = _a.sent();
                        return [2 /*return*/, {
                                totalTests: issues.length,
                                passed: 0,
                                failed: issues.length,
                                skipped: 0,
                                duration: 0,
                                suites: [{
                                        id: 'eslint',
                                        name: 'ESLint Analysis',
                                        tests: issues.map(function (issue) { return ({
                                            id: "".concat(issue.filePath, ":").concat(issue.line),
                                            name: "".concat(issue.message, " (").concat(issue.filePath, ":").concat(issue.line, ")"),
                                            status: 'failed',
                                            duration: 0,
                                            error: issue.message
                                        }); }),
                                        suites: []
                                    }],
                                timestamp: new Date(),
                                success: issues.length === 0,
                                message: "Found ".concat(issues.length, " ESLint issues").concat(this.useRealEslint ? '' : ' (using mock implementation)'),
                                details: this.formatIssuesDetails(issues)
                            }];
                }
            });
        });
    };
    StaticAnalysisServiceImpl.prototype.runPrettierAnalysis = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var unformattedFiles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkFormatting(options.files)];
                    case 1:
                        unformattedFiles = _a.sent();
                        return [2 /*return*/, {
                                totalTests: options.files.length,
                                passed: options.files.length - unformattedFiles.length,
                                failed: unformattedFiles.length,
                                skipped: 0,
                                duration: 0,
                                suites: [{
                                        id: 'prettier',
                                        name: 'Prettier Analysis',
                                        tests: unformattedFiles.map(function (file) { return ({
                                            id: file,
                                            name: "File not properly formatted: ".concat(file),
                                            status: 'failed',
                                            duration: 0,
                                            error: 'File does not match Prettier formatting rules'
                                        }); }),
                                        suites: []
                                    }],
                                timestamp: new Date(),
                                success: unformattedFiles.length === 0,
                                message: "Found ".concat(unformattedFiles.length, " files with formatting issues").concat(this.useRealPrettier ? '' : ' (using mock implementation)'),
                                details: this.formatPrettierDetails(unformattedFiles)
                            }];
                }
            });
        });
    };
    StaticAnalysisServiceImpl.prototype.lintFiles = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var results, error_2, mockResults, mockResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.useRealEslint) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, Promise.all(files.map(function (file) { return _this.eslintInstance.lintFiles(file); }))];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results.flat().map(function (result) {
                                return result.messages.map(function (msg) { return ({
                                    filePath: result.filePath,
                                    line: msg.line,
                                    column: msg.column,
                                    message: msg.message,
                                    ruleId: msg.ruleId || 'unknown',
                                    severity: msg.severity
                                }); });
                            }).flat()];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error using real ESLint, falling back to mock:', error_2);
                        return [4 /*yield*/, (new mockLinters_1.ESLintMock()).lintFiles(files)];
                    case 4:
                        mockResults = _a.sent();
                        return [2 /*return*/, this.convertMockResults(mockResults)];
                    case 5: return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.eslintInstance.lintFiles(files)];
                    case 7:
                        mockResults = _a.sent();
                        return [2 /*return*/, this.convertMockResults(mockResults)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    StaticAnalysisServiceImpl.prototype.convertMockResults = function (results) {
        return results.flatMap(function (result) {
            return result.messages.map(function (msg) { return ({
                filePath: result.filePath,
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId || 'unknown',
                severity: msg.severity
            }); });
        });
    };
    StaticAnalysisServiceImpl.prototype.checkFormatting = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var unformattedFiles, _i, files_1, file, fileContent, isFormatted, options, formatted, formatError_1, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unformattedFiles = [];
                        _i = 0, files_1 = files;
                        _a.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 15];
                        file = files_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 13, , 14]);
                        return [4 /*yield*/, fs.promises.readFile(file, 'utf8')];
                    case 3:
                        fileContent = _a.sent();
                        isFormatted = false;
                        if (!(this.useRealPrettier && this.prettier.format)) return [3 /*break*/, 9];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, this.prettier.resolveConfig(file)];
                    case 5:
                        options = (_a.sent()) || {};
                        return [4 /*yield*/, this.prettier.format(fileContent, __assign(__assign({}, options), { filepath: file }))];
                    case 6:
                        formatted = _a.sent();
                        isFormatted = fileContent === formatted;
                        return [3 /*break*/, 8];
                    case 7:
                        formatError_1 = _a.sent();
                        console.error("Error formatting ".concat(file, ":"), formatError_1);
                        isFormatted = false;
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 12];
                    case 9:
                        if (!this.prettier.check) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.prettier.check(fileContent, { filepath: file })];
                    case 10:
                        // Use mock or fallback implementation
                        isFormatted = _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        console.error('Neither format nor check method available for Prettier');
                        isFormatted = false;
                        _a.label = 12;
                    case 12:
                        if (!isFormatted) {
                            unformattedFiles.push(file);
                        }
                        return [3 /*break*/, 14];
                    case 13:
                        error_3 = _a.sent();
                        console.error("Error checking formatting for ".concat(file, ":"), error_3);
                        unformattedFiles.push(file);
                        return [3 /*break*/, 14];
                    case 14:
                        _i++;
                        return [3 /*break*/, 1];
                    case 15: return [2 /*return*/, unformattedFiles];
                }
            });
        });
    };
    StaticAnalysisServiceImpl.prototype.formatIssuesDetails = function (issues) {
        return issues.map(function (issue) {
            return "".concat(issue.filePath, ":").concat(issue.line, ":").concat(issue.column, " - ").concat(issue.message, " (").concat(issue.ruleId, ")");
        }).join('\n');
    };
    StaticAnalysisServiceImpl.prototype.formatPrettierDetails = function (files) {
        return files.map(function (file) {
            return "".concat(file, " - File does not match Prettier formatting rules");
        }).join('\n');
    };
    return StaticAnalysisServiceImpl;
}());
exports.StaticAnalysisServiceImpl = StaticAnalysisServiceImpl;
