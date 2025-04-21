import * as vscode from 'vscode';
import { Theme, ThemeComponent } from '../types/theme';

export class ThemeManager implements vscode.Disposable {
    private builtInThemes: Map<string, Theme> = new Map();
    private customThemes: Map<string, Theme> = new Map();
    private currentThemeId: string;
    private _onThemeChanged = new vscode.EventEmitter<Theme>();
    readonly onThemeChanged = this._onThemeChanged.event;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.currentThemeId = this.loadCurrentThemeId();
        this.initializeBuiltInThemes();
        this.loadCustomThemes();
    }

    private loadCurrentThemeId(): string {
        return this.context.globalState.get<string>('selectedThemeId', 'default');
    }

    private async saveCurrentThemeId(themeId: string): Promise<void> {
        await this.context.globalState.update('selectedThemeId', themeId);
    }

    private initializeBuiltInThemes(): void {
        this.builtInThemes.set('default', {
            id: 'default',
            name: 'Default Theme',
            type: 'dark',
            components: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                primary: '#569cd6',
                secondary: '#4ec9b0',
                accent: '#c586c0',
                error: '#f44747'
            }
        });

        this.builtInThemes.set('light', {
            id: 'light',
            name: 'Light Theme',
            type: 'light',
            components: {
                background: '#ffffff',
                foreground: '#333333',
                primary: '#0066cc',
                secondary: '#008080',
                accent: '#8b008b',
                error: '#cd3131'
            }
        });
    }

    private loadCustomThemes(): void {
        const stored = this.context.globalState.get<Theme[]>('customThemes', []);
        stored.forEach(theme => {
            this.customThemes.set(theme.id, theme);
        });
    }

    private async saveCustomThemes(): Promise<void> {
        const themes = Array.from(this.customThemes.values());
        await this.context.globalState.update('customThemes', themes);
    }

    public getCurrentTheme(): Theme {
        const theme = this.builtInThemes.get(this.currentThemeId) || 
                      this.customThemes.get(this.currentThemeId) || 
                      this.getDefaultTheme();
        return theme;
    }

    public getDefaultTheme(): Theme {
        return this.builtInThemes.get('default')!;
    }

    public getAllThemes(): Theme[] {
        const themes: Theme[] = [];
        this.builtInThemes.forEach(theme => themes.push(theme));
        this.customThemes.forEach(theme => themes.push(theme));
        return themes;
    }

    public async setTheme(themeId: string): Promise<void> {
        const theme = this.builtInThemes.get(themeId) || this.customThemes.get(themeId);
        if (!theme) {
            throw new Error(`Theme not found: ${themeId}`);
        }

        this.currentThemeId = themeId;
        await this.saveCurrentThemeId(themeId);
        this._onThemeChanged.fire(theme);
    }

    public async addCustomTheme(theme: Theme): Promise<void> {
        if (this.builtInThemes.has(theme.id)) {
            throw new Error(`Cannot override built-in theme: ${theme.id}`);
        }

        this.customThemes.set(theme.id, theme);
        await this.saveCustomThemes();
        this._onThemeChanged.fire(theme);
    }

    public async updateCustomTheme(themeId: string, updatedTheme: Partial<Theme>): Promise<void> {
        const existing = this.customThemes.get(themeId);
        if (!existing) {
            throw new Error(`Custom theme not found: ${themeId}`);
        }

        const updated = {
            ...existing,
            ...updatedTheme,
            id: themeId // Prevent ID changes
        };

        this.customThemes.set(themeId, updated);
        await this.saveCustomThemes();
        this._onThemeChanged.fire(updated);
    }

    public async deleteCustomTheme(themeId: string): Promise<void> {
        if (!this.customThemes.has(themeId)) {
            throw new Error(`Custom theme not found: ${themeId}`);
        }

        if (this.currentThemeId === themeId) {
            await this.setTheme('default');
        }

        this.customThemes.delete(themeId);
        await this.saveCustomThemes();
    }

    public getColorForComponent(component: ThemeComponent): string {
        const theme = this.getCurrentTheme();
        return theme.components[component];
    }

    public dispose(): void {
        this._onThemeChanged.dispose();
    }
}
