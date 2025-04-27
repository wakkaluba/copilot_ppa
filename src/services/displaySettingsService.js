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
exports.DisplaySettingsService = void 0;
var vscode = require("vscode");
var events_1 = require("events");
var DisplaySettingsService = /** @class */ (function (_super) {
    __extends(DisplaySettingsService, _super);
    function DisplaySettingsService(themeManager, context) {
        var _this = _super.call(this) || this;
        _this.disposables = [];
        _this.themeManager = themeManager;
        _this.context = context;
        // Initialize with default settings
        _this.settings = _this.getDefaultSettings();
        // Load settings from configuration
        _this.loadSettings();
        // Listen for configuration changes
        var configDisposable = vscode.workspace.onDidChangeConfiguration(function (e) {
            if (e.affectsConfiguration('copilot-ppa.display')) {
                _this.loadSettings();
            }
        });
        // Listen for theme changes to update code block theme
        themeManager.on('themeChanged', function () {
            _this.updateCodeBlockThemeForCurrentTheme();
        });
        _this.disposables.push(configDisposable);
        return _this;
    }
    /**
     * Get current display settings
     */
    DisplaySettingsService.prototype.getSettings = function () {
        return __assign({}, this.settings);
    };
    /**
     * Update display settings
     * @param updates Partial settings to update
     */
    DisplaySettingsService.prototype.updateSettings = function (updates) {
        var oldSettings = __assign({}, this.settings);
        // Update in-memory settings
        this.settings = __assign(__assign({}, this.settings), updates);
        // Save to configuration
        var config = vscode.workspace.getConfiguration('copilot-ppa.display');
        // Only update changed settings
        for (var _i = 0, _a = Object.entries(updates); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (oldSettings[key] !== value) {
                config.update(key, value, vscode.ConfigurationTarget.Global);
            }
        }
        this.emit('settingsChanged', this.settings, updates);
    };
    /**
     * Reset display settings to default
     */
    DisplaySettingsService.prototype.resetToDefault = function () {
        var defaultSettings = this.getDefaultSettings();
        this.updateSettings(defaultSettings);
    };
    /**
     * Get default display settings
     */
    DisplaySettingsService.prototype.getDefaultSettings = function () {
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
    };
    /**
     * Load settings from VS Code configuration
     */
    DisplaySettingsService.prototype.loadSettings = function () {
        var config = vscode.workspace.getConfiguration('copilot-ppa.display');
        var defaultSettings = this.getDefaultSettings();
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
    };
    /**
     * Update code block theme based on current VS Code theme
     */
    DisplaySettingsService.prototype.updateCodeBlockThemeForCurrentTheme = function () {
        if (this.settings.codeBlockTheme !== 'auto') {
            return;
        }
        var isDark = this.themeManager.isDarkTheme();
        this.settings.codeBlockTheme = isDark ? 'vs-dark' : 'vs';
        this.emit('codeBlockThemeChanged', this.settings.codeBlockTheme);
    };
    /**
     * Generate CSS for the current display settings
     */
    DisplaySettingsService.prototype.generateCSS = function () {
        var _a = this.settings, fontSize = _a.fontSize, fontFamily = _a.fontFamily, lineHeight = _a.lineHeight, messageSpacing = _a.messageSpacing, compactMode = _a.compactMode;
        return "\n            :root {\n                --ppa-font-size: ".concat(fontSize, "px;\n                --ppa-font-family: ").concat(fontFamily, ";\n                --ppa-line-height: ").concat(lineHeight, ";\n                --ppa-message-spacing: ").concat(messageSpacing, "px;\n                --ppa-compact-mode: ").concat(compactMode ? '1' : '0', ";\n            }\n        ");
    };
    DisplaySettingsService.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.removeAllListeners();
    };
    return DisplaySettingsService;
}(events_1.EventEmitter));
exports.DisplaySettingsService = DisplaySettingsService;
