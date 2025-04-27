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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeSettingsCommand = void 0;
var vscode = require("vscode");
var themeManager_1 = require("../services/themeManager");
var webviewPanelManager_1 = require("../webview/webviewPanelManager");
var ThemeSettingsHtmlProvider_1 = require("../ui/ThemeSettingsHtmlProvider");
var ThemeEditorHtmlProvider_1 = require("../ui/ThemeEditorHtmlProvider");
var ThemeSettingsCommand = /** @class */ (function () {
    function ThemeSettingsCommand(context) {
        this.themeManager = themeManager_1.ThemeManager.getInstance(context);
    }
    ThemeSettingsCommand.prototype.register = function () {
        var _this = this;
        return [
            vscode.commands.registerCommand(ThemeSettingsCommand.commandId, function () {
                _this.openThemeSettings();
            }),
            vscode.commands.registerCommand(ThemeSettingsCommand.createThemeCommandId, function () {
                _this.createCustomTheme();
            })
        ];
    };
    ThemeSettingsCommand.prototype.openThemeSettings = function () {
        var _this = this;
        var panel = webviewPanelManager_1.WebviewPanelManager.createOrShowPanel('themeSettings', 'Theme Settings', vscode.ViewColumn.One);
        var currentTheme = this.themeManager.getCurrentTheme();
        var allThemes = this.themeManager.getAllThemes();
        panel.webview.html = ThemeSettingsHtmlProvider_1.ThemeSettingsHtmlProvider.getSettingsHtml(currentTheme, allThemes);
        panel.webview.onDidReceiveMessage(function (msg) { return _this.handleSettingsMessage(msg, panel); }, undefined, []);
    };
    ThemeSettingsCommand.prototype.createCustomTheme = function (baseThemeId) {
        return __awaiter(this, void 0, void 0, function () {
            var baseTheme, themes, themeName, themeId, newTheme, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (baseThemeId) {
                            themes = this.themeManager.getAllThemes();
                            baseTheme = themes.find(function (t) { return t.id === baseThemeId; }) || this.themeManager.getCurrentTheme();
                        }
                        else {
                            baseTheme = this.themeManager.getCurrentTheme();
                        }
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Enter a name for your custom theme',
                                placeHolder: 'My Custom Theme',
                                value: "".concat(baseTheme.name, " (Custom)")
                            })];
                    case 1:
                        themeName = _a.sent();
                        if (!themeName) {
                            return [2 /*return*/]; // User cancelled
                        }
                        themeId = "custom_".concat(Date.now());
                        newTheme = __assign(__assign({}, baseTheme), { id: themeId, name: themeName });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.themeManager.addCustomTheme(newTheme)];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage("Custom theme \"".concat(themeName, "\" created"));
                        // Open the theme editor
                        return [4 /*yield*/, this.editCustomTheme(themeId)];
                    case 4:
                        // Open the theme editor
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to create custom theme: ".concat(error_1.message));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ThemeSettingsCommand.prototype.editCustomTheme = function (themeId) {
        return __awaiter(this, void 0, void 0, function () {
            var theme, panel;
            var _this = this;
            return __generator(this, function (_a) {
                theme = this.themeManager.getAllThemes().find(function (t) { return t.id === themeId; });
                if (!theme) {
                    vscode.window.showErrorMessage("Theme with ID ".concat(themeId, " not found"));
                    return [2 /*return*/];
                }
                panel = webviewPanelManager_1.WebviewPanelManager.createOrShowPanel('themeEditor', "Edit Theme: ".concat(theme.name), vscode.ViewColumn.One);
                panel.webview.html = ThemeEditorHtmlProvider_1.ThemeEditorHtmlProvider.getEditorHtml(theme);
                panel.webview.onDidReceiveMessage(function (msg) { return _this.handleEditorMessage(msg, themeId, panel); }, undefined, []);
                return [2 /*return*/];
            });
        });
    };
    ThemeSettingsCommand.prototype.handleSettingsMessage = function (message, panel) {
        var _this = this;
        switch (message.command) {
            case 'selectTheme':
                this.themeManager.setTheme(message.themeId);
                break;
            case 'createTheme':
                this.createCustomTheme(message.baseThemeId);
                break;
            case 'editTheme':
                this.editCustomTheme(message.themeId);
                break;
            case 'deleteTheme':
                this.themeManager.deleteCustomTheme(message.themeId)
                    .then(function () { return panel.webview.html = ThemeSettingsHtmlProvider_1.ThemeSettingsHtmlProvider.getSettingsHtml(_this.themeManager.getCurrentTheme(), _this.themeManager.getAllThemes()); });
                break;
        }
    };
    ThemeSettingsCommand.prototype.handleEditorMessage = function (message, themeId, panel) {
        var _this = this;
        switch (message.command) {
            case 'updateTheme':
                this.themeManager.updateCustomTheme(themeId, message.data)
                    .then(function () { return panel.webview.html = ThemeEditorHtmlProvider_1.ThemeEditorHtmlProvider.getEditorHtml(_this.themeManager.getAllThemes().find(function (t) { return t.id === themeId; })); });
                break;
            case 'previewTheme':
                this.themeManager.setTheme(themeId);
                break;
            case 'applyTheme':
                this.themeManager.setTheme(themeId);
                break;
        }
    };
    ThemeSettingsCommand.commandId = 'copilotPPA.openThemeSettings';
    ThemeSettingsCommand.createThemeCommandId = 'copilotPPA.createCustomTheme';
    return ThemeSettingsCommand;
}());
exports.ThemeSettingsCommand = ThemeSettingsCommand;
