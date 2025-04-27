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
exports.CodeSimplifier = void 0;
var vscode = require("vscode");
var providerManager_1 = require("../llm/providerManager");
/**
 * Provides functionality for simplifying code using LLM-based analysis
 */
var CodeSimplifier = /** @class */ (function () {
    function CodeSimplifier() {
        this.llmProvider = (0, providerManager_1.getCurrentProvider)();
    }
    /**
     * Simplifies the provided code using LLM analysis
     * @param code The code to simplify
     * @param language The programming language of the code
     * @returns Simplified code or null if simplification failed
     */
    CodeSimplifier.prototype.simplifyCode = function (code, language) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt_1, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.llmProvider) {
                            vscode.window.showErrorMessage('No LLM provider available for code simplification');
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        prompt_1 = this.buildSimplificationPrompt(code, language);
                        return [4 /*yield*/, this.llmProvider.getCompletion(prompt_1)];
                    case 2:
                        response = _a.sent();
                        if (!response) {
                            return [2 /*return*/, null];
                        }
                        // Extract the simplified code from the response
                        return [2 /*return*/, this.extractSimplifiedCode(response)];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error during code simplification:', error_1);
                        vscode.window.showErrorMessage("Failed to simplify code: ".concat(error_1));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simplifies the code in the active editor
     */
    CodeSimplifier.prototype.simplifyActiveEditorCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, document, selection, language, code;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showInformationMessage('No editor is active');
                            return [2 /*return*/];
                        }
                        document = editor.document;
                        selection = editor.selection;
                        language = document.languageId;
                        code = selection.isEmpty
                            ? document.getText()
                            : document.getText(selection);
                        // Show progress indicator
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: 'Simplifying code...',
                                cancellable: true
                            }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var simplifiedCode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            token.onCancellationRequested(function () {
                                                console.log('Code simplification was cancelled');
                                            });
                                            progress.report({ increment: 0 });
                                            return [4 /*yield*/, this.simplifyCode(code, language)];
                                        case 1:
                                            simplifiedCode = _a.sent();
                                            progress.report({ increment: 100 });
                                            if (simplifiedCode) {
                                                // Apply the simplification
                                                editor.edit(function (editBuilder) {
                                                    var range = selection.isEmpty
                                                        ? new vscode.Range(0, 0, document.lineCount, 0)
                                                        : selection;
                                                    editBuilder.replace(range, simplifiedCode);
                                                });
                                                vscode.window.showInformationMessage('Code simplified successfully');
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        // Show progress indicator
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Builds the prompt for code simplification
     */
    CodeSimplifier.prototype.buildSimplificationPrompt = function (code, language) {
        return "\nYou are an expert programmer tasked with simplifying code while maintaining its functionality.\nAnalyze the following ".concat(language, " code and provide a simplified version that:\n- Removes unnecessary complexity\n- Eliminates redundant code\n- Uses more efficient patterns when appropriate\n- Improves readability\n- Maintains the original functionality\n\nORIGINAL CODE:\n```").concat(language, "\n").concat(code, "\n```\n\nSIMPLIFIED CODE:\n");
    };
    /**
     * Extracts the simplified code from the LLM response
     */
    CodeSimplifier.prototype.extractSimplifiedCode = function (response) {
        // Try to extract code between markdown code blocks if present
        var codeBlockRegex = /```(?:\w+)?\s*([\s\S]+?)\s*```/;
        var match = response.match(codeBlockRegex);
        if (match && match[1]) {
            return match[1].trim();
        }
        // If no code blocks found, use the entire response
        return response.trim();
    };
    return CodeSimplifier;
}());
exports.CodeSimplifier = CodeSimplifier;
