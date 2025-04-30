import * as vscode from 'vscode';
export declare class DisplaySettingsCommand {
    static readonly commandId = "copilotPPA.openDisplaySettings";
    private displaySettingsService;
    constructor();
    register(): vscode.Disposable;
    private execute;
    private handleUpdateSettings;
    private handleResetSettings;
    private getWebviewContent;
}
