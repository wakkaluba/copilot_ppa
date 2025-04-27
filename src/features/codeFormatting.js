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
exports.CodeFormattingManager = void 0;
var vscode = require("vscode");
/**
 * Manages code formatting and optimization functionality
 */
var CodeFormattingManager = /** @class */ (function () {
    function CodeFormattingManager(context) {
        this.context = context;
        this.registerCommands();
    }
    /**
     * Register all formatting and optimization related commands
     */
    CodeFormattingManager.prototype.registerCommands = function () {
        var _this = this;
        // Format current document using the VS Code formatting API
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.formatCurrentDocument', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.formatDocument()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }));
        // Format selection only
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.formatSelection', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.formatSelection()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }));
        // Optimize imports in current document
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.organizeImports', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.organizeImports()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }));
        // Optimize code using LLM (remove unused code, simplify logic)
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.optimizeCode', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.optimizeCodeWithLLM()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }));
    };
    /**
     * Format the entire active document
     */
    CodeFormattingManager.prototype.formatDocument = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, vscode.commands.executeCommand('editor.action.formatDocument')];
                    case 2:
                        _a.sent();
                        vscode.window.showInformationMessage('Document formatted successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Error formatting document: ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Format only the selected text
     */
    CodeFormattingManager.prototype.formatSelection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor || editor.selection.isEmpty) {
                            vscode.window.showWarningMessage('No text selected');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, vscode.commands.executeCommand('editor.action.formatSelection')];
                    case 2:
                        _a.sent();
                        vscode.window.showInformationMessage('Selection formatted successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Error formatting selection: ".concat(error_2));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Organize imports in the current document
     */
    CodeFormattingManager.prototype.organizeImports = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, vscode.commands.executeCommand('editor.action.organizeImports')];
                    case 2:
                        _a.sent();
                        vscode.window.showInformationMessage('Imports organized successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Error organizing imports: ".concat(error_3));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Use the connected LLM to optimize code
     */
    CodeFormattingManager.prototype.optimizeCodeWithLLM = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, selection, text, language;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        selection = !editor.selection.isEmpty
                            ? editor.selection
                            : new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length));
                        text = editor.document.getText(selection);
                        language = editor.document.languageId;
                        // Show a progress notification
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: 'Optimizing code with LLM...',
                                cancellable: true
                            }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var optimizedCode_1, error_4;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 4]);
                                            return [4 /*yield*/, this.callLLMForCodeOptimization(text, language)];
                                        case 1:
                                            optimizedCode_1 = _a.sent();
                                            if (token.isCancellationRequested) {
                                                return [2 /*return*/];
                                            }
                                            // Apply the optimized code
                                            return [4 /*yield*/, editor.edit(function (editBuilder) {
                                                    editBuilder.replace(selection, optimizedCode_1);
                                                })];
                                        case 2:
                                            // Apply the optimized code
                                            _a.sent();
                                            vscode.window.showInformationMessage('Code optimized successfully');
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_4 = _a.sent();
                                            vscode.window.showErrorMessage("Error optimizing code: ".concat(error_4));
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        // Show a progress notification
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Call the LLM service to optimize code
     * This is a placeholder for the actual LLM integration
     */
    CodeFormattingManager.prototype.callLLMForCodeOptimization = function (code, language) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Here you would integrate with your LLM service
                    // This is just a placeholder that returns the original code
                    // Mock delay to simulate processing
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        // Here you would integrate with your LLM service
                        // This is just a placeholder that returns the original code
                        // Mock delay to simulate processing
                        _a.sent();
                        // In a real implementation, you would:
                        // 1. Get the LLM provider from your service
                        // 2. Create a prompt asking to optimize the code
                        // 3. Send the request and return the response
                        return [2 /*return*/, code]; // Just return the original code for now
                }
            });
        });
    };
    return CodeFormattingManager;
}());
exports.CodeFormattingManager = CodeFormattingManager;
