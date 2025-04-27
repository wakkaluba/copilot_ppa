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
exports.CodeLinkerService = void 0;
const vscode = __importStar(require("vscode"));
class CodeLinkerService {
    /**
     * Create links between related code elements
     */
    async createCodeLink() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const selection = this.getSelectionOrWordAtCursor(editor);
        if (!selection) {
            vscode.window.showErrorMessage('No text selected or cursor not on a word');
            return;
        }
        const targetFiles = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select target file for link'
        });
        if (!targetFiles || !targetFiles[0]) {
            return;
        }
        try {
            const targetUri = targetFiles[0];
            if (!targetUri) {
                throw new Error('No target file selected');
            }
            const targetDoc = await vscode.workspace.openTextDocument(targetUri);
            await vscode.window.showTextDocument(targetDoc);
            vscode.window.showInformationMessage('Now click on the target position for the link');
            const statusBarItem = this.createStatusBarItem();
            const decorationType = this.createHighlightDecoration();
            editor.setDecorations(decorationType, [selection.selection]);
            // Store link information
            const link = {
                source: {
                    uri: editor.document.uri.toString(),
                    position: {
                        line: selection.selection.start.line,
                        character: selection.selection.start.character
                    },
                    text: selection.text
                },
                target: {
                    uri: targetUri.toString()
                }
            };
            await this.saveCodeLink(link);
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
        const link = await this.findLinkAtPosition(editor.document.uri.toString(), position);
        if (link) {
            try {
                await this.navigateToTarget(link, editor);
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
    getSelectionOrWordAtCursor(editor) {
        let selection = editor.selection;
        let selectedText = '';
        if (selection.isEmpty) {
            const range = editor.document.getWordRangeAtPosition(selection.active);
            if (range) {
                selectedText = editor.document.getText(range);
                selection = new vscode.Selection(range.start, range.end);
            }
        }
        else {
            selectedText = editor.document.getText(selection);
        }
        return selectedText ? { selection, text: selectedText } : null;
    }
    async findLinkAtPosition(uri, position) {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const codeLinks = config.get('codeLinks');
        if (!codeLinks) {
            return null;
        }
        return Object.values(codeLinks).find(link => {
            if (link.source.uri === uri) {
                const sourceLine = link.source.position.line;
                const sourceChar = link.source.position.character;
                return (position.line === sourceLine &&
                    position.character >= sourceChar &&
                    position.character <= sourceChar + link.source.text.length);
            }
            return false;
        }) || null;
    }
    async navigateToTarget(link, editor) {
        const targetUri = vscode.Uri.parse(link.target.uri);
        const targetDoc = await vscode.workspace.openTextDocument(targetUri);
        await vscode.window.showTextDocument(targetDoc);
        if (link.target.position) {
            const targetPosition = new vscode.Position(link.target.position.line, link.target.position.character);
            editor.selection = new vscode.Selection(targetPosition, targetPosition);
            editor.revealRange(new vscode.Range(targetPosition, targetPosition), vscode.TextEditorRevealType.InCenter);
        }
    }
    createStatusBarItem() {
        const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        item.text = "$(link) Click on target position for code link...";
        item.show();
        return item;
    }
    createHighlightDecoration() {
        return vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
            borderRadius: '3px'
        });
    }
    async saveCodeLink(link) {
        const linkKey = `codeLink:${link.source.uri}:${link.source.position.line}:${link.source.position.character}`;
        await vscode.workspace.getConfiguration().update('copilot-ppa.codeLinks', { [linkKey]: link }, vscode.ConfigurationTarget.Workspace);
    }
}
exports.CodeLinkerService = CodeLinkerService;
//# sourceMappingURL=codeLinker.js.map