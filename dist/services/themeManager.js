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
class ThemeManager {
    context;
    static instance;
    currentThemeId;
    builtInThemes = new Map();
    customThemes = new Map();
    _onThemeChanged = new vscode.EventEmitter();
    onThemeChanged = this._onThemeChanged.event;
    constructor(context) {
        this.context = context;
        this.currentThemeId = this.getConfiguredThemeId();
        this.initializeBuiltInThemes();
        this.loadCustomThemes();
        // Listen for VS Code theme changes
        vscode.window.onDidChangeActiveColorTheme(() => {
            // Update theme colors that depend on VS Code's theme
            this._onThemeChanged.fire(this.getCurrentTheme());
        });
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.theme')) {
                const newThemeId = this.getConfiguredThemeId();
                if (newThemeId !== this.currentThemeId) {
                    this.currentThemeId = newThemeId;
                    this._onThemeChanged.fire(this.getCurrentTheme());
                }
            }
        });
    }
    static getInstance(context) {
        if (!ThemeManager.instance) {
            if (!context) {
                throw new Error('Context is required when first initializing ThemeManager');
            }
            ThemeManager.instance = new ThemeManager(context);
        }
        return ThemeManager.instance;
    }
    getCurrentTheme() {
        const theme = this.builtInThemes.get(this.currentThemeId) ||
            this.customThemes.get(this.currentThemeId) ||
            this.getDefaultTheme();
        return theme;
    }
    getAllThemes() {
        const themes = [];
        this.builtInThemes.forEach(theme => themes.push(theme));
        this.customThemes.forEach(theme => themes.push(theme));
        return themes;
    }
    async setTheme(themeId) {
        if (!this.builtInThemes.has(themeId) && !this.customThemes.has(themeId)) {
            throw new Error(`Theme with ID ${themeId} not found`);
        }
        this.currentThemeId = themeId;
        // Save to configuration
        await vscode.workspace.getConfiguration('copilot-ppa').update('theme.selected', themeId, vscode.ConfigurationTarget.Global);
        this._onThemeChanged.fire(this.getCurrentTheme());
    }
    async addCustomTheme(theme) {
        if (this.builtInThemes.has(theme.id)) {
            throw new Error(`Cannot add custom theme with reserved ID: ${theme.id}`);
        }
        this.customThemes.set(theme.id, theme);
        await this.saveCustomThemes();
        // Don't automatically switch to the new theme
    }
    async updateCustomTheme(themeId, updatedTheme) {
        if (!this.customThemes.has(themeId)) {
            throw new Error(`Custom theme with ID ${themeId} not found`);
        }
        const existingTheme = this.customThemes.get(themeId);
        const mergedTheme = {
            ...existingTheme,
            ...updatedTheme,
            colors: {
                ...existingTheme.colors,
                ...(updatedTheme.colors || {})
            }
        };
        this.customThemes.set(themeId, mergedTheme);
        await this.saveCustomThemes();
        // Update current theme if it's the one being edited
        if (this.currentThemeId === themeId) {
            this._onThemeChanged.fire(mergedTheme);
        }
    }
    async deleteCustomTheme(themeId) {
        if (!this.customThemes.has(themeId)) {
            throw new Error(`Custom theme with ID ${themeId} not found`);
        }
        // If the current theme is being deleted, switch to default
        if (this.currentThemeId === themeId) {
            this.currentThemeId = 'default';
            await vscode.workspace.getConfiguration('copilot-ppa').update('theme.selected', 'default', vscode.ConfigurationTarget.Global);
            this._onThemeChanged.fire(this.getDefaultTheme());
        }
        this.customThemes.delete(themeId);
        await this.saveCustomThemes();
    }
    getThemeCss(theme) {
        return `
            :root {
                --copilot-ppa-background: ${theme.colors.background};
                --copilot-ppa-foreground: ${theme.colors.foreground};
                --copilot-ppa-primary-background: ${theme.colors.primaryBackground};
                --copilot-ppa-primary-foreground: ${theme.colors.primaryForeground};
                --copilot-ppa-secondary-background: ${theme.colors.secondaryBackground};
                --copilot-ppa-secondary-foreground: ${theme.colors.secondaryForeground};
                --copilot-ppa-accent-background: ${theme.colors.accentBackground};
                --copilot-ppa-accent-foreground: ${theme.colors.accentForeground};
                --copilot-ppa-border-color: ${theme.colors.borderColor};
                --copilot-ppa-error-color: ${theme.colors.errorColor};
                --copilot-ppa-warning-color: ${theme.colors.warningColor};
                --copilot-ppa-success-color: ${theme.colors.successColor};
                --copilot-ppa-link-color: ${theme.colors.linkColor};
                --copilot-ppa-user-message-background: ${theme.colors.userMessageBackground};
                --copilot-ppa-user-message-foreground: ${theme.colors.userMessageForeground};
                --copilot-ppa-assistant-message-background: ${theme.colors.assistantMessageBackground};
                --copilot-ppa-assistant-message-foreground: ${theme.colors.assistantMessageForeground};
                --copilot-ppa-system-message-background: ${theme.colors.systemMessageBackground};
                --copilot-ppa-system-message-foreground: ${theme.colors.systemMessageForeground};
                --copilot-ppa-code-block-background: ${theme.colors.codeBlockBackground};
                --copilot-ppa-code-block-foreground: ${theme.colors.codeBlockForeground};
            }
        `;
    }
    getConfiguredThemeId() {
        return vscode.workspace.getConfiguration('copilot-ppa').get('theme.selected', 'default');
    }
    initializeBuiltInThemes() {
        // Default theme that follows VS Code's colors
        const vsCodeTheme = this.createVSCodeTheme();
        this.builtInThemes.set('default', vsCodeTheme);
        // Dark theme
        this.builtInThemes.set('dark', {
            id: 'dark',
            name: 'Dark Theme',
            type: 'dark',
            colors: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                primaryBackground: '#252526',
                primaryForeground: '#ffffff',
                secondaryBackground: '#2d2d2d',
                secondaryForeground: '#cccccc',
                accentBackground: '#0e639c',
                accentForeground: '#ffffff',
                borderColor: '#474747',
                errorColor: '#f48771',
                warningColor: '#cca700',
                successColor: '#89d185',
                linkColor: '#3794ff',
                userMessageBackground: '#252526',
                userMessageForeground: '#cccccc',
                assistantMessageBackground: '#2d2d30',
                assistantMessageForeground: '#cccccc',
                systemMessageBackground: '#3d3d3d',
                systemMessageForeground: '#cccccc',
                codeBlockBackground: '#1e1e1e',
                codeBlockForeground: '#d4d4d4',
            }
        });
        // Light theme
        this.builtInThemes.set('light', {
            id: 'light',
            name: 'Light Theme',
            type: 'light',
            colors: {
                background: '#f3f3f3',
                foreground: '#333333',
                primaryBackground: '#ffffff',
                primaryForeground: '#333333',
                secondaryBackground: '#e7e7e7',
                secondaryForeground: '#333333',
                accentBackground: '#007acc',
                accentForeground: '#ffffff',
                borderColor: '#c8c8c8',
                errorColor: '#e51400',
                warningColor: '#bf8803',
                successColor: '#008000',
                linkColor: '#006ab1',
                userMessageBackground: '#f5f5f5',
                userMessageForeground: '#333333',
                assistantMessageBackground: '#e6f3fb',
                assistantMessageForeground: '#333333',
                systemMessageBackground: '#e8e8e8',
                systemMessageForeground: '#333333',
                codeBlockBackground: '#f5f5f5',
                codeBlockForeground: '#333333',
            }
        });
        // High contrast theme
        this.builtInThemes.set('high-contrast', {
            id: 'high-contrast',
            name: 'High Contrast',
            type: 'high-contrast',
            colors: {
                background: '#000000',
                foreground: '#ffffff',
                primaryBackground: '#000000',
                primaryForeground: '#ffffff',
                secondaryBackground: '#0a0a0a',
                secondaryForeground: '#ffffff',
                accentBackground: '#1aebff',
                accentForeground: '#000000',
                borderColor: '#6fc3df',
                errorColor: '#f48771',
                warningColor: '#ffff00',
                successColor: '#89d185',
                linkColor: '#3794ff',
                userMessageBackground: '#000000',
                userMessageForeground: '#ffffff',
                assistantMessageBackground: '#0a0a0a',
                assistantMessageForeground: '#ffffff',
                systemMessageBackground: '#3d3d3d',
                systemMessageForeground: '#ffffff',
                codeBlockBackground: '#0a0a0a',
                codeBlockForeground: '#ffffff',
            }
        });
    }
    createVSCodeTheme() {
        // Get VS Code colors to create a theme that matches the current UI
        const colorTheme = vscode.window.activeColorTheme;
        const isDark = colorTheme.kind === vscode.ColorThemeKind.Dark || colorTheme.kind === vscode.ColorThemeKind.HighContrast;
        const getColor = (key, fallback) => {
            const color = new vscode.ThemeColor(key);
            try {
                // This would need a custom implementation since we can't directly access the color values
                // Here we're just using fallbacks
                return fallback;
            }
            catch (error) {
                return fallback;
            }
        };
        return {
            id: 'default',
            name: 'VS Code Theme',
            type: isDark ? 'dark' : 'light',
            colors: {
                background: getColor('editor.background', isDark ? '#1e1e1e' : '#ffffff'),
                foreground: getColor('editor.foreground', isDark ? '#d4d4d4' : '#333333'),
                primaryBackground: getColor('activityBar.background', isDark ? '#252526' : '#f5f5f5'),
                primaryForeground: getColor('activityBar.foreground', isDark ? '#ffffff' : '#333333'),
                secondaryBackground: getColor('sideBar.background', isDark ? '#2d2d2d' : '#f3f3f3'),
                secondaryForeground: getColor('sideBar.foreground', isDark ? '#cccccc' : '#333333'),
                accentBackground: getColor('button.background', isDark ? '#0e639c' : '#007acc'),
                accentForeground: getColor('button.foreground', isDark ? '#ffffff' : '#ffffff'),
                borderColor: getColor('widget.border', isDark ? '#474747' : '#c8c8c8'),
                errorColor: getColor('errorForeground', isDark ? '#f48771' : '#e51400'),
                warningColor: getColor('editorWarning.foreground', isDark ? '#cca700' : '#bf8803'),
                successColor: getColor('editorInfo.foreground', isDark ? '#89d185' : '#008000'),
                linkColor: getColor('textLink.foreground', isDark ? '#3794ff' : '#006ab1'),
                userMessageBackground: getColor('editor.background', isDark ? '#252526' : '#f5f5f5'),
                userMessageForeground: getColor('editor.foreground', isDark ? '#cccccc' : '#333333'),
                assistantMessageBackground: getColor('list.activeSelectionBackground', isDark ? '#2d2d30' : '#e6f3fb'),
                assistantMessageForeground: getColor('list.activeSelectionForeground', isDark ? '#cccccc' : '#333333'),
                systemMessageBackground: getColor('list.warningForeground', isDark ? '#3d3d3d' : '#e8e8e8'),
                systemMessageForeground: getColor('list.warningForeground', isDark ? '#cccccc' : '#333333'),
                codeBlockBackground: getColor('textCodeBlock.background', isDark ? '#1e1e1e' : '#f5f5f5'),
                codeBlockForeground: getColor('textCodeBlock.foreground', isDark ? '#d4d4d4' : '#333333'),
            }
        };
    }
    getDefaultTheme() {
        return this.builtInThemes.get('default');
    }
    async loadCustomThemes() {
        const customThemesData = this.context.globalState.get('custom-themes', []);
        customThemesData.forEach(theme => {
            this.customThemes.set(theme.id, theme);
        });
    }
    async saveCustomThemes() {
        const customThemesData = Array.from(this.customThemes.values());
        await this.context.globalState.update('custom-themes', customThemesData);
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map