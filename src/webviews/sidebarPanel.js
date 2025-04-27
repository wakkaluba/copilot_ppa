"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarPanel = void 0;
var vscode = require("vscode");
var SidebarPanel = /** @class */ (function () {
    function SidebarPanel(panel, extensionUri) {
        var _this = this;
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(function () { return _this.dispose(); }, null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(function (e) {
            if (_this._panel.visible) {
                _this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(function (message) {
            switch (message.command) {
                case 'sendPrompt':
                    // Handle sending prompt to LLM
                    _this._handleSendPrompt(message.text);
                    return;
                case 'clearChat':
                    // Handle clearing the chat
                    _this._handleClearChat();
                    return;
            }
        }, null, this._disposables);
    }
    SidebarPanel.createOrShow = function (extensionUri) {
        var column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        if (SidebarPanel.currentPanel) {
            SidebarPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        var panel = vscode.window.createWebviewPanel(SidebarPanel.viewType, 'Local LLM Agent', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'media'),
                vscode.Uri.joinPath(extensionUri, 'out/compiled'),
            ],
            retainContextWhenHidden: true,
        });
        SidebarPanel.currentPanel = new SidebarPanel(panel, extensionUri);
    };
    SidebarPanel.revive = function (panel, extensionUri) {
        SidebarPanel.currentPanel = new SidebarPanel(panel, extensionUri);
    };
    SidebarPanel.prototype._handleSendPrompt = function (prompt) {
        // TODO: Implement LLM communication logic
        vscode.window.showInformationMessage("Prompt sent: ".concat(prompt));
        // Mock response for now
        var response = "I received your message: \"".concat(prompt, "\"\n\nThis is a placeholder response from the Local LLM Agent. The actual LLM integration will be implemented in a future update.");
        this._panel.webview.postMessage({
            type: 'response',
            text: response
        });
    };
    SidebarPanel.prototype._handleClearChat = function () {
        this._panel.webview.postMessage({ type: 'clearChat' });
    };
    SidebarPanel.prototype.dispose = function () {
        SidebarPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            var x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    };
    SidebarPanel.prototype._update = function () {
        var webview = this._panel.webview;
        this._panel.title = "Local LLM Agent";
        this._panel.webview.html = this._getHtmlForWebview(webview);
    };
    SidebarPanel.prototype._getHtmlForWebview = function (webview) {
        // Local path to main script run in the webview
        var scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
        var stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css');
        // And the uri we use to load these scripts in the webview
        var scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        var styleUri = webview.asWebviewUri(stylePathOnDisk);
        // Use a nonce to only allow specific scripts to be run
        var nonce = getNonce();
        return "<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n      <meta charset=\"UTF-8\">\n      <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src ".concat(webview.cspSource, "; script-src 'nonce-").concat(nonce, "';\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <link href=\"").concat(styleUri, "\" rel=\"stylesheet\">\n      <title>Local LLM Agent</title>\n    </head>\n    <body>\n      <div class=\"container\">\n        <div class=\"header\">\n          <h1>Local LLM Agent</h1>\n          <div class=\"connection-status\">\n            <span class=\"status-indicator disconnected\"></span>\n            <span class=\"status-text\">Disconnected</span>\n          </div>\n        </div>\n        \n        <div class=\"chat-container\">\n          <div id=\"chat-messages\" class=\"chat-messages\">\n            <div class=\"message system\">\n              <div class=\"message-content\">\n                <p>Welcome to the Local LLM Agent. How can I assist you with your code today?</p>\n              </div>\n            </div>\n          </div>\n        </div>\n        \n        <div class=\"input-container\">\n          <textarea id=\"prompt-input\" placeholder=\"Type your message here...\" rows=\"3\"></textarea>\n          <div class=\"button-container\">\n            <button id=\"clear-button\">Clear</button>\n            <button id=\"send-button\">Send</button>\n          </div>\n        </div>\n      </div>\n      \n      <script nonce=\"").concat(nonce, "\" src=\"").concat(scriptUri, "\"></script>\n    </body>\n    </html>");
    };
    SidebarPanel.viewType = 'localLLMAgent.sidebarPanel';
    return SidebarPanel;
}());
exports.SidebarPanel = SidebarPanel;
function getNonce() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
