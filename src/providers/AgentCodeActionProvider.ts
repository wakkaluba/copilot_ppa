import * as vscode from 'vscode';

export class AgentCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
        vscode.CodeActionKind.RefactorRewrite
    ];

    async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];
        
        // Add explain code action
        const explainAction = new vscode.CodeAction(
            'Explain this code',
            vscode.CodeActionKind.QuickFix
        );
        explainAction.command = {
            command: 'copilot-ppa.explainCode',
            title: 'Explain Code',
            arguments: [document, range]
        };
        actions.push(explainAction);

        // Add suggest improvements action
        const improveAction = new vscode.CodeAction(
            'Suggest improvements',
            vscode.CodeActionKind.RefactorRewrite
        );
        improveAction.command = {
            command: 'copilot-ppa.suggestImprovements',
            title: 'Suggest Improvements',
            arguments: [document, range]
        };
        actions.push(improveAction);

        return actions;
    }
}
