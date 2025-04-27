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
exports.CodeExampleViewProvider = void 0;
var vscode = require("vscode");
var CodeExampleWebviewService_1 = require("../services/codeExamples/CodeExampleWebviewService");
var CodeAnalysisService_1 = require("../services/codeExamples/CodeAnalysisService");
var WebviewHtmlService_1 = require("../services/webview/WebviewHtmlService");
var CodeExampleViewProvider = /** @class */ (function () {
    function CodeExampleViewProvider(_extensionUri, codeExampleService) {
        this._extensionUri = _extensionUri;
        this.codeExampleService = codeExampleService;
        this.webviewService = new CodeExampleWebviewService_1.CodeExampleWebviewService();
        this.analysisService = new CodeAnalysisService_1.CodeAnalysisService();
        this.htmlService = new WebviewHtmlService_1.WebviewHtmlService(_extensionUri);
    }
    CodeExampleViewProvider.prototype.resolveWebviewView = function (webviewView, context, _token) {
        this._view = webviewView;
        this.webviewService.initialize(webviewView, this._extensionUri);
        this.setupWebview();
    };
    CodeExampleViewProvider.prototype.setupWebview = function () {
        if (!this._view) {
            return;
        }
        this._view.webview.html = this.htmlService.generateCodeExampleHtml(this._view.webview);
        this._view.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this));
    };
    CodeExampleViewProvider.prototype.handleWebviewMessage = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = data.type;
                        switch (_a) {
                            case 'search': return [3 /*break*/, 1];
                            case 'insert': return [3 /*break*/, 3];
                            case 'copy': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 1: return [4 /*yield*/, this.searchCodeExamples(data.query, data.language)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        this.webviewService.insertCode(data.code);
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.webviewService.copyToClipboard(data.code)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CodeExampleViewProvider.prototype.searchCodeExamples = function (query, language) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, searchLanguage, keywords, examples, filteredExamples, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._view) {
                            return [2 /*return*/];
                        }
                        this.webviewService.setLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        editor = vscode.window.activeTextEditor;
                        searchLanguage = language || (editor === null || editor === void 0 ? void 0 : editor.document.languageId);
                        keywords = this.analysisService.extractKeywords(editor);
                        return [4 /*yield*/, this.codeExampleService.searchExamples(query, {
                                language: searchLanguage,
                                maxResults: 10
                            })];
                    case 2:
                        examples = _a.sent();
                        filteredExamples = this.codeExampleService.filterExamplesByRelevance(examples, { language: searchLanguage || '', keywords: keywords });
                        this.webviewService.updateSearchResults(filteredExamples, query, searchLanguage);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        this.webviewService.showError(error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        this.webviewService.setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CodeExampleViewProvider.viewType = 'codeExamples.view';
    return CodeExampleViewProvider;
}());
exports.CodeExampleViewProvider = CodeExampleViewProvider;
