"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExampleViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const CodeExampleWebviewService_1 = require("../services/codeExamples/CodeExampleWebviewService");
const CodeAnalysisService_1 = require("../services/codeExamples/CodeAnalysisService");
const WebviewHtmlService_1 = require("../services/webview/WebviewHtmlService");
class CodeExampleViewProvider {
    _extensionUri;
    codeExampleService;
    static viewType = 'codeExamples.view';
    _view;
    webviewService;
    analysisService;
    htmlService;
    constructor(_extensionUri, codeExampleService) {
        this._extensionUri = _extensionUri;
        this.codeExampleService = codeExampleService;
        this.webviewService = new CodeExampleWebviewService_1.CodeExampleWebviewService();
        this.analysisService = new CodeAnalysisService_1.CodeAnalysisService();
        this.htmlService = new WebviewHtmlService_1.WebviewHtmlService(_extensionUri);
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        this.webviewService.initialize(webviewView, this._extensionUri);
        this.setupWebview();
    }
    setupWebview() {
        if (!this._view) {
            return;
        }
        this._view.webview.html = this.htmlService.generateCodeExampleHtml(this._view.webview);
        this._view.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this));
    }
    async handleWebviewMessage(data) {
        switch (data.type) {
            case 'search':
                await this.searchCodeExamples(data.query, data.language);
                break;
            case 'insert':
                this.webviewService.insertCode(data.code);
                break;
            case 'copy':
                await this.webviewService.copyToClipboard(data.code);
                break;
        }
    }
    async searchCodeExamples(query, language) {
        if (!this._view) {
            return;
        }
        this.webviewService.setLoading(true);
        try {
            const editor = vscode.window.activeTextEditor;
            const searchLanguage = language || editor?.document.languageId;
            const keywords = this.analysisService.extractKeywords(editor);
            const examples = await this.codeExampleService.searchExamples(query, {
                language: searchLanguage,
                maxResults: 10
            });
            const filteredExamples = this.codeExampleService.filterExamplesByRelevance(examples, { language: searchLanguage || '', keywords });
            this.webviewService.updateSearchResults(filteredExamples, query, searchLanguage);
        }
        catch (error) {
            this.webviewService.showError(error);
        }
        finally {
            this.webviewService.setLoading(false);
        }
    }
}
exports.CodeExampleViewProvider = CodeExampleViewProvider;
//# sourceMappingURL=codeExampleView.js.map