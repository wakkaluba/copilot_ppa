import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ThemeManager } from './themeManager';
export interface DisplaySettings {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    showLineNumbers: boolean;
    wordWrap: boolean;
    showCompletionTimes: boolean;
    showTokenCounts: boolean;
    showPromptTemplates: boolean;
    codeBlockTheme: string;
    messageSpacing: number;
    compactMode: boolean;
    showAvatars: boolean;
    timestampFormat: 'none' | 'time' | 'date' | 'datetime';
}
export declare class DisplaySettingsService extends EventEmitter implements vscode.Disposable {
    private settings;
    private readonly themeManager;
    private readonly context;
    private readonly disposables;
    constructor(themeManager: ThemeManager, context: vscode.ExtensionContext);
    /**
     * Get current display settings
     */
    getSettings(): DisplaySettings;
    /**
     * Update display settings
     * @param updates Partial settings to update
     */
    updateSettings(updates: Partial<DisplaySettings>): void;
    /**
     * Reset display settings to default
     */
    resetToDefault(): void;
    /**
     * Get default display settings
     */
    private getDefaultSettings;
    /**
     * Load settings from VS Code configuration
     */
    private loadSettings;
    /**
     * Update code block theme based on current VS Code theme
     */
    private updateCodeBlockThemeForCurrentTheme;
    /**
     * Generate CSS for the current display settings
     */
    generateCSS(): string;
    dispose(): void;
}
