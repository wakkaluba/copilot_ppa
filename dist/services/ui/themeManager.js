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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.ThemeService = exports.ThemeManager = exports.UIOptionsChangeEvent = exports.ThemeChangeEvent = exports.UILayoutOptions = exports.FontSettings = exports.ThemeColors = exports.Theme = void 0;
exports.initializeThemeManager = initializeThemeManager;
exports.getThemeManager = getThemeManager;
const vscode = __importStar(require("vscode"));
const interfaces_1 = require("./themes/interfaces");
Object.defineProperty(exports, "Theme", { enumerable: true, get: function () { return interfaces_1.Theme; } });
Object.defineProperty(exports, "ThemeColors", { enumerable: true, get: function () { return interfaces_1.ThemeColors; } });
Object.defineProperty(exports, "FontSettings", { enumerable: true, get: function () { return interfaces_1.FontSettings; } });
Object.defineProperty(exports, "UILayoutOptions", { enumerable: true, get: function () { return interfaces_1.UILayoutOptions; } });
Object.defineProperty(exports, "ThemeChangeEvent", { enumerable: true, get: function () { return interfaces_1.ThemeChangeEvent; } });
Object.defineProperty(exports, "UIOptionsChangeEvent", { enumerable: true, get: function () { return interfaces_1.UIOptionsChangeEvent; } });
const defaults_1 = require("./themes/defaults");
const cssGenerator_1 = require("./themes/cssGenerator");
const inversify_1 = require("inversify");
/**
 * Manager for UI themes and customization
 */
let ThemeManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ThemeManager = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ThemeManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        context;
        storage;
        static instance;
        themes = new Map();
        activeThemeId;
        customSettings;
        disposables = [];
        _onThemeChanged = new vscode.EventEmitter();
        _onUIOptionsChanged = new vscode.EventEmitter();
        onThemeChanged = this._onThemeChanged.event;
        onUIOptionsChanged = this._onUIOptionsChanged.event;
        constructor(context, storage) {
            this.context = context;
            this.storage = storage;
            // Initialize with default themes
            this.registerDefaultThemes();
            // Load saved theme preference
            this.activeThemeId = this.loadThemePreference();
            // Load custom UI settings
            this.customSettings = this.loadUISettings();
            // Watch for VS Code theme changes
            this.setupVSCodeThemeWatcher();
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
        loadThemePreference() {
            return this.context.globalState.get('copilotPPA.activeTheme', 'default');
        }
        loadUISettings() {
            return this.context.globalState.get('copilotPPA.uiLayoutOptions', {
                chatInputPosition: 'bottom',
                showTimestamps: true,
                showAvatars: true,
                compactMode: false,
                expandCodeBlocks: true,
                wordWrap: true
            });
        }
        setupVSCodeThemeWatcher() {
            vscode.window.onDidChangeActiveColorTheme(this.handleVSCodeThemeChange, this);
        }
        handleVSCodeThemeChange(colorTheme) {
            // Auto-switch between light and dark themes based on VS Code theme
            if (this.activeThemeId === 'default' || this.activeThemeId === 'dark') {
                const newThemeId = colorTheme.kind === vscode.ColorThemeKind.Light ? 'default' : 'dark';
                if (newThemeId !== this.activeThemeId) {
                    this.setActiveTheme(newThemeId);
                }
            }
        }
        getThemes() {
            return Array.from(this.themes.values());
        }
        getTheme(id) {
            return this.themes.get(id);
        }
        getActiveTheme() {
            return this.themes.get(this.activeThemeId) || this.themes.get('default');
        }
        setActiveTheme(id) {
            if (!this.themes.has(id)) {
                return false;
            }
            const previousTheme = this.getActiveTheme();
            this.activeThemeId = id;
            void this.context.globalState.update('copilotPPA.activeTheme', id);
            this._onThemeChanged.fire({
                theme: this.getActiveTheme(),
                previous: previousTheme
            });
            return true;
        }
        registerTheme(theme) {
            this.themes.set(theme.id, theme);
        }
        createCustomTheme(name, baseThemeId, customizations) {
            const baseTheme = this.getTheme(baseThemeId);
            if (!baseTheme) {
                return undefined;
            }
            const id = `custom-${Date.now()}`;
            const newTheme = {
                id,
                name,
                type: baseTheme.type,
                isBuiltIn: false,
                colors: { ...baseTheme.colors },
                font: { ...baseTheme.font }
            };
            // Apply customizations
            Object.entries(customizations).forEach(([key, value]) => {
                if (key in newTheme.colors) {
                    newTheme.colors[key] = value;
                }
                else if (key in newTheme.font) {
                    newTheme.font[key] = value;
                }
            });
            this.registerTheme(newTheme);
            void this.saveCustomThemes();
            return newTheme;
        }
        deleteCustomTheme(id) {
            const theme = this.getTheme(id);
            if (!theme || theme.isBuiltIn) {
                return false;
            }
            const success = this.themes.delete(id);
            // Switch to default if the deleted theme was active
            if (success && this.activeThemeId === id) {
                this.setActiveTheme('default');
            }
            void this.saveCustomThemes();
            return success;
        }
        getUILayoutOptions() {
            return { ...this.customSettings };
        }
        updateUILayoutOptions(options) {
            const previousOptions = { ...this.customSettings };
            this.customSettings = { ...this.customSettings, ...options };
            void this.context.globalState.update('copilotPPA.uiLayoutOptions', this.customSettings);
            this._onUIOptionsChanged.fire({
                options: this.customSettings,
                previous: previousOptions
            });
            return this.customSettings;
        }
        registerDefaultThemes() {
            // Register all default themes
            defaults_1.defaultThemes.forEach(theme => this.registerTheme(theme));
            // Load any saved custom themes
            void this.loadCustomThemes();
        }
        async loadCustomThemes() {
            const customThemes = this.context.globalState.get('copilotPPA.customThemes', []);
            customThemes.forEach(theme => this.registerTheme(theme));
        }
        async saveCustomThemes() {
            const customThemes = this.getThemes().filter(theme => !theme.isBuiltIn);
            await this.context.globalState.update('copilotPPA.customThemes', customThemes);
        }
        getThemeCSS() {
            return cssGenerator_1.CSSGenerator.generateThemeCSS(this.getActiveTheme());
        }
        getUILayoutCSS() {
            return cssGenerator_1.CSSGenerator.generateLayoutCSS(this.customSettings);
        }
        dispose() {
            this.disposables.forEach(d => d.dispose());
        }
    };
    return ThemeManager = _classThis;
})();
exports.ThemeManager = ThemeManager;
// Singleton instance
let themeManager;
/**
 * Initialize the theme manager
 */
function initializeThemeManager(context) {
    themeManager = ThemeManager.getInstance(context);
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
class ThemeService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }
    getCurrentTheme() {
        const colorTheme = vscode.window.activeColorTheme;
        const isDark = colorTheme.kind === vscode.ColorThemeKind.Dark;
        return {
            primary: isDark ? '#0098ff' : '#007acc',
            secondary: isDark ? '#abb2bf' : '#6c757d',
            background: isDark ? '#282c34' : '#ffffff',
            foreground: isDark ? '#abb2bf' : '#333333',
            agentMessageBackground: isDark ? '#2c313c' : '#f1f8ff',
            agentMessageForeground: isDark ? '#abb2bf' : '#333333',
            userMessageBackground: isDark ? '#3b4048' : '#e9ecef',
            userMessageForeground: isDark ? '#abb2bf' : '#333333',
            systemMessage: isDark ? '#7f848e' : '#6c757d',
            error: isDark ? '#e06c75' : '#dc3545',
            success: isDark ? '#98c379' : '#28a745',
            border: isDark ? '#3e4452' : '#dee2e6',
            buttonBackground: isDark ? '#0098ff' : '#007acc',
            buttonForeground: isDark ? '#ffffff' : '#ffffff',
            buttonHoverBackground: isDark ? '#007acc' : '#005fa3',
            inputBackground: isDark ? '#3b4048' : '#ffffff',
            inputForeground: isDark ? '#abb2bf' : '#333333',
            inputBorder: isDark ? '#4b5261' : '#ced4da'
        };
    }
}
exports.ThemeService = ThemeService;
//# sourceMappingURL=themeManager.js.map