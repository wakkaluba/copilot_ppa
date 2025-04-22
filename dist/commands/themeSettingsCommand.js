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
exports.ThemeSettingsCommand = void 0;
const vscode = __importStar(require("vscode"));
const themeManager_1 = require("../services/themeManager");
const webviewPanelManager_1 = require("../webview/webviewPanelManager");
const ThemeSettingsHtmlProvider_1 = require("../ui/ThemeSettingsHtmlProvider");
const ThemeEditorHtmlProvider_1 = require("../ui/ThemeEditorHtmlProvider");
class ThemeSettingsCommand {
    static commandId = 'copilotPPA.openThemeSettings';
    static createThemeCommandId = 'copilotPPA.createCustomTheme';
    themeManager;
    constructor(context) {
        this.themeManager = themeManager_1.ThemeManager.getInstance(context);
    }
    register() {
        return [
            vscode.commands.registerCommand(ThemeSettingsCommand.commandId, () => {
                this.openThemeSettings();
            }),
            vscode.commands.registerCommand(ThemeSettingsCommand.createThemeCommandId, () => {
                this.createCustomTheme();
            })
        ];
    }
    openThemeSettings() {
        const panel = webviewPanelManager_1.WebviewPanelManager.createOrShowPanel('themeSettings', 'Theme Settings', vscode.ViewColumn.One);
        const currentTheme = this.themeManager.getCurrentTheme();
        const allThemes = this.themeManager.getAllThemes();
        panel.webview.html = ThemeSettingsHtmlProvider_1.ThemeSettingsHtmlProvider.getSettingsHtml(currentTheme, allThemes);
        panel.webview.onDidReceiveMessage(msg => this.handleSettingsMessage(msg, panel), undefined, []);
    }
    async createCustomTheme(baseThemeId) {
        // Get base theme
        let baseTheme;
        if (baseThemeId) {
            const themes = this.themeManager.getAllThemes();
            baseTheme = themes.find(t => t.id === baseThemeId) || this.themeManager.getCurrentTheme();
        }
        else {
            baseTheme = this.themeManager.getCurrentTheme();
        }
        // Show input for theme name
        const themeName = await vscode.window.showInputBox({
            prompt: 'Enter a name for your custom theme',
            placeHolder: 'My Custom Theme',
            value: `${baseTheme.name} (Custom)`
        });
        if (!themeName) {
            return; // User cancelled
        }
        // Create a new theme ID
        const themeId = `custom_${Date.now()}`;
        // Create a new theme based on the base theme
        const newTheme = {
            ...baseTheme,
            id: themeId,
            name: themeName
        };
        try {
            await this.themeManager.addCustomTheme(newTheme);
            vscode.window.showInformationMessage(`Custom theme "${themeName}" created`);
            // Open the theme editor
            await this.editCustomTheme(themeId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create custom theme: ${error.message}`);
        }
    }
    async editCustomTheme(themeId) {
        const theme = this.themeManager.getAllThemes().find(t => t.id === themeId);
        if (!theme) {
            vscode.window.showErrorMessage(`Theme with ID ${themeId} not found`);
            return;
        }
        const panel = webviewPanelManager_1.WebviewPanelManager.createOrShowPanel('themeEditor', `Edit Theme: ${theme.name}`, vscode.ViewColumn.One);
        panel.webview.html = ThemeEditorHtmlProvider_1.ThemeEditorHtmlProvider.getEditorHtml(theme);
        panel.webview.onDidReceiveMessage(msg => this.handleEditorMessage(msg, themeId, panel), undefined, []);
    }
    handleSettingsMessage(message, panel) {
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
                    .then(() => panel.webview.html = ThemeSettingsHtmlProvider_1.ThemeSettingsHtmlProvider.getSettingsHtml(this.themeManager.getCurrentTheme(), this.themeManager.getAllThemes()));
                break;
        }
    }
    handleEditorMessage(message, themeId, panel) {
        switch (message.command) {
            case 'updateTheme':
                this.themeManager.updateCustomTheme(themeId, message.data)
                    .then(() => panel.webview.html = ThemeEditorHtmlProvider_1.ThemeEditorHtmlProvider.getEditorHtml(this.themeManager.getAllThemes().find(t => t.id === themeId)));
                break;
            case 'previewTheme':
                this.themeManager.setTheme(themeId);
                break;
            case 'applyTheme':
                this.themeManager.setTheme(themeId);
                break;
        }
    }
}
exports.ThemeSettingsCommand = ThemeSettingsCommand;
//# sourceMappingURL=themeSettingsCommand.js.map