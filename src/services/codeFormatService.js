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
exports.CodeFormatService = void 0;
var vscode = require("vscode");
var path = require("path");
/**
 * Service for handling code formatting and style improvements
 */
var CodeFormatService = /** @class */ (function () {
    function CodeFormatService() {
    }
    /**
     * Format the active document or selected text
     * @returns {Promise<boolean>} True if formatting succeeded, false otherwise
     */
    CodeFormatService.prototype.formatCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!!editor.selection.isEmpty) return [3 /*break*/, 3];
                        return [4 /*yield*/, vscode.commands.executeCommand('editor.action.formatSelection')];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [4 /*yield*/, vscode.commands.executeCommand('editor.action.formatDocument')];
                    case 4:
                    // Otherwise format the entire document
                    return [2 /*return*/, _a.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Error formatting code:', error_1);
                        vscode.window.showErrorMessage("Failed to format code: ".concat(error_1));
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Optimize imports by organizing and removing unused ones
     * @returns {Promise<boolean>} True if optimization succeeded, false otherwise
     */
    CodeFormatService.prototype.optimizeImports = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, document_1, fileExtension, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/, false];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        document_1 = editor.document;
                        fileExtension = path.extname(document_1.fileName);
                        _a = fileExtension;
                        switch (_a) {
                            case '.ts': return [3 /*break*/, 2];
                            case '.tsx': return [3 /*break*/, 2];
                            case '.js': return [3 /*break*/, 2];
                            case '.jsx': return [3 /*break*/, 2];
                            case '.py': return [3 /*break*/, 4];
                            case '.java': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, vscode.commands.executeCommand('typescript.organizeImports')];
                    case 3:
                    // For TypeScript/JavaScript files
                    return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, vscode.commands.executeCommand('python.sortImports')];
                    case 5:
                    // For Python files, if isort or other extension is available
                    return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, vscode.commands.executeCommand('java.action.organizeImports')];
                    case 7:
                    // For Java files, if Java extension is available
                    return [2 /*return*/, _b.sent()];
                    case 8:
                        vscode.window.showInformationMessage("Import optimization not supported for ".concat(fileExtension, " files"));
                        return [2 /*return*/, false];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_2 = _b.sent();
                        console.error('Error optimizing imports:', error_2);
                        vscode.window.showErrorMessage("Failed to optimize imports: ".concat(error_2));
                        return [2 /*return*/, false];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply code style rules to fix common issues
     * @returns {Promise<boolean>} True if style fixes succeeded, false otherwise
     */
    CodeFormatService.prototype.applyCodeStyle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, eslintResult, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, vscode.commands.executeCommand('eslint.executeAutofix')];
                    case 2:
                        eslintResult = _a.sent();
                        // Then format the document
                        return [4 /*yield*/, this.formatCode()];
                    case 3:
                        // Then format the document
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_3 = _a.sent();
                        console.error('Error applying code style:', error_3);
                        vscode.window.showErrorMessage("Failed to apply code style: ".concat(error_3));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Comprehensive code optimization including formatting, imports, and style fixes
     * @returns {Promise<boolean>} True if optimization succeeded, false otherwise
     */
    CodeFormatService.prototype.optimizeCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // Apply these steps in sequence
                        return [4 /*yield*/, this.optimizeImports()];
                    case 1:
                        // Apply these steps in sequence
                        _a.sent();
                        return [4 /*yield*/, this.applyCodeStyle()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.formatCode()];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage('Code optimization completed');
                        return [2 /*return*/, true];
                    case 4:
                        error_4 = _a.sent();
                        console.error('Error during code optimization:', error_4);
                        vscode.window.showErrorMessage("Failed to optimize code: ".concat(error_4));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return CodeFormatService;
}());
exports.CodeFormatService = CodeFormatService;
