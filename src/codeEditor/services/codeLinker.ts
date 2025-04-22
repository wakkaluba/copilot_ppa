import * as vscode from 'vscode';
import { ICodeLinker, CodeLink } from '../types';

export class CodeLinkerService implements ICodeLinker {
    /**
     * Create links between related code elements
     */
    public async createCodeLink(): Promise<void> {
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
            const link: CodeLink = {
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
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create code link: ${error}`);
        }
    }

    /**
     * Navigate to linked code
     */
    public async navigateCodeLink(): Promise<void> {
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
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to navigate to linked code: ${error}`);
            }
        } else {
            vscode.window.showInformationMessage('No code link found at current position');
        }
    }

    private getSelectionOrWordAtCursor(editor: vscode.TextEditor): { selection: vscode.Selection; text: string } | null {
        let selection = editor.selection;
        let selectedText = '';
        
        if (selection.isEmpty) {
            const range = editor.document.getWordRangeAtPosition(selection.active);
            if (range) {
                selectedText = editor.document.getText(range);
                selection = new vscode.Selection(range.start, range.end);
            }
        } else {
            selectedText = editor.document.getText(selection);
        }

        return selectedText ? { selection, text: selectedText } : null;
    }

    private async findLinkAtPosition(uri: string, position: vscode.Position): Promise<CodeLink | null> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const codeLinks = config.get<Record<string, CodeLink>>('codeLinks');
        
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

    private async navigateToTarget(link: CodeLink, editor: vscode.TextEditor): Promise<void> {
        const targetUri = vscode.Uri.parse(link.target.uri);
        const targetDoc = await vscode.workspace.openTextDocument(targetUri);
        await vscode.window.showTextDocument(targetDoc);
        
        if (link.target.position) {
            const targetPosition = new vscode.Position(
                link.target.position.line,
                link.target.position.character
            );
            
            editor.selection = new vscode.Selection(targetPosition, targetPosition);
            editor.revealRange(
                new vscode.Range(targetPosition, targetPosition),
                vscode.TextEditorRevealType.InCenter
            );
        }
    }

    private createStatusBarItem(): vscode.StatusBarItem {
        const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        item.text = "$(link) Click on target position for code link...";
        item.show();
        return item;
    }

    private createHighlightDecoration(): vscode.TextEditorDecorationType {
        return vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
            borderRadius: '3px'
        });
    }

    private async saveCodeLink(link: CodeLink): Promise<void> {
        const linkKey = `codeLink:${link.source.uri}:${link.source.position.line}:${link.source.position.character}`;
        await vscode.workspace.getConfiguration().update(
            'copilot-ppa.codeLinks', 
            { [linkKey]: link },
            vscode.ConfigurationTarget.Workspace
        );
    }
}