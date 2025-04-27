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
exports.PrettierMock = exports.ESLintMock = void 0;
/**
 * Mock ESLint and Prettier implementations for static analysis
 * This allows for dependency resolution without needing the actual packages
 */
var fs = require("fs");
/**
 * Mock ESLint implementation
 */
var ESLintMock = /** @class */ (function () {
    function ESLintMock() {
    }
    /**
     * Mock lint files implementation
     * @param files Files to lint
     * @returns Array of lint results
     */
    ESLintMock.prototype.lintFiles = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var fileList, results, _i, fileList_1, file, content, lines, messages, i, line, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileList = Array.isArray(files) ? files : [files];
                        results = [];
                        _i = 0, fileList_1 = fileList;
                        _a.label = 1;
                    case 1:
                        if (!(_i < fileList_1.length)) return [3 /*break*/, 6];
                        file = fileList_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fs.promises.readFile(file, 'utf8')];
                    case 3:
                        content = _a.sent();
                        lines = content.split('\n');
                        messages = [];
                        // Simple linting checks
                        for (i = 0; i < lines.length; i++) {
                            line = lines[i];
                            // Check for common issues
                            // 1. Check for console.log statements
                            if (line.includes('console.log')) {
                                messages.push({
                                    line: i + 1,
                                    column: line.indexOf('console.log') + 1,
                                    message: 'Unexpected console.log statement',
                                    ruleId: 'no-console',
                                    severity: 1
                                });
                            }
                            // 2. Check for TODO comments
                            if (line.includes('TODO')) {
                                messages.push({
                                    line: i + 1,
                                    column: line.indexOf('TODO') + 1,
                                    message: 'TODO comment found',
                                    ruleId: 'no-todo',
                                    severity: 0
                                });
                            }
                            // 3. Check for very long lines
                            if (line.length > 100) {
                                messages.push({
                                    line: i + 1,
                                    column: 101,
                                    message: 'Line exceeds maximum line length of 100',
                                    ruleId: 'max-len',
                                    severity: 1
                                });
                            }
                        }
                        results.push({
                            filePath: file,
                            messages: messages
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        results.push({
                            filePath: file,
                            messages: [{
                                    line: 1,
                                    column: 1,
                                    message: "Error reading file: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)),
                                    ruleId: 'file-error',
                                    severity: 2
                                }]
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    return ESLintMock;
}());
exports.ESLintMock = ESLintMock;
/**
 * Mock Prettier implementation
 */
exports.PrettierMock = {
    /**
     * Mock resolveConfig implementation
     * @param file File path
     * @returns File content
     */
    resolveConfig: function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.promises.readFile(file, 'utf8')];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, ''];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Mock check implementation - simple formatting checks
     * @param content File content
     * @param options Options including filepath
     * @returns Whether the file is formatted correctly
     */
    check: function (content, options) {
        return __awaiter(this, void 0, void 0, function () {
            var lines, _i, lines_1, line;
            return __generator(this, function (_a) {
                // Simple formatting check - just check a few rules
                if (!content) {
                    return [2 /*return*/, true];
                }
                lines = content.split('\n');
                for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                    line = lines_1[_i];
                    // Check for missing semicolons in JS/TS files
                    if ((options.filepath.endsWith('.js') || options.filepath.endsWith('.ts')) &&
                        !line.trim().endsWith('{') &&
                        !line.trim().endsWith('}') &&
                        !line.trim().endsWith(';') &&
                        !line.trim().startsWith('//') &&
                        !line.trim().startsWith('import') &&
                        !line.trim().startsWith('export') &&
                        line.trim().length > 0) {
                        return [2 /*return*/, false];
                    }
                    // Check for inconsistent indentation
                    if (line.startsWith(' ') && !line.startsWith('  ')) {
                        return [2 /*return*/, false];
                    }
                    // Check for trailing whitespace
                    if (line.endsWith(' ') || line.endsWith('\t')) {
                        return [2 /*return*/, false];
                    }
                }
                return [2 /*return*/, true];
            });
        });
    }
};
