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
exports.SidebarPanel = void 0;
const vscode = __importStar(require("vscode"));
class SidebarPanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        if (SidebarPanel.currentPanel) {
            SidebarPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(SidebarPanel.viewType, 'Local LLM Agent', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'media'),
                vscode.Uri.joinPath(extensionUri, 'out/compiled'),
            ],
            retainContextWhenHidden: true,
        });
        SidebarPanel.currentPanel = new SidebarPanel(panel, extensionUri);
    }
    static revive(panel, extensionUri) {
        SidebarPanel.currentPanel = new SidebarPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'sendPrompt':
                    // Handle sending prompt to LLM
                    this._handleSendPrompt(message.text);
                    return;
                case 'clearChat':
                    // Handle clearing the chat
                    this._handleClearChat();
                    return;
            }
        }, null, this._disposables);
    }
    _handleSendPrompt(prompt) {
        // TODO: Implement LLM communication logic
        vscode.window.showInformationMessage(`Prompt sent: ${prompt}`);
        // Mock response for now
        const response = `I received your message: "${prompt}"\n\nThis is a placeholder response from the Local LLM Agent. The actual LLM integration will be implemented in a future update.`;
        this._panel.webview.postMessage({
            type: 'response',
            text: response
        });
    }
    _handleClearChat() {
        this._panel.webview.postMessage({ type: 'clearChat' });
    }
    dispose() {
        SidebarPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.title = "Local LLM Agent";
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _getHtmlForWebview(webview) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
        const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css');
        // And the uri we use to load these scripts in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        const styleUri = webview.asWebviewUri(stylePathOnDisk);
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${styleUri}" rel="stylesheet">
      <title>Local LLM Agent</title>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Local LLM Agent</h1>
          <div class="connection-status">
            <span class="status-indicator disconnected"></span>
            <span class="status-text">Disconnected</span>
          </div>
        </div>
        
        <div class="chat-container">
          <div id="chat-messages" class="chat-messages">
            <div class="message system">
              <div class="message-content">
                <p>Welcome to the Local LLM Agent. How can I assist you with your code today?</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="input-container">
          <textarea id="prompt-input" placeholder="Type your message here..." rows="3"></textarea>
          <div class="button-container">
            <button id="clear-button">Clear</button>
            <button id="send-button">Send</button>
          </div>
        </div>
      </div>
      
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
    }
}
exports.SidebarPanel = SidebarPanel;
SidebarPanel.viewType = 'localLLMAgent.sidebarPanel';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=sidebarPanel.js.map