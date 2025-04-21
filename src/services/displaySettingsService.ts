import * as vscode from 'vscode';
import { DisplaySettings } from '../types/display';
import { ThemeManager } from './themeManager';

export class DisplaySettingsService implements vscode.Disposable {
    private _onSettingsChanged = new vscode.EventEmitter<DisplaySettings>();
    readonly onSettingsChanged = this._onSettingsChanged.event;

    constructor(
        private readonly themeManager: ThemeManager,
        private readonly context: vscode.ExtensionContext
    ) {
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.display')) {
                this._onSettingsChanged.fire(this.getSettings());
            }
        });

        // Listen for theme changes
        this.themeManager.onThemeChanged(() => {
            this._onSettingsChanged.fire(this.getSettings());
        });
    }

    public getSettings(): DisplaySettings {
        const config = vscode.workspace.getConfiguration('copilot-ppa.display');
        const theme = this.themeManager.getCurrentTheme();

        return {
            fontSize: config.get<number>('fontSize', 14),
            fontFamily: config.get<string>('fontFamily', 'var(--vscode-editor-font-family)'),
            lineHeight: config.get<number>('lineHeight', 1.5),
            maxWidth: config.get<string>('maxWidth', '800px'),
            padding: config.get<string>('padding', '1rem'),
            theme: theme.type,
            colors: {
                background: theme.components.background,
                foreground: theme.components.foreground,
                primary: theme.components.primary,
                secondary: theme.components.secondary,
                accent: theme.components.accent,
                error: theme.components.error
            }
        };
    }

    public async updateSetting<K extends keyof DisplaySettings>(
        setting: K,
        value: DisplaySettings[K]
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa.display');
        await config.update(setting, value, vscode.ConfigurationTarget.Global);
        this._onSettingsChanged.fire(this.getSettings());
    }

    public applySettingsToElement(element: HTMLElement): void {
        const settings = this.getSettings();
        element.style.setProperty('--font-size', `${settings.fontSize}px`);
        element.style.setProperty('--font-family', settings.fontFamily);
        element.style.setProperty('--line-height', settings.lineHeight.toString());
        element.style.setProperty('--max-width', settings.maxWidth);
        element.style.setProperty('--padding', settings.padding);

        Object.entries(settings.colors).forEach(([key, value]) => {
            element.style.setProperty(`--color-${key}`, value);
        });
    }

    public getCssVariables(): string {
        const settings = this.getSettings();
        let css = `
            :root {
                --font-size: ${settings.fontSize}px;
                --font-family: ${settings.fontFamily};
                --line-height: ${settings.lineHeight};
                --max-width: ${settings.maxWidth};
                --padding: ${settings.padding};
        `;

        Object.entries(settings.colors).forEach(([key, value]) => {
            css += `\n                --color-${key}: ${value};`;
        });

        css += '\n            }';
        return css;
    }

    public dispose(): void {
        this._onSettingsChanged.dispose();
    }
}
