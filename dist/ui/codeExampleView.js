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
exports.CodeExampleViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class CodeExampleViewProvider {
    constructor(_extensionUri, codeExampleService) {
        this._extensionUri = _extensionUri;
        this.codeExampleService = codeExampleService;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'search':
                    await this.searchCodeExamples(data.query, data.language);
                    break;
                case 'insert':
                    this.insertCodeExample(data.code);
                    break;
                case 'copy':
                    await vscode.env.clipboard.writeText(data.code);
                    vscode.window.showInformationMessage('Code copied to clipboard');
                    break;
            }
        });
    }
    /**
     * Search for code examples and update the webview
     */
    async searchCodeExamples(query, language) {
        if (!this._view) {
            return;
        }
        // Show loading state
        this._view.webview.postMessage({ type: 'loading', loading: true });
        try {
            // Get current editor to determine language if not provided
            const editor = vscode.window.activeTextEditor;
            const editorLanguage = editor?.document.languageId;
            // Use language from parameter, or from editor, or don't filter by language
            const searchLanguage = language || editorLanguage;
            // Get keywords from the current selection or document
            const keywords = this.extractKeywords(editor);
            // Search for examples
            const examples = await this.codeExampleService.searchExamples(query, {
                language: searchLanguage,
                maxResults: 10
            });
            // Filter examples by relevance
            const filteredExamples = this.codeExampleService.filterExamplesByRelevance(examples, { language: searchLanguage || '', keywords });
            // Update webview with results
            this._view.webview.postMessage({
                type: 'searchResults',
                results: filteredExamples,
                query: query,
                language: searchLanguage
            });
        }
        catch (error) {
            // Show error in webview
            this._view.webview.postMessage({
                type: 'error',
                message: `Error searching for code examples: ${error instanceof Error ? error.message : String(error)}`
            });
        }
        finally {
            // Hide loading state
            this._view.webview.postMessage({ type: 'loading', loading: false });
        }
    }
    /**
     * Insert code example at cursor position
     */
    insertCodeExample(code) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, code);
            });
        }
    }
    /**
     * Extract keywords from the current document or selection
     */
    extractKeywords(editor) {
        if (!editor) {
            return [];
        }
        let text;
        // Get text from selection or full document
        if (!editor.selection.isEmpty) {
            text = editor.document.getText(editor.selection);
        }
        else {
            // Get text around cursor (50 lines before and after)
            const cursorPos = editor.selection.active;
            const startLine = Math.max(0, cursorPos.line - 50);
            const endLine = Math.min(editor.document.lineCount - 1, cursorPos.line + 50);
            const startPos = new vscode.Position(startLine, 0);
            const endPos = new vscode.Position(endLine, editor.document.lineAt(endLine).text.length);
            text = editor.document.getText(new vscode.Range(startPos, endPos));
        }
        // Extract potential keywords (variables, function names, etc.)
        const identifierPattern = /\b[a-zA-Z][a-zA-Z0-9_]*\b/g;
        const allMatches = [...text.matchAll(identifierPattern)].map(match => match[0]);
        // Filter out common keywords and duplicates
        const commonKeywords = [
            'if', 'else', 'for', 'while', 'function', 'return', 'var', 'let', 'const',
            'class', 'interface', 'import', 'export', 'from', 'as', 'public', 'private',
            'protected', 'static', 'async', 'await', 'try', 'catch', 'throw', 'finally',
            'new', 'this', 'super', 'extends', 'implements', 'package', 'true', 'false',
            'null', 'undefined', 'void', 'delete'
        ];
        const uniqueKeywords = [...new Set(allMatches)].filter(keyword => !commonKeywords.includes(keyword) && keyword.length > 2);
        return uniqueKeywords.slice(0, 20); // Limit to 20 keywords
    }
    /**
     * Generate HTML for the webview
     */
    _getHtmlForWebview(webview) {
        // Get styles
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'codeExamples.css'));
        // Get scripts
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'codeExamples.js'));
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        return /* html */ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="
                    default-src 'none';
                    style-src ${webview.cspSource} 'unsafe-inline';
                    script-src 'nonce-${nonce}';
                    img-src ${webview.cspSource} https:;
                ">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>Code Examples</title>
            </head>
            <body>
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="Search for code examples...">
                    <button id="search-button">Search</button>
                </div>
                <div class="language-filter">
                    <select id="language-select">
                        <option value="">All Languages</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="cpp">C++</option>
                        <option value="go">Go</option>
                        <option value="ruby">Ruby</option>
                        <option value="php">PHP</option>
                        <option value="rust">Rust</option>
                    </select>
                </div>
                <div class="loading-indicator hidden">
                    <div class="spinner"></div>
                    <span>Searching...</span>
                </div>
                <div class="results-container"></div>
                <div class="empty-state">
                    <p>Search for code examples to get started</p>
                </div>
                <div class="error-container hidden">
                    <p class="error-message"></p>
                </div>
                
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}
exports.CodeExampleViewProvider = CodeExampleViewProvider;
CodeExampleViewProvider.viewType = 'codeExamples.view';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=codeExampleView.js.map