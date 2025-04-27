"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryWebviewService = void 0;
var vscode = require("vscode");
var themeManager_1 = require("../../services/ui/themeManager");
var RepositoryWebviewService = /** @class */ (function () {
    function RepositoryWebviewService(themeService) {
        this.themeService = themeService;
    }
    RepositoryWebviewService.prototype.generateWebviewContent = function (webview) {
        var styleUri = webview.asWebviewUri(vscode.Uri.joinPath(themeManager_1.ThemeService.extensionUri, 'media', 'repository-panel.css'));
        return "\n            <!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Repository Panel</title>\n                <link rel=\"stylesheet\" href=\"".concat(styleUri, "\">\n            </head>\n            <body>\n                <div class=\"container\">\n                    <div class=\"repository-status\"></div>\n                    <div class=\"repository-info\"></div>\n                    <div class=\"repository-actions\"></div>\n                </div>\n                <script>\n                    const vscode = acquireVsCodeApi();\n                </script>\n            </body>\n            </html>\n        ");
    };
    return RepositoryWebviewService;
}());
exports.RepositoryWebviewService = RepositoryWebviewService;
