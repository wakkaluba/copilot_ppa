import * as vscode from 'vscode';
export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    agentMessageBackground: string;
    agentMessageForeground: string;
    userMessageBackground: string;
    userMessageForeground: string;
    systemMessage: string;
    error: string;
    success: string;
    border: string;
    buttonBackground: string;
    buttonForeground: string;
    buttonHoverBackground: string;
    inputBackground: string;
    inputForeground: string;
    inputBorder: string;
}
export declare class ThemeService implements vscode.Disposable {
    private _currentTheme;
    private readonly disposables;
    constructor();
    private detectCurrentTheme;
    get currentTheme(): 'light' | 'dark' | 'high-contrast';
    getCurrentVSCodeColors(): ThemeColors;
    dispose(): void;
}
