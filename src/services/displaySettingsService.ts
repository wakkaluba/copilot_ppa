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

export class DisplaySettingsService extends EventEmitter implements vscode.Disposable {
    private settings: DisplaySettings;
    private readonly themeManager: ThemeManager;
    private readonly context: vscode.ExtensionContext;
    private readonly disposables: vscode.Disposable[] = [];
    
    constructor(themeManager: ThemeManager, context: vscode.ExtensionContext) {
        super();
        this.themeManager = themeManager;
        this.context = context;
        
        // Initialize with default settings
        this.settings = this.getDefaultSettings();
        
        // Load settings from configuration
        this.loadSettings();
        
        // Listen for configuration changes
        const configDisposable = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.display')) {
                this.loadSettings();
            }
        });
        
        // Listen for theme changes to update code block theme
        themeManager.on('themeChanged', () => {
            this.updateCodeBlockThemeForCurrentTheme();
        });
        
        this.disposables.push(configDisposable);
    }
    
    /**
     * Get current display settings
     */
    getSettings(): DisplaySettings {
        return { ...this.settings };
    }
    
    /**
     * Update display settings
     * @param updates Partial settings to update
     */
    updateSettings(updates: Partial<DisplaySettings>): void {
        const oldSettings = { ...this.settings };
        
        // Update in-memory settings
        this.settings = {
            ...this.settings,
            ...updates
        };
        
        // Save to configuration
        const config = vscode.workspace.getConfiguration('copilot-ppa.display');
        
        // Only update changed settings
        for (const [key, value] of Object.entries(updates)) {
            if (oldSettings[key as keyof DisplaySettings] !== value) {
                config.update(key, value, vscode.ConfigurationTarget.Global);
            }
        }
        
        this.emit('settingsChanged', this.settings, updates);
    }
    
    /**
     * Reset display settings to default
     */
    resetToDefault(): void {
        const defaultSettings = this.getDefaultSettings();
        this.updateSettings(defaultSettings);
    }
    
    /**
     * Get default display settings
     */
    private getDefaultSettings(): DisplaySettings {
        return {
            fontSize: 13,
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1.5,
            showLineNumbers: true,
            wordWrap: true,
            showCompletionTimes: true,
            showTokenCounts: true,
            showPromptTemplates: false,
            codeBlockTheme: 'vs-dark',
            messageSpacing: 12,
            compactMode: false,
            showAvatars: true,
            timestampFormat: 'time'
        };
    }
    
    /**
     * Load settings from VS Code configuration
     */
    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('copilot-ppa.display');
        const defaultSettings = this.getDefaultSettings();
        
        // Read each setting, falling back to defaults
        this.settings = {
            fontSize: config.get('fontSize', defaultSettings.fontSize),
            fontFamily: config.get('fontFamily', defaultSettings.fontFamily),
            lineHeight: config.get('lineHeight', defaultSettings.lineHeight),
            showLineNumbers: config.get('showLineNumbers', defaultSettings.showLineNumbers),
            wordWrap: config.get('wordWrap', defaultSettings.wordWrap),
            showCompletionTimes: config.get('showCompletionTimes', defaultSettings.showCompletionTimes),
            showTokenCounts: config.get('showTokenCounts', defaultSettings.showTokenCounts),
            showPromptTemplates: config.get('showPromptTemplates', defaultSettings.showPromptTemplates),
            codeBlockTheme: config.get('codeBlockTheme', defaultSettings.codeBlockTheme),
            messageSpacing: config.get('messageSpacing', defaultSettings.messageSpacing),
            compactMode: config.get('compactMode', defaultSettings.compactMode),
            showAvatars: config.get('showAvatars', defaultSettings.showAvatars),
            timestampFormat: config.get('timestampFormat', defaultSettings.timestampFormat) as 'none' | 'time' | 'date' | 'datetime',
        };
        
        // Update code block theme based on VS Code theme if set to auto
        if (this.settings.codeBlockTheme === 'auto') {
            this.updateCodeBlockThemeForCurrentTheme();
        }
        
        this.emit('settingsLoaded', this.settings);
    }
    
    /**
     * Update code block theme based on current VS Code theme
     */
    private updateCodeBlockThemeForCurrentTheme(): void {
        if (this.settings.codeBlockTheme !== 'auto') {
            return;
        }
        
        const isDark = this.themeManager.isDarkTheme();
        this.settings.codeBlockTheme = isDark ? 'vs-dark' : 'vs';
        
        this.emit('codeBlockThemeChanged', this.settings.codeBlockTheme);
    }
    
    /**
     * Generate CSS for the current display settings
     */
    generateCSS(): string {
        const {
            fontSize,
            fontFamily,
            lineHeight,
            messageSpacing,
            compactMode
        } = this.settings;
        
        return `
            :root {
                --ppa-font-size: ${fontSize}px;
                --ppa-font-family: ${fontFamily};
                --ppa-line-height: ${lineHeight};
                --ppa-message-spacing: ${messageSpacing}px;
                --ppa-compact-mode: ${compactMode ? '1' : '0'};
            }
        `;
    }
    
    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.removeAllListeners();
    }
}
