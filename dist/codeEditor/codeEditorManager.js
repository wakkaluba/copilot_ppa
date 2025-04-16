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
exports.CodeEditorManager = void 0;
const vscode = __importStar(require("vscode"));
class CodeEditorManager {
    constructor() { }
    /**
     * Executes selected code in the active editor
     */
    async executeSelectedCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('No code selected');
            return;
        }
        const selectedText = editor.document.getText(selection);
        // Determine language from document
        const language = editor.document.languageId;
        try {
            // Execute in appropriate terminal based on language
            await this.executeInTerminal(selectedText, language);
            vscode.window.showInformationMessage('Code executed successfully');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to execute code: ${error}`);
        }
    }
    /**
     * Executes code in the appropriate terminal based on language
     */
    async executeInTerminal(code, language) {
        let terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Code Execution');
        terminal.show();
        // Prepare execution command based on language
        let command = '';
        switch (language) {
            case 'javascript':
            case 'typescript':
                // Create a temporary file and execute with Node
                const tempJsFile = await this.createTempFile(code, '.js');
                command = `node "${tempJsFile}"`;
                break;
            case 'python':
                const tempPyFile = await this.createTempFile(code, '.py');
                command = `python "${tempPyFile}"`;
                break;
            case 'shellscript':
            case 'bash':
                const tempShFile = await this.createTempFile(code, '.sh');
                command = `bash "${tempShFile}"`;
                break;
            case 'powershell':
                const tempPsFile = await this.createTempFile(code, '.ps1');
                command = `powershell -File "${tempPsFile}"`;
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
        terminal.sendText(command);
    }
    /**
     * Creates a temporary file with the given code
     */
    async createTempFile(content, extension) {
        const fs = vscode.workspace.fs;
        const os = require('os');
        const path = require('path');
        const tempDir = os.tmpdir();
        const fileName = `vscode-exec-${Date.now()}${extension}`;
        const filePath = path.join(tempDir, fileName);
        const uri = vscode.Uri.file(filePath);
        const uint8Array = new TextEncoder().encode(content);
        await fs.writeFile(uri, uint8Array);
        return filePath;
    }
    /**
     * Provides a code overview/outline for the current file
     */
    async showCodeOverview() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        // Get document symbols for the current file
        const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri);
        if (!symbols || symbols.length === 0) {
            vscode.window.showInformationMessage('No symbols found in this file');
            return;
        }
        // Create a tree view of the symbols
        const panel = vscode.window.createWebviewPanel('codeOverview', 'Code Overview', vscode.ViewColumn.Beside, { enableScripts: true });
        panel.webview.html = this.getCodeOverviewHtml(symbols, editor.document.languageId);
    }
    /**
     * Generate HTML for code overview
     */
    getCodeOverviewHtml(symbols, language) {
        function symbolToHtml(symbol, indent = 0) {
            const padding = '  '.repeat(indent);
            const kind = vscode.SymbolKind[symbol.kind].toLowerCase();
            const detail = symbol.detail ? `<span class="detail">${symbol.detail}</span>` : '';
            let html = `<div class="symbol ${kind}" data-line="${symbol.range.start.line}">
                ${padding}<span class="icon ${kind}"></span>
                <span class="name">${symbol.name}</span> ${detail}
            </div>`;
            if (symbol.children.length > 0) {
                html += `<div class="children">`;
                symbol.children.forEach(child => {
                    html += symbolToHtml(child, indent + 1);
                });
                html += `</div>`;
            }
            return html;
        }
        let symbolsHtml = '';
        symbols.forEach(symbol => {
            symbolsHtml += symbolToHtml(symbol);
        });
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Overview</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
                .symbol { padding: 5px; cursor: pointer; }
                .symbol:hover { background-color: #f0f0f0; }
                .name { font-weight: bold; }
                .detail { color: #888; margin-left: 10px; }
                .children { margin-left: 20px; }
                .icon { display: inline-block; width: 16px; height: 16px; margin-right: 5px; }
                .class::before { content: "C"; }
                .method::before { content: "M"; }
                .function::before { content: "F"; }
                .variable::before { content: "V"; }
            </style>
        </head>
        <body>
            <h2>Code Overview (${language})</h2>
            <div id="symbols">
                ${symbolsHtml}
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                document.querySelectorAll('.symbol').forEach(el => {
                    el.addEventListener('click', () => {
                        const line = el.getAttribute('data-line');
                        vscode.postMessage({ command: 'jumpToLine', line: parseInt(line) });
                    });
                });
            </script>
        </body>
        </html>`;
    }
    /**
     * Implement code referencing and linking
     */
    async findReferences() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const position = editor.selection.active;
        try {
            // Execute the built-in find references command
            const references = await vscode.commands.executeCommand('vscode.executeReferenceProvider', editor.document.uri, position);
            if (!references || references.length === 0) {
                vscode.window.showInformationMessage('No references found');
                return;
            }
            // Create a quick pick to show references
            const items = await Promise.all(references.map(async (ref) => {
                const doc = await vscode.workspace.openTextDocument(ref.uri);
                const lineText = doc.lineAt(ref.range.start.line).text.trim();
                return {
                    label: `$(references) ${lineText}`,
                    description: `${vscode.workspace.asRelativePath(ref.uri)} - Line ${ref.range.start.line + 1}`,
                    reference: ref
                };
            }));
            const selected = await vscode.window.showQuickPick(items, {
                title: `References (${items.length})`,
                placeHolder: 'Select reference to navigate to'
            });
            if (selected) {
                const doc = await vscode.workspace.openTextDocument(selected.reference.uri);
                await vscode.window.showTextDocument(doc, {
                    selection: selected.reference.range
                });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error finding references: ${error}`);
        }
    }
    /**
     * Create links between related code elements
     */
    async createCodeLink() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        // Get selection or word at cursor
        let selection = editor.selection;
        let selectedText = '';
        if (selection.isEmpty) {
            // Get the word at the current cursor position
            const range = editor.document.getWordRangeAtPosition(selection.active);
            if (range) {
                selectedText = editor.document.getText(range);
                selection = new vscode.Selection(range.start, range.end);
            }
        }
        else {
            selectedText = editor.document.getText(selection);
        }
        if (!selectedText) {
            vscode.window.showErrorMessage('No text selected or cursor not on a word');
            return;
        }
        // Ask user for target location
        const targetUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select target file for link'
        });
        if (!targetUri || targetUri.length === 0) {
            return;
        }
        try {
            // Open the target file
            const targetDoc = await vscode.workspace.openTextDocument(targetUri[0]);
            const targetEditor = await vscode.window.showTextDocument(targetDoc);
            // User selects the target position
            vscode.window.showInformationMessage('Now click on the target position for the link');
            // Create a status bar item to show instructions
            const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            statusBarItem.text = "$(link) Click on target position for code link...";
            statusBarItem.show();
            // Create a decoration type for highlighting
            const decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
                borderRadius: '3px'
            });
            // Highlight the source selection
            editor.setDecorations(decorationType, [selection]);
            // Store link information in workspace state
            const linkKey = `codeLink:${editor.document.uri.toString()}:${selection.start.line}:${selection.start.character}`;
            await vscode.workspace.getConfiguration().update('copilot-ppa.codeLinks', {
                source: {
                    uri: editor.document.uri.toString(),
                    position: {
                        line: selection.start.line,
                        character: selection.start.character
                    },
                    text: selectedText
                },
                target: {
                    uri: targetUri[0].toString()
                }
            }, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage('Code link created successfully');
            statusBarItem.dispose();
            editor.setDecorations(decorationType, []);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create code link: ${error}`);
        }
    }
    /**
     * Navigate to linked code
     */
    async navigateCodeLink() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const position = editor.selection.active;
        // Check if there's a link at the current position
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const codeLinks = config.get('codeLinks');
        if (!codeLinks) {
            vscode.window.showInformationMessage('No code links found');
            return;
        }
        // Find link at current position
        const currentUri = editor.document.uri.toString();
        const currentLine = position.line;
        const currentChar = position.character;
        const matchingLink = Object.entries(codeLinks).find(([key, link]) => {
            if (link.source && link.source.uri === currentUri) {
                const sourceLine = link.source.position.line;
                const sourceChar = link.source.position.character;
                // Check if cursor is within the link source
                return (currentLine === sourceLine &&
                    currentChar >= sourceChar &&
                    currentChar <= sourceChar + link.source.text.length);
            }
            return false;
        });
        if (matchingLink) {
            const [_, link] = matchingLink;
            try {
                // Navigate to target
                const targetUri = vscode.Uri.parse(link.target.uri);
                const targetDoc = await vscode.workspace.openTextDocument(targetUri);
                await vscode.window.showTextDocument(targetDoc);
                if (link.target.position) {
                    // If target has a specific position, move cursor there
                    const targetPosition = new vscode.Position(link.target.position.line, link.target.position.character);
                    editor.selection = new vscode.Selection(targetPosition, targetPosition);
                    editor.revealRange(new vscode.Range(targetPosition, targetPosition), vscode.TextEditorRevealType.InCenter);
                }
                vscode.window.showInformationMessage('Navigated to linked code');
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to navigate to linked code: ${error}`);
            }
        }
        else {
            vscode.window.showInformationMessage('No code link found at current position');
        }
    }
}
exports.CodeEditorManager = CodeEditorManager;
//# sourceMappingURL=codeEditorManager.js.map