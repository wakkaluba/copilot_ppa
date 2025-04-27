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
exports.CodeNavigatorService = void 0;
var vscode = require("vscode");
var codeOverviewWebview_1 = require("../webviews/codeOverviewWebview");
var CodeNavigatorService = /** @class */ (function () {
    function CodeNavigatorService() {
        this.webviewProvider = new codeOverviewWebview_1.CodeOverviewWebview();
    }
    /**
     * Shows a code overview/outline for the current file
     */
    CodeNavigatorService.prototype.showCodeOverview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, symbols;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri)];
                    case 1:
                        symbols = _a.sent();
                        if (!symbols || symbols.length === 0) {
                            vscode.window.showInformationMessage('No symbols found in this file');
                            return [2 /*return*/];
                        }
                        this.webviewProvider.show(symbols, editor.document.languageId);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find references to the symbol at the current position
     */
    CodeNavigatorService.prototype.findReferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, position, references, items, selected, doc, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        position = editor.selection.active;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, vscode.commands.executeCommand('vscode.executeReferenceProvider', editor.document.uri, position)];
                    case 2:
                        references = _a.sent();
                        if (!references || references.length === 0) {
                            vscode.window.showInformationMessage('No references found');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(references.map(function (ref) { return __awaiter(_this, void 0, void 0, function () {
                                var doc, lineText;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(ref.uri)];
                                        case 1:
                                            doc = _a.sent();
                                            lineText = doc.lineAt(ref.range.start.line).text.trim();
                                            return [2 /*return*/, {
                                                    label: "$(references) ".concat(lineText),
                                                    description: "".concat(vscode.workspace.asRelativePath(ref.uri), " - Line ").concat(ref.range.start.line + 1),
                                                    reference: ref
                                                }];
                                    }
                                });
                            }); }))];
                    case 3:
                        items = _a.sent();
                        return [4 /*yield*/, vscode.window.showQuickPick(items, {
                                title: "References (".concat(items.length, ")"),
                                placeHolder: 'Select reference to navigate to'
                            })];
                    case 4:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 7];
                        return [4 /*yield*/, vscode.workspace.openTextDocument(selected.reference.uri)];
                    case 5:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc, {
                                selection: selected.reference.range
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Error finding references: ".concat(error_1));
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return CodeNavigatorService;
}());
exports.CodeNavigatorService = CodeNavigatorService;
