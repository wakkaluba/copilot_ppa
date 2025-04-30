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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
const vscode = __importStar(require("vscode"));
const defaults_1 = require("./themes/defaults");
/**
 * Manages themes for the Copilot PPA UI
 */
class ThemeManager {
    static instance;
    themes = [];
    activeThemeId = 'default';
    context;
    uiLayoutOptions = {
        chatInputPosition: 'bottom',
        showTimestamps: true,
        showAvatars: true,
        compactMode: false,
        expandCodeBlocks: true,
        wordWrap: true
    };
    constructor(context) {
        this.context = context;
        this.initializeDefaultThemes();
        this.loadCustomThemes();
        this.loadUILayoutOptions();
        // Register event listener for VS Code theme changes
        vscode.window.onDidChangeActiveColorTheme(this.handleVSCodeThemeChange.bind(this));
        // Set initial active theme based on VS Code theme
        this.syncWithVSCodeTheme();
    }
    /**
     * Get the singleton instance of ThemeManager
     */
    static getInstance(context) {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager(context);
        }
        return ThemeManager.instance;
    }
    /**
     * Initialize default built-in themes
     */
    initializeDefaultThemes() {
        this.themes = [...defaults_1.defaultThemes];
    }
    /**
     * Load custom themes from extension storage
     */
    loadCustomThemes() {
        const customThemes = this.context.globalState.get('copilotPPA.customThemes', []);
        if (customThemes && Array.isArray(customThemes)) {
            this.themes.push(...customThemes);
        }
        // Load active theme
        const savedThemeId = this.context.globalState.get('copilotPPA.activeThemeId', 'default');
        if (this.themes.some(t => t.id === savedThemeId)) {
            this.activeThemeId = savedThemeId;
        }
    }
    /**
     * Load UI layout options from extension storage
     */
    loadUILayoutOptions() {
        const savedOptions = this.context.globalState.get('copilotPPA.uiLayoutOptions');
        if (savedOptions) {
            this.uiLayoutOptions = { ...this.uiLayoutOptions, ...savedOptions };
        }
    }
    /**
     * Synchronize theme with VS Code's active color theme
     */
    syncWithVSCodeTheme() {
        const vscodeTheme = vscode.window.activeColorTheme;
        // If VS Code theme is dark, use dark theme
        if (vscodeTheme.kind === vscode.ColorThemeKind.Dark) {
            this.setActiveTheme('dark');
        }
        // If VS Code theme is high contrast, use high contrast theme
        else if (vscodeTheme.kind === vscode.ColorThemeKind.HighContrast) {
            this.setActiveTheme('high-contrast');
        }
        // Otherwise use the default (light) theme
        else {
            this.setActiveTheme('default');
        }
    }
    /**
     * Handle VS Code theme change event
     */
    handleVSCodeThemeChange(colorTheme) {
        this.syncWithVSCodeTheme();
    }
    /**
     * Get all available themes
     */
    getThemes() {
        return [...this.themes];
    }
    /**
     * Get currently active theme
     */
    getActiveTheme() {
        const theme = this.themes.find(t => t.id === this.activeThemeId);
        return theme || this.themes.find(t => t.id === 'default');
    }
    /**
     * Set active theme by id
     */
    setActiveTheme(themeId) {
        if (!this.themes.some(t => t.id === themeId)) {
            return false;
        }
        this.activeThemeId = themeId;
        this.context.globalState.update('copilotPPA.activeThemeId', themeId);
        return true;
    }
    /**
     * Create a custom theme
     */
    createCustomTheme(name, baseThemeId, customOptions) {
        // Find base theme to extend
        const baseTheme = this.themes.find(t => t.id === baseThemeId) || this.getActiveTheme();
        // Generate unique id
        const id = `custom-${Date.now()}`;
        // Create new theme by extending base theme and applying customizations
        const newTheme = {
            id,
            name,
            type: baseTheme.type,
            isBuiltIn: false,
            colors: {
                ...baseTheme.colors,
                ...customOptions
            },
            font: {
                ...baseTheme.font,
                ...customOptions
            }
        };
        // Add to themes list
        this.themes.push(newTheme);
        // Save custom themes
        this.saveCustomThemes();
        return newTheme;
    }
    /**
     * Delete a custom theme
     */
    deleteCustomTheme(themeId) {
        const themeIndex = this.themes.findIndex(t => t.id === themeId);
        if (themeIndex < 0 || this.themes[themeIndex].isBuiltIn) {
            return false;
        }
        // Remove theme
        this.themes.splice(themeIndex, 1);
        // If the deleted theme was active, switch to default
        if (this.activeThemeId === themeId) {
            this.activeThemeId = 'default';
            this.context.globalState.update('copilotPPA.activeThemeId', 'default');
        }
        // Save updated themes list
        this.saveCustomThemes();
        return true;
    }
    /**
     * Save custom themes to extension storage
     */
    saveCustomThemes() {
        const customThemes = this.themes.filter(t => !t.isBuiltIn);
        this.context.globalState.update('copilotPPA.customThemes', customThemes);
    }
    /**
     * Get UI layout options
     */
    getUILayoutOptions() {
        return { ...this.uiLayoutOptions };
    }
    /**
     * Update UI layout options
     */
    updateUILayoutOptions(options) {
        this.uiLayoutOptions = { ...this.uiLayoutOptions, ...options };
        this.context.globalState.update('copilotPPA.uiLayoutOptions', this.uiLayoutOptions);
    }
    /**
     * Generate CSS for the active theme
     */
    getThemeCSS() {
        const theme = this.getActiveTheme();
        const fontSize = theme.font.sizeInPixels;
        return `
            :root {
                --copilot-primary: ${theme.colors.primary};
                --copilot-secondary: ${theme.colors.secondary};
                --copilot-background: ${theme.colors.background};
                --copilot-foreground: ${theme.colors.foreground};
                --copilot-agent-message-bg: ${theme.colors.agentMessageBackground};
                --copilot-agent-message-fg: ${theme.colors.agentMessageForeground};
                --copilot-user-message-bg: ${theme.colors.userMessageBackground};
                --copilot-user-message-fg: ${theme.colors.userMessageForeground};
                --copilot-system-message: ${theme.colors.systemMessage};
                --copilot-error: ${theme.colors.error};
                --copilot-success: ${theme.colors.success};
                --copilot-border: ${theme.colors.border};
                --copilot-button-bg: ${theme.colors.buttonBackground};
                --copilot-button-fg: ${theme.colors.buttonForeground};
                --copilot-button-hover-bg: ${theme.colors.buttonHoverBackground};
                --copilot-input-bg: ${theme.colors.inputBackground};
                --copilot-input-fg: ${theme.colors.inputForeground};
                --copilot-input-border: ${theme.colors.inputBorder};
                
                --copilot-font-family: ${theme.font.family};
                --copilot-font-size: ${fontSize}px;
                --copilot-line-height: ${theme.font.lineHeight};
                --copilot-font-weight: ${theme.font.weight};
                --copilot-heading-weight: ${theme.font.headingWeight};
                --copilot-code-font-family: ${theme.font.useMonospaceForCode ?
            'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace' :
            theme.font.family};
            }
        `;
    }
    /**
     * Get CSS for UI layout
     */
    getUILayoutCSS() {
        const options = this.getUILayoutOptions();
        const wordWrap = options.wordWrap ? 'break-word' : 'normal';
        const messageSpacing = options.compactMode ? '0.5rem' : '1rem';
        return `
            .copilot-container {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            
            .copilot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }
            
            .copilot-input-container {
                order: ${options.chatInputPosition === 'bottom' ? 2 : 0};
                padding: 1rem;
                border-top: 1px solid var(--copilot-border);
            }
            
            .copilot-message {
                margin-bottom: ${messageSpacing};
                padding: 0.75rem;
                border-radius: 0.5rem;
                word-wrap: ${wordWrap};
            }
            
            .copilot-timestamp {
                display: ${options.showTimestamps ? 'block' : 'none'};
                font-size: 0.8rem;
                color: var(--copilot-system-message);
                margin-bottom: 0.25rem;
            }
            
            .copilot-avatar {
                display: ${options.showAvatars ? 'inline-block' : 'none'};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                margin-right: 0.5rem;
            }
            
            .copilot-code-block {
                font-family: var(--copilot-code-font-family);
                background-color: rgba(0, 0, 0, 0.1);
                padding: 0.75rem;
                border-radius: 0.25rem;
                overflow-x: auto;
                margin: 0.5rem 0;
            }
        `;
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map