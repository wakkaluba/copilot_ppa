"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeOverviewWebview = void 0;
var vscode = require("vscode");
var CodeOverviewWebview = /** @class */ (function () {
    function CodeOverviewWebview() {
    }
    CodeOverviewWebview.prototype.show = function (symbols, language) {
        var _this = this;
        if (this.panel) {
            this.panel.reveal();
        }
        else {
            this.panel = vscode.window.createWebviewPanel('codeOverview', 'Code Overview', vscode.ViewColumn.Beside, { enableScripts: true });
            this.panel.onDidDispose(function () {
                _this.panel = undefined;
            });
        }
        this.panel.webview.html = this.getWebviewContent(symbols, language);
        this.registerWebviewMessageHandling(this.panel);
    };
    CodeOverviewWebview.prototype.registerWebviewMessageHandling = function (panel) {
        var _this = this;
        panel.webview.onDidReceiveMessage(function (message) {
            if (message.command === 'jumpToLine') {
                _this.jumpToLine(message.line);
            }
        });
    };
    CodeOverviewWebview.prototype.jumpToLine = function (line) {
        var editor = vscode.window.activeTextEditor;
        if (editor) {
            var position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        }
    };
    CodeOverviewWebview.prototype.getWebviewContent = function (symbols, language) {
        var symbolsHtml = this.getSymbolsHtml(symbols);
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>Code Overview</title>\n            <style>\n                ".concat(this.getStyles(), "\n            </style>\n        </head>\n        <body>\n            <h2>Code Overview (").concat(language, ")</h2>\n            <div id=\"symbols\">\n                ").concat(symbolsHtml, "\n            </div>\n            <script>\n                ").concat(this.getClientScript(), "\n            </script>\n        </body>\n        </html>");
    };
    CodeOverviewWebview.prototype.getSymbolsHtml = function (symbols, indent) {
        if (indent === void 0) { indent = 0; }
        var html = '';
        var padding = '  '.repeat(indent);
        for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
            var symbol = symbols_1[_i];
            var kind = vscode.SymbolKind[symbol.kind].toLowerCase();
            var detail = symbol.detail ? "<span class=\"detail\">".concat(symbol.detail, "</span>") : '';
            html += "<div class=\"symbol ".concat(kind, "\" data-line=\"").concat(symbol.range.start.line, "\">\n                ").concat(padding, "<span class=\"icon ").concat(kind, "\"></span>\n                <span class=\"name\">").concat(symbol.name, "</span>").concat(detail, "\n            </div>");
            if (symbol.children.length > 0) {
                html += "<div class=\"children\">";
                html += this.getSymbolsHtml(symbol.children, indent + 1);
                html += "</div>";
            }
        }
        return html;
    };
    CodeOverviewWebview.prototype.getStyles = function () {
        return "\n            body { \n                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, \n                          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n                padding: 10px;\n            }\n            .symbol { \n                padding: 5px; \n                cursor: pointer; \n            }\n            .symbol:hover { \n                background-color: var(--vscode-list-hoverBackground);\n            }\n            .name { \n                font-weight: bold; \n            }\n            .detail { \n                color: var(--vscode-descriptionForeground); \n                margin-left: 10px; \n            }\n            .children { \n                margin-left: 20px; \n            }\n            .icon { \n                display: inline-block; \n                width: 16px; \n                height: 16px; \n                margin-right: 5px; \n            }\n            .class::before { content: \"C\"; }\n            .method::before { content: \"M\"; }\n            .function::before { content: \"F\"; }\n            .variable::before { content: \"V\"; }\n        ";
    };
    CodeOverviewWebview.prototype.getClientScript = function () {
        return "\n            const vscode = acquireVsCodeApi();\n            document.querySelectorAll('.symbol').forEach(el => {\n                el.addEventListener('click', () => {\n                    const line = el.getAttribute('data-line');\n                    vscode.postMessage({ \n                        command: 'jumpToLine', \n                        line: parseInt(line) \n                    });\n                });\n            });\n        ";
    };
    return CodeOverviewWebview;
}());
exports.CodeOverviewWebview = CodeOverviewWebview;
