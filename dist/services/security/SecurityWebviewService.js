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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityWebviewService = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../../utils/logger");
class SecurityWebviewService {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
    }
    generateWebviewContent(webview, result) {
        try {
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(__dirname), '..', '..', '..', 'media', 'security-panel.js'));
            const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(__dirname), '..', '..', '..', 'media', 'security-panel.css'));
            return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Security Analysis</title>
                <link rel="stylesheet" href="${styleUri}">
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Security Analysis</h1>
                        <div class="actions">
                            <button id="refresh" class="action-button">Refresh</button>
                        </div>
                    </div>
                    <div id="summary" class="section">
                        <h2>Summary</h2>
                        <div id="summary-content"></div>
                    </div>
                    <div id="issues" class="section">
                        <h2>Security Issues</h2>
                        <div id="issues-content"></div>
                    </div>
                    <div id="recommendations" class="section">
                        <h2>Recommendations</h2>
                        <div id="recommendations-content"></div>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const initialState = ${JSON.stringify(result || {})};
                </script>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
        }
        catch (error) {
            this.logger.error('Error generating security webview content', error);
            throw error;
        }
    }
}
exports.SecurityWebviewService = SecurityWebviewService;
//# sourceMappingURL=SecurityWebviewService.js.map