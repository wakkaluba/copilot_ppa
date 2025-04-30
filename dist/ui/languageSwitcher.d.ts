import * as vscode from 'vscode';
export declare class LanguageSwitcher {
    private readonly statusBarService;
    private readonly selectorService;
    private readonly configService;
    private readonly disposables;
    constructor(context: vscode.ExtensionContext);
    private initialize;
    private registerCommands;
    private setupEventListeners;
    private updateStatusBar;
    private showLanguageSelector;
}
