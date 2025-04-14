import * as vscode from 'vscode';

export interface Theme {
    id: string;
    name: string;
    type: 'light' | 'dark' | 'high-contrast';
    colors: ThemeColors;
}

export interface ThemeColors {
    background: string;
    foreground: string;
    primaryBackground: string;
    primaryForeground: string;
    secondaryBackground: string;
    secondaryForeground: string;
    accentBackground: string;
    accentForeground: string;
    borderColor: string;
    errorColor: string;
    warningColor: string;
    successColor: string;
    linkColor: string;
    userMessageBackground: string;
    userMessageForeground: string;
    assistantMessageBackground: string;
    assistantMessageForeground: string;
    systemMessageBackground: string;
    systemMessageForeground: string;
    codeBlockBackground: string;
    codeBlockForeground: string;
}

export class ThemeManager {
    private static instance: ThemeManager;
    private currentThemeId: string;
    private builtInThemes: Map<string, Theme> = new Map();
    private customThemes: Map<string, Theme> = new Map();
    private _onThemeChanged = new vscode.EventEmitter<Theme>();
    readonly onThemeChanged = this._onThemeChanged.event;

    private constructor(private context: vscode.ExtensionContext) {
        this.currentThemeId = this.getConfiguredThemeId();
        this.initializeBuiltInThemes();
        this.loadCustomThemes();

        // Listen for VS Code theme changes
        vscode.window.onDidChangeActiveColorTheme(() => {
            // Update theme colors that depend on VS Code's theme
            this._onThemeChanged.fire(this.getCurrentTheme());
        });

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.theme')) {
                const newThemeId = this.getConfiguredThemeId();
                if (newThemeId !== this.currentThemeId) {
                    this.currentThemeId = newThemeId;
                    this._onThemeChanged.fire(this.getCurrentTheme());
                }
            }
        });
    }

    public static getInstance(context?: vscode.ExtensionContext): ThemeManager {
        if (!ThemeManager.instance) {
            if (!context) {
                throw new Error('Context is required when first initializing ThemeManager');
            }
            ThemeManager.instance = new ThemeManager(context);
        }
        return ThemeManager.instance;
    }

    public getCurrentTheme(): Theme {
        const theme = this.builtInThemes.get(this.currentThemeId) || 
                      this.customThemes.get(this.currentThemeId) || 
                      this.getDefaultTheme();
        return theme;
    }

    public getAllThemes(): Theme[] {
        const themes: Theme[] = [];
        this.builtInThemes.forEach(theme => themes.push(theme));
        this.customThemes.forEach(theme => themes.push(theme));
        return themes;
    }

    public async setTheme(themeId: string): Promise<void> {
        if (!this.builtInThemes.has(themeId) && !this.customThemes.has(themeId)) {
            throw new Error(`Theme with ID ${themeId} not found`);
        }

        this.currentThemeId = themeId;
        // Save to configuration
        await vscode.workspace.getConfiguration('copilot-ppa').update('theme.selected', themeId, vscode.ConfigurationTarget.Global);
        this._onThemeChanged.fire(this.getCurrentTheme());
    }

    public async addCustomTheme(theme: Theme): Promise<void> {
        if (this.builtInThemes.has(theme.id)) {
            throw new Error(`Cannot add custom theme with reserved ID: ${theme.id}`);
        }

        this.customThemes.set(theme.id, theme);
        await this.saveCustomThemes();
        // Don't automatically switch to the new theme
    }

    public async updateCustomTheme(themeId: string, updatedTheme: Partial<Theme>): Promise<void> {
        if (!this.customThemes.has(themeId)) {
            throw new Error(`Custom theme with ID ${themeId} not found`);
        }

        const existingTheme = this.customThemes.get(themeId)!;
        const mergedTheme: Theme = {
            ...existingTheme,
            ...updatedTheme,
            colors: {
                ...existingTheme.colors,
                ...(updatedTheme.colors || {})
            }
        };

        this.customThemes.set(themeId, mergedTheme);
        await this.saveCustomThemes();

        // Update current theme if it's the one being edited
        if (this.currentThemeId === themeId) {
            this._onThemeChanged.fire(mergedTheme);
        }
    }

    public async deleteCustomTheme(themeId: string): Promise<void> {
        if (!this.customThemes.has(themeId)) {
            throw new Error(`Custom theme with ID ${themeId} not found`);
        }

        // If the current theme is being deleted, switch to default
        if (this.currentThemeId === themeId) {
            this.currentThemeId = 'default';
            await vscode.workspace.getConfiguration('copilot-ppa').update('theme.selected', 'default', vscode.ConfigurationTarget.Global);
            this._onThemeChanged.fire(this.getDefaultTheme());
        }

        this.customThemes.delete(themeId);
        await this.saveCustomThemes();
    }

    public getThemeCss(theme: Theme): string {
        return `
            :root {
                --copilot-ppa-background: ${theme.colors.background};
                --copilot-ppa-foreground: ${theme.colors.foreground};
                --copilot-ppa-primary-background: ${theme.colors.primaryBackground};
                --copilot-ppa-primary-foreground: ${theme.colors.primaryForeground};
                --copilot-ppa-secondary-background: ${theme.colors.secondaryBackground};
                --copilot-ppa-secondary-foreground: ${theme.colors.secondaryForeground};
                --copilot-ppa-accent-background: ${theme.colors.accentBackground};
                --copilot-ppa-accent-foreground: ${theme.colors.accentForeground};
                --copilot-ppa-border-color: ${theme.colors.borderColor};
                --copilot-ppa-error-color: ${theme.colors.errorColor};
                --copilot-ppa-warning-color: ${theme.colors.warningColor};
                --copilot-ppa-success-color: ${theme.colors.successColor};
                --copilot-ppa-link-color: ${theme.colors.linkColor};
                --copilot-ppa-user-message-background: ${theme.colors.userMessageBackground};
                --copilot-ppa-user-message-foreground: ${theme.colors.userMessageForeground};
                --copilot-ppa-assistant-message-background: ${theme.colors.assistantMessageBackground};
                --copilot-ppa-assistant-message-foreground: ${theme.colors.assistantMessageForeground};
                --copilot-ppa-system-message-background: ${theme.colors.systemMessageBackground};
                --copilot-ppa-system-message-foreground: ${theme.colors.systemMessageForeground};
                --copilot-ppa-code-block-background: ${theme.colors.codeBlockBackground};
                --copilot-ppa-code-block-foreground: ${theme.colors.codeBlockForeground};
            }
        `;
    }

    private getConfiguredThemeId(): string {
        return vscode.workspace.getConfiguration('copilot-ppa').get('theme.selected', 'default');
    }

    private initializeBuiltInThemes(): void {
        // Default theme that follows VS Code's colors
        const vsCodeTheme = this.createVSCodeTheme();
        this.builtInThemes.set('default', vsCodeTheme);

        // Dark theme
        this.builtInThemes.set('dark', {
            id: 'dark',
            name: 'Dark Theme',
            type: 'dark',
            colors: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                primaryBackground: '#252526',
                primaryForeground: '#ffffff',
                secondaryBackground: '#2d2d2d',
                secondaryForeground: '#cccccc',
                accentBackground: '#0e639c',
                accentForeground: '#ffffff',
                borderColor: '#474747',
                errorColor: '#f48771',
                warningColor: '#cca700',
                successColor: '#89d185',
                linkColor: '#3794ff',
                userMessageBackground: '#252526',
                userMessageForeground: '#cccccc',
                assistantMessageBackground: '#2d2d30',
                assistantMessageForeground: '#cccccc',
                systemMessageBackground: '#3d3d3d',
                systemMessageForeground: '#cccccc',
                codeBlockBackground: '#1e1e1e',
                codeBlockForeground: '#d4d4d4',
            }
        });

        // Light theme
        this.builtInThemes.set('light', {
            id: 'light',
            name: 'Light Theme',
            type: 'light',
            colors: {
                background: '#f3f3f3',
                foreground: '#333333',
                primaryBackground: '#ffffff',
                primaryForeground: '#333333',
                secondaryBackground: '#e7e7e7',
                secondaryForeground: '#333333',
                accentBackground: '#007acc',
                accentForeground: '#ffffff',
                borderColor: '#c8c8c8',
                errorColor: '#e51400',
                warningColor: '#bf8803',
                successColor: '#008000',
                linkColor: '#006ab1',
                userMessageBackground: '#f5f5f5',
                userMessageForeground: '#333333',
                assistantMessageBackground: '#e6f3fb',
                assistantMessageForeground: '#333333',
                systemMessageBackground: '#e8e8e8',
                systemMessageForeground: '#333333',
                codeBlockBackground: '#f5f5f5',
                codeBlockForeground: '#333333',
            }
        });

        // High contrast theme
        this.builtInThemes.set('high-contrast', {
            id: 'high-contrast',
            name: 'High Contrast',
            type: 'high-contrast',
            colors: {
                background: '#000000',
                foreground: '#ffffff',
                primaryBackground: '#000000',
                primaryForeground: '#ffffff',
                secondaryBackground: '#0a0a0a',
                secondaryForeground: '#ffffff',
                accentBackground: '#1aebff',
                accentForeground: '#000000',
                borderColor: '#6fc3df',
                errorColor: '#f48771',
                warningColor: '#ffff00',
                successColor: '#89d185',
                linkColor: '#3794ff',
                userMessageBackground: '#000000',
                userMessageForeground: '#ffffff',
                assistantMessageBackground: '#0a0a0a',
                assistantMessageForeground: '#ffffff',
                systemMessageBackground: '#3d3d3d',
                systemMessageForeground: '#ffffff',
                codeBlockBackground: '#0a0a0a',
                codeBlockForeground: '#ffffff',
            }
        });
    }

    private createVSCodeTheme(): Theme {
        // Get VS Code colors to create a theme that matches the current UI
        const colorTheme = vscode.window.activeColorTheme;
        const isDark = colorTheme.kind === vscode.ColorThemeKind.Dark || colorTheme.kind === vscode.ColorThemeKind.HighContrast;
        
        const getColor = (key: string, fallback: string): string => {
            const color = new vscode.ThemeColor(key);
            try {
                // This would need a custom implementation since we can't directly access the color values
                // Here we're just using fallbacks
                return fallback;
            } catch (error) {
                return fallback;
            }
        };

        return {
            id: 'default',
            name: 'VS Code Theme',
            type: isDark ? 'dark' : 'light',
            colors: {
                background: getColor('editor.background', isDark ? '#1e1e1e' : '#ffffff'),
                foreground: getColor('editor.foreground', isDark ? '#d4d4d4' : '#333333'),
                primaryBackground: getColor('activityBar.background', isDark ? '#252526' : '#f5f5f5'),
                primaryForeground: getColor('activityBar.foreground', isDark ? '#ffffff' : '#333333'),
                secondaryBackground: getColor('sideBar.background', isDark ? '#2d2d2d' : '#f3f3f3'),
                secondaryForeground: getColor('sideBar.foreground', isDark ? '#cccccc' : '#333333'),
                accentBackground: getColor('button.background', isDark ? '#0e639c' : '#007acc'),
                accentForeground: getColor('button.foreground', isDark ? '#ffffff' : '#ffffff'),
                borderColor: getColor('widget.border', isDark ? '#474747' : '#c8c8c8'),
                errorColor: getColor('errorForeground', isDark ? '#f48771' : '#e51400'),
                warningColor: getColor('editorWarning.foreground', isDark ? '#cca700' : '#bf8803'),
                successColor: getColor('editorInfo.foreground', isDark ? '#89d185' : '#008000'),
                linkColor: getColor('textLink.foreground', isDark ? '#3794ff' : '#006ab1'),
                userMessageBackground: getColor('editor.background', isDark ? '#252526' : '#f5f5f5'),
                userMessageForeground: getColor('editor.foreground', isDark ? '#cccccc' : '#333333'),
                assistantMessageBackground: getColor('list.activeSelectionBackground', isDark ? '#2d2d30' : '#e6f3fb'),
                assistantMessageForeground: getColor('list.activeSelectionForeground', isDark ? '#cccccc' : '#333333'),
                systemMessageBackground: getColor('list.warningForeground', isDark ? '#3d3d3d' : '#e8e8e8'),
                systemMessageForeground: getColor('list.warningForeground', isDark ? '#cccccc' : '#333333'),
                codeBlockBackground: getColor('textCodeBlock.background', isDark ? '#1e1e1e' : '#f5f5f5'),
                codeBlockForeground: getColor('textCodeBlock.foreground', isDark ? '#d4d4d4' : '#333333'),
            }
        };
    }

    private getDefaultTheme(): Theme {
        return this.builtInThemes.get('default')!;
    }

    private async loadCustomThemes(): Promise<void> {
        const customThemesData = this.context.globalState.get<Theme[]>('custom-themes', []);
        customThemesData.forEach(theme => {
            this.customThemes.set(theme.id, theme);
        });
    }

    private async saveCustomThemes(): Promise<void> {
        const customThemesData = Array.from(this.customThemes.values());
        await this.context.globalState.update('custom-themes', customThemesData);
    }
}
