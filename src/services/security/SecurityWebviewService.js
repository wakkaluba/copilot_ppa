"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityWebviewService = void 0;
var vscode = require("vscode");
var logger_1 = require("../../utils/logger");
var SecurityWebviewService = /** @class */ (function () {
    function SecurityWebviewService() {
        this.logger = logger_1.Logger.getInstance();
    }
    SecurityWebviewService.prototype.generateWebviewContent = function (webview, result) {
        try {
            var scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(__dirname), '..', '..', '..', 'media', 'security-panel.js'));
            var styleUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(__dirname), '..', '..', '..', 'media', 'security-panel.css'));
            return "<!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Security Analysis</title>\n                <link rel=\"stylesheet\" href=\"".concat(styleUri, "\">\n            </head>\n            <body>\n                <div class=\"container\">\n                    <div class=\"header\">\n                        <h1>Security Analysis</h1>\n                        <div class=\"actions\">\n                            <button id=\"refresh\" class=\"action-button\">Refresh</button>\n                        </div>\n                    </div>\n                    <div id=\"summary\" class=\"section\">\n                        <h2>Summary</h2>\n                        <div id=\"summary-content\"></div>\n                    </div>\n                    <div id=\"issues\" class=\"section\">\n                        <h2>Security Issues</h2>\n                        <div id=\"issues-content\"></div>\n                    </div>\n                    <div id=\"recommendations\" class=\"section\">\n                        <h2>Recommendations</h2>\n                        <div id=\"recommendations-content\"></div>\n                    </div>\n                </div>\n                <script>\n                    const vscode = acquireVsCodeApi();\n                    const initialState = ").concat(JSON.stringify(result || {}), ";\n                </script>\n                <script src=\"").concat(scriptUri, "\"></script>\n            </body>\n            </html>");
        }
        catch (error) {
            this.logger.error('Error generating security webview content', error);
            throw error;
        }
    };
    return SecurityWebviewService;
}());
exports.SecurityWebviewService = SecurityWebviewService;
