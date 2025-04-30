import * as vscode from 'vscode';
export declare class ThemeSettingsCommand {
    static readonly commandId = "copilotPPA.openThemeSettings";
    static readonly createThemeCommandId = "copilotPPA.createCustomTheme";
    private themeManager;
    constructor(context: vscode.ExtensionContext);
    register(): vscode.Disposable[];
    private openThemeSettings;
    private createCustomTheme;
    private editCustomTheme;
    private handleSettingsMessage;
    private handleEditorMessage;
}
