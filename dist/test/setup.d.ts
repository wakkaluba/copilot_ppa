import * as vscode from 'vscode';
export declare const mockVSCodeAPI: () => {
    workspace: Partial<typeof vscode.workspace>;
    window: Partial<typeof vscode.window>;
    commands: Partial<typeof vscode.commands>;
    extensions: Partial<typeof vscode.extensions>;
    mockExtensionContext: vscode.ExtensionContext;
};
