import * as vscode from 'vscode';
import { Theme, UILayoutOptions, ThemeEvents } from './interfaces';
import { ThemeService } from './ThemeService';
import { ThemeStorage } from './storage';
import { CSSGenerator } from './cssGenerator';
import { defaultThemes } from './defaultThemes';

/**
 * Theme manager error types
 */
export class ThemeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ThemeError';
    }
}

export class ThemeManager implements vscode.Disposable {
    private readonly themes = new Map<string, Theme>();
    private readonly customThemes = new Map<string, Theme>();
    private activeThemeId: string;
    private readonly themeService: ThemeService;
    private readonly cssGenerator: CSSGenerator;
    private readonly disposables: vscode.Disposable[] = [];

    // Event emitters
    private readonly onThemeChangedEmitter = new vscode.EventEmitter<Theme>();
    private readonly onUIOptionsChangedEmitter = new vscode.EventEmitter<UILayoutOptions>();

    constructor(
        private readonly storage: ThemeStorage
    ) {
        // Initialize default themes
        defaultThemes.forEach((theme, id) => this.themes.set(id, theme));

        // Load saved theme preference and custom themes
        this.activeThemeId = this.storage.getActiveThemeId();
        this.loadCustomThemes();

        // Initialize services
        this.cssGenerator = new CSSGenerator();
        this.themeService = new ThemeService(this.handleVSCodeThemeChange.bind(this));
        this.disposables.push(this.themeService);

        // Set up event cleanup
        this.disposables.push(
            this.onThemeChangedEmitter,
            this.onUIOptionsChangedEmitter
        );
    }

    // Event handlers
    public readonly onThemeChanged = this.onThemeChangedEmitter.event;
    public readonly onUIOptionsChanged = this.onUIOptionsChangedEmitter.event;

    /**
     * Get all available themes
     */
    public getAllThemes(): Theme[] {
        return [...this.themes.values(), ...this.customThemes.values()];
    }

    /**
     * Get a specific theme by ID
     */
    public getTheme(id: string): Theme | undefined {
        return this.themes.get(id) || this.customThemes.get(id);
    }

    /**
     * Get the currently active theme
     */
    public getActiveTheme(): Theme {
        const theme = this.getTheme(this.activeThemeId);
        if (!theme) {
            // Fallback to default if active theme not found
            return this.themes.get('default')!;
        }
        return theme;
    }

    /**
     * Set the active theme
     */
    public async setActiveTheme(id: string): Promise<void> {
        const theme = this.getTheme(id);
        if (!theme) {
            throw new ThemeError(`Theme not found: ${id}`);
        }

        this.activeThemeId = id;
        await this.storage.setActiveThemeId(id);
        this.onThemeChangedEmitter.fire(theme);
    }

    /**
     * Create a new custom theme based on an existing one
     */
    public async createCustomTheme(name: string, baseThemeId: string, customizations: Partial<Theme>): Promise<Theme> {
        const baseTheme = this.getTheme(baseThemeId);
        if (!baseTheme) {
            throw new ThemeError(`Base theme not found: ${baseThemeId}`);
        }

        const id = `custom-${Date.now()}`;
        const newTheme: Theme = {
            id,
            name,
            isBuiltIn: false,
            colors: { ...baseTheme.colors },
            font: { ...baseTheme.font },
            ...customizations
        };

        // Validate theme
        this.validateTheme(newTheme);

        this.customThemes.set(id, newTheme);
        await this.saveCustomThemes();

        return newTheme;
    }

    /**
     * Update an existing custom theme
     */
    public async updateCustomTheme(id: string, updates: Partial<Theme>): Promise<Theme> {
        const existing = this.customThemes.get(id);
        if (!existing) {
            throw new ThemeError(`Custom theme not found: ${id}`);
        }

        const updated: Theme = {
            ...existing,
            ...updates,
            id, // Prevent ID changes
            isBuiltIn: false // Prevent built-in flag changes
        };

        // Validate theme
        this.validateTheme(updated);

        this.customThemes.set(id, updated);
        await this.saveCustomThemes();

        if (this.activeThemeId === id) {
            this.onThemeChangedEmitter.fire(updated);
        }

        return updated;
    }

    /**
     * Delete a custom theme
     */
    public async deleteCustomTheme(id: string): Promise<void> {
        const theme = this.customThemes.get(id);
        if (!theme) {
            throw new ThemeError(`Custom theme not found: ${id}`);
        }

        this.customThemes.delete(id);
        await this.saveCustomThemes();

        // Switch to default theme if the deleted theme was active
        if (this.activeThemeId === id) {
            await this.setActiveTheme('default');
        }
    }

    /**
     * Get the current UI layout options
     */
    public getUILayoutOptions(): UILayoutOptions {
        return this.storage.getUILayoutOptions();
    }

    /**
     * Update UI layout options
     */
    public async updateUILayoutOptions(updates: Partial<UILayoutOptions>): Promise<UILayoutOptions> {
        const current = this.getUILayoutOptions();
        const updated = { ...current, ...updates };

        await this.storage.saveUILayoutOptions(updated);
        this.onUIOptionsChangedEmitter.fire(updated);

        return updated;
    }

    /**
     * Get CSS for the current theme
     */
    public getThemeCSS(): string {
        return this.cssGenerator.generateThemeCSS(this.getActiveTheme());
    }

    /**
     * Get CSS for the current layout options
     */
    public getLayoutCSS(): string {
        return this.cssGenerator.generateLayoutCSS(this.getUILayoutOptions());
    }

    private validateTheme(theme: Theme): void {
        if (!theme.id) {
            throw new ThemeError('Theme must have an ID');
        }
        if (!theme.name) {
            throw new ThemeError('Theme must have a name');
        }
        if (!theme.colors) {
            throw new ThemeError('Theme must have colors defined');
        }
        if (!theme.font) {
            throw new ThemeError('Theme must have font settings defined');
        }
    }

    private loadCustomThemes(): void {
        const customThemes = this.storage.getCustomThemes();
        customThemes.forEach(theme => this.customThemes.set(theme.id, theme));
    }

    private async saveCustomThemes(): Promise<void> {
        await this.storage.saveCustomThemes(Array.from(this.customThemes.values()));
    }

    private handleVSCodeThemeChange(kind: vscode.ColorThemeKind): void {
        // Only auto-switch if using a built-in theme
        if (this.activeThemeId === 'default' || this.activeThemeId === 'dark') {
            const newThemeId = kind === vscode.ColorThemeKind.Light ? 'default' : 'dark';
            if (newThemeId !== this.activeThemeId) {
                this.setActiveTheme(newThemeId).catch(error => {
                    console.error('Failed to switch theme:', error);
                });
            }
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}