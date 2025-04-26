import * as vscode from 'vscode';

export class CodeOverviewWebview {
    private panel?: vscode.WebviewPanel;

    public show(symbols: vscode.DocumentSymbol[], language: string): void {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'codeOverview',
                'Code Overview',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        this.panel.webview.html = this.getWebviewContent(symbols, language);
        this.registerWebviewMessageHandling(this.panel);
    }

    private registerWebviewMessageHandling(panel: vscode.WebviewPanel): void {
        panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'jumpToLine') {
                this.jumpToLine(message.line);
            }
        });
    }

    private jumpToLine(line: number): void {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(
                new vscode.Range(position, position),
                vscode.TextEditorRevealType.InCenter
            );
        }
    }

    private getWebviewContent(symbols: vscode.DocumentSymbol[], language: string): string {
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

    private getSymbolsHtml(symbols: vscode.DocumentSymbol[], indent: number = 0): string {
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

    private getStyles(): string {
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

    private getClientScript(): string {
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