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
exports.ThemeManager = exports.ThemeError = void 0;
const vscode = __importStar(require("vscode"));
const ThemeService_1 = require("./ThemeService");
const cssGenerator_1 = require("./cssGenerator");
const defaultThemes_1 = require("./defaultThemes");
/**
 * Theme manager error types
 */
class ThemeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ThemeError';
    }
}
exports.ThemeError = ThemeError;
class ThemeManager {
    constructor(storage) {
        this.storage = storage;
        this.themes = new Map();
        this.customThemes = new Map();
        this.disposables = [];
        // Event emitters
        this.onThemeChangedEmitter = new vscode.EventEmitter();
        this.onUIOptionsChangedEmitter = new vscode.EventEmitter();
        // Event handlers
        this.onThemeChanged = this.onThemeChangedEmitter.event;
        this.onUIOptionsChanged = this.onUIOptionsChangedEmitter.event;
        // Initialize default themes
        defaultThemes_1.defaultThemes.forEach((theme, id) => this.themes.set(id, theme));
        // Load saved theme preference and custom themes
        this.activeThemeId = this.storage.getActiveThemeId();
        this.loadCustomThemes();
        // Initialize services
        this.cssGenerator = new cssGenerator_1.CSSGenerator();
        this.themeService = new ThemeService_1.ThemeService(this.handleVSCodeThemeChange.bind(this));
        this.disposables.push(this.themeService);
        // Set up event cleanup
        this.disposables.push(this.onThemeChangedEmitter, this.onUIOptionsChangedEmitter);
    }
    /**
     * Get all available themes
     */
    getAllThemes() {
        return [...this.themes.values(), ...this.customThemes.values()];
    }
    /**
     * Get a specific theme by ID
     */
    getTheme(id) {
        return this.themes.get(id) || this.customThemes.get(id);
    }
    /**
     * Get the currently active theme
     */
    getActiveTheme() {
        const theme = this.getTheme(this.activeThemeId);
        if (!theme) {
            // Fallback to default if active theme not found
            return this.themes.get('default');
        }
        return theme;
    }
    /**
     * Set the active theme
     */
    async setActiveTheme(id) {
        const theme = this.getTheme(id);
        if (!theme) {
            throw new ThemeError(`Theme not found: ${id}`);
        }
        this.activeThemeId = id;
        await this.storage.setActiveThemeId(id);
        this.onThemeChangedEmitter.fire(theme);
    }
    /**
     * Create a new custom theme based on an existing one
     */
    async createCustomTheme(name, baseThemeId, customizations) {
        const baseTheme = this.getTheme(baseThemeId);
        if (!baseTheme) {
            throw new ThemeError(`Base theme not found: ${baseThemeId}`);
        }
        const id = `custom-${Date.now()}`;
        const newTheme = {
            id,
            name,
            isBuiltIn: false,
            colors: { ...baseTheme.colors },
            font: { ...baseTheme.font },
            ...customizations
        };
        // Validate theme
        this.validateTheme(newTheme);
        this.customThemes.set(id, newTheme);
        await this.saveCustomThemes();
        return newTheme;
    }
    /**
     * Update an existing custom theme
     */
    async updateCustomTheme(id, updates) {
        const existing = this.customThemes.get(id);
        if (!existing) {
            throw new ThemeError(`Custom theme not found: ${id}`);
        }
        const updated = {
            ...existing,
            ...updates,
            id, // Prevent ID changes
            isBuiltIn: false // Prevent built-in flag changes
        };
        // Validate theme
        this.validateTheme(updated);
        this.customThemes.set(id, updated);
        await this.saveCustomThemes();
        if (this.activeThemeId === id) {
            this.onThemeChangedEmitter.fire(updated);
        }
        return updated;
    }
    /**
     * Delete a custom theme
     */
    async deleteCustomTheme(id) {
        const theme = this.customThemes.get(id);
        if (!theme) {
            throw new ThemeError(`Custom theme not found: ${id}`);
        }
        this.customThemes.delete(id);
        await this.saveCustomThemes();
        // Switch to default theme if the deleted theme was active
        if (this.activeThemeId === id) {
            await this.setActiveTheme('default');
        }
    }
    /**
     * Get the current UI layout options
     */
    getUILayoutOptions() {
        return this.storage.getUILayoutOptions();
    }
    /**
     * Update UI layout options
     */
    async updateUILayoutOptions(updates) {
        const current = this.getUILayoutOptions();
        const updated = { ...current, ...updates };
        await this.storage.saveUILayoutOptions(updated);
        this.onUIOptionsChangedEmitter.fire(updated);
        return updated;
    }
    /**
     * Get CSS for the current theme
     */
    getThemeCSS() {
        return this.cssGenerator.generateThemeCSS(this.getActiveTheme());
    }
    /**
     * Get CSS for the current layout options
     */
    getLayoutCSS() {
        return this.cssGenerator.generateLayoutCSS(this.getUILayoutOptions());
    }
    validateTheme(theme) {
        if (!theme.id) {
            throw new ThemeError('Theme must have an ID');
        }
        if (!theme.name) {
            throw new ThemeError('Theme must have a name');
        }
        if (!theme.colors) {
            throw new ThemeError('Theme must have colors defined');
        }
        if (!theme.font) {
            throw new ThemeError('Theme must have font settings defined');
        }
    }
    loadCustomThemes() {
        const customThemes = this.storage.getCustomThemes();
        customThemes.forEach(theme => this.customThemes.set(theme.id, theme));
    }
    async saveCustomThemes() {
        await this.storage.saveCustomThemes(Array.from(this.customThemes.values()));
    }
    handleVSCodeThemeChange(kind) {
        // Only auto-switch if using a built-in theme
        if (this.activeThemeId === 'default' || this.activeThemeId === 'dark') {
            const newThemeId = kind === vscode.ColorThemeKind.Light ? 'default' : 'dark';
            if (newThemeId !== this.activeThemeId) {
                this.setActiveTheme(newThemeId).catch(error => {
                    console.error('Failed to switch theme:', error);
                });
            }
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=ThemeManager.js.map