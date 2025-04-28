import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Service to display code differences
 */
export class CodeDiffService {
    /**
     * Show diff between original and modified code
     * @param uri Original file URI
     * @param originalContent Original content
     * @param modifiedContent Modified content
     * @param title Diff title
     */
    public async showDiff(
        uri: vscode.Uri,
        originalContent: string,
        modifiedContent: string,
        title: string
    ): Promise<void> {
        const filename = path.basename(uri.fsPath);
        const originalUri = uri.with({ scheme: 'original', path: `${uri.path}.original` });
        const modifiedUri = uri.with({ scheme: 'modified', path: `${uri.path}.modified` });
        
        const originalDoc = await vscode.workspace.openTextDocument(originalUri);
        const modifiedDoc = await vscode.workspace.openTextDocument(modifiedUri);
        
        const edit1 = new vscode.WorkspaceEdit();
        const edit2 = new vscode.WorkspaceEdit();
        
        edit1.replace(
            originalUri,
            new vscode.Range(0, 0, originalDoc.lineCount, 0),
            originalContent
        );
        
        edit2.replace(
            modifiedUri,
            new vscode.Range(0, 0, modifiedDoc.lineCount, 0),
            modifiedContent
        );
        
        await vscode.workspace.applyEdit(edit1);
        await vscode.workspace.applyEdit(edit2);
        
        await vscode.commands.executeCommand(
            'vscode.diff',
            originalUri,
            modifiedUri,
            `${filename} - ${title}`
        );
    }
}
