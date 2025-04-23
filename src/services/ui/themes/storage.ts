import * as vscode from 'vscode';
import { Theme, UILayoutOptions } from './interfaces';

/**
 * Storage keys for theme-related data
 */
const enum StorageKeys {
    ActiveTheme = 'copilotPPA.activeTheme',
    CustomThemes = 'copilotPPA.customThemes',
    UILayoutOptions = 'copilotPPA.uiLayoutOptions'
}

/**
 * Handles persistence of themes and UI layout options
 */
export class ThemeStorage {
    constructor(private readonly storage: vscode.ExtensionContext['globalState']) {}

    /**
     * Get the ID of the active theme
     */
    getActiveThemeId(): string {
        return this.storage.get<string>(StorageKeys.ActiveTheme, 'default');
    }

    /**
     * Save the ID of the active theme
     */
    async setActiveThemeId(id: string): Promise<void> {
        await this.storage.update(StorageKeys.ActiveTheme, id);
    }

    /**
     * Get all saved custom themes
     */
    getCustomThemes(): Theme[] {
        return this.storage.get<Theme[]>(StorageKeys.CustomThemes, []);
    }

    /**
     * Save custom themes
     */
    async saveCustomThemes(themes: Theme[]): Promise<void> {
        await this.storage.update(StorageKeys.CustomThemes, themes);
    }

    /**
     * Get UI layout options
     */
    getUILayoutOptions(): UILayoutOptions {
        return this.storage.get<UILayoutOptions>(StorageKeys.UILayoutOptions, {
            chatInputPosition: 'bottom',
            showTimestamps: true,
            showAvatars: true,
            compactMode: false,
            expandCodeBlocks: true,
            wordWrap: true
        });
    }

    /**
     * Save UI layout options
     */
    async saveUILayoutOptions(options: UILayoutOptions): Promise<void> {
        await this.storage.update(StorageKeys.UILayoutOptions, options);
    }
}