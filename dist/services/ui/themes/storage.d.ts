import * as vscode from 'vscode';
import { Theme, UILayoutOptions } from './interfaces';
/**
 * Handles persistence of themes and UI layout options
 */
export declare class ThemeStorage {
    private readonly storage;
    constructor(storage: vscode.ExtensionContext['globalState']);
    /**
     * Get the ID of the active theme
     */
    getActiveThemeId(): string;
    /**
     * Save the ID of the active theme
     */
    setActiveThemeId(id: string): Promise<void>;
    /**
     * Get all saved custom themes
     */
    getCustomThemes(): Theme[];
    /**
     * Save custom themes
     */
    saveCustomThemes(themes: Theme[]): Promise<void>;
    /**
     * Get UI layout options
     */
    getUILayoutOptions(): UILayoutOptions;
    /**
     * Save UI layout options
     */
    saveUILayoutOptions(options: UILayoutOptions): Promise<void>;
}
