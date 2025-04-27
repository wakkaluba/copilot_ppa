"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
var vscode = require("vscode");
var events_1 = require("events");
var ThemeManager = /** @class */ (function (_super) {
    __extends(ThemeManager, _super);
    function ThemeManager(context) {
        var _this = _super.call(this) || this;
        _this.customThemes = new Map();
        _this.disposables = [];
        _this.context = context;
        // Load current theme
        _this.detectCurrentTheme();
        // Listen for theme changes
        _this.disposables.push(vscode.window.onDidChangeActiveColorTheme(function (e) {
            _this.detectCurrentTheme();
            _this.emit('themeChanged', _this.currentTheme);
        }));
        // Load custom themes
        _this.loadCustomThemes();
        return _this;
    }
    /**
     * Get the current VS Code theme
     */
    ThemeManager.prototype.getCurrentTheme = function () {
        return this.currentTheme;
    };
    /**
     * Get a specific theme by ID
     */
    ThemeManager.prototype.getTheme = function (id) {
        return this.customThemes.get(id);
    };
    /**
     * Get all available themes
     */
    ThemeManager.prototype.getAllThemes = function () {
        return Array.from(this.customThemes.values());
    };
    /**
     * Register a custom theme
     */
    ThemeManager.prototype.registerTheme = function (theme) {
        if (this.customThemes.has(theme.id)) {
            return false;
        }
        this.customThemes.set(theme.id, theme);
        this.saveCustomThemes();
        this.emit('themeAdded', theme);
        return true;
    };
    /**
     * Update a custom theme
     */
    ThemeManager.prototype.updateTheme = function (id, updates) {
        var theme = this.customThemes.get(id);
        if (!theme) {
            return false;
        }
        var updatedTheme = __assign(__assign(__assign({}, theme), updates), { id: id // Ensure ID doesn't change
         });
        this.customThemes.set(id, updatedTheme);
        this.saveCustomThemes();
        this.emit('themeUpdated', updatedTheme);
        return true;
    };
    /**
     * Remove a custom theme
     */
    ThemeManager.prototype.removeTheme = function (id) {
        if (!this.customThemes.has(id)) {
            return false;
        }
        this.customThemes.delete(id);
        this.saveCustomThemes();
        this.emit('themeRemoved', id);
        return true;
    };
    /**
     * Get a specific color from the current theme
     */
    ThemeManager.prototype.getColor = function (colorName) {
        if (!this.currentTheme) {
            return undefined;
        }
        return this.currentTheme.colors[colorName];
    };
    /**
     * Get the type of the current theme
     */
    ThemeManager.prototype.getThemeType = function () {
        var _a;
        return (_a = this.currentTheme) === null || _a === void 0 ? void 0 : _a.type;
    };
    /**
     * Check if the current theme is a dark theme
     */
    ThemeManager.prototype.isDarkTheme = function () {
        var _a, _b;
        return ((_a = this.currentTheme) === null || _a === void 0 ? void 0 : _a.type) === 'dark' || ((_b = this.currentTheme) === null || _b === void 0 ? void 0 : _b.type) === 'high-contrast';
    };
    /**
     * Detect the current VS Code theme
     */
    ThemeManager.prototype.detectCurrentTheme = function () {
        var colorTheme = vscode.window.activeColorTheme;
        var themeType = colorTheme.kind === vscode.ColorThemeKind.Light ? 'light' :
            colorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'high-contrast';
        // Create a theme object from the VS Code theme
        var theme = {
            id: colorTheme.id,
            name: colorTheme.label || colorTheme.id,
            type: themeType,
            colors: this.extractThemeColors()
        };
        this.currentTheme = theme;
    };
    /**
     * Extract colors from current VS Code theme
     */
    ThemeManager.prototype.extractThemeColors = function () {
        var colors = {};
        // Extract common colors from VS Code
        var colorIds = [
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
        colorIds.forEach(function (id) {
            var color = vscode.window.activeColorTheme.getColor(id);
            if (color) {
                colors[id] = "#".concat(color.rgba.r.toString(16).padStart(2, '0')).concat(color.rgba.g.toString(16).padStart(2, '0')).concat(color.rgba.b.toString(16).padStart(2, '0'));
            }
        });
        return colors;
    };
    /**
     * Load custom themes from storage
     */
    ThemeManager.prototype.loadCustomThemes = function () {
        var _this = this;
        var themes = this.context.globalState.get('customThemes', []);
        themes.forEach(function (theme) {
            _this.customThemes.set(theme.id, theme);
        });
    };
    /**
     * Save custom themes to storage
     */
    ThemeManager.prototype.saveCustomThemes = function () {
        var themes = Array.from(this.customThemes.values());
        this.context.globalState.update('customThemes', themes);
    };
    ThemeManager.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables = [];
        this.removeAllListeners();
    };
    return ThemeManager;
}(events_1.EventEmitter));
exports.ThemeManager = ThemeManager;
