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

export class ThemeService implements vscode.Disposable {
    private _currentTheme: 'light' | 'dark' | 'high-contrast';
    private readonly disposables: vscode.Disposable[] = [];

    constructor() {
        this._currentTheme = this.detectCurrentTheme();
        this.disposables.push(
            vscode.window.onDidChangeActiveColorTheme(() => {
                this._currentTheme = this.detectCurrentTheme();
            })
        );
    }

    private detectCurrentTheme(): 'light' | 'dark' | 'high-contrast' {
        const theme = vscode.window.activeColorTheme;
        if (theme.kind === vscode.ColorThemeKind.Light) {
            return 'light';
        } else if (theme.kind === vscode.ColorThemeKind.Dark) {
            return 'dark';
        } else {
            return 'high-contrast';
        }
    }

    public get currentTheme(): 'light' | 'dark' | 'high-contrast' {
        return this._currentTheme;
    }

    public getCurrentVSCodeColors(): ThemeColors {
        const getColor = (colorId: string, fallback: string): string => {
            const color = vscode.workspace.getConfiguration('workbench').get<string>(`colorCustomizations.${colorId}`);
            if (color) {
                return color;
            }
            
            // Fallback to default theme colors
            return this._currentTheme === 'dark' ? {
                'button.background': '#0098ff',
                'descriptionForeground': '#abb2bf',
                'editor.background': '#282c34',
                'editor.foreground': '#abb2bf',
                'editorWidget.background': '#2c313c',
                'editorWidget.foreground': '#abb2bf',
                'input.background': '#3b4048',
                'input.foreground': '#abb2bf',
                'errorForeground': '#e06c75',
                'notificationsSuccessIcon.foreground': '#98c379',
                'input.border': '#3e4452',
                'button.foreground': '#ffffff',
                'button.hoverBackground': '#007acc'
            }[colorId] || fallback : {
                'button.background': '#007acc',
                'descriptionForeground': '#717171',
                'editor.background': '#ffffff',
                'editor.foreground': '#333333',
                'editorWidget.background': '#f3f3f3',
                'editorWidget.foreground': '#333333',
                'input.background': '#ffffff',
                'input.foreground': '#333333',
                'errorForeground': '#dc3545',
                'notificationsSuccessIcon.foreground': '#28a745',
                'input.border': '#cecece',
                'button.foreground': '#ffffff',
                'button.hoverBackground': '#005fa3'
            }[colorId] || fallback;
        };

        return {
            primary: getColor('button.background', '#007acc'),
            secondary: getColor('descriptionForeground', '#717171'),
            background: getColor('editor.background', '#ffffff'),
            foreground: getColor('editor.foreground', '#333333'),
            agentMessageBackground: getColor('editorWidget.background', '#f3f3f3'),
            agentMessageForeground: getColor('editorWidget.foreground', '#333333'),
            userMessageBackground: getColor('input.background', '#ffffff'),
            userMessageForeground: getColor('input.foreground', '#333333'),
            systemMessage: getColor('descriptionForeground', '#717171'),
            error: getColor('errorForeground', '#dc3545'),
            success: getColor('notificationsSuccessIcon.foreground', '#28a745'),
            border: getColor('input.border', '#cecece'),
            buttonBackground: getColor('button.background', '#007acc'),
            buttonForeground: getColor('button.foreground', '#ffffff'),
            buttonHoverBackground: getColor('button.hoverBackground', '#005fa3'),
            inputBackground: getColor('input.background', '#ffffff'),
            inputForeground: getColor('input.foreground', '#333333'),
            inputBorder: getColor('input.border', '#cecece')
        };
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}