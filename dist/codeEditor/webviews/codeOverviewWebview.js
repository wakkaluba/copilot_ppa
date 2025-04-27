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
exports.CodeOverviewWebview = void 0;
const vscode = __importStar(require("vscode"));
class CodeOverviewWebview {
    show(symbols, language) {
        if (this.panel) {
            this.panel.reveal();
        }
        else {
            this.panel = vscode.window.createWebviewPanel('codeOverview', 'Code Overview', vscode.ViewColumn.Beside, { enableScripts: true });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
        this.panel.webview.html = this.getWebviewContent(symbols, language);
        this.registerWebviewMessageHandling(this.panel);
    }
    registerWebviewMessageHandling(panel) {
        panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'jumpToLine') {
                this.jumpToLine(message.line);
            }
        });
    }
    jumpToLine(line) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        }
    }
    getWebviewContent(symbols, language) {
        const symbolsHtml = this.getSymbolsHtml(symbols);
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Overview</title>
            <style>
                ${this.getStyles()}
            </style>
        </head>
        <body>
            <h2>Code Overview (${language})</h2>
            <div id="symbols">
                ${symbolsHtml}
            </div>
            <script>
                ${this.getClientScript()}
            </script>
        </body>
        </html>`;
    }
    getSymbolsHtml(symbols, indent = 0) {
        let html = '';
        const padding = '  '.repeat(indent);
        for (const symbol of symbols) {
            const kind = vscode.SymbolKind[symbol.kind].toLowerCase();
            const detail = symbol.detail ? `<span class="detail">${symbol.detail}</span>` : '';
            html += `<div class="symbol ${kind}" data-line="${symbol.range.start.line}">
                ${padding}<span class="icon ${kind}"></span>
                <span class="name">${symbol.name}</span>${detail}
            </div>`;
            if (symbol.children.length > 0) {
                html += `<div class="children">`;
                html += this.getSymbolsHtml(symbol.children, indent + 1);
                html += `</div>`;
            }
        }
        return html;
    }
    getStyles() {
        return `
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                padding: 10px;
            }
            .symbol { 
                padding: 5px; 
                cursor: pointer; 
            }
            .symbol:hover { 
                background-color: var(--vscode-list-hoverBackground);
            }
            .name { 
                font-weight: bold; 
            }
            .detail { 
                color: var(--vscode-descriptionForeground); 
                margin-left: 10px; 
            }
            .children { 
                margin-left: 20px; 
            }
            .icon { 
                display: inline-block; 
                width: 16px; 
                height: 16px; 
                margin-right: 5px; 
            }
            .class::before { content: "C"; }
            .method::before { content: "M"; }
            .function::before { content: "F"; }
            .variable::before { content: "V"; }
        `;
    }
    getClientScript() {
        return `
            const vscode = acquireVsCodeApi();
            document.querySelectorAll('.symbol').forEach(el => {
                el.addEventListener('click', () => {
                    const line = el.getAttribute('data-line');
                    vscode.postMessage({ 
                        command: 'jumpToLine', 
                        line: parseInt(line) 
                    });
                });
            });
        `;
    }
}
exports.CodeOverviewWebview = CodeOverviewWebview;
//# sourceMappingURL=codeOverviewWebview.js.map