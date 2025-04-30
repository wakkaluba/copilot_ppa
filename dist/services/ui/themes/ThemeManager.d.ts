import * as vscode from 'vscode';
import { Theme, UILayoutOptions } from './interfaces';
import { ThemeStorage } from './storage';
/**
 * Theme manager error types
 */
export declare class ThemeError extends Error {
    constructor(message: string);
}
export declare class ThemeManager implements vscode.Disposable {
    private readonly storage;
    private readonly themes;
    private readonly customThemes;
    private activeThemeId;
    private readonly themeService;
    private readonly cssGenerator;
    private readonly disposables;
    private readonly onThemeChangedEmitter;
    private readonly onUIOptionsChangedEmitter;
    constructor(storage: ThemeStorage);
    readonly onThemeChanged: vscode.Event<Theme>;
    readonly onUIOptionsChanged: vscode.Event<UILayoutOptions>;
    /**
     * Get all available themes
     */
    getAllThemes(): Theme[];
    /**
     * Get a specific theme by ID
     */
    getTheme(id: string): Theme | undefined;
    /**
     * Get the currently active theme
     */
    getActiveTheme(): Theme;
    /**
     * Set the active theme
     */
    setActiveTheme(id: string): Promise<void>;
    /**
     * Create a new custom theme based on an existing one
     */
    createCustomTheme(name: string, baseThemeId: string, customizations: Partial<Theme>): Promise<Theme>;
    /**
     * Update an existing custom theme
     */
    updateCustomTheme(id: string, updates: Partial<Theme>): Promise<Theme>;
    /**
     * Delete a custom theme
     */
    deleteCustomTheme(id: string): Promise<void>;
    /**
     * Get the current UI layout options
     */
    getUILayoutOptions(): UILayoutOptions;
    /**
     * Update UI layout options
     */
    updateUILayoutOptions(updates: Partial<UILayoutOptions>): Promise<UILayoutOptions>;
    /**
     * Get CSS for the current theme
     */
    getThemeCSS(): string;
    /**
     * Get CSS for the current layout options
     */
    getLayoutCSS(): string;
    private validateTheme;
    private loadCustomThemes;
    private saveCustomThemes;
    private handleVSCodeThemeChange;
    dispose(): void;
}
