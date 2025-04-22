"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeReviewWebviewProvider = void 0;
const CodeReviewService_1 = require("./services/CodeReviewService");
/**
 * Webview provider for the code review UI
 */
class CodeReviewWebviewProvider {
    _extensionUri;
    _context;
    static viewType = 'codeReviewPanel';
    _view;
    service;
    constructor(_extensionUri, _context) {
        this._extensionUri = _extensionUri;
        this._context = _context;
        this.service = new CodeReviewService_1.CodeReviewService(_context);
    }
    /**
     * Resolves the webview view
     */
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this.service.getWebviewHtml(webviewView.webview, this._extensionUri);
        // Set up message handling
        this._setWebviewMessageListener(webviewView.webview);
    }
    /**
     * Sets up webview message listener
     */
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage(async (message) => {
            const response = await this.service.handleWebviewMessage(message);
            if (response) {
                this._view?.webview.postMessage(response);
            }
        });
    }
}
exports.CodeReviewWebviewProvider = CodeReviewWebviewProvider;
//# sourceMappingURL=codeReviewWebviewProvider.js.map