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
    builtInThemes = new Map();
    customThemes = new Map();
    currentThemeId;
    _onThemeChanged = new vscode.EventEmitter();
    onThemeChanged = this._onThemeChanged.event;
    constructor(context) {
        this.context = context;
        this.currentThemeId = this.loadCurrentThemeId();
        this.initializeBuiltInThemes();
        this.loadCustomThemes();
    }
    loadCurrentThemeId() {
        return this.context.globalState.get('selectedThemeId', 'default');
    }
    async saveCurrentThemeId(themeId) {
        await this.context.globalState.update('selectedThemeId', themeId);
    }
    initializeBuiltInThemes() {
        this.builtInThemes.set('default', {
            id: 'default',
            name: 'Default Theme',
            type: 'dark',
            components: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                primary: '#569cd6',
                secondary: '#4ec9b0',
                accent: '#c586c0',
                error: '#f44747'
            }
        });
        this.builtInThemes.set('light', {
            id: 'light',
            name: 'Light Theme',
            type: 'light',
            components: {
                background: '#ffffff',
                foreground: '#333333',
                primary: '#0066cc',
                secondary: '#008080',
                accent: '#8b008b',
                error: '#cd3131'
            }
        });
    }
    loadCustomThemes() {
        const stored = this.context.globalState.get('customThemes', []);
        stored.forEach(theme => {
            this.customThemes.set(theme.id, theme);
        });
    }
    async saveCustomThemes() {
        const themes = Array.from(this.customThemes.values());
        await this.context.globalState.update('customThemes', themes);
    }
    getCurrentTheme() {
        const theme = this.builtInThemes.get(this.currentThemeId) ||
            this.customThemes.get(this.currentThemeId) ||
            this.getDefaultTheme();
        return theme;
    }
    getDefaultTheme() {
        return this.builtInThemes.get('default');
    }
    getAllThemes() {
        const themes = [];
        this.builtInThemes.forEach(theme => themes.push(theme));
        this.customThemes.forEach(theme => themes.push(theme));
        return themes;
    }
    async setTheme(themeId) {
        const theme = this.builtInThemes.get(themeId) || this.customThemes.get(themeId);
        if (!theme) {
            throw new Error(`Theme not found: ${themeId}`);
        }
        this.currentThemeId = themeId;
        await this.saveCurrentThemeId(themeId);
        this._onThemeChanged.fire(theme);
    }
    async addCustomTheme(theme) {
        if (this.builtInThemes.has(theme.id)) {
            throw new Error(`Cannot override built-in theme: ${theme.id}`);
        }
        this.customThemes.set(theme.id, theme);
        await this.saveCustomThemes();
        this._onThemeChanged.fire(theme);
    }
    async updateCustomTheme(themeId, updatedTheme) {
        const existing = this.customThemes.get(themeId);
        if (!existing) {
            throw new Error(`Custom theme not found: ${themeId}`);
        }
        const updated = {
            ...existing,
            ...updatedTheme,
            id: themeId // Prevent ID changes
        };
        this.customThemes.set(themeId, updated);
        await this.saveCustomThemes();
        this._onThemeChanged.fire(updated);
    }
    async deleteCustomTheme(themeId) {
        if (!this.customThemes.has(themeId)) {
            throw new Error(`Custom theme not found: ${themeId}`);
        }
        if (this.currentThemeId === themeId) {
            await this.setTheme('default');
        }
        this.customThemes.delete(themeId);
        await this.saveCustomThemes();
    }
    getColorForComponent(component) {
        const theme = this.getCurrentTheme();
        return theme.components[component];
    }
    dispose() {
        this._onThemeChanged.dispose();
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map