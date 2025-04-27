"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplaySettingsService = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class DisplaySettingsService extends events_1.EventEmitter {
    constructor(themeManager, context) {
        super();
        this.disposables = [];
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
    getSettings() {
        return { ...this.settings };
    }
    /**
     * Update display settings
     * @param updates Partial settings to update
     */
    updateSettings(updates) {
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
            if (oldSettings[key] !== value) {
                config.update(key, value, vscode.ConfigurationTarget.Global);
            }
        }
        this.emit('settingsChanged', this.settings, updates);
    }
    /**
     * Reset display settings to default
     */
    resetToDefault() {
        const defaultSettings = this.getDefaultSettings();
        this.updateSettings(defaultSettings);
    }
    /**
     * Get default display settings
     */
    getDefaultSettings() {
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
    loadSettings() {
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
            timestampFormat: config.get('timestampFormat', defaultSettings.timestampFormat),
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
    updateCodeBlockThemeForCurrentTheme() {
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
    generateCSS() {
        const { fontSize, fontFamily, lineHeight, messageSpacing, compactMode } = this.settings;
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
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.removeAllListeners();
    }
}
exports.DisplaySettingsService = DisplaySettingsService;
//# sourceMappingURL=displaySettingsService.js.map