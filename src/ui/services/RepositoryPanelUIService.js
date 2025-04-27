"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryPanelUIService = void 0;
var vscode = require("vscode");
var RepositoryPanelUIService = /** @class */ (function () {
    function RepositoryPanelUIService(panel) {
        this.panel = panel;
        this._disposables = [];
    }
    RepositoryPanelUIService.prototype.update = function (extensionUri) {
        var webview = this.panel.webview;
        webview.html = this.getWebviewContent(extensionUri);
    };
    RepositoryPanelUIService.prototype.getWebviewContent = function (extensionUri) {
        var scriptPath = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'repository-panel.js'));
        var stylePath = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'repository-panel.css'));
        var codiconsUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        var nonce = this.generateNonce();
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src ".concat(this.panel.webview.cspSource, " 'unsafe-inline'; script-src 'nonce-").concat(nonce, "'; img-src ").concat(this.panel.webview.cspSource, " https:;\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <link href=\"").concat(stylePath, "\" rel=\"stylesheet\">\n            <link href=\"").concat(codiconsUri, "\" rel=\"stylesheet\">\n            <title>Repository Management</title>\n        </head>\n        <body>\n            <div class=\"container\">\n                <div class=\"repository-controls\">\n                    <h2>Repository Management</h2>\n                    <div class=\"control-group\">\n                        <label for=\"provider\">Provider:</label>\n                        <select id=\"provider\">\n                            <option value=\"github\">GitHub</option>\n                            <option value=\"gitlab\">GitLab</option>\n                            <option value=\"bitbucket\">Bitbucket</option>\n                        </select>\n                    </div>\n                    <div class=\"control-group\">\n                        <label for=\"name\">Repository Name:</label>\n                        <input type=\"text\" id=\"name\" placeholder=\"my-repo\">\n                    </div>\n                    <div class=\"control-group\">\n                        <label for=\"description\">Description:</label>\n                        <textarea id=\"description\" placeholder=\"Repository description\"></textarea>\n                    </div>\n                    <div class=\"control-group\">\n                        <label>\n                            <input type=\"checkbox\" id=\"private\">\n                            Private Repository\n                        </label>\n                    </div>\n                    <div class=\"control-group\">\n                        <button id=\"createRepo\">Create Repository</button>\n                    </div>\n                    <div class=\"control-group\">\n                        <button id=\"toggleAccess\">\n                            <span class=\"codicon codicon-shield\"></span>\n                            Toggle Repository Access\n                        </button>\n                    </div>\n                </div>\n                <div id=\"status\" class=\"status-message\"></div>\n            </div>\n            <script nonce=\"").concat(nonce, "\" src=\"").concat(scriptPath, "\"></script>\n        </body>\n        </html>");
    };
    RepositoryPanelUIService.prototype.generateNonce = function () {
        var arr = new Uint8Array(16);
        for (var i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return Array.from(arr)
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
    };
    RepositoryPanelUIService.prototype.dispose = function () {
        this._disposables.forEach(function (d) { return d.dispose(); });
    };
    return RepositoryPanelUIService;
}());
exports.RepositoryPanelUIService = RepositoryPanelUIService;
