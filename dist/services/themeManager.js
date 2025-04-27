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
exports.ThemeManager = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class ThemeManager extends events_1.EventEmitter {
    constructor(context) {
        super();
        this.customThemes = new Map();
        this.disposables = [];
        this.context = context;
        // Load current theme
        this.detectCurrentTheme();
        // Listen for theme changes
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(e => {
            this.detectCurrentTheme();
            this.emit('themeChanged', this.currentTheme);
        }));
        // Load custom themes
        this.loadCustomThemes();
    }
    /**
     * Get the current VS Code theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    /**
     * Get a specific theme by ID
     */
    getTheme(id) {
        return this.customThemes.get(id);
    }
    /**
     * Get all available themes
     */
    getAllThemes() {
        return Array.from(this.customThemes.values());
    }
    /**
     * Register a custom theme
     */
    registerTheme(theme) {
        if (this.customThemes.has(theme.id)) {
            return false;
        }
        this.customThemes.set(theme.id, theme);
        this.saveCustomThemes();
        this.emit('themeAdded', theme);
        return true;
    }
    /**
     * Update a custom theme
     */
    updateTheme(id, updates) {
        const theme = this.customThemes.get(id);
        if (!theme) {
            return false;
        }
        const updatedTheme = {
            ...theme,
            ...updates,
            id // Ensure ID doesn't change
        };
        this.customThemes.set(id, updatedTheme);
        this.saveCustomThemes();
        this.emit('themeUpdated', updatedTheme);
        return true;
    }
    /**
     * Remove a custom theme
     */
    removeTheme(id) {
        if (!this.customThemes.has(id)) {
            return false;
        }
        this.customThemes.delete(id);
        this.saveCustomThemes();
        this.emit('themeRemoved', id);
        return true;
    }
    /**
     * Get a specific color from the current theme
     */
    getColor(colorName) {
        if (!this.currentTheme) {
            return undefined;
        }
        return this.currentTheme.colors[colorName];
    }
    /**
     * Get the type of the current theme
     */
    getThemeType() {
        return this.currentTheme?.type;
    }
    /**
     * Check if the current theme is a dark theme
     */
    isDarkTheme() {
        return this.currentTheme?.type === 'dark' || this.currentTheme?.type === 'high-contrast';
    }
    /**
     * Detect the current VS Code theme
     */
    detectCurrentTheme() {
        const colorTheme = vscode.window.activeColorTheme;
        const themeType = colorTheme.kind === vscode.ColorThemeKind.Light ? 'light' :
            colorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'high-contrast';
        // Create a theme object from the VS Code theme
        const theme = {
            id: colorTheme.id,
            name: colorTheme.label || colorTheme.id,
            type: themeType,
            colors: this.extractThemeColors()
        };
        this.currentTheme = theme;
    }
    /**
     * Extract colors from current VS Code theme
     */
    extractThemeColors() {
        const colors = {};
        // Extract common colors from VS Code
        const colorIds = [
            'editor.background',
            'editor.foreground',
            'activityBar.background',
            'activityBar.foreground',
            'sideBar.background',
            'sideBar.foreground',
            'statusBar.background',
            'statusBar.foreground',
            'tab.activeBackground',
            'tab.inactiveBackground',
            'tab.activeForeground',
            'tab.inactiveForeground',
            'button.background',
            'button.foreground',
            'button.hoverBackground',
            'list.activeSelectionBackground',
            'list.activeSelectionForeground'
        ];
        colorIds.forEach(id => {
            const color = vscode.window.activeColorTheme.getColor(id);
            if (color) {
                colors[id] = `#${color.rgba.r.toString(16).padStart(2, '0')}${color.rgba.g.toString(16).padStart(2, '0')}${color.rgba.b.toString(16).padStart(2, '0')}`;
            }
        });
        return colors;
    }
    /**
     * Load custom themes from storage
     */
    loadCustomThemes() {
        const themes = this.context.globalState.get('customThemes', []);
        themes.forEach(theme => {
            this.customThemes.set(theme.id, theme);
        });
    }
    /**
     * Save custom themes to storage
     */
    saveCustomThemes() {
        const themes = Array.from(this.customThemes.values());
        this.context.globalState.update('customThemes', themes);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.removeAllListeners();
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map