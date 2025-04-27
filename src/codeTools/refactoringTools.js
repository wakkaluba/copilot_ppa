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
exports.RefactoringTools = void 0;
var vscode = require("vscode");
var CodeSimplificationService_1 = require("./services/CodeSimplificationService");
var UnusedCodeAnalyzerService_1 = require("./services/UnusedCodeAnalyzerService");
var CodeDiffService_1 = require("./services/CodeDiffService");
var RefactoringOutputService_1 = require("./services/RefactoringOutputService");
var LLMRefactoringService_1 = require("./services/LLMRefactoringService");
/**
 * Provides tools for code refactoring
 */
var RefactoringTools = /** @class */ (function () {
    function RefactoringTools() {
        this.outputService = new RefactoringOutputService_1.RefactoringOutputService();
        this.llmService = new LLMRefactoringService_1.LLMRefactoringService();
        this.simplificationService = new CodeSimplificationService_1.CodeSimplificationService(this.llmService);
        this.unusedCodeAnalyzer = new UnusedCodeAnalyzerService_1.UnusedCodeAnalyzerService(this.llmService);
        this.diffService = new CodeDiffService_1.CodeDiffService();
    }
    /**
     * Initialize the refactoring tools
     */
    RefactoringTools.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.simplificationService.initialize(),
                            this.unusedCodeAnalyzer.initialize(),
                            this.llmService.initialize()
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simplify code in the current editor
     */
    RefactoringTools.prototype.simplifyCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, _a, text, selection, simplifiedCode, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        this.outputService.startOperation('Analyzing code for simplification...');
                        return [4 /*yield*/, this.simplificationService.getEditorContent(editor)];
                    case 2:
                        _a = _b.sent(), text = _a.text, selection = _a.selection;
                        return [4 /*yield*/, this.simplificationService.simplifyCode(text, editor.document.languageId)];
                    case 3:
                        simplifiedCode = _b.sent();
                        return [4 /*yield*/, this.showAndApplyChanges(editor.document.uri, text, simplifiedCode, selection.isEmpty ? "Entire File" : "Selected Code", 'Apply the simplified code?')];
                    case 4:
                        _b.sent();
                        this.outputService.logSuccess('Code successfully simplified');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        this.outputService.logError('Error simplifying code:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove unused code (dead code) in the current editor
     */
    RefactoringTools.prototype.removeUnusedCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, cleanedCode, error_2;
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
                        _a.trys.push([1, 4, , 5]);
                        this.outputService.startOperation('Analyzing code to detect unused elements...');
                        return [4 /*yield*/, this.unusedCodeAnalyzer.removeUnusedCode(editor.document.getText(), editor.document.languageId)];
                    case 2:
                        cleanedCode = _a.sent();
                        return [4 /*yield*/, this.showAndApplyChanges(editor.document.uri, editor.document.getText(), cleanedCode, "Entire File (Unused Code Removed)", 'Apply the code with unused elements removed?')];
                    case 3:
                        _a.sent();
                        this.outputService.logSuccess('Unused code successfully removed');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.outputService.logError('Error removing unused code:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RefactoringTools.prototype.showAndApplyChanges = function (uri, originalCode, newCode, title, prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var shouldReplace, document_1, editor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.diffService.showDiff(uri, originalCode, newCode, title)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, vscode.window.showInformationMessage(prompt, 'Replace', 'Cancel')];
                    case 2:
                        shouldReplace = _a.sent();
                        if (!(shouldReplace === 'Replace')) return [3 /*break*/, 6];
                        return [4 /*yield*/, vscode.workspace.openTextDocument(uri)];
                    case 3:
                        document_1 = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                    case 4:
                        editor = _a.sent();
                        return [4 /*yield*/, editor.edit(function (editBuilder) {
                                var range = new vscode.Range(0, 0, document_1.lineCount, 0);
                                editBuilder.replace(range, newCode);
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dispose resources
     */
    RefactoringTools.prototype.dispose = function () {
        this.outputService.dispose();
        this.diffService.dispose();
    };
    return RefactoringTools;
}());
exports.RefactoringTools = RefactoringTools;
