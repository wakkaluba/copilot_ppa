import * as vscode from 'vscode';
import { ICodeNavigator } from '../types';
import { CodeOverviewWebview } from '../webviews/codeOverviewWebview';

export class CodeNavigatorService implements ICodeNavigator {
    private webviewProvider: CodeOverviewWebview;

    constructor() {
        this.webviewProvider = new CodeOverviewWebview();
    }

    /**
     * Shows a code overview/outline for the current file
     */
    public async showCodeOverview(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            editor.document.uri
        );

        if (!symbols || symbols.length === 0) {
            vscode.window.showInformationMessage('No symbols found in this file');
            return;
        }

        this.webviewProvider.show(symbols, editor.document.languageId);
    }

    /**
     * Find references to the symbol at the current position
     */
    public async findReferences(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const position = editor.selection.active;
        
        try {
            const references = await vscode.commands.executeCommand<vscode.Location[]>(
                'vscode.executeReferenceProvider', 
                editor.document.uri, 
                position
            );

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
        } catch (error) {
            vscode.window.showErrorMessage(`Error finding references: ${error}`);
        }
    }
}