import * as vscode from 'vscode';
import { EventEmitter } from 'events';
export interface Theme {
    id: string;
    name: string;
    type: 'light' | 'dark' | 'high-contrast';
    colors: Record<string, string>;
    iconTheme?: string;
}
export declare class ThemeManager extends EventEmitter implements vscode.Disposable {
    private currentTheme?;
    private customThemes;
    private disposables;
    private context;
    constructor(context: vscode.ExtensionContext);
    /**
     * Get the current VS Code theme
     */
    getCurrentTheme(): Theme | undefined;
    /**
     * Get a specific theme by ID
     */
    getTheme(id: string): Theme | undefined;
    /**
     * Get all available themes
     */
    getAllThemes(): Theme[];
    /**
     * Register a custom theme
     */
    registerTheme(theme: Theme): boolean;
    /**
     * Update a custom theme
     */
    updateTheme(id: string, updates: Partial<Theme>): boolean;
    /**
     * Remove a custom theme
     */
    removeTheme(id: string): boolean;
    /**
     * Get a specific color from the current theme
     */
    getColor(colorName: string): string | undefined;
    /**
     * Get the type of the current theme
     */
    getThemeType(): 'light' | 'dark' | 'high-contrast' | undefined;
    /**
     * Check if the current theme is a dark theme
     */
    isDarkTheme(): boolean;
    /**
     * Detect the current VS Code theme
     */
    private detectCurrentTheme;
    /**
     * Extract colors from current VS Code theme
     */
    private extractThemeColors;
    /**
     * Load custom themes from storage
     */
    private loadCustomThemes;
    /**
     * Save custom themes to storage
     */
    private saveCustomThemes;
    dispose(): void;
}
