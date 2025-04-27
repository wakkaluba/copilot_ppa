"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
var vscode = require("vscode");
var defaults_1 = require("./themes/defaults");
/**
 * Manages themes for the Copilot PPA UI
 */
var ThemeManager = /** @class */ (function () {
    function ThemeManager(context) {
        this.themes = [];
        this.activeThemeId = 'default';
        this.uiLayoutOptions = {
            chatInputPosition: 'bottom',
            showTimestamps: true,
            showAvatars: true,
            compactMode: false,
            expandCodeBlocks: true,
            wordWrap: true
        };
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
    ThemeManager.getInstance = function (context) {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager(context);
        }
        return ThemeManager.instance;
    };
    /**
     * Initialize default built-in themes
     */
    ThemeManager.prototype.initializeDefaultThemes = function () {
        this.themes = __spreadArray([], defaults_1.defaultThemes, true);
    };
    /**
     * Load custom themes from extension storage
     */
    ThemeManager.prototype.loadCustomThemes = function () {
        var _a;
        var customThemes = this.context.globalState.get('copilotPPA.customThemes', []);
        if (customThemes && Array.isArray(customThemes)) {
            (_a = this.themes).push.apply(_a, customThemes);
        }
        // Load active theme
        var savedThemeId = this.context.globalState.get('copilotPPA.activeThemeId', 'default');
        if (this.themes.some(function (t) { return t.id === savedThemeId; })) {
            this.activeThemeId = savedThemeId;
        }
    };
    /**
     * Load UI layout options from extension storage
     */
    ThemeManager.prototype.loadUILayoutOptions = function () {
        var savedOptions = this.context.globalState.get('copilotPPA.uiLayoutOptions');
        if (savedOptions) {
            this.uiLayoutOptions = __assign(__assign({}, this.uiLayoutOptions), savedOptions);
        }
    };
    /**
     * Synchronize theme with VS Code's active color theme
     */
    ThemeManager.prototype.syncWithVSCodeTheme = function () {
        var vscodeTheme = vscode.window.activeColorTheme;
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
    };
    /**
     * Handle VS Code theme change event
     */
    ThemeManager.prototype.handleVSCodeThemeChange = function (colorTheme) {
        this.syncWithVSCodeTheme();
    };
    /**
     * Get all available themes
     */
    ThemeManager.prototype.getThemes = function () {
        return __spreadArray([], this.themes, true);
    };
    /**
     * Get currently active theme
     */
    ThemeManager.prototype.getActiveTheme = function () {
        var _this = this;
        var theme = this.themes.find(function (t) { return t.id === _this.activeThemeId; });
        return theme || this.themes.find(function (t) { return t.id === 'default'; });
    };
    /**
     * Set active theme by id
     */
    ThemeManager.prototype.setActiveTheme = function (themeId) {
        if (!this.themes.some(function (t) { return t.id === themeId; })) {
            return false;
        }
        this.activeThemeId = themeId;
        this.context.globalState.update('copilotPPA.activeThemeId', themeId);
        return true;
    };
    /**
     * Create a custom theme
     */
    ThemeManager.prototype.createCustomTheme = function (name, baseThemeId, customOptions) {
        // Find base theme to extend
        var baseTheme = this.themes.find(function (t) { return t.id === baseThemeId; }) || this.getActiveTheme();
        // Generate unique id
        var id = "custom-".concat(Date.now());
        // Create new theme by extending base theme and applying customizations
        var newTheme = {
            id: id,
            name: name,
            type: baseTheme.type,
            isBuiltIn: false,
            colors: __assign(__assign({}, baseTheme.colors), customOptions),
            font: __assign(__assign({}, baseTheme.font), customOptions)
        };
        // Add to themes list
        this.themes.push(newTheme);
        // Save custom themes
        this.saveCustomThemes();
        return newTheme;
    };
    /**
     * Delete a custom theme
     */
    ThemeManager.prototype.deleteCustomTheme = function (themeId) {
        var themeIndex = this.themes.findIndex(function (t) { return t.id === themeId; });
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
    };
    /**
     * Save custom themes to extension storage
     */
    ThemeManager.prototype.saveCustomThemes = function () {
        var customThemes = this.themes.filter(function (t) { return !t.isBuiltIn; });
        this.context.globalState.update('copilotPPA.customThemes', customThemes);
    };
    /**
     * Get UI layout options
     */
    ThemeManager.prototype.getUILayoutOptions = function () {
        return __assign({}, this.uiLayoutOptions);
    };
    /**
     * Update UI layout options
     */
    ThemeManager.prototype.updateUILayoutOptions = function (options) {
        this.uiLayoutOptions = __assign(__assign({}, this.uiLayoutOptions), options);
        this.context.globalState.update('copilotPPA.uiLayoutOptions', this.uiLayoutOptions);
    };
    /**
     * Generate CSS for the active theme
     */
    ThemeManager.prototype.getThemeCSS = function () {
        var theme = this.getActiveTheme();
        var fontSize = theme.font.sizeInPixels;
        return "\n            :root {\n                --copilot-primary: ".concat(theme.colors.primary, ";\n                --copilot-secondary: ").concat(theme.colors.secondary, ";\n                --copilot-background: ").concat(theme.colors.background, ";\n                --copilot-foreground: ").concat(theme.colors.foreground, ";\n                --copilot-agent-message-bg: ").concat(theme.colors.agentMessageBackground, ";\n                --copilot-agent-message-fg: ").concat(theme.colors.agentMessageForeground, ";\n                --copilot-user-message-bg: ").concat(theme.colors.userMessageBackground, ";\n                --copilot-user-message-fg: ").concat(theme.colors.userMessageForeground, ";\n                --copilot-system-message: ").concat(theme.colors.systemMessage, ";\n                --copilot-error: ").concat(theme.colors.error, ";\n                --copilot-success: ").concat(theme.colors.success, ";\n                --copilot-border: ").concat(theme.colors.border, ";\n                --copilot-button-bg: ").concat(theme.colors.buttonBackground, ";\n                --copilot-button-fg: ").concat(theme.colors.buttonForeground, ";\n                --copilot-button-hover-bg: ").concat(theme.colors.buttonHoverBackground, ";\n                --copilot-input-bg: ").concat(theme.colors.inputBackground, ";\n                --copilot-input-fg: ").concat(theme.colors.inputForeground, ";\n                --copilot-input-border: ").concat(theme.colors.inputBorder, ";\n                \n                --copilot-font-family: ").concat(theme.font.family, ";\n                --copilot-font-size: ").concat(fontSize, "px;\n                --copilot-line-height: ").concat(theme.font.lineHeight, ";\n                --copilot-font-weight: ").concat(theme.font.weight, ";\n                --copilot-heading-weight: ").concat(theme.font.headingWeight, ";\n                --copilot-code-font-family: ").concat(theme.font.useMonospaceForCode ?
            'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace' :
            theme.font.family, ";\n            }\n        ");
    };
    /**
     * Get CSS for UI layout
     */
    ThemeManager.prototype.getUILayoutCSS = function () {
        var options = this.getUILayoutOptions();
        var wordWrap = options.wordWrap ? 'break-word' : 'normal';
        var messageSpacing = options.compactMode ? '0.5rem' : '1rem';
        return "\n            .copilot-container {\n                display: flex;\n                flex-direction: column;\n                height: 100%;\n            }\n            \n            .copilot-messages {\n                flex: 1;\n                overflow-y: auto;\n                padding: 1rem;\n            }\n            \n            .copilot-input-container {\n                order: ".concat(options.chatInputPosition === 'bottom' ? 2 : 0, ";\n                padding: 1rem;\n                border-top: 1px solid var(--copilot-border);\n            }\n            \n            .copilot-message {\n                margin-bottom: ").concat(messageSpacing, ";\n                padding: 0.75rem;\n                border-radius: 0.5rem;\n                word-wrap: ").concat(wordWrap, ";\n            }\n            \n            .copilot-timestamp {\n                display: ").concat(options.showTimestamps ? 'block' : 'none', ";\n                font-size: 0.8rem;\n                color: var(--copilot-system-message);\n                margin-bottom: 0.25rem;\n            }\n            \n            .copilot-avatar {\n                display: ").concat(options.showAvatars ? 'inline-block' : 'none', ";\n                width: 24px;\n                height: 24px;\n                border-radius: 50%;\n                margin-right: 0.5rem;\n            }\n            \n            .copilot-code-block {\n                font-family: var(--copilot-code-font-family);\n                background-color: rgba(0, 0, 0, 0.1);\n                padding: 0.75rem;\n                border-radius: 0.25rem;\n                overflow-x: auto;\n                margin: 0.5rem 0;\n            }\n        ");
    };
    return ThemeManager;
}());
exports.ThemeManager = ThemeManager;
