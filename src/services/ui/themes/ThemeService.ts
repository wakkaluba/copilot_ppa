import * as vscode from 'vscode';
import { Theme, ThemeColors } from './interfaces';

/**
 * Handles VS Code theme integration and color detection
 */
export class ThemeService implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(private onVSCodeThemeChange: (kind: vscode.ColorThemeKind) => void) {
        // Watch for VS Code theme changes
        this.disposables.push(
            vscode.window.onDidChangeActiveColorTheme(theme => {
                this.onVSCodeThemeChange(theme.kind);
            })
        );
    }

    /**
     * Get colors from the current VS Code theme
     */
    getCurrentVSCodeColors(): ThemeColors {
        const theme = vscode.window.activeColorTheme;
        const getColor = (id: string, fallback: string) => {
            const color = theme.getColor(id);
            return color ? color.toString() : fallback;
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

    /**
     * Create a theme based on the current VS Code theme
     */
    createVSCodeMatchingTheme(): Theme {
        const isLight = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;

        return {
            id: 'vscode-theme',
            name: 'VS Code Theme',
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

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}