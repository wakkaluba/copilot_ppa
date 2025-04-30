import * as vscode from 'vscode';
import { Theme, ThemeColors, FontSettings, UILayoutOptions } from './interfaces';
/**
 * Manages themes for the Copilot PPA UI
 */
export declare class ThemeManager {
    private static instance;
    private themes;
    private activeThemeId;
    private context;
    private uiLayoutOptions;
    private constructor();
    /**
     * Get the singleton instance of ThemeManager
     */
    static getInstance(context: vscode.ExtensionContext): ThemeManager;
    /**
     * Initialize default built-in themes
     */
    private initializeDefaultThemes;
    /**
     * Load custom themes from extension storage
     */
    private loadCustomThemes;
    /**
     * Load UI layout options from extension storage
     */
    private loadUILayoutOptions;
    /**
     * Synchronize theme with VS Code's active color theme
     */
    private syncWithVSCodeTheme;
    /**
     * Handle VS Code theme change event
     */
    private handleVSCodeThemeChange;
    /**
     * Get all available themes
     */
    getThemes(): Theme[];
    /**
     * Get currently active theme
     */
    getActiveTheme(): Theme;
    /**
     * Set active theme by id
     */
    setActiveTheme(themeId: string): boolean;
    /**
     * Create a custom theme
     */
    createCustomTheme(name: string, baseThemeId: string, customOptions: Partial<ThemeColors & FontSettings>): Theme;
    /**
     * Delete a custom theme
     */
    deleteCustomTheme(themeId: string): boolean;
    /**
     * Save custom themes to extension storage
     */
    private saveCustomThemes;
    /**
     * Get UI layout options
     */
    getUILayoutOptions(): UILayoutOptions;
    /**
     * Update UI layout options
     */
    updateUILayoutOptions(options: Partial<UILayoutOptions>): void;
    /**
     * Generate CSS for the active theme
     */
    getThemeCSS(): string;
    /**
     * Get CSS for UI layout
     */
    getUILayoutCSS(): string;
}
export { Theme, ThemeColors, FontSettings, UILayoutOptions };
