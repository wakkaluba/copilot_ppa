"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
var vscode = require("vscode");
/**
 * Handles VS Code theme integration and color detection
 */
var ThemeService = /** @class */ (function () {
    function ThemeService(onVSCodeThemeChange) {
        var _this = this;
        this.onVSCodeThemeChange = onVSCodeThemeChange;
        this.disposables = [];
        // Watch for VS Code theme changes
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(function (theme) {
            _this.onVSCodeThemeChange(theme.kind);
        }));
    }
    /**
     * Get colors from the current VS Code theme
     */
    ThemeService.prototype.getCurrentVSCodeColors = function () {
        var theme = vscode.window.activeColorTheme;
        var getColor = function (id, fallback) {
            var color = theme.getColor(id);
            return color ? color.toString() : fallback;
        };
        return {
            primary: getColor('button.background', '#007acc'),
            secondary: getColor('descriptionForeground', '#717171'),
            background: getColor('editor.background', '#ffffff'),
            foreground: getColor('editor.foreground', '#333333'),
            agentMessageBackground: getColor('editorWidget.background', '#f3f3f3'),
            agentMessageForeground: getColor('editorWidget.foreground', '#333333'),
            userMessageBackground: getColor('input.background', '#ffffff'),
            userMessageForeground: getColor('input.foreground', '#333333'),
            systemMessage: getColor('descriptionForeground', '#717171'),
            error: getColor('errorForeground', '#dc3545'),
            success: getColor('notificationsSuccessIcon.foreground', '#28a745'),
            border: getColor('input.border', '#cecece'),
            buttonBackground: getColor('button.background', '#007acc'),
            buttonForeground: getColor('button.foreground', '#ffffff'),
            buttonHoverBackground: getColor('button.hoverBackground', '#005fa3'),
            inputBackground: getColor('input.background', '#ffffff'),
            inputForeground: getColor('input.foreground', '#333333'),
            inputBorder: getColor('input.border', '#cecece')
        };
    };
    /**
     * Create a theme based on the current VS Code theme
     */
    ThemeService.prototype.createVSCodeMatchingTheme = function () {
        var isLight = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;
        return {
            id: 'vscode-theme',
            name: 'VS Code Theme',
            isBuiltIn: true,
            colors: this.getCurrentVSCodeColors(),
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        };
    };
    ThemeService.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return ThemeService;
}());
exports.ThemeService = ThemeService;
