"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotWebviewContentService = void 0;
var CopilotWebviewContentService = /** @class */ (function () {
    function CopilotWebviewContentService(themeService) {
        this.themeService = themeService;
    }
    CopilotWebviewContentService.prototype.generateWebviewContent = function (stylesUri, state, isConnected, webview) {
        return "<!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>AI Assistant</title>\n                <link href=\"".concat(stylesUri, "\" rel=\"stylesheet\">\n            </head>\n            <body class=\"").concat(this.themeService.getCurrentTheme(), "\">\n                <div class=\"container\">\n                    <div class=\"status-bar\">\n                        <div class=\"connection-status ").concat(isConnected ? 'connected' : 'disconnected', "\">\n                            <span class=\"status-dot\"></span>\n                            <span class=\"status-text\">").concat(isConnected ? 'Connected' : 'Disconnected', "</span>\n                        </div>\n                        <div class=\"mode-toggle\">\n                            <label class=\"switch\">\n                                <input type=\"checkbox\" id=\"llmModeToggle\" ").concat(state.isLocalLLMActive ? 'checked' : '', ">\n                                <span class=\"slider\"></span>\n                            </label>\n                            <span>Local LLM Mode</span>\n                        </div>\n                    </div>\n                    \n                    <div class=\"messages-container\" id=\"messages\">\n                        ").concat(this.renderMessages(state.messages), "\n                    </div>\n\n                    <div class=\"input-container\">\n                        <textarea id=\"messageInput\" placeholder=\"Type your message...\"></textarea>\n                        <button id=\"sendButton\">Send</button>\n                    </div>\n                </div>\n\n                <script>\n                    ").concat(this.getClientScript(), "\n                </script>\n            </body>\n            </html>");
    };
    CopilotWebviewContentService.prototype.renderMessages = function (messages) {
        var _this = this;
        return messages.map(function (msg) { return "\n            <div class=\"message ".concat(msg.role, "\">\n                <div class=\"message-content\">").concat(_this.escapeHtml(msg.content), "</div>\n            </div>\n        "); }).join('');
    };
    CopilotWebviewContentService.prototype.escapeHtml = function (html) {
        var div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    };
    CopilotWebviewContentService.prototype.getClientScript = function () {
        return "(function() {\n            const vscode = acquireVsCodeApi();\n            const messageInput = document.getElementById('messageInput');\n            const sendButton = document.getElementById('sendButton');\n            const llmModeToggle = document.getElementById('llmModeToggle');\n\n            sendButton.addEventListener('click', () => {\n                const text = messageInput.value.trim();\n                if (text) {\n                    vscode.postMessage({ command: 'sendMessage', text });\n                    messageInput.value = '';\n                }\n            });\n\n            llmModeToggle.addEventListener('change', () => {\n                vscode.postMessage({ command: 'toggleLLMMode' });\n            });\n\n            messageInput.addEventListener('keydown', (e) => {\n                if (e.key === 'Enter' && !e.shiftKey) {\n                    e.preventDefault();\n                    sendButton.click();\n                }\n            });\n        })();";
    };
    return CopilotWebviewContentService;
}());
exports.CopilotWebviewContentService = CopilotWebviewContentService;
