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
exports.CodeNavigatorService = void 0;
const vscode = __importStar(require("vscode"));
const codeOverviewWebview_1 = require("../webviews/codeOverviewWebview");
class CodeNavigatorService {
    constructor() {
        this.webviewProvider = new codeOverviewWebview_1.CodeOverviewWebview();
    }
    /**
     * Shows a code overview/outline for the current file
     */
    async showCodeOverview() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri);
        if (!symbols || symbols.length === 0) {
            vscode.window.showInformationMessage('No symbols found in this file');
            return;
        }
        this.webviewProvider.show(symbols, editor.document.languageId);
    }
    /**
     * Find references to the symbol at the current position
     */
    async findReferences() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const position = editor.selection.active;
        try {
            const references = await vscode.commands.executeCommand('vscode.executeReferenceProvider', editor.document.uri, position);
            if (!references || references.length === 0) {
                vscode.window.showInformationMessage('No references found');
                return;
            }
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
}
exports.CodeNavigatorService = CodeNavigatorService;
//# sourceMappingURL=codeNavigator.js.map