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
exports.initializeThemeManager = initializeThemeManager;
exports.getThemeManager = getThemeManager;
const vscode = __importStar(require("vscode"));
/**
 * Manager for UI themes and customization
 */
class ThemeManager {
    context;
    themes = new Map();
    activeThemeId = 'default';
    customSettings;
    constructor(context) {
        this.context = context;
        // Initialize with default themes
        this.registerDefaultThemes();
        // Load saved theme preference
        this.activeThemeId = context.globalState.get('copilotPPA.activeTheme', 'default');
        // Load custom UI settings
        this.customSettings = context.globalState.get('copilotPPA.uiLayoutOptions', {
            chatInputPosition: 'bottom',
            showTimestamps: true,
            showAvatars: true,
            compactMode: false,
            expandCodeBlocks: true,
            wordWrap: true
        });
        // Watch for VS Code theme changes to update themes if needed
        vscode.window.onDidChangeActiveColorTheme(this.handleVSCodeThemeChange, this);
    }
    /**
     * Get all available themes
     */
    getThemes() {
        return Array.from(this.themes.values());
    }
    /**
     * Get a theme by ID
     */
    getTheme(id) {
        return this.themes.get(id);
    }
    /**
     * Get the active theme
     */
    getActiveTheme() {
        return this.themes.get(this.activeThemeId) || this.themes.get('default');
    }
    /**
     * Set the active theme
     */
    setActiveTheme(id) {
        if (!this.themes.has(id)) {
            return false;
        }
        this.activeThemeId = id;
        this.context.globalState.update('copilotPPA.activeTheme', id);
        this.notifyThemeChange();
        return true;
    }
    /**
     * Register a new theme
     */
    registerTheme(theme) {
        this.themes.set(theme.id, theme);
    }
    /**
     * Create a custom theme based on an existing one
     */
    createCustomTheme(name, baseThemeId, customizations) {
        const baseTheme = this.getTheme(baseThemeId);
        if (!baseTheme) {
            return undefined;
        }
        const id = `custom-${Date.now()}`;
        const newTheme = {
            id,
            name,
            isBuiltIn: false,
            colors: { ...baseTheme.colors },
            font: { ...baseTheme.font }
        };
        // Apply customizations
        for (const [key, value] of Object.entries(customizations)) {
            if (key in newTheme.colors) {
                newTheme.colors[key] = value;
            }
            else if (key in newTheme.font) {
                newTheme.font[key] = value;
            }
        }
        this.registerTheme(newTheme);
        // Save custom themes to storage
        this.saveCustomThemes();
        return newTheme;
    }
    /**
     * Delete a custom theme
     */
    deleteCustomTheme(id) {
        const theme = this.getTheme(id);
        if (!theme || theme.isBuiltIn) {
            return false;
        }
        const success = this.themes.delete(id);
        // If the deleted theme was active, switch to default
        if (success && this.activeThemeId === id) {
            this.setActiveTheme('default');
        }
        // Save updated custom themes
        this.saveCustomThemes();
        return success;
    }
    /**
     * Get the UI layout options
     */
    getUILayoutOptions() {
        return { ...this.customSettings };
    }
    /**
     * Update UI layout options
     */
    updateUILayoutOptions(options) {
        this.customSettings = { ...this.customSettings, ...options };
        this.context.globalState.update('copilotPPA.uiLayoutOptions', this.customSettings);
        this.notifyUIOptionsChange();
        return this.customSettings;
    }
    /**
     * Get CSS variables for the current theme
     */
    getThemeCSS() {
        const theme = this.getActiveTheme();
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
                
                --copilot-font-family: ${theme.font.family};
                --copilot-font-size: ${theme.font.sizeInPixels}px;
                --copilot-line-height: ${theme.font.lineHeight};
                --copilot-font-weight: ${theme.font.weight};
                --copilot-heading-weight: ${theme.font.headingWeight};
            }
        `;
    }
    /**
     * Get CSS for UI layout options
     */
    getUILayoutCSS() {
        const options = this.getUILayoutOptions();
        return `
            .copilot-container {
                flex-direction: ${options.chatInputPosition === 'top' ? 'column-reverse' : 'column'};
            }
            
            .copilot-message {
                padding: ${options.compactMode ? '6px 8px' : '12px 16px'};
                margin: ${options.compactMode ? '4px 0' : '8px 0'};
            }
            
            .copilot-timestamp {
                display: ${options.showTimestamps ? 'block' : 'none'};
            }
            
            .copilot-avatar {
                display: ${options.showAvatars ? 'flex' : 'none'};
            }
            
            .copilot-code-block {
                max-height: ${options.expandCodeBlocks ? 'none' : '200px'};
            }
            
            .copilot-chat-content {
                white-space: ${options.wordWrap ? 'pre-wrap' : 'pre'};
            }
        `;
    }
    /**
     * Register default built-in themes
     */
    registerDefaultThemes() {
        // Default light theme
        this.registerTheme({
            id: 'default',
            name: 'Default Light',
            isBuiltIn: true,
            colors: {
                primary: '#007acc',
                secondary: '#6c757d',
                background: '#ffffff',
                foreground: '#333333',
                agentMessageBackground: '#f1f8ff',
                agentMessageForeground: '#333333',
                userMessageBackground: '#e9ecef',
                userMessageForeground: '#333333',
                systemMessage: '#6c757d',
                error: '#dc3545',
                success: '#28a745',
                border: '#dee2e6'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        });
        // Dark theme
        this.registerTheme({
            id: 'dark',
            name: 'Default Dark',
            isBuiltIn: true,
            colors: {
                primary: '#0098ff',
                secondary: '#abb2bf',
                background: '#282c34',
                foreground: '#abb2bf',
                agentMessageBackground: '#2c313c',
                agentMessageForeground: '#abb2bf',
                userMessageBackground: '#3b4048',
                userMessageForeground: '#abb2bf',
                systemMessage: '#7f848e',
                error: '#e06c75',
                success: '#98c379',
                border: '#3e4452'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        });
        // High Contrast theme
        this.registerTheme({
            id: 'high-contrast',
            name: 'High Contrast',
            isBuiltIn: true,
            colors: {
                primary: '#1aebff',
                secondary: '#ffffff',
                background: '#000000',
                foreground: '#ffffff',
                agentMessageBackground: '#1e1e1e',
                agentMessageForeground: '#ffffff',
                userMessageBackground: '#0e0e0e',
                userMessageForeground: '#ffffff',
                systemMessage: '#d4d4d4',
                error: '#f48771',
                success: '#89d185',
                border: '#6b6b6b'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 16,
                lineHeight: 1.6,
                weight: 500,
                headingWeight: 800,
                useMonospaceForCode: true
            }
        });
        // Load any saved custom themes
        this.loadCustomThemes();
    }
    /**
     * Handle VS Code theme changes
     */
    handleVSCodeThemeChange(colorTheme) {
        // Auto-switch between light and dark themes based on VS Code theme
        if (this.activeThemeId === 'default' || this.activeThemeId === 'dark') {
            const newThemeId = colorTheme.kind === vscode.ColorThemeKind.Light ? 'default' : 'dark';
            if (newThemeId !== this.activeThemeId) {
                this.setActiveTheme(newThemeId);
            }
        }
    }
    /**
     * Notify about theme changes
     */
    notifyThemeChange() {
        vscode.commands.executeCommand('copilotPPA.themeChanged', this.getActiveTheme());
    }
    /**
     * Notify about UI option changes
     */
    notifyUIOptionsChange() {
        vscode.commands.executeCommand('copilotPPA.uiOptionsChanged', this.getUILayoutOptions());
    }
    /**
     * Save custom themes to storage
     */
    saveCustomThemes() {
        const customThemes = Array.from(this.themes.values()).filter(theme => !theme.isBuiltIn);
        this.context.globalState.update('copilotPPA.customThemes', customThemes);
    }
    /**
     * Load custom themes from storage
     */
    loadCustomThemes() {
        const customThemes = this.context.globalState.get('copilotPPA.customThemes', []);
        for (const theme of customThemes) {
            this.registerTheme(theme);
        }
    }
}
exports.ThemeManager = ThemeManager;
// Singleton instance
let themeManager;
/**
 * Initialize the theme manager
 */
function initializeThemeManager(context) {
    themeManager = new ThemeManager(context);
    return themeManager;
}
/**
 * Get the theme manager instance
 */
function getThemeManager() {
    if (!themeManager) {
        throw new Error('Theme Manager not initialized');
    }
    return themeManager;
}
//# sourceMappingURL=themeManager.js.map