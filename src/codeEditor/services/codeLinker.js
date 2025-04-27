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
exports.CodeLinkerService = void 0;
var vscode = require("vscode");
var CodeLinkerService = /** @class */ (function () {
    function CodeLinkerService() {
    }
    /**
     * Create links between related code elements
     */
    CodeLinkerService.prototype.createCodeLink = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, selection, targetFiles, targetUri, targetDoc, statusBarItem, decorationType, link, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        selection = this.getSelectionOrWordAtCursor(editor);
                        if (!selection) {
                            vscode.window.showErrorMessage('No text selected or cursor not on a word');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.showOpenDialog({
                                canSelectMany: false,
                                openLabel: 'Select target file for link'
                            })];
                    case 1:
                        targetFiles = _a.sent();
                        if (!targetFiles || !targetFiles[0]) {
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        targetUri = targetFiles[0];
                        if (!targetUri) {
                            throw new Error('No target file selected');
                        }
                        return [4 /*yield*/, vscode.workspace.openTextDocument(targetUri)];
                    case 3:
                        targetDoc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(targetDoc)];
                    case 4:
                        _a.sent();
                        vscode.window.showInformationMessage('Now click on the target position for the link');
                        statusBarItem = this.createStatusBarItem();
                        decorationType = this.createHighlightDecoration();
                        editor.setDecorations(decorationType, [selection.selection]);
                        link = {
                            source: {
                                uri: editor.document.uri.toString(),
                                position: {
                                    line: selection.selection.start.line,
                                    character: selection.selection.start.character
                                },
                                text: selection.text
                            },
                            target: {
                                uri: targetUri.toString()
                            }
                        };
                        return [4 /*yield*/, this.saveCodeLink(link)];
                    case 5:
                        _a.sent();
                        vscode.window.showInformationMessage('Code link created successfully');
                        statusBarItem.dispose();
                        editor.setDecorations(decorationType, []);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to create code link: ".concat(error_1));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Navigate to linked code
     */
    CodeLinkerService.prototype.navigateCodeLink = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, position, link, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        position = editor.selection.active;
                        return [4 /*yield*/, this.findLinkAtPosition(editor.document.uri.toString(), position)];
                    case 1:
                        link = _a.sent();
                        if (!link) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.navigateToTarget(link, editor)];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage('Navigated to linked code');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Failed to navigate to linked code: ".concat(error_2));
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        vscode.window.showInformationMessage('No code link found at current position');
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CodeLinkerService.prototype.getSelectionOrWordAtCursor = function (editor) {
        var selection = editor.selection;
        var selectedText = '';
        if (selection.isEmpty) {
            var range = editor.document.getWordRangeAtPosition(selection.active);
            if (range) {
                selectedText = editor.document.getText(range);
                selection = new vscode.Selection(range.start, range.end);
            }
        }
        else {
            selectedText = editor.document.getText(selection);
        }
        return selectedText ? { selection: selection, text: selectedText } : null;
    };
    CodeLinkerService.prototype.findLinkAtPosition = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var config, codeLinks;
            return __generator(this, function (_a) {
                config = vscode.workspace.getConfiguration('copilot-ppa');
                codeLinks = config.get('codeLinks');
                if (!codeLinks) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, Object.values(codeLinks).find(function (link) {
                        if (link.source.uri === uri) {
                            var sourceLine = link.source.position.line;
                            var sourceChar = link.source.position.character;
                            return (position.line === sourceLine &&
                                position.character >= sourceChar &&
                                position.character <= sourceChar + link.source.text.length);
                        }
                        return false;
                    }) || null];
            });
        });
    };
    CodeLinkerService.prototype.navigateToTarget = function (link, editor) {
        return __awaiter(this, void 0, void 0, function () {
            var targetUri, targetDoc, targetPosition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        targetUri = vscode.Uri.parse(link.target.uri);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(targetUri)];
                    case 1:
                        targetDoc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(targetDoc)];
                    case 2:
                        _a.sent();
                        if (link.target.position) {
                            targetPosition = new vscode.Position(link.target.position.line, link.target.position.character);
                            editor.selection = new vscode.Selection(targetPosition, targetPosition);
                            editor.revealRange(new vscode.Range(targetPosition, targetPosition), vscode.TextEditorRevealType.InCenter);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeLinkerService.prototype.createStatusBarItem = function () {
        var item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        item.text = "$(link) Click on target position for code link...";
        item.show();
        return item;
    };
    CodeLinkerService.prototype.createHighlightDecoration = function () {
        return vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
            borderRadius: '3px'
        });
    };
    CodeLinkerService.prototype.saveCodeLink = function (link) {
        return __awaiter(this, void 0, void 0, function () {
            var linkKey;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        linkKey = "codeLink:".concat(link.source.uri, ":").concat(link.source.position.line, ":").concat(link.source.position.character);
                        return [4 /*yield*/, vscode.workspace.getConfiguration().update('copilot-ppa.codeLinks', (_a = {}, _a[linkKey] = link, _a), vscode.ConfigurationTarget.Workspace)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return CodeLinkerService;
}());
exports.CodeLinkerService = CodeLinkerService;
