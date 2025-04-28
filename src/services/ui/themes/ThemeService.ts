import * as vscode from 'vscode';
import { ITheme, ThemeColors } from '../interfaces';

/**
 * Handles VS Code theme integration and color detection
 */
export class ThemeService implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];

    constructor() {
        // Listen for VS Code theme changes
        this.disposables.push(
            vscode.window.onDidChangeActiveColorTheme(() => {
                this.getCurrentVSCodeColors();
            })
        );
    }

    /**
     * Get colors from the current VS Code theme
     */
    public getCurrentVSCodeColors(): ThemeColors {
        const getColor = (id: string, lightFallback: string, darkFallback: string): string => {
            const color = vscode.workspace.getConfiguration().get<string>(`workbench.colorCustomizations.${id}`);
            if (color) {
                return color;
            }
            return vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? darkFallback : lightFallback;
        };

        return {
            primary: getColor('button.background', '#007acc', '#0098ff'),
            secondary: getColor('descriptionForeground', '#717171', '#abb2bf'),
            background: getColor('editor.background', '#ffffff', '#282c34'),
            foreground: getColor('editor.foreground', '#333333', '#abb2bf'),
            agentMessageBackground: getColor('editorWidget.background', '#f3f3f3', '#2c313c'),
            agentMessageForeground: getColor('editorWidget.foreground', '#333333', '#abb2bf'),
            userMessageBackground: getColor('input.background', '#ffffff', '#3b4048'),
            userMessageForeground: getColor('input.foreground', '#333333', '#abb2bf'),
            systemMessage: getColor('descriptionForeground', '#717171', '#7f848e'),
            error: getColor('errorForeground', '#dc3545', '#e06c75'),
            success: getColor('notificationsSuccessIcon.foreground', '#28a745', '#98c379'),
            border: getColor('input.border', '#cecece', '#3e4452'),
            buttonBackground: getColor('button.background', '#007acc', '#0098ff'),
            buttonForeground: getColor('button.foreground', '#ffffff', '#ffffff'),
            buttonHoverBackground: getColor('button.hoverBackground', '#005fa3', '#007acc'),
            inputBackground: getColor('input.background', '#ffffff', '#1e2227'),
            inputForeground: getColor('input.foreground', '#333333', '#abb2bf'),
            inputBorder: getColor('input.border', '#cecece', '#3e4452')
        };
    }

    /**
     * Create a theme based on the current VS Code theme
     */
    public createVSCodeMatchingTheme(): ITheme {
        const isLight = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;
        
        return {
            id: 'vscode-theme',
            name: 'VS Code Theme',
            type: isLight ? 'light' : 'dark',
            isBuiltIn: true,
            colors: this.getCurrentVSCodeColors(),
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        };
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}